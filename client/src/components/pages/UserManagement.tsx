import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { getAvatarLink, getMonthList } from '@/lib/utils';
import { createContribution } from '@/services/contribution';
import Loader from './Loader';
import { getUserById, getUsers, type User } from '@/services/user';
import { updateMembershipDate } from '@/services/user';
import { getContributionsByUser } from '@/services/contribution';
import type { Contribution } from '@/services/contribution';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import UserContribution from './UserContribution';
import { SquareArrowLeft, Search } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';

export default function UserManagement() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [month, setMonth] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [amount, setAmount] = useState('100');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [tab, setTab] = useState('contribution');
  const [membershipDate, setMembershipDate] = useState<Date | undefined>(
    new Date(2024, 11, 1) // December 1, 2024 (month is 0-indexed)
  );
  const [membershipLoading, setMembershipLoading] = useState(false);
  const [membershipSuccess, setMembershipSuccess] = useState('');
  const [membershipError, setMembershipError] = useState('');
  const [userContributions, setUserContributions] = useState<Contribution[]>(
    []
  );
  
  // Autocomplete state
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const fetchUserContributions = (uid: string) => {
    getContributionsByUser(uid).then(setUserContributions);
  };

  const fetchAllUsers = async () => {
    try {
      const users = await getUsers();
      setAllUsers(users);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleUserSelect = (selectedUser: User) => {
    setSearchOpen(false);
    setSearchValue('');
    // Update URL param and navigate to the selected user
    navigate(`/admin/user/${selectedUser._id}`);
  };

  const filteredUsers = allUsers.filter(u => 
    u.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    u.mobile.includes(searchValue)
  );

  useEffect(() => {
    // Fetch all users for autocomplete
    fetchAllUsers();
    
    if (!userId) return;
    getUserById(userId).then(data => {
      setUser(data);
      if (data.membershipDate) {
        setMembershipDate(new Date(data.membershipDate));
      } else {
        // Keep the default December 2024 date if user has no membership date
        setMembershipDate(new Date(2024, 11, 1));
      }
    });
    // Set default month and year to current
    const now = new Date();
    setMonth(getMonthList()[now.getMonth()]);
    setYear(now.getFullYear().toString());
    // Fetch user contributions
    fetchUserContributions(userId);
  }, [userId]);

  const refreshUserContributions = () => {
    if (userId) fetchUserContributions(userId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      if (!userId) throw new Error('User ID is required');
      await createContribution({
        userId,
        contributionDate: new Date(`${year}-${month}-02`),
        amount: Number(amount),
      });
      setSuccess('Contribution added successfully!');
      setAmount('100');
      refreshUserContributions();
    } catch {
      setError('Failed to add contribution.');
    } finally {
      setLoading(false);
    }
  };

  const handleMembershipUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMembershipLoading(true);
    setMembershipSuccess('');
    setMembershipError('');
    try {
      if (!userId || !membershipDate)
        throw new Error('User ID and date required');
      await updateMembershipDate(userId, membershipDate);
      setMembershipSuccess('Membership date updated!');
      setUser(prev => (prev ? { ...prev, membershipDate } : prev));
    } catch {
      setMembershipError('Failed to update membership date.');
    } finally {
      setMembershipLoading(false);
    }
  };

  const isContributionFormValid = month && year && amount;

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 bg-white dark:bg-gray-900 rounded shadow">
      <div className="flex flex-col sm:flex-row gap-4 mb-4 items-start sm:items-center">
        <Button
          variant="outline"
          className="max-w-md"
          onClick={() => navigate('/dashboard')}
        >
          Back to Dashboard <SquareArrowLeft />
        </Button>
        
        <div className="flex-1 max-w-md">
          <Popover open={searchOpen} onOpenChange={setSearchOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={searchOpen}
                className="w-full justify-between"
              >
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  <span className="text-sm text-muted-foreground">
                    Search users by name or mobile...
                  </span>
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput
                  placeholder="Type name or mobile number..."
                  value={searchValue}
                  onValueChange={setSearchValue}
                />
                <CommandList>
                  <CommandEmpty>No users found.</CommandEmpty>
                  <CommandGroup>
                    {filteredUsers.map((user) => (
                      <CommandItem
                        key={user._id}
                        onSelect={() => handleUserSelect(user)}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <img
                            src={user.profileUrl || getAvatarLink(user.name)}
                            alt={user.name}
                            className="w-8 h-8 rounded-full object-cover border border-gray-300 dark:border-gray-600 flex-shrink-0"
                          />
                          <div className="flex-1">
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {user.mobile}
                            </div>
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      {user ? (
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center sm:items-start">
          <img
            src={user.profileUrl || getAvatarLink(user.name)}
            alt={''}
            className="w-20 h-20 rounded-full object-cover border border-gray-300 dark:border-gray-700"
          />
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-1 text-gray-800 dark:text-gray-100">
              {user.name}
            </h2>
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
              Mobile: {user.mobile}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
              Father: {user.fatherName}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
              Role: <span className="capitalize">{user.role}</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
              Verified: {user.verified ? 'Yes' : 'No'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
              Membership:{' '}
              {user.membershipDate
                ? new Date(user.membershipDate).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : '-'}
            </div>
          </div>
        </div>
      ) : (
        <Loader text="Loading user details..." />
      )}
      <Tabs
        defaultValue="contribution"
        value={tab}
        onValueChange={setTab}
        className="w-full"
      >
        <TabsList className="w-full bg-muted border border-border rounded-t-lg flex justify-center gap-2 p-1 dark:bg-zinc-900 dark:border-zinc-700">
          <TabsTrigger
            value="contribution"
            className="flex-1 min-w-0 cursor-pointer"
          >
            Contribution
          </TabsTrigger>
          <TabsTrigger
            value="membership"
            className="flex-1 min-w-0 cursor-pointer"
          >
            Membership
          </TabsTrigger>
        </TabsList>
        <TabsContent
          value="contribution"
          className="border border-border border-t-0 rounded-b-lg bg-background shadow-sm p-4 dark:bg-zinc-900 dark:border-zinc-700 w-full"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Month</label>
              <select
                className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={month}
                onChange={e => setMonth(e.target.value)}
                required
              >
                {getMonthList().map(m => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1 font-medium">Year</label>
              <input
                type="number"
                className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                value={year}
                onChange={e => setYear(e.target.value)}
                min="2024"
                max={new Date().getFullYear()}
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Amount</label>
              <input
                type="number"
                className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                min="1"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={loading || !isContributionFormValid}
              className="w-full"
            >
              {loading ? <Loader text="Saving..." /> : 'Add Contribution'}
            </Button>
            {success && (
              <div className="text-green-600 font-semibold">{success}</div>
            )}
            {error && <div className="text-red-600 font-semibold">{error}</div>}
          </form>
          <div className="mt-8">
            <UserContribution
              contributions={userContributions}
              showHeader
              headerText="User Contributions"
              enableDelete={true}
            />
          </div>
        </TabsContent>
        <TabsContent
          value="membership"
          className="border border-border border-t-0 rounded-b-lg bg-background shadow-sm p-4 dark:bg-zinc-900 dark:border-zinc-700 w-full"
        >
          <form onSubmit={handleMembershipUpdate} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Membership Date</label>
              <Calendar
                mode="single"
                selected={membershipDate}
                onSelect={setMembershipDate}
                defaultMonth={membershipDate || new Date(2024, 11, 1)}
                className="w-full bg-white dark:bg-gray-800 rounded"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={membershipLoading || !membershipDate}
              className="w-full"
            >
              {membershipLoading ? (
                <Loader text="Saving..." />
              ) : (
                'Update Membership Date'
              )}
            </Button>
            {membershipSuccess && (
              <div className="text-green-600 font-semibold">
                {membershipSuccess}
              </div>
            )}
            {membershipError && (
              <div className="text-red-600 font-semibold">
                {membershipError}
              </div>
            )}
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
