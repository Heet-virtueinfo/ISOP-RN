import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import DatePicker from 'react-native-date-picker';
import { MapPin, AlignLeft, Type, Users } from 'lucide-react-native';
import { AppEvent, EventType } from '../../types';
import { colors, spacing, typography } from '../../theme';
import InputField from '../../components/InputField';
import Button from '../../components/Button';
import EventTypePicker from '../../components/EventTypePicker';
import ImagePickerGrid from '../../components/ImagePickerGrid';
import CustomLoader from '../../components/CustomLoader';
import { getEventById, updateEvent, deleteEvent } from '../../services/eventService';
import { formatEventDate } from '../../utils/eventHelpers';

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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      
      <ImagePickerGrid
        images={images}
        onChange={setImages}
        error={errors.images}
      />

      <EventTypePicker
        selectedType={type}
        onSelect={setType}
        error={errors.type}
      />

      <InputField
        label="Event Title"
        placeholder="Enter event name"
        leftIcon={Type}
        value={title}
        onChangeText={(text) => {
          setTitle(text);
          setErrors(prev => ({ ...prev, title: '' }));
        }}
        error={errors.title}
      />

      <InputField
        label="Description"
        placeholder="Event details and agenda..."
        leftIcon={AlignLeft}
        value={description}
        onChangeText={(text) => {
          setDescription(text);
          setErrors(prev => ({ ...prev, description: '' }));
        }}
        error={errors.description}
        multiline
        numberOfLines={4}
      />

      <View style={styles.datePickerContainer}>
        <Text style={styles.dateLabel}>Start Date & Time</Text>
        <Button
          title={formatEventDate(date)}
          onPress={() => setOpenDatePicker(true)}
          variant="outline"
          style={styles.dateBtn}
        />
        <DatePicker
          modal
          open={openDatePicker}
          date={date}
          onConfirm={(d) => {
            setOpenDatePicker(false);
            setDate(d);
          }}
          onCancel={() => setOpenDatePicker(false)}
        />
      </View>

      <View style={styles.datePickerContainer}>
        <Text style={styles.dateLabel}>End Date (Optional)</Text>
        <Button
          title={endDate ? formatEventDate(endDate) : 'Select End Date'}
          onPress={() => setOpenEndDatePicker(true)}
          variant="outline"
          style={styles.dateBtn}
        />
        <DatePicker
          modal
          open={openEndDatePicker}
          date={endDate || new Date()}
          onConfirm={(d) => {
            setOpenEndDatePicker(false);
            setEndDate(d);
            setErrors(prev => ({ ...prev, endDate: '' }));
          }}
          onCancel={() => setOpenEndDatePicker(false)}
        />
        {errors.endDate && <Text style={styles.errorText}>{errors.endDate}</Text>}
      </View>

      <InputField
        label="Location"
        placeholder="Venue name or Virtual link"
        leftIcon={MapPin}
        value={location}
        onChangeText={(text) => {
          setLocation(text);
          setErrors(prev => ({ ...prev, location: '' }));
        }}
        error={errors.location}
      />

      <InputField
        label="Max Capacity (Optional)"
        placeholder="e.g. 100"
        leftIcon={Users}
        keyboardType="numeric"
        value={maxCapacityStr}
        onChangeText={setMaxCapacityStr}
      />

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
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  datePickerContainer: {
    marginBottom: spacing.md,
  },
  dateLabel: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semiBold,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  dateBtn: {
    height: 48,
  },
  submitBtn: {
    marginTop: spacing.xl,
  },
  deleteBtn: {
    marginTop: spacing.md,
  },
  deleteBtnText: {
    color: colors.status.error,
  },
  errorText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs,
    color: colors.status.error,
    marginTop: spacing.xs,
  },
});

export default EditEventScreen;
