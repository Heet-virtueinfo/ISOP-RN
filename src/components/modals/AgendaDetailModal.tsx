import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
  ScrollView,
  Platform,
  Pressable,
} from 'react-native';
import { X, Clock, Calendar, Info } from 'lucide-react-native';
import { colors, spacing, typography, radius } from '../../theme';
import { AgendaItem } from '../../types';
import {
  formatEventTime,
  formatEventDate,
  cleanHtml,
} from '../../utils/eventHelpers';

const { width, height } = Dimensions.get('window');

interface AgendaDetailModalProps {
  visible: boolean;
  onClose: () => void;
  agendaItem: AgendaItem | null;
}

const AgendaDetailModal: React.FC<AgendaDetailModalProps> = ({
  visible,
  onClose,
  agendaItem,
}) => {
  if (!agendaItem) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.dragIndicator} />

          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X size={20} color={colors.text.tertiary} />
          </TouchableOpacity>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            nestedScrollEnabled={true}
          >
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Clock size={32} color={colors.brand.primary} />
              </View>
              <Text style={styles.agendaTitle}>{agendaItem.title}</Text>

              <View style={styles.timeBadge}>
                <Calendar size={14} color={colors.brand.primary} />
                <Text style={styles.timeText}>
                  {formatEventDate(agendaItem.startTime)} •{' '}
                  {formatEventTime(agendaItem.startTime)}
                  {agendaItem.endTime
                    ? ` – ${formatEventTime(agendaItem.endTime)}`
                    : ''}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailsSection}>
              <View style={styles.sectionHeader}>
                <Info size={16} color={colors.brand.primary} />
                <Text style={styles.sectionTitle}>SESSION DETAILS</Text>
              </View>
              <Text style={styles.descriptionText}>
                {agendaItem.description
                  ? cleanHtml(agendaItem.description)
                  : 'No additional details provided for this session.'}
              </Text>
            </View>

            <View style={styles.footer}>
              <TouchableOpacity style={styles.closeActionBtn} onPress={onClose}>
                <Text style={styles.closeActionText}>Close Details</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
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
    maxHeight: height * 0.8,
    flexShrink: 1,
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
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.brand.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  agendaTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 22,
    fontWeight: '800',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.layout.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.round,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.layout.divider,
  },
  timeText: {
    fontFamily: typography.fontFamily,
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.layout.divider,
    marginVertical: spacing.xl,
    width: '100%',
  },
  detailsSection: {
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
  descriptionText: {
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

export default AgendaDetailModal;
