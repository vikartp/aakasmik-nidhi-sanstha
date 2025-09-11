import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, ScrollView, View, Text, Image, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import ApiService, { User, Contribution, Screenshot } from '@/services/api';
import { getAvatarLink } from '@/utils/avatarUtils';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function MonthlyStatusTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [screenshots, setScreenshots] = useState<Record<string, Screenshot>>({});
  const [contributions, setContributions] = useState<Record<string, Contribution>>({});
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>(MONTHS[new Date().getMonth()]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [overallTotal, setOverallTotal] = useState<number>(0);

  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  const currentYear = new Date().getFullYear();
  const startYear = 2024;
  const yearList = Array.from({ length: currentYear - startYear + 1 }, (_, i) => startYear + i);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch all verified users
      const allUsers = await ApiService.getAllUsers();
      const verifiedUsers = allUsers.filter((user: User) => user.verified);
      verifiedUsers.sort((a: User, b: User) => a.name.localeCompare(b.name));
      setUsers(verifiedUsers);

      // Fetch screenshots for the month
      const screenshotsData = await ApiService.getScreenshotsByMonth(selectedMonth);
      const screenshotsMap: Record<string, Screenshot> = {};
      screenshotsData.forEach((screenshot: Screenshot) => {
        screenshotsMap[screenshot.userId] = screenshot;
      });
      setScreenshots(screenshotsMap);

      // Fetch contributions for the month and year
      const contributionsData = await ApiService.getContributionsByYearAndMonth(selectedYear, selectedMonth);
      const contributionsMap: Record<string, Contribution> = {};
      contributionsData.forEach((contribution: Contribution) => {
        contributionsMap[contribution.userId] = contribution;
      });
      setContributions(contributionsMap);

      // Fetch overall total contributions
      try {
        const totalAmount = await ApiService.getTotalContributions();
        setOverallTotal(totalAmount);
      } catch (totalError) {
        console.error('Error fetching total contributions:', totalError);
        // Don't show error to user, just set total to 0
        setOverallTotal(0);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load status data');
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getStatusInfo = (userId: string) => {
    const contribution = contributions[userId];
    if (contribution) {
      return {
        status: 'Paid',
        amount: `₹${contribution.amount.toLocaleString('en-IN')}`,
        verifiedBy: contribution.verifiedBy || '-',
        color: '#22c55e', // green
        bgColor: 'rgba(34, 197, 94, 0.1)',
      };
    }

    const screenshot = screenshots[userId];
    if (screenshot && selectedYear === new Date().getFullYear()) {
      return {
        status: 'Pending',
        amount: '-',
        verifiedBy: '-',
        color: '#f59e0b', // yellow
        bgColor: 'rgba(245, 158, 11, 0.1)',
      };
    }

    return {
      status: 'Due',
      amount: '-',
      verifiedBy: '-',
      color: '#ef4444', // red
      bgColor: 'rgba(239, 68, 68, 0.1)',
    };
  };

  const getTotalAmount = () => {
    return users.reduce((sum, user) => {
      const contribution = contributions[user._id];
      return sum + (contribution ? contribution.amount : 0);
    }, 0);
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={tintColor} />
        <ThemedText style={styles.loadingText}>Loading status data...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <ThemedView style={styles.header}>
        <ThemedText style={styles.title}>मासिक भुगतान स्थिति</ThemedText>
        <ThemedText style={styles.subtitle}>Monthly Payment Status</ThemedText>
      </ThemedView>

      {/* Month/Year Selectors */}
      <ThemedView style={styles.filtersContainer}>
        <ThemedView style={styles.filterGroup}>
          <ThemedText style={styles.filterLabel}>Month</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.monthScroll}>
            {MONTHS.map((month) => (
              <TouchableOpacity
                key={month}
                style={[
                  styles.monthButton,
                  selectedMonth === month && { backgroundColor: tintColor }
                ]}
                onPress={() => setSelectedMonth(month)}
              >
                <Text style={[
                  styles.monthButtonText,
                  { color: selectedMonth === month ? '#fff' : textColor }
                ]}>
                  {month.substring(0, 3)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </ThemedView>

        <ThemedView style={styles.filterGroup}>
          <ThemedText style={styles.filterLabel}>Year</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.yearScroll}>
            {yearList.map((year) => (
              <TouchableOpacity
                key={year}
                style={[
                  styles.yearButton,
                  selectedYear === year && { backgroundColor: tintColor }
                ]}
                onPress={() => setSelectedYear(year)}
              >
                <Text style={[
                  styles.yearButtonText,
                  { color: selectedYear === year ? '#fff' : textColor }
                ]}>
                  {year}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </ThemedView>
      </ThemedView>

      {/* Table */}
      <View style={styles.tableWrapper}>
        <ScrollView 
          style={styles.tableContainer} 
          showsVerticalScrollIndicator={true}
          nestedScrollEnabled={true}
        >
        {/* Table Header */}
        <ThemedView style={[styles.tableRow, styles.tableHeader, { backgroundColor: tintColor }]}>
          <Text style={[styles.headerCell, styles.photoColumn]}>Photo</Text>
          <Text style={[styles.headerCell, styles.nameColumn]}>Name</Text>
          <Text style={[styles.headerCell, styles.statusColumn]}>Status</Text>
          <Text style={[styles.headerCell, styles.amountColumn]}>Amount</Text>
        </ThemedView>

        {/* Table Body */}
        {users.map((user, index) => {
          const statusInfo = getStatusInfo(user._id);
          return (
            <ThemedView 
              key={user._id} 
              style={[
                styles.tableRow,
                index % 2 === 0 && styles.evenRow
              ]}
            >
              <View style={styles.photoColumn}>
                <Image
                  source={{ uri: user.profileUrl || getAvatarLink(user.name, 40) }}
                  style={styles.profilePhoto}
                />
              </View>
              <View style={styles.nameColumn}>
                <Text style={[styles.nameText, { color: textColor }]}>{user.name}</Text>
                <Text style={[styles.mobileText, { color: textColor }]}>{user.mobile}</Text>
              </View>
              <View style={styles.statusColumn}>
                <View style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
                  <Text style={[styles.statusText, { color: statusInfo.color }]}>
                    {statusInfo.status}
                  </Text>
                </View>
              </View>
              <View style={styles.amountColumn}>
                <Text style={[styles.amountText, { color: textColor }]}>{statusInfo.amount}</Text>
              </View>
            </ThemedView>
          );
        })}
        </ScrollView>
      </View>

      {/* Total Summary */}
      <ThemedView style={[styles.summaryContainer, { backgroundColor: tintColor + '20' }]}>
        <ThemedText style={styles.summaryText}>
          सदस्यों द्वारा {selectedMonth} - {selectedYear} का कुल योगदान राशि:
        </ThemedText>
        <ThemedText style={[styles.totalAmount, { color: tintColor }]}>
          ₹{getTotalAmount().toLocaleString('en-IN')}
        </ThemedText>
      </ThemedView>

      {/* Overall Total Contribution */}
      {overallTotal > 0 && (
        <ThemedView style={[styles.overallTotalContainer, { backgroundColor: '#22c55e20' }]}>
          <ThemedText style={styles.overallTotalTitle}>
            अब तक कुल योगदान राशि
          </ThemedText>
          <ThemedText style={[styles.overallTotalAmount, { color: '#22c55e' }]}>
            ₹{overallTotal.toLocaleString('en-IN')}
          </ThemedText>
          <ThemedText style={styles.overallTotalSubtext}>
            (यह अब तक सभी सदस्यों द्वारा दिया गया कुल योगदान है।)
          </ThemedText>
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    opacity: 0.7,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  filterGroup: {
    gap: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.8,
  },
  monthScroll: {
    flexDirection: 'row',
  },
  monthButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
  },
  monthButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  yearScroll: {
    flexDirection: 'row',
  },
  yearButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
  },
  yearButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tableWrapper: {
    flex: 1,
  },
  tableContainer: {
    maxHeight: 460, // Increased height for better viewing
    paddingHorizontal: 16,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 128, 128, 0.1)',
  },
  tableHeader: {
    paddingVertical: 16,
    borderBottomWidth: 2,
  },
  evenRow: {
    backgroundColor: 'rgba(128, 128, 128, 0.05)',
  },
  headerCell: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  photoColumn: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameColumn: {
    flex: 2,
    paddingLeft: 8,
    justifyContent: 'center',
  },
  statusColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profilePhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  nameText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  mobileText: {
    fontSize: 12,
    opacity: 0.7,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  amountText: {
    fontSize: 14,
    fontWeight: '600',
  },
  summaryContainer: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    alignItems: 'center',
    gap: 8,
  },
  summaryText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  overallTotalContainer: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    alignItems: 'center',
    gap: 8,
  },
  overallTotalTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  overallTotalAmount: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  overallTotalSubtext: {
    fontSize: 12,
    opacity: 0.8,
    textAlign: 'center',
    lineHeight: 16,
  },
});
