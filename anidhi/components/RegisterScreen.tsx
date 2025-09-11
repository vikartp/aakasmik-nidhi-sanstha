import { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useColorScheme } from '@/hooks/useColorScheme';
import ApiService, { RegisterRequest } from '@/services/api';

interface RegisterScreenProps {
  onNavigateToLogin: () => void;
}

export default function RegisterScreen({ onNavigateToLogin }: RegisterScreenProps) {
  const [form, setForm] = useState({
    name: '',
    fatherName: '',
    email: '',
    mobile: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isRegistering, setIsRegistering] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');

  // Get current theme
  const colorScheme = useColorScheme();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  const getPasswordStrength = (password: string) => {
    if (password.length < 4) return 'बहुत छोटा';
    if (password.length < 6) return 'कमजोर';
    if (/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{6,}$/.test(password))
      return 'मजबूत';
    if (/^(?=.*[A-Z])(?=.*[0-9]).{6,}$/.test(password)) return 'मध्यम';
    return 'कमजोर';
  };

  const handleChange = (field: string, value: string) => {
    if (field === 'mobile') {
      // Only allow numeric input and max 10 digits
      setForm({ ...form, [field]: value.replace(/\D/g, '').slice(0, 10) });
    } else if (field === 'password') {
      setForm({ ...form, [field]: value });
      setPasswordStrength(getPasswordStrength(value));
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

    // Name validation
    if (!form.name.trim()) {
      newErrors.name = 'नाम आवश्यक है';
    }

    // Father's name validation
    if (!form.fatherName.trim()) {
      newErrors.fatherName = 'पिता का नाम आवश्यक है';
    }

    // Mobile validation
    if (!form.mobile.trim()) {
      newErrors.mobile = 'मोबाइल नंबर आवश्यक है';
    } else if (!/^[6-9]\d{9}$/.test(form.mobile)) {
      newErrors.mobile = 'कृपया वैध 10 अंकों का मोबाइल नंबर दर्ज करें';
    }

    // Password validation
    if (!form.password.trim()) {
      newErrors.password = 'पासवर्ड आवश्यक है';
    } else if (form.password.length < 4) {
      newErrors.password = 'पासवर्ड कम से कम 4 अक्षर का होना चाहिए';
    }

    // Email validation (optional)
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'कृपया वैध ईमेल पता दर्ज करें';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsRegistering(true);
      
      // Sanitize form data
      const sanitizedForm: RegisterRequest = {
        name: form.name.trim(),
        fatherName: form.fatherName.trim(),
        email: form.email.trim() || undefined,
        mobile: form.mobile.trim(),
        password: form.password.trim(),
      };

      await ApiService.register(sanitizedForm);
      
      Alert.alert(
        'पंजीकरण सफल! 🎉',
        'आपका खाता सफलतापूर्वक बना दिया गया है। कृपया लॉगिन करें।',
        [
          {
            text: 'लॉगिन करें',
            onPress: onNavigateToLogin,
          },
        ]
      );
    } catch (error) {
      let errorMessage = 'पंजीकरण असफल। कृपया दोबारा कोशिश करें।';
      
      if (error instanceof Error) {
        // Translate common error messages to Hindi
        if (error.message.includes('already exists') || error.message.includes('duplicate')) {
          errorMessage = 'यह मोबाइल नंबर पहले से पंजीकृत है।';
        } else if (error.message.includes('validation')) {
          errorMessage = 'कृपया सभी आवश्यक जानकारी सही तरीके से भरें।';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'नेटवर्क की समस्या। कृपया अपना इंटरनेट कनेक्शन जांचें।';
        }
      }
      
      Alert.alert('पंजीकरण असफल', errorMessage);
    } finally {
      setIsRegistering(false);
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
            <ThemedText style={[styles.title, { color: textColor }]}>नया खाता बनाएं</ThemedText>
            <ThemedText style={styles.subtitle}>Register / पंजीकरण</ThemedText>
          </ThemedView>

          {/* Registration Form */}
          <ThemedView style={styles.formContainer}>
            <ThemedView style={[
              styles.formCard, 
              { 
                backgroundColor: colorScheme === 'dark' ? '#1f2937' : '#ffffff',
                shadowColor: colorScheme === 'dark' ? '#000' : '#000',
                shadowOpacity: colorScheme === 'dark' ? 0.3 : 0.1,
              }
            ]}>

              {/* Name Input */}
              <ThemedView style={styles.inputContainer}>
                <ThemedText style={[styles.label, { color: textColor }]}>👤 नाम (Name)</ThemedText>
                <TextInput
                  style={[
                    styles.input, 
                    { 
                      backgroundColor,
                      color: textColor,
                      borderColor: colorScheme === 'dark' ? '#374151' : '#e1e8ed'
                    },
                    errors.name ? styles.inputError : null
                  ]}
                  placeholder="अपना नाम दर्ज करें"
                  value={form.name}
                  onChangeText={(value) => handleChange('name', value)}
                  placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#999'}
                  editable={!isRegistering}
                  autoCapitalize="words"
                />
                {errors.name ? <ThemedText style={styles.errorText}>{errors.name}</ThemedText> : null}
              </ThemedView>

              {/* Father's Name Input */}
              <ThemedView style={styles.inputContainer}>
                <ThemedText style={[styles.label, { color: textColor }]}>👨‍👦 पिता का नाम (Father&apos;s Name)</ThemedText>
                <TextInput
                  style={[
                    styles.input, 
                    { 
                      backgroundColor,
                      color: textColor,
                      borderColor: colorScheme === 'dark' ? '#374151' : '#e1e8ed'
                    },
                    errors.fatherName ? styles.inputError : null
                  ]}
                  placeholder="पिता का नाम दर्ज करें"
                  value={form.fatherName}
                  onChangeText={(value) => handleChange('fatherName', value)}
                  placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#999'}
                  editable={!isRegistering}
                  autoCapitalize="words"
                />
                {errors.fatherName ? <ThemedText style={styles.errorText}>{errors.fatherName}</ThemedText> : null}
              </ThemedView>

              {/* Email Input (Optional) */}
              <ThemedView style={styles.inputContainer}>
                <ThemedText style={[styles.label, { color: textColor }]}>📧 ईमेल (Email) - वैकल्पिक</ThemedText>
                <TextInput
                  style={[
                    styles.input, 
                    { 
                      backgroundColor,
                      color: textColor,
                      borderColor: colorScheme === 'dark' ? '#374151' : '#e1e8ed'
                    },
                    errors.email ? styles.inputError : null
                  ]}
                  placeholder="ईमेल पता दर्ज करें (वैकल्पिक)"
                  value={form.email}
                  onChangeText={(value) => handleChange('email', value)}
                  placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#999'}
                  editable={!isRegistering}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {errors.email ? <ThemedText style={styles.errorText}>{errors.email}</ThemedText> : null}
              </ThemedView>

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
                  placeholder="मोबाइल नंबर दर्ज करें"
                  value={form.mobile}
                  onChangeText={(value) => handleChange('mobile', value)}
                  keyboardType="numeric"
                  maxLength={10}
                  placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#999'}
                  editable={!isRegistering}
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
                        backgroundColor,
                        color: textColor,
                        borderColor: colorScheme === 'dark' ? '#374151' : '#e1e8ed'
                      },
                      errors.password ? styles.inputError : null
                    ]}
                    placeholder="पासवर्ड दर्ज करें"
                    value={form.password}
                    onChangeText={(value) => handleChange('password', value)}
                    secureTextEntry={!showPassword}
                    placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#999'}
                    editable={!isRegistering}
                  />
                  <TouchableOpacity 
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                    disabled={isRegistering}
                  >
                    <ThemedText style={[styles.eyeIcon, { color: textColor }]}>
                      {showPassword ? '👁️' : '🙈'}
                    </ThemedText>
                  </TouchableOpacity>
                </ThemedView>
                {errors.password ? <ThemedText style={styles.errorText}>{errors.password}</ThemedText> : null}
                {form.password && passwordStrength ? (
                  <ThemedText style={[
                    styles.passwordStrength,
                    {
                      color: passwordStrength === 'मजबूत' ? '#16a085' :
                             passwordStrength === 'मध्यम' ? '#f39c12' : '#e74c3c'
                    }
                  ]}>
                    पासवर्ड शक्ति: {passwordStrength}
                  </ThemedText>
                ) : null}
              </ThemedView>

              {/* Submit Button */}
              <TouchableOpacity 
                style={[
                  styles.submitButton, 
                  { backgroundColor: tintColor },
                  isRegistering && styles.submitButtonDisabled
                ]} 
                onPress={handleSubmit}
                disabled={isRegistering}
              >
                {isRegistering ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <ThemedText style={styles.submitButtonText}>🚀 पंजीकरण करें</ThemedText>
                )}
              </TouchableOpacity>

              {/* Login Link */}
              <ThemedView style={styles.linkContainer}>
                <ThemedText style={[styles.linkText, { color: textColor }]}>
                  पहले से खाता है?{' '}
                </ThemedText>
                <TouchableOpacity onPress={onNavigateToLogin} disabled={isRegistering}>
                  <ThemedText style={[styles.linkButton, { color: tintColor }]}>
                    लॉगिन करें
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
  passwordStrength: {
    fontSize: 12,
    marginTop: 5,
    fontWeight: '600',
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
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  linkText: {
    fontSize: 14,
  },
  linkButton: {
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
