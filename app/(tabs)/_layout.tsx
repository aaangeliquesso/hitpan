import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  getNavbarSafePadding,
  NAVBAR_HEIGHT,
} from '../../src/shared/ui/navigation';
import { colors } from '../../src/shared/ui/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

function TabIcon({
  name,
  focused,
  color,
}: {
  name: IconName;
  focused: boolean;
  color: string;
}) {
  return (
    <View style={[styles.tabIcon, focused && styles.activeTabPill]}>
      <Ionicons
        color={focused ? colors.brand : color}
        name={name}
        size={22}
      />
    </View>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const navbarSafePadding = getNavbarSafePadding(insets.bottom);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: [
          styles.tabBar,
          {
            bottom: 0,
            height: NAVBAR_HEIGHT + navbarSafePadding,
            paddingBottom: navbarSafePadding,
          },
        ],
        tabBarItemStyle: styles.tabBarItem,
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.textSecondary,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              color={String(color)}
              focused={focused}
              name="home-outline"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Project Pan',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              color={String(color)}
              focused={focused}
              name="disc-outline"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="wishlist"
        options={{
          title: 'Wishlist',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              color={String(color)}
              focused={focused}
              name="heart-outline"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              color={String(color)}
              focused={focused}
              name="person-outline"
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    left: 0,
    right: 0,
    height: NAVBAR_HEIGHT,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.backgroundPrimary,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  tabBarItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    transform: [{ translateY: -6 }],
  },
  activeTabPill: {
    backgroundColor: colors.brandSurface,
  },
});
