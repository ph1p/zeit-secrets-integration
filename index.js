const { withUiHook, htm } = require('@zeit/integration-utils');
const qs = require('querystring');
const pkg = require('./package.json');
const zeitApiClient = require('./libs/zeit-api-client');

// components
const DeleteConfirmation = require('./views/delete-confirmation');
const Main = require('./views/main');
const CreateSecret = require('./views/create-secret');
const NowJson = require('./views/now-json');

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

  await register('/confirm-delete/:name', DeleteConfirmation);
  await register('/create-secret/:path', CreateSecret);
  await register('/now-json', NowJson);
  await register('/', Main);

  return htm`<Page>
    <Box margin="0 0 20px 0" display="grid" gridTemplateColumns="repeat(2, 1fr)">
      <Box>
        <Button action=${navigate('/')} small>Secrets</Button>
        <Button action=${navigate(
          '/now-json'
        )} small float="right">now.json</Button>
      </Box>

      <Box textAlign="right">
        <Button action=${navigate('/create-secret/form')} small>+ create</Button>
      </Box>
    </Box>
    ${await Router()}


    <Box color="#999" textAlign="right" fontSize="12px" marginTop="20px">
      <P>version: <Link target="_blank" href=${'https://github.com/ph1p/zeit-secrets-integration/releases/tag/v' +
        pkg.version}>${'v' + pkg.version}</Link></P>
    </Box>
  </Page>`;
});
