import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuthStore } from '../../contexts';
import { studentsService, financesService, workoutsService, feedbackService } from '../../services';
import { Student, FinancialSummary, Workout } from '../../types';
import { WorkoutFeedback } from '../../services/feedback.service';

export default function PersonalDashboardScreen({ navigation }: any) {
  const { user, logout } = useAuthStore();
  const [students, setStudents] = useState<Student[]>([]);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [expiringWorkouts, setExpiringWorkouts] = useState<Workout[]>([]);
  const [pendingFeedbacks, setPendingFeedbacks] = useState<WorkoutFeedback[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [studentsData, summaryData, expiringData, feedbacksData] = await Promise.all([
        studentsService.getAll(),
        financesService.getSummary(),
        workoutsService.getExpiring(7),
        feedbackService.getAll('OPEN'),
      ]);
      setStudents(studentsData);
      setSummary(summaryData);
      setExpiringWorkouts(expiringData);
      setPendingFeedbacks(feedbacksData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getDaysUntilExpiry = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#7C3AED"
        />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá, {user?.name?.split(' ')[0]}!</Text>
          <Text style={styles.subtitle}>Bem-vindo ao seu dashboard</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{students.length}</Text>
          <Text style={styles.statLabel}>Alunos</Text>
        </View>
        <View style={[styles.statCard, styles.statCardPurple]}>
          <Text style={styles.statNumber}>{pendingFeedbacks.length}</Text>
          <Text style={styles.statLabel}>Feedbacks</Text>
        </View>
        <View style={[styles.statCard, styles.statCardWarning]}>
          <Text style={styles.statNumber}>{expiringWorkouts.length}</Text>
          <Text style={styles.statLabel}>Expirando</Text>
        </View>
        <View style={[styles.statCard, styles.statCardSuccess]}>
          <Text style={styles.statNumber}>
            R$ {summary?.monthlyRevenue?.toFixed(0) || '0'}
          </Text>
          <Text style={styles.statLabel}>Receita</Text>
        </View>
      </View>

      {/* Treinos Expirando */}
      {expiringWorkouts.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>⏰ Treinos Expirando</Text>
          </View>
          {expiringWorkouts.slice(0, 3).map((workout) => (
            <TouchableOpacity
              key={workout.id}
              style={styles.expiringCard}
              onPress={() => navigation.navigate('StudentDetail', { studentId: workout.studentId })}
            >
              <View style={styles.expiringInfo}>
                <Text style={styles.expiringName}>{workout.name}</Text>
                <Text style={styles.expiringStudent}>
                  {(workout as any).student?.name || 'Aluno'}
                </Text>
              </View>
              <View style={styles.expiringBadge}>
                <Text style={styles.expiringDays}>
                  {getDaysUntilExpiry(workout.expiresAt!)}d
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Feedbacks Pendentes */}
      {pendingFeedbacks.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>💬 Feedbacks Pendentes</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Feedback')}>
              <Text style={styles.seeAll}>Ver todos</Text>
            </TouchableOpacity>
          </View>
          {pendingFeedbacks.slice(0, 3).map((feedback) => (
            <TouchableOpacity
              key={feedback.id}
              style={styles.feedbackCard}
              onPress={() => navigation.navigate('FeedbackDetail', { feedbackId: feedback.id })}
            >
              <View style={styles.feedbackAvatar}>
                <Text style={styles.feedbackAvatarText}>
                  {feedback.student.name?.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.feedbackInfo}>
                <Text style={styles.feedbackStudent}>{feedback.student.name}</Text>
                <Text style={styles.feedbackMessage} numberOfLines={1}>
                  {feedback.message}
                </Text>
              </View>
              <Text style={styles.feedbackTime}>
                {new Date(feedback.createdAt).toLocaleDateString('pt-BR')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Alunos Recentes */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>👥 Alunos Recentes</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Students')}>
            <Text style={styles.seeAll}>Ver todos</Text>
          </TouchableOpacity>
        </View>
        
        {students.slice(0, 3).map((student) => (
          <TouchableOpacity
            key={student.id}
            style={styles.studentCard}
            onPress={() => navigation.navigate('StudentDetail', { studentId: student.id })}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {student.name?.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.studentInfo}>
              <Text style={styles.studentName}>{student.name}</Text>
              <Text style={styles.studentEmail}>{student.email}</Text>
            </View>
            <View style={styles.studentStats}>
              <Text style={styles.studentStatsText}>
                {student._count?.studentWorkouts || 0} treinos
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        {students.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Nenhum aluno cadastrado</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('AddStudent')}
            >
              <Text style={styles.addButtonText}>+ Adicionar Aluno</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Ações Rápidas</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('AddStudent')}
          >
            <Text style={styles.actionIcon}>👤</Text>
            <Text style={styles.actionLabel}>Novo Aluno</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Feedback')}
          >
            <Text style={styles.actionIcon}>💬</Text>
            <Text style={styles.actionLabel}>Feedbacks</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Exercises')}
          >
            <Text style={styles.actionIcon}>🏋️</Text>
            <Text style={styles.actionLabel}>Exercícios</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  logoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
  },
  logoutText: {
    color: '#ff4d4d',
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    gap: 10,
  },
  statCard: {
    width: '47%',
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  statCardPurple: {
    borderColor: '#7C3AED',
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
  },
  statCardSuccess: {
    borderColor: '#22c55e',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  statCardWarning: {
    borderColor: '#f59e0b',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  seeAll: {
    color: '#7C3AED',
    fontWeight: '500',
  },
  expiringCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  expiringInfo: {
    flex: 1,
  },
  expiringName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  expiringStudent: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  expiringBadge: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  expiringDays: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
  },
  feedbackCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  feedbackAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedbackAvatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  feedbackInfo: {
    flex: 1,
    marginLeft: 12,
  },
  feedbackStudent: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  feedbackMessage: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  feedbackTime: {
    fontSize: 11,
    color: '#666',
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  studentInfo: {
    flex: 1,
    marginLeft: 16,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  studentEmail: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  studentStats: {
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  studentStatsText: {
    color: '#888',
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
  },
  emptyText: {
    color: '#888',
    fontSize: 14,
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  quickActions: {
    padding: 20,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
});
