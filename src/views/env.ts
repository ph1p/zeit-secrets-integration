export async function Env({ handler = <any>{}, htm: html = <any>{} }) {
  if (handler.payload.action === 'add-variable') {
    return html`
      <Page>
        Environment variable added.
      </Page>
    `;
  }

  return html`
    <Page>
      <Button action="add-variable">Add variable</Button>
    </Page>
  `;
}
