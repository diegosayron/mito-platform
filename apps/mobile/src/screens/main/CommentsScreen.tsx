import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { HomeStackParamList } from '../../navigation/MainNavigator';
import { Comment } from '../../types';
import { contentService } from '../../services/content';
import { colors, typography, spacing } from '../../theme';

type CommentsScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'Comments'>;
type CommentsScreenRouteProp = RouteProp<HomeStackParamList, 'Comments'>;

interface Props {
  navigation: CommentsScreenNavigationProp;
  route: CommentsScreenRouteProp;
}

const CommentsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { contentId } = route.params;
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadComments();
  }, [contentId]);

  const loadComments = async () => {
    try {
      const response = await contentService.getComments(contentId);
      setComments(response.items);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const comment = await contentService.addComment(contentId, newComment.trim());
      setComments([comment, ...comments]);
      setNewComment('');
    } catch (error) {
      console.error('Error submitting comment:', error);
      Alert.alert('Erro', 'Não foi possível enviar o comentário');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId: string, isLiked: boolean) => {
    try {
      if (isLiked) {
        await contentService.unlikeComment(commentId);
      } else {
        await contentService.likeComment(commentId);
      }

      setComments(
        comments.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                like_count: isLiked ? comment.like_count - 1 : comment.like_count + 1,
                is_liked: !isLiked,
              }
            : comment
        )
      );
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleReportComment = (commentId: string) => {
    Alert.alert(
      'Denunciar Comentário',
      'Por que você deseja denunciar este comentário?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Conteúdo ofensivo',
          onPress: () => submitReport(commentId, 'offensive'),
        },
        {
          text: 'Spam',
          onPress: () => submitReport(commentId, 'spam'),
        },
      ]
    );
  };

  const submitReport = async (commentId: string, reason: string) => {
    try {
      await contentService.reportComment(commentId, reason);
      Alert.alert('Sucesso', 'Denúncia enviada com sucesso');
    } catch (error) {
      console.error('Error reporting comment:', error);
      Alert.alert('Erro', 'Não foi possível enviar a denúncia');
    }
  };

  const renderComment = ({ item }: { item: Comment }) => (
    <View style={styles.commentCard}>
      <View style={styles.commentHeader}>
        <Text style={styles.userName}>{item.user_name || 'Usuário'}</Text>
        <TouchableOpacity onPress={() => handleReportComment(item.id)}>
          <Text style={styles.reportIcon}>⚠️</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.commentText}>{item.text}</Text>
      <View style={styles.commentActions}>
        <TouchableOpacity
          style={styles.likeButton}
          onPress={() => handleLikeComment(item.id, item.is_liked || false)}
        >
          <Text style={styles.likeIcon}>{item.is_liked ? '❤️' : '🤍'}</Text>
          <Text style={styles.likeCount}>{item.like_count}</Text>
        </TouchableOpacity>
        <Text style={styles.commentDate}>
          {new Date(item.created_at).toLocaleDateString('pt-BR')}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Comentários</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.accent.gold} />
          </View>
        ) : (
          <FlatList
            data={comments}
            renderItem={renderComment}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Nenhum comentário ainda</Text>
                <Text style={styles.emptySubtext}>Seja o primeiro a comentar!</Text>
              </View>
            }
          />
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Escreva um comentário..."
            placeholderTextColor={colors.text.tertiary}
            value={newComment}
            onChangeText={setNewComment}
            multiline
            editable={!submitting}
          />
          <TouchableOpacity
            style={[styles.sendButton, submitting && styles.sendButtonDisabled]}
            onPress={handleSubmitComment}
            disabled={submitting || !newComment.trim()}
          >
            {submitting ? (
              <ActivityIndicator size="small" color={colors.text.inverse} />
            ) : (
              <Text style={styles.sendButtonText}>Enviar</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary.green,
    gap: spacing.md,
  },
  backButton: {
    color: colors.accent.gold,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
  },
  headerTitle: {
    color: colors.text.primary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: spacing.md,
  },
  commentCard: {
    backgroundColor: colors.background.card,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  userName: {
    color: colors.accent.gold,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
  },
  reportIcon: {
    fontSize: typography.fontSize.md,
  },
  commentText: {
    color: colors.text.primary,
    fontSize: typography.fontSize.md,
    lineHeight: typography.fontSize.md * typography.lineHeight.normal,
    marginBottom: spacing.sm,
  },
  commentActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  likeIcon: {
    fontSize: typography.fontSize.md,
  },
  likeCount: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.sm,
  },
  commentDate: {
    color: colors.text.tertiary,
    fontSize: typography.fontSize.xs,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    color: colors.text.primary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.background.secondary,
    borderTopWidth: 1,
    borderTopColor: colors.primary.green,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: colors.background.card,
    borderRadius: 8,
    padding: spacing.sm,
    color: colors.text.primary,
    fontSize: typography.fontSize.md,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: colors.accent.gold,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 70,
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonText: {
    color: colors.text.inverse,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
});

export default CommentsScreen;
