const { htm } = require('@zeit/integration-utils');

module.exports = ({ name, deployments }) => htm`<Box>
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
      <P>
        <Button secondary small action=${'//delete-secret-' +
          name}>delete</Button>
        <Button primary small action="view">cancel</Button>
      </P>
    </FsFooter>
  </Fieldset>
</Box>`;
