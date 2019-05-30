const { htm } = require('@zeit/integration-utils');

module.exports = ({ name, deployments }) => {
  return htm`
  <Box>
    <Fieldset>
      <FsContent>
        <Input width="100%" label="Name" name=${'input-' +
          name} value=${name} />
        ${
          deployments.length > 0
            ? htm`<BR /><H2>Used in</H2>${deployments.map(
                (d, k) =>
                  htm`<B><Link target="_blank" href="${'https://' + d.url}">${
                    d.url
                  }</Link></B>${k !== deployments.length - 1 ? ', ' : ''}`
              )}`
            : ''
        }
      </FsContent>
      <FsFooter>
        <Box display="flex" justifyContent="space-between" width="100%">
          <Button small secondary action=${'//edit-secret-' +
            name}>save</Button>
          <Button float="right" small warning action=${'/confirm-delete/' +
            name}>delete</Button>
        </Box>
      </FsFooter>
    </Fieldset>
  </Box>`;
};
