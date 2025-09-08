import AsyncStorage from '@react-native-async-storage/async-storage';

class AsyncStorageTest {
  static async testAsyncStorage() {
    try {
      console.log('Testing AsyncStorage...');
      
      // Test if AsyncStorage is available
      if (!AsyncStorage) {
        console.error('AsyncStorage is not available');
        return false;
      }
      
      // Test basic storage operations
      const testKey = 'asyncStorageTest';
      const testValue = 'test-value-123';
      
      // Store test data
      await AsyncStorage.setItem(testKey, testValue);
      console.log('AsyncStorage: Test data stored successfully');
      
      // Retrieve test data
      const retrievedValue = await AsyncStorage.getItem(testKey);
      console.log('AsyncStorage: Retrieved value:', retrievedValue);
      
      // Verify data integrity
      if (retrievedValue === testValue) {
        console.log('AsyncStorage: Test passed successfully');
        
        // Clean up
        await AsyncStorage.removeItem(testKey);
        console.log('AsyncStorage: Test data cleaned up');
        
        return true;
      } else {
        console.error('AsyncStorage: Test failed - data mismatch');
        return false;
      }
      
    } catch (error) {
      console.error('AsyncStorage: Test failed with error:', error);
      return false;
    }
  }
  
  static async debugAsyncStorage() {
    console.log('=== AsyncStorage Debug Info ===');
    console.log('AsyncStorage available:', !!AsyncStorage);
    console.log('AsyncStorage type:', typeof AsyncStorage);
    
    if (AsyncStorage) {
      console.log('AsyncStorage methods:');
      console.log('- getItem:', typeof AsyncStorage.getItem);
      console.log('- setItem:', typeof AsyncStorage.setItem);
      console.log('- removeItem:', typeof AsyncStorage.removeItem);
    }
    
    // Run the test
    const testResult = await this.testAsyncStorage();
    console.log('AsyncStorage test result:', testResult);
    console.log('=== End AsyncStorage Debug ===');
    
    return testResult;
  }
}

export default AsyncStorageTest; 