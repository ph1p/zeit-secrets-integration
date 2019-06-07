import { htm as html } from '@zeit/integration-utils';

export default function ({
  name,
  deployments
}: {
  name: string;
  deployments: Array<any>;
}) {
  return html`
    <Box>
      <Fieldset>
        <FsContent>
          <Input
            width="100%"
            label="Name"
            name=${'input-' + name}
            value=${name}
          />
          <Textarea
            width="100%"
            label="Value"
            placeholder="P@$$w0rd"
            name=${'textarea-' + name}
            value=""
          /><Box color="rgb(189, 189, 189)" fontSize="12px" margin="0"
            >Leave it blank to only change the name</Box
          >
          ${deployments.length > 0
            ? html`
                <BR />
                <H2>Used in</H2>
                ${deployments.map(
                  (d: any, k: number) =>
                    html`<B><Link target="_blank" href="${'https://' +
                      d.url}">${d.url}</Link></B>${
                      k !== deployments.length - 1 ? ', ' : ''
                    }`
                )}
              `
            : ''}
        </FsContent>
        <FsFooter>
          <Box display="flex" justifyContent="space-between" width="100%">
            <Button small secondary action=${'/secrets/edit/' + name}>
              save
            </Button>
            <Button
              float="right"
              small
              warning
              action=${'/confirm-delete/' + name}
            >
              delete
            </Button>
          </Box>
        </FsFooter>
      </Fieldset>
    </Box>
  `;
};
