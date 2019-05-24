const { htm } = require('@zeit/integration-utils');

const generateEnvVariable = name => name.replace(/-/g, '_').toUpperCase();

module.exports = {
  generateEnvVariable,
  NowJson({ data }) {
    let jsonStr = {
      env: []
    };

    if (data.secrets && data.secrets.length > 0) {
      jsonStr.env = data.secrets.reduce(
        (prev, { name }) => ({
          ...prev,
          [generateEnvVariable(name)]: '@' + name
        }),
        {}
      );

      return htm`
    <Box>
      <Fieldset>
        <FsContent>
          <H2>Example now.json</H2>
          <Code width="200px">${JSON.stringify(jsonStr, undefined, 2)}</Code>
          <P>
            <Link href="https://zeit.co/docs/v2/deployments/environment-variables-and-secrets/#from-now.json">More Information</Link>
          </P>
        </FsContent>
      </Fieldset>
    </Box>`;
    }

    return '';
  }
};
