import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { exercisesService } from '../../services';
import { Exercise } from '../../types';

const MUSCLE_GROUPS = [
  'Peito',
  'Costas',
  'Ombros',
  'Bíceps',
  'Tríceps',
  'Quadríceps',
  'Posterior',
  'Glúteos',
  'Panturrilha',
  'Abdômen',
  'Antebraço',
];

export default function EditExerciseScreen({ navigation, route }: any) {
  const { exerciseId } = route.params;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [muscleGroup, setMuscleGroup] = useState('');
  const [equipment, setEquipment] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  useEffect(() => {
    loadExercise();
  }, []);

  const loadExercise = async () => {
    try {
      const exercise = await exercisesService.getById(exerciseId);
      setName(exercise.name);
      setDescription(exercise.description || '');
      setMuscleGroup(exercise.muscleGroup || '');
      setEquipment(exercise.equipment || '');
      setVideoUrl(exercise.videoUrl || '');
    } catch (error) {
      console.error('Error loading exercise:', error);
      Alert.alert('Erro', 'Não foi possível carregar o exercício');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Atenção', 'Nome do exercício é obrigatório');
      return;
    }

    setSaving(true);
    try {
      await exercisesService.update(exerciseId, {
        name: name.trim(),
        description: description.trim() || undefined,
        muscleGroup: muscleGroup || undefined,
        equipment: equipment.trim() || undefined,
        videoUrl: videoUrl.trim() || undefined,
      });

      Alert.alert('Sucesso', 'Exercício atualizado com sucesso!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Error updating exercise:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o exercício');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Editar Exercício</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Nome *</Text>
        <TextInput
          style={styles.input}
          placeholder="Nome do exercício"
          placeholderTextColor="#666"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Descrição</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Descrição do exercício"
          placeholderTextColor="#666"
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <Text style={styles.label}>Grupo Muscular</Text>
        <View style={styles.chipContainer}>
          {MUSCLE_GROUPS.map((group) => (
            <TouchableOpacity
              key={group}
              style={[
                styles.chip,
                muscleGroup === group && styles.chipSelected,
              ]}
              onPress={() => setMuscleGroup(muscleGroup === group ? '' : group)}
            >
              <Text
                style={[
                  styles.chipText,
                  muscleGroup === group && styles.chipTextSelected,
                ]}
              >
                {group}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Equipamento</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Barra, Halteres, Máquina"
          placeholderTextColor="#666"
          value={equipment}
          onChangeText={setEquipment}
        />

        <Text style={styles.label}>URL do Vídeo</Text>
        <TextInput
          style={styles.input}
          placeholder="Link do vídeo demonstrativo"
          placeholderTextColor="#666"
          value={videoUrl}
          onChangeText={setVideoUrl}
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f' },
  content: { padding: 20, paddingTop: 60 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f0f0f' },
  loadingText: { color: '#fff', fontSize: 16 },
  header: { marginBottom: 24 },
  backButton: { color: '#7C3AED', fontSize: 16, marginBottom: 16 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  form: {},
  label: { color: '#888', fontSize: 14, marginBottom: 8, marginTop: 16 },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
  },
  chipSelected: { backgroundColor: '#7C3AED', borderColor: '#7C3AED' },
  chipText: { color: '#888', fontSize: 14 },
  chipTextSelected: { color: '#fff' },
  saveButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 40,
  },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
