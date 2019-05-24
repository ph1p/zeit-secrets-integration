const { htm } = require('@zeit/integration-utils');

module.exports = ({ data }) => {
  if (data.notify && data.notify.message) {
    const { type = 'message', message } = data.notify;

    return htm`<Notice type=${type}>${message}</Notice><BR />`;
  }
  return '';
};
