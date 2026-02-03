import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Content } from '../../types';
import { colors, typography, spacing, borderRadius } from '../../theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.4;

interface Props {
  content: Content;
  onPress: () => void;
}

const ContentCard: React.FC<Props> = ({ content, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <Image
        source={{ uri: content.thumbnail_url || 'https://via.placeholder.com/200x300' }}
        style={styles.thumbnail}
        resizeMode="cover"
      />
      <View style={styles.overlay}>
        <Text style={styles.title} numberOfLines={2}>
          {content.title}
        </Text>
        <View style={styles.stats}>
          <Text style={styles.statText}>❤️ {content.like_count}</Text>
          <Text style={styles.statText}>💬 {content.comment_count}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.5,
    marginRight: spacing.md,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    backgroundColor: colors.background.card,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: spacing.sm,
  },
  title: {
    color: colors.text.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    marginBottom: spacing.xs,
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statText: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.xs,
  },
});

export default ContentCard;
