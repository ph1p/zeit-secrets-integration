import { ZeitClient, htm as html } from '@zeit/integration-utils';
import zeitApiClient from '../libs/zeit-api-client';

export default async function(name: string, client: ZeitClient) {
  const zac = zeitApiClient(client);

  // Search all now files
  const nowFiles: object[] = [];
  (await Promise.all(
    (await zac.getDeployments()).map(async (deployment: any) => ({
      ...deployment,
      files: await zac.getDeploymentFiles(deployment.uid)
    }))
  )).forEach((data: any) => {
    data.files.forEach((file: any) => {
      if (file.type === 'directory') {
        file.children.forEach((currentFile: any) => {
          if (currentFile.name === 'now.json') {
            nowFiles.push({
              ...data,
              nowFileId: currentFile.uid
            });
          }
        });
      }
    });
  });

  // get all deployments
  const deployments = (await Promise.all(
    nowFiles.map(async (data: any) => ({
      ...data,
      now: await zac.getDeploymentFile(data.uid, data.nowFileId)
    }))
  )).filter(({ now }) => JSON.stringify(now).includes('@' + name) || false);

  return deployments.length > 0
    ? html`
        <Box>
          <UL>
            ${deployments.map(
              (d: any) =>
                html`<LI>
                  <B>
                    <Link
                      target="_blank"
                      href="${'https://' + d.url}"
                    >
                      ${d.url}
                    </Link>
                  </B>
                </LI>`
            )}
          </UL>
        </Box>
      `
    : html`
        <Notice type="success">
          It seems that no deployment uses <B>${'@' + name}</B>
        </Notice>
      `;
}
