const API_BASE = '/api';

let API_KEY = '';

export const setApiKey = (key) => {
  API_KEY = key;
};

const getAuthHeaders = () => {
  const headers = { 'Content-Type': 'application/json' };
  if (API_KEY) {
    headers['Authorization'] = `Bearer ${API_KEY}`;
  }
  return headers;
};

/**
 * Fetches the current module configuration.
 */
export const getConfiguration = async () => {
  const response = await fetch(`${API_BASE}/get-configuration`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
  return await response.json();
};

/**
 * Saves the module configuration.
 * @param {object} configData - The configuration object to save.
 */
export const saveConfiguration = async (configData) => {
  const response = await fetch(`${API_BASE}/configure-module`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(configData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    const errorMsg = errorData[0]?.error || 'Failed to save configuration';
    throw new Error(errorMsg.replace(/_/g, ' '));
  }
  return await response.json();
};

/**
 * Tests the connection to the Qdrant instance.
 * @param {object} connectionData - Host, port, and api_key.
 */
export const testConnection = async (connectionData) => {
  const response = await fetch(`${API_BASE}/test-connection`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(connectionData),
  });
  return await response.json();
};

/**
 * Checks the status of the Qdrant service.
 */
export const checkServiceStatus = async () => {
  const response = await fetch(`${API_BASE}/service-status`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) return null;
  return await response.json();
};

/**
 * Controls the Qdrant service.
 * @param {'start'|'stop'|'restart'} action - The action to perform.
 */
export const controlService = async (action) => {
  const response = await fetch(`${API_BASE}/service-control/${action}`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error(`Failed to ${action} service`);
  return await response.json();
};