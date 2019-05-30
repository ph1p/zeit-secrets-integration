const zeitApiClient = require('../libs/zeit-api-client');

// components
const SecretInput = require('../components/secret-input');
const Notification = require('../components/notification');

module.exports = async ({
  zeitClient,
  payload: { action, clientState },
  htm,
  navigate
}) => {
  const zac = zeitApiClient(zeitClient);
  const metadata = await zeitClient.getMetadata();

  // get secrets
  metadata.secrets = await zac.getSecrets();
  await zeitClient.setMetadata(metadata);

  if (action.startsWith('//edit-secret-')) {
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

    // get secrets
    metadata.secrets = await zac.getSecrets();
    await zeitClient.setMetadata(metadata);
  }

  if (action.startsWith('//delete-secret-')) {
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

    // get secrets
    metadata.secrets = await zac.getSecrets();
    await zeitClient.setMetadata(metadata);
  }

  const isSecretListEmpty = !metadata.secrets || metadata.secrets.length === 0;

  const gridColumns = `repeat(${isSecretListEmpty ? 1 : 3}, 1fr)`;

  return htm`${await Notification(metadata, zeitClient)}<Box gridGap="20px">
      <H2>Secrets</H2>
      <Box display="grid" gridGap="20px" gridTemplateColumns=${gridColumns} overflow="auto">
      ${
        !isSecretListEmpty
          ? metadata.secrets.map(({ name }) => {
              return htm`<${SecretInput} name=${name} deployments=${[]} />`;
            })
          : htm`<Fieldset><FsContent>You haven't created a secret yet. Click on <Link action=${navigate(
              '/create-secret/form'
            )}><B>+ CREATE</B></Link> to add one or more. </FsContent></Fieldset>`
      }
      </Box>
    </Box>`;
};
