import React, { useState } from 'react';
import { UploadScreenshot } from './UploadScreenshot';
import Member from './Member';
import { ExternalLink } from 'lucide-react';

const DashboardCommonSection: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const handleRefresh = () => setRefreshKey(k => k + 1);

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

      <div className="mt-4 py-1 text-center">
        <p className="mb-0.5 text-sm text-gray-200">
          यदि आप वर्तमान में ANidhi एप्लिकेशन में हैं और पोर्टल को ब्राउज़र में खोलना चाहते हैं, तो कृपया नीचे क्लिक करें
        </p>
        <a
          href="https://aakasmiknidhi.netlify.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-transparent text-blue-500 underline rounded text-sm font-medium"
        >
          <ExternalLink size={20} />
          ब्राउज़र में खोलें (Open in Browser)
        </a>
      </div>
    </>
  );
};

export default DashboardCommonSection;
