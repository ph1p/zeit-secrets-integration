// const zeitApiClient = require('../libs/zeit-api-client');

const generateEnvVariable = name => name.replace(/-/g, '_').toUpperCase();

module.exports = async ({ zeitClient, htm, navigate }) => {
  // const zac = zeitApiClient(zeitClient);
  const metadata = await zeitClient.getMetadata();

  // // get secrets
  // metadata.secrets = await zac.getSecrets();
  // await zeitClient.setMetadata(metadata);

  let jsonStr = {
    env: null
  };

  if (metadata.secrets && metadata.secrets.length > 0) {
    jsonStr.env = metadata.secrets.reduce(
      (prev, { name }) => ({
        ...prev,
        [generateEnvVariable(name)]: '@' + name
      }),
      {}
    );
  }

  return htm`
    <Box>
      <H2>Generated now.json</H2>
      <Fieldset>
        <FsContent>
          ${
            jsonStr.env
              ? htm`<Code width="200px">${JSON.stringify(
                  jsonStr,
                  undefined,
                  2
                )}</Code>`
              : htm`First you have to <Link action=${navigate(
                  '/create-secret/form'
                )}>
              <B>
                create
              </B>
            </Link> a secret to get an example JSON.`
          }
        </FsContent>
        <FsFooter>
          <Box>
            <P><Link target="_blank" href="https://zeit.co/docs/v2/deployments/environment-variables-and-secrets/#from-now.json">More Information</Link> about secrets inside the <B>now.json</B> file.</P>
          </Box>
        </FsFooter>
      </Fieldset>
    </Box>`;
};
