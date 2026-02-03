import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { HomeStackParamList } from '../../navigation/MainNavigator';
import { colors, typography, spacing } from '../../theme';

type VideoPlayerScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'VideoPlayer'>;
type VideoPlayerScreenRouteProp = RouteProp<HomeStackParamList, 'VideoPlayer'>;

interface Props {
  navigation: VideoPlayerScreenNavigationProp;
  route: VideoPlayerScreenRouteProp;
}

const VideoPlayerScreen: React.FC<Props> = ({ navigation, route }) => {
  const { contentId, videoUrl } = route.params;

  // Note: In a real implementation, you would use react-native-video here
  // For now, this is a placeholder

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Voltar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.playerContainer}>
        <Text style={styles.placeholder}>Video Player</Text>
        <Text style={styles.placeholderText}>Content ID: {contentId}</Text>
        <Text style={styles.placeholderText}>URL: {videoUrl}</Text>
        <Text style={styles.note}>
          Nota: Integração com react-native-video será necessária
        </Text>
      </View>

      <TouchableOpacity
        style={styles.commentsButton}
        onPress={() => navigation.navigate('Comments', { contentId })}
      >
        <Text style={styles.commentsButtonText}>Ver Comentários 💬</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary.green,
  },
  backButton: {
    color: colors.accent.gold,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
  },
  playerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    margin: spacing.lg,
    borderRadius: 8,
    padding: spacing.lg,
  },
  placeholder: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  placeholderText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  note: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  commentsButton: {
    backgroundColor: colors.accent.gold,
    margin: spacing.lg,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  commentsButtonText: {
    color: colors.text.inverse,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
});

export default VideoPlayerScreen;
