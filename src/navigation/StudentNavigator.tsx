import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View, StyleSheet } from 'react-native';
import {
  DashboardScreen,
  WorkoutsListScreen,
  CreateFeedbackScreen,
  MyFeedbacksScreen,
  FeedbackDetailScreen,
} from '../screens/student';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function WorkoutsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0f0f0f' },
      }}
    >
      <Stack.Screen name="WorkoutsList" component={WorkoutsListScreen} />
      <Stack.Screen name="CreateFeedback" component={CreateFeedbackScreen} />
    </Stack.Navigator>
  );
}

function FeedbackStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0f0f0f' },
      }}
    >
      <Stack.Screen name="MyFeedbacks" component={MyFeedbacksScreen} />
      <Stack.Screen name="FeedbackDetail" component={FeedbackDetailScreen} />
    </Stack.Navigator>
  );
}

// Placeholder screen component with better styling
function PlaceholderScreen({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) {
  return (
    <View style={placeholderStyles.container}>
      <Text style={placeholderStyles.icon}>{icon}</Text>
      <Text style={placeholderStyles.title}>{title}</Text>
      <Text style={placeholderStyles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const placeholderStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  icon: {
    fontSize: 64,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
});

function ProgressScreen() {
  return (
    <PlaceholderScreen
      icon="📊"
      title="Meu Progresso"
      subtitle="Histórico de avaliações em breve"
    />
  );
}

function ProfileScreen() {
  return (
    <PlaceholderScreen
      icon="👤"
      title="Perfil"
      subtitle="Configurações do perfil em breve"
    />
  );
}

export default function StudentNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1a1a1a',
          borderTopColor: '#333',
          height: 85,
          paddingBottom: 25,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#7C3AED',
        tabBarInactiveTintColor: '#888',
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24 }}>🏠</Text>
          ),
          tabBarLabel: 'Início',
        }}
      />
      <Tab.Screen
        name="Workouts"
        component={WorkoutsStack}
        options={{
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24 }}>📋</Text>
          ),
          tabBarLabel: 'Treinos',
        }}
      />
      <Tab.Screen
        name="Feedbacks"
        component={FeedbackStack}
        options={{
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24 }}>💬</Text>
          ),
          tabBarLabel: 'Feedbacks',
        }}
      />
      <Tab.Screen
        name="Progress"
        component={ProgressScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24 }}>📊</Text>
          ),
          tabBarLabel: 'Progresso',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24 }}>👤</Text>
          ),
          tabBarLabel: 'Perfil',
        }}
      />
    </Tab.Navigator>
  );
}
