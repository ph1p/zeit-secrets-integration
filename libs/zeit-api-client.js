module.exports = zeitClient => {
  const request = async (url, options = {}, responseKey) => {
    try {
      const response = await zeitClient.fetchAndThrow(url, {
        method: 'GET',
        ...options
      });

      if (responseKey) {
        return response[responseKey];
      }

      return response;
    } catch (e) {
      const error = e.message.split('error:')
        ? JSON.parse(e.message.split('error:')[1].trim()).error.message
        : 'There was an error';

      return {
        error
      };
    }
  };

  return {
    getDeployments: async () =>
      request('/v3/now/deployments', {}, 'deployments'),
    getDeploymentBuilds: async id =>
      request(`/v5/now/deployments/${id}/builds`),
    getDeploymentFiles: async id => request(`/v5/now/deployments/${id}/files`),
    getDeploymentFile: async (id, fileId) =>
      request(`/v5/now/deployments/${id}/files/${fileId}`),
    getDeploymentById: async id => request(`/v9/now/deployments/${id}`),
    getSecrets: async () => request('/v2/now/secrets', {}, 'secrets'),
    createSecret: async (name, value) =>
      request('/v2/now/secrets', {
        method: 'POST',
        data: {
          name,
          value
        }
      }),
    changeSecretName: async (name, newName) =>
      request(`/v2/now/secrets/${name}`, {
        method: 'PATCH',
        data: {
          name: newName
        }
      }),
    changeSecretValue: async (name, value) =>
      request('/v2/now/secrets', {
        method: 'POST',
        data: {
          name,
          value
        }
      }),
    deleteSecret: async name =>
      request(`/v2/now/secrets/${name}`, {
        method: 'DELETE'
      })
  };
};
