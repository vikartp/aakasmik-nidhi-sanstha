// Fallback image picker for development when native modules aren't available
import { Alert } from 'react-native';

export interface ImagePickerAsset {
  uri: string;
  type: string;
  name: string;
  width?: number;
  height?: number;
}

export interface ImagePickerResult {
  canceled: boolean;
  assets?: ImagePickerAsset[];
}

// Fallback ImagePicker for development
const ImagePickerFallback = {
  requestMediaLibraryPermissionsAsync: async () => {
    return { granted: true };
  },

  requestCameraPermissionsAsync: async () => {
    return { granted: true };
  },

  launchImageLibraryAsync: async (): Promise<ImagePickerResult> => {
    return new Promise((resolve) => {
      Alert.alert(
        'Image Picker Not Available',
        'Native image picker is not available in this development build. This would normally open your photo library.',
        [
          {
            text: 'Simulate Success',
            onPress: () => {
              // Simulate a successful image selection
              resolve({
                canceled: false,
                assets: [{
                  uri: 'https://via.placeholder.com/400x300.jpg?text=Demo+Image',
                  type: 'image/jpeg',
                  name: 'demo_image.jpg',
                  width: 400,
                  height: 300,
                }]
              });
            }
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => resolve({ canceled: true })
          }
        ]
      );
    });
  },

  launchCameraAsync: async (): Promise<ImagePickerResult> => {
    return new Promise((resolve) => {
      Alert.alert(
        'Camera Not Available',
        'Native camera is not available in this development build. This would normally open your camera.',
        [
          {
            text: 'Simulate Success',
            onPress: () => {
              // Simulate a successful photo capture
              resolve({
                canceled: false,
                assets: [{
                  uri: 'https://via.placeholder.com/400x300.jpg?text=Demo+Photo',
                  type: 'image/jpeg',
                  name: 'demo_photo.jpg',
                  width: 400,
                  height: 300,
                }]
              });
            }
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => resolve({ canceled: true })
          }
        ]
      );
    });
  },

  MediaTypeOptions: {
    Images: 'Images' as const,
  }
};

export default ImagePickerFallback;
