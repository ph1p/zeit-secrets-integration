const { htm } = require('@zeit/integration-utils');

module.exports = async (data, client) => {
  if (data && data.notify && data.notify.message) {
    const { type = 'message', message } = data.notify;

    // reset notification
    delete data.notify;
    await client.setMetadata(data);

    return htm`<Box margin="0 0 20px 0"><Notice type=${type}>${message}</Notice></Box>`;
  }
  return '';
};
