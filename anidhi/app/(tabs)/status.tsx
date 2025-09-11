import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/context/AuthContext';
import MonthlyStatusTable from '@/components/MonthlyStatusTable';

export default function StatusScreen() {
  const { user, isAuthenticated } = useAuth();

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.messageContainer}>
          <ThemedText style={styles.messageText}>कृपया पहले लॉगिन करें</ThemedText>
          <ThemedText style={styles.messageSubtext}>Please login first to view status</ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.content}>
        <MonthlyStatusTable />
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  messageText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  messageSubtext: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
  },
});
