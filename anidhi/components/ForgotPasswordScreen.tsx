import { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useColorScheme } from '@/hooks/useColorScheme';
import ApiService, { ForgotPasswordRequest } from '@/services/api';

interface ForgotPasswordScreenProps {
  onNavigateToLogin: () => void;
}

export default function ForgotPasswordScreen({ onNavigateToLogin }: ForgotPasswordScreenProps) {
  const [form, setForm] = useState({
    mobile: '',
    secretKey: '',
    newPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isResetting, setIsResetting] = useState(false);

  // Get current theme
  const colorScheme = useColorScheme();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  const handleChange = (field: string, value: string) => {
    if (field === 'mobile') {
      // Only allow numeric input and max 10 digits
      setForm({ ...form, [field]: value.replace(/\D/g, '').slice(0, 10) });
    } else {
      setForm({ ...form, [field]: value });
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    // Mobile validation
    if (!form.mobile.trim()) {
      newErrors.mobile = 'मोबाइल नंबर आवश्यक है';
    } else if (!/^[6-9]\d{9}$/.test(form.mobile)) {
      newErrors.mobile = 'कृपया वैध 10 अंकों का मोबाइल नंबर दर्ज करें';
    }

    // Secret key validation
    if (!form.secretKey.trim()) {
      newErrors.secretKey = 'गुप्त कुंजी आवश्यक है';
    }

    // Password validation
    if (!form.newPassword.trim()) {
      newErrors.newPassword = 'नया पासवर्ड आवश्यक है';
    } else if (form.newPassword.length < 4) {
      newErrors.newPassword = 'पासवर्ड कम से कम 4 अक्षर का होना चाहिए';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsResetting(true);
      
      const resetData: ForgotPasswordRequest = {
        mobile: form.mobile.trim(),
        secretKey: form.secretKey.trim(),
        newPassword: form.newPassword.trim(),
      };

      await ApiService.forgotPassword(resetData);
      
      Alert.alert(
        'पासवर्ड रीसेट सफल! 🎉',
        'आपका पासवर्ड सफलतापूर्वक बदल दिया गया है। कृपया नए पासवर्ड से लॉगिन करें।',
        [
          {
            text: 'लॉगिन करें',
            onPress: onNavigateToLogin,
          },
        ]
      );
    } catch (error) {
      let errorMessage = 'पासवर्ड रीसेट असफल। कृपया दोबारा कोशिश करें।';
      
      if (error instanceof Error) {
        // Translate common error messages to Hindi
        if (error.message.includes('User not found') || error.message.includes('not found')) {
          errorMessage = 'इस मोबाइल नंबर से कोई खाता नहीं मिला।';
        } else if (error.message.includes('Invalid secret') || error.message.includes('secret')) {
          errorMessage = 'गलत गुप्त कुंजी। कृपया सही गुप्त कुंजी दर्ज करें।';
        } else if (error.message.includes('validation')) {
          errorMessage = 'कृपया सभी जानकारी सही तरीके से भरें।';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'नेटवर्क की समस्या। कृपया अपना इंटरनेट कनेक्शन जांचें।';
        }
      }
      
      Alert.alert('पासवर्ड रीसेट असफल', errorMessage);
    } finally {
      setIsResetting(false);
    }
  };

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
          {/* Header */}
          <ThemedView style={styles.header}>
            <ThemedText style={[styles.title, { color: textColor }]}>पासवर्ड भूल गए?</ThemedText>
            <ThemedText style={styles.subtitle}>Forgot Password / पासवर्ड रीसेट</ThemedText>
            <ThemedText style={[styles.description, { color: textColor }]}>
              अपना मोबाइल नंबर, गुप्त कुंजी और नया पासवर्ड दर्ज करें
            </ThemedText>
          </ThemedView>

          {/* Reset Form */}
          <ThemedView style={styles.formContainer}>
            <ThemedView style={[
              styles.formCard, 
              { 
                backgroundColor: colorScheme === 'dark' ? '#1f2937' : '#ffffff',
                shadowColor: colorScheme === 'dark' ? '#000' : '#000',
                shadowOpacity: colorScheme === 'dark' ? 0.3 : 0.1,
              }
            ]}>

              {/* Mobile Input */}
              <ThemedView style={styles.inputContainer}>
                <ThemedText style={[styles.label, { color: textColor }]}>📱 मोबाइल नंबर (Mobile Number)</ThemedText>
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
                  placeholder="पंजीकृत मोबाइल नंबर दर्ज करें"
                  value={form.mobile}
                  onChangeText={(value) => handleChange('mobile', value)}
                  keyboardType="numeric"
                  maxLength={10}
                  placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#999'}
                  editable={!isResetting}
                />
                {errors.mobile ? <ThemedText style={styles.errorText}>{errors.mobile}</ThemedText> : null}
              </ThemedView>

              {/* Secret Key Input */}
              <ThemedView style={styles.inputContainer}>
                <ThemedText style={[styles.label, { color: textColor }]}>🔑 गुप्त कुंजी (Secret Key)</ThemedText>
                <TextInput
                  style={[
                    styles.input, 
                    { 
                      backgroundColor,
                      color: textColor,
                      borderColor: colorScheme === 'dark' ? '#374151' : '#e1e8ed'
                    },
                    errors.secretKey ? styles.inputError : null
                  ]}
                  placeholder="अपनी गुप्त कुंजी दर्ज करें"
                  value={form.secretKey}
                  onChangeText={(value) => handleChange('secretKey', value)}
                  placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#999'}
                  editable={!isResetting}
                  autoCapitalize="none"
                />
                {errors.secretKey ? <ThemedText style={styles.errorText}>{errors.secretKey}</ThemedText> : null}
                <ThemedText style={[styles.helpText, { color: textColor }]}>
                  💡 गुप्त कुंजी आपके डैशबोर्ड में मिलेगी
                </ThemedText>
              </ThemedView>

              {/* New Password Input */}
              <ThemedView style={styles.inputContainer}>
                <ThemedText style={[styles.label, { color: textColor }]}>🔒 नया पासवर्ड (New Password)</ThemedText>
                <ThemedView style={styles.passwordContainer}>
                  <TextInput
                    style={[
                      styles.passwordInput, 
                      { 
                        backgroundColor,
                        color: textColor,
                        borderColor: colorScheme === 'dark' ? '#374151' : '#e1e8ed'
                      },
                      errors.newPassword ? styles.inputError : null
                    ]}
                    placeholder="नया पासवर्ड दर्ज करें"
                    value={form.newPassword}
                    onChangeText={(value) => handleChange('newPassword', value)}
                    secureTextEntry={!showPassword}
                    placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#999'}
                    editable={!isResetting}
                  />
                  <TouchableOpacity 
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                    disabled={isResetting}
                  >
                    <ThemedText style={[styles.eyeIcon, { color: textColor }]}>
                      {showPassword ? '👁️' : '🙈'}
                    </ThemedText>
                  </TouchableOpacity>
                </ThemedView>
                {errors.newPassword ? <ThemedText style={styles.errorText}>{errors.newPassword}</ThemedText> : null}
              </ThemedView>

              {/* Submit Button */}
              <TouchableOpacity 
                style={[
                  styles.submitButton, 
                  { backgroundColor: '#f39c12' }, // Orange color for reset action
                  isResetting && styles.submitButtonDisabled
                ]} 
                onPress={handleSubmit}
                disabled={isResetting}
              >
                {isResetting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <ThemedText style={styles.submitButtonText}>🔄 पासवर्ड रीसेट करें</ThemedText>
                )}
              </TouchableOpacity>

              {/* Navigation Links */}
              <ThemedView style={styles.linksContainer}>
                <TouchableOpacity onPress={onNavigateToLogin} disabled={isResetting}>
                  <ThemedText style={[styles.linkButton, { color: tintColor }]}>
                    ← वापस लॉगिन पर जाएं
                  </ThemedText>
                </TouchableOpacity>
              </ThemedView>
            </ThemedView>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 10,
  },
  description: {
    fontSize: 13,
    textAlign: 'center',
    opacity: 0.8,
    paddingHorizontal: 20,
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  formCard: {
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
  inputContainer: {
    marginBottom: 18,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 8,
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
    marginTop: 5,
  },
  helpText: {
    fontSize: 12,
    marginTop: 5,
    opacity: 0.7,
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
    alignItems: 'center',
    marginTop: 20,
  },
  linkButton: {
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
