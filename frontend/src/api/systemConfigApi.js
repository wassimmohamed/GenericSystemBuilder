const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function request(url, options = {}) {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || `Request failed: ${response.status}`);
  }
  if (response.status === 204) return null;
  return response.json();
}

export const systemConfigApi = {
  getAll: () => request('/api/system-configurations'),
  getByKey: (key) => request(`/api/system-configurations/${key}`),
  getVersions: (key) => request(`/api/system-configurations/${key}/versions`),
  getByVersion: (key, version) =>
    request(`/api/system-configurations/${key}/versions/${version}`),
  create: (data) =>
    request('/api/system-configurations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (key, data) =>
    request(`/api/system-configurations/${key}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (key) =>
    request(`/api/system-configurations/${key}`, { method: 'DELETE' }),
  getExportCollection: (systemKey, pageKey, collectionName) =>
    request(
      `/api/system-configurations/${systemKey}/pages/${pageKey}/collections/${collectionName}`
    ),
  getAccessibleSystems: (userId) =>
    request(`/api/system-configurations/user/${userId}/accessible`),
};
