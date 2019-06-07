import { htm as html } from '@zeit/integration-utils';
import { ZeitRouter, HandlerOptions, Router } from 'zeit-router';
import { CreateSecret, DeleteConfirmation, NowJSON, Secrets } from './views';
import pkg from '../package.json';

const app = new ZeitRouter();

app.add('/secrets(/:action(/:name))', Secrets);
app.add('/confirm-delete/:name', DeleteConfirmation, true);
app.add('/create-secret', CreateSecret);
app.add('/now-json', NowJSON);

const uiHook = app.uiHook(async (handler: HandlerOptions, router: Router) => {
  const activeHome =
    router.currentPath === '/' || router.currentPath === '/secrets';
  const activeNow = router.currentPath === '/now-json';
  const activeCreate = router.currentPath === '/create-secret/';

  if (activeHome) {
    await router.navigate('/secrets');
  }

  const activeStyle = '2px solid #000';
  const createButtonOpacity = activeCreate ? 0.2 : 1;

  return html`<Page>
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
          <Link action="/">
            <Box color="#666">
              Secrets
            </Box>
          </Link>
        </Box>

        <Box padding="0 5px 10px" borderBottom=${activeNow ? activeStyle : ''}>
          <Link action="/now-json">
            <Box color="#666">
              now.json
            </Box>
          </Link>
        </Box>

        <Box marginTop="-2px" textAlign="right" opacity=${createButtonOpacity}>
          <Button action="/create-secret" small>+ create</Button>
        </Box>
      </Box>
    </Box>

    <Box marginTop="46px">
      ${await router.currentRoute}
    </Box>

    <Box textAlign="right" fontSize="12px" marginTop="20px">
      <P><Link target="_blank" href=${'https://github.com/ph1p/zeit-secrets-integration/releases/tag/v' +
        pkg.version}><Box color="#b7b7b7">${'v' + pkg.version}</Box></Link></P>
    </Box>
  </Page>`;
});

export default uiHook;
