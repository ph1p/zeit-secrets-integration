const zeitApiClient = require('../libs/zeit-api-client');
const pkg = require('../package.json');

// components
const Notification = require('../components/notification');
const SecretInput = require('../components/secret-input');
const NowJson = require('../components/now-json');

module.exports = async ({ zeitClient, htm }) => {
  const zac = zeitApiClient(zeitClient);
  const metadata = await zeitClient.getMetadata();

  // get secrets
  metadata.secrets = await zac.getSecrets();
  await zeitClient.setMetadata(metadata);

  const isSecretListEmpty = !metadata.secrets || metadata.secrets.length === 0;

  const gridRow = htm`1 / span + ${
    isSecretListEmpty ? metadata.secrets.length : 1
  }`;

  return htm`<${Notification} data=${metadata} />
    <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gridGap="20px">
    <Box>
      <Box>
        <H2>Secrets</H2>
        <Box display="grid" gridGap="20px" overflow="auto">
        ${
          !isSecretListEmpty
            ? metadata.secrets.map(({ name }) => {
                return htm`<${SecretInput} name=${name} deployments=${[]} />`;
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
            <Input name="secretName" label="Name" value="" placeholder="my-secret-env" width="100%"/>
            <Textarea name="secretValue" label="Value" value="" placeholder="P@$$w0rd" width="100%" height="200px"></Textarea>
          </FsContent>
          <FsFooter>
            <Button highlight small action="//create-secret">+ create</Button>
          </FsFooter>
        </Fieldset>
      </Box>

      <Box>
        <${NowJson} data=${metadata} />
      </Box>
    </Box>

    <Box color="#999" textAlign="right" fontSize="12px" gridColumn="1 / span 2">
      <P>version: <Link target="_blank" href=${'https://github.com/ph1p/zeit-secrets-integration/releases/tag/v' +
        pkg.version}>${'v' + pkg.version}</Link></P>
    </Box>
  </Box>`;
};
