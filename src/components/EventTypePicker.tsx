import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, Pressable } from 'react-native';
import {
  ChevronDown,
  Check,
  Users,
  MonitorPlay,
  GraduationCap,
  CalendarDays
} from 'lucide-react-native';
import { EventType } from '../types';
import { colors, spacing, typography, radius } from '../theme';
import { getEventTypeLabel } from '../utils/eventHelpers';

interface EventTypePickerProps {
  selectedType: EventType;
  onSelect: (type: EventType) => void;
  error?: string;
  hideLabel?: boolean;
}

const EVENT_TYPES_CONFIG: { type: EventType; icon: any }[] = [
  { type: 'conference', icon: Users },
  { type: 'webinar', icon: MonitorPlay },
  { type: 'training', icon: GraduationCap },
  { type: 'meeting', icon: CalendarDays },
];

const EventTypePicker: React.FC<EventTypePickerProps> = ({
  selectedType,
  onSelect,
  error,
  hideLabel = false
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedConfig = EVENT_TYPES_CONFIG.find(c => c.type === selectedType) || EVENT_TYPES_CONFIG[0];
  const SelectedIcon = selectedConfig.icon;

  const handleSelect = (type: EventType) => {
    onSelect(type);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {!hideLabel && (
        <Text style={[styles.label, error && styles.labelError]}>Event Type</Text>
      )}

      {/* Dropdown Trigger */}
      <TouchableOpacity
        style={[
          styles.trigger,
          modalVisible && styles.triggerActive,
          error && styles.triggerError
        ]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <View style={styles.triggerLeft}>
          <View style={styles.iconContainer}>
            <SelectedIcon size={18} color={colors.brand.primary} />
          </View>
          <Text style={styles.triggerValue} numberOfLines={1} ellipsizeMode="tail">
            {getEventTypeLabel(selectedType)}
          </Text>
        </View>
        <ChevronDown size={20} color={colors.text.tertiary} style={styles.chevron} />
      </TouchableOpacity>

      {/* Selection Modal (Bottom Sheet Style) */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.sheetContainer}>
            <View style={styles.sheetHeader}>
              <View style={styles.sheetHandle} />
              <Text style={styles.sheetTitle}>Select Event Type</Text>
            </View>

            <View style={styles.optionsList}>
              {EVENT_TYPES_CONFIG.map((item) => {
                const isSelected = selectedType === item.type;
                const Icon = item.icon;

                return (
                  <TouchableOpacity
                    key={item.type}
                    style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                    onPress={() => handleSelect(item.type)}
                  >
                    <View style={styles.optionLeft}>
                      <View style={[styles.optionIconBox, isSelected && styles.optionIconBoxSelected]}>
                        <Icon size={20} color={isSelected ? colors.brand.primary : colors.text.secondary} />
                      </View>
                      <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                        {getEventTypeLabel(item.type)}
                      </Text>
                    </View>
                    {isSelected && <Check size={20} color={colors.brand.primary} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </Pressable>
      </Modal>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xs,
  },
  label: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semiBold,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  labelError: {
    color: colors.status.error,
  },
  trigger: {
    height: 52, // Slightly smaller
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm, // Reduced padding
    borderRadius: radius.lg, // Standardized radius
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: colors.ui.inputBorder,
  },
  triggerActive: {
    borderColor: colors.brand.primary,
    borderWidth: 1,
  },
  triggerError: {
    borderColor: colors.status.error,
  },
  triggerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  iconContainer: {
    marginRight: 10,
  },
  triggerValue: {
    flex: 1,
    fontFamily: typography.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.primary,
  },
  chevron: {
    flexShrink: 0,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: colors.layout.surface,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    paddingBottom: spacing.xxl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
  sheetHeader: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.ui.inputBorder,
    marginBottom: spacing.md,
  },
  sheetTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
  optionsList: {
    paddingHorizontal: spacing.md,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.xs,
  },
  optionRowSelected: {
    backgroundColor: colors.palette.indigo.bg,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.palette.slate.bg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  optionIconBoxSelected: {
    backgroundColor: colors.layout.surface,
  },
  optionLabel: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  optionLabelSelected: {
    fontWeight: '700',
    color: colors.brand.primary,
  },
  errorText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs,
    color: colors.status.error,
    marginTop: spacing.xs,
  },
});

export default EventTypePicker;
