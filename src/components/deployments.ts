import { ZeitClient, htm as html } from '@zeit/integration-utils';
import zeitApiClient from '../libs/zeit-api-client';

export default async function(name: string, client: ZeitClient) {
  const zac = zeitApiClient(client);

  // Search all now files
  const deployments: object[] = (await Promise.all(
    (await Promise.all(
      (await zac.getDeployments()).map(async (deployment: any) => ({
        ...deployment,
        files: await zac.getDeploymentFiles(deployment.uid)
      }))
    )).map(async (data: any) => {
      const nowJSON = data.files
        .filter((file: any) => file.type === 'directory')
        .map((dir: any) =>
          dir.children.filter((file: any) => file.name === 'now.json')
        )
        .flat();

      if (nowJSON.length && nowJSON[0].uid) {
        return {
          ...data,
          now: await zac.getDeploymentFile(data.uid, nowJSON[0].uid)
        };
      }
      return;
    })
  )).filter(data => {
    return data && data.now ? JSON.stringify(data.now).includes('@' + name) : false;
  });


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
