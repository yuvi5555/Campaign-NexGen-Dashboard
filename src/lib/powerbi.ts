// Power BI API Service
const POWERBI_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.powerbi.com/v1.0/myorg';
const POWERBI_SCOPE = 'https://analysis.windows.net/powerbi/api/.default';
const CLIENT_ID = import.meta.env.VITE_POWERBI_CLIENT_ID;
const TENANT_ID = import.meta.env.VITE_POWERBI_TENANT_ID;
const CLIENT_SECRET = import.meta.env.VITE_POWERBI_CLIENT_SECRET;

// Mock data for development - replace with real API calls
export interface PowerBIWorkspace {
  id: string;
  name: string;
  isReadOnly: boolean;
}

export interface PowerBIReport {
  id: string;
  name: string;
  webUrl: string;
  embedUrl: string;
  datasetId: string;
}

export interface PowerBIDataset {
  id: string;
  name: string;
  configuredBy: string;
}

export interface PowerBISchedule {
  id: string;
  name: string;
  frequency: string;
  nextRun: string;
  status: 'active' | 'paused' | 'error';
  distributionList: string;
  format: string;
  reportId: string;
  workspaceId: string;
}

export interface PowerBIDistributionList {
  id: string;
  name: string;
  description: string;
  recipients: string[];
  status: 'active' | 'inactive';
  lastUsed: string;
  reports: string[];
}

export interface PowerBIMetrics {
  activeReports: number;
  distributionLists: number;
  emailsSentToday: number;
  failedDeliveries: number;
}

// Mock authentication - replace with real Azure AD auth
let accessToken: string | null = null;

export const setAccessToken = (token: string) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

// API Functions
export const getWorkspaces = async (): Promise<PowerBIWorkspace[]> => {
  // Mock implementation - replace with real API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 'workspace-1',
          name: 'Marketing Analytics',
          isReadOnly: false
        },
        {
          id: 'workspace-2',
          name: 'Sales Dashboard',
          isReadOnly: false
        }
      ]);
    }, 1000);
  });
};

export const getReports = async (workspaceId: string): Promise<PowerBIReport[]> => {
  // Mock implementation
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 'report-1',
          name: 'Campaign Performance',
          webUrl: 'https://app.powerbi.com/report-url-1',
          embedUrl: 'https://app.powerbi.com/embed-url-1',
          datasetId: 'dataset-1'
        },
        {
          id: 'report-2',
          name: 'Sales Pipeline',
          webUrl: 'https://app.powerbi.com/report-url-2',
          embedUrl: 'https://app.powerbi.com/embed-url-2',
          datasetId: 'dataset-2'
        }
      ]);
    }, 800);
  });
};

export const getDatasets = async (workspaceId: string): Promise<PowerBIDataset[]> => {
  // Mock implementation
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 'dataset-1',
          name: 'Marketing Data',
          configuredBy: 'admin@company.com'
        }
      ]);
    }, 600);
  });
};

export const getSchedules = async (): Promise<PowerBISchedule[]> => {
  // Mock implementation
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 'schedule-1',
          name: 'Weekly Campaign Performance',
          frequency: 'Weekly (Monday 9:00 AM)',
          nextRun: 'Tomorrow 9:00 AM',
          status: 'active',
          distributionList: 'Marketing Team',
          format: 'PDF',
          reportId: 'report-1',
          workspaceId: 'workspace-1'
        },
        {
          id: 'schedule-2',
          name: 'Daily Sales Report',
          frequency: 'Daily (8:00 AM)',
          nextRun: 'Tomorrow 8:00 AM',
          status: 'active',
          distributionList: 'Sales Team',
          format: 'Excel',
          reportId: 'report-2',
          workspaceId: 'workspace-2'
        }
      ]);
    }, 700);
  });
};

