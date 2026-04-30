import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
  StatusBar,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import { Mail, User, Camera, Shield } from 'lucide-react-native';
import ImagePicker from 'react-native-image-crop-picker';
import InputField from '../../components/InputField';
import PhoneInputField from '../../components/PhoneInputField';
import Button from '../../components/Button';
import { colors, spacing, typography } from '../../theme';
import { useAuth } from '../../contexts/AuthContext';
import { validatePhone, validateName } from '../../utils/validation';
import { splitPhoneNumber } from '../../utils/countries';
import { updateUserProfile } from '../../services/profileService';
import CustomLoader from '../../components/CustomLoader';
import UserHeader from '../../components/UserHeader';

const EditProfileScreen = () => {
  const navigation = useNavigation<any>();
  const { userProfile, refreshProfile } = useAuth();
  const phoneParts = splitPhoneNumber(userProfile?.phoneNumber || '');

  const [profileImage, setProfileImage] = useState<string | null>(
    userProfile?.profileImage || null,
  );
  const [fullName, setFullName] = useState(userProfile?.displayName || '');
  const [mobile, setMobile] = useState(phoneParts.mobile);
  const [countryCode, setCountryCode] = useState(phoneParts.countryCode);

  const [errors, setErrors] = useState<{
    fullName?: string;
    mobile?: string;
  }>({});

  const [loading, setLoading] = useState(false);

  const validate = () => {
    const nameErr = validateName(fullName);
    const phoneErr = validatePhone(mobile);

    const newErrors = {
      fullName: nameErr || undefined,
      mobile: phoneErr || undefined,
    };

    setErrors(newErrors);

    return !Object.values(newErrors).some(err => err !== undefined);
  };

  const handleUpdate = async () => {
    if (validate() && userProfile) {
      setLoading(true);
      try {
        await updateUserProfile({
          display_name: fullName,
          phone_number: `${countryCode}${mobile}`,
          profileImage,
        });

        await refreshProfile();

        Toast.show({
          type: 'success',
          text1: 'Profile Updated',
          text2: 'Your changes have been saved successfully.',
        });
        navigation.goBack();
      } catch (error: any) {
        Toast.show({
          type: 'error',
          text1: 'Update Failed',
          text2: 'An error occurred while saving changes.',
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePickImage = () => {
    ImagePicker.openPicker({
      width: 300,
      height: 300,
      cropping: true,
      includeBase64: false,
      mediaType: 'photo',
      compressImageMaxWidth: 1024,
      compressImageMaxHeight: 1024,
      compressImageQuality: 0.8,
    })
      .then(image => {
        setProfileImage(image.path);
      })
      .catch(err => {
        if (err.code !== 'E_PICKER_CANCELLED') {
          const message =
            err.code === 'E_NO_CAMERA_PERMISSION' ||
            err.code === 'E_NO_LIBRARY_PERMISSION'
              ? 'Please grant camera and gallery permissions in Settings.'
              : 'Failed to select image. Please try again.';
          Toast.show({
            type: 'error',
            text1: 'Pick Image Error',
            text2: message,
          });
        }
      });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <UserHeader
        title="Edit Profile"
        showBack={true}
        onBackPress={() => navigation.goBack()}
        showActions={false}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Identity Card - Bento Style */}
        <View style={styles.identityCard}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarGlow} />
            <TouchableOpacity
              style={styles.avatarMain}
              onPress={handlePickImage}
              activeOpacity={0.9}
            >
              {profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  style={styles.avatarImage}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <User size={40} color={colors.brand.primary} />
                </View>
              )}
              <View style={styles.editOverlay}>
                <Camera size={16} color="white" />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.identityTextStack}>
            <Text style={styles.identityTitle}>Profile Identity</Text>
            <Text style={styles.identitySubtitle}>
              Represent your professional presence
            </Text>
          </View>

          {profileImage && (
            <TouchableOpacity
              style={styles.removeTextBtn}
              onPress={() => setProfileImage(null)}
            >
              <Text style={styles.removeText}>Remove Current Photo</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Core Information Card - Bento Style */}
        <View style={styles.bentoCard}>
          <Text style={styles.cardLabel}>Basic Information</Text>

          <InputField
            label="Full Name"
            placeholder="Enter your full name"
            leftIcon={User}
            autoCapitalize="words"
            value={fullName}
            onChangeText={text => {
              setFullName(text);
              if (errors.fullName)
                setErrors({ ...errors, fullName: undefined });
            }}
            error={errors.fullName}
          />

          <View style={styles.divider} />

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
        </View>

        <View style={styles.bentoCard}>
          <Text style={styles.cardLabel}>Linked Account</Text>

          <InputField
            label=""
            value={userProfile?.email}
            leftIcon={Mail}
            editable={false}
            containerStyle={styles.disabledInput}
          />
        </View>

        <Button
          title="Save Changes"
          onPress={handleUpdate}
          loading={loading}
          style={styles.submitBtn}
        />
      </ScrollView>
      {loading && <CustomLoader overlay={true} message="Saving Profile..." />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.layout.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: 40,
  },
  identityCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(241, 245, 249, 1)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
      },
      android: { elevation: 2 },
    }),
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarGlow: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 60,
    backgroundColor: colors.brand.primary + '05',
    borderWidth: 1,
    borderColor: colors.brand.primary + '10',
  },
  avatarMain: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.layout.background,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'white',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  editOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  identityTextStack: {
    alignItems: 'center',
    marginBottom: 12,
  },
  identityTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 18,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: 4,
  },
  identitySubtitle: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    color: colors.text.tertiary,
    fontWeight: '500',
  },
  removeTextBtn: {
    paddingVertical: 4,
  },
  removeText: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    color: colors.status.error,
    fontWeight: '600',
  },
  bentoCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: spacing.xl,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(241, 245, 249, 1)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
      },
      android: { elevation: 2 },
    }),
  },
  cardLabel: {
    fontFamily: typography.fontFamily,
    fontSize: 10,
    fontWeight: '800',
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(241, 245, 249, 1)',
    marginVertical: 12,
  },
  verifiedCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    padding: spacing.xl,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(241, 245, 249, 1)',
  },
  verifiedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  verifiedTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  verifiedCardTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 10,
    fontWeight: '800',
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  verifiedBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedText: {
    fontFamily: typography.fontFamily,
    fontSize: 8,
    fontWeight: '900',
    color: colors.status.success,
    letterSpacing: 1,
  },
  disabledInput: {
    // Styling handled by InputField component
  },
  hintText: {
    fontFamily: typography.fontFamily,
    fontSize: 10,
    color: colors.text.tertiary,
    fontStyle: 'italic',
    marginLeft: 4,
  },
  submitBtn: {
    marginTop: 20,
    height: 60,
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: colors.brand.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 15,
      },
      android: { elevation: 8 },
    }),
  },
});

export default EditProfileScreen;
