import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getNavbarBottom, NAVBAR_HEIGHT } from '../../src/shared/ui/navigation';

const BURGUNDY = '#4A121A';
const CREAM = '#F7F0E5';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottom = getNavbarBottom(insets.bottom);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: [
          styles.tabBar,
          {
            bottom,
          },
        ],
        tabBarItemStyle: styles.tabBarItem,
        tabBarActiveTintColor: CREAM,
        tabBarInactiveTintColor: '#D9BDB2',
        tabBarLabelStyle: styles.tabLabel,
        tabBarIconStyle: styles.tabIcon,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View
              style={[
                styles.iconHighlight,
                focused && styles.activeIconHighlight,
              ]}
            >
              <Ionicons
                name="home-outline"
                size={20}
                color={focused ? BURGUNDY : String(color)}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Project Pan',
          tabBarIcon: ({ color, focused }) => (
            <View
              style={[
                styles.iconHighlight,
                focused && styles.activeIconHighlight,
              ]}
            >
              <Ionicons
                name="disc-outline"
                size={20}
                color={focused ? BURGUNDY : String(color)}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="wishlist"
        options={{
          title: 'Wishlist',
          tabBarIcon: ({ color, focused }) => (
            <View
              style={[
                styles.iconHighlight,
                focused && styles.activeIconHighlight,
              ]}
            >
              <Ionicons
                name="heart-outline"
                size={20}
                color={focused ? BURGUNDY : String(color)}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View
              style={[
                styles.iconHighlight,
                focused && styles.activeIconHighlight,
              ]}
            >
              <Ionicons
                name="person-outline"
                size={20}
                color={focused ? BURGUNDY : String(color)}
              />
            </View>
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
    justifyContent: 'space-around',
    alignItems: 'center',
    left: 20,
    right: 20,
    height: NAVBAR_HEIGHT,
    paddingVertical: 10,
    backgroundColor: BURGUNDY,
    borderTopWidth: 0,
    borderRadius: 30,
  },
  tabBarItem: {
    flex: 1,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  tabIcon: {
    marginTop: 1,
  },
  iconHighlight: {
    width: 38,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
  },
  activeIconHighlight: {
    backgroundColor: CREAM,
  },
});
