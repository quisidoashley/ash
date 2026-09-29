import { useCallback, useState } from 'react';

import {
  StyleSheet,
  Text,
  View,
  Alert,
  TextInput,
  Pressable,
} from 'react-native';

import { useFocusEffect, useRouter } from 'expo-router';

import AppButton from '@/components/AppButton';

import { COLORS } from '@/constants/colors';

import { useAuth, signOut } from '@/lib/auth';

import { getProfile, updateProfile } from '@/lib/profiles';

export default function ProfileScreen() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [draftName, setDraftName] = useState('');
  const [saving, setSaving] = useState(false);

  const router = useRouter();

  const loadProfile = useCallback(async () => {
    if (!user) return;

    try {
      const p = await getProfile(user.id);

      setProfile(p);
      setDraftName(p?.full_name ?? '');
    } catch (err: any) {
      Alert.alert(
        'Error',
        err?.message || 'Failed to load profile.'
      );
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  const handleSaveName = async () => {
    if (!user) return;

    if (!draftName.trim()) {
      Alert.alert('Error', 'Name cannot be empty.');
      return;
    }

    setSaving(true);

    try {
      const updated = await updateProfile(user.id, {
        full_name: draftName.trim(),
      });

      setProfile(updated);

      Alert.alert('Success', 'Name updated successfully.');
    } catch (err: any) {
      Alert.alert(
        'Error',
        err?.message || 'Failed to update name.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);

    try {
      await signOut();
      router.replace('/login');
    } catch (err: any) {
      Alert.alert(
        'Error',
        err?.message || 'Failed to sign out.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Profile</Text>

      {user && (
        <View style={styles.infoCard}>
          <Text style={styles.label}>Full Name</Text>

          <TextInput
            style={styles.input}
            value={draftName}
            onChangeText={setDraftName}
            placeholder="Enter your full name"
            placeholderTextColor={COLORS.textSecondary}
            editable={!saving}
          />

          <Pressable
            style={styles.saveButton}
            onPress={handleSaveName}
            disabled={saving}
          >
            <Text style={styles.saveButtonText}>
              {saving ? 'Saving...' : 'Save Name'}
            </Text>
          </Pressable>

          <Text style={styles.label}>Role</Text>

          {profile?.role === 'teacher' ? (
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>
                Teacher
              </Text>
            </View>
          ) : (
            <View
              style={[
                styles.roleBadge,
                styles.roleBadgeStudent,
              ]}
            >
              <Text style={styles.roleBadgeText}>
                Student
              </Text>
            </View>
          )}

          <Text style={styles.label}>Email</Text>

          <Text style={styles.value}>
            {user.email}
          </Text>

          <Text style={styles.label}>User ID</Text>

          <Text style={styles.valueSmall}>
            {user.id}
          </Text>
        </View>
      )}

      <AppButton
       title="Sign Out"
       icon="log-out-outline"
        onPress={handleSignOut}
/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 24,
    paddingTop: 24,
  },

  title: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },

  infoCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
  },

  label: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 4,
    marginTop: 8,
  },

  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.textPrimary,
  },

  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 10,
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },

  roleBadgeStudent: {
    backgroundColor: COLORS.primary,
  },

  roleBadgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },

  value: {
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },

  valueSmall: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
});