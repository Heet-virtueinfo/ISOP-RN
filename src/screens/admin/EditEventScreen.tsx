import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import DatePicker from 'react-native-date-picker';
import {
  MapPin,
  AlignLeft,
  Type,
  Users,
  Calendar as CalendarIcon,
  Image as ImageIcon,
  Layers,
  ChevronDown,
  CheckCircle2,
} from 'lucide-react-native';
import { AppEvent, EventType } from '../../types';
import { colors, spacing, typography } from '../../theme';
import InputField from '../../components/InputField';
import Button from '../../components/Button';
import EventTypePicker from '../../components/EventTypePicker';
import ImagePickerGrid from '../../components/ImagePickerGrid';
import CustomLoader from '../../components/CustomLoader';
import { getEventById, updateEvent, deleteEvent } from '../../services/eventService';
import { formatEventDate } from '../../utils/eventHelpers';

const BentoShell = ({ children, icon: Icon, title, isValid }: any) => (
  <View style={styles.shell}>
    {/* Floating Badge */}
    <View
      style={[styles.floatingBadge, isValid && styles.floatingBadgeValid]}
    >
      <Icon
        size={14}
        color={isValid ? colors.text.inverse : colors.brand.primary}
      />
      <Text
        style={[
          styles.floatingBadgeText,
          isValid && styles.floatingBadgeTextValid,
        ]}
      >
        {title}
      </Text>
      {isValid && (
        <CheckCircle2
          size={12}
          color={colors.text.inverse}
          style={{ marginLeft: 4 }}
        />
      )}
    </View>
    {children}
  </View>
);

const TimeNode = ({ label, value, onPress, isEnd = false }: any) => (
  <TouchableOpacity
    style={styles.timeNode}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.nodeIndicator}>
      <View style={[styles.nodeCircle, isEnd && styles.nodeCircleEnd]} />
    </View>
    <View style={styles.nodeContent}>
      <Text style={styles.nodeLabel}>{label}</Text>
      <Text style={styles.nodeValue}>{value}</Text>
    </View>
    <ChevronDown size={14} color={colors.text.tertiary} />
  </TouchableOpacity>
);

const EditEventScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { eventId } = route.params || {};
  
  const [eventData, setEventData] = useState<AppEvent | null>(null);
  const [loadingInitial, setLoadingInitial] = useState(true);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState<EventType>('conference');
  const [images, setImages] = useState<string[]>([]);
  const [maxCapacityStr, setMaxCapacityStr] = useState('');
  
  const [date, setDate] = useState(new Date());
  const [openDatePicker, setOpenDatePicker] = useState(false);
  
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [openEndDatePicker, setOpenEndDatePicker] = useState(false);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isMediaValid = images.length > 0;
  const isDetailsValid =
    title.trim().length > 0 && description.trim().length > 0;
  const isScheduleValid = location.trim().length > 0 && date !== null;

  useEffect(() => {
    if (!eventId) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'No event ID provided' });
      navigation.goBack();
      return;
    }

    const fetchEvent = async () => {
      try {
        const ev = await getEventById(eventId);
        if (ev) {
          setEventData(ev);
          setTitle(ev.title);
          setDescription(ev.description);
          setLocation(ev.location);
          setType(ev.type);
          setImages(ev.images || []);
          setMaxCapacityStr(ev.maxCapacity ? String(ev.maxCapacity) : '');
          
          if (ev.date) {
            setDate(ev.date.toDate ? ev.date.toDate() : new Date(ev.date));
          }
          if (ev.endDate) {
            setEndDate(ev.endDate.toDate ? ev.endDate.toDate() : new Date(ev.endDate));
          }
        } else {
          Toast.show({ type: 'error', text1: 'Not Found', text2: 'Event document does not exist' });
          navigation.goBack();
        }
      } catch (err) {
        Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load event data' });
      } finally {
        setLoadingInitial(false);
      }
    };
    
    fetchEvent();
  }, [eventId]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!location.trim()) newErrors.location = 'Location is required';
    if (images.length === 0) newErrors.images = 'At least 1 image is required';
    
    if (endDate && endDate < date) {
      newErrors.endDate = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate() || !eventId) {
      Toast.show({ type: 'error', text1: 'Validation Error', text2: 'Please check the required fields.' });
      return;
    }

    setSaving(true);
    try {
      await updateEvent(eventId, {
        title,
        description,
        location,
        type,
        images,
        date: date,
        endDate: endDate || undefined,
        maxCapacity: maxCapacityStr ? parseInt(maxCapacityStr, 10) : undefined,
      });

      Toast.show({ type: 'success', text1: 'Changes Saved', text2: 'The event has been updated.' });
      navigation.goBack();
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Save Failed', text2: 'Something went wrong while updating.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to permanently delete this event? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
             setDeleting(true);
             try {
               await deleteEvent(eventId);
               Toast.show({ type: 'success', text1: 'Deleted', text2: 'Event was successfully deleted.' });
               navigation.goBack();
             } catch(err) {
               Toast.show({ type: 'error', text1: 'Delete Failed', text2: 'Failed to delete event.' });
             } finally {
               setDeleting(false);
             }
          }
        }
      ]
    );
  };

  if (loadingInitial) {
    return <CustomLoader message="Loading Event Data..." overlay={false} />;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Media Section Module */}
      <BentoShell icon={ImageIcon} title="MEDIA Bin" isValid={isMediaValid}>
        <View style={styles.innerMedia}>
          <ImagePickerGrid
            images={images}
            onChange={setImages}
            error={errors.images}
          />
        </View>
      </BentoShell>

      {/* Basic Info Section Module */}
      <BentoShell icon={Layers} title="CORE INFO" isValid={isDetailsValid}>
        <View style={styles.innerContent}>
          <View style={styles.typePickerWrapper}>
            <EventTypePicker
              selectedType={type}
              onSelect={setType}
              error={errors.type}
            />
          </View>

          <InputField
            label="Event Title"
            placeholder="e.g. Innovation Summit"
            leftIcon={Type}
            value={title}
            onChangeText={text => {
              setTitle(text);
              setErrors((prev: any) => ({ ...prev, title: '' }));
            }}
            error={errors.title}
          />

          <InputField
            label="Description"
            placeholder="Agenda items..."
            leftIcon={AlignLeft}
            value={description}
            onChangeText={text => {
              setDescription(text);
              setErrors((prev: any) => ({ ...prev, description: '' }));
            }}
            error={errors.description}
            multiline
            numberOfLines={4}
            containerStyle={{ marginBottom: 0 }}
          />
        </View>
      </BentoShell>

      {/* Timeline & Location Module */}
      <BentoShell
        icon={CalendarIcon}
        title="LOGISTICS"
        isValid={isScheduleValid}
      >
        <View style={styles.innerContent}>
          {/* Timeline Rail */}
          <View style={styles.timelineRow}>
            <View style={styles.railLine} />
            <View style={styles.nodesContainer}>
              <TimeNode
                label="START TIME"
                value={formatEventDate(date)}
                onPress={() => setOpenDatePicker(true)}
              />
              <TimeNode
                label="END TIME"
                value={endDate ? formatEventDate(endDate) : 'Optional'}
                onPress={() => setOpenEndDatePicker(true)}
                isEnd
              />
            </View>
          </View>

          <DatePicker
            modal
            open={openDatePicker}
            date={date}
            onConfirm={(d: Date) => {
              setOpenDatePicker(false);
              setDate(d);
            }}
            onCancel={() => setOpenDatePicker(false)}
          />

          <DatePicker
            modal
            open={openEndDatePicker}
            date={endDate || new Date()}
            onConfirm={(d: Date) => {
              setOpenEndDatePicker(false);
              setEndDate(d);
              setErrors((prev: any) => ({ ...prev, endDate: '' }));
            }}
            onCancel={() => setOpenEndDatePicker(false)}
          />

          <InputField
            label="Location / Link"
            placeholder="Venue name or Virtual link"
            leftIcon={MapPin}
            value={location}
            onChangeText={text => {
              setLocation(text);
              setErrors((prev: any) => ({ ...prev, location: '' }));
            }}
            error={errors.location}
          />

          <InputField
            label="Capacity"
            placeholder="e.g. 500"
            leftIcon={Users}
            keyboardType="numeric"
            value={maxCapacityStr}
            onChangeText={setMaxCapacityStr}
            containerStyle={{ marginBottom: 0 }}
          />
        </View>
      </BentoShell>

      <Button
        title="Save Changes"
        onPress={handleSave}
        loading={saving}
        style={styles.submitBtn}
      />

      <Button
        title="Delete Event"
        onPress={handleDelete}
        loading={deleting}
        variant="ghost"
        style={styles.deleteBtn}
        textStyle={styles.deleteBtnText}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.layout.background,
  },
  content: {
    padding: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  shell: {
    backgroundColor: colors.layout.surface,
    borderRadius: 32,
    padding: spacing.xl,
    paddingTop: 48,
    marginBottom: spacing.xl,
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: colors.brand.primary,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
      },
      android: {
        elevation: 6,
      },
    }),
    borderWidth: 1.5,
    borderColor: colors.ui.inputBorderLight,
  },
  floatingBadge: {
    position: 'absolute',
    top: -12,
    left: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.layout.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.palette.indigo.bg,
    zIndex: 10,
    shadowColor: colors.brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  floatingBadgeValid: {
    backgroundColor: colors.status.success,
    borderColor: colors.status.success,
    shadowColor: colors.status.success,
    shadowOpacity: 0.3,
  },
  floatingBadgeText: {
    fontFamily: typography.fontFamily,
    fontSize: 10,
    fontWeight: '800',
    color: colors.text.secondary,
    marginLeft: 6,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  floatingBadgeTextValid: {
    color: colors.text.inverse,
  },
  innerMedia: {
    marginTop: 0,
  },
  innerContent: {
    width: '100%',
  },
  typePickerWrapper: {
    marginBottom: spacing.md,
    marginTop: 0,
  },
  timelineRow: {
    flexDirection: 'row',
    marginBottom: spacing.xl,
    position: 'relative',
  },
  railLine: {
    position: 'absolute',
    left: 17,
    top: 20,
    bottom: 20,
    width: 2,
    backgroundColor: colors.ui.inputBorderLight,
    zIndex: 1,
  },
  nodesContainer: {
    flex: 1,
    gap: spacing.sm,
    paddingLeft: spacing.xs,
  },
  timeNode: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.layout.background,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.ui.dividerLight,
    zIndex: 2,
  },
  nodeIndicator: {
    width: 20,
    alignItems: 'center',
    marginRight: 12,
  },
  nodeCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.brand.primary,
    borderWidth: 3,
    borderColor: colors.layout.surface,
  },
  nodeCircleEnd: {
    backgroundColor: colors.text.tertiary,
  },
  nodeContent: {
    flex: 1,
  },
  nodeLabel: {
    fontFamily: typography.fontFamily,
    fontSize: 9,
    fontWeight: '800',
    color: colors.text.tertiary,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  nodeValue: {
    fontFamily: typography.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.primary,
  },
  submitBtn: {
    marginTop: spacing.sm,
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.brand.primary,
    shadowColor: colors.brand.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  deleteBtn: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
  },
  deleteBtnText: {
    color: colors.status.error,
    fontWeight: '700',
  },
});

export default EditEventScreen;
