import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
  Image,
  ScrollView,
  Platform,
} from 'react-native';
import { X, User, Briefcase, Info } from 'lucide-react-native';
import { colors, spacing, typography, radius } from '../../theme';
import { Speaker } from '../../types';

const { width, height } = Dimensions.get('window');

interface SpeakerBioModalProps {
  visible: boolean;
  onClose: () => void;
  speaker: Speaker | null;
}

const SpeakerBioModal: React.FC<SpeakerBioModalProps> = ({
  visible,
  onClose,
  speaker,
}) => {
  if (!speaker) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.sheet}>
              <View style={styles.dragIndicator} />
              
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeBtn}
              >
                <X size={20} color={colors.text.tertiary} />
              </TouchableOpacity>

              <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                <View style={styles.header}>
                  <View style={styles.imageContainer}>
                    {speaker.image ? (
                      <Image
                        source={{ uri: speaker.image }}
                        style={styles.speakerImage}
                      />
                    ) : (
                      <View style={[styles.speakerImage, styles.speakerPlaceholder]}>
                        <User size={48} color={colors.text.tertiary} />
                      </View>
                    )}
                    <View style={styles.roleBadge}>
                      <Briefcase size={12} color="white" />
                    </View>
                  </View>
                  
                  <Text style={styles.speakerName}>{speaker.name}</Text>
                  <Text style={styles.speakerRole}>{speaker.role}</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.bioSection}>
                  <View style={styles.sectionHeader}>
                    <Info size={16} color={colors.brand.primary} />
                    <Text style={styles.sectionTitle}>PROFESSIONAL BIO</Text>
                  </View>
                  <Text style={styles.bioText}>{speaker.bio || 'No bio available for this speaker.'}</Text>
                </View>

                <View style={styles.footer}>
                   <TouchableOpacity 
                    style={styles.closeActionBtn}
                    onPress={onClose}
                   >
                     <Text style={styles.closeActionText}>Close Profile</Text>
                   </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.layout.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: height * 0.85,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 20,
      },
    }),
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: colors.layout.divider,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  closeBtn: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.xl,
    padding: 8,
    borderRadius: 12,
    backgroundColor: colors.layout.surface,
    zIndex: 10,
  },
  scrollContent: {
    paddingBottom: spacing.xxl + 40,
  },
  header: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: spacing.lg,
  },
  speakerImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: 'white',
  },
  speakerPlaceholder: {
    backgroundColor: colors.palette.slate.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: colors.brand.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  speakerName: {
    fontFamily: typography.fontFamily,
    fontSize: 24,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: 4,
  },
  speakerRole: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.layout.divider,
    marginVertical: spacing.xl,
    width: '100%',
  },
  bioSection: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.brand.primary,
    letterSpacing: 1.5,
  },
  bioText: {
    fontFamily: typography.fontFamily,
    fontSize: 15,
    color: colors.text.secondary,
    lineHeight: 24,
  },
  footer: {
    marginTop: spacing.xl,
  },
  closeActionBtn: {
    height: 56,
    backgroundColor: colors.layout.surface,
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.layout.divider,
  },
  closeActionText: {
    fontFamily: typography.fontFamily,
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
});

export default SpeakerBioModal;
