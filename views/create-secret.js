const pkg = require('../package.json');
const zeitApiClient = require('../libs/zeit-api-client');

// components
const SecretInput = require('../components/secret-input');
const Notification = require('../components/notification');

module.exports = async ({ zeitClient, payload, htm, navigate }) => {
  const zac = zeitApiClient(zeitClient);
  const metadata = await zeitClient.getMetadata();

  const { clientState, action } = payload;

  if (action === navigate('/create-secret/submit')) {
    const { secretName, secretValue } = clientState;

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

  return htm`${await Notification(metadata, zeitClient)}<Box>
    <H2>Create a new secret</H2>
    <Fieldset>
      <FsContent>
        <Input width="100%" name="secretName" label="Name" value="" placeholder="my-secret-env" />
        <Textarea width="100%" name="secretValue" label="Value" value="" placeholder="P@$$w0rd" height="200px"></Textarea>
      </FsContent>
      <FsFooter>
        <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
          <P><Link target="_blank" href="https://zeit.co/docs/v2/deployments/environment-variables-and-secrets#securing-environment-variables-using-secrets">Here</Link> you will find helpful information about secrets.</P>
          <Button highlight small action=${navigate(
            '/create-secret/submit'
          )}>+ create</Button>
        </Box>
      </FsFooter>
    </Fieldset>
  </Box>`;
};
