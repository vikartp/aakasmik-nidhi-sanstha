import React, { useState, useMemo } from 'react';
import { UploadScreenshot } from './UploadScreenshot';
import Member from './Member';

const DashboardCommonSection: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const handleRefresh = () => setRefreshKey(k => k + 1);

  // Detect if running in Expo embedded webview (not in browser)
  const isInExpoWebView = useMemo(() => {
    if (typeof window === 'undefined') return false;

    const userAgent = navigator.userAgent;

    // Check for Expo-specific indicators
    const isExpo = userAgent.includes('Expo');

    // Check for mobile webview indicators
    const isWebView =
      /wv|WebView|Android.*Version.*Chrome|iPhone.*Version.*Mobile.*Safari/.test(
        userAgent
      );

    // Check if not in standalone browser (iframe or embedded)
    const isEmbedded = window.top !== window.self;

    // Check if not a PWA
    const isPWA =
      (window.navigator as { standalone?: boolean }).standalone === true ||
      window.matchMedia('(display-mode: standalone)').matches;

    // Show browser link if it's Expo, webview, embedded, or not a PWA
    return isExpo || isWebView || isEmbedded || !isPWA;
  }, []);

  // Set button state in UploadScreenshot based on status of this month's screenshot
  const [currentMonthStatus, setCurrentMonthStatus] = useState<
    'pending' | 'none' | 'verified' | 'rejected'
  >('none');
  const handleStatusChange = (
    status: 'pending' | 'none' | 'verified' | 'rejected'
  ) => {
    setCurrentMonthStatus(status);
  };

  return (
    <>
      <UploadScreenshot
        status={currentMonthStatus}
        onUploadSuccess={handleRefresh}
      />
      <Member refreshKey={refreshKey} onFetchStatus={handleStatusChange} />

      {isInExpoWebView && (
        <div
          style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#e3f2fd',
            borderRadius: '8px',
            textAlign: 'center',
            border: '1px solid #bbdefb',
          }}
        >
          <p
            style={{ marginBottom: '10px', fontSize: '16px', color: '#1565c0' }}
          >
            यदि आप पोर्टल को ब्राउज़र में खोलना चाहते हैं, तो कृपया नीचे क्लिक
            करें
          </p>
          <a
            href="https://aakasmiknidhi.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '5px',
              fontSize: '14px',
              fontWeight: 'bold',
            }}
          >
            ब्राउज़र में खोलें (Open in Browser)
          </a>
        </div>
      )}
    </>
  );
};

export default DashboardCommonSection;
