const pkg = require('../package.json');
const zeitApiClient = require('../libs/zeit-api-client');

// components
const Notification = require('../components/notification');
const SecretInput = require('../components/secret-input');

module.exports = async ({ zeitClient, payload, htm, navigate }) => {
  const zac = zeitApiClient(zeitClient);
  const metadata = await zeitClient.getMetadata();

  const { clientState, action } = payload;

  if (action === navigate('/create-secret/submit')) {
    const { secretName, secretValue } = clientState;

    delete metadata.notify;
    await zeitClient.setMetadata(metadata);

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

  return htm`<${Notification} data=${metadata} />
  <Box margin="0 auto">
    <Fieldset>
      <FsContent>
        <H2>Create a new secret</H2>
        <Input width="100%" name="secretName" label="Name" value="" placeholder="my-secret-env" />
        <Textarea width="100%" name="secretValue" label="Value" value="" placeholder="P@$$w0rd" height="200px"></Textarea>
      </FsContent>
      <FsFooter>
        <Button small action=${navigate(
          '/create-secret/submit'
        )}>+ create</Button>
      </FsFooter>
    </Fieldset>
  </Box>`;
};
