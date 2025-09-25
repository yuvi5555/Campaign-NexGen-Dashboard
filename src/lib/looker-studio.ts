// Google Looker Studio API Service
const LOOKER_STUDIO_BASE_URL = 'https://datastudio.googleapis.com/v1';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

// Mock data for development - replace with real API calls
export interface LookerStudioReport {
  id: string;
  name: string;
  description: string;
  embedUrl: string;
  webUrl: string;
  createdTime: string;
  updatedTime: string;
  owner: string;
}

export interface LookerStudioDataSource {
  id: string;
  name: string;
  type: string;
  lastRefreshTime: string;
  status: 'active' | 'error' | 'refreshing';
}

export interface LookerStudioSchedule {
  id: string;
  name: string;
  reportId: string;
  frequency: string;
  nextRun: string;
  status: 'active' | 'paused' | 'error';
  distributionList: string;
  format: string;
}

export interface LookerStudioDistributionList {
  id: string;
  name: string;
  description: string;
  recipients: string[];
  status: 'active' | 'inactive';
  lastUsed: string;
  reports: string[];
}

export interface LookerStudioMetrics {
  activeReports: number;
  dataSources: number;
  emailsSentToday: number;
  failedDeliveries: number;
}

// Mock authentication - replace with real Google OAuth
let accessToken: string | null = null;

export const setAccessToken = (token: string) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

// API Functions
export const getReports = async (): Promise<LookerStudioReport[]> => {
  // Mock implementation - replace with real API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 'report-1',
          name: 'Marketing Campaign Performance',
          description: 'Comprehensive view of marketing campaign metrics',
          embedUrl: 'https://datastudio.google.com/embed/reporting/embed-url-1',
          webUrl: 'https://datastudio.google.com/reporting/report-url-1',
          createdTime: '2024-01-15T10:00:00Z',
          updatedTime: '2024-01-20T14:30:00Z',
          owner: 'admin@company.com'
        },
        {
          id: 'report-2',
          name: 'Sales Dashboard',
          description: 'Real-time sales performance and forecasting',
          embedUrl: 'https://datastudio.google.com/embed/reporting/embed-url-2',
          webUrl: 'https://datastudio.google.com/reporting/report-url-2',
          createdTime: '2024-01-10T09:00:00Z',
          updatedTime: '2024-01-19T16:45:00Z',
          owner: 'sales@company.com'
        }
      ]);
    }, 800);
  });
};

export const getDataSources = async (): Promise<LookerStudioDataSource[]> => {
  // Mock implementation
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 'ds-1',
          name: 'Marketing Analytics Data',
          type: 'BigQuery',
          lastRefreshTime: '2024-01-20T15:00:00Z',
          status: 'active'
        },
        {
          id: 'ds-2',
          name: 'Sales CRM Data',
          type: 'Google Sheets',
          lastRefreshTime: '2024-01-20T14:30:00Z',
          status: 'active'
        }
      ]);
    }, 600);
  });
};

export const getSchedules = async (): Promise<LookerStudioSchedule[]> => {
  // Mock implementation
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 'schedule-1',
          name: 'Weekly Marketing Report',
          reportId: 'report-1',
          frequency: 'Weekly (Monday 9:00 AM)',
          nextRun: 'Tomorrow 9:00 AM',
          status: 'active',
          distributionList: 'Marketing Team',
          format: 'PDF'
        },
        {
          id: 'schedule-2',
          name: 'Daily Sales Summary',
          reportId: 'report-2',
          frequency: 'Daily (8:00 AM)',
          nextRun: 'Tomorrow 8:00 AM',
          status: 'active',
          distributionList: 'Sales Team',
          format: 'Email'
        }
      ]);
    }, 700);
  });
};

export const getDistributionLists = async (): Promise<LookerStudioDistributionList[]> => {
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
          reports: ['Marketing Campaign Performance']
        },
        {
          id: 'list-2',
          name: 'Sales Team',
          description: 'Daily sales performance reports',
          recipients: ['sales1@company.com', 'sales2@company.com'],
          status: 'active',
          lastUsed: '3 minutes ago',
          reports: ['Sales Dashboard']
        }
      ]);
    }, 500);
  });
};

export const getMetrics = async (): Promise<LookerStudioMetrics> => {
  // Mock implementation
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        activeReports: Math.floor(Math.random() * 50) + 20,
        dataSources: Math.floor(Math.random() * 15) + 5,
        emailsSentToday: Math.floor(Math.random() * 200) + 100,
        failedDeliveries: Math.floor(Math.random() * 5)
      });
    }, 400);
  });
};

export const createSchedule = async (schedule: Omit<LookerStudioSchedule, 'id'>): Promise<LookerStudioSchedule> => {
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

export const createDistributionList = async (list: Omit<LookerStudioDistributionList, 'id'>): Promise<LookerStudioDistributionList> => {
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

export const updateDistributionList = async (id: string, list: Partial<LookerStudioDistributionList>): Promise<void> => {
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

// Authentication helpers
export const authenticateWithLookerStudio = async (): Promise<void> => {
  // Google OAuth 2.0 flow
  const clientId = GOOGLE_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_LOOKER_STUDIO_REDIRECT_URI;
  const scope = 'https://www.googleapis.com/auth/datastudio.readonly';

  // Generate PKCE code verifier and challenge
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  // Store code verifier in session storage
  sessionStorage.setItem('looker_studio_code_verifier', codeVerifier);

  // Construct authorization URL
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    new URLSearchParams({
      client_id: clientId,
      response_type: 'code',
      redirect_uri: redirectUri,
      scope: scope,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      state: 'looker_studio_auth',
      access_type: 'offline',
      prompt: 'consent'
    });

  // Redirect to Google OAuth
  window.location.href = authUrl;
};

// Handle OAuth callback
export const handleAuthCallback = async (code: string, codeVerifier: string): Promise<string> => {
  const tokenEndpoint = 'https://oauth2.googleapis.com/token';
  const redirectUri = import.meta.env.VITE_LOOKER_STUDIO_REDIRECT_URI || window.location.origin;

  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: GOOGLE_CLIENT_ID,
    client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET || '',
    code: code,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier
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