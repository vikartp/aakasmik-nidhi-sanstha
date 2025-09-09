import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Image } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/context/AuthContext';
import ApiService, { User } from '@/services/api';
import ImagePicker, { ImagePickerAsset } from '@/utils/imagePicker';
import ShareIntentHandler from '@/components/ShareIntentHandler';

interface DashboardScreenProps {
  user: User;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ user }) => {
  const { logout } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const getCurrentMonth = () => {
    return new Date().toLocaleString('default', { month: 'long' });
  };

  const pickImage = async () => {
    try {
      console.log('Starting image picker...');
      
      // Request permission to access media library
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('Media library permission result:', permissionResult);
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera roll is required!');
        return;
      }

      console.log('Launching image library...');
      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync();

      console.log('Image picker result:', result);

      if (!result.canceled && result.assets && result.assets[0]) {
        console.log('Selected image:', result.assets[0]);
        await uploadImage(result.assets[0]);
      } else {
        console.log('Image picker was canceled or no image selected');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', `Failed to pick image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const takePhoto = async () => {
    try {
      console.log('Starting camera...');
      
      // Request permission to access camera
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      console.log('Camera permission result:', permissionResult);
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera is required!');
        return;
      }

      console.log('Launching camera...');
      // Launch camera
      const result = await ImagePicker.launchCameraAsync();

      console.log('Camera result:', result);

      if (!result.canceled && result.assets && result.assets[0]) {
        console.log('Captured photo:', result.assets[0]);
        await uploadImage(result.assets[0]);
      } else {
        console.log('Camera was canceled or no photo taken');
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', `Failed to take photo: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const uploadImage = async (imageAsset: ImagePickerAsset) => {
    try {
      setUploading(true);

      // Prepare file object for upload
      const file = {
        uri: imageAsset.uri,
        type: imageAsset.type || 'image/jpeg',
        name: imageAsset.name || `screenshot_${Date.now()}.jpg`,
      };

      // Upload to your backend
      const response = await ApiService.uploadScreenshot(
        file, 
        user._id, 
        getCurrentMonth()
      );

      if (response.url) {
        setUploadedImage(response.url);
        Alert.alert('Success', 'Screenshot uploaded successfully!');
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Upload Failed', error instanceof Error ? error.message : 'Failed to upload screenshot');
    } finally {
      setUploading(false);
    }
  };

  const showImageOptions = () => {
    console.log('Showing image options...');
    Alert.alert(
      'Select Image',
      'Choose how you want to select an image',
      [
        {
          text: 'Camera',
          onPress: () => {
            console.log('Camera option selected');
            takePhoto();
          },
        },
        {
          text: 'Photo Library',
          onPress: () => {
            console.log('Photo Library option selected');
            pickImage();
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => console.log('Image selection canceled'),
        },
      ]
    );
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
          <ThemedText style={styles.sectionTitle}>Upload Payment Screenshot</ThemedText>
          <ThemedText style={styles.sectionSubtitle}>
            Upload your payment screenshot for {getCurrentMonth()}
          </ThemedText>

          <TouchableOpacity 
            style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]} 
            onPress={() => {
              console.log('Upload button pressed!');
              // Simple test alert first
              Alert.alert('Test', 'Button is working!', [
                { text: 'OK', onPress: () => showImageOptions() }
              ]);
            }}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <ThemedText style={styles.uploadButtonText}>Select Screenshot</ThemedText>
            )}
          </TouchableOpacity>

          {uploadedImage && (
            <ThemedView style={styles.imagePreview}>
              <ThemedText style={styles.successText}>✅ Screenshot uploaded successfully!</ThemedText>
              <Image source={{ uri: uploadedImage }} style={styles.previewImage} />
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
  previewImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    resizeMode: 'cover',
  },
});

export default DashboardScreen;