export const getDistributionLists = async (): Promise<PowerBIDistributionList[]> => {
  // Mock implementation
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 'list-1',
          name: 'Marketing Team',
          description: 'Weekly campaign performance reports',
          recipients: ['marketing1@company.com', 'marketing2@company.com'],
          status: 'active',
          lastUsed: '2 hours ago',
          reports: ['Campaign Performance', 'Social Media Analytics']
        },
        {
          id: 'list-2',
          name: 'Sales Team',
          description: 'Daily sales performance and pipeline reports',
          recipients: ['sales1@company.com', 'sales2@company.com'],
          status: 'active',
          lastUsed: '3 minutes ago',
          reports: ['Sales Pipeline', 'Revenue Forecast']
        }
      ]);
    }, 500);
  });
};

export const getMetrics = async (): Promise<PowerBIMetrics> => {
  // Mock implementation
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        activeReports: Math.floor(Math.random() * 50) + 20,
        distributionLists: Math.floor(Math.random() * 15) + 5,
        emailsSentToday: Math.floor(Math.random() * 200) + 100,
        failedDeliveries: Math.floor(Math.random() * 5)
      });
    }, 400);
  });
};

export const createSchedule = async (schedule: Omit<PowerBISchedule, 'id'>): Promise<PowerBISchedule> => {
  // Mock implementation
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        ...schedule,
        id: `schedule-${Date.now()}`
      });
    }, 1000);
  });
};

export const updateScheduleStatus = async (id: string, status: 'active' | 'paused'): Promise<void> => {
  // Mock implementation
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 500);
  });
};

export const deleteSchedule = async (id: string): Promise<void> => {
  // Mock implementation
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 500);
  });
};

export const createDistributionList = async (list: Omit<PowerBIDistributionList, 'id'>): Promise<PowerBIDistributionList> => {
  // Mock implementation
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        ...list,
        id: `list-${Date.now()}`
      });
    }, 1000);
  });
};

export const updateDistributionList = async (id: string, list: Partial<PowerBIDistributionList>): Promise<void> => {
  // Mock implementation
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 500);
  });
};

export const deleteDistributionList = async (id: string): Promise<void> => {
  // Mock implementation
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 500);
  });
};

// Dataset Querying Functions
export interface PowerBIQueryResult {
  tables: Array<{
    rows: Array<Record<string, unknown>>;
    columns: Array<{ name: string; type: string }>;
  }>;
}

export const executeQuery = async (datasetId: string, daxQuery: string): Promise<PowerBIQueryResult> => {
  const token = getAccessToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${POWERBI_BASE_URL}/datasets/${datasetId}/executeQueries`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      queries: [{
        query: daxQuery
      }]
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Query failed: ${error}`);
  }

  return await response.json();
};

// Authentication helpers
export const authenticateWithPowerBI = async (): Promise<void> => {
  // Real OAuth 2.0 authorization code flow with PKCE
  const clientId = CLIENT_ID;
  const tenantId = TENANT_ID;
  const redirectUri = import.meta.env.VITE_POWERBI_REDIRECT_URI || window.location.origin;

  // Generate PKCE code verifier and challenge
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  // Store code verifier in session storage
  sessionStorage.setItem('powerbi_code_verifier', codeVerifier);

  // Construct authorization URL
  const authUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?` +
    new URLSearchParams({
      client_id: clientId,
      response_type: 'code',
      redirect_uri: redirectUri,
      scope: POWERBI_SCOPE,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      state: 'powerbi_auth'
    });

  // Redirect to Azure AD
  window.location.href = authUrl;
};

// Handle OAuth callback
export const handleAuthCallback = async (code: string, codeVerifier: string): Promise<string> => {
  const tokenEndpoint = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`;
  const redirectUri = import.meta.env.VITE_POWERBI_REDIRECT_URI || window.location.origin;

  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: CLIENT_ID,
    code: code,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
    scope: POWERBI_SCOPE
  });

  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params
  });

  if (!response.ok) {
    throw new Error('Failed to obtain access token');
  }

  const data = await response.json();
  const token = data.access_token;
  setAccessToken(token);
  return token;
};

// PKCE helper functions
function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64URLEncode(array);
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return base64URLEncode(new Uint8Array(hash));
}

function base64URLEncode(array: Uint8Array): string {
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

export const isAuthenticated = (): boolean => {
  return accessToken !== null;
};