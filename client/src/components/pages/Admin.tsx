import { useAuth } from '@/context/AuthContext';
import { ScreenshotTable } from './ScreenshotTable';
import UserTable from './UserTable';
import { useEffect, useState } from 'react';
import UserSecret from './UserSecret';
import { Combobox } from './Combobox';
import type { ComboboxOption } from './Combobox';
import { getMonthList } from '@/lib/utils';
import type { Month } from '@/services/screenshot';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
      <Tabs
        defaultValue="users"
        className="w-full max-w-full px-0 sm:px-2 md:px-4"
      >
        <TabsList className="w-full bg-muted border border-border rounded-t-lg flex justify-center gap-2 p-1 dark:bg-zinc-900 dark:border-zinc-700">
          <TabsTrigger value="users" className="flex-1 min-w-0 cursor-pointer">
            Users
          </TabsTrigger>
          <TabsTrigger value="screenshots" className="flex-1 min-w-0 cursor-pointer">
            Screenshots
          </TabsTrigger>
          <TabsTrigger value="secret" className="flex-1 min-w-0 cursor-pointer">
            Secrets
          </TabsTrigger>
        </TabsList>
        <TabsContent
          value="users"
          className="border border-border border-t-0 rounded-b-lg bg-background shadow-sm p-4 sm:p-6 dark:bg-zinc-900 dark:border-zinc-700 w-full"
        >
          <UserTable role={user?.role} />
        </TabsContent>
        <TabsContent
          value="screenshots"
          className="border border-border border-t-0 rounded-b-lg bg-background shadow-sm p-4 sm:p-6 dark:bg-zinc-900 dark:border-zinc-700 w-full"
        >
          <Combobox<Month>
            frameworks={frameworks}
            frameType="Month"
            onValueChange={handleValueChange}
          />
          <p className="text-lg mt-4">
            You can click on <strong>View</strong> to see the details and verify
            that.
          </p>
          <ScreenshotTable role={user?.role} month={selectedMonth} />
        </TabsContent>
        <TabsContent
          value="secret"
          className="border border-border border-t-0 rounded-b-lg bg-background shadow-sm p-4 sm:p-6 dark:bg-zinc-900 dark:border-zinc-700 w-full"
        >
          <UserSecret />
        </TabsContent>
      </Tabs>
    </>
  );
}
