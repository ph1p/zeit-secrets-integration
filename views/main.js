const zeitApiClient = require('../libs/zeit-api-client');

// components
const Notification = require('../components/notification');
const SecretInput = require('../components/secret-input');

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
    <Box gridGap="20px">
    <Box>
        <H2>Secrets</H2>
        <Box display="grid" gridGap="20px" gridTemplateColumns="repeat(3, 1fr)" overflow="auto">
        ${
          !isSecretListEmpty
            ? metadata.secrets.map(({ name }) => {
                return htm`<${SecretInput} name=${name} deployments=${[]} />`;
              })
            : htm`<Fieldset><FsContent>You haven't created a secret yet. Create one on the right side.</FsContent></Fieldset>`
        }
        </Box>
    </Box>
  </Box>`;
};
