import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useShareIntentContext } from '@/context/ShareIntentContext';
import ApiService from '@/services/api';

interface ShareIntentHandlerProps {
  userId: string;
  onImageUploaded?: (imageUrl: string) => void;
}

const ShareIntentHandler: React.FC<ShareIntentHandlerProps> = ({ userId, onImageUploaded }) => {
  const { hasShareIntent, shareIntent, resetShareIntent, error } = useShareIntentContext();
  const [uploading, setUploading] = useState(false);

  const getCurrentMonth = () => {
    return new Date().toLocaleString('default', { month: 'long' });
  };

  const getHindiMonthName = (englishMonth: string) => {
    const monthMap: { [key: string]: string } = {
      'January': 'जनवरी',
      'February': 'फरवरी',
      'March': 'मार्च',
      'April': 'अप्रैल',
      'May': 'मई',
      'June': 'जून',
      'July': 'जुलाई',
      'August': 'अगस्त',
      'September': 'सितंबर',
      'October': 'अक्टूबर',
      'November': 'नवंबर',
      'December': 'दिसंबर'
    };
    return monthMap[englishMonth] || englishMonth;
  };

  const uploadSharedImage = useCallback(async (imageFile: any) => {
    setUploading(true);
    
    try {
      // Check if user has already contributed for current month
      const currentMonth = getCurrentMonth();
      const currentYear = new Date().getFullYear();
      
      const existingContributions = await ApiService.getContributionsByYearAndMonth(currentYear, currentMonth);
      const userContribution = existingContributions.find(contribution => contribution.userId === userId);
      
      if (userContribution) {
        Alert.alert(
          'पहले से योगदान दिया गया',
          `आपने इस महीने (${getHindiMonthName(currentMonth)}) पहले से ही ₹${userContribution.amount} का योगदान दिया है। एक महीने में केवल एक बार योगदान दे सकते हैं।`
        );
        resetShareIntent();
        return;
      }

      const fileObj = {
        uri: imageFile.path,
        type: imageFile.mimeType,
        name: imageFile.fileName || `monthly_payment_${Date.now()}.jpg`,
      };

      const result = await ApiService.uploadScreenshot(
        fileObj,
        userId,
        getCurrentMonth()
      );

      if (result.url) {
        Alert.alert(
          'अपलोड सफल',
          'मासिक भुगतान स्क्रीनशॉट सफलतापूर्वक अपलोड हो गया!'
        );
        
        // Notify parent component about the uploaded image
        if (onImageUploaded) {
          onImageUploaded(result.url);
        }
      } else {
        Alert.alert('अपलोड असफल', 'स्क्रीनशॉट अपलोड नहीं हो सका');
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('अपलोड असफल', error instanceof Error ? error.message : 'स्क्रीनशॉट अपलोड में समस्या');
    } finally {
      setUploading(false);
      resetShareIntent();
    }
  }, [userId, onImageUploaded, resetShareIntent]);

  const handleSharedImages = useCallback(async () => {
    if (!shareIntent?.files || shareIntent.files.length === 0) return;

    try {
      // Filter for images only
      const imageFiles = shareIntent.files.filter(file => 
        file.mimeType.startsWith('image/')
      );

      if (imageFiles.length === 0) {
        Alert.alert('कोई तस्वीर नहीं', 'कोई तस्वीर साझा नहीं की गई। कृपया भुगतान स्क्रीनशॉट के लिए तस्वीर साझा करें।');
        resetShareIntent();
        return;
      }

      // Take only the first image for monthly payment
      const firstImage = imageFiles[0];

      // Show confirmation dialog
      Alert.alert(
        'मासिक भुगतान अपलोड करें',
        'क्या आप इस तस्वीर को मासिक भुगतान स्क्रीनशॉट के रूप में अपलोड करना चाहते हैं?',
        [
          {
            text: 'रद्द करें',
            style: 'cancel',
            onPress: () => resetShareIntent(),
          },
          {
            text: 'अपलोड करें',
            onPress: () => uploadSharedImage(firstImage),
          },
        ]
      );
    } catch (error) {
      console.error('Error handling shared images:', error);
      Alert.alert('त्रुटि', 'साझा की गई तस्वीर को प्रोसेस करने में समस्या');
      resetShareIntent();
    }
  }, [shareIntent, resetShareIntent, uploadSharedImage]);

  useEffect(() => {
    if (hasShareIntent && shareIntent?.files && shareIntent.files.length > 0) {
      handleSharedImages();
    }
  }, [hasShareIntent, shareIntent, handleSharedImages]);

  // Show notification when share intent is active
  if (hasShareIntent && shareIntent?.files && shareIntent.files.length > 0) {
    const imageFiles = shareIntent.files.filter(file => file.mimeType.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      const firstImage = imageFiles[0];
      
      return (
        <View style={styles.container}>
          <View style={styles.notification}>
            <Text style={styles.notificationTitle}>📤 मासिक भुगतान स्क्रीनशॉट</Text>
            <Text style={styles.notificationText}>
              भुगतान स्क्रीनशॉट अपलोड करने के लिए तैयार है
            </Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.uploadButton} 
                onPress={() => uploadSharedImage(firstImage)}
                disabled={uploading}
              >
                <Text style={styles.uploadButtonText}>
                  {uploading ? 'अपलोड हो रहा है...' : 'अभी अपलोड करें'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={resetShareIntent}
                disabled={uploading}
              >
                <Text style={styles.cancelButtonText}>रद्द करें</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    }
  }

  // Show error if any
  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>साझाकरण त्रुटि: {error}</Text>
          <TouchableOpacity style={styles.errorButton} onPress={resetShareIntent}>
            <Text style={styles.errorButtonText}>बंद करें</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
  },
  notification: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 8,
  },
  notificationText: {
    fontSize: 14,
    color: '#424242',
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  uploadButton: {
    backgroundColor: '#2196f3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
  },
  uploadButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
  },
  cancelButtonText: {
    color: '#666',
    textAlign: 'center',
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  errorText: {
    fontSize: 14,
    color: '#d32f2f',
    marginBottom: 12,
  },
  errorButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  errorButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default ShareIntentHandler;
