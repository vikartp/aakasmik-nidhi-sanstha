import React, { useState } from 'react';
import { UploadScreenshot } from './UploadScreenshot';
import Member from './Member';

const DashboardCommonSection: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const handleRefresh = () => setRefreshKey(k => k + 1);

  return (
    <>
      <UploadScreenshot onUploadSuccess={handleRefresh} />
      <Member refreshKey={refreshKey} />
    </>
  );
};

export default DashboardCommonSection;
