import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, TouchableOpacity, Alert, ScrollView, Image, RefreshControl } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/context/AuthContext';
import ApiService, { User, Screenshot } from '@/services/api';
import ShareIntentHandler from '@/components/ShareIntentHandler';
import ContributionTable from '@/components/ContributionTable';

interface DashboardScreenProps {
  user: User;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ user }) => {
  const { logout } = useAuth();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [currentMonthScreenshot, setCurrentMonthScreenshot] = useState<Screenshot | null>(null);
  const [currentMonthStatus, setCurrentMonthStatus] = useState<'pending' | 'none' | 'verified' | 'rejected'>('none');
  const [refreshing, setRefreshing] = useState(false);

  const getCurrentMonth = () => {
    const hindiMonths = [
      'जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
      'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'
    ];
    return hindiMonths[new Date().getMonth()];
  };

  const getCurrentMonthEnglish = () => {
    return new Date().toLocaleString('default', { month: 'long' });
  };

  // Function to fetch current month screenshot status
  const fetchCurrentMonthStatus = useCallback(async () => {
    try {
      const currentMonth = getCurrentMonthEnglish();
      const screenshots = await ApiService.getScreenshots(user._id, currentMonth);
      
      if (screenshots && screenshots.length > 0) {
        const screenshot = screenshots[0];
        setCurrentMonthScreenshot(screenshot);
        
        if (screenshot.verified) {
          setCurrentMonthStatus('verified');
        } else if (screenshot.rejected) {
          setCurrentMonthStatus('rejected');
        } else {
          setCurrentMonthStatus('pending');
        }
      } else {
        setCurrentMonthScreenshot(null);
        setCurrentMonthStatus('none');
      }
    } catch (error) {
      console.error('Error fetching screenshot status:', error);
      setCurrentMonthStatus('none');
    }
  }, [user._id]);

  // Pull to refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchCurrentMonthStatus();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Fetch current month screenshot status
  useEffect(() => {
    fetchCurrentMonthStatus();
  }, [user._id, uploadedImage, fetchCurrentMonthStatus]); // Re-fetch when image is uploaded

  const handleImageUploaded = (imageUrl: string) => {
    setUploadedImage(imageUrl);
    // The useEffect will automatically re-fetch the status
  };

  const handleLogout = async () => {
    Alert.alert(
      'लॉगआउट',
      'क्या आप वाकई लॉगआउट करना चाहते हैं?',
      [
        {
          text: 'रद्द करें',
          style: 'cancel',
        },
        {
          text: 'लॉगआउट',
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
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#007AFF']} // Android
          tintColor={'#007AFF'} // iOS
          title="डेटा रीफ्रेश कर रहे हैं..." // iOS
          titleColor={'#007AFF'} // iOS
        />
      }
    >
      <ThemedView style={styles.content}>
        {/* Share Intent Handler - handles images shared from other apps */}
        <ShareIntentHandler 
          userId={user._id} 
          onImageUploaded={handleImageUploaded}
        />

        {/* Header */}
        <ThemedView style={styles.header}>
          <ThemedView>
            <ThemedText style={styles.welcomeText}>Welcome Back!</ThemedText>
            <ThemedText style={styles.nameText}>{user.name}</ThemedText>
            <ThemedText style={styles.roleText}>{user.role.toUpperCase()}</ThemedText>
          </ThemedView>
          <ThemedView style={styles.headerButtons}>
            <TouchableOpacity 
              style={styles.refreshButton} 
              onPress={onRefresh}
              disabled={refreshing}
            >
              <ThemedText style={styles.refreshButtonText}>
                {refreshing ? '🔄' : '🔄'} रीफ्रेश
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <ThemedText style={styles.logoutButtonText}>लॉगआउट</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>

        {/* User Info */}
        <ThemedView style={styles.userInfo}>
          <ThemedText style={styles.infoTitle}>आपकी जानकारी</ThemedText>
          <ThemedText style={styles.infoTitleEng}>Your Information</ThemedText>
          <ThemedView style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>मोबाइल:</ThemedText>
            <ThemedText style={styles.infoValue}>{user.mobile}</ThemedText>
          </ThemedView>
          <ThemedView style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>पिता का नाम:</ThemedText>
            <ThemedText style={styles.infoValue}>{user.fatherName}</ThemedText>
          </ThemedView>
          {user.email && (
            <ThemedView style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>ईमेल:</ThemedText>
              <ThemedText style={styles.infoValue}>{user.email}</ThemedText>
            </ThemedView>
          )}
          {user.occupation && (
            <ThemedView style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>व्यवसाय:</ThemedText>
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

        {/* Current Month Screenshot Status */}
        {currentMonthStatus === 'pending' && (
          <ThemedView style={styles.statusContainer}>
            <ThemedView style={[styles.statusCard, styles.pendingCard]}>
              <ThemedText style={[styles.statusIcon, styles.pendingText]}>⏳</ThemedText>
              <ThemedView style={styles.statusContent}>
                <ThemedText style={[styles.statusTitle, styles.pendingText]}>
                  इस महीने का सत्यापन लंबित है
                </ThemedText>
                <ThemedText style={[styles.statusSubtitle, styles.pendingText]}>
                  Verification Pending for This Month
                </ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        )}

        {currentMonthStatus === 'rejected' && currentMonthScreenshot && (
          <ThemedView style={styles.statusContainer}>
            <ThemedView style={[styles.statusCard, styles.rejectedCard]}>
              <ThemedText style={[styles.statusIcon, styles.rejectedText]}>❌</ThemedText>
              <ThemedView style={styles.statusContent}>
                <ThemedText style={[styles.statusTitle, styles.rejectedText]}>
                  आपका स्क्रीनशॉट अस्वीकार कर दिया गया है
                </ThemedText>
                <ThemedText style={[styles.statusSubtitle, styles.rejectedText]}>
                  Screenshot Rejected - Please Re-upload
                </ThemedText>
                {currentMonthScreenshot.rejected && (
                  <ThemedText style={[styles.rejectionReason, styles.rejectedText]}>
                    कारण: {currentMonthScreenshot.rejected}
                  </ThemedText>
                )}
              </ThemedView>
            </ThemedView>
          </ThemedView>
        )}

        {currentMonthStatus === 'verified' && (
          <ThemedView style={styles.statusContainer}>
            <ThemedView style={[styles.statusCard, styles.verifiedCard]}>
              <ThemedText style={[styles.statusIcon, styles.verifiedText]}>✅</ThemedText>
              <ThemedView style={styles.statusContent}>
                <ThemedText style={[styles.statusTitle, styles.verifiedText]}>
                  इस महीने का स्क्रीनशॉट सत्यापित है
                </ThemedText>
                <ThemedText style={[styles.statusSubtitle, styles.verifiedText]}>
                  Screenshot Verified for This Month
                </ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        )}

        {/* Display uploaded screenshot if available */}
        {currentMonthScreenshot && (
          <ThemedView style={styles.screenshotContainer}>
            <ThemedText style={styles.screenshotTitle}>
              आपका अपलोड किया गया स्क्रीनशॉट
            </ThemedText>
            <ThemedText style={styles.screenshotTitleEng}>
              Your Uploaded Screenshot
            </ThemedText>
            <Image source={{ uri: currentMonthScreenshot.url }} style={styles.currentScreenshot} />
          </ThemedView>
        )}

        {/* Contribution Table */}
        <ContributionTable 
          userId={user._id} 
          key={`contributions-${uploadedImage}-${currentMonthStatus}`}
        />
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
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  welcomeText: {
    fontSize: 18,
    opacity: 0.7,
  },
  welcomeTextEng: {
    fontSize: 14,
    opacity: 0.5,
    marginTop: 2,
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
  refreshButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  refreshButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
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
  infoTitleEng: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.6,
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
  // Status indicator styles
  statusContainer: {
    marginVertical: 8,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  pendingCard: {
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderColor: 'rgba(255, 193, 7, 0.3)',
  },
  rejectedCard: {
    backgroundColor: 'rgba(220, 53, 69, 0.1)',
    borderColor: 'rgba(220, 53, 69, 0.3)',
  },
  verifiedCard: {
    backgroundColor: 'rgba(40, 167, 69, 0.1)',
    borderColor: 'rgba(40, 167, 69, 0.3)',
  },
  statusIcon: {
    fontSize: 24,
  },
  statusContent: {
    flex: 1,
    gap: 4,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    opacity: 0.8,
  },
  rejectionReason: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
  },
  pendingText: {
    color: '#856404',
  },
  rejectedText: {
    color: '#721c24',
  },
  verifiedText: {
    color: '#155724',
  },
  // Screenshot display styles
  screenshotContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 123, 255, 0.1)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 123, 255, 0.2)',
    gap: 12,
  },
  screenshotTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#004085',
  },
  screenshotTitleEng: {
    fontSize: 13,
    fontWeight: '500',
    color: '#004085',
    opacity: 0.7,
  },
  currentScreenshot: {
    width: 250,
    height: 180,
    borderRadius: 8,
    resizeMode: 'cover',
    borderWidth: 1,
    borderColor: 'rgba(0, 123, 255, 0.3)',
  },
});

export default DashboardScreen;
