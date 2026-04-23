import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BRAND_COLOR } from '@/constants/brand';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const tabBarBackgroundColor = colorScheme === 'dark' ? '#0E1116' : '#FFFFFF';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: BRAND_COLOR,
        tabBarInactiveTintColor: '#7B879A',
        tabBarStyle: {
          backgroundColor: tabBarBackgroundColor,
        },
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Filters',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="line.3.horizontal.decrease.circle.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
