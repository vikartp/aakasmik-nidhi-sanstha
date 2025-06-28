import React, { useState } from 'react';
import { UploadScreenshot } from './UploadScreenshot';
import Member from './Member';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
import { HomeIcon } from 'lucide-react';

const DashboardCommonSection: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const handleRefresh = () => setRefreshKey(k => k + 1);
  const navigate = useNavigate();

  return (
    <>
      <UploadScreenshot onUploadSuccess={handleRefresh} />
      <Member refreshKey={refreshKey} />
      <div className="flex justify-center mt-4">
        <Button className="text-center max-w-md" onClick={() => navigate('/')}>
          Go to Home Page <HomeIcon />
        </Button>
      </div>
    </>
  );
};

export default DashboardCommonSection;
