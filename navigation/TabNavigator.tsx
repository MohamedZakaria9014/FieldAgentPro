import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import Assignments from '../pages/Assignments';
import Schedule from '../pages/Schedule';
import Settings from '../pages/Settings';
import { useAppTheme } from '../theme/useAppTheme';

type RootTabParamList = {
  Assignments: undefined;
  Schedule: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function TabNavigator() {
  const { t } = useTranslation();
  const theme = useAppTheme();

  return (
    <Tab.Navigator
      screenOptions={({
        route,
      }: {
        route: { name: keyof RootTabParamList };
      }) => ({
        headerShown: false,
        tabBarStyle: [styles.tabBar, { backgroundColor: theme.colors.tabBar }],
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        // This creates the blue pill background behind the active icon
        tabBarIcon: ({
          color,
          focused,
        }: {
          color: string;
          focused: boolean;
        }) => {
          let iconName: string = '';

          if (route.name === 'Assignments') iconName = 'clipboard-text';
          else if (route.name === 'Schedule') iconName = 'calendar-month';
          else if (route.name === 'Settings') iconName = 'cog';

          return (
            <View
              style={[
                styles.iconWrapper,
                focused && { backgroundColor: theme.colors.pill },
              ]}
            >
              <Icon
                name={iconName}
                size={24}
                color={focused ? theme.colors.primary : theme.colors.textMuted}
              />
            </View>
          );
        },
      })}
    >
      <Tab.Screen
        name="Assignments"
        component={Assignments}
        options={{ tabBarLabel: t('assignments') }}
      />
      <Tab.Screen
        name="Schedule"
        component={Schedule}
        options={{ tabBarLabel: t('schedule') }}
      />
      <Tab.Screen
        name="Settings"
        component={Settings}
        options={{ tabBarLabel: t('settings') }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#121B22',
    borderTopWidth: 0,
    height: 70,
    paddingBottom: 10,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 5,
  },
  iconWrapper: {
    width: 60,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  activeIconWrapper: {
    backgroundColor: 'rgba(33, 150, 243, 0.15)', // deprecated (kept for backward compatibility)
  },
});
