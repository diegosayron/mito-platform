import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { HomeStackParamList } from '../../navigation/MainNavigator';
import { Content } from '../../types';
import { contentService } from '../../services/content';
import { colors, typography, spacing } from '../../theme';

type ContentDetailScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'ContentDetail'>;
type ContentDetailScreenRouteProp = RouteProp<HomeStackParamList, 'ContentDetail'>;

interface Props {
  navigation: ContentDetailScreenNavigationProp;
  route: ContentDetailScreenRouteProp;
}

const ContentDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { contentId } = route.params;
  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    loadContent();
  }, [contentId]);

  const loadContent = async () => {
    try {
      const data = await contentService.getContentById(contentId);
      setContent(data);
      setIsLiked(data.is_liked || false);
    } catch (error) {
      console.error('Error loading content:', error);
      Alert.alert('Erro', 'Não foi possível carregar o conteúdo');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!content) return;

    try {
      if (isLiked) {
        await contentService.unlikeContent(content.id);
        setContent({ ...content, like_count: content.like_count - 1 });
      } else {
        await contentService.likeContent(content.id);
        setContent({ ...content, like_count: content.like_count + 1 });
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleShare = async () => {
    if (!content) return;

    try {
      await Share.share({
        message: `${content.title}\n\nVeja no MITO Platform`,
        title: content.title,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleReport = () => {
    Alert.alert(
      'Denunciar Conteúdo',
      'Por que você deseja denunciar este conteúdo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Conteúdo inapropriado',
          onPress: () => submitReport('inappropriate'),
        },
        {
          text: 'Informação falsa',
          onPress: () => submitReport('false_information'),
        },
        {
          text: 'Spam',
          onPress: () => submitReport('spam'),
        },
      ]
    );
  };

  const submitReport = async (reason: string) => {
    if (!content) return;

    try {
      await contentService.reportContent(content.id, reason);
      Alert.alert('Sucesso', 'Denúncia enviada com sucesso');
    } catch (error) {
      console.error('Error reporting content:', error);
      Alert.alert('Erro', 'Não foi possível enviar a denúncia');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent.gold} />
      </View>
    );
  }

  if (!content) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Voltar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleReport}>
          <Text style={styles.reportButton}>⚠️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {content.thumbnail_url && (
          <Image source={{ uri: content.thumbnail_url }} style={styles.image} />
        )}

        <View style={styles.details}>
          <Text style={styles.title}>{content.title}</Text>
          
          <View style={styles.tags}>
            {content.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.body}>{content.body}</Text>

          {content.source && (
            <Text style={styles.source}>Fonte: {content.source}</Text>
          )}

          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
              <Text style={styles.actionIcon}>{isLiked ? '❤️' : '🤍'}</Text>
              <Text style={styles.actionText}>{content.like_count}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Comments', { contentId: content.id })}
            >
              <Text style={styles.actionIcon}>💬</Text>
              <Text style={styles.actionText}>{content.comment_count}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
              <Text style={styles.actionIcon}>📤</Text>
              <Text style={styles.actionText}>Compartilhar</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary.green,
  },
  backButton: {
    color: colors.accent.gold,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
  },
  reportButton: {
    fontSize: typography.fontSize.lg,
  },
  content: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: 250,
    backgroundColor: colors.background.card,
  },
  details: {
    padding: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  tag: {
    backgroundColor: colors.primary.green,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 4,
  },
  tagText: {
    color: colors.text.primary,
    fontSize: typography.fontSize.xs,
  },
  body: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.md * typography.lineHeight.relaxed,
    marginBottom: spacing.lg,
  },
  source: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    fontStyle: 'italic',
    marginBottom: spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.background.card,
  },
  actionButton: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionIcon: {
    fontSize: typography.fontSize.xl,
  },
  actionText: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.sm,
  },
});

export default ContentDetailScreen;
