const { withUiHook, htm } = require('@zeit/integration-utils');
const qs = require('querystring');
const pkg = require('./package.json');
const zeitApiClient = require('./zeit-api-client');

// components
const SecretInput = require('./components/secret-input');
const NowJson = require('./components/now-json');
const DeleteConfirmation = require('./components/delete-confirmation');

const Notification = ({ data }) => {
  if (data.notify) {
    const { type = 'message', message } = data.notify;

    console.log(type, message);
    return htm`<Notice type=${type}>${message}</Notice><BR />`;
  }
  return '';
};

module.exports = withUiHook(async ({ payload, zeitClient }) => {
  const { clientState, action } = payload;
  const zac = zeitApiClient(zeitClient);
  const metadata = await zeitClient.getMetadata();

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

  return htm`<Page>
    <${Notification} data=${metadata} />
    <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gridGap="20px">
      <Box gridRow="1 / span 2">
        <H2>Secrets</H2>
        <Box display="grid" gridGap="20px" overflow="auto">
        ${
          !isSecretListEmpty
            ? metadata.secrets.map(
                secret => htm`<${SecretInput} name=${secret.name} />`
              )
            : htm`<Fieldset><FsContent>You haven't created a secret yet. Create one on the right side.</FsContent></Fieldset>`
        }
        </Box>
      </Box>

      <Box>
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

    <Box color="#999" textAlign="right" marginTop="15px" fontSize="12px">
      <P>version: <Link href="https://github.com/ph1p/zeit-secrets-integration">${pkg.version}</Link></P>
    </Box>

  </Page>`;
});
