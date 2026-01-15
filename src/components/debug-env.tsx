'use client';

export function DebugEnv() {
  if (typeof window === 'undefined') return null;
  
  const envVars = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '***configured***' : undefined,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  };

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: 10, 
      right: 10, 
      background: 'black', 
      color: 'lime', 
      padding: '10px', 
      fontSize: '10px',
      maxWidth: '300px',
      zIndex: 99999,
      fontFamily: 'monospace'
    }}>
      <div><strong>ENV Debug:</strong></div>
      <pre>{JSON.stringify(envVars, null, 2)}</pre>
    </div>
  );
}
