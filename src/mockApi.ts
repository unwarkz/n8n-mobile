export const mockData = {
  workflows: [
    {
      id: "mock-wf-1",
      name: "Sync Leads to CRM",
      active: true,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 3600000).toISOString(),
      nodes: [
        {
          parameters: {},
          id: "1",
          name: "Webhook",
          type: "n8n-nodes-base.webhook",
          typeVersion: 1,
          position: [250, 300]
        },
        {
          parameters: {},
          id: "2",
          name: "HubSpot",
          type: "n8n-nodes-base.hubspot",
          typeVersion: 1,
          position: [450, 300]
        }
      ],
      connections: {
        "Webhook": {
          "main": [
            [
              {
                "node": "HubSpot",
                "type": "main",
                "index": 0
              }
            ]
          ]
        }
      }
    },
    {
      id: "mock-wf-2",
      name: "Weekly Report Email",
      active: false,
      createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      nodes: [
        {
          parameters: {},
          id: "1",
          name: "Schedule",
          type: "n8n-nodes-base.scheduleTrigger",
          typeVersion: 1,
          position: [250, 300]
        },
        {
          parameters: {},
          id: "2",
          name: "Send Email",
          type: "n8n-nodes-base.emailSend",
          typeVersion: 1,
          position: [450, 300]
        }
      ],
      connections: {
        "Schedule": {
          "main": [
            [
              {
                "node": "Send Email",
                "type": "main",
                "index": 0
              }
            ]
          ]
        }
      }
    }
  ],
  executions: [
    {
      id: "exec-1",
      status: "success",
      startedAt: new Date(Date.now() - 10000).toISOString(),
      stoppedAt: new Date(Date.now() - 5000).toISOString(),
      workflowId: "mock-wf-1",
      mode: "webhook",
      runningTime: 5000,
      workflowData: { name: "Sync Leads to CRM" }
    },
    {
      id: "exec-2",
      status: "error",
      startedAt: new Date(Date.now() - 3600000).toISOString(),
      stoppedAt: new Date(Date.now() - 3590000).toISOString(),
      workflowId: "mock-wf-2",
      mode: "trigger",
      runningTime: 10000,
      workflowData: { name: "Weekly Report Email" }
    },
    {
      id: "exec-3",
      status: "running",
      startedAt: new Date(Date.now() - 2000).toISOString(),
      stoppedAt: null,
      workflowId: "mock-wf-1",
      mode: "webhook",
      runningTime: 2000,
      workflowData: { name: "Sync Leads to CRM" }
    }
  ],
  credentials: [
    {
      id: "cred-1",
      name: "My HubSpot Account",
      type: "hubspotApi",
      createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 20).toISOString()
    },
    {
      id: "cred-2",
      name: "SMTP Server",
      type: "smtp",
      createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 15).toISOString()
    }
  ],
  users: [
    {
      id: "user-1",
      email: "admin@example.com",
      firstName: "Admin",
      lastName: "User",
      role: "global:owner",
      createdAt: new Date(Date.now() - 86400000 * 30).toISOString()
    },
    {
      id: "user-2",
      email: "editor@example.com",
      firstName: "Editor",
      lastName: "User",
      role: "global:member",
      createdAt: new Date(Date.now() - 86400000 * 10).toISOString()
    }
  ]
};

export async function handleMockRequest(endpoint: string, options: RequestInit = {}) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const method = options.method || 'GET';

  if (endpoint === '/workflows' && method === 'GET') {
    return { data: mockData.workflows };
  }

  if (endpoint.startsWith('/workflows/') && method === 'GET') {
    const id = endpoint.split('/')[2];
    const wf = mockData.workflows.find(w => w.id === id);
    if (!wf) throw new Error('Workflow not found');
    return wf;
  }

  if (endpoint.startsWith('/workflows/') && method === 'PUT') {
    const id = endpoint.split('/')[2];
    const wfIndex = mockData.workflows.findIndex(w => w.id === id);
    if (wfIndex === -1) throw new Error('Workflow not found');
    
    const body = JSON.parse(options.body as string);
    mockData.workflows[wfIndex] = { ...mockData.workflows[wfIndex], ...body, updatedAt: new Date().toISOString() };
    return mockData.workflows[wfIndex];
  }

  if (endpoint === '/executions' && method === 'GET') {
    return { data: mockData.executions };
  }

  if (endpoint === '/credentials' && method === 'GET') {
    return { data: mockData.credentials };
  }

  if (endpoint.startsWith('/credentials/') && method === 'PATCH') {
    const id = endpoint.split('/')[2];
    const credIndex = mockData.credentials.findIndex(c => c.id === id);
    if (credIndex === -1) throw new Error('Credential not found');
    
    const body = JSON.parse(options.body as string);
    mockData.credentials[credIndex] = { ...mockData.credentials[credIndex], ...body, updatedAt: new Date().toISOString() };
    return mockData.credentials[credIndex];
  }

  if (endpoint === '/users' && method === 'GET') {
    return { data: mockData.users };
  }

  throw new Error(`Mock endpoint not implemented: ${method} ${endpoint}`);
}
