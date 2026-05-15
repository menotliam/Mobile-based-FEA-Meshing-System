import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { getProjects } from '../storage/projectStorage';

function formatDate(value) {
  if (!value) return 'Unknown date';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown date';
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
}

export default function MyProjects({ onNavigate, refreshToken = 0 }) {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadProjects = async () => {
      try {
        setIsLoading(true);
        const storedProjects = await getProjects();
        if (isMounted) setProjects(storedProjects);
      } catch (error) {
        console.warn('Unable to load local projects:', error);
        if (isMounted) setProjects([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadProjects();
    return () => {
      isMounted = false;
    };
  }, [refreshToken]);

  const totalProjects = projects.length;
  const successfulProjects = projects.filter((project) => project.lastSimulationStatus === 'success').length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 40) + 12 : 12 }]}>
        <View style={styles.headerLeft}>
          <View style={styles.appIcon}>
            <Text style={styles.appIconText}>FEA</Text>
          </View>
          <Text style={styles.headerTitle}>My Projects</Text>
        </View>
        <TouchableOpacity style={styles.searchBtn}>
          <Text style={styles.searchIcon}>🔍</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.overviewCard}>
          <Text style={styles.overviewTitle}>Overview</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalProjects}</Text>
              <Text style={styles.statLabel}>Total Projects</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#10B981' }]}>{successfulProjects}</Text>
              <Text style={styles.statLabel}>Successful Runs</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#1A56DB' }]}>Local</Text>
              <Text style={styles.statLabel}>Storage Mode</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Recent Projects</Text>

        {isLoading ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Loading projects...</Text>
            <Text style={styles.emptyDesc}>Reading local simulation history.</Text>
          </View>
        ) : projects.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No simulation projects yet</Text>
            <Text style={styles.emptyDesc}>Create a rectangle simulation and the app will save the input, output, quality metrics, and metadata locally.</Text>
            <TouchableOpacity style={styles.emptyActionBtn} onPress={onNavigate}>
              <Text style={styles.emptyActionText}>Create First Project</Text>
            </TouchableOpacity>
          </View>
        ) : (
          projects.map((project) => (
            <TouchableOpacity key={project.id} style={styles.projectItem} onPress={onNavigate}>
              <View style={styles.projectImageContainer}>
                <View style={styles.projectImagePlaceholder}>
                  <Text style={styles.projectImageText}>2D</Text>
                </View>
                <View style={[styles.statusDot, { backgroundColor: project.lastSimulationStatus === 'success' ? '#10B981' : '#F59E0B' }]} />
              </View>

              <View style={styles.projectInfo}>
                <Text style={styles.projectName}>{project.name}</Text>
                <Text style={styles.projectDate}>Updated: {formatDate(project.updatedAt)}</Text>
                <View style={styles.tagRow}>
                  <View style={styles.tagBadge}>
                    <Text style={styles.tagText}>{project.lastSimulationStatus || 'draft'}</Text>
                  </View>
                  <View style={styles.tagBadge}>
                    <Text style={styles.tagText}>Local history</Text>
                  </View>
                </View>
              </View>

              <Text style={styles.arrowIcon}>❯</Text>
            </TouchableOpacity>
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={onNavigate}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={[styles.navIcon, styles.navActive]}>📁</Text>
          <Text style={[styles.navText, styles.navActive]}>Projects</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={onNavigate}>
          <Text style={styles.navIcon}>▶️</Text>
          <Text style={styles.navText}>Simulate</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>📚</Text>
          <Text style={styles.navText}>Library</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>⚙️</Text>
          <Text style={styles.navText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 20 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  appIcon: { width: 36, height: 36, backgroundColor: '#1A56DB', borderRadius: 9, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  appIconText: { color: '#FFF', fontSize: 11, fontWeight: '800' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  searchBtn: { padding: 8 },
  searchIcon: { fontSize: 20, color: '#6B7280' },
  content: { paddingHorizontal: 20 },
  overviewCard: { backgroundColor: '#F8FAFC', borderRadius: 16, padding: 20, marginBottom: 30, borderWidth: 1, borderColor: '#F1F5F9' },
  overviewTitle: { fontSize: 14, color: '#1A56DB', fontWeight: '600', marginBottom: 16 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 4 },
  statLabel: { fontSize: 11, color: '#6B7280', textAlign: 'center' },
  statDivider: { width: 1, height: 30, backgroundColor: '#E2E8F0' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 16 },
  emptyCard: { backgroundColor: '#F9FAFB', borderRadius: 16, padding: 22, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 24 },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 8 },
  emptyDesc: { fontSize: 13, color: '#6B7280', lineHeight: 20, marginBottom: 18 },
  emptyActionBtn: { backgroundColor: '#1D4ED8', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center' },
  emptyActionText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  projectItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  projectImageContainer: { position: 'relative', marginRight: 16 },
  projectImagePlaceholder: { width: 56, height: 56, borderRadius: 12, backgroundColor: '#1D4ED8', justifyContent: 'center', alignItems: 'center' },
  projectImageText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  statusDot: { position: 'absolute', bottom: -2, right: -2, width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: '#FFF' },
  projectInfo: { flex: 1 },
  projectName: { fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 4 },
  projectDate: { fontSize: 12, color: '#6B7280', marginBottom: 8 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tagBadge: { backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  tagText: { fontSize: 10, color: '#4B5563', fontWeight: '500' },
  arrowIcon: { fontSize: 16, color: '#9CA3AF', marginLeft: 10 },
  fab: { position: 'absolute', bottom: 90, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: '#1A56DB', justifyContent: 'center', alignItems: 'center', shadowColor: '#1A56DB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  fabIcon: { color: '#FFF', fontSize: 32, fontWeight: '300', marginTop: -4 },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', backgroundColor: '#FFF', paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingBottom: 20 },
  navItem: { flex: 1, alignItems: 'center' },
  navIcon: { fontSize: 22, color: '#9CA3AF', marginBottom: 4 },
  navText: { fontSize: 10, color: '#9CA3AF', fontWeight: '500' },
  navActive: { color: '#1A56DB' },
});
