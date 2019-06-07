import zeitApiClient from '../libs/zeit-api-client';

// components
import Notification from '../components/notification';

export async function CreateSecret({ handler = <any>{}, htm: html = <any>{} }) {
  const zac = zeitApiClient(handler.zeitClient);
  const metadata = await handler.zeitClient.getMetadata();

  const { clientState, action } = handler.payload;

  if (action === 'submit') {
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

    metadata.secrets = await zac.getSecrets();
    await handler.zeitClient.setMetadata(metadata);
  }

  return html`${await Notification(metadata, handler.zeitClient)}<Box>
    <H2>Create a new secret</H2>
    <Fieldset>
      <FsContent>
        <Input width="100%" name="secretName" label="Name" value="" placeholder="my-secret-env" />
        <Textarea width="100%" name="secretValue" label="Value" value="" placeholder="P@$$w0rd" height="200px"></Textarea>
      </FsContent>
      <FsFooter>
        <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
          <P>
            <Link target="_blank" href="https://zeit.co/docs/v2/deployments/environment-variables-and-secrets#securing-environment-variables-using-secrets">Here</Link> you will find helpful information about secrets.
          </P>
          <Button highlight small action="submit">+ create</Button>
        </Box>
      </FsFooter>
    </Fieldset>
  </Box>`;
}
