import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { getMonthlyAggregation } from '@/services/contribution';

export default function MonthlyContributionChart() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState<number>(currentYear);
  const [data, setData] = useState<{ month: string; totalAmount: number }[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(true);

  // Generate options for year (from 2024 to currentYear)
  const yearOptions = Array.from(
    { length: Math.max(1, currentYear - 2024 + 1) },
    (_, i) => 2024 + i
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await getMonthlyAggregation(year);
        setData(result);
      } catch (error) {
        console.error('Failed to fetch monthly aggregation:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [year]);

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 mb-6 overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2 leading-tight">
          <div className="bg-blue-100 dark:bg-blue-900/50 p-1.5 rounded-lg">
            <svg
              className="w-4 h-4 text-blue-600 dark:text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              ></path>
            </svg>
          </div>
          <span className="truncate">योगदान चार्ट</span>
        </h2>
        <div className="flex-shrink-0">
          <select
            value={year}
            onChange={e => setYear(Number(e.target.value))}
            className="appearance-none border border-gray-200 dark:border-gray-600 rounded-xl py-1.5 pl-3 pr-8 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-semibold shadow-sm bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%236b7280%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px_10px] bg-no-repeat bg-[position:right_10px_center]"
          >
            {yearOptions.map(y => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="h-64 w-full mt-2 -ml-2">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-blue-500"></div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                Loading...
              </p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 5,
                right: 0,
                left: -20,
                bottom: 15,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f3f4f6"
                className="dark:stroke-gray-700/50"
              />
              <XAxis
                dataKey="month"
                stroke="#9ca3af"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickMargin={12}
                angle={-60}
                textAnchor="end"
                interval={0}
                className="font-medium"
              />
              <YAxis
                stroke="#9ca3af"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={value =>
                  value >= 1000 ? `₹${value / 1000}k` : `₹${value}`
                }
                tickMargin={4}
                className="font-medium"
              />
              <Tooltip
                cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                contentStyle={{
                  borderRadius: '12px',
                  border: '1px solid rgba(229, 231, 235, 0.5)',
                  boxShadow:
                    '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                  padding: '8px 12px',
                  fontSize: '12px',
                  fontWeight: '600',
                }}
                itemStyle={{ color: '#1f2937', padding: 0 }}
                labelStyle={{
                  color: '#6b7280',
                  marginBottom: '4px',
                  fontSize: '11px',
                  textTransform: 'uppercase',
                }}
                formatter={(value: any) => [
                  `₹${Number(value).toLocaleString('en-IN')}`,
                  'Amount',
                ]}
              />
              <Bar
                dataKey="totalAmount"
                fill="url(#colorBlue)"
                radius={[6, 6, 2, 2]}
                barSize={20}
                animationDuration={1000}
              />
              <defs>
                <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                  <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.8} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
