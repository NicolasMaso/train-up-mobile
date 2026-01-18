import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View, StyleSheet } from 'react-native';
import {
  DashboardScreen,
  StudentsListScreen,
  AddStudentScreen,
  StudentDetailScreen,
  FeedbackListScreen,
  FeedbackDetailScreen,
  ExercisesListScreen,
  CreateExerciseScreen,
  EditExerciseScreen,
  CreateWorkoutScreen,
  CreateTrainingPlanScreen,
  ManageTrainingPlansScreen,
} from '../screens/personal';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function StudentsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0f0f0f' },
      }}
    >
      <Stack.Screen name="StudentsList" component={StudentsListScreen} />
      <Stack.Screen name="AddStudent" component={AddStudentScreen} />
      <Stack.Screen name="StudentDetail" component={StudentDetailScreen} />
      <Stack.Screen name="CreateWorkout" component={CreateWorkoutScreen} />
      <Stack.Screen name="CreateTrainingPlan" component={CreateTrainingPlanScreen} />
      <Stack.Screen name="ManageTrainingPlans" component={ManageTrainingPlansScreen} />
    </Stack.Navigator>
  );
}

function DashboardStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0f0f0f' },
      }}
    >
      <Stack.Screen name="DashboardHome" component={DashboardScreen} />
      <Stack.Screen name="AddStudent" component={AddStudentScreen} />
      <Stack.Screen name="StudentDetail" component={StudentDetailScreen} />
      <Stack.Screen name="FeedbackDetail" component={FeedbackDetailScreen} />
      <Stack.Screen name="CreateWorkout" component={CreateWorkoutScreen} />
      <Stack.Screen name="CreateTrainingPlan" component={CreateTrainingPlanScreen} />
      <Stack.Screen name="ManageTrainingPlans" component={ManageTrainingPlansScreen} />
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
      <Stack.Screen name="FeedbackList" component={FeedbackListScreen} />
      <Stack.Screen name="FeedbackDetail" component={FeedbackDetailScreen} />
    </Stack.Navigator>
  );
}

function ExercisesStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0f0f0f' },
      }}
    >
      <Stack.Screen name="ExercisesList" component={ExercisesListScreen} />
      <Stack.Screen name="CreateExercise" component={CreateExerciseScreen} />
      <Stack.Screen name="EditExercise" component={EditExerciseScreen} />
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

function ProfileScreen() {
  return (
    <PlaceholderScreen
      icon="👤"
      title="Perfil"
      subtitle="Configurações do perfil em breve"
    />
  );
}

export default function PersonalNavigator() {
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
        component={DashboardStack}
        options={{
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24 }}>🏠</Text>
          ),
          tabBarLabel: 'Início',
        }}
      />
      <Tab.Screen
        name="Students"
        component={StudentsStack}
        options={{
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24 }}>👥</Text>
          ),
          tabBarLabel: 'Alunos',
        }}
      />
      <Tab.Screen
        name="Feedback"
        component={FeedbackStack}
        options={{
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24 }}>💬</Text>
          ),
          tabBarLabel: 'Feedbacks',
        }}
      />
      <Tab.Screen
        name="Exercises"
        component={ExercisesStack}
        options={{
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24 }}>🏋️</Text>
          ),
          tabBarLabel: 'Exercícios',
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
