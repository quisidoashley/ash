import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useState } from 'react';

import { COLORS } from '@/constants/colors';
import { getCurrentRole } from '@/lib/role';
import type { Role } from '@/lib/profiles';

export default function TabLayout() {
  const [role, setRole] = useState<Role | null>(null);

  useEffect(() => {
    async function loadRole() {
      const currentRole = await getCurrentRole();
      setRole(currentRole);
    }

    loadRole();
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        headerStyle: {
          backgroundColor: COLORS.background,
        },
        headerShadowVisible: false,
        headerTintColor: COLORS.textPrimary,
        tabBarStyle: {
          backgroundColor: COLORS.card,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
        },
      }}
    >
      {/* HOME */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'home-sharp' : 'home-outline'}
              color={color}
              size={24}
            />
          ),
        }}
      />

      {/* SCAN - STUDENT ONLY */}
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan',
          href: role === 'student' ? '/scan' : null,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'qr-code' : 'qr-code-outline'}
              color={color}
              size={24}
            />
          ),
        }}
      />

      {/* HISTORY - ALL USERS */}
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'time' : 'time-outline'}
              color={color}
              size={24}
            />
          ),
        }}
      />

      {/* TEACHER / MANAGE - TEACHER AND ADMIN */}
      <Tabs.Screen
        name="teacher"
        options={{
          title: role === 'admin' ? 'Manage' : 'Teacher',
          href:
            role === 'teacher' || role === 'admin'
              ? '/teacher'
              : null,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={
                focused
                  ? 'clipboard'
                  : 'clipboard-outline'
              }
              color={color}
              size={24}
            />
          ),
        }}
      />

      {/* ADMIN - ADMIN ONLY */}
      <Tabs.Screen
        name="admin"
        options={{
          title: 'Admin',
          href: role === 'admin' ? '/admin' : null,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={
                focused
                  ? 'shield-checkmark'
                  : 'shield-checkmark-outline'
              }
              color={color}
              size={24}
            />
          ),
        }}
      />

      {/* PROFILE - ALL USERS */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={
                focused
                  ? 'person'
                  : 'person-outline'
              }
              color={color}
              size={24}
            />
          ),
        }}
      />
    </Tabs>
  );
}