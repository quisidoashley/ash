
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from 'expo-router';

import { COLORS } from '@/constants/colors';
import { getCurrentRole } from '@/lib/role';
import { Role } from '@/lib/profiles';
import { supabase } from '@/lib/supabase';

type AdminUser = {
  id: string;
  email: string;
  full_name: string | null;
  role: Role;
};

type AdminEvent = {
  id: string;
  event_code: string;
  title: string;
  start_time: string;
  end_time: string;
  created_at: string;
};

type AdminAttendance = {
  id: string;
  student_id: string;
  event_id: string;
  scanned_at: string;
};

export default function AdminScreen() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [attendanceRecords, setAttendanceRecords] =
    useState<AdminAttendance[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [error, setError] = useState('');
  const [attendanceError, setAttendanceError] = useState('');
  const [currentRole, setCurrentRole] = useState<Role | null>(null);

  const loadUsers = async () => {
    const { data, error: queryError } = await supabase
      .from('profiles')
      .select('id, email, full_name, role')
      .order('created_at', { ascending: false });

    if (queryError) {
      console.error('Users query error:', queryError.message);
      return;
    }

    setUsers((data ?? []) as AdminUser[]);
  };

  const loadEvents = async () => {
    const { data, error: queryError } = await supabase
      .from('events')
      .select('id, event_code, title, start_time, end_time, created_at')
      .order('created_at', { ascending: false });

    if (queryError) {
      console.error('Events query error:', queryError.message);
      return;
    }

    setEvents((data ?? []) as AdminEvent[]);
  };

  const loadAttendance = async () => {
    setLoadingAttendance(true);
    setAttendanceError('');

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      console.log('Signed-in user:', user?.id ?? 'No user');

      if (authError) {
        console.error('Auth error:', authError.message);
      }

      const { data, error: queryError, status } = await supabase
        .from('attendance')
        .select('id, student_id, event_id, scanned_at')
        .order('scanned_at', { ascending: false });

        console.log('Attendance query status:', status);
        console.log('Attendance query error:', queryError);
        console.log('Attendance records returned:', data?.length ?? 0);
        console.log('Attendance data:', data);

      console.log('Attendance HTTP status:', status);
      console.log(
        'Attendance query error:',
        queryError?.message ?? 'None',
      );
      console.log('Attendance records:', data);
      console.log('Attendance count:', data?.length ?? 0);

      if (queryError) {
        setAttendanceError(queryError.message);
        setAttendanceRecords([]);
        return;
      }

      setAttendanceRecords((data ?? []) as AdminAttendance[]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to load attendance.';

      console.error('Attendance loading failed:', message);
      setAttendanceError(message);
      setAttendanceRecords([]);
    } finally {
      setLoadingAttendance(false);
    }
  };

  const loadAdminData = async () => {
    setLoading(true);
    setError('');

    try {
      const role = await getCurrentRole();
      setCurrentRole(role);

      if (role !== 'admin') {
        setError('Access denied. Only administrators can view this page.');
        return;
      }

      await Promise.all([
        loadUsers(),
        loadEvents(),
        loadAttendance(),
      ]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to load admin data.';

      setError(message);
      console.error('Admin dashboard error:', message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      void loadAdminData();
    }, []),
  );

  const formatDate = (value: string) => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading admin dashboard...</Text>
      </View>
    );
  }

  if (error || currentRole !== 'admin') {
    return (
      <View style={styles.center}>
        <Ionicons
          name="shield-checkmark-outline"
          size={52}
          color={COLORS.primary}
        />
        <Text style={styles.errorTitle}>Admin Access</Text>
        <Text style={styles.errorText}>
          {error || 'Only administrators can access this page.'}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.heading}>Admin Dashboard</Text>
          <Text style={styles.subtitle}>
            Manage users, events, and attendance
          </Text>
        </View>

        <View style={styles.adminIcon}>
          <Ionicons name="shield-checkmark" size={28} color="#FFFFFF" />
        </View>
      </View>

      <View style={styles.statsContainer}>
        <StatCard
          title="Users"
          count={users.length}
          icon="people-outline"
          color="#2563EB"
        />
        <StatCard
          title="Events"
          count={events.length}
          icon="calendar-outline"
          color="#7C3AED"
        />
        <StatCard
          title="Attendance"
          count={attendanceRecords.length}
          icon="checkmark-done-outline"
          color="#059669"
        />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="people-outline" size={22} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>Manage Users</Text>
        </View>

        {users.length === 0 ? (
          <EmptyState message="No users found or access is restricted." />
        ) : (
          users.map((user) => (
            <View key={user.id} style={styles.listItem}>
              <View style={styles.itemIcon}>
                <Ionicons
                  name="person-outline"
                  size={22}
                  color={COLORS.primary}
                />
              </View>

              <View style={styles.itemDetails}>
                <Text style={styles.itemTitle}>
                  {user.full_name || 'Unnamed User'}
                </Text>
                <Text style={styles.itemSubtitle}>{user.email}</Text>
                <Text style={styles.itemMeta}>Role: {user.role}</Text>
              </View>

              <View
                style={[
                  styles.roleBadge,
                  user.role === 'admin' && styles.adminBadge,
                ]}
              >
                <Text
                  style={[
                    styles.roleText,
                    user.role === 'admin' && styles.adminRoleText,
                  ]}
                >
                  {user.role}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons
            name="calendar-outline"
            size={22}
            color={COLORS.primary}
          />
          <Text style={styles.sectionTitle}>Manage Events</Text>
        </View>

        {events.length === 0 ? (
          <EmptyState message="No events found or access is restricted." />
        ) : (
          events.map((event) => (
            <View key={event.id} style={styles.listItem}>
              <View style={styles.itemIcon}>
                <Ionicons
                  name="calendar"
                  size={22}
                  color={COLORS.primary}
                />
              </View>

              <View style={styles.itemDetails}>
                <Text style={styles.itemTitle}>{event.title}</Text>
                <Text style={styles.itemSubtitle}>
                  Code: {event.event_code}
                </Text>
                <Text style={styles.itemMeta}>
                  Starts: {formatDate(event.start_time)}
                </Text>
                <Text style={styles.itemMeta}>
                  Ends: {formatDate(event.end_time)}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons
            name="checkmark-done-outline"
            size={22}
            color={COLORS.primary}
          />
          <Text style={styles.sectionTitle}>Attendance Overview</Text>
        </View>

        {loadingAttendance ? (
          <ActivityIndicator
            size="small"
            color={COLORS.primary}
            style={styles.loader}
          />
        ) : attendanceError ? (
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle-outline" size={24} color="#DC2626" />
            <Text style={styles.errorText}>{attendanceError}</Text>
          </View>
        ) : attendanceRecords.length === 0 ? (
          <EmptyState message="No attendance records found. Check the console if records exist in Supabase but are not displayed here." />
        ) : (
          attendanceRecords.map((record) => (
            <View key={record.id} style={styles.listItem}>
              <View style={styles.itemIcon}>
                <Ionicons
                  name="person-circle-outline"
                  size={24}
                  color="#059669"
                />
              </View>

              <View style={styles.itemDetails}>
                <Text style={styles.itemTitle}>
                  Student ID: {record.student_id}
                </Text>
                <Text style={styles.itemSubtitle}>
                  Event ID: {record.event_id}
                </Text>
                <Text style={styles.itemMeta}>
                  Scanned: {formatDate(record.scanned_at)}
                </Text>
              </View>

              <Ionicons
                name="checkmark-circle"
                size={22}
                color="#059669"
              />
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

function StatCard({
  title,
  count,
  icon,
  color,
}: {
  title: string;
  count: number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color }]}>
        <Ionicons name={icon} size={22} color="#FFFFFF" />
      </View>
      <Text style={styles.statCount}>{count}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <View style={styles.emptyState}>
      <Ionicons name="information-circle-outline" size={24} color="#64748B" />
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 18,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 12,
    color: '#64748B',
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  heading: {
    fontSize: 25,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    marginTop: 5,
    fontSize: 13,
    color: '#64748B',
  },
  adminIcon: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 22,
  },
  statCard: {
    flex: 1,
    minWidth: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 13,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statCount: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
  },
  statTitle: {
    marginTop: 3,
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 11,
  },
  itemIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemDetails: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  itemSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: '#475569',
  },
  itemMeta: {
    marginTop: 4,
    fontSize: 11,
    color: '#64748B',
  },
  roleBadge: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  adminBadge: {
    backgroundColor: '#DBEAFE',
  },
  roleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'capitalize',
  },
  adminRoleText: {
    color: '#1D4ED8',
  },
  emptyState: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingVertical: 16,
  },
  emptyText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: '#64748B',
  },
  loader: {
    padding: 18,
  },
  errorTitle: {
    marginTop: 12,
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  errorText: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 20,
    color: '#B91C1C',
    textAlign: 'center',
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 12,
  },
});
