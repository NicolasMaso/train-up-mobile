import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  TextInput,
} from 'react-native';
import { exercisesService } from '../../services';
import { Exercise } from '../../types';

const MUSCLE_GROUPS = [
  'Todos',
  'Peito',
  'Costas',
  'Ombros',
  'Bíceps',
  'Tríceps',
  'Pernas',
  'Glúteos',
  'Abdômen',
  'Cardio',
];

export default function ExercisesListScreen({ navigation }: any) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedMuscle, setSelectedMuscle] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  const loadExercises = async () => {
    try {
      const data = await exercisesService.getAll();
      setExercises(data);
      filterExercises(data, selectedMuscle, searchQuery);
    } catch (error) {
      console.error('Error loading exercises:', error);
      Alert.alert('Erro', 'Não foi possível carregar os exercícios');
    } finally {
      setLoading(false);
    }
  };

  const filterExercises = (data: Exercise[], muscle: string, query: string) => {
    let filtered = data;
    
    if (muscle !== 'Todos') {
      filtered = filtered.filter(e => e.muscleGroup === muscle);
    }
    
    if (query.trim()) {
      filtered = filtered.filter(e => 
        e.name.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    setFilteredExercises(filtered);
  };

  useEffect(() => {
    loadExercises();
  }, []);

  useEffect(() => {
    filterExercises(exercises, selectedMuscle, searchQuery);
  }, [selectedMuscle, searchQuery]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadExercises();
    });
    return unsubscribe;
  }, [navigation]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadExercises();
    setRefreshing(false);
  };

  const handleDelete = (exercise: Exercise) => {
    Alert.alert(
      'Excluir Exercício',
      `Deseja excluir "${exercise.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await exercisesService.delete(exercise.id);
              loadExercises();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir o exercício');
            }
          },
        },
      ]
    );
  };

  const renderExerciseItem = ({ item }: { item: Exercise }) => (
    <TouchableOpacity
      style={styles.exerciseCard}
      onPress={() => navigation.navigate('EditExercise', { exerciseId: item.id })}
      onLongPress={() => handleDelete(item)}
    >
      <View style={styles.exerciseInfo}>
        <Text style={styles.exerciseName}>{item.name}</Text>
        {item.muscleGroup && (
          <View style={styles.muscleTag}>
            <Text style={styles.muscleTagText}>{item.muscleGroup}</Text>
          </View>
        )}
        {item.description && (
          <Text style={styles.exerciseDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        {item.equipment && (
          <Text style={styles.equipmentText}>🏋️ {item.equipment}</Text>
        )}
      </View>
      {item.videoUrl && (
        <Text style={styles.videoIcon}>🎬</Text>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Carregando exercícios...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Exercícios</Text>
        <Text style={styles.subtitle}>
          {exercises.length} exercício{exercises.length !== 1 ? 's' : ''} cadastrado{exercises.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar exercício..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={MUSCLE_GROUPS}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedMuscle === item && styles.filterChipActive,
              ]}
              onPress={() => setSelectedMuscle(item)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedMuscle === item && styles.filterChipTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={filteredExercises}
        keyExtractor={(item) => item.id}
        renderItem={renderExerciseItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#7C3AED"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🏋️</Text>
            <Text style={styles.emptyText}>Nenhum exercício encontrado</Text>
            <Text style={styles.emptySubtext}>
              Toque no botão + para adicionar
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateExercise')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  filterContainer: {
    paddingLeft: 20,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  filterChipActive: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
  filterChipText: {
    color: '#888',
    fontSize: 14,
  },
  filterChipTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: 20,
    paddingTop: 0,
  },
  exerciseCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 6,
  },
  muscleTag: {
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  muscleTagText: {
    color: '#7C3AED',
    fontSize: 12,
    fontWeight: '500',
  },
  exerciseDescription: {
    fontSize: 13,
    color: '#888',
    marginBottom: 4,
  },
  equipmentText: {
    fontSize: 12,
    color: '#666',
  },
  videoIcon: {
    fontSize: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '300',
    marginTop: -2,
  },
});
