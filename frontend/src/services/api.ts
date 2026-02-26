import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

export const githubApi = {
  getIssues: () => api.get('/github/issues'),
  getIssuesByAssignee: () => api.get('/github/issues/by-assignee'),
  getRegressionIssues: () => api.get('/github/issues/regression'),
  getRecentlyClosedIssues: (days: number = 1) => api.get('/github/issues/recently-closed', { params: { days } }),
};

export const lokiApi = {
  getEndpoints: () => api.get('/loki/endpoints'),
  queryLogs: (endpoint: string, query: string, limit?: number) =>
    api.post('/loki/query', { endpoint, query, limit }),
};

export const monitoringApi = {
  getMonitors: () => api.get('/monitoring/monitors'),
};

export default api;
