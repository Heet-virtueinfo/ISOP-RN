import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import {
  Mail,
  Lock,
  User,
  ShieldCheck,
  Camera,
  X,
  ArrowLeft,
} from 'lucide-react-native';
import ImagePicker from 'react-native-image-crop-picker';
import AuthLayout from '../../components/AuthLayout';
import InputField from '../../components/InputField';
import PhoneInputField from '../../components/PhoneInputField';
import Button from '../../components/Button';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import {
  validateEmail,
  validatePassword,
  validatePhone,
  validateName,
} from '../../utils/validation';
import { defaultCountry } from '../../utils/countries';
import { registerUser } from '../../services/authService';
import CustomLoader from '../../components/CustomLoader';
import { useAuth } from '../../contexts/AuthContext';

const RegisterScreen = () => {
  const navigation = useNavigation<any>();
  const { refreshProfile } = useAuth();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [countryCode, setCountryCode] = useState(defaultCountry.value);
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errors, setErrors] = useState<{
    fullName?: string;
    mobile?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const [loading, setLoading] = useState(false);

  const validate = () => {
    const nameErr = validateName(fullName);
    const phoneErr = validatePhone(mobile);
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);
    let confirmErr = null;

    if (!confirmPassword) {
      confirmErr = 'Please confirm your password';
    } else if (confirmPassword !== password) {
      confirmErr = 'Passwords do not match';
    }

    const newErrors = {
      fullName: nameErr || undefined,
      mobile: phoneErr || undefined,
      email: emailErr || undefined,
      password: passErr || undefined,
      confirmPassword: confirmErr || undefined,
    };

    setErrors(newErrors);

    return !Object.values(newErrors).some(err => err !== undefined);
  };

  const handleRegister = async () => {
    if (validate()) {
      setLoading(true);
      try {
        await registerUser({
          fullName,
          email,
          password,
          mobile,
          countryCode,
          profileImage,
        });

        // Push the new profile into AuthContext so the navigator re-renders
        await refreshProfile();

        Toast.show({
          type: 'success',
          text1: 'Registration Successful',
          text2: 'Welcome to ISoP! Your profile is ready.',
        });
        // Navigation is handled automatically by AppNavigator
      } catch (error: any) {
        Toast.show({
          type: 'error',
          text1: 'Registration Failed',
          text2: error?.message ?? 'Registration failed. Please try again.',
        });
      } finally {
        setLoading(false);
      }
    } else {
      Toast.show({
        type: 'error',
        text1: 'Registration Error',
        text2: 'Please fix the highlighted errors.',
      });
    }
  };

  const handlePickImage = () => {
    ImagePicker.openPicker({
      width: 300,
      height: 300,
      cropping: true,
      includeBase64: false,
      mediaType: 'photo',
    })
      .then(image => {
        setProfileImage(image.path);
      })
      .catch(err => {
        if (err.code !== 'E_PICKER_CANCELLED') {
          Toast.show({
            type: 'error',
            text1: 'Pick Image Error',
            text2: 'Failed to select image. Please try again.',
          });
        }
      });
  };

  const removeImage = () => {
    setProfileImage(null);
  };

  return (
    <AuthLayout>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
      >
        <ArrowLeft size={24} color={colors.text.primary} />
      </TouchableOpacity>

      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <ShieldCheck size={32} color={colors.brand.primary} />
        </View>
        <Text style={styles.title}>Join ISoP</Text>
        <Text style={styles.subtitle}>
          Create an account to access our global network of PV experts.
        </Text>
      </View>

      <View style={styles.form}>
        {/* Profile Image Picker */}
        <View style={styles.imagePickerContainer}>
          <TouchableOpacity
            style={styles.imagePicker}
            onPress={handlePickImage}
            activeOpacity={0.7}
          >
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={styles.selectedImage}
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Camera size={28} color={colors.text.tertiary} />
                <Text style={styles.imagePlaceholderText}>Add Photo</Text>
              </View>
            )}
          </TouchableOpacity>
          {profileImage && (
            <TouchableOpacity
              style={styles.removeImageBtn}
              onPress={removeImage}
            >
              <X size={16} color={colors.text.inverse} />
            </TouchableOpacity>
          )}
        </View>

        <InputField
          label="Full Name"
          placeholder="Enter your full name"
          leftIcon={User}
          autoCapitalize="words"
          value={fullName}
          onChangeText={text => {
            setFullName(text);
            if (errors.fullName) setErrors({ ...errors, fullName: undefined });
          }}
          error={errors.fullName}
        />

        <PhoneInputField
          label="Mobile Number"
          placeholder="e.g. 234 567 890"
          value={mobile}
          onChangeText={text => {
            setMobile(text);
            if (errors.mobile) setErrors({ ...errors, mobile: undefined });
          }}
          countryCode={countryCode}
          onCountryCodeChange={setCountryCode}
          error={errors.mobile}
        />

        <InputField
          label="Email Address"
          placeholder="Enter your email"
          leftIcon={Mail}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={text => {
            setEmail(text);
            if (errors.email) setErrors({ ...errors, email: undefined });
          }}
          error={errors.email}
        />

        <InputField
          label="Password"
          placeholder="Create a password"
          leftIcon={Lock}
          isPassword
          value={password}
          onChangeText={text => {
            setPassword(text);
            if (errors.password) setErrors({ ...errors, password: undefined });
          }}
          error={errors.password}
        />

        <InputField
          label="Confirm Password"
          placeholder="Confirm your password"
          leftIcon={Lock}
          isPassword
          value={confirmPassword}
          onChangeText={text => {
            setConfirmPassword(text);
            if (errors.confirmPassword)
              setErrors({ ...errors, confirmPassword: undefined });
          }}
          error={errors.confirmPassword}
        />

        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>
            By creating an account, you agree to our{' '}
            <Text style={styles.linkText}>Terms of Service</Text> and{' '}
            <Text style={styles.linkText}>Privacy Policy</Text>.
          </Text>
        </View>

        <Button
          title="Create Account"
          onPress={handleRegister}
          loading={loading}
          style={styles.submitBtn}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </AuthLayout>
  );
};

const styles = StyleSheet.create({
  backButton: {
    position: 'absolute',
    left: 0,
    top: -spacing.xl,
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.layout.surface,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: colors.brand.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.layout.divider,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: colors.layout.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
    shadowColor: colors.brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
    marginBottom: spacing.xxs,
  },
  subtitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  form: {
    width: '100%',
  },
  imagePickerContainer: {
    alignSelf: 'center',
    marginBottom: spacing.lg,
    position: 'relative',
  },
  imagePicker: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.layout.surfaceElevated,
    borderWidth: 1.5,
    borderColor: colors.ui.inputBorder,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
    marginTop: spacing.xxs,
  },
  removeImageBtn: {
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: colors.status.error,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.layout.background,
  },
  termsContainer: {
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.xxs,
  },
  termsText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography.lineHeights.xs,
  },
  submitBtn: {
    marginBottom: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  footerText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  linkText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
  },
});

export default RegisterScreen;
