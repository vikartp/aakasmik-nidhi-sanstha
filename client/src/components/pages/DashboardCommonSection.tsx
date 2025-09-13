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

    // More specific desktop detection: Only hide on desktop browsers with large screens
    const isDesktopBrowser = 
      (/Windows|Macintosh|Linux/.test(userAgent) && 
       /Chrome|Firefox|Safari|Edge|Opera/.test(userAgent) &&
       !userAgent.includes('Mobile') &&
       !userAgent.includes('Android') &&
       !userAgent.includes('iPhone') &&
       !userAgent.includes('iPad') &&
       !userAgent.includes('wv') &&
       !userAgent.includes('WebView') &&
       window.top === window.self && // Not in iframe
       window.screen.width >= 1024); // Desktop screen size

    // Show the browser link unless it's clearly a desktop browser
    return !isDesktopBrowser;
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
