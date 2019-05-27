module.exports = zeitClient => ({
  async getDeployments() {
    const response = await zeitClient.fetch(`/v3/now/deployments`, {
      method: 'GET'
    });

    if (response.status === 200) {
      return (await response.json()).deployments;
    }

    return {
      error: 'There was an error'
    };
  },

  async getDeploymentBuilds(id) {
    const response = await zeitClient.fetch(
      `/v5/now/deployments/${id}/builds`,
      {
        method: 'GET'
      }
    );

    if (response.status === 200) {
      return await response.json();
    }

    return {
      error: 'There was an error'
    };
  },

  async getDeploymentFiles(id) {
    const response = await zeitClient.fetch(`/v5/now/deployments/${id}/files`, {
      method: 'GET'
    });

    if (response.status === 200) {
      return await response.json();
    }

    return {
      error: 'There was an error'
    };
  },

  async getDeploymentFile(id, fileId) {
    const response = await zeitClient.fetch(
      `/v5/now/deployments/${id}/files/${fileId}`,
      {
        method: 'GET'
      }
    );

    if (response.status === 200) {
      return await response.json();
    }

    return {
      error: 'There was an error'
    };
  },

  async getDeploymentById(id) {
    const response = await zeitClient.fetch(`/v9/now/deployments/${id}`, {
      method: 'GET'
    });

    if (response.status === 200) {
      return await response.json();
    }

    return {
      error: 'There was an error'
    };
  },

  async getSecrets() {
    const response = await zeitClient.fetch(`/v2/now/secrets`, {
      method: 'GET'
    });

    if (response.status === 200) {
      return (await response.json()).secrets;
    }

    return {
      error: 'There was an error'
    };
  },

  async createSecret(name, value) {
    if (!name || !value) {
      return {
        error: 'Please enter both values'
      };
    }

    const response = await zeitClient.fetch(`/v2/now/secrets`, {
      method: 'POST',
      data: {
        name,
        value
      }
    });

    if (response.status === 200) {
      return await response.json();
    } else {
      const {
        error: { code, message }
      } = await response.json();
      return {
        error: message
      };
    }

    return {
      error: 'There was an error'
    };
  },

  async changeSecretName(name, newName) {
    if (!name || !newName) {
      return {
        error: 'Please a value'
      };
    }

    const response = await zeitClient.fetch(`/v2/now/secrets/${name}`, {
      method: 'PATCH',
      data: {
        name: newName
      }
    });

    if (response.status === 200) {
      return await response.json();
    } else {
      const {
        error: { code, message }
      } = await response.json();
      return {
        error: message
      };
    }

    return {
      error: 'There was an error'
    };
  },

  async changeSecretName(name, newName) {
    if (!name || !newName) {
      return {
        error: 'Please enter a value'
      };
    }

    const response = await zeitClient.fetch(`/v2/now/secrets/${name}`, {
      method: 'PATCH',
      data: {
        name: newName
      }
    });

    if (response.status === 200) {
      return await response.json();
    } else {
      const {
        error: { code, message }
      } = await response.json();
      return {
        error: message
      };
    }

    return {
      error: 'There was an error'
    };
  },

  async changeSecretValue(name, value) {
    if (!name || !value) {
      return {
        error: 'Please enter a value'
      };
    }

    const response = await zeitClient.fetch(`/v2/now/secrets`, {
      method: 'POST',
      data: {
        name,
        value
      }
    });

    if (response.status === 200) {
      return await response.json();
    } else {
      const {
        error: { code, message }
      } = await response.json();
      return {
        error: message
      };
    }

    return {
      error: 'There was an error'
    };
  },

  async deleteSecret(name) {
    if (!name) {
      return {
        error: 'Please a value'
      };
    }

    const response = await zeitClient.fetch(`/v2/now/secrets/${name}`, {
      method: 'DELETE'
    });

    if (response.status === 200) {
      return await response.json();
    } else {
      const {
        error: { code, message }
      } = await response.json();
      return {
        error: message
      };
    }

    return {
      error: 'There was an error'
    };
  }
});
