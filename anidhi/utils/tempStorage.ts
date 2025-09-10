// Simple storage service with AsyncStorage for persistence and memory fallback
let memoryStorage: { [key: string]: string } = {};
let useAsyncStorage = false;
let AsyncStorage: any = null;

// Try to import AsyncStorage safely
const initializeAsyncStorage = async () => {
  try {
    const module = await import('@react-native-async-storage/async-storage');
    AsyncStorage = module.default;
    
    // Test if AsyncStorage works
    await AsyncStorage.setItem('test', 'test');
    await AsyncStorage.removeItem('test');
    
    useAsyncStorage = true;
    return true;
  } catch {
    useAsyncStorage = false;
    return false;
  }
};

// Initialize storage when the module loads
initializeAsyncStorage();

export const storageService = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (useAsyncStorage && AsyncStorage) {
        const value = await AsyncStorage.getItem(key);
        return value;
      } else {
        const value = memoryStorage[key] || null;
        return value;
      }
    } catch {
      console.warn('Error getting item from AsyncStorage, falling back to memory for key:', key);
      return memoryStorage[key] || null;
    }
  },
  
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (useAsyncStorage && AsyncStorage) {
        await AsyncStorage.setItem(key, value);
      }
      // Always store in memory as backup
      memoryStorage[key] = value;
    } catch {
      console.warn('Error storing item in AsyncStorage, falling back to memory for key:', key);
      memoryStorage[key] = value;
    }
  },
  
  removeItem: async (key: string): Promise<void> => {
    try {
      if (useAsyncStorage && AsyncStorage) {
        await AsyncStorage.removeItem(key);
      }
      delete memoryStorage[key];
    } catch {
      console.warn('Error removing item from AsyncStorage for key:', key);
      delete memoryStorage[key];
    }
  },
  
  clear: async (): Promise<void> => {
    try {
      if (useAsyncStorage && AsyncStorage) {
        await AsyncStorage.clear();
      }
      memoryStorage = {};
    } catch {
      console.warn('Error clearing AsyncStorage');
      memoryStorage = {};
    }
  }
};

// Keep the old tempStorage for backward compatibility
export const tempStorage = storageService;
