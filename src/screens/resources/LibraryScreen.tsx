import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Text,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Search, X, Library } from 'lucide-react-native';
import { colors, spacing, typography, radius } from '../../theme';
import { ResourceItem, ResourceCategory } from '../../types';
import { getResources } from '../../services/resourceService';
import CustomLoader from '../../components/CustomLoader';
import UserHeader from '../../components/UserHeader';
import ResourceCard from '../../components/ResourceCard';

const LibraryScreen = () => {
  const navigation = useNavigation();
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [filteredResources, setFilteredResources] = useState<ResourceItem[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<
    ResourceCategory | 'all'
  >('all');

  useEffect(() => {
    let isMounted = true;
    const fetchResources = async () => {
      const data = await getResources();
      if (isMounted) {
        setResources(data);
        setLoading(false);
      }
    };

    fetchResources();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let result = resources;
    if (activeCategory !== 'all') {
      result = result.filter(item => item.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.trim().toLowerCase();
      result = result.filter(
        item =>
          item.title.toLowerCase().includes(lowerQuery) ||
          item.description.toLowerCase().includes(lowerQuery),
      );
    }
    setFilteredResources(result);
  }, [resources, searchQuery, activeCategory]);

  const categories: { label: string; value: ResourceCategory | 'all' }[] = [
    { label: 'All', value: 'all' },
    { label: 'Guidelines', value: 'guideline' },
    { label: 'Training', value: 'training' },
    { label: 'Presentations', value: 'presentation' },
    { label: 'Other', value: 'other' },
  ];

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Library size={48} color={colors.text.tertiary} />
        <Text style={styles.emptyTitle}>
          {searchQuery ? 'No resources found' : 'Library is empty'}
        </Text>
        <Text style={styles.emptyText}>
          {searchQuery
            ? 'Try adjusting your search criteria.'
            : 'Check back later for guidelines and materials!'}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <UserHeader
        title="Digital Library"
        showBack={true}
        onBackPress={() => navigation.goBack()}
        showActions={false}
      />

      <View style={styles.searchArea}>
        <View style={styles.searchContainer}>
          <Search size={18} color={colors.text.tertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search documents..."
            placeholderTextColor={colors.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearBtn}
            >
              <X size={16} color={colors.text.tertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={item => item.value}
          contentContainerStyle={{
            paddingHorizontal: spacing.xl,
            paddingBottom: spacing.sm,
            paddingTop: spacing.sm,
          }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryPill,
                activeCategory === item.value && styles.categoryPillActive,
              ]}
              onPress={() => setActiveCategory(item.value)}
            >
              <Text
                style={[
                  styles.categoryText,
                  activeCategory === item.value && styles.categoryTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {loading ? (
        <CustomLoader
          message="Loading Library..."
          overlay={false}
          style={{ flex: 1 }}
        />
      ) : (
        <FlatList
          data={filteredResources}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <ResourceCard resource={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmpty}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.layout.background,
  },
  searchArea: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.layout.surface,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.layout.background,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.ui.inputBorder,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    color: colors.text.primary,
    ...Platform.select({
      ios: { height: 44 },
    }),
  },
  clearBtn: {
    padding: 6,
  },
  categoriesContainer: {
    backgroundColor: colors.layout.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.layout.divider,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.palette.slate.bg,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.ui.inputBorderLight,
  },
  categoryPillActive: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  categoryText: {
    fontFamily: typography.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.secondary,
  },
  categoryTextActive: {
    color: 'white',
  },
  listContent: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 18,
    fontWeight: '800',
    color: colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    color: colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default LibraryScreen;
