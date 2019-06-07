import zeitApiClient from '../libs/zeit-api-client';

export async function DeleteConfirmation({
  handler = <any>{},
  htm: html = <any>{},
  params = <any>{}
}) {
  const zac = zeitApiClient(handler.zeitClient);
  const { name } = params;

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

  return html`
    <Box>
      <Fieldset>
        <FsContent>
          Are you sure you want to delete <B>"${name}"</B>?
          ${deployments.length > 0
            ? html`
                <BR /><BR />
                <H2>Used in</H2>
                <UL>
                  ${deployments.map(
                    (d: any) =>
                      html`<LI>
                        <B>
                          <Link target="_blank" href="${'https://' + d.url}">${
                        d.url
                      }</Link>
                        </B>
                      </LI>`
                  )}
                </UL>
              `
            : ''}
        </FsContent>
        <FsFooter>
          <Box>
            <Button warning small action=${'/secrets/delete-secret/' + name}>
              delete
            </Button>
            <Button small secondary action="/">cancel</Button>
          </Box>
        </FsFooter>
      </Fieldset>
    </Box>
  `;
}
