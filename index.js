const { withUiHook, htm } = require('@zeit/integration-utils');
const qs = require('querystring');
const pkg = require('./package.json');

//views
const DeleteConfirmation = require('./views/delete-confirmation');
const Main = require('./views/main');
const CreateSecret = require('./views/create-secret');
const NowJson = require('./views/now-json');

const ZeitRouter = require('./libs/router');

module.exports = withUiHook(async ctx => {
  const { register, Router, navigate } = ZeitRouter(ctx);
  const { zeitClient, payload } = ctx;

  await register('/confirm-delete/:name', DeleteConfirmation);
  await register('/create-secret/:path', CreateSecret);
  await register('/now-json', NowJson);
  await register('/', Main);

  return htm`<Page>
    <Box
      margin="-86px 0 0 0"
      padding="20px 0"
      backgroundColor="#fff"
      borderWidth="0 0 1px 0"
      borderColor="rgb(234, 234, 234)"
      borderStyle="solid"
      left="0"
      width="100%"
      position="absolute"
      boxShadow="inset 0px 7px 10px -9px rgba(0,0,0,0.1)"
    >
      <Box width="1040px" margin="0 auto" padding="0 20px" display="grid" gridTemplateColumns="auto auto 1fr" gridGap="20px">
        <Box>
          <Button action=${navigate('/')} highlight=${payload.action ===
    'view' || payload.action.indexOf('//') !== -1} small>Secrets</Button>
        </Box>
        <Box>
          <Button action=${navigate(
            '/now-json'
          )} highlight=${payload.action.indexOf('/now-json') !==
    -1} small>now.json</Button>
        </Box>

        <Box textAlign="right">
          <Button action=${navigate(
            '/create-secret/form'
          )} highlight=${payload.action.indexOf('/create-secret/') !==
    -1} small>+ create</Button>
        </Box>
      </Box>
    </Box>

    <Box marginTop="66px">
      ${await Router()}
    </Box>

    <Box color="#999" textAlign="right" fontSize="12px" marginTop="20px">
      <P>version: <Link target="_blank" href=${'https://github.com/ph1p/zeit-secrets-integration/releases/tag/v' +
        pkg.version}>${'v' + pkg.version}</Link></P>
    </Box>
  </Page>`;
});
