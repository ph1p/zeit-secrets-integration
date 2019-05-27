const { htm } = require('@zeit/integration-utils');

module.exports = ({ name, deployments }) => {
  return htm`
  <Box>
    <Fieldset>
      <FsContent>
        <Input width="300px" label="Name" name=${'input-' +
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
        <P>
          <Button primary small action=${'//edit-secret-' + name}>save</Button>
          <Button secondary small action=${'/confirm-delete/' +
            name}>delete</Button>
        </P>
      </FsFooter>
    </Fieldset>
  </Box>`;
};
