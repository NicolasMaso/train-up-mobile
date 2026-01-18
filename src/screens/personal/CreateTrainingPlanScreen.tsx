import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { trainingPlansService, exercisesService } from '../../services';
import { Exercise } from '../../types';

interface ExerciseSelection {
  exerciseId: string;
  exercise: Exercise;
  sets: number;
  reps: string;
  restSeconds: number;
  weight: string;
  notes: string;
}

interface WorkoutDraft {
  name: string;
  description: string;
  exercises: ExerciseSelection[];
}

export default function CreateTrainingPlanScreen({ navigation, route }: any) {
  const { studentId } = route.params;
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)); // +30 days
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [workouts, setWorkouts] = useState<WorkoutDraft[]>([
    { name: 'Treino A', description: '', exercises: [] },
  ]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeWorkoutIndex, setActiveWorkoutIndex] = useState(0);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [exerciseSearch, setExerciseSearch] = useState('');

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    try {
      const data = await exercisesService.getAll();
      setExercises(data);
    } catch (error) {
      console.error('Error loading exercises:', error);
    }
  };

  const addWorkout = () => {
    const letter = String.fromCharCode(65 + workouts.length); // A, B, C...
    setWorkouts([
      ...workouts,
      { name: `Treino ${letter}`, description: '', exercises: [] },
    ]);
  };

  const removeWorkout = (index: number) => {
    if (workouts.length <= 1) {
      Alert.alert('Atenção', 'O plano deve ter pelo menos um treino');
      return;
    }
    setWorkouts(workouts.filter((_, i) => i !== index));
    if (activeWorkoutIndex >= workouts.length - 1) {
      setActiveWorkoutIndex(Math.max(0, workouts.length - 2));
    }
  };

  const updateWorkoutName = (index: number, workoutName: string) => {
    const updated = [...workouts];
    updated[index].name = workoutName;
    setWorkouts(updated);
  };

  const addExerciseToWorkout = (exercise: Exercise) => {
    const updated = [...workouts];
    const exists = updated[activeWorkoutIndex].exercises.find(
      (e) => e.exerciseId === exercise.id
    );
    if (exists) {
      Alert.alert('Atenção', 'Este exercício já foi adicionado');
      return;
    }
    updated[activeWorkoutIndex].exercises.push({
      exerciseId: exercise.id,
      exercise,
      sets: 3,
      reps: '12',
      restSeconds: 60,
      weight: '',
      notes: '',
    });
    setWorkouts(updated);
    setShowExercisePicker(false);
    setExerciseSearch('');
  };

  const removeExerciseFromWorkout = (exerciseIndex: number) => {
    const updated = [...workouts];
    updated[activeWorkoutIndex].exercises.splice(exerciseIndex, 1);
    setWorkouts(updated);
  };

  const updateExercise = (
    exerciseIndex: number,
    field: keyof ExerciseSelection,
    value: any
  ) => {
    const updated = [...workouts];
    (updated[activeWorkoutIndex].exercises[exerciseIndex] as any)[field] = value;
    setWorkouts(updated);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Atenção', 'Nome do plano é obrigatório');
      return;
    }

    if (workouts.some((w) => w.exercises.length === 0)) {
      Alert.alert('Atenção', 'Todos os treinos devem ter pelo menos um exercício');
      return;
    }

    setLoading(true);
    try {
      await trainingPlansService.create({
        name: name.trim(),
        description: description.trim() || undefined,
        studentId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        workouts: workouts.map((w) => ({
          name: w.name,
          description: w.description || undefined,
          exercises: w.exercises.map((e, index) => ({
            exerciseId: e.exerciseId,
            order: index + 1,
            sets: e.sets,
            reps: e.reps,
            restSeconds: e.restSeconds || undefined,
            weight: e.weight || undefined,
            notes: e.notes || undefined,
          })),
        })),
      });

      Alert.alert('Sucesso', 'Plano de treino criado com sucesso!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Error creating training plan:', error);
      Alert.alert('Erro', 'Não foi possível criar o plano de treino');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR');
  };

  const filteredExercises = exercises.filter((ex) =>
    ex.name.toLowerCase().includes(exerciseSearch.toLowerCase()) ||
    (ex.muscleGroup && ex.muscleGroup.toLowerCase().includes(exerciseSearch.toLowerCase()))
  );

  const renderExercisePicker = () => (
    <View style={styles.pickerOverlay}>
      <View style={styles.pickerContainer}>
        <View style={styles.pickerHeader}>
          <Text style={styles.pickerTitle}>Adicionar Exercício</Text>
          <TouchableOpacity onPress={() => { setShowExercisePicker(false); setExerciseSearch(''); }}>
            <Text style={styles.pickerClose}>✕</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar exercício..."
            placeholderTextColor="#666"
            value={exerciseSearch}
            onChangeText={setExerciseSearch}
            autoFocus
          />
        </View>
        <ScrollView style={styles.pickerList}>
          {filteredExercises.length === 0 ? (
            <Text style={styles.noResultsText}>Nenhum exercício encontrado</Text>
          ) : (
            filteredExercises.map((exercise) => (
              <TouchableOpacity
                key={exercise.id}
                style={styles.pickerItem}
                onPress={() => addExerciseToWorkout(exercise)}
              >
                <Text style={styles.pickerItemName}>{exercise.name}</Text>
                {exercise.muscleGroup && (
                  <Text style={styles.pickerItemMuscle}>{exercise.muscleGroup}</Text>
                )}
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>← Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Novo Plano de Treino</Text>
        </View>

        {/* Plan Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações do Plano</Text>
          <TextInput
            style={styles.input}
            placeholder="Nome do plano (ex: Hipertrofia - Fase 1)"
            placeholderTextColor="#666"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Descrição (opcional)"
            placeholderTextColor="#666"
            value={description}
            onChangeText={setDescription}
            multiline
          />
        </View>

        {/* Dates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Período de Validade</Text>
          <View style={styles.dateRow}>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowStartPicker(true)}
            >
              <Text style={styles.dateLabel}>Início</Text>
              <Text style={styles.dateValue}>{formatDate(startDate)}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowEndPicker(true)}
            >
              <Text style={styles.dateLabel}>Fim</Text>
              <Text style={styles.dateValue}>{formatDate(endDate)}</Text>
            </TouchableOpacity>
          </View>
          {showStartPicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              onChange={(_, date) => {
                setShowStartPicker(false);
                if (date) setStartDate(date);
              }}
            />
          )}
          {showEndPicker && (
            <DateTimePicker
              value={endDate}
              mode="date"
              onChange={(_, date) => {
                setShowEndPicker(false);
                if (date) setEndDate(date);
              }}
            />
          )}
        </View>

        {/* Workouts Tabs */}
        <View style={styles.section}>
          <View style={styles.workoutsHeader}>
            <Text style={styles.sectionTitle}>Treinos ({workouts.length})</Text>
            <TouchableOpacity style={styles.addWorkoutButton} onPress={addWorkout}>
              <Text style={styles.addWorkoutText}>+ Treino</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.workoutTabs}>
              {workouts.map((workout, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.workoutTab,
                    activeWorkoutIndex === index && styles.workoutTabActive,
                  ]}
                  onPress={() => setActiveWorkoutIndex(index)}
                  onLongPress={() => removeWorkout(index)}
                >
                  <Text
                    style={[
                      styles.workoutTabText,
                      activeWorkoutIndex === index && styles.workoutTabTextActive,
                    ]}
                  >
                    {workout.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Active Workout Content */}
          <View style={styles.workoutContent}>
            <TextInput
              style={styles.workoutNameInput}
              placeholder="Nome do treino"
              placeholderTextColor="#666"
              value={workouts[activeWorkoutIndex]?.name || ''}
              onChangeText={(text) => updateWorkoutName(activeWorkoutIndex, text)}
            />

            <TouchableOpacity
              style={styles.addExerciseButton}
              onPress={() => setShowExercisePicker(true)}
            >
              <Text style={styles.addExerciseText}>+ Adicionar Exercício</Text>
            </TouchableOpacity>

            {workouts[activeWorkoutIndex]?.exercises.map((item, index) => (
              <View key={`${item.exerciseId}-${index}`} style={styles.exerciseCard}>
                <View style={styles.exerciseCardHeader}>
                  <Text style={styles.exerciseCardName}>{item.exercise.name}</Text>
                  <TouchableOpacity onPress={() => removeExerciseFromWorkout(index)}>
                    <Text style={styles.removeButton}>✕</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.exerciseInputsRow}>
                  <View style={styles.exerciseInputGroup}>
                    <Text style={styles.exerciseInputLabel}>Séries</Text>
                    <TextInput
                      style={styles.exerciseInput}
                      value={String(item.sets)}
                      onChangeText={(v) => updateExercise(index, 'sets', parseInt(v) || 0)}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.exerciseInputGroup}>
                    <Text style={styles.exerciseInputLabel}>Reps</Text>
                    <TextInput
                      style={styles.exerciseInput}
                      value={item.reps}
                      onChangeText={(v) => updateExercise(index, 'reps', v)}
                    />
                  </View>
                  <View style={styles.exerciseInputGroup}>
                    <Text style={styles.exerciseInputLabel}>Peso</Text>
                    <TextInput
                      style={styles.exerciseInput}
                      value={item.weight}
                      onChangeText={(v) => updateExercise(index, 'weight', v)}
                      placeholder="kg"
                      placeholderTextColor="#666"
                    />
                  </View>
                  <View style={styles.exerciseInputGroup}>
                    <Text style={styles.exerciseInputLabel}>Descanso</Text>
                    <TextInput
                      style={styles.exerciseInput}
                      value={String(item.restSeconds)}
                      onChangeText={(v) => updateExercise(index, 'restSeconds', parseInt(v) || 0)}
                      keyboardType="numeric"
                      placeholder="seg"
                      placeholderTextColor="#666"
                    />
                  </View>
                </View>
                <View style={styles.notesContainer}>
                  <Text style={styles.exerciseInputLabel}>Observações</Text>
                  <TextInput
                    style={styles.notesInput}
                    value={item.notes}
                    onChangeText={(v) => updateExercise(index, 'notes', v)}
                    placeholder="Observações para o aluno..."
                    placeholderTextColor="#666"
                    multiline
                  />
                </View>
              </View>
            ))}

            {workouts[activeWorkoutIndex]?.exercises.length === 0 && (
              <View style={styles.noExercises}>
                <Text style={styles.noExercisesText}>
                  Nenhum exercício. Toque em "+ Adicionar Exercício"
                </Text>
              </View>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Salvando...' : 'Salvar Plano de Treino'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {showExercisePicker && renderExercisePicker()}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f' },
  scrollContent: { padding: 20, paddingTop: 60 },
  header: { marginBottom: 24 },
  backButtonText: { color: '#7C3AED', fontSize: 16, marginBottom: 16 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 12 },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 12,
  },
  textArea: { height: 80 },
  dateRow: { flexDirection: 'row', gap: 12 },
  dateButton: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#333',
  },
  dateLabel: { color: '#888', fontSize: 12, marginBottom: 4 },
  dateValue: { color: '#fff', fontSize: 16, fontWeight: '600' },
  workoutsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  addWorkoutButton: { backgroundColor: 'rgba(124,58,237,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  addWorkoutText: { color: '#7C3AED', fontSize: 14, fontWeight: '600' },
  workoutTabs: { flexDirection: 'row', gap: 8, marginTop: 12 },
  workoutTab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
  },
  workoutTabActive: { backgroundColor: '#7C3AED', borderColor: '#7C3AED' },
  workoutTabText: { color: '#888', fontSize: 14 },
  workoutTabTextActive: { color: '#fff', fontWeight: '600' },
  workoutContent: { marginTop: 16 },
  workoutNameInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 12,
  },
  addExerciseButton: {
    borderWidth: 1,
    borderColor: '#7C3AED',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  addExerciseText: { color: '#7C3AED', fontSize: 14, fontWeight: '600' },
  exerciseCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  exerciseCardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  exerciseCardName: { fontSize: 16, fontWeight: '600', color: '#fff', flex: 1 },
  removeButton: { color: '#ff4444', fontSize: 18, padding: 4 },
  exerciseInputsRow: { flexDirection: 'row', gap: 8 },
  exerciseInputGroup: { flex: 1 },
  exerciseInputLabel: { fontSize: 11, color: '#666', marginBottom: 4 },
  exerciseInput: {
    backgroundColor: '#0f0f0f',
    borderRadius: 8,
    padding: 10,
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  noExercises: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  noExercisesText: { color: '#666', fontSize: 14 },
  saveButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 40,
  },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  pickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    padding: 20,
  },
  pickerContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    maxHeight: '70%',
    borderWidth: 1,
    borderColor: '#333',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  pickerTitle: { fontSize: 18, fontWeight: '600', color: '#fff' },
  pickerClose: { fontSize: 20, color: '#888', padding: 4 },
  pickerList: { padding: 8 },
  pickerItem: { padding: 14, borderRadius: 8, marginBottom: 4 },
  pickerItemName: { fontSize: 16, color: '#fff' },
  pickerItemMuscle: { fontSize: 12, color: '#7C3AED', marginTop: 2 },
  searchContainer: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#333' },
  searchInput: {
    backgroundColor: '#0f0f0f',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  noResultsText: { color: '#666', textAlign: 'center', padding: 20 },
  notesContainer: { marginTop: 12 },
  notesInput: {
    backgroundColor: '#0f0f0f',
    borderRadius: 8,
    padding: 10,
    color: '#fff',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#333',
    minHeight: 50,
    textAlignVertical: 'top',
  },
});
