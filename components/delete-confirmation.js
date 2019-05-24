const { htm } = require('@zeit/integration-utils');

module.exports = ({ name }) => htm`<Box>
  <Fieldset>
    <FsContent>
      Are you sure you want to delete <B>"${name}"</B>?
    </FsContent>
    <FsFooter>
      <P>
        <Button secondary small action=${'//delete-secret-' +
          name}>delete</Button>
        <Button primary small action="view">cancel</Button>
      </P>
    </FsFooter>
  </Fieldset>
</Box>`;
