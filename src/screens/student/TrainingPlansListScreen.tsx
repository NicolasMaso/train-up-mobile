import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { trainingPlansService } from '../../services';
import { TrainingPlan } from '../../types';

export default function TrainingPlansListScreen({ navigation }: any) {
  const [plans, setPlans] = useState<TrainingPlan[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadPlans = async () => {
    try {
      const data = await trainingPlansService.getAll();
      // Filter only active plans
      const activePlans = data.filter(p => p.isActive);
      setPlans(activePlans);
    } catch (error) {
      console.error('Error loading training plans:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadPlans();
    });
    return unsubscribe;
  }, [navigation]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPlans();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const isExpired = (endDate: string) => {
    return new Date(endDate) < new Date();
  };

  const renderPlan = ({ item }: { item: TrainingPlan }) => (
    <TouchableOpacity
      style={[
        styles.planCard,
        isExpired(item.endDate) && styles.planCardExpired,
      ]}
      onPress={() => navigation.navigate('TrainingPlanDetail', { planId: item.id })}
    >
      <View style={styles.planHeader}>
        <View style={styles.planIcon}>
          <Text style={styles.planIconText}>📋</Text>
        </View>
        <View style={styles.planInfo}>
          <Text style={styles.planName}>{item.name}</Text>
          {item.description && (
            <Text style={styles.planDescription} numberOfLines={1}>
              {item.description}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.dateRow}>
        <Text style={styles.dateLabel}>
          📅 {formatDate(item.startDate)} até {formatDate(item.endDate)}
        </Text>
        {isExpired(item.endDate) && (
          <View style={styles.expiredBadge}>
            <Text style={styles.expiredText}>Expirado</Text>
          </View>
        )}
      </View>

      <View style={styles.workoutsRow}>
        {item.workouts?.map((workout) => (
          <View key={workout.id} style={styles.workoutChip}>
            <Text style={styles.workoutChipText}>{workout.name}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.viewButton}
        onPress={() => navigation.navigate('TrainingPlanDetail', { planId: item.id })}
      >
        <Text style={styles.viewButtonText}>Ver Treinos</Text>
      </TouchableOpacity>
    </TouchableOpacity>
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
        <Text style={styles.title}>Meus Planos de Treino</Text>
        <Text style={styles.subtitle}>
          {plans.length} plano{plans.length !== 1 ? 's' : ''} ativo{plans.length !== 1 ? 's' : ''}
        </Text>
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
              Seu personal irá criar um plano de treino para você
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f' },
  loadingContainer: { flex: 1, backgroundColor: '#0f0f0f', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#888', fontSize: 16 },
  header: { padding: 20, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 14, color: '#888', marginTop: 4 },
  list: { padding: 20, paddingTop: 0 },
  planCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  planCardExpired: { opacity: 0.6 },
  planHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  planIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  planIconText: { fontSize: 24 },
  planInfo: { flex: 1, marginLeft: 12 },
  planName: { fontSize: 18, fontWeight: '600', color: '#fff' },
  planDescription: { fontSize: 13, color: '#888', marginTop: 2 },
  dateRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  dateLabel: { color: '#888', fontSize: 13 },
  expiredBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  expiredText: { color: '#ef4444', fontSize: 11, fontWeight: '600' },
  workoutsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  workoutChip: {
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  workoutChipText: { color: '#7C3AED', fontSize: 13, fontWeight: '500' },
  viewButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  viewButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  emptyState: { alignItems: 'center', padding: 48 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#fff', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#888', textAlign: 'center' },
});
