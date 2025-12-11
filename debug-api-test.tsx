import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";

const DebugApiTest: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<{
    envVarExists: boolean;
    envVarValue: string | null;
    processEnvKeys: string[];
    apiKeyFirst10: string | null;
    connectionTest: string | null;
  }>({
    envVarExists: false,
    envVarValue: null,
    processEnvKeys: [],
    apiKeyFirst10: null,
    connectionTest: null
  });

  useEffect(() => {
    // Check environment variables
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const apiKey = process.env.API_KEY;
    const allEnvKeys = Object.keys(process.env || {}).filter(key => 
      key.includes('GEMINI') || key.includes('API')
    );
    
    setDebugInfo(prev => ({
      ...prev,
      envVarExists: !!(geminiApiKey || apiKey),
      envVarValue: geminiApiKey || apiKey || 'undefined',
      processEnvKeys: allEnvKeys,
      apiKeyFirst10: (geminiApiKey || apiKey)?.substring(0, 10) || null
    }));

    // Test API connection
    const testApiConnection = async () => {
      try {
        const keyToUse = geminiApiKey || apiKey;
        if (!keyToUse) {
          setDebugInfo(prev => ({
            ...prev,
            connectionTest: 'ERROR: No API key found'
          }));
          return;
        }

        console.log('Testing API connection with key:', keyToUse.substring(0, 10) + '...');
        
        const genAI = new GoogleGenerativeAI(keyToUse);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        // Simple test request
        const result = await model.generateContent("Hello, please respond with 'Connection successful'");
        const response = await result.response;
        const responseText = response.text() || 'No response text';
        setDebugInfo(prev => ({
          ...prev,
          connectionTest: `SUCCESS: ${responseText}`
        }));
      } catch (error) {
        console.error('API connection test failed:', error);
        setDebugInfo(prev => ({
          ...prev,
          connectionTest: `ERROR: ${error instanceof Error ? error.message : String(error)}`
        }));
      }
    };

    if (geminiApiKey || apiKey) {
      testApiConnection();
    }
  }, []);

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#1a1a1a', 
      color: '#ffffff',
      fontFamily: 'monospace',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h1>Gemini API Debug Test</h1>
      
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#2d2d2d', borderRadius: '8px' }}>
        <h2>Environment Variables Check</h2>
        <p><strong>GEMINI_API_KEY exists:</strong> {debugInfo.envVarExists ? '✅ Yes' : '❌ No'}</p>
        <p><strong>API Key (first 10 chars):</strong> {debugInfo.apiKeyFirst10 || 'Not found'}</p>
        <p><strong>Available API-related env vars:</strong></p>
        <ul>
          {debugInfo.processEnvKeys.length > 0 ? (
            debugInfo.processEnvKeys.map(key => (
              <li key={key}>
                {key}: {process.env[key]?.substring(0, 15)}...
              </li>
            ))
          ) : (
            <li>No API-related environment variables found</li>
          )}
        </ul>
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#2d2d2d', borderRadius: '8px' }}>
        <h2>Build Time Environment Check</h2>
        <p><strong>NODE_ENV:</strong> {process.env.NODE_ENV || 'undefined'}</p>
        <p><strong>Mode:</strong> {import.meta.env.MODE || 'undefined'}</p>
        <p><strong>DEV:</strong> {import.meta.env.DEV ? 'true' : 'false'}</p>
        <p><strong>PROD:</strong> {import.meta.env.PROD ? 'true' : 'false'}</p>
        <p><strong>Vite env vars:</strong></p>
        <pre style={{ backgroundColor: '#1a1a1a', padding: '10px', borderRadius: '4px', fontSize: '12px' }}>
          {JSON.stringify(import.meta.env, null, 2)}
        </pre>
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#2d2d2d', borderRadius: '8px' }}>
        <h2>API Connection Test</h2>
        <p><strong>Result:</strong> {debugInfo.connectionTest || 'Testing...'}</p>
      </div>

      <div style={{ padding: '15px', backgroundColor: '#2d2d2d', borderRadius: '8px' }}>
        <h2>Debug Instructions</h2>
        <ol>
          <li>Check if environment variables are properly loaded in development</li>
          <li>Verify Vite configuration for environment variable exposure</li>
          <li>Test API connectivity with a simple request</li>
          <li>Check for CORS issues or network problems</li>
        </ol>
      </div>
    </div>
  );
};

export default DebugApiTest;