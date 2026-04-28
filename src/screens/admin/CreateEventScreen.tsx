import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  Platform,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import DateTimePicker from '@react-native-community/datetimepicker';
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
  Plus,
  Trash2,
  Edit2,
  User,
  Clock,
} from 'lucide-react-native';
import { EventType, Speaker, AgendaItem } from '../../types';
import { colors, spacing, typography, radius } from '../../theme';
import InputField from '../../components/InputField';
import Button from '../../components/Button';
import EventTypePicker from '../../components/EventTypePicker';
import ImagePickerGrid from '../../components/ImagePickerGrid';
import {
  adminCreateEvent,
  adminBroadcastNotification,
} from '../../services/admin';
import { formatEventDate } from '../../utils/eventHelpers';
import BentoFormTile from '../../components/BentoFormTile';

const TimeNode = ({ label, value, onPress, isEnd = false, error }: any) => (
  <TouchableOpacity
    style={[styles.timeNode, error && styles.timeNodeError]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.nodeIndicator}>
      <View
        style={[
          styles.nodeCircle,
          isEnd && styles.nodeCircleEnd,
          error && styles.nodeCircleError,
        ]}
      />
    </View>
    <View style={styles.nodeContent}>
      <Text style={[styles.nodeLabel, error && styles.nodeLabelError]}>
        {label}
      </Text>
      <Text style={styles.nodeValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
    <View style={styles.nodeAction}>
      <ChevronDown
        size={14}
        color={error ? colors.status.error : colors.text.tertiary}
      />
    </View>
  </TouchableOpacity>
);

const CreateEventScreen = () => {
  const navigation = useNavigation<any>();

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
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [modalErrors, setModalErrors] = useState<Record<string, string>>({});

  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [agenda, setAgenda] = useState<AgendaItem[]>([]);

  const [speakerModalVisible, setSpeakerModalVisible] = useState(false);
  const [editingSpeaker, setEditingSpeaker] = useState<Speaker | null>(null);
  const [tempSpeaker, setTempSpeaker] = useState<Partial<Speaker>>({});

  const [agendaModalVisible, setAgendaModalVisible] = useState(false);
  const [editingAgenda, setEditingAgenda] = useState<AgendaItem | null>(null);
  const [tempAgenda, setTempAgenda] = useState<Partial<AgendaItem>>({});
  const [agendaStartTime, setAgendaStartTime] = useState(new Date());
  const [agendaEndTime, setAgendaEndTime] = useState(new Date());
  const [showItemStartPicker, setShowItemStartPicker] = useState(false);
  const [showItemEndPicker, setShowItemEndPicker] = useState(false);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setLocation('');
    setType('conference');
    setImages([]);
    setMaxCapacityStr('');
    setDate(new Date());
    setEndDate(null);
    setSpeakers([]);
    setAgenda([]);
    setErrors({});
  };

  // Validation Flags for Bento Dashboard
  const isMediaValid = images.length > 0;
  const isDetailsValid =
    title.trim().length > 2 && description.trim().length > 10;
  const isLogisticsValid =
    location.trim().length > 0 && date !== null && endDate !== null;
  const isTalentValid = speakers.length > 0;
  const isRoadmapValid = agenda.length > 0;

  const totalProgress = [
    isMediaValid,
    isDetailsValid,
    isLogisticsValid,
    isTalentValid,
    isRoadmapValid,
  ].filter(Boolean).length;
  const progressPercent = (totalProgress / 5) * 100;

  const handleCreate = async () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!location.trim()) newErrors.location = 'Location is required';
    if (!maxCapacityStr.trim()) newErrors.capacity = 'Capacity is required';
    if (!type) newErrors.type = 'Event Type is required';
    if (!date) newErrors.date = 'Start Time is required';
    if (!endDate) newErrors.endDate = 'End Time is required';
    if (images.length === 0) newErrors.images = 'At least 1 image is required';
    if (speakers.length === 0)
      newErrors.speakers = 'At least 1 speaker is required';
    if (agenda.length === 0)
      newErrors.agenda = 'At least 1 agenda item is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstError = Object.values(newErrors)[0];
      Toast.show({
        type: 'error',
        text1: 'Required Intel Missing',
        text2: firstError,
      });
      return;
    }

    setLoading(true);
    try {
      const event = await adminCreateEvent({
        title,
        description,
        location,
        type,
        images,
        date: date,
        ...(endDate && { endDate }),
        ...(maxCapacityStr && { maxCapacity: parseInt(maxCapacityStr, 10) }),
        speakers,
        agenda,
      });

      if (event?.id) {
        try {
          await adminBroadcastNotification({
            title: 'New Event Published!',
            body: `${title} is now live at ${location}. Check it out now!`,
            data: {
              screen: 'EventDetail',
              eventId: event.id,
            },
          });
        } catch (notifError) {
          console.error('Error sending broadcast notification:', notifError);
        }
      }

      Toast.show({
        type: 'success',
        text1: 'Event Created',
        text2: 'The event has been successfully published.',
      });

      resetForm();
      navigation.navigate('EventsTab');
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Creation Failed',
        text2: 'Something went wrong.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSpeaker = () => {
    const newModalErrors: Record<string, string> = {};
    if (!tempSpeaker.name?.trim())
      newModalErrors.name = 'Full Name is required';
    if (!tempSpeaker.role?.trim()) newModalErrors.role = 'Role is required';
    if (!tempSpeaker.bio?.trim()) newModalErrors.bio = 'Bio is required';
    if (!tempSpeaker.image) newModalErrors.image = 'Photo is required';

    if (Object.keys(newModalErrors).length > 0) {
      setModalErrors(newModalErrors);
      return;
    }

    if (editingSpeaker) {
      setSpeakers(prev =>
        prev.map(s =>
          s.id === editingSpeaker.id
            ? { ...s, ...(tempSpeaker as Speaker) }
            : s,
        ),
      );
    } else {
      setSpeakers(prev => [
        ...prev,
        {
          ...(tempSpeaker as Speaker),
          id: Math.random().toString(36).substr(2, 9),
        },
      ]);
    }
    setSpeakerModalVisible(false);
  };

  const handleConfirmAgenda = () => {
    const newModalErrors: Record<string, string> = {};
    if (!tempAgenda.title?.trim()) newModalErrors.title = 'Title is required';
    if (!tempAgenda.description?.trim())
      newModalErrors.description = 'Description is required';

    if (Object.keys(newModalErrors).length > 0) {
      setModalErrors(newModalErrors);
      return;
    }

    const item: AgendaItem = {
      ...(tempAgenda as AgendaItem),
      id: editingAgenda?.id || Math.random().toString(36).substr(2, 9),
      startTime: agendaStartTime,
      endTime: agendaEndTime,
    };
    if (editingAgenda) {
      setAgenda(prev => prev.map(a => (a.id === editingAgenda.id ? item : a)));
    } else {
      setAgenda(prev => [...prev, item]);
    }
    setAgendaModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Status Dashboard */}
        <View style={styles.dashboard}>
          <View style={styles.dashboardHeader}>
            <View>
              <Text style={styles.dashboardTitle}>Event Configuration</Text>
              <Text style={styles.dashboardSub}>
                Phase {totalProgress} of 5 Complete
              </Text>
            </View>
            <View style={styles.progressCircle}>
              <Text style={styles.progressText}>
                {Math.round(progressPercent)}%
              </Text>
            </View>
          </View>

          <View style={styles.indicatorRow}>
            <View
              style={[styles.indicator, isMediaValid && styles.indicatorValid]}
            >
              <ImageIcon
                size={14}
                color={isMediaValid ? 'white' : colors.text.tertiary}
              />
            </View>
            <View style={styles.indicatorLine} />
            <View
              style={[
                styles.indicator,
                isDetailsValid && styles.indicatorValid,
              ]}
            >
              <Layers
                size={14}
                color={isDetailsValid ? 'white' : colors.text.tertiary}
              />
            </View>
            <View style={styles.indicatorLine} />
            <View
              style={[
                styles.indicator,
                isLogisticsValid && styles.indicatorValid,
              ]}
            >
              <CalendarIcon
                size={14}
                color={isLogisticsValid ? 'white' : colors.text.tertiary}
              />
            </View>
            <View style={styles.indicatorLine} />
            <View
              style={[styles.indicator, isTalentValid && styles.indicatorValid]}
            >
              <User
                size={14}
                color={isTalentValid ? 'white' : colors.text.tertiary}
              />
            </View>
            <View style={styles.indicatorLine} />
            <View
              style={[
                styles.indicator,
                isRoadmapValid && styles.indicatorValid,
              ]}
            >
              <Clock
                size={14}
                color={isRoadmapValid ? 'white' : colors.text.tertiary}
              />
            </View>
          </View>
        </View>

        {/* Media Center */}
        <BentoFormTile
          icon={ImageIcon}
          title="MEDIA HUB"
          isValid={isMediaValid}
        >
          <View style={styles.innerMedia}>
            <ImagePickerGrid
              images={images}
              onChange={imgs => {
                setImages(imgs);
                setErrors(prev => ({ ...prev, images: '' }));
              }}
              error={errors.images}
            />
          </View>
        </BentoFormTile>

        {/* Logistics Grid */}
        <BentoFormTile
          icon={CalendarIcon}
          title="TIMELINE"
          isValid={isLogisticsValid}
        >
          <View style={styles.timelineRow}>
            <View style={styles.railLine} />
            <View style={styles.nodesContainer}>
              <TimeNode
                label="START TIME"
                value={formatEventDate(date)}
                onPress={() => setOpenDatePicker(true)}
                error={errors.date}
              />
              <TimeNode
                label="END TIME"
                value={endDate ? formatEventDate(endDate) : 'Required'}
                onPress={() => setOpenEndDatePicker(true)}
                isEnd
                error={errors.endDate}
              />
            </View>
          </View>
        </BentoFormTile>

        <View style={styles.dualGrid}>
          <BentoFormTile
            icon={Type}
            title="TYPE"
            isValid={!!type}
            fullWidth={false}
          >
            <EventTypePicker
              selectedType={type}
              onSelect={t => setType(t)}
              hideLabel={true}
              error={errors.type}
            />
          </BentoFormTile>

          <BentoFormTile
            icon={Users}
            title="CAPACITY"
            isValid={!!maxCapacityStr}
            fullWidth={false}
          >
            <InputField
              placeholder="Limit"
              keyboardType="numeric"
              value={maxCapacityStr}
              onChangeText={setMaxCapacityStr}
              containerStyle={{ marginBottom: 0 }}
              style={{ fontSize: 13 }}
            />
          </BentoFormTile>
        </View>

        <BentoFormTile
          icon={MapPin}
          title="LOCATION"
          isValid={location.length > 0}
        >
          <InputField
            placeholder="Venue name or Virtual link"
            value={location}
            onChangeText={setLocation}
            containerStyle={{ marginBottom: 0 }}
            error={errors.location}
          />
        </BentoFormTile>

        {/* Core Content */}
        <BentoFormTile icon={Layers} title="DETAILS" isValid={isDetailsValid}>
          <InputField
            label="Event Title"
            placeholder="Innovation Summit..."
            leftIcon={Type}
            value={title}
            onChangeText={setTitle}
            error={errors.title}
          />
          <InputField
            label="Description"
            placeholder="Tell us about the event..."
            leftIcon={AlignLeft}
            value={description}
            onChangeText={setDescription}
            error={errors.description}
            multiline
            numberOfLines={4}
            containerStyle={{ marginBottom: 0 }}
          />
        </BentoFormTile>

        {/* Talent Section */}
        <BentoFormTile icon={User} title="TALENT" isValid={isTalentValid}>
          <View style={styles.listContainer}>
            {speakers.map(s => (
              <View key={s.id} style={styles.listItem}>
                <View style={styles.listContent}>
                  <Text style={styles.listItemTitle}>{s.name}</Text>
                  <Text style={styles.listItemSub}>{s.role}</Text>
                </View>
                <View style={styles.listActions}>
                  <TouchableOpacity
                    onPress={() => {
                      setEditingSpeaker(s);
                      setTempSpeaker(s);
                      setSpeakerModalVisible(true);
                    }}
                  >
                    <Edit2 size={16} color={colors.brand.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      setSpeakers(prev => prev.filter(i => i.id !== s.id))
                    }
                  >
                    <Trash2 size={16} color={colors.status.error} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            <TouchableOpacity
              style={styles.addItemBtn}
              onPress={() => {
                setEditingSpeaker(null);
                setTempSpeaker({ name: '', role: '', bio: '', image: null });
                setSpeakerModalVisible(true);
              }}
            >
              <Plus size={18} color={colors.brand.primary} />
              <Text style={styles.addItemText}>Add Speaker Profile</Text>
            </TouchableOpacity>
          </View>
        </BentoFormTile>

        {/* Roadmap (Agenda) */}
        <BentoFormTile icon={Clock} title="ROADMAP" isValid={isRoadmapValid}>
          <View style={styles.listContainer}>
            {agenda
              .sort(
                (a, b) =>
                  new Date(a.startTime).getTime() -
                  new Date(b.startTime).getTime(),
              )
              .map(a => (
                <View key={a.id} style={styles.listItem}>
                  <View style={styles.listContent}>
                    <Text style={styles.listItemTitle}>{a.title}</Text>
                    <Text style={styles.listItemSub}>
                      {formatEventDate(a.startTime)}
                    </Text>
                  </View>
                  <View style={styles.listActions}>
                    <TouchableOpacity
                      onPress={() => {
                        setEditingAgenda(a);
                        setTempAgenda(a);
                        setAgendaStartTime(new Date(a.startTime));
                        setAgendaModalVisible(true);
                      }}
                    >
                      <Edit2 size={16} color={colors.brand.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() =>
                        setAgenda(prev => prev.filter(i => i.id !== a.id))
                      }
                    >
                      <Trash2 size={16} color={colors.status.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            <TouchableOpacity
              style={styles.addItemBtn}
              onPress={() => {
                setEditingAgenda(null);
                setTempAgenda({ title: '', description: '' });
                setAgendaStartTime(new Date(date));
                setAgendaModalVisible(true);
              }}
            >
              <Plus size={18} color={colors.brand.primary} />
              <Text style={styles.addItemText}>Add Session Item</Text>
            </TouchableOpacity>
          </View>
        </BentoFormTile>
      </ScrollView>

      {/* Sticky Action Footer */}
      <View style={styles.footer}>
        <Button
          title="Publish Event"
          onPress={handleCreate}
          loading={loading}
          style={styles.stickySubmitBtn}
          leftIcon={CheckCircle2}
        />
      </View>

      {/* DateTime Pickers (Unified Logic) */}
      {(openDatePicker || openEndDatePicker) &&
        (Platform.OS === 'ios' ? (
          <Modal transparent animationType="slide">
            <TouchableWithoutFeedback
              onPress={() => {
                setOpenDatePicker(false);
                setOpenEndDatePicker(false);
              }}
            >
              <View style={styles.modalOverlay} />
            </TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {openDatePicker ? 'Start Time' : 'End Time'}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setOpenDatePicker(false);
                    setOpenEndDatePicker(false);
                  }}
                >
                  <Text style={styles.modalDoneBtn}>Done</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.pickerWrapper}>
                <DateTimePicker
                  value={openDatePicker ? date : endDate || new Date()}
                  mode="datetime"
                  display="spinner"
                  minimumDate={new Date()}
                  onChange={(e, d) => {
                    if (d) {
                      if (openDatePicker) setDate(d);
                      else setEndDate(d);
                    }
                  }}
                />
              </View>
            </View>
          </Modal>
        ) : (
          <DateTimePicker
            value={openDatePicker ? date : endDate || new Date()}
            mode={pickerMode}
            onChange={(e, d) => {
              if (e?.type === 'dismissed') {
                setOpenDatePicker(false);
                setOpenEndDatePicker(false);
                setPickerMode('date');
                return;
              }
              if (d) {
                if (openDatePicker) {
                  setDate(d);
                  if (Platform.OS === 'android' && pickerMode === 'date') {
                    setPickerMode('time');
                  } else {
                    setOpenDatePicker(false);
                    setPickerMode('date');
                  }
                } else {
                  setEndDate(d);
                  if (Platform.OS === 'android' && pickerMode === 'date') {
                    setPickerMode('time');
                  } else {
                    setOpenEndDatePicker(false);
                    setPickerMode('date');
                  }
                }
              }
            }}
          />
        ))}

      {/* Speaker Modal */}
      <Modal visible={speakerModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback
            onPress={() => setSpeakerModalVisible(false)}
          >
            <View style={{ flex: 1 }} />
          </TouchableWithoutFeedback>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingSpeaker ? 'Edit Speaker' : 'Add Speaker'}
              </Text>
              <TouchableOpacity onPress={() => setSpeakerModalVisible(false)}>
                <Text style={styles.modalDoneBtn}>Cancel</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              style={{ padding: 20 }}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.innerMedia}>
                <Text style={styles.inputLabel}>Speaker Photo</Text>
                <ImagePickerGrid
                  images={tempSpeaker.image ? [tempSpeaker.image] : []}
                  onChange={imgs =>
                    setTempSpeaker({ ...tempSpeaker, image: imgs[0] || null })
                  }
                  maxImages={1}
                />
              </View>
              <InputField
                label="Full Name"
                placeholder="e.g. Dr. John Smith"
                value={tempSpeaker.name}
                onChangeText={t => setTempSpeaker({ ...tempSpeaker, name: t })}
                error={modalErrors.name}
              />
              <InputField
                label="Role / Title"
                placeholder="e.g. Senior Researcher"
                value={tempSpeaker.role}
                onChangeText={t => setTempSpeaker({ ...tempSpeaker, role: t })}
                error={modalErrors.role}
              />
              <InputField
                label="Mini Bio"
                placeholder="Briefly describe..."
                value={tempSpeaker.bio}
                onChangeText={t => setTempSpeaker({ ...tempSpeaker, bio: t })}
                error={modalErrors.bio}
                multiline
                numberOfLines={3}
              />
              <Button
                title="Confirm Speaker"
                onPress={handleConfirmSpeaker}
                style={{ marginTop: 20 }}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Agenda Modal */}
      <Modal visible={agendaModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback
            onPress={() => setAgendaModalVisible(false)}
          >
            <View style={{ flex: 1 }} />
          </TouchableWithoutFeedback>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingAgenda ? 'Edit Session' : 'Add Session'}
              </Text>
              <TouchableOpacity onPress={() => setAgendaModalVisible(false)}>
                <Text style={styles.modalDoneBtn}>Cancel</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={{ padding: 20 }}>
              <InputField
                label="Session Title"
                placeholder="e.g. Opening Keynote"
                value={tempAgenda.title}
                onChangeText={t => setTempAgenda({ ...tempAgenda, title: t })}
                error={modalErrors.title}
              />
              <InputField
                label="Short Description"
                placeholder="What will happen..."
                value={tempAgenda.description}
                onChangeText={t =>
                  setTempAgenda({ ...tempAgenda, description: t })
                }
                error={modalErrors.description}
                multiline
                numberOfLines={2}
              />
              <View style={styles.timelineRow}>
                <View style={styles.nodesContainer}>
                  <TimeNode
                    label="SESSION START"
                    value={formatEventDate(agendaStartTime)}
                    onPress={() => setShowItemStartPicker(true)}
                  />
                  <TimeNode
                    label="SESSION END"
                    value={formatEventDate(agendaEndTime)}
                    onPress={() => setShowItemEndPicker(true)}
                    isEnd
                  />
                </View>
              </View>
              <Button
                title="Confirm Session"
                onPress={handleConfirmAgenda}
                style={{ marginTop: 24 }}
              />

              {/* iOS Session Start Picker Modal */}
              {Platform.OS === 'ios' && showItemStartPicker && (
                <Modal transparent animationType="slide">
                  <TouchableWithoutFeedback
                    onPress={() => setShowItemStartPicker(false)}
                  >
                    <View style={styles.modalOverlay} />
                  </TouchableWithoutFeedback>
                  <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>Session Start</Text>
                      <TouchableOpacity
                        onPress={() => setShowItemStartPicker(false)}
                      >
                        <Text style={styles.modalDoneBtn}>Done</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.pickerWrapper}>
                      <DateTimePicker
                        value={agendaStartTime}
                        mode="datetime"
                        display="spinner"
                        onChange={(e, d) => {
                          if (d) setAgendaStartTime(d);
                        }}
                      />
                    </View>
                  </View>
                </Modal>
              )}

              {/* iOS Session End Picker Modal */}
              {Platform.OS === 'ios' && showItemEndPicker && (
                <Modal transparent animationType="slide">
                  <TouchableWithoutFeedback
                    onPress={() => setShowItemEndPicker(false)}
                  >
                    <View style={styles.modalOverlay} />
                  </TouchableWithoutFeedback>
                  <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>Session End</Text>
                      <TouchableOpacity
                        onPress={() => setShowItemEndPicker(false)}
                      >
                        <Text style={styles.modalDoneBtn}>Done</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.pickerWrapper}>
                      <DateTimePicker
                        value={agendaEndTime}
                        mode="datetime"
                        display="spinner"
                        onChange={(e, d) => {
                          if (d) setAgendaEndTime(d);
                        }}
                      />
                    </View>
                  </View>
                </Modal>
              )}

              {/* Android Native Pickers */}
              {Platform.OS === 'android' && showItemStartPicker && (
                <DateTimePicker
                  value={agendaStartTime}
                  mode={pickerMode}
                  onChange={(e, d) => {
                    if (e?.type === 'dismissed') {
                      setShowItemStartPicker(false);
                      setPickerMode('date');
                      return;
                    }
                    if (d) {
                      setAgendaStartTime(d);
                      if (pickerMode === 'date') {
                        setPickerMode('time');
                      } else {
                        setShowItemStartPicker(false);
                        setPickerMode('date');
                      }
                    }
                  }}
                />
              )}
              {Platform.OS === 'android' && showItemEndPicker && (
                <DateTimePicker
                  value={agendaEndTime}
                  mode={pickerMode}
                  onChange={(e, d) => {
                    if (e?.type === 'dismissed') {
                      setShowItemEndPicker(false);
                      setPickerMode('date');
                      return;
                    }
                    if (d) {
                      setAgendaEndTime(d);
                      if (pickerMode === 'date') {
                        setPickerMode('time');
                      } else {
                        setShowItemEndPicker(false);
                        setPickerMode('date');
                      }
                    }
                  }}
                />
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.layout.background,
  },
  scrollContent: {
    padding: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: 100, // Space for sticky footer
  },
  dashboard: {
    backgroundColor: colors.brand.primary,
    borderRadius: 28,
    padding: spacing.xl,
    marginBottom: spacing.xxl,
    ...Platform.select({
      ios: {
        shadowColor: colors.brand.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
      },
      android: { elevation: 8 },
    }),
  },
  dashboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  dashboardTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 20,
    fontWeight: '800',
    color: 'white',
  },
  dashboardSub: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
  progressCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressText: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '800',
    color: 'white',
  },
  indicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  indicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  indicatorValid: {
    backgroundColor: colors.status.success,
    borderColor: colors.status.success,
  },
  indicatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 4,
  },
  innerMedia: {
    width: '100%',
    marginBottom: spacing.md,
  },
  timelineRow: {
    flexDirection: 'row',
    position: 'relative',
    paddingLeft: spacing.xs,
  },
  railLine: {
    position: 'absolute',
    left: 17,
    top: 20,
    bottom: 20,
    width: 2,
    backgroundColor: 'rgba(30, 58, 138, 0.08)',
    zIndex: 1,
  },
  nodesContainer: {
    flex: 1,
    gap: spacing.md,
    paddingLeft: spacing.md,
  },
  timeNode: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(248, 250, 260, 0.8)',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.6)',
    zIndex: 2,
  },
  timeNodeError: {
    borderColor: colors.status.error + '40',
    backgroundColor: colors.status.error + '05',
  },
  nodeIndicator: {
    width: 24, // Reduced width
    alignItems: 'center',
    marginRight: 8,
  },
  nodeCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.brand.primary,
    borderWidth: 3,
    borderColor: 'white',
    zIndex: 3,
  },
  nodeCircleEnd: {
    backgroundColor: colors.brand.secondary,
  },
  nodeCircleError: {
    backgroundColor: colors.status.error,
  },
  nodeContent: {
    flex: 1,
  },
  nodeLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  nodeLabelError: {
    color: colors.status.error,
  },
  nodeValue: {
    fontSize: 13, // Slightly smaller
    fontWeight: '700',
    color: colors.text.primary,
    marginTop: 2,
  },
  nodeAction: {
    marginLeft: 4,
    width: 20,
    alignItems: 'center',
  },
  dualGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  listContainer: {
    gap: spacing.md,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(248, 250, 260, 0.5)',
    borderRadius: 20,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.6)',
  },
  listContent: {
    flex: 1,
    paddingRight: 12, // Ensure space for actions
  },
  listItemTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text.primary,
  },
  listItemSub: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  listActions: {
    flexDirection: 'row',
    gap: 16,
  },
  addItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(30, 58, 138, 0.05)',
    borderRadius: 20,
    paddingVertical: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.brand.primary + '40',
    marginTop: 8,
    gap: 8,
  },
  addItemText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.brand.primary,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.layout.divider,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: { elevation: 12 },
    }),
  },
  stickySubmitBtn: {
    borderRadius: 20,
    height: 60,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.layout.divider,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text.primary,
  },
  modalDoneBtn: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.brand.primary,
  },
  pickerWrapper: {
    padding: spacing.md,
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text.secondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default CreateEventScreen;
