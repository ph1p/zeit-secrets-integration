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

  const activeHome =
    payload.action === 'view' ||
    payload.action === navigate('/') ||
    payload.action.indexOf('//') !== -1;
  const activeNow = payload.action.indexOf(navigate('/now-json')) !== -1;
  const activeCreate =
    payload.action.indexOf(navigate('/create-secret/')) !== -1;

  const activeStyle = '2px solid #000';
  const createButtonOpacity = activeCreate ? 0.2 : 1;

  return htm`<Page>
    <Box
      margin="-66px 0 0 0"
      padding="10px 0 0"
      backgroundColor="#fff"
      borderWidth="0 0 1px 0"
      borderColor="rgb(234, 234, 234)"
      borderStyle="solid"
      left="0"
      width="100%"
      position="absolute"
      boxShadow="inset 0px 7px 10px -11px rgba(0,0,0,0.1)"
    >
      <Box maxWidth="1040px" margin="0 auto" padding="0 20px" display="grid" gridTemplateColumns="auto auto 1fr" gridGap="20px">
        <Box padding="0 5px 8px" borderBottom=${activeHome ? activeStyle : ''}>
          <Link action=${navigate('/')}>
            <Box color="#666">
              Secrets
            </Box>
          </Link>
        </Box>

        <Box padding="0 5px 10px" borderBottom=${activeNow ? activeStyle : ''}>
          <Link action=${navigate('/now-json')}>
            <Box color="#666">
              now.json
            </Box>
          </Link>
        </Box>

        <Box marginTop="-2px" textAlign="right" opacity=${createButtonOpacity}>
          <Button action=${navigate(
            '/create-secret/form'
          )} small>+ create</Button>
        </Box>
      </Box>
    </Box>

    <Box marginTop="46px">
      ${await Router()}
    </Box>

    <Box textAlign="right" fontSize="12px" marginTop="20px">
      <P><Link target="_blank" href=${'https://github.com/ph1p/zeit-secrets-integration/releases/tag/v' +
        pkg.version}><Box color="#b7b7b7">${'v' + pkg.version}</Box></Link></P>
    </Box>
  </Page>`;
});
