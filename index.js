const { withUiHook, htm } = require('@zeit/integration-utils');
const qs = require('querystring');
const zeitApiClient = require('./zeit-api-client');

const Notification = ({ data }) => {
  if (data.notify) {
    const { type, message } = data.notify;

    return htm`<Notice type=${type}>${message}</Notice>`;
  }
  return '';
};

module.exports = withUiHook(async ({ payload, zeitClient }) => {
  const { clientState, action } = payload;
  const zac = zeitApiClient(zeitClient);
  const metadata = await zeitClient.getMetadata();

  delete metadata.notify;
  await zeitClient.setMetadata(metadata);

  if (action.startsWith('//edit-secret-')) {
    delete metadata.notify;
    await zeitClient.setMetadata(metadata);

    const name = action.replace('//edit-secret-', '');

    const res = await zac.changeSecretName(name, clientState['input-' + name]);

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

    await zeitClient.setMetadata(metadata);
  }

  if (action.startsWith('//delete-secret-')) {
    delete metadata.notify;
    await zeitClient.setMetadata(metadata);

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

  if (action === '//add-secret') {
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
        message:
          'Added secret successfull. You can now use it: "@' + secretName + '"'
      };
    }

    await zeitClient.setMetadata(metadata);
  }

  // get secrets
  metadata.secrets = await zac.getSecrets();
  await zeitClient.setMetadata(metadata);

  return htm`<Page>
    <${Notification} data=${metadata} />
    <Box display="grid" gridTemplateColumns="1fr 1fr" gridGap="20px">
      <Box>
        <Fieldset>
          <FsContent>
            <H2>Your Secrets</H2>

          ${
            metadata.secrets
              ? metadata.secrets.map(
                  secret =>
                    htm`<Box display="flex" justifyContent="space-between" alignItems="center" margin="15px 0">
                      <Input width="300px" name=${'input-' + secret.name} value=${
                      secret.name
                    } />
                      <Button small primary action=${'//edit-secret-' +
                        secret.name}>save</Button>
                      <Button small secondary action=${'//delete-secret-' +
                      secret.name}>delete</Button>
                    </Box>`
                )
              : htm`<Notice type="message">Currently no secrets</Notice>`
          }
          </FsContent>
        </Fieldset>
      </Box>

      <Box>
        <Fieldset>
          <FsContent>
            <H2>Create a new secret</H2>
            <Input name="secretName" label="Name" value="" placeholder="my-env" />
            <Textarea name="secretValue" label="Value" value="" placeholder="P@$$w0rd" width="350px" height="200px"></Textarea>
          </FsContent>
          <FsFooter>
            <Button action="//add-secret">+add</Button>
          </FsFooter>
        </Fieldset>
      </Box>
    </Box>
  </Page>`;
});
