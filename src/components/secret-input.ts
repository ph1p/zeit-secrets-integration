import { htm as html } from '@zeit/integration-utils';

export default function({ name }: { name: string }) {
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
            placeholder="Leave it blank to only change the name..."
            name=${'textarea-' + name}
            value=""
          />
          <Box fontSize="12px" margin="0">
            <Link action=${'/secrets/information/' + name}>
              Show deployments that use this secret
            </Link>
          </Box>
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
}
