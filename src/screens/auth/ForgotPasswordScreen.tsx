import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Mail, ArrowLeft } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

import AuthLayout from '../../components/AuthLayout';
import InputField from '../../components/InputField';
import Button from '../../components/Button';
import CustomLoader from '../../components/CustomLoader';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { validateEmail } from '../../utils/validation';
import { resetPassword } from '../../services/authService';
import UserHeader from '../../components/UserHeader';

const ForgotPasswordScreen = () => {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      Toast.show({
        type: 'success',
        text1: 'Email Sent',
        text2: 'Check your inbox for a password reset link.',
      });
      navigation.goBack();
    } catch (err: any) {
      let message = 'Failed to send reset email. Please try again.';
      if (err.code === 'auth/user-not-found') {
        message = 'No account found with this email.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Invalid email address format.';
      }

      Toast.show({
        type: 'error',
        text1: 'Reset Failed',
        text2: message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>

      <UserHeader title="Reset Password" showBack={true} onBackPress={() => navigation.goBack()} showActions={false} />
      <AuthLayout>
        <View style={styles.header}>
          <Text style={styles.title}>ISOP</Text>
          <Text style={styles.subtitle}>
            Enter the email associated with your account and we'll send an email with instructions to reset your password.
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
            onChangeText={(text) => {
              setEmail(text);
              if (error) setError(undefined);
            }}
            error={error}
          />

          <Button
            title="Send Instructions"
            onPress={handleResetPassword}
            loading={loading}
            style={styles.submitBtn}
          />
        </View>
      </AuthLayout>

      {loading && <CustomLoader overlay={true} message="Sending..." />}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: spacing.xl,
    left: spacing.xl,
    zIndex: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: colors.layout.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  title: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography.lineHeights.md,
  },
  form: {
    width: '100%',
    paddingTop: spacing.lg,
  },
  submitBtn: {
    marginTop: spacing.xl,
  },
});

export default ForgotPasswordScreen;
