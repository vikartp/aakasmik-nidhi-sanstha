// Simple storage service that works without native modules
let memoryStorage: { [key: string]: string } = {};

export const storageService = {
  getItem: async (key: string): Promise<string | null> => {
    // For now, just use memory storage until native modules are properly linked
    console.log('Getting from memory storage for key:', key);
    return memoryStorage[key] || null;
  },
  
  setItem: async (key: string, value: string): Promise<void> => {
    // For now, just use memory storage until native modules are properly linked
    console.log('Storing in memory for key:', key);
    memoryStorage[key] = value;
  },
  
  removeItem: async (key: string): Promise<void> => {
    // For now, just use memory storage until native modules are properly linked
    console.log('Removing from memory for key:', key);
    delete memoryStorage[key];
  },
  
  clear: async (): Promise<void> => {
    // For now, just use memory storage until native modules are properly linked
    console.log('Clearing memory storage');
    memoryStorage = {};
  }
};

// Keep the old tempStorage for backward compatibility
export const tempStorage = storageService;
