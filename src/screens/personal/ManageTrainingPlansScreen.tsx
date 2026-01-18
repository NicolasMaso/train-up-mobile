import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { trainingPlansService } from '../../services';
import { TrainingPlan } from '../../types';

export default function ManageTrainingPlansScreen({ navigation, route }: any) {
  const { studentId, studentName } = route.params;
  const [plans, setPlans] = useState<TrainingPlan[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadPlans = async () => {
    try {
      const data = await trainingPlansService.getAll(studentId);
      setPlans(data);
    } catch (error) {
      console.error('Error loading plans:', error);
      Alert.alert('Erro', 'Não foi possível carregar os planos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPlans();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleToggleActive = async (plan: TrainingPlan) => {
    Alert.alert(
      plan.isActive ? 'Inativar Plano' : 'Ativar Plano',
      `Deseja ${plan.isActive ? 'inativar' : 'ativar'} o plano "${plan.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              await trainingPlansService.toggleActive(plan.id);
              await loadPlans();
            } catch (error) {
              console.error('Error toggling plan:', error);
              Alert.alert('Erro', 'Não foi possível alterar o status');
            }
          },
        },
      ]
    );
  };

  const handleDelete = async (plan: TrainingPlan) => {
    Alert.alert(
      'Excluir Plano',
      `Deseja excluir permanentemente o plano "${plan.name}"? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await trainingPlansService.delete(plan.id);
              await loadPlans();
              Alert.alert('Sucesso', 'Plano excluído com sucesso');
            } catch (error) {
              console.error('Error deleting plan:', error);
              Alert.alert('Erro', 'Não foi possível excluir o plano');
            }
          },
        },
      ]
    );
  };

  const renderPlan = ({ item }: { item: TrainingPlan }) => (
    <View style={[styles.planCard, !item.isActive && styles.planCardInactive]}>
      <View style={styles.planHeader}>
        <View style={styles.planInfo}>
          <Text style={styles.planName}>{item.name}</Text>
          <Text style={styles.planDate}>
            📅 {formatDate(item.startDate)} até {formatDate(item.endDate)}
          </Text>
          <View style={styles.workoutsChips}>
            {item.workouts?.map((w) => (
              <View key={w.id} style={styles.workoutChip}>
                <Text style={styles.workoutChipText}>{w.name}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={[styles.statusBadge, item.isActive ? styles.activeBadge : styles.inactiveBadge]}>
          <Text style={[styles.statusText, item.isActive ? styles.activeText : styles.inactiveText]}>
            {item.isActive ? 'Ativo' : 'Inativo'}
          </Text>
        </View>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.toggleButton, item.isActive && styles.deactivateButton]}
          onPress={() => handleToggleActive(item)}
        >
          <Text style={styles.buttonText}>
            {item.isActive ? '⏸️ Inativar' : '▶️ Ativar'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item)}
        >
          <Text style={styles.deleteButtonText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Carregando planos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Planos de Treino</Text>
        <Text style={styles.subtitle}>{studentName}</Text>
      </View>

      <FlatList
        data={plans}
        renderItem={renderPlan}
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
            <Text style={styles.emptyTitle}>Nenhum plano de treino</Text>
            <Text style={styles.emptySubtitle}>
              Crie um plano para este aluno
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateTrainingPlan', { studentId })}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f' },
  loadingContainer: { flex: 1, backgroundColor: '#0f0f0f', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#888', fontSize: 16 },
  header: { padding: 20, paddingTop: 60 },
  backButton: { color: '#7C3AED', fontSize: 16, marginBottom: 16 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 14, color: '#888', marginTop: 4 },
  list: { padding: 20, paddingTop: 0, paddingBottom: 100 },
  planCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  planCardInactive: { opacity: 0.6 },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  planInfo: { flex: 1 },
  planName: { fontSize: 18, fontWeight: '600', color: '#fff', marginBottom: 4 },
  planDate: { fontSize: 13, color: '#888' },
  workoutsChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  workoutChip: {
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  workoutChipText: { color: '#7C3AED', fontSize: 12 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
  activeBadge: { backgroundColor: 'rgba(34, 197, 94, 0.2)' },
  inactiveBadge: { backgroundColor: 'rgba(239, 68, 68, 0.2)' },
  statusText: { fontSize: 12, fontWeight: '600' },
  activeText: { color: '#22c55e' },
  inactiveText: { color: '#ef4444' },
  buttonRow: { flexDirection: 'row', gap: 10 },
  toggleButton: {
    flex: 1,
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#7C3AED',
  },
  deactivateButton: { borderColor: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.1)' },
  buttonText: { color: '#fff', fontSize: 14, fontWeight: '500' },
  deleteButton: {
    width: 48,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  deleteButtonText: { fontSize: 18 },
  emptyState: { alignItems: 'center', padding: 48 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#fff', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#888', textAlign: 'center' },
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
  fabText: { fontSize: 28, color: '#fff', fontWeight: '300', marginTop: -2 },
});
