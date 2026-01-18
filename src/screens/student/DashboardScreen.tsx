import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useAuthStore } from '../../contexts';
import { workoutsService, evaluationsService, financesService } from '../../services';
import { ProgressData } from '../../services/evaluations.service';
import { Workout } from '../../types';

export default function StudentDashboardScreen({ navigation }: any) {
  const { user, logout } = useAuthStore();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [pendingPayments, setPendingPayments] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [workoutsData, progressData, paymentsData] = await Promise.all([
        workoutsService.getAll(),
        evaluationsService.getProgress(user?.id || ''),
        financesService.getPayments(),
      ]);
      setWorkouts(workoutsData);
      setProgress(progressData);
      setPendingPayments(
        (paymentsData.summary as any).pendingAmount + (paymentsData.summary as any).overdueAmount
      );
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const upcomingWorkouts = workouts
    .filter((w) => !w.completedAt)
    .slice(0, 3);

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
          <Text style={styles.subtitle}>Vamos treinar hoje?</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      {progress?.progress && (
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>📈 Seu Progresso</Text>
          <View style={styles.progressStats}>
            <View style={styles.progressStat}>
              <Text style={styles.progressValue}>
                {progress.progress.weightChange > 0 ? '+' : ''}
                {progress.progress.weightChange.toFixed(1)} kg
              </Text>
              <Text style={styles.progressLabel}>Peso</Text>
            </View>
            {progress.progress.bodyFatChange !== null && (
              <View style={styles.progressStat}>
                <Text style={styles.progressValue}>
                  {progress.progress.bodyFatChange > 0 ? '+' : ''}
                  {progress.progress.bodyFatChange.toFixed(1)}%
                </Text>
                <Text style={styles.progressLabel}>% Gordura</Text>
              </View>
            )}
            <View style={styles.progressStat}>
              <Text style={styles.progressValue}>
                {progress.progress.periodDays} dias
              </Text>
              <Text style={styles.progressLabel}>Período</Text>
            </View>
          </View>
        </View>
      )}

      {pendingPayments > 0 && (
        <TouchableOpacity
          style={styles.paymentAlert}
          onPress={() => navigation.navigate('Payments')}
        >
          <Text style={styles.paymentAlertIcon}>⚠️</Text>
          <View style={styles.paymentAlertContent}>
            <Text style={styles.paymentAlertTitle}>Pagamento Pendente</Text>
            <Text style={styles.paymentAlertValue}>
              R$ {pendingPayments.toFixed(2)}
            </Text>
          </View>
          <Text style={styles.paymentAlertArrow}>→</Text>
        </TouchableOpacity>
      )}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Próximos Treinos</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Workouts')}>
            <Text style={styles.seeAll}>Ver todos</Text>
          </TouchableOpacity>
        </View>

        {upcomingWorkouts.map((workout) => (
          <TouchableOpacity
            key={workout.id}
            style={styles.workoutCard}
            onPress={() => navigation.navigate('WorkoutDetail', { workoutId: workout.id })}
          >
            <View style={styles.workoutIcon}>
              <Text style={styles.workoutIconText}>🏋️</Text>
            </View>
            <View style={styles.workoutInfo}>
              <Text style={styles.workoutName}>{workout.name}</Text>
              <Text style={styles.workoutExercises}>
                {workout.exercises?.length || 0} exercícios
              </Text>
            </View>
            <TouchableOpacity
              style={styles.startButton}
              onPress={() => navigation.navigate('WorkoutExecution', { workoutId: workout.id })}
            >
              <Text style={styles.startButtonText}>Iniciar</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}

        {upcomingWorkouts.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>
              Nenhum treino agendado
            </Text>
          </View>
        )}
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Menu</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Workouts')}
          >
            <Text style={styles.actionIcon}>📋</Text>
            <Text style={styles.actionLabel}>Meus Treinos</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Progress')}
          >
            <Text style={styles.actionIcon}>📊</Text>
            <Text style={styles.actionLabel}>Progresso</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Payments')}
          >
            <Text style={styles.actionIcon}>💳</Text>
            <Text style={styles.actionLabel}>Pagamentos</Text>
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
  progressCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#7C3AED',
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  progressStat: {
    alignItems: 'center',
  },
  progressValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7C3AED',
  },
  progressLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  paymentAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  paymentAlertIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  paymentAlertContent: {
    flex: 1,
  },
  paymentAlertTitle: {
    color: '#f59e0b',
    fontWeight: '600',
  },
  paymentAlertValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  paymentAlertArrow: {
    color: '#f59e0b',
    fontSize: 20,
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
  workoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  workoutIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  workoutIconText: {
    fontSize: 24,
  },
  workoutInfo: {
    flex: 1,
    marginLeft: 16,
  },
  workoutName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  workoutExercises: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  startButton: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  startButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    color: '#888',
    fontSize: 14,
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
