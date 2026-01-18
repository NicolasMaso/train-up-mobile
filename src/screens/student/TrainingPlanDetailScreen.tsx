import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { trainingPlansService, workoutsService } from '../../services';
import { TrainingPlan, Workout } from '../../types';

export default function TrainingPlanDetailScreen({ navigation, route }: any) {
  const { planId } = route.params;
  const [plan, setPlan] = useState<TrainingPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState<string | null>(null);

  const loadPlan = async () => {
    try {
      const data = await trainingPlansService.getById(planId);
      setPlan(data);
    } catch (error) {
      console.error('Error loading plan:', error);
      Alert.alert('Erro', 'Não foi possível carregar o plano');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlan();
  }, []);

  const handleStartWorkout = async (workout: Workout) => {
    // Navigate to workout execution or detail
    Alert.alert(
      workout.name,
      'Deseja iniciar este treino?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Iniciar',
          onPress: () => navigation.navigate('WorkoutExecution', { workoutId: workout.id }),
        },
      ]
    );
  };

  const handleCompleteWorkout = async (workoutId: string) => {
    setCompleting(workoutId);
    try {
      await workoutsService.markAsCompleted(workoutId);
      await loadPlan(); // Reload to update completed status
      Alert.alert('Sucesso', 'Treino marcado como concluído!');
    } catch (error) {
      console.error('Error completing workout:', error);
      Alert.alert('Erro', 'Não foi possível marcar como concluído');
    } finally {
      setCompleting(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading || !plan) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>← Voltar</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>{plan.name}</Text>
        {plan.description && (
          <Text style={styles.description}>{plan.description}</Text>
        )}
        <Text style={styles.dateRange}>
          📅 {formatDate(plan.startDate)} até {formatDate(plan.endDate)}
        </Text>
      </View>

      <Text style={styles.sectionTitle}>
        Treinos ({plan.workouts?.length || 0})
      </Text>

      {plan.workouts?.map((workout) => (
        <View key={workout.id} style={[
          styles.workoutCard,
          workout.completedAt && styles.workoutCardCompleted,
        ]}>
          <View style={styles.workoutHeader}>
            <View style={styles.workoutIcon}>
              <Text style={styles.workoutIconText}>
                {workout.completedAt ? '✅' : '🏋️'}
              </Text>
            </View>
            <View style={styles.workoutInfo}>
              <Text style={styles.workoutName}>{workout.name}</Text>
              <Text style={styles.exerciseCount}>
                {workout.exercises?.length || 0} exercícios
              </Text>
            </View>
          </View>

          <View style={styles.exercisesList}>
            {workout.exercises?.map((ex, index) => (
              <View key={ex.id} style={styles.exerciseItem}>
                <Text style={styles.exerciseNumber}>{index + 1}</Text>
                <View style={styles.exerciseDetails}>
                  <Text style={styles.exerciseName}>{ex.exercise.name}</Text>
                  <Text style={styles.exerciseSpecs}>
                    {ex.sets}x{ex.reps} {ex.weight ? `• ${ex.weight}` : ''}
                  </Text>
                  {ex.notes && (
                    <Text style={styles.exerciseNotes}>{ex.notes}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>

          {!workout.completedAt ? (
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.startButton}
                onPress={() => handleStartWorkout(workout)}
              >
                <Text style={styles.startButtonText}>Iniciar Treino</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.completeButton}
                onPress={() => handleCompleteWorkout(workout.id)}
                disabled={completing === workout.id}
              >
                <Text style={styles.completeButtonText}>
                  {completing === workout.id ? '...' : '✓'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.feedbackButton}
              onPress={() => navigation.navigate('CreateFeedback', { 
                workoutId: workout.id, 
                workoutName: workout.name 
              })}
            >
              <Text style={styles.feedbackButtonText}>💬 Dar Feedback</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f' },
  content: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  loadingContainer: { flex: 1, backgroundColor: '#0f0f0f', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#888', fontSize: 16 },
  backButton: { marginBottom: 16 },
  backButtonText: { color: '#7C3AED', fontSize: 16 },
  header: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  description: { fontSize: 14, color: '#888', marginBottom: 8 },
  dateRange: { fontSize: 13, color: '#7C3AED' },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#fff', marginBottom: 16 },
  workoutCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  workoutCardCompleted: { opacity: 0.7, borderColor: '#22c55e' },
  workoutHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  workoutIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  workoutIconText: { fontSize: 24 },
  workoutInfo: { flex: 1, marginLeft: 12 },
  workoutName: { fontSize: 18, fontWeight: '600', color: '#fff' },
  exerciseCount: { fontSize: 13, color: '#888', marginTop: 2 },
  exercisesList: { marginBottom: 16 },
  exerciseItem: {
    flexDirection: 'row',
    backgroundColor: '#252525',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  exerciseNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#7C3AED',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 12,
    fontWeight: 'bold',
  },
  exerciseDetails: { flex: 1, marginLeft: 12 },
  exerciseName: { color: '#fff', fontSize: 14, fontWeight: '500' },
  exerciseSpecs: { color: '#7C3AED', fontSize: 13, marginTop: 2 },
  exerciseNotes: { color: '#888', fontSize: 12, marginTop: 4, fontStyle: 'italic' },
  buttonRow: { flexDirection: 'row', gap: 10 },
  startButton: {
    flex: 1,
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  startButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  completeButton: {
    width: 50,
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#22c55e',
  },
  completeButtonText: { color: '#22c55e', fontWeight: 'bold', fontSize: 18 },
  feedbackButton: {
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#7C3AED',
  },
  feedbackButtonText: { color: '#7C3AED', fontWeight: '600', fontSize: 14 },
});
