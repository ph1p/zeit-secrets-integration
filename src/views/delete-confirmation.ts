import Deployments from '../components/deployments';

export async function DeleteConfirmation({
  handler = <any>{},
  htm: html = <any>{},
  params = <any>{}
}) {
  const { name } = params;

  return html`
    <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gridGap="20px">
      <Box>
        <Fieldset>
          <FsContent>
            Are you sure you want to delete <B>"${name}"</B>?
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
      <Box>
        <Fieldset>
          <FsContent>
            <H2>Used in</H2>
            ${await Deployments(name, handler.zeitClient)}
          </FsContent>
        </Fieldset>
      </Box>
    </Box>
  `;
}
