import { useEffect, useState } from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '../ui/table';
import Loader from './Loader';
import type { Contribution } from '@/services/contribution';
import { getUsers, type User } from '@/services/user';
import {
  getScreenshotsByMonth,
  type Month,
  type Screenshot,
} from '@/services/screenshot';
import { getContributionsByYearAndMonth } from '@/services/contribution';
import { getAvatarLink, getMonthList } from '@/lib/utils';
import { toast } from 'react-toastify';
import {
  HandCoins,
  IndianRupee,
  Download,
  FileSpreadsheet,
  FileText,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import 'jspdf-autotable';
import { Button } from '../ui/button';

// Register the plugin
(
  jsPDF as typeof jsPDF & { API: { autoTable: typeof autoTable } }
).API.autoTable = autoTable;

export default function MonthlyStatusTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [screenshots, setScreenshots] = useState<
    Record<string, Screenshot | undefined>
  >({});
  const [contributions, setContributions] = useState<
    Record<string, Contribution | undefined>
  >({});
  const [loading, setLoading] = useState(true);

  const monthList = getMonthList();
  const currentYear = new Date().getFullYear();
  const yearList = Array.from({ length: currentYear - 2024 + 1 }, (_, i) =>
    (2024 + i).toString()
  );
  const [selectedMonth, setSelectedMonth] = useState<string>(
    monthList[new Date().getMonth()]
  );
  const [selectedYear, setSelectedYear] = useState<string>(
    currentYear.toString()
  );

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getUsers(),
      getScreenshotsByMonth(selectedMonth as Month),
      getContributionsByYearAndMonth(Number(selectedYear), selectedMonth),
    ])
      .then(([userList, allScreenshots, monthContributions]) => {
        const verifiedUsers = userList.filter((u: User) => u.verified);
        // Sort users alphabetically by name
        verifiedUsers.sort((a: User, b: User) => a.name.localeCompare(b.name));
        setUsers(verifiedUsers);
        // Map screenshots by userId (one per user per month)
        const screenshotsMap: Record<string, Screenshot> = {};
        allScreenshots.forEach((shot: Screenshot) => {
          screenshotsMap[shot.userId] = shot;
        });
        setScreenshots(screenshotsMap);
        // Map contributions by userId (one per user per month)
        const contributionsMap: Record<string, Contribution> = {};
        monthContributions.forEach((contrib: Contribution) => {
          contributionsMap[contrib.userId] = contrib;
        });
        setContributions(contributionsMap);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        toast.error('Failed to load monthly status data.');
      });
  }, [selectedMonth, selectedYear]);

  // Helper to get status and amount for a user
  const getStatusAndAmount = (userId: string) => {
    const contrib = contributions[userId];
    if (contrib) {
      return {
        status: 'Paid',
        amount: contrib.amount,
        verifiedBy: contrib.verifiedBy || '-',
        color: 'bg-green-100 text-green-800',
      };
    }
    const userScreenshot = screenshots[userId];
    if (userScreenshot && Number(selectedYear) === new Date().getFullYear()) {
      return {
        status: 'Pending',
        amount: '-',
        verifiedBy: '-',
        color: 'bg-yellow-100 text-yellow-800',
      };
    }
    return {
      status: 'Due',
      amount: '-',
      verifiedBy: '-',
      color: 'bg-red-100 text-red-800',
    };
  };

  // Prepare table data for export (excluding profile pic)
  const getExportRows = () => {
    return users.map(user => {
      const { status, amount, verifiedBy } = getStatusAndAmount(user._id);
      return {
        Name: user.name,
        Status: status,
        Amount: amount,
        'Verified By': verifiedBy,
        Mobile: user.mobile || '-',
        "Father's Name": user.fatherName || '-',
      };
    });
  };

  const getExportFileName = (ext: string) => {
    return `Aakasmik-Nidhi-${selectedYear}-${selectedMonth}.${ext}`;
  };

  const exportToExcel = () => {
    const exportRows = getExportRows();
    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    // Calculate dynamic column widths
    const cols = Object.keys(exportRows[0] || {}).map(col => {
      const maxLen = Math.max(
        col.length,
        ...exportRows.map(
          row => String((row as Record<string, unknown>)[col] ?? '').length
        )
      );
      return { wch: maxLen + 2 }; // +2 for padding
    });
    worksheet['!cols'] = cols;
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, getExportFileName('xlsx'));
  };

  const exportToPDF = () => {
    const exportRows = getExportRows();
    if (!exportRows.length) {
      toast.error('No data to export.');
      return;
    }
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'pt',
      format: 'A4',
    });
    const tableColumn = Object.keys(exportRows[0]);
    const tableRows = exportRows.map(row =>
      tableColumn.map(col =>
        String((row as Record<string, unknown>)[col] ?? '')
      )
    );

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: 'striped',
      styles: { fontSize: 10, cellPadding: 4 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      margin: { left: 20, right: 20 },
      didDrawPage: function () {
        doc.setFontSize(16);
        doc.setTextColor(40, 128, 185);
        doc.text(
          `Aakasmik Nidhi Status - ${selectedMonth} ${selectedYear} => Generated on: ${getTodayDate()}`,
          doc.internal.pageSize.getWidth() / 2,
          30,
          { align: 'center' }
        );
      },
    });
    doc.save(getExportFileName('pdf'));
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="mt-8 flex flex-col items-center w-full">
      {/* Month/Year Selectors Row */}
      <h1 className="flex items-center justify-center text-2xl font-extrabold mb-4 text-center bg-gradient-to-r from-green-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent drop-shadow-lg dark:from-green-300 dark:via-blue-400 dark:to-indigo-400 py-2 rounded-xl shadow-md gap-2 select-none">
        <span className="inline-flex items-center bg-white/70 dark:bg-gray-900/70 rounded-full px-2 py-1 mr-2 shadow-sm">
          <HandCoins className="text-green-600 dark:text-green-400 w-7 h-7" />
        </span>
        <span className="">Monthly Contribution Status</span>
        <span className="inline-flex items-center bg-white/70 dark:bg-gray-900/70 rounded-full px-2 py-1 ml-2 shadow-sm">
          <IndianRupee className="text-blue-600 dark:text-blue-400 w-7 h-7" />
        </span>
      </h1>
      <div className="flex flex-row items-center gap-6 mb-4 w-full max-w-2xl justify-center bg-gradient-to-r from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-xl py-4 shadow-md">
        <div className="flex flex-col items-start">
          <label
            htmlFor="month-select"
            className="text-sm font-semibold mb-1 text-gray-700 dark:text-gray-200 tracking-wide drop-shadow"
          >
            Month
          </label>
          <select
            id="month-select"
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="w-48 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600 text-base bg-white dark:bg-gray-900 dark:text-white shadow-sm transition-all duration-200 hover:border-blue-400 dark:hover:border-blue-400"
          >
            {monthList.map(month => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col items-start">
          <label
            htmlFor="year-select"
            className="text-sm font-semibold mb-1 text-gray-700 dark:text-gray-200 tracking-wide drop-shadow"
          >
            Year
          </label>
          <select
            id="year-select"
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value)}
            className="w-36 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400 dark:focus:ring-green-600 text-base bg-white dark:bg-gray-900 dark:text-white shadow-sm transition-all duration-200 hover:border-green-400 dark:hover:border-green-400"
          >
            {yearList.map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded border w-full max-w-full overflow-x-auto">
        {loading ? (
          <Loader />
        ) : (
          <div
            className="w-full"
            style={{ maxHeight: 500, minHeight: 200, overflowY: 'auto' }}
          >
            <Table className="min-w-[600px] w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Photo</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Verified By</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Father's Name</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map(user => {
                  const { status, amount, color, verifiedBy } =
                    getStatusAndAmount(user._id);
                  return (
                    <TableRow key={user._id}>
                      <TableCell>
                        <img
                          src={user.profileUrl || getAvatarLink(user.name)}
                          alt={''}
                          className="w-10 h-10 rounded-full object-cover border border-gray-300"
                          style={{ minWidth: 32, minHeight: 32 }}
                        />
                      </TableCell>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-block px-3 py-1 rounded-full font-semibold text-xs ${color}`}
                        >
                          {status}
                        </span>
                      </TableCell>
                      <TableCell>{amount}</TableCell>
                      <TableCell>{verifiedBy}</TableCell>
                      <TableCell>{user.mobile || '-'}</TableCell>
                      <TableCell>{user.fatherName || '-'}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
      {/* Download buttons below the table */}
      {!loading && (
        <>
          <div className="flex flex-col sm:flex-row gap-3 mt-6 items-center">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 sm:mb-0">
              <Download className="w-4 h-4" />
              Export Data:
            </div>
            <div className="flex gap-3">
              <Button
                onClick={exportToExcel}
                variant="outline"
                className="bg-green-50 hover:bg-green-100 border-green-300 text-green-700 hover:text-green-800 dark:bg-green-900/20 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-900/30 dark:hover:text-green-300 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <FileSpreadsheet className="w-4 h-4 mr-1" />
                Download Excel
              </Button>
              <Button
                onClick={exportToPDF}
                variant="outline"
                className="bg-red-50 hover:bg-red-100 border-red-300 text-red-700 hover:text-red-800 dark:bg-red-900/20 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/30 dark:hover:text-red-300 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <FileText className="w-4 h-4 mr-1" />
                Download PDF
              </Button>
            </div>
          </div>
          <div className="mt-6 p-4 bg-gradient-to-r from-green-50 via-blue-50 to-indigo-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 rounded-xl border border-green-200 dark:border-gray-600 shadow-lg">
            <div className="flex items-center justify-center gap-3">
              <IndianRupee className="w-6 h-6 text-green-600 dark:text-green-400" />
              <p className="text-lg font-semibold text-gray-800 dark:text-gray-200 text-center">
                सदस्यों द्वारा{' '}
                <span className="text-blue-600 dark:text-blue-400 font-bold">{`${selectedMonth} - ${selectedYear}`}</span>{' '}
                का कुल योगदान राशि:
                <span className="ml-2 inline-flex items-center px-3 py-1 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 rounded-full font-bold text-xl border border-green-300 dark:border-green-600">
                  ₹{' '}
                  {users
                    .reduce((sum, user) => {
                      const contrib = contributions[user._id];
                      return sum + (contrib ? contrib.amount : 0);
                    }, 0)
                    .toLocaleString('en-IN')}
                </span>
              </p>
              <IndianRupee className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
