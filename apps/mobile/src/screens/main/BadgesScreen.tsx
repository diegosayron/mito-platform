import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  Image,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { TouchableOpacity } from 'react-native';
import { HomeStackParamList } from '../../navigation/MainNavigator';
import { Badge } from '../../types';
import { userService } from '../../services/user';
import { colors, typography, spacing, borderRadius } from '../../theme';

type BadgesScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'Badges'>;

interface Props {
  navigation: BadgesScreenNavigationProp;
}

const BadgesScreen: React.FC<Props> = ({ navigation }) => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBadges();
  }, []);

  const loadBadges = async () => {
    try {
      const data = await userService.getBadges();
      setBadges(data);
    } catch (error) {
      console.error('Error loading badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderBadge = ({ item }: { item: Badge }) => (
    <View style={[styles.badgeCard, !item.unlocked && styles.badgeLocked]}>
      <Image
        source={{ uri: item.icon_url || 'https://via.placeholder.com/100' }}
        style={styles.badgeImage}
      />
      <View style={styles.badgeInfo}>
        <Text style={styles.badgeName}>{item.name}</Text>
        <Text style={styles.badgeDescription}>{item.description}</Text>
        {item.unlocked ? (
          <View style={styles.unlockedBadge}>
            <Text style={styles.unlockedText}>✓ Desbloqueado</Text>
            {item.unlocked_at && (
              <Text style={styles.unlockedDate}>
                {new Date(item.unlocked_at).toLocaleDateString('pt-BR')}
              </Text>
            )}
          </View>
        ) : (
          <View style={styles.lockedBadge}>
            <Text style={styles.lockedText}>🔒 Bloqueado</Text>
            <Text style={styles.ruleText}>{item.rule}</Text>
          </View>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent.gold} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Badges</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>
            {badges.filter((b) => b.unlocked).length}
          </Text>
          <Text style={styles.statLabel}>Desbloqueados</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{badges.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      <FlatList
        data={badges}
        renderItem={renderBadge}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhum badge disponível</Text>
          </View>
        }
      />
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
  statsContainer: {
    flexDirection: 'row',
    padding: spacing.lg,
    backgroundColor: colors.background.card,
    margin: spacing.md,
    borderRadius: borderRadius.md,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.accent.gold,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.background.primary,
  },
  listContent: {
    padding: spacing.md,
  },
  badgeCard: {
    flexDirection: 'row',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  badgeLocked: {
    opacity: 0.6,
  },
  badgeImage: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
    marginRight: spacing.md,
  },
  badgeInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  badgeName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  badgeDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
  unlockedBadge: {
    backgroundColor: colors.primary.green,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  unlockedText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.text.primary,
  },
  unlockedDate: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  lockedBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  lockedText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
  },
  ruleText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyText: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.md,
  },
});

export default BadgesScreen;
