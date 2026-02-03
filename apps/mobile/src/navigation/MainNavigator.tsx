import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { colors } from '../theme';

// Screens
import HomeScreen from '../screens/main/HomeScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import NotificationsScreen from '../screens/main/NotificationsScreen';
import ContentDetailScreen from '../screens/main/ContentDetailScreen';
import VideoPlayerScreen from '../screens/main/VideoPlayerScreen';
import CommentsScreen from '../screens/main/CommentsScreen';
import StickersScreen from '../screens/main/StickersScreen';
import BadgesScreen from '../screens/main/BadgesScreen';

export type MainTabParamList = {
  HomeTab: undefined;
  Profile: undefined;
  Notifications: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  ContentDetail: { contentId: string };
  VideoPlayer: { contentId: string; videoUrl: string };
  Comments: { contentId: string };
  Stickers: undefined;
  Badges: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createStackNavigator<HomeStackParamList>();

const HomeStackNavigator: React.FC = () => {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen name="ContentDetail" component={ContentDetailScreen} />
      <HomeStack.Screen name="VideoPlayer" component={VideoPlayerScreen} />
      <HomeStack.Screen name="Comments" component={CommentsScreen} />
      <HomeStack.Screen name="Stickers" component={StickersScreen} />
      <HomeStack.Screen name="Badges" component={BadgesScreen} />
    </HomeStack.Navigator>
  );
};

const MainNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background.secondary,
          borderTopColor: colors.primary.green,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: colors.accent.gold,
        tabBarInactiveTintColor: colors.text.tertiary,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{ tabBarLabel: 'Início' }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ tabBarLabel: 'Notificações' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Perfil' }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;
