import React, { useState } from 'react';
import { UploadScreenshot } from './UploadScreenshot';
import Member from './Member';

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
    </>
  );
};

export default DashboardCommonSection;
