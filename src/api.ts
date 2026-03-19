import { useStore } from './store';
import { handleMockRequest } from './mockApi';

export class N8nApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function fetchN8n(endpoint: string, options: RequestInit = {}) {
  const instance = useStore.getState().getActiveInstance();
  if (!instance) {
    useStore.getState().addLog({ type: 'error', message: 'No active n8n instance selected' });
    throw new Error('No active n8n instance selected');
  }

  let baseUrl = instance.url.trim().replace(/\/$/, '');
  if (!baseUrl.endsWith('/api/v1')) {
    baseUrl = `${baseUrl}/api/v1`;
  }
  const url = `${baseUrl}${endpoint}`;

  if (instance.url.trim() === 'https://mock.n8n.local') {
    useStore.getState().addLog({ 
      type: 'info', 
      message: `Mock Request: ${options.method || 'GET'} ${endpoint}`,
      details: `URL: ${instance.url}${endpoint}`
    });
    try {
      const data = await handleMockRequest(endpoint, options);
      useStore.getState().addLog({ type: 'info', message: `Mock Success: ${endpoint}` });
      return data;
    } catch (error: any) {
      useStore.getState().addLog({ type: 'error', message: `Mock Error: ${endpoint}`, details: error.message });
      throw error;
    }
  }

  useStore.getState().addLog({ 
    type: 'info', 
    message: `Request: ${options.method || 'GET'} ${endpoint}`,
    details: `URL: ${url}`
  });

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'X-N8N-API-KEY': instance.apiKey,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      let errorMessage = response.statusText;
      let errorDetails = '';
      try {
        const errorData = await response.json();
        if (errorData.message) errorMessage = errorData.message;
        errorDetails = JSON.stringify(errorData, null, 2);
      } catch (e) {
        // Ignore JSON parse error
      }
      
      useStore.getState().addLog({ 
        type: 'error', 
        message: `HTTP Error ${response.status} on ${endpoint}`,
        details: errorDetails || errorMessage
      });
      throw new N8nApiError(response.status, `API Error: ${errorMessage}`);
    }

    const data = await response.json();
    useStore.getState().addLog({ type: 'info', message: `Success: ${endpoint}` });
    return data;
  } catch (error: any) {
    if (!(error instanceof N8nApiError)) {
      let details = error.message || String(error);
      
      // Factual diagnostic for Mixed Content
      if (window.location.protocol === 'https:' && instance.url.trim().startsWith('http:')) {
        details += '\n\n[DIAGNOSTIC] Mixed Content: This app is on HTTPS, but n8n is on HTTP. Browsers block this. Use HTTPS for n8n.';
      }
      
      useStore.getState().addLog({ 
        type: 'error', 
        message: `Network Error on ${endpoint}`,
        details: details
      });
      
      error.message = details;
    }
    throw error;
  }
}

export const api = {
  getWorkflows: () => fetchN8n('/workflows'),
  getWorkflow: (id: string) => fetchN8n(`/workflows/${id}`),
  updateWorkflow: (id: string, data: any) => fetchN8n(`/workflows/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  getExecutions: () => fetchN8n('/executions'),
  getCredentials: () => fetchN8n('/credentials'),
  updateCredential: (id: string, data: any) => fetchN8n(`/credentials/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  }),
  getUsers: () => fetchN8n('/users'),
};
