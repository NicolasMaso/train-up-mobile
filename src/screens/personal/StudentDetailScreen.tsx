import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { studentsService, workoutsService, evaluationsService } from '../../services';
import { Student, Workout, Evaluation } from '../../types';

export default function StudentDetailScreen({ navigation, route }: any) {
  const { studentId } = route.params;
  const [student, setStudent] = useState<Student | null>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [studentData, workoutsData, evaluationsData] = await Promise.all([
        studentsService.getById(studentId),
        workoutsService.getAll(studentId),
        evaluationsService.getAll(studentId),
      ]);
      setStudent(studentData);
      setWorkouts(workoutsData);
      setEvaluations(evaluationsData);
    } catch (error) {
      console.error('Error loading student data:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados do aluno');
    }
  };

  useEffect(() => {
    loadData();
  }, [studentId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (!student) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

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
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {student.name?.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.studentName}>{student.name}</Text>
        <Text style={styles.studentEmail}>{student.email}</Text>
        {student.phone && (
          <Text style={styles.studentPhone}>{student.phone}</Text>
        )}
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{workouts.length}</Text>
          <Text style={styles.statLabel}>Treinos</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{evaluations.length}</Text>
          <Text style={styles.statLabel}>Avaliações</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ações</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('CreateTrainingPlan', { studentId })}
          >
            <Text style={styles.actionIcon}>➕</Text>
            <Text style={styles.actionLabel}>Novo Plano</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('ManageTrainingPlans', { studentId, studentName: student?.name })}
          >
            <Text style={styles.actionIcon}>📋</Text>
            <Text style={styles.actionLabel}>Gerenciar Planos</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('CreateEvaluation', { studentId })}
          >
            <Text style={styles.actionIcon}>📊</Text>
            <Text style={styles.actionLabel}>Nova Avaliação</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('CreateAnamnesis', { studentId })}
          >
            <Text style={styles.actionIcon}>📝</Text>
            <Text style={styles.actionLabel}>Anamnese</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Treinos Recentes</Text>
        {workouts.slice(0, 3).map((workout) => (
          <View key={workout.id} style={styles.listItem}>
            <Text style={styles.listItemTitle}>{workout.name}</Text>
            <Text style={styles.listItemSubtitle}>
              {workout.exercises?.length || 0} exercícios
            </Text>
          </View>
        ))}
        {workouts.length === 0 && (
          <Text style={styles.emptyText}>Nenhum treino cadastrado</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Avaliações</Text>
        {evaluations.slice(0, 3).map((evaluation) => (
          <View key={evaluation.id} style={styles.listItem}>
            <Text style={styles.listItemTitle}>
              {new Date(evaluation.evaluationDate).toLocaleDateString('pt-BR')}
            </Text>
            <Text style={styles.listItemSubtitle}>
              Peso: {evaluation.weight}kg | IMC: {evaluation.bmi?.toFixed(1) || '-'}
            </Text>
          </View>
        ))}
        {evaluations.length === 0 && (
          <Text style={styles.emptyText}>Nenhuma avaliação cadastrada</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0f0f0f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#888',
    fontSize: 16,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    color: '#7C3AED',
    fontSize: 16,
  },
  profileCard: {
    alignItems: 'center',
    padding: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  studentName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  studentEmail: {
    fontSize: 14,
    color: '#888',
  },
  studentPhone: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7C3AED',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionLabel: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  listItem: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  listItemSubtitle: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    padding: 20,
  },
});
