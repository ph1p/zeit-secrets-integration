const { withUiHook, htm } = require('@zeit/integration-utils');
const qs = require('querystring');
const pkg = require('./package.json');
const zeitApiClient = require('./zeit-api-client');
const stringSimilarity = require('string-similarity');

// components
const SecretInput = require('./components/secret-input');
const { NowJson, generateEnvVariable } = require('./components/now-json');
const DeleteConfirmation = require('./components/delete-confirmation');
const Notification = require('./components/notification');

module.exports = withUiHook(async ({ payload, zeitClient }) => {
  const { clientState, action } = payload;
  const zac = zeitApiClient(zeitClient);
  const metadata = await zeitClient.getMetadata();

  const deployments = (await Promise.all(
    (await zac.getDeployments()).map(deployment =>
      zac.getDeploymentById(deployment.uid)
    )
  ))
    .filter(
      deployment =>
        (!deployment.error && (deployment.env && deployment.env.length > 0)) ||
        (deployment.build && deployment.build.env.length > 0)
    )
    .map(({ env, build, builds, name, id, url, alias }) => ({
      id,
      name,
      url,
      env: env.filter(e => !e.startsWith('NOW_')),
      build: build.env ? build.env.filter(e => !e.startsWith('NOW_')) : [],
      alias
    }))
    .filter(d => d.alias && d.alias.length > 0);

  const resetNotification = async () => {
    delete metadata.notify;
    await zeitClient.setMetadata(metadata);
  };

  await resetNotification();

  if (action.startsWith('//edit-secret-')) {
    await resetNotification();

    const name = action.replace('//edit-secret-', '');

    if (name === clientState['input-' + name]) {
      metadata.notify = {
        message: `No changes. Old and new secret are equal.`
      };
    } else {
      const res = await zac.changeSecretName(
        name,
        clientState['input-' + name]
      );

      if (!res || res.error) {
        metadata.notify = {
          type: 'error',
          message: res.error
        };
      } else {
        metadata.notify = {
          type: 'success',
          message: `Changed "${res.oldName}" to "${res.name}"`
        };
      }
    }

    await zeitClient.setMetadata(metadata);
  }

  if (action.startsWith('//confirm-delete')) {
    const name = action.replace('//confirm-delete-', '');

    return htm`<${DeleteConfirmation} name=${name} />`;
  }

  if (action.startsWith('//delete-secret-')) {
    // unset notification
    await resetNotification();

    const name = action.replace('//delete-secret-', '');
    const res = await zac.deleteSecret(name);

    if (!res || res.error) {
      metadata.notify = {
        type: 'error',
        message: res.error
      };
    } else {
      metadata.notify = {
        type: 'success',
        message: `Removed "${res.name}" successfully`
      };
    }

    await zeitClient.setMetadata(metadata);
  }

  if (action === '//create-secret') {
    const { secretName, secretValue } = clientState;

    // unset notification
    await resetNotification();

    const res = await zac.createSecret(secretName, secretValue);

    if (!res || res.error) {
      metadata.notify = {
        type: 'error',
        message: res.error
      };
    } else {
      metadata.notify = {
        type: 'success',
        message: 'Created the secret successfully.'
      };
    }

    await zeitClient.setMetadata(metadata);
  }

  // get secrets
  metadata.secrets = await zac.getSecrets();
  await zeitClient.setMetadata(metadata);

  const isSecretListEmpty = !metadata.secrets || metadata.secrets.length === 0;

  const getDeploymentsWithEnvironment = name =>
    deployments.filter(({ url, env, build }) => {
      const envName = generateEnvVariable(name);

      return (
        name &&
        ((env.length > 0 &&
          stringSimilarity.findBestMatch(envName, env).bestMatch.rating >
            0.7) ||
          (build.length > 0 &&
            stringSimilarity.findBestMatch(envName, build).bestMatch.rating >
              0.7))
      );
    });

  const gridRow = htm`1 / span + ${
    isSecretListEmpty ? metadata.secrets.length : 1
  }`;

  return htm`<Page>
    <${Notification} data=${metadata} />

    <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gridGap="20px">
      <Box>
        <Box>
          <H2>Secrets</H2>
          <Box display="grid" gridGap="20px" overflow="auto">
          ${
            !isSecretListEmpty
              ? metadata.secrets.map(({ name }) => {
                  const envDeployments = getDeploymentsWithEnvironment(name);
                  return htm`<${SecretInput} name=${name} deployments=${envDeployments} />`;
                })
              : htm`<Fieldset><FsContent>You haven't created a secret yet. Create one on the right side.</FsContent></Fieldset>`
          }
          </Box>
        </Box>
      </Box>

      <Box>
        <Box marginBottom="20px">
          <Fieldset>
            <FsContent>
              <H2>Create a new secret</H2>
              <Input name="secretName" label="Name" value="" placeholder="my-secret-env" />
              <Textarea name="secretValue" label="Value" value="" placeholder="P@$$w0rd" width="350px" height="200px"></Textarea>
            </FsContent>
            <FsFooter>
              <Button small action="//create-secret">+create</Button>
            </FsFooter>
          </Fieldset>
        </Box>

        <Box>
          <${NowJson} data=${metadata} />
        </Box>
      </Box>

      <Box color="#999" textAlign="right" marginTop="15px" fontSize="12px" gridColumn="1 / span 2">
        <P>version: <Link target="_blank" href="https://github.com/ph1p/zeit-secrets-integration">${
          pkg.version
        }</Link></P>
      </Box>
    </Box>

  </Page>`;
});
