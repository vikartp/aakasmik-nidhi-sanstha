import { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/context/AuthContext';
import DashboardScreen from '@/components/DashboardScreen';

export default function HomeScreen() {
  const { user, isLoading, isAuthenticated, login } = useAuth();
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ mobile: '', password: '' });
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const validateMobileNumber = (mobile: string) => {
    const mobileRegex = /^[6-9]\d{9}$/;
    return mobileRegex.test(mobile);
  };

  const validatePassword = (pass: string) => {
    return pass.length >= 4; // Matching your backend validation
  };

  const handleSubmit = async () => {
    let newErrors = { mobile: '', password: '' };
    let isValid = true;

    // Validate mobile number
    if (!mobileNumber.trim()) {
      newErrors.mobile = 'Mobile number is required';
      isValid = false;
    } else if (!validateMobileNumber(mobileNumber)) {
      newErrors.mobile = 'Please enter a valid 10-digit mobile number';
      isValid = false;
    }

    // Validate password
    if (!password.trim()) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (!validatePassword(password)) {
      newErrors.password = 'Password must be at least 4 characters long';
      isValid = false;
    }

    setErrors(newErrors);

    if (isValid) {
      try {
        setIsLoggingIn(true);
        await login(mobileNumber, password);
        // Login successful - the user will be redirected automatically
      } catch (error) {
        Alert.alert('Login Failed', error instanceof Error ? error.message : 'An error occurred during login');
      } finally {
        setIsLoggingIn(false);
      }
    }
  };

  // Show loading spinner while checking auth status
  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <ThemedText style={styles.loadingText}>Loading...</ThemedText>
      </ThemedView>
    );
  }

  // Show dashboard if user is authenticated
  if (isAuthenticated && user) {
    return <DashboardScreen user={user} />;
  }

  // Show login form if not authenticated
  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <ThemedView style={styles.loginContainer}>
          <ThemedText style={styles.title}>Welcome to ANidhi</ThemedText>
          <ThemedText style={styles.subtitle}>Please login to continue</ThemedText>

          <ThemedView style={styles.formContainer}>
            {/* Mobile Number Input */}
            <ThemedView style={styles.inputContainer}>
              <ThemedText style={styles.label}>Mobile Number</ThemedText>
              <TextInput
                style={[styles.input, errors.mobile ? styles.inputError : null]}
                placeholder="Enter your mobile number"
                value={mobileNumber}
                onChangeText={setMobileNumber}
                keyboardType="numeric"
                maxLength={10}
                placeholderTextColor="#999"
                editable={!isLoggingIn}
              />
              {errors.mobile ? <ThemedText style={styles.errorText}>{errors.mobile}</ThemedText> : null}
            </ThemedView>

            {/* Password Input */}
            <ThemedView style={styles.inputContainer}>
              <ThemedText style={styles.label}>Password</ThemedText>
              <TextInput
                style={[styles.input, errors.password ? styles.inputError : null]}
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholderTextColor="#999"
                editable={!isLoggingIn}
              />
              {errors.password ? <ThemedText style={styles.errorText}>{errors.password}</ThemedText> : null}
            </ThemedView>

            {/* Submit Button */}
            <TouchableOpacity 
              style={[styles.submitButton, isLoggingIn && styles.submitButtonDisabled]} 
              onPress={handleSubmit}
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <ThemedText style={styles.submitButtonText}>Login</ThemedText>
              )}
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    opacity: 0.7,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    opacity: 0.7,
  },
  formContainer: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#000',
  },
  inputError: {
    borderColor: '#ff4444',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#999',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
