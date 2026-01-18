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
import { workoutsService, exercisesService } from '../../services';
import { Exercise } from '../../types';

interface SelectedExercise {
  exerciseId: string;
  exercise: Exercise;
  sets: number;
  reps: string;
  restSeconds: number;
  weight: string;
  notes: string;
}

export default function CreateWorkoutScreen({ navigation, route }: any) {
  const { studentId } = route.params;
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<SelectedExercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingExercises, setLoadingExercises] = useState(true);
  const [showExercisePicker, setShowExercisePicker] = useState(false);

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    try {
      const data = await exercisesService.getAll();
      setExercises(data);
    } catch (error) {
      console.error('Error loading exercises:', error);
    } finally {
      setLoadingExercises(false);
    }
  };

  const addExercise = (exercise: Exercise) => {
    const exists = selectedExercises.find(e => e.exerciseId === exercise.id);
    if (exists) {
      Alert.alert('Atenção', 'Este exercício já foi adicionado');
      return;
    }

    setSelectedExercises([
      ...selectedExercises,
      {
        exerciseId: exercise.id,
        exercise,
        sets: 3,
        reps: '12',
        restSeconds: 60,
        weight: '',
        notes: '',
      },
    ]);
    setShowExercisePicker(false);
  };

  const removeExercise = (index: number) => {
    setSelectedExercises(selectedExercises.filter((_, i) => i !== index));
  };

  const updateExercise = (index: number, field: keyof SelectedExercise, value: any) => {
    const updated = [...selectedExercises];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedExercises(updated);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Atenção', 'Nome do treino é obrigatório');
      return;
    }

    if (selectedExercises.length === 0) {
      Alert.alert('Atenção', 'Adicione pelo menos um exercício');
      return;
    }

    setLoading(true);
    try {
      await workoutsService.create({
        name: name.trim(),
        description: description.trim() || undefined,
        studentId,
        exercises: selectedExercises.map((e, index) => ({
          exerciseId: e.exerciseId,
          order: index + 1,
          sets: e.sets,
          reps: e.reps,
          restSeconds: e.restSeconds || undefined,
          weight: e.weight || undefined,
          notes: e.notes || undefined,
        })),
      });

      Alert.alert('Sucesso', 'Treino criado com sucesso!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Error creating workout:', error);
      Alert.alert('Erro', 'Não foi possível criar o treino');
    } finally {
      setLoading(false);
    }
  };

  const renderExercisePicker = () => (
    <View style={styles.pickerOverlay}>
      <View style={styles.pickerContainer}>
        <View style={styles.pickerHeader}>
          <Text style={styles.pickerTitle}>Selecione um exercício</Text>
          <TouchableOpacity onPress={() => setShowExercisePicker(false)}>
            <Text style={styles.pickerClose}>✕</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.pickerList}>
          {exercises.map((exercise) => (
            <TouchableOpacity
              key={exercise.id}
              style={styles.pickerItem}
              onPress={() => addExercise(exercise)}
            >
              <Text style={styles.pickerItemName}>{exercise.name}</Text>
              {exercise.muscleGroup && (
                <Text style={styles.pickerItemMuscle}>{exercise.muscleGroup}</Text>
              )}
            </TouchableOpacity>
          ))}
          {exercises.length === 0 && (
            <Text style={styles.noExercisesText}>
              Nenhum exercício cadastrado. Cadastre exercícios primeiro.
            </Text>
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
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Novo Treino</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome do Treino *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Treino A - Peito e Tríceps"
              placeholderTextColor="#666"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descrição</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Observações gerais sobre o treino..."
              placeholderTextColor="#666"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.exercisesSection}>
            <View style={styles.exercisesHeader}>
              <Text style={styles.label}>Exercícios ({selectedExercises.length})</Text>
              <TouchableOpacity
                style={styles.addExerciseButton}
                onPress={() => setShowExercisePicker(true)}
              >
                <Text style={styles.addExerciseButtonText}>+ Adicionar</Text>
              </TouchableOpacity>
            </View>

            {selectedExercises.map((item, index) => (
              <View key={`${item.exerciseId}-${index}`} style={styles.exerciseCard}>
                <View style={styles.exerciseCardHeader}>
                  <Text style={styles.exerciseCardName}>{item.exercise.name}</Text>
                  <TouchableOpacity onPress={() => removeExercise(index)}>
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
                    <Text style={styles.exerciseInputLabel}>Desc.</Text>
                    <TextInput
                      style={styles.exerciseInput}
                      value={String(item.restSeconds)}
                      onChangeText={(v) => updateExercise(index, 'restSeconds', parseInt(v) || 0)}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>
            ))}

            {selectedExercises.length === 0 && (
              <View style={styles.noExercises}>
                <Text style={styles.noExercisesIcon}>📋</Text>
                <Text style={styles.noExercisesText}>
                  Nenhum exercício adicionado
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
            {loading ? 'Salvando...' : 'Salvar Treino'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {showExercisePicker && renderExercisePicker()}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    marginBottom: 24,
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    color: '#7C3AED',
    fontSize: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  textArea: {
    height: 80,
    paddingTop: 14,
  },
  exercisesSection: {
    marginTop: 8,
  },
  exercisesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addExerciseButton: {
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addExerciseButtonText: {
    color: '#7C3AED',
    fontSize: 14,
    fontWeight: '600',
  },
  exerciseCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  exerciseCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseCardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  removeButton: {
    color: '#ff4444',
    fontSize: 18,
    padding: 4,
  },
  exerciseInputsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  exerciseInputGroup: {
    flex: 1,
  },
  exerciseInputLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
  },
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
    borderStyle: 'dashed',
  },
  noExercisesIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  noExercisesText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  pickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
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
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  pickerClose: {
    fontSize: 20,
    color: '#888',
    padding: 4,
  },
  pickerList: {
    padding: 8,
  },
  pickerItem: {
    padding: 14,
    borderRadius: 8,
    marginBottom: 4,
  },
  pickerItemName: {
    fontSize: 16,
    color: '#fff',
  },
  pickerItemMuscle: {
    fontSize: 12,
    color: '#7C3AED',
    marginTop: 2,
  },
});
