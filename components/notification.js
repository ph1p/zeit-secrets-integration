const { htm } = require('@zeit/integration-utils');

module.exports = ({ data }) => {
  if (data.notify && data.notify.message) {
    const { type = 'message', message } = data.notify;

    return htm`<Box margin="0 0 20px 0"><Notice type=${type}>${message}</Notice></Box>`;
  }
  return '';
};
