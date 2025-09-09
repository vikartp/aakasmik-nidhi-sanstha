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

  const uploadSharedImages = useCallback(async (imageFiles: any[]) => {
    setUploading(true);
    
    try {
      const uploadPromises = imageFiles.map(async (file, index) => {
        const fileObj = {
          uri: file.path,
          type: file.mimeType,
          name: file.fileName || `shared_screenshot_${Date.now()}_${index}.jpg`,
        };

        return ApiService.uploadScreenshot(
          fileObj,
          userId,
          getCurrentMonth()
        );
      });

      const results = await Promise.all(uploadPromises);
      const successCount = results.filter(result => result.url).length;

      if (successCount > 0) {
        Alert.alert(
          'Upload Successful',
          `Successfully uploaded ${successCount} image(s) as payment screenshots!`
        );
        
        // Notify parent component about the first uploaded image
        if (results[0]?.url && onImageUploaded) {
          onImageUploaded(results[0].url);
        }
      } else {
        Alert.alert('Upload Failed', 'No images were uploaded successfully');
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Upload Failed', error instanceof Error ? error.message : 'Failed to upload images');
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
        Alert.alert('No Images', 'No image files were shared. Please share image files for screenshot upload.');
        resetShareIntent();
        return;
      }

      // Show confirmation dialog
      Alert.alert(
        'Upload Shared Images',
        `${imageFiles.length} image(s) were shared with the app. Do you want to upload them as payment screenshots?`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => resetShareIntent(),
          },
          {
            text: 'Upload',
            onPress: () => uploadSharedImages(imageFiles),
          },
        ]
      );
    } catch (error) {
      console.error('Error handling shared images:', error);
      Alert.alert('Error', 'Failed to process shared images');
      resetShareIntent();
    }
  }, [shareIntent, resetShareIntent, uploadSharedImages]);

  useEffect(() => {
    if (hasShareIntent && shareIntent?.files && shareIntent.files.length > 0) {
      handleSharedImages();
    }
  }, [hasShareIntent, shareIntent, handleSharedImages]);

  // Show notification when share intent is active
  if (hasShareIntent && shareIntent?.files && shareIntent.files.length > 0) {
    const imageFiles = shareIntent.files.filter(file => file.mimeType.startsWith('image/'));
    
    return (
      <View style={styles.container}>
        <View style={styles.notification}>
          <Text style={styles.notificationTitle}>📤 Shared Content Detected</Text>
          <Text style={styles.notificationText}>
            {imageFiles.length} image(s) ready to upload as payment screenshots
          </Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.uploadButton} 
              onPress={() => uploadSharedImages(imageFiles)}
              disabled={uploading}
            >
              <Text style={styles.uploadButtonText}>
                {uploading ? 'Uploading...' : 'Upload Now'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={resetShareIntent}
              disabled={uploading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Show error if any
  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Share Intent Error: {error}</Text>
          <TouchableOpacity style={styles.errorButton} onPress={resetShareIntent}>
            <Text style={styles.errorButtonText}>Dismiss</Text>
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
