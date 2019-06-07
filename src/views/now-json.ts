const generateEnvVariable = (name: string) =>
  name.replace(/-/g, '_').toUpperCase();

export async function NowJSON({ handler = <any>{}, htm: html = <any>{} }) {
  const metadata = await handler.zeitClient.getMetadata();

  let jsonStr: any = {
    env: null
  };

  if (metadata.secrets && metadata.secrets.length > 0) {
    jsonStr.env = metadata.secrets.reduce(
      (prev: any, { name }: { name: string }) => ({
        ...prev,
        [generateEnvVariable(name)]: '@' + name
      }),
      {}
    );
  }

  return html`
    <Box>
      <H2>Generated now.json</H2>
      <Fieldset>
        <FsContent>
          ${
            jsonStr.env
              ? html`
                  <Code width="200px">
                    ${JSON.stringify(jsonStr, undefined, 2)}
                  </Code>
                `
              : html`First you have to <Link action="/create-secret/form">
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
}
