import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, TouchableOpacity, Alert, ScrollView, Image, RefreshControl, Clipboard } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/context/AuthContext';
import ApiService, { User, Screenshot } from '@/services/api';
import ShareIntentHandler from '@/components/ShareIntentHandler';
import ContributionTable from '@/components/ContributionTable';
import { getAvatarLink } from '@/utils/avatarUtils';

interface DashboardScreenProps {
  user: User;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ user }) => {
  const { logout } = useAuth();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [currentMonthScreenshot, setCurrentMonthScreenshot] = useState<Screenshot | null>(null);
  const [currentMonthStatus, setCurrentMonthStatus] = useState<'pending' | 'none' | 'verified' | 'rejected'>('none');
  const [refreshing, setRefreshing] = useState(false);
  
  // Secret management state
  const [secret, setSecret] = useState('');
  const [secretLoading, setSecretLoading] = useState(false);
  const [copied, setCopied] = useState(false);

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

  // Secret management functions
  const handleGetSecret = async () => {
    setSecretLoading(true);
    try {
      const response = await ApiService.getMySecret();
      setSecret(response.secret);
    } catch (error) {
      console.error('Error fetching secret:', error);
      Alert.alert('त्रुटि', error instanceof Error ? error.message : 'सीक्रेट की प्राप्त करने में समस्या');
    } finally {
      setSecretLoading(false);
    }
  };

  const handleResetSecret = async () => {
    Alert.alert(
      'सीक्रेट की रीसेट करें',
      'क्या आप वाकई अपनी सीक्रेट की रीसेट करना चाहते हैं? यह एक नई सीक्रेट की जेनरेट करेगा।',
      [
        {
          text: 'रद्द करें',
          style: 'cancel',
        },
        {
          text: 'रीसेट करें',
          style: 'destructive',
          onPress: async () => {
            setSecretLoading(true);
            try {
              const response = await ApiService.resetMySecret();
              setSecret(response.secret);
              Alert.alert('सफल', 'आपकी सीक्रेट की सफलतापूर्वक रीसेट हो गई है।');
            } catch (error) {
              console.error('Error resetting secret:', error);
              Alert.alert('त्रुटि', error instanceof Error ? error.message : 'सीक्रेट की रीसेट करने में समस्या');
            } finally {
              setSecretLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleCopySecret = async () => {
    if (secret) {
      try {
        await Clipboard.setString(secret);
        setCopied(true);
        Alert.alert('कॉपी हो गया', 'सीक्रेट की कॉपी हो गई है।');
        setTimeout(() => setCopied(false), 2000);
      } catch {
        Alert.alert('त्रुटि', 'सीक्रेट की कॉपी करने में समस्या');
      }
    }
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
          {/* Left: Profile Photo */}
          <ThemedView style={styles.profilePhotoContainer}>
            <Image 
              source={{ 
                uri: user.profileUrl || getAvatarLink(user.name, 70) 
              }} 
              style={styles.profilePhoto}
            />
          </ThemedView>
          
          {/* Center: Welcome Text */}
          <ThemedView style={styles.welcomeSection}>
            <ThemedText style={styles.welcomeText}>Welcome Back!</ThemedText>
            <ThemedText style={styles.nameText}>{user.name}</ThemedText>
            <ThemedText style={styles.roleText}>{user.role.toUpperCase()}</ThemedText>
          </ThemedView>
          
          {/* Right: Action Buttons */}
          <ThemedView style={styles.headerButtons}>
            <TouchableOpacity 
              style={[styles.logoutButton, { backgroundColor: '#ff4444' }]} 
              onPress={handleLogout}
              onLongPress={() => Alert.alert('लॉगआउट', 'लॉगआउट करने के लिए टैप करें')}
            >
              <ThemedText style={styles.iconText}>🔓</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.refreshButton, refreshing && { opacity: 0.6 }]} 
              onPress={onRefresh}
              disabled={refreshing}
              onLongPress={() => Alert.alert('रीफ्रेश', 'डेटा रीफ्रेश करने के लिए टैप करें')}
            >
              <ThemedText style={styles.iconText}>
                {refreshing ? '🔄' : '🔄'}
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>

        {/* User Info */}
        <ThemedView style={styles.userInfo}>
          <ThemedText style={styles.infoTitle}>आपकी जानकारी</ThemedText>
          
          <ThemedView style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>मोबाइल:</ThemedText>
            <ThemedText style={styles.infoValue}>{user.mobile}</ThemedText>
          </ThemedView>
          
          <ThemedView style={[styles.infoRow, !user.email && !user.occupation && styles.lastInfoRow]}>
            <ThemedText style={styles.infoLabel}>पिता का नाम:</ThemedText>
            <ThemedText style={styles.infoValue}>{user.fatherName}</ThemedText>
          </ThemedView>
          
          {user.email && (
            <ThemedView style={[styles.infoRow, !user.occupation && styles.lastInfoRow]}>
              <ThemedText style={styles.infoLabel}>ईमेल:</ThemedText>
              <ThemedText style={styles.infoValue}>{user.email}</ThemedText>
            </ThemedView>
          )}
          
          {user.occupation && (
            <ThemedView style={[styles.infoRow, styles.lastInfoRow]}>
              <ThemedText style={styles.infoLabel}>व्यवसाय:</ThemedText>
              <ThemedText style={styles.infoValue}>{user.occupation}</ThemedText>
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

        {/* Share Intent Success Feedback */}
        {uploadedImage && (
          <ThemedView style={styles.imagePreview}>
            <ThemedText style={styles.successText}>✅ स्क्रीनशॉट सफलतापूर्वक अपलोड हो गया!</ThemedText>
            <ThemedText style={styles.successTextEng}>Screenshot uploaded successfully!</ThemedText>
            <Image source={{ uri: uploadedImage }} style={styles.previewImage} />
          </ThemedView>
        )}

        {/* Secret Management Section */}
        <ThemedView style={styles.secretSection}>
          <ThemedText style={styles.secretTitle}>अपनी सीक्रेट की प्रबंधित करें</ThemedText>
          <ThemedText style={styles.secretTitleEng}>Manage Your Secret Key</ThemedText>
          
          <ThemedView style={styles.secretButtons}>
            <TouchableOpacity 
              style={[styles.secretButton, styles.getSecretButton]} 
              onPress={handleGetSecret}
              disabled={secretLoading}
            >
              <ThemedText style={styles.secretButtonText}>
                {secretLoading ? 'प्राप्त कर रहे हैं...' : 'सीक्रेट प्राप्त करें'}
              </ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.secretButton, styles.resetSecretButton]} 
              onPress={handleResetSecret}
              disabled={secretLoading}
            >
              <ThemedText style={styles.secretButtonText}>
                {secretLoading ? 'रीसेट कर रहे हैं...' : 'सीक्रेट रीसेट करें'}
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>

          {secret && (
            <ThemedView style={styles.secretDisplay}>
              <ThemedText style={styles.secretLabel}>आपकी सीक्रेट की:</ThemedText>
              <ThemedView style={styles.secretContainer}>
                <ThemedText style={styles.secretText}>{secret}</ThemedText>
                <TouchableOpacity 
                  style={styles.copyButton} 
                  onPress={handleCopySecret}
                >
                  <ThemedText style={styles.copyButtonText}>
                    {copied ? '✓' : '📋'} कॉपी
                  </ThemedText>
                </TouchableOpacity>
              </ThemedView>
              <ThemedText style={styles.secretWarning}>
                ⚠️ इस सीक्रेट की को सुरक्षित रखें और किसी के साथ साझा न करें
              </ThemedText>
            </ThemedView>
          )}
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 12,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    minHeight: 90,
    gap: 8,
    marginBottom: 0,
  },
  profilePhotoContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#007AFF',
    backgroundColor: '#f0f0f0',
  },
  profilePhoto: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  welcomeSection: {
    flex: 1,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  headerButtons: {
    flexDirection: 'column',
    gap: 8,
    alignItems: 'center',
    width: 50,
    paddingTop: 6,
  },
  welcomeText: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
  },
  welcomeTextEng: {
    fontSize: 14,
    opacity: 0.5,
    marginTop: 2,
  },
  nameText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 2,
    textAlign: 'center',
  },
  roleText: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
    opacity: 0.8,
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: '#ff4444',
    width: 44,
    height: 44,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  refreshButton: {
    backgroundColor: '#007AFF',
    width: 44,
    height: 44,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  iconText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  userInfo: {
    padding: 20,
    borderRadius: 16,
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.2)',
    backgroundColor: 'rgba(128, 128, 128, 0.05)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
    opacity: 0.9,
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
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 128, 128, 0.1)',
  },
  lastInfoRow: {
    borderBottomWidth: 0,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '500',
    opacity: 0.8,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    opacity: 0.9,
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
  // Secret management styles
  secretSection: {
    backgroundColor: 'rgba(138, 43, 226, 0.1)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(138, 43, 226, 0.2)',
    gap: 16,
  },
  secretTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6a1b9a',
  },
  secretTitleEng: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6a1b9a',
    opacity: 0.7,
  },
  secretButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  secretButton: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  getSecretButton: {
    backgroundColor: '#8e24aa',
  },
  resetSecretButton: {
    backgroundColor: '#e91e63',
  },
  secretButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  secretDisplay: {
    gap: 12,
    marginTop: 8,
  },
  secretLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4a148c',
  },
  secretContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(138, 43, 226, 0.3)',
  },
  secretText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'monospace',
    color: '#1a237e',
    fontWeight: '600',
  },
  copyButton: {
    backgroundColor: '#ff5722',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  copyButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  secretWarning: {
    fontSize: 13,
    color: '#d32f2f',
    fontWeight: '500',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default DashboardScreen;
