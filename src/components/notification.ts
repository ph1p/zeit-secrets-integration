import { ZeitClient, htm as html } from '@zeit/integration-utils';

export default async function(
  data: { [key: string]: any },
  client: ZeitClient
) {
  if (data && data.notify && data.notify.message) {
    const { type = 'message', message } = data.notify;

    // reset notification
    delete data.notify;
    await client.setMetadata(data);

    return html`
      <Box margin="0 0 20px 0">
        <Notice type=${type}>${message}</Notice>
      </Box>
    `;
  }
  return '';
}
