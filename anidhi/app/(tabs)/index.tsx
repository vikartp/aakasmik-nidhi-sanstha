import { useState, useRef, useEffect } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Image, Animated } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/context/AuthContext';
import DashboardScreen from '@/components/DashboardScreen';

export default function HomeScreen() {
  const { user, isLoading, isAuthenticated, login } = useAuth();
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{mobile?: string; password?: string}>({});
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    // Start animations when component mounts
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, logoScale]);

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
        <Animated.View style={[styles.logoContainer, { transform: [{ scale: logoScale }] }]}>
          <Image 
            source={require('@/assets/images/aakasmik-nidhi-logo.png')} 
            style={styles.loadingLogo}
            resizeMode="contain"
          />
        </Animated.View>
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
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <ThemedView style={styles.backgroundContainer}>
          {/* Header with Logo and Branding */}
          <Animated.View 
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <Animated.View style={[styles.logoContainer, { transform: [{ scale: logoScale }] }]}>
              <Image 
                source={require('@/assets/images/aakasmik-nidhi-logo.png')} 
                style={styles.logo}
                resizeMode="contain"
              />
            </Animated.View>
            <ThemedText style={styles.orgName}>आकस्मिक निधि युवा संस्था</ThemedText>
            <ThemedText style={styles.orgNameEng}>Aakasmik Nidhi Youth Organization</ThemedText>
            <ThemedText style={styles.tagline}>एक साथ, हम मजबूत हैं</ThemedText>
          </Animated.View>

          {/* Login Form */}
          <Animated.View 
            style={[
              styles.loginContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <ThemedView style={styles.loginCard}>
              <ThemedText style={styles.welcomeText}>Welcome Back!</ThemedText>
              <ThemedText style={styles.subtitle}>Please login to continue</ThemedText>

              <ThemedView style={styles.formContainer}>
                {/* Mobile Number Input */}
                <ThemedView style={styles.inputContainer}>
                  <ThemedText style={styles.label}>📱 Mobile Number</ThemedText>
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
                  <ThemedText style={styles.label}>🔒 Password</ThemedText>
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
                    <ThemedText style={styles.submitButtonText}>🚀 Login</ThemedText>
                  )}
                </TouchableOpacity>
              </ThemedView>
            </ThemedView>
          </Animated.View>

          {/* Footer */}
          <Animated.View 
            style={[
              styles.footer,
              {
                opacity: fadeAnim,
              }
            ]}
          >
            <ThemedText style={styles.footerText}>Made with ❤️ for our community</ThemedText>
            <ThemedText style={styles.footerSubtext}>© 2025 Aakasmik Nidhi Youth Organization</ThemedText>
          </Animated.View>
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
    backgroundColor: '#f8f9fa',
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
    color: '#2c3e50',
  },
  orgNameEng: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 5,
    color: '#34495e',
    fontWeight: '500',
  },
  tagline: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
    color: '#7f8c8d',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#f8f9fa',
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
    backgroundColor: '#ffffff',
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
    color: '#2c3e50',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 25,
    opacity: 0.7,
    color: '#7f8c8d',
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
    color: '#34495e',
    marginBottom: 5,
    backgroundColor: 'transparent',
  },
  input: {
    borderWidth: 2,
    borderColor: '#e1e8ed',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#ffffff',
    color: '#2c3e50',
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 13,
  },
  submitButton: {
    backgroundColor: '#3498db',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#3498db',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: {
    backgroundColor: '#bdc3c7',
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
    color: '#7f8c8d',
    marginBottom: 3,
  },
  footerSubtext: {
    fontSize: 11,
    textAlign: 'center',
    color: '#95a5a6',
  },
});
