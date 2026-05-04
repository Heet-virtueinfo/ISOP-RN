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
import { Search, X, Newspaper } from 'lucide-react-native';
import { colors, spacing, typography, radius } from '../../theme';
import { NewsArticle } from '../../types';
import { getNews } from '../../services/newsService';
import CustomLoader from '../../components/CustomLoader';
import UserHeader from '../../components/UserHeader';
import NewsCard from '../../components/NewsCard';

const NewsScreen = () => {
  const navigation = useNavigation();
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [filteredNews, setFilteredNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'news' | 'alert'>('all');

  useEffect(() => {
    let isMounted = true;
    const fetchNews = async () => {
      const data = await getNews();
      console.log('[NewsScreen] fetchNews data:', data);
      if (isMounted) {
        setNews(data);
        setLoading(false);
      }
    };

    fetchNews();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let result = news;
    if (activeTab !== 'all') {
      result = result.filter(item => item.type === activeTab);
    }
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.trim().toLowerCase();
      result = result.filter(
        item =>
          item.title.toLowerCase().includes(lowerQuery) ||
          item.content.toLowerCase().includes(lowerQuery),
      );
    }
    setFilteredNews(result);
  }, [news, searchQuery, activeTab]);

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Newspaper size={48} color={colors.text.tertiary} />
        <Text style={styles.emptyTitle}>
          {searchQuery ? 'No results found' : 'No news available'}
        </Text>
        <Text style={styles.emptyText}>
          {searchQuery
            ? 'Try adjusting your search or filters.'
            : "We'll post updates and regulatory alerts here!"}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <UserHeader
        title="News Hub"
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      {/* Modern Filter Segment */}
      <View style={styles.navContainer}>
        <View style={styles.segmentedControl}>
          <TouchableOpacity
            style={[styles.navTab, activeTab === 'all' && styles.navTabActive]}
            onPress={() => setActiveTab('all')}
          >
            <Text
              style={[
                styles.navTabText,
                activeTab === 'all' && styles.navTabTextActive,
              ]}
            >
              Feed
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.navTab,
              activeTab === 'alert' && styles.navTabActive,
            ]}
            onPress={() => setActiveTab('alert')}
          >
            <Text
              style={[
                styles.navTabText,
                activeTab === 'alert' && styles.navTabTextActive,
              ]}
            >
              Alerts
            </Text>
            {news.filter(n => n.type === 'alert').length > 0 && (
              <View style={[styles.countBadge, styles.countBadgeError]}>
                <Text style={styles.countText}>
                  {news.filter(n => n.type === 'alert').length}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navTab, activeTab === 'news' && styles.navTabActive]}
            onPress={() => setActiveTab('news')}
          >
            <Text
              style={[
                styles.navTabText,
                activeTab === 'news' && styles.navTabTextActive,
              ]}
            >
              News
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchArea}>
        <View style={styles.searchContainer}>
          <Search size={18} color={colors.text.tertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search articles..."
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

      {loading ? (
        <CustomLoader
          message="Loading News Feed..."
          overlay={false}
          style={{ flex: 1 }}
        />
      ) : (
        <FlatList
          data={filteredNews}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <NewsCard article={item} />}
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
  navContainer: {
    backgroundColor: colors.layout.surface,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 6,
    borderWidth: 1,
    borderColor: 'rgba(241, 245, 249, 1)',
  },
  navTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  navTabActive: {
    backgroundColor: 'white',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
    }),
  },
  navTabText: {
    fontFamily: typography.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.tertiary,
  },
  navTabTextActive: {
    color: colors.brand.primary,
  },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    minWidth: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadgeError: {
    backgroundColor: colors.status.error,
  },
  countText: {
    fontSize: 9,
    fontWeight: '900',
    color: 'white',
  },
  searchArea: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.sm,
    backgroundColor: colors.layout.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.layout.divider,
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
    fontWeight: '700',
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

export default NewsScreen;
