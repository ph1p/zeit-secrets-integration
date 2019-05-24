const { htm } = require('@zeit/integration-utils');

module.exports = ({ name }) => {
  return htm`
  <Box>
    <Fieldset>
      <FsContent>
        <Input width="300px" name=${'input-' + name} value=${name} />
      </FsContent>
      <FsFooter>
        <P>
          <Button primary small action=${'//edit-secret-' +
            name}>save</Button>
          <Button secondary small action=${'//confirm-delete-' +
            name}>delete</Button>
        </P>
      </FsFooter>
    </Fieldset>
  </Box>`;
};