import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Mail, Lock, ShieldCheck } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import AuthLayout from '../../components/AuthLayout';
import InputField from '../../components/InputField';
import Button from '../../components/Button';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { validateEmail, validatePassword } from '../../utils/validation';
import { loginUser } from '../../services/authService';
import CustomLoader from '../../components/CustomLoader';

const LoginScreen = () => {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    setErrors({
      email: emailError || undefined,
      password: passwordError || undefined,
    });

    return !emailError && !passwordError;
  };

  const handleLogin = async () => {
    if (validate()) {
      setLoading(true);
      try {
        const result = await loginUser(email, password);
        const { role } = result.user;

        Toast.show({
          type: 'success',
          text1: 'Login Successful',
          text2: `Welcome ${role === 'admin' ? 'Admin' : 'back'}!`,
        });

        // Navigation is now handled automatically by AppNavigator observing AuthContext state
      } catch (error: any) {
        let message = 'Invalid email or password.';
        if (error.code === 'auth/user-not-found') {
          message = 'No account found with this email.';
        } else if (error.code === 'auth/wrong-password') {
          message = 'Incorrect password.';
        }

        Toast.show({
          type: 'error',
          text1: 'Login Failed',
          text2: message,
        });
      } finally {
        setLoading(false);
      }
    } else {
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: 'Please check the errors above.',
      });
    }
  };

  return (
    <AuthLayout>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <ShieldCheck size={48} color={colors.brand.primary} />
        </View>
        <Text style={styles.title}>Welcome to ISoP</Text>
        <Text style={styles.subtitle}>
          The Global Community for Pharmacovigilance Professionals
        </Text>
      </View>

      <View style={styles.form}>
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
          placeholder="Enter your password"
          leftIcon={Lock}
          isPassword
          value={password}
          onChangeText={text => {
            setPassword(text);
            if (errors.password) setErrors({ ...errors, password: undefined });
          }}
          error={errors.password}
        />

        <TouchableOpacity style={styles.forgotPassword}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        <Button
          title="Sign In"
          onPress={handleLogin}
          loading={loading}
          style={styles.submitBtn}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.linkText}>Register</Text>
          </TouchableOpacity>
        </View>
      </View>
      {loading && <CustomLoader overlay={true} message="Authenticating..." />}
    </AuthLayout>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: colors.layout.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    // Premium shadow
    shadowColor: colors.brand.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.title,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
    lineHeight: typography.lineHeights.sm,
  },
  form: {
    width: '100%',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: spacing.xl,
  },
  forgotPasswordText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semiBold,
    color: colors.brand.primary,
  },
  submitBtn: {
    marginBottom: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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

export default LoginScreen;
