import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { HomeStackParamList } from '../../navigation/MainNavigator';
import { StickerPack, Sticker } from '../../types';
import { userService } from '../../services/user';
import { colors, typography, spacing, borderRadius } from '../../theme';

type StickersScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'Stickers'>;

interface Props {
  navigation: StickersScreenNavigationProp;
}

const StickersScreen: React.FC<Props> = ({ navigation }) => {
  const [packs, setPacks] = useState<StickerPack[]>([]);
  const [selectedPack, setSelectedPack] = useState<StickerPack | null>(null);
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingStickers, setLoadingStickers] = useState(false);

  useEffect(() => {
    loadStickerPacks();
  }, []);

  const loadStickerPacks = async () => {
    try {
      const data = await userService.getStickerPacks();
      setPacks(data);
    } catch (error) {
      console.error('Error loading sticker packs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePackPress = async (pack: StickerPack) => {
    if (!pack.unlocked) {
      Alert.alert(
        'Pack Bloqueado',
        'Este pack de stickers requer um badge específico para ser desbloqueado.'
      );
      return;
    }

    setSelectedPack(pack);
    setLoadingStickers(true);
    try {
      const data = await userService.getStickersFromPack(pack.id);
      setStickers(data);
    } catch (error) {
      console.error('Error loading stickers:', error);
    } finally {
      setLoadingStickers(false);
    }
  };

  const renderPack = ({ item }: { item: StickerPack }) => (
    <TouchableOpacity
      style={[styles.packCard, !item.unlocked && styles.packLocked]}
      onPress={() => handlePackPress(item)}
    >
      <Image source={{ uri: item.thumbnail_url }} style={styles.packImage} />
      <View style={styles.packOverlay}>
        <Text style={styles.packName}>{item.name}</Text>
        {!item.unlocked && (
          <Text style={styles.lockIcon}>🔒</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderSticker = ({ item }: { item: Sticker }) => (
    <TouchableOpacity style={styles.stickerCard}>
      <Image source={{ uri: item.image_url }} style={styles.stickerImage} />
      <Text style={styles.stickerName}>{item.name}</Text>
    </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Stickers</Text>
      </View>

      {selectedPack ? (
        <View style={styles.content}>
          <View style={styles.packHeader}>
            <TouchableOpacity onPress={() => setSelectedPack(null)}>
              <Text style={styles.backButton}>← Packs</Text>
            </TouchableOpacity>
            <Text style={styles.packTitle}>{selectedPack.name}</Text>
          </View>
          {loadingStickers ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.accent.gold} />
            </View>
          ) : (
            <FlatList
              data={stickers}
              renderItem={renderSticker}
              keyExtractor={(item) => item.id}
              numColumns={3}
              contentContainerStyle={styles.listContent}
            />
          )}
        </View>
      ) : (
        <FlatList
          data={packs}
          renderItem={renderPack}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nenhum pack disponível</Text>
            </View>
          }
        />
      )}
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
  packHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.card,
    gap: spacing.md,
  },
  packTitle: {
    color: colors.text.primary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  listContent: {
    padding: spacing.md,
  },
  packCard: {
    flex: 1,
    margin: spacing.sm,
    aspectRatio: 1,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    backgroundColor: colors.background.card,
  },
  packLocked: {
    opacity: 0.5,
  },
  packImage: {
    width: '100%',
    height: '100%',
  },
  packOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  packName: {
    color: colors.text.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    flex: 1,
  },
  lockIcon: {
    fontSize: typography.fontSize.lg,
  },
  stickerCard: {
    flex: 1,
    margin: spacing.sm,
    aspectRatio: 1,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stickerImage: {
    width: '80%',
    height: '80%',
  },
  stickerName: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.xs,
    marginTop: spacing.xs,
    textAlign: 'center',
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

export default StickersScreen;
