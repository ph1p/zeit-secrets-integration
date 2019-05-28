const generateEnvVariable = name => name.replace(/-/g, '_').toUpperCase();

module.exports = async ({ zeitClient, htm }) => {
  const metadata = await zeitClient.getMetadata();

  let jsonStr = {
    env: []
  };

  if (metadata.secrets && metadata.secrets.length > 0) {
    jsonStr.env = metadata.secrets.reduce(
      (prev, { name }) => ({
        ...prev,
        [generateEnvVariable(name)]: '@' + name
      }),
      {}
    );

    return htm`
    <Box>
      <H2>Generated now.json</H2>
      <Fieldset>
        <FsContent>
          <Code width="200px">${JSON.stringify(jsonStr, undefined, 2)}</Code>
        </FsContent>
        <FsFooter>
          <Box>
            <P><Link target="_blank" href="https://zeit.co/docs/v2/deployments/environment-variables-and-secrets/#from-now.json">More Information</Link> about secrets inside the <B>now.json</B> file.</P>
          </Box>
        </FsFooter>
      </Fieldset>
    </Box>`;
  }

  return '';
};
