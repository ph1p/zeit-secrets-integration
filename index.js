const { withUiHook, htm } = require('@zeit/integration-utils');
const qs = require('querystring');
const zeitApiClient = require('./libs/zeit-api-client');

// components
const DeleteConfirmation = require('./views/delete-confirmation');
const Main = require('./views/main');
const ZeitRouter = require('./libs/router');

module.exports = withUiHook(async ctx => {
  const { register, Router, navigate } = ZeitRouter(ctx);

  const {
    payload: { clientState, action },
    zeitClient
  } = ctx;

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

  await register('/confirm-delete/:name', DeleteConfirmation);
  await register('/', Main);

  return htm`<Page>
    ${await Router()}
  </Page>`;
});
