import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, Alert, ScrollView, Image } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/context/AuthContext';
import { User } from '@/services/api';
import ShareIntentHandler from '@/components/ShareIntentHandler';
import ContributionTable from '@/components/ContributionTable';

interface DashboardScreenProps {
  user: User;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ user }) => {
  const { logout } = useAuth();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const getCurrentMonth = () => {
    const hindiMonths = [
      'जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
      'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'
    ];
    return hindiMonths[new Date().getMonth()];
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.content}>
        {/* Share Intent Handler - handles images shared from other apps */}
        <ShareIntentHandler 
          userId={user._id} 
          onImageUploaded={setUploadedImage}
        />

        {/* Header */}
        <ThemedView style={styles.header}>
          <ThemedView>
            <ThemedText style={styles.welcomeText}>Welcome Back!</ThemedText>
            <ThemedText style={styles.nameText}>{user.name}</ThemedText>
            <ThemedText style={styles.roleText}>{user.role.toUpperCase()}</ThemedText>
          </ThemedView>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <ThemedText style={styles.logoutButtonText}>Logout</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {/* User Info */}
        <ThemedView style={styles.userInfo}>
          <ThemedText style={styles.infoTitle}>Your Information</ThemedText>
          <ThemedView style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Mobile:</ThemedText>
            <ThemedText style={styles.infoValue}>{user.mobile}</ThemedText>
          </ThemedView>
          <ThemedView style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Father&apos;s Name:</ThemedText>
            <ThemedText style={styles.infoValue}>{user.fatherName}</ThemedText>
          </ThemedView>
          {user.email && (
            <ThemedView style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Email:</ThemedText>
              <ThemedText style={styles.infoValue}>{user.email}</ThemedText>
            </ThemedView>
          )}
          {user.occupation && (
            <ThemedView style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Occupation:</ThemedText>
              <ThemedText style={styles.infoValue}>{user.occupation}</ThemedText>
            </ThemedView>
          )}
        </ThemedView>

        {/* Upload Section */}
        <ThemedView style={styles.uploadSection}>
          <ThemedText style={styles.sectionTitle}>पेमेंट स्क्रीनशॉट अपलोड करें</ThemedText>
          <ThemedText style={styles.sectionTitleEng}>Upload Payment Screenshot</ThemedText>
          <ThemedText style={styles.sectionSubtitle}>
            {getCurrentMonth()} महीने के लिए अपना पेमेंट स्क्रीनशॉट अपलोड करें
          </ThemedText>

          {/* Instructions for uploading */}
          <ThemedView style={styles.instructionsContainer}>
            <ThemedText style={styles.instructionsTitle}>📱 स्क्रीनशॉट कैसे अपलोड करें:</ThemedText>
            
            <ThemedView style={styles.instructionItem}>
              <ThemedText style={styles.instructionNumber}>1️⃣</ThemedText>
              <ThemedView style={styles.instructionContent}>
                <ThemedText style={styles.instructionHeader}>UPI ऐप से शेयर करें (सुझावित)</ThemedText>
                <ThemedText style={styles.instructionHeaderEng}>Share from UPI App (Recommended)</ThemedText>
                <ThemedText style={styles.instructionText}>
                  पेमेंट करने के बाद, अपने UPI ऐप में &ldquo;Share&rdquo; पर टैप करें और शेयर मेन्यू से इस ऐप को चुनें।
                </ThemedText>
              </ThemedView>
            </ThemedView>

            <ThemedView style={styles.instructionItem}>
              <ThemedText style={styles.instructionNumber}>2️⃣</ThemedText>
              <ThemedView style={styles.instructionContent}>
                <ThemedText style={styles.instructionHeader}>वेब पोर्टल का उपयोग करें</ThemedText>
                <ThemedText style={styles.instructionHeaderEng}>Use Web Portal</ThemedText>
                <ThemedText style={styles.instructionText}>
                  &ldquo;Web Portal&rdquo; टैब पर जाएं और वेबसाइट से सीधे अपना स्क्रीनशॉट अपलोड करें।
                </ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>

          {uploadedImage && (
            <ThemedView style={styles.imagePreview}>
              <ThemedText style={styles.successText}>✅ स्क्रीनशॉट सफलतापूर्वक अपलोड हो गया!</ThemedText>
              <ThemedText style={styles.successTextEng}>Screenshot uploaded successfully!</ThemedText>
              <Image source={{ uri: uploadedImage }} style={styles.previewImage} />
            </ThemedView>
          )}
        </ThemedView>

        {/* Contribution Table */}
        <ContributionTable userId={user._id} />
      </ThemedView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 16,
  },
  welcomeText: {
    fontSize: 18,
    opacity: 0.7,
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
    opacity: 0.8,
  },
  logoutButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  userInfo: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '500',
    opacity: 0.7,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  uploadSection: {
    backgroundColor: 'rgba(0, 200, 100, 0.1)',
    padding: 16,
    borderRadius: 12,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  sectionTitleEng: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.6,
    marginTop: 2,
  },
  sectionSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  uploadButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  uploadButtonDisabled: {
    backgroundColor: '#999',
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  imagePreview: {
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
  },
  successText: {
    color: '#00c864',
    fontSize: 16,
    fontWeight: '600',
  },
  successTextEng: {
    color: '#00c864',
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.7,
    marginTop: 2,
  },
  previewImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  instructionsContainer: {
    backgroundColor: 'rgba(100, 150, 255, 0.1)',
    padding: 16,
    borderRadius: 12,
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(100, 150, 255, 0.2)',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  instructionItem: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  instructionNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 2,
  },
  instructionContent: {
    flex: 1,
    gap: 4,
  },
  instructionHeader: {
    fontSize: 15,
    fontWeight: '600',
  },
  instructionHeaderEng: {
    fontSize: 13,
    fontWeight: '500',
    opacity: 0.6,
    marginTop: 2,
  },
  instructionText: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
  },
});

export default DashboardScreen;
