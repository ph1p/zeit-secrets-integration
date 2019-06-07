import zeitApiClient from '../libs/zeit-api-client';

// components
import SecretInput from '../components/secret-input';
import Notification from '../components/notification';

export async function Secrets(view: any) {
  const { handler, htm: html, params, router } = view;

  const zac = zeitApiClient(handler.zeitClient);
  const metadata = await handler.zeitClient.getMetadata();
  const { clientState } = handler.payload;


  // get secrets
  metadata.secrets = await zac.getSecrets();
  await handler.zeitClient.setMetadata(metadata);

  if (params.action === 'edit') {
    const name: any = params.name;

    if (
      name === clientState['input-' + name] &&
      !clientState['textarea-' + name]
    ) {
      metadata.notify = {
        message: `No changes. Old and new secrets are the same.`
      };
    } else {
      let res;
      if (!clientState['textarea-' + name]) {
        res = await zac.changeSecretName(name, clientState['input-' + name]);
      } else {
        await zac.deleteSecret(name);
        res = await zac.changeSecretValue(
          name,
          clientState['textarea-' + name]
        );
      }

      if (!res || res.error) {
        metadata.notify = {
          type: 'error',
          message: res.error
        };
      } else {
        metadata.notify = {
          type: 'success',
          message: clientState['textarea-' + name]
            ? `Changed the value of "${res.name}"`
            : `Changed "${res.oldName}" to "${res.name}"`
        };
      }
    }

    // get secrets
    metadata.secrets = await zac.getSecrets();
    await handler.zeitClient.setMetadata(metadata);

    router.navigate('/secrets');
  }

  if (params.action === 'delete-secret') {
    const name: any = params.name;
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
    await handler.zeitClient.setMetadata(metadata);

    router.navigate('/secrets');
  }

  const isSecretListEmpty = !metadata.secrets || metadata.secrets.length === 0;
  const gridColumns = `repeat(${isSecretListEmpty ? 1 : 3}, 1fr)`;

  return html`
    ${await Notification(metadata, handler.zeitClient)}<Box gridGap="20px">
      <H2>Secrets</H2>
      <Box
        display="grid"
        gridGap="20px"
        gridTemplateColumns=${gridColumns}
        overflow="auto"
      >
        ${!isSecretListEmpty
          ? metadata.secrets.map(({ name }: { name: string }) => {
              return html`
                <${SecretInput} name=${name} deployments=${[]} />
              `;
            })
          : html`<Fieldset>
            <FsContent>You haven't created a secret yet. Click on
              <Link action="/create-secret">
                <B>+ CREATE</B>
              </Link> to add one or more.
            </FsContent>
          </Fieldset>`}
      </Box>
    </Box>
  `;
}
