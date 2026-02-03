import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { HomeStackParamList } from '../../navigation/MainNavigator';
import { Content } from '../../types';
import { contentService } from '../../services/content';
import { cacheService } from '../../utils/cache';
import ContentCard from '../../components/common/ContentCard';
import { colors, typography, spacing } from '../../theme';

type HomeScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

interface ContentSection {
  title: string;
  type?: string;
  data: Content[];
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [sections, setSections] = useState<ContentSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async (isRefresh = false) => {
    try {
      if (!isRefresh) {
        // Try to load from cache first
        const cached = await cacheService.get<ContentSection[]>('home_content');
        if (cached) {
          setSections(cached);
          setLoading(false);
        }
      }

      // Fetch different content types
      const [history, characters, videos, greatWorks] = await Promise.all([
        contentService.getContents(1, 10, 'history'),
        contentService.getContents(1, 10, 'character'),
        contentService.getContents(1, 10, 'video'),
        contentService.getContents(1, 10, 'great_work'),
      ]);

      const newSections: ContentSection[] = [
        { title: 'Histórias', type: 'history', data: history.items },
        { title: 'Personagens', type: 'character', data: characters.items },
        { title: 'Vídeos', type: 'video', data: videos.items },
        { title: 'Grandes Obras', type: 'great_work', data: greatWorks.items },
      ];

      setSections(newSections);
      await cacheService.set('home_content', newSections);
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadContent(true);
  };

  const handleContentPress = (content: Content) => {
    if (content.type === 'video') {
      navigation.navigate('VideoPlayer', {
        contentId: content.id,
        videoUrl: content.media_url || '',
      });
    } else {
      navigation.navigate('ContentDetail', { contentId: content.id });
    }
  };

  if (loading && sections.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent.gold} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>MITO</Text>
        <Text style={styles.headerSubtitle}>Platform</Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.accent.gold}
          />
        }
      >
        {sections.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <FlatList
              horizontal
              data={section.data}
              renderItem={({ item }) => (
                <ContentCard
                  content={item}
                  onPress={() => handleContentPress(item)}
                />
              )}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
            />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
  },
  header: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary.green,
  },
  headerTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.accent.gold,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.primary.green,
    fontWeight: typography.fontWeight.medium,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginLeft: spacing.lg,
    marginBottom: spacing.md,
  },
  listContent: {
    paddingLeft: spacing.lg,
  },
});

export default HomeScreen;
