import { useAuth } from '@/context/AuthContext';
import { ScreenshotTable } from './ScreenshotTable';
import UserTable from './UserTable';
import { useEffect, useState } from 'react';
import UserSecret from './UserSecret';
import { Combobox } from './Combobox';
import type { ComboboxOption } from './Combobox';
import { getMonthList } from '@/lib/utils';
import type { Month } from '@/services/screenshot';

/**
 * Notes: Admin has the ability to manage members and view screenshots.
 */
export default function Admin() {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState<Month>(
    new Date().toLocaleString('default', { month: 'long' }) as Month
  );
  const frameworks: ComboboxOption<Month>[] = getMonthList().map(month => ({
    value: month as Month,
    label: month,
    selected: month === selectedMonth,
  }));

  const handleValueChange = (newValue: Month) => {
    setSelectedMonth(newValue);
  };

  useEffect(() => {});
  return (
    <>
      <div className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold mt-2">Manage Your Users</h2>
        <UserTable role={user?.role} />
        <div className="flex gap-4">
          <h2 className="text-2xl font-bold">Manage Screenshots</h2>
          <Combobox<Month>
            frameworks={frameworks}
            frameType="Month"
            onValueChange={handleValueChange}
          />
        </div>
        <p className="text-lg">
          You can click on <strong>View</strong> to see the details.
        </p>
        <ScreenshotTable role={user?.role} month={selectedMonth} />
        <UserSecret />
      </div>
    </>
  );
}
