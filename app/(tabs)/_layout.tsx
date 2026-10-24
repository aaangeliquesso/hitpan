import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';

const BURGUNDY = '#5A1818';
const CREAM = '#F7F0E5';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: CREAM,
        tabBarInactiveTintColor: '#D9BDB2',
        tabBarLabelStyle: styles.tabLabel,
        tabBarIconStyle: styles.tabIcon,
      }}
    >
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
    left: 16,
    right: 16,
    bottom: 12,
    height: 68,
    paddingTop: 7,
    paddingBottom: 6,
    backgroundColor: BURGUNDY,
    borderTopWidth: 0,
    borderRadius: 24,
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
