import { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Image } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useColorScheme } from '@/hooks/useColorScheme';
import DashboardScreen from '@/components/DashboardScreen';
import RegisterScreen from '@/components/RegisterScreen';
import ForgotPasswordScreen from '@/components/ForgotPasswordScreen';

type ScreenMode = 'login' | 'register' | 'forgotPassword';

export default function HomeScreen() {
  const { user, isLoading, isAuthenticated, login } = useAuth();
  const [screenMode, setScreenMode] = useState<ScreenMode>('login');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      newErrors.mobile = 'मोबाइल नंबर आवश्यक है';
      isValid = false;
    } else if (!validateMobileNumber(mobileNumber)) {
      newErrors.mobile = 'कृपया वैध 10 अंकों का मोबाइल नंबर दर्ज करें';
      isValid = false;
    }

    // Validate password
    if (!password.trim()) {
      newErrors.password = 'पासवर्ड आवश्यक है';
      isValid = false;
    } else if (!validatePassword(password)) {
      newErrors.password = 'पासवर्ड कम से कम 4 अक्षर का होना चाहिए';
      isValid = false;
    }

    setErrors(newErrors);

    if (isValid) {
      try {
        setIsLoggingIn(true);
        await login(mobileNumber, password);
        // Login successful - the user will be redirected automatically
      } catch (error) {
        let errorMessage = 'लॉगिन असफल। कृपया दोबारा कोशिश करें।';
        
        if (error instanceof Error) {
          // Translate common error messages to Hindi
          if (error.message.includes('Invalid credentials') || error.message.includes('not found')) {
            errorMessage = 'गलत मोबाइल नंबर या पासवर्ड। कृपया सही जानकारी दर्ज करें।';
          } else if (error.message.includes('not verified')) {
            errorMessage = 'आपका खाता अभी तक सत्यापित नहीं है। कृपया व्यवस्थापक से संपर्क करें।';
          } else if (error.message.includes('network') || error.message.includes('fetch')) {
            errorMessage = 'नेटवर्क की समस्या। कृपया अपना इंटरनेट कनेक्शन जांचें।';
          }
        }
        
        Alert.alert('लॉगिन असफल', errorMessage);
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

  // Handle different screen modes
  if (screenMode === 'register') {
    return <RegisterScreen onNavigateToLogin={() => setScreenMode('login')} />;
  }

  if (screenMode === 'forgotPassword') {
    return <ForgotPasswordScreen onNavigateToLogin={() => setScreenMode('login')} />;
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
                backgroundColor: 'transparent',
                shadowColor: colorScheme === 'dark' ? '#000' : '#000',
                shadowOpacity: colorScheme === 'dark' ? 0.6 : 0.1,
                shadowOffset: colorScheme === 'dark' ? { width: 0, height: 12 } : { width: 0, height: 8 },
                shadowRadius: colorScheme === 'dark' ? 20 : 15,
                elevation: colorScheme === 'dark' ? 12 : 8,
                borderWidth: colorScheme === 'dark' ? 1 : 0,
                borderColor: colorScheme === 'dark' ? 'rgba(51, 65, 85, 0.3)' : 'transparent',
              }
            ]}>
              <ThemedText style={[styles.welcomeText, { color: textColor }]}>स्वागत है! Welcome Back!</ThemedText>
              <ThemedText style={[styles.subtitle, { color: colorScheme === 'dark' ? '#94a3b8' : 'rgba(0,0,0,0.7)' }]}>कृपया लॉगिन करें / Please login to continue</ThemedText>

              <ThemedView style={styles.formContainer}>
                {/* Mobile Number Input */}
                <ThemedView style={styles.inputContainer}>
                  <ThemedText style={[styles.label, { color: textColor }]}>📱 मोबाइल नंबर (Mobile Number)</ThemedText>
                  <TextInput
                    style={[
                      styles.input, 
                      { 
                        backgroundColor: colorScheme === 'dark' ? '#0f172a' : backgroundColor,
                        color: textColor,
                        borderColor: colorScheme === 'dark' ? '#475569' : '#e1e8ed',
                        borderWidth: colorScheme === 'dark' ? 1.5 : 2,
                      },
                      errors.mobile ? styles.inputError : null
                    ]}
                    placeholder="अपना मोबाइल नंबर दर्ज करें"
                    value={mobileNumber}
                    onChangeText={setMobileNumber}
                    keyboardType="numeric"
                    maxLength={10}
                    placeholderTextColor={colorScheme === 'dark' ? '#64748b' : '#999'}
                    editable={!isLoggingIn}
                  />
                  {errors.mobile ? <ThemedText style={styles.errorText}>{errors.mobile}</ThemedText> : null}
                </ThemedView>

                {/* Password Input */}
                <ThemedView style={styles.inputContainer}>
                  <ThemedText style={[styles.label, { color: textColor }]}>🔒 पासवर्ड (Password)</ThemedText>
                  <ThemedView style={styles.passwordContainer}>
                    <TextInput
                      style={[
                        styles.passwordInput, 
                        { 
                          backgroundColor: colorScheme === 'dark' ? '#0f172a' : backgroundColor,
                          color: textColor,
                          borderColor: colorScheme === 'dark' ? '#475569' : '#e1e8ed',
                          borderWidth: colorScheme === 'dark' ? 1.5 : 2,
                        },
                        errors.password ? styles.inputError : null
                      ]}
                      placeholder="अपना पासवर्ड दर्ज करें"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      placeholderTextColor={colorScheme === 'dark' ? '#64748b' : '#999'}
                      editable={!isLoggingIn}
                    />
                    <TouchableOpacity 
                      style={styles.eyeButton}
                      onPress={() => setShowPassword(!showPassword)}
                      disabled={isLoggingIn}
                    >
                      <ThemedText style={[styles.eyeIcon, { color: colorScheme === 'dark' ? '#94a3b8' : textColor }]}>
                        {showPassword ? '👁️' : '🙈'}
                      </ThemedText>
                    </TouchableOpacity>
                  </ThemedView>
                  {errors.password ? <ThemedText style={styles.errorText}>{errors.password}</ThemedText> : null}
                </ThemedView>

                {/* Submit Button */}
                <TouchableOpacity 
                  style={[
                    styles.submitButton, 
                    { 
                      backgroundColor: tintColor,
                      shadowColor: colorScheme === 'dark' ? tintColor : '#000',
                      shadowOpacity: colorScheme === 'dark' ? 0.4 : 0.3,
                      shadowOffset: colorScheme === 'dark' ? { width: 0, height: 6 } : { width: 0, height: 4 },
                      shadowRadius: colorScheme === 'dark' ? 12 : 8,
                    },
                    isLoggingIn && styles.submitButtonDisabled
                  ]} 
                  onPress={handleSubmit}
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <ThemedText style={styles.submitButtonText}>🚀 लॉगिन करें (Login)</ThemedText>
                  )}
                </TouchableOpacity>

                {/* Navigation Links */}
                <ThemedView style={styles.linksContainer}>
                  <TouchableOpacity 
                    onPress={() => setScreenMode('forgotPassword')} 
                    disabled={isLoggingIn}
                    style={styles.linkItem}
                  >
                    <ThemedText style={[styles.linkButton, { color: '#f39c12' }]}>
                      🔑 पासवर्ड भूल गए?
                    </ThemedText>
                  </TouchableOpacity>
                  
                  <ThemedView style={styles.linkSeparator}>
                    <ThemedText style={[styles.linkText, { color: textColor }]}>
                      नया उपयोगकर्ता हैं?{' '}
                    </ThemedText>
                    <TouchableOpacity 
                      onPress={() => setScreenMode('register')} 
                      disabled={isLoggingIn}
                    >
                      <ThemedText style={[styles.linkButton, { color: tintColor }]}>
                        पंजीकरण करें
                      </ThemedText>
                    </TouchableOpacity>
                  </ThemedView>
                </ThemedView>
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
    paddingBottom: 5,
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
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 15,
    paddingRight: 50,
    fontSize: 16,
  },
  eyeButton: {
    position: 'absolute',
    right: 15,
    top: 15,
    padding: 5,
  },
  eyeIcon: {
    fontSize: 20,
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
  linksContainer: {
    marginTop: 20,
    gap: 15,
  },
  linkItem: {
    alignItems: 'center',
  },
  linkSeparator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
  },
  linkButton: {
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  footer: {
    padding: 10,
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
