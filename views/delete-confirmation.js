const zeitApiClient = require('../libs/zeit-api-client');

module.exports = async ({ zeitClient: client, params, htm }) => {
  const zac = zeitApiClient(client);
  const { name } = params;

  // Search all now files
  const nowFiles = [];
  (await Promise.all(
    (await zac.getDeployments()).map(async deployment => ({
      ...deployment,
      files: await zac.getDeploymentFiles(deployment.uid)
    }))
  )).forEach(data => {
    data.files.forEach(file => {
      if (file.type === 'directory') {
        file.children.forEach(({ name: fileName, uid }) => {
          if (fileName === 'now.json') {
            nowFiles.push({
              ...data,
              nowFileId: uid
            });
          }
        });
      }
    });
  });

  // get all deployments
  const deployments = (await Promise.all(
    nowFiles.map(async data => ({
      ...data,
      now: await zac.getDeploymentFile(data.uid, data.nowFileId)
    }))
  )).filter(({ now }) => JSON.stringify(now).includes('@' + name) || false);

  return htm`<Box>
  <Fieldset>
    <FsContent>
      Are you sure you want to delete <B>"${name}"</B>?

      ${
        deployments.length > 0
          ? htm`<BR /><BR /><H2>Used in</H2><UL>${deployments.map(
              (d, k) =>
                htm`<LI><B><Link target="_blank" href="${'https://' + d.url}">${
                  d.url
                }</Link></B></LI>`
            )}</UL>`
          : ''
      }
    </FsContent>
    <FsFooter>
      <Box>
        <Button warning small action=${'//delete-secret-' +
          name}>delete</Button>
        <Button small secondary action="view">cancel</Button>
      </Box>
    </FsFooter>
  </Fieldset>
</Box>`;
};
