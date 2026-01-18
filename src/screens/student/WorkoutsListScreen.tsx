import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { workoutsService } from '../../services';
import { Workout } from '../../types';

export default function WorkoutsListScreen({ navigation }: any) {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadWorkouts = async () => {
    try {
      const data = await workoutsService.getAll();
      setWorkouts(data);
    } catch (error) {
      console.error('Error loading workouts:', error);
    }
  };

  useEffect(() => {
    loadWorkouts();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWorkouts();
    setRefreshing(false);
  };

  const renderWorkout = ({ item }: { item: Workout }) => (
    <TouchableOpacity
      style={[
        styles.workoutCard,
        item.completedAt && styles.workoutCardCompleted,
      ]}
      onPress={() => navigation.navigate('WorkoutDetail', { workoutId: item.id })}
    >
      <View style={styles.workoutHeader}>
        <View style={styles.workoutIcon}>
          <Text style={styles.workoutIconText}>
            {item.completedAt ? '✅' : '🏋️'}
          </Text>
        </View>
        <View style={styles.workoutInfo}>
          <Text style={styles.workoutName}>{item.name}</Text>
          {item.description && (
            <Text style={styles.workoutDescription} numberOfLines={1}>
              {item.description}
            </Text>
          )}
        </View>
      </View>
      
      <View style={styles.exercisesList}>
        {item.exercises?.slice(0, 3).map((ex, index) => (
          <View key={ex.id} style={styles.exerciseItem}>
            <Text style={styles.exerciseNumber}>{index + 1}</Text>
            <Text style={styles.exerciseName}>{ex.exercise.name}</Text>
            <Text style={styles.exerciseSets}>
              {ex.sets}x{ex.reps}
            </Text>
          </View>
        ))}
        {(item.exercises?.length || 0) > 3 && (
          <Text style={styles.moreExercises}>
            +{item.exercises!.length - 3} exercícios
          </Text>
        )}
      </View>

      <View style={styles.buttonRow}>
        {!item.completedAt ? (
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => navigation.navigate('WorkoutExecution', { workoutId: item.id })}
          >
            <Text style={styles.startButtonText}>Iniciar Treino</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.feedbackButton}
            onPress={() => navigation.navigate('CreateFeedback', { 
              workoutId: item.id, 
              workoutName: item.name 
            })}
          >
            <Text style={styles.feedbackButtonText}>💬 Dar Feedback</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Meus Treinos</Text>
      </View>

      <FlatList
        data={workouts}
        renderItem={renderWorkout}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#7C3AED"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>Nenhum treino disponível</Text>
            <Text style={styles.emptySubtitle}>
              Seu personal irá adicionar treinos para você
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  list: {
    padding: 20,
    paddingTop: 0,
  },
  workoutCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  workoutCardCompleted: {
    opacity: 0.7,
    borderColor: '#22c55e',
  },
  workoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
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
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  workoutDescription: {
    fontSize: 13,
    color: '#888',
    marginTop: 4,
  },
  exercisesList: {
    gap: 8,
    marginBottom: 16,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#252525',
    borderRadius: 8,
    padding: 12,
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
  exerciseName: {
    flex: 1,
    color: '#fff',
    marginLeft: 12,
    fontSize: 14,
  },
  exerciseSets: {
    color: '#7C3AED',
    fontWeight: '600',
  },
  moreExercises: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  startButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    flex: 1,
  },
  startButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  feedbackButton: {
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    flex: 1,
    borderWidth: 1,
    borderColor: '#7C3AED',
  },
  feedbackButtonText: {
    color: '#7C3AED',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    padding: 48,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
});
