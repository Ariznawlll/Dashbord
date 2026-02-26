import axios from 'axios';

interface LokiEndpoint {
  name: string;
  url: string;
}

export function getLokiEndpoints(): LokiEndpoint[] {
  const endpoints = process.env.LOKI_ENDPOINTS;
  if (!endpoints) return [];
  
  try {
    return JSON.parse(endpoints);
  } catch (error) {
    console.error('Failed to parse LOKI_ENDPOINTS:', error);
    return [];
  }
}

export async function queryLokiLogs(
  endpointUrl: string,
  query: string,
  limit: number = 100
) {
  const response = await axios.get(`${endpointUrl}/loki/api/v1/query_range`, {
    params: {
      query,
      limit,
      start: Date.now() - 3600000, // 最近1小时
      end: Date.now(),
    },
  });

  return response.data;
}
