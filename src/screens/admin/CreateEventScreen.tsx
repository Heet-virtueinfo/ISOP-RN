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
import { createEvent } from '../../services/eventService';
import { apiService } from '../../services/apiService';
import { formatEventDate } from '../../utils/eventHelpers';
import { firebaseAuth } from '../../config/firebase';

const BentoShell = ({ children, icon: Icon, title, isValid }: any) => (
  <View style={styles.shell}>
    <View style={[styles.floatingBadge, isValid && styles.floatingBadgeValid]}>
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

const TimeNode = ({ label, value, onPress, isEnd = false, error }: any) => (
  <TouchableOpacity
    style={[styles.timeNode, error && styles.timeNodeError]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.nodeIndicator}>
      <View style={[styles.nodeCircle, isEnd && styles.nodeCircleEnd, error && styles.nodeCircleError]} />
    </View>
    <View style={styles.nodeContent}>
      <Text style={[styles.nodeLabel, error && styles.nodeLabelError]}>{label}</Text>
      <Text style={styles.nodeValue}>{value}</Text>
    </View>
    <ChevronDown size={14} color={error ? colors.status.error : colors.text.tertiary} />
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

  const isMediaValid = images.length > 0;
  const isDetailsValid = title.trim().length > 0 && description.trim().length > 0;
  const isScheduleValid = location.trim().length > 0 && date !== null && endDate !== null;

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
    if (speakers.length === 0) newErrors.speakers = 'At least 1 speaker is required';
    if (agenda.length === 0) newErrors.agenda = 'At least 1 agenda item is required';

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
      const adminUid = firebaseAuth.currentUser?.uid || 'unknown_admin';

      const { event } = await createEvent({
        title,
        description,
        location,
        type,
        images,
        date: date,
        ...(endDate && { endDate }),
        ...(maxCapacityStr && { maxCapacity: parseInt(maxCapacityStr, 10) }),
        createdBy: adminUid,
        speakers,
        agenda,
      });

      if (event?.id) {
        try {
          await apiService.sendNotification({
            isBroadcast: true,
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
    if (!tempSpeaker.name?.trim()) newModalErrors.name = 'Full Name is required';
    if (!tempSpeaker.role?.trim()) newModalErrors.role = 'Role is required';
    if (!tempSpeaker.bio?.trim()) newModalErrors.bio = 'Bio is required';
    if (!tempSpeaker.image) newModalErrors.image = 'Photo is required';

    if (Object.keys(newModalErrors).length > 0) {
      setModalErrors(newModalErrors);
      return;
    }

    if (editingSpeaker) {
      setSpeakers(prev =>
        prev.map(s => (s.id === editingSpeaker.id ? { ...s, ...tempSpeaker as Speaker } : s)),
      );
    } else {
      setSpeakers(prev => [
        ...prev,
        { ...tempSpeaker as Speaker, id: Math.random().toString(36).substr(2, 9) },
      ]);
    }
    setSpeakerModalVisible(false);
  };

  const handleConfirmAgenda = () => {
    const newModalErrors: Record<string, string> = {};
    if (!tempAgenda.title?.trim()) newModalErrors.title = 'Title is required';
    if (!tempAgenda.description?.trim()) newModalErrors.description = 'Description is required';

    if (Object.keys(newModalErrors).length > 0) {
      setModalErrors(newModalErrors);
      return;
    }

    const item: AgendaItem = {
      ...tempAgenda as AgendaItem,
      id: editingAgenda?.id || Math.random().toString(36).substr(2, 9),
      startTime: agendaStartTime,
      endTime: agendaEndTime,
    };
    if (editingAgenda) {
      setAgenda(prev =>
        prev.map(a => (a.id === editingAgenda.id ? item : a)),
      );
    } else {
      setAgenda(prev => [...prev, item]);
    }
    setAgendaModalVisible(false);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <BentoShell icon={ImageIcon} title="MEDIA Bin" isValid={isMediaValid}>
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
      </BentoShell>

      <BentoShell icon={Layers} title="CORE INFO" isValid={isDetailsValid}>
        <View style={styles.innerContent}>
          <View style={styles.typePickerWrapper}>
            <EventTypePicker
              selectedType={type}
              onSelect={t => {
                setType(t);
                setErrors(prev => ({ ...prev, type: '' }));
              }}
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
              setErrors(prev => ({ ...prev, title: '' }));
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
              setErrors(prev => ({ ...prev, description: '' }));
            }}
            error={errors.description}
            multiline
            numberOfLines={4}
            containerStyle={{ marginBottom: 0 }}
          />
        </View>
      </BentoShell>

      <BentoShell
        icon={CalendarIcon}
        title="LOGISTICS"
        isValid={isScheduleValid}
      >
        <View style={styles.innerContent}>
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

          {(openDatePicker || openEndDatePicker) &&
            (Platform.OS === 'ios' ? (
              <Modal
                transparent
                animationType="slide"
                visible={openDatePicker || openEndDatePicker}
                onRequestClose={() => {
                  setOpenDatePicker(false);
                  setOpenEndDatePicker(false);
                }}
              >
                <TouchableWithoutFeedback
                  onPress={() => {
                    setOpenDatePicker(false);
                    setOpenEndDatePicker(false);
                  }}
                >
                  <View style={styles.modalOverlay} />
                </TouchableWithoutFeedback>
                <View style={styles.modalContainer}>
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
                      onChange={(event, selectedDate) => {
                        if (selectedDate) {
                          if (openDatePicker) {
                             setDate(selectedDate);
                             setErrors(prev => ({ ...prev, date: '' }));
                          } else {
                            setEndDate(selectedDate);
                            setErrors(prev => ({ ...prev, endDate: '' }));
                          }
                        }
                      }}
                      textColor="black"
                    />
                  </View>
                </View>
              </Modal>
            ) : (
              <DateTimePicker
                value={openDatePicker ? date : endDate || new Date()}
                mode={pickerMode}
                display="default"
                minimumDate={new Date()}
                onChange={(event, selectedDate) => {
                  if (event.type === 'dismissed') {
                    setOpenDatePicker(false);
                    setOpenEndDatePicker(false);
                    setPickerMode('date');
                    return;
                  }

                  if (selectedDate) {
                    if (openDatePicker) {
                      setDate(selectedDate);
                      setErrors(prev => ({ ...prev, date: '' }));
                      if (pickerMode === 'date') setPickerMode('time');
                      else {
                        setOpenDatePicker(false);
                        setPickerMode('date');
                      }
                    } else {
                      setEndDate(selectedDate);
                      setErrors(prev => ({ ...prev, endDate: '' }));
                      if (pickerMode === 'date') setPickerMode('time');
                      else {
                        setOpenEndDatePicker(false);
                        setPickerMode('date');
                      }
                    }
                  }
                }}
              />
            ))}

          <InputField
            label="Location / Link"
            placeholder="Venue or Virtual link"
            leftIcon={MapPin}
            value={location}
            onChangeText={text => {
              setLocation(text);
              setErrors(prev => ({ ...prev, location: '' }));
            }}
            error={errors.location}
          />

          <InputField
            label="Capacity"
            placeholder="e.g. 500"
            leftIcon={Users}
            keyboardType="numeric"
            value={maxCapacityStr}
            onChangeText={text => {
              setMaxCapacityStr(text);
              setErrors(prev => ({ ...prev, capacity: '' }));
            }}
            error={errors.capacity}
            containerStyle={{ marginBottom: 0 }}
          />
        </View>
      </BentoShell>

      <BentoShell icon={User} title="SPEAKERS" isValid={speakers.length > 0}>
        <View style={styles.innerContent}>
          <View style={styles.listContainer}>
            {speakers.map((s, index) => (
              <View key={s.id || index} style={styles.listItem}>
                <View style={styles.listContent}>
                  <Text style={styles.listItemTitle}>{s.name}</Text>
                  <Text style={styles.listItemSub}>{s.role}</Text>
                </View>
                <View style={styles.listActions}>
                  <TouchableOpacity
                    onPress={() => {
                      setEditingSpeaker(s);
                      setTempSpeaker(s);
                      setModalErrors({});
                      setSpeakerModalVisible(true);
                      setErrors(prev => ({ ...prev, speakers: '' }));
                    }}
                  >
                    <Edit2 size={16} color={colors.brand.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      setSpeakers(prev => prev.filter(item => item.id !== s.id))
                    }
                  >
                    <Trash2 size={16} color={colors.status.error} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            <TouchableOpacity
              style={[styles.addItemBtn, errors.speakers && styles.addItemBtnError]}
              onPress={() => {
                setEditingSpeaker(null);
                setTempSpeaker({ name: '', role: '', bio: '', image: null });
                setModalErrors({});
                setSpeakerModalVisible(true);
                setErrors(prev => ({ ...prev, speakers: '' }));
              }}
            >
              <Plus size={18} color={errors.speakers ? colors.status.error : colors.brand.primary} />
              <Text style={[styles.addItemText, errors.speakers && styles.addItemTextError]}>Add Speaker Profile</Text>
            </TouchableOpacity>
            {errors.speakers && <Text style={styles.errorTextSmall}>{errors.speakers}</Text>}
          </View>
        </View>
      </BentoShell>

      <BentoShell icon={Clock} title="AGENDA" isValid={agenda.length > 0}>
        <View style={styles.innerContent}>
          <View style={styles.listContainer}>
            {agenda
              .sort((a, b) => {
                const timeA = new Date(a.startTime);
                const timeB = new Date(b.startTime);
                return timeA.getTime() - timeB.getTime();
              })
              .map((a, index) => (
                <View key={a.id || index} style={styles.listItem}>
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
                        if (a.endTime) setAgendaEndTime(new Date(a.endTime));
                        setModalErrors({});
                        setAgendaModalVisible(true);
                        setErrors(prev => ({ ...prev, agenda: '' }));
                      }}
                    >
                      <Edit2 size={16} color={colors.brand.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() =>
                        setAgenda(prev => prev.filter(item => item.id !== a.id))
                      }
                    >
                      <Trash2 size={16} color={colors.status.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            <TouchableOpacity
              style={[styles.addItemBtn, errors.agenda && styles.addItemBtnError]}
              onPress={() => {
                setEditingAgenda(null);
                setTempAgenda({ title: '', description: '' });
                setAgendaStartTime(new Date(date));
                setAgendaEndTime(new Date(date));
                setModalErrors({});
                setAgendaModalVisible(true);
                setErrors(prev => ({ ...prev, agenda: '' }));
              }}
            >
              <Plus size={18} color={errors.agenda ? colors.status.error : colors.brand.primary} />
              <Text style={[styles.addItemText, errors.agenda && styles.addItemTextError]}>Add Session Item</Text>
            </TouchableOpacity>
            {errors.agenda && <Text style={styles.errorTextSmall}>{errors.agenda}</Text>}
          </View>
        </View>
      </BentoShell>

      <Button
        title="Create Event"
        onPress={handleCreate}
        loading={loading}
        style={styles.submitBtn}
      />

      {/* Speaker Modal */}
      <Modal visible={speakerModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
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
              contentContainerStyle={{ paddingBottom: 40 }}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.innerMedia}>
                <Text style={[styles.inputLabel, modalErrors.image && { color: colors.status.error }]}>Speaker Photo</Text>
                <ImagePickerGrid
                  images={tempSpeaker.image ? [tempSpeaker.image] : []}
                  onChange={imgs => {
                     setTempSpeaker({ ...tempSpeaker, image: imgs[0] || null });
                     setModalErrors(prev => ({ ...prev, image: '' }));
                  }}
                  maxImages={1}
                />
              </View>
              <InputField
                label="Full Name"
                placeholder="e.g. Dr. John Smith"
                value={tempSpeaker.name}
                onChangeText={t => {
                   setTempSpeaker({ ...tempSpeaker, name: t });
                   setModalErrors(prev => ({ ...prev, name: '' }));
                }}
                error={modalErrors.name}
              />
              <InputField
                label="Role / Title"
                placeholder="e.g. Senior Researcher"
                value={tempSpeaker.role}
                onChangeText={t => {
                   setTempSpeaker({ ...tempSpeaker, role: t });
                   setModalErrors(prev => ({ ...prev, role: '' }));
                }}
                error={modalErrors.role}
              />
              <InputField
                label="Mini Bio"
                placeholder="Briefly describe the speaker..."
                value={tempSpeaker.bio}
                onChangeText={t => {
                   setTempSpeaker({ ...tempSpeaker, bio: t });
                   setModalErrors(prev => ({ ...prev, bio: '' }));
                }}
                error={modalErrors.bio}
                multiline
                numberOfLines={3}
              />

              <Button
                title="Confirm Speaker"
                onPress={handleConfirmSpeaker}
                style={{ marginTop: 24 }}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Agenda Modal */}
      <Modal visible={agendaModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingAgenda ? 'Edit Session' : 'Add Session'}
              </Text>
              <TouchableOpacity onPress={() => setAgendaModalVisible(false)}>
                <Text style={styles.modalDoneBtn}>Cancel</Text>
              </TouchableOpacity>
            </View>
            <ScrollView 
              style={{ padding: 20 }}
              contentContainerStyle={{ paddingBottom: 40 }}
              showsVerticalScrollIndicator={false}
            >
              <InputField
                label="Session Title"
                placeholder="e.g. Opening Keynote"
                value={tempAgenda.title}
                onChangeText={t => {
                   setTempAgenda({ ...tempAgenda, title: t });
                   setModalErrors(prev => ({ ...prev, title: '' }));
                }}
                error={modalErrors.title}
              />
              <InputField
                label="Short Description"
                placeholder="What will happen in this session?"
                value={tempAgenda.description}
                onChangeText={t => {
                   setTempAgenda({ ...tempAgenda, description: t });
                   setModalErrors(prev => ({ ...prev, description: '' }));
                }}
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
                    label="SESSION END (Optional)"
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

              {/* Session Logistics (Unified Pattern) */}
              {(showItemStartPicker || showItemEndPicker) &&
                (Platform.OS === 'ios' ? (
                  <Modal
                    transparent
                    animationType="slide"
                    visible={showItemStartPicker || showItemEndPicker}
                    onRequestClose={() => {
                      setShowItemStartPicker(false);
                      setShowItemEndPicker(false);
                    }}
                  >
                    <TouchableWithoutFeedback
                      onPress={() => {
                        setShowItemStartPicker(false);
                        setShowItemEndPicker(false);
                      }}
                    >
                      <View style={styles.modalOverlay} />
                    </TouchableWithoutFeedback>
                    <View style={styles.modalContainer}>
                      <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>
                          {showItemStartPicker ? 'Session Start' : 'Session End'}
                        </Text>
                        <TouchableOpacity
                          onPress={() => {
                            setShowItemStartPicker(false);
                            setShowItemEndPicker(false);
                          }}
                        >
                          <Text style={styles.modalDoneBtn}>Done</Text>
                        </TouchableOpacity>
                      </View>
                      <View style={styles.pickerWrapper}>
                        <DateTimePicker
                          value={showItemStartPicker ? agendaStartTime : agendaEndTime}
                          mode="datetime"
                          display="spinner"
                          onChange={(event, selectedDate) => {
                            if (selectedDate) {
                              if (showItemStartPicker) {
                                setAgendaStartTime(selectedDate);
                              } else {
                                setAgendaEndTime(selectedDate);
                              }
                            }
                          }}
                          textColor="black"
                        />
                      </View>
                    </View>
                  </Modal>
                ) : (
                  <DateTimePicker
                    value={showItemStartPicker ? agendaStartTime : agendaEndTime}
                    mode={pickerMode}
                    display="default"
                    onChange={(event, selectedDate) => {
                      if (event.type === 'dismissed') {
                        setShowItemStartPicker(false);
                        setShowItemEndPicker(false);
                        setPickerMode('date');
                        return;
                      }

                      if (selectedDate) {
                        if (showItemStartPicker) {
                          setAgendaStartTime(selectedDate);
                          if (pickerMode === 'date') setPickerMode('time');
                          else {
                            setShowItemStartPicker(false);
                            setPickerMode('date');
                          }
                        } else {
                          setAgendaEndTime(selectedDate);
                          if (pickerMode === 'date') setPickerMode('time');
                          else {
                            setShowItemEndPicker(false);
                            setPickerMode('date');
                          }
                        }
                      }
                    }}
                  />
                ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  timeNodeError: {
    borderColor: colors.status.error,
    backgroundColor: colors.status.error + '05',
    borderWidth: 1.5,
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
    zIndex: 2,
  },
  nodeCircleEnd: {
    backgroundColor: colors.text.tertiary,
  },
  nodeCircleError: {
    backgroundColor: colors.status.error,
  },
  nodeContent: {
    flex: 1,
  },
  nodeLabel: {
    fontFamily: typography.fontFamily,
    fontSize: 10,
    fontWeight: '800',
    color: colors.text.tertiary,
    marginBottom: 2,
  },
  nodeLabelError: {
    color: colors.status.error,
  },
  nodeValue: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
  },
  submitBtn: {
    marginTop: spacing.xl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.layout.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.dividerLight,
  },
  modalTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 18,
    fontWeight: '800',
    color: colors.text.primary,
  },
  modalDoneBtn: {
    fontFamily: typography.fontFamily,
    fontSize: 16,
    fontWeight: '700',
    color: colors.brand.primary,
  },
  pickerWrapper: {
    padding: 20,
    alignItems: 'center',
  },
  listContainer: {
    marginTop: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.layout.background,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.ui.dividerLight,
  },
  listContent: {
    flex: 1,
  },
  listItemTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 15,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: 2,
  },
  listItemSub: {
    fontFamily: typography.fontFamily,
    fontSize: 11,
    color: colors.text.tertiary,
  },
  listActions: {
    flexDirection: 'row',
    gap: 16,
    marginLeft: 16,
  },
  addItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.brand.primary,
    borderRadius: 16,
    marginTop: 8,
    gap: 8,
    backgroundColor: 'rgba(79, 70, 229, 0.05)',
  },
  addItemBtnError: {
    borderColor: colors.status.error,
    backgroundColor: colors.status.error + '05',
    borderStyle: 'solid',
  },
  addItemText: {
    fontFamily: typography.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    color: colors.brand.primary,
  },
  addItemTextError: {
    color: colors.status.error,
  },
  inputLabel: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    fontWeight: '800',
    color: colors.brand.primary,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  errorTextSmall: {
    color: colors.status.error,
    fontSize: 11,
    fontFamily: typography.fontFamily,
    marginTop: 6,
    marginLeft: 4,
  },
});

export default CreateEventScreen;
