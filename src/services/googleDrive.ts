import { User, Tool } from '../types';

const CLIENT_ID = (import.meta as any).env.VITE_GOOGLE_CLIENT_ID || '';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

let tokenClient: any = null;
let accessToken: string | null = null;

export const initGoogleDrive = () => {
  if (typeof window === 'undefined' || !(window as any).google) return;

  tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: (response: any) => {
      if (response.error !== undefined) {
        throw response;
      }
      accessToken = response.access_token;
    },
  });
};

export const requestDriveAccess = async (): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      initGoogleDrive();
    }
    
    tokenClient.callback = (response: any) => {
      if (response.error) reject(response);
      accessToken = response.access_token;
      resolve(accessToken!);
    };
    
    tokenClient.requestAccessToken({ prompt: 'consent' });
  });
};

export const saveToDrive = async (data: any, fileName: string = 'fahim_backup.json') => {
  if (!accessToken) {
    await requestDriveAccess();
  }

  const metadata = {
    name: fileName,
    mimeType: 'application/json',
  };

  const file = new Blob([JSON.stringify(data)], { type: 'application/json' });
  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', file);

  const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: form,
  });

  return response.json();
};

export const loadFromDrive = async (fileName: string = 'fahim_backup.json') => {
  if (!accessToken) {
    await requestDriveAccess();
  }

  // Search for the file
  const searchResponse = await fetch(`https://www.googleapis.com/drive/v3/files?q=name='${fileName}'&fields=files(id,name)`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const searchData = await searchResponse.json();
  
  if (searchData.files && searchData.files.length > 0) {
    const fileId = searchData.files[0].id;
    const contentResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return contentResponse.json();
  }
  
  return null;
};
