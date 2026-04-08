import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  TextInput,
} from 'react-native';
import { X } from 'lucide-react-native';
import { colors, spacing, typography, radius } from '../../theme';
import Button from '../Button';
import StarRating from '../StarRating';

interface LeaveFeedbackModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
  eventName: string;
  loading?: boolean;
}

const LeaveFeedbackModal: React.FC<LeaveFeedbackModalProps> = ({
  visible,
  onClose,
  onSubmit,
  eventName,
  loading = false,
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleResetAndClose = () => {
    if (loading) return;
    setRating(0);
    setComment('');
    onClose();
  };

  const handleSubmit = () => {
    if (rating === 0) return;
    onSubmit(rating, comment.trim());
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleResetAndClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <View style={styles.modalContainer}>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={handleResetAndClose}
                disabled={loading}
              >
                <X size={20} color={colors.text.tertiary} />
              </TouchableOpacity>

              <Text style={styles.title}>Rate this Event</Text>
              <Text style={styles.subtitle}>{eventName}</Text>

              <View style={styles.ratingContainer}>
                <StarRating
                  rating={rating}
                  onRatingChange={setRating}
                  interactive
                  size={32}
                />
              </View>

              <Text style={styles.label}>Add a Written Review (Optional)</Text>
              <TextInput
                style={styles.textInput}
                multiline
                placeholder="What did you think of the event? Share your feedback..."
                placeholderTextColor={colors.text.tertiary}
                value={comment}
                onChangeText={setComment}
                maxLength={500}
                editable={!loading}
              />

              <Button
                title="Submit Feedback"
                onPress={handleSubmit}
                loading={loading}
                disabled={rating === 0 || loading}
                style={styles.submitBtn}
              />
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardView: {
    width: '100%',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: colors.layout.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    padding: spacing.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text.primary,
    fontFamily: typography.fontFamily,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    fontFamily: typography.fontFamily,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  ratingContainer: {
    marginBottom: spacing.xl,
  },
  label: {
    alignSelf: 'flex-start',
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  textInput: {
    width: '100%',
    height: 120,
    backgroundColor: colors.layout.background,
    borderRadius: radius.md,
    padding: spacing.md,
    paddingTop: spacing.md,
    fontSize: 14,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.layout.divider,
    textAlignVertical: 'top',
    marginBottom: spacing.xl,
  },
  submitBtn: {
    width: '100%',
  },
});

export default LeaveFeedbackModal;
