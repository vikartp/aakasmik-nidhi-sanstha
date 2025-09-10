import React, { useEffect, useState } from 'react';
import { StyleSheet, ActivityIndicator, FlatList } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import ApiService, { Contribution } from '@/services/api';

interface ContributionTableProps {
  userId: string;
}

const ContributionTable: React.FC<ContributionTableProps> = ({ userId }) => {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContributions = async () => {
      try {
        setLoading(true);
        setError(null);
        const userContributions = await ApiService.getContributionsByUser(userId);
        setContributions(userContributions);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load contributions');
        console.error('Error fetching contributions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContributions();
  }, [userId]);

  const getMonthName = (dateString: string) => {
    const date = new Date(dateString);
    const hindiMonths = [
      'जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
      'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'
    ];
    return hindiMonths[date.getMonth()];
  };

  const getYear = (dateString: string) => {
    const date = new Date(dateString);
    return date.getFullYear().toString();
  };

  const formatAmount = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  const getTotalAmount = () => {
    return contributions.reduce((total, contribution) => total + contribution.amount, 0);
  };

  const renderContributionItem = ({ item }: { item: Contribution }) => (
    <ThemedView style={styles.tableRow}>
      <ThemedView style={styles.tableCell}>
        <ThemedText style={styles.cellText}>{getMonthName(item.contributionDate)}</ThemedText>
      </ThemedView>
      <ThemedView style={styles.tableCell}>
        <ThemedText style={styles.cellText}>{getYear(item.contributionDate)}</ThemedText>
      </ThemedView>
      <ThemedView style={styles.tableCell}>
        <ThemedText style={[styles.cellText, styles.amountText]}>{formatAmount(item.amount)}</ThemedText>
      </ThemedView>
      <ThemedView style={styles.tableCell}>
        <ThemedText style={styles.cellText}>{item.verifiedBy}</ThemedText>
      </ThemedView>
    </ThemedView>
  );

  const renderHeader = () => (
    <ThemedView style={[styles.tableRow, styles.headerRow]}>
      <ThemedView style={styles.tableCell}>
        <ThemedText style={styles.headerText}>महीना</ThemedText>
        <ThemedText style={styles.headerTextEng}>Month</ThemedText>
      </ThemedView>
      <ThemedView style={styles.tableCell}>
        <ThemedText style={styles.headerText}>साल</ThemedText>
        <ThemedText style={styles.headerTextEng}>Year</ThemedText>
      </ThemedView>
      <ThemedView style={styles.tableCell}>
        <ThemedText style={styles.headerText}>राशि</ThemedText>
        <ThemedText style={styles.headerTextEng}>Amount</ThemedText>
      </ThemedView>
      <ThemedView style={styles.tableCell}>
        <ThemedText style={styles.headerText}>सत्यापित</ThemedText>
        <ThemedText style={styles.headerTextEng}>Verified By</ThemedText>
      </ThemedView>
    </ThemedView>
  );

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#007AFF" />
        <ThemedText style={styles.loadingText}>योगदान लोड हो रहे हैं...</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.errorContainer}>
        <ThemedText style={styles.errorText}>Error: {error}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>💰 आपके योगदान</ThemedText>
      <ThemedText style={styles.titleEng}>Your Contributions</ThemedText>
      
      {contributions.length === 0 ? (
        <ThemedView style={styles.emptyContainer}>
          <ThemedText style={styles.emptyText}>कोई योगदान नहीं मिला।</ThemedText>
          <ThemedText style={styles.emptyTextEng}>No contributions found.</ThemedText>
          <ThemedText style={styles.emptySubtext}>
            आपके सत्यापित योगदान यहाँ दिखाई देंगे।
          </ThemedText>
        </ThemedView>
      ) : (
        <ThemedView style={styles.tableContainer}>
          {renderHeader()}
          <FlatList
            data={contributions}
            renderItem={renderContributionItem}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
          {/* Total Amount Row */}
          <ThemedView style={[styles.tableRow, styles.totalRow]}>
            <ThemedView style={styles.tableCell}>
              <ThemedText style={styles.totalLabel}>कुल</ThemedText>
              <ThemedText style={styles.totalLabelEng}>Total</ThemedText>
            </ThemedView>
            <ThemedView style={styles.tableCell}>
              <ThemedText style={styles.totalLabel}></ThemedText>
            </ThemedView>
            <ThemedView style={styles.tableCell}>
              <ThemedText style={styles.totalAmount}>{formatAmount(getTotalAmount())}</ThemedText>
            </ThemedView>
            <ThemedView style={styles.tableCell}>
              <ThemedText style={styles.totalLabel}></ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  titleEng: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.6,
    marginBottom: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 10,
  },
  loadingText: {
    fontSize: 14,
    opacity: 0.7,
  },
  errorContainer: {
    padding: 16,
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(244, 67, 54, 0.2)',
  },
  errorText: {
    color: '#f44336',
    fontSize: 14,
    textAlign: 'center',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(100, 150, 255, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(100, 150, 255, 0.1)',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
    opacity: 0.7,
  },
  emptyTextEng: {
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 8,
    opacity: 0.5,
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.5,
    textAlign: 'center',
  },
  tableContainer: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  headerRow: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  tableCell: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  headerTextEng: {
    fontSize: 11,
    fontWeight: '400',
    textAlign: 'center',
    opacity: 0.6,
    marginTop: 2,
  },
  cellText: {
    fontSize: 13,
    textAlign: 'center',
  },
  amountText: {
    fontWeight: '600',
    color: '#4CAF50',
  },
  totalRow: {
    backgroundColor: 'rgba(0, 122, 255, 0.15)',
    borderBottomWidth: 0,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  totalLabelEng: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    opacity: 0.6,
    marginTop: 1,
  },
  totalAmount: {
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#4CAF50',
  },
});

export default ContributionTable;
