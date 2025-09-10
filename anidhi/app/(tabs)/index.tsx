import { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Image } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useColorScheme } from '@/hooks/useColorScheme';
import DashboardScreen from '@/components/DashboardScreen';

export default function HomeScreen() {
  const { user, isLoading, isAuthenticated, login } = useAuth();
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{mobile?: string; password?: string}>({});
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  // Get current theme
  const colorScheme = useColorScheme();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

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
        <ThemedView style={styles.logoContainer}>
          <Image 
            source={require('@/assets/images/aakasmik-nidhi-logo.png')} 
            style={styles.loadingLogo}
            resizeMode="contain"
          />
        </ThemedView>
        <ActivityIndicator size="large" color={tintColor} />
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
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <ThemedView style={[styles.backgroundContainer, { backgroundColor }]}>
          {/* Header with Logo and Branding */}
          <ThemedView style={styles.header}>
            <ThemedView style={styles.logoContainer}>
              <Image 
                source={require('@/assets/images/aakasmik-nidhi-logo.png')} 
                style={styles.logo}
                resizeMode="contain"
              />
            </ThemedView>
            <ThemedText style={[styles.orgName, { color: textColor }]}>आकस्मिक निधि युवा संस्था</ThemedText>
            <ThemedText style={[styles.orgNameEng, { color: textColor }]}>Aakasmik Nidhi Youth Organization</ThemedText>
            <ThemedText style={styles.tagline}>एक साथ, हम मजबूत हैं</ThemedText>
          </ThemedView>

          {/* Login Form */}
          <ThemedView style={styles.loginContainer}>
            <ThemedView style={[
              styles.loginCard, 
              { 
                backgroundColor: colorScheme === 'dark' ? '#1f2937' : '#ffffff',
                shadowColor: colorScheme === 'dark' ? '#000' : '#000',
                shadowOpacity: colorScheme === 'dark' ? 0.3 : 0.1,
              }
            ]}>
              <ThemedText style={[styles.welcomeText, { color: textColor }]}>Welcome Back!</ThemedText>
              <ThemedText style={styles.subtitle}>Please login to continue</ThemedText>

              <ThemedView style={styles.formContainer}>
                {/* Mobile Number Input */}
                <ThemedView style={styles.inputContainer}>
                  <ThemedText style={[styles.label, { color: textColor }]}>📱 Mobile Number</ThemedText>
                  <TextInput
                    style={[
                      styles.input, 
                      { 
                        backgroundColor,
                        color: textColor,
                        borderColor: colorScheme === 'dark' ? '#374151' : '#e1e8ed'
                      },
                      errors.mobile ? styles.inputError : null
                    ]}
                    placeholder="Enter your mobile number"
                    value={mobileNumber}
                    onChangeText={setMobileNumber}
                    keyboardType="numeric"
                    maxLength={10}
                    placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#999'}
                    editable={!isLoggingIn}
                  />
                  {errors.mobile ? <ThemedText style={styles.errorText}>{errors.mobile}</ThemedText> : null}
                </ThemedView>

                {/* Password Input */}
                <ThemedView style={styles.inputContainer}>
                  <ThemedText style={[styles.label, { color: textColor }]}>🔒 Password</ThemedText>
                  <TextInput
                    style={[
                      styles.input, 
                      { 
                        backgroundColor,
                        color: textColor,
                        borderColor: colorScheme === 'dark' ? '#374151' : '#e1e8ed'
                      },
                      errors.password ? styles.inputError : null
                    ]}
                    placeholder="Enter your password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#999'}
                    editable={!isLoggingIn}
                  />
                  {errors.password ? <ThemedText style={styles.errorText}>{errors.password}</ThemedText> : null}
                </ThemedView>

                {/* Submit Button */}
                <TouchableOpacity 
                  style={[
                    styles.submitButton, 
                    { backgroundColor: tintColor },
                    isLoggingIn && styles.submitButtonDisabled
                  ]} 
                  onPress={handleSubmit}
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <ThemedText style={styles.submitButtonText}>🚀 Login</ThemedText>
                  )}
                </TouchableOpacity>
              </ThemedView>
            </ThemedView>
          </ThemedView>

          {/* Footer */}
          <ThemedView style={styles.footer}>
            <ThemedText style={styles.footerText}>Made with ❤️ for our community</ThemedText>
            <ThemedText style={styles.footerSubtext}>© 2025 Aakasmik Nidhi Youth Organization</ThemedText>
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
  backgroundContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  loadingLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  orgName: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  orgNameEng: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 5,
    fontWeight: '500',
  },
  tagline: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
    opacity: 0.7,
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
  loginContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  loginCard: {
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 25,
    opacity: 0.7,
  },
  formContainer: {
    gap: 18,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 5,
    backgroundColor: 'transparent',
  },
  input: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 13,
  },
  submitButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    padding: 15,
    alignItems: 'center',
    marginTop: 'auto',
  },
  footerText: {
    fontSize: 13,
    textAlign: 'center',
    opacity: 0.6,
    marginBottom: 3,
  },
  footerSubtext: {
    fontSize: 11,
    textAlign: 'center',
    opacity: 0.5,
  },
});
