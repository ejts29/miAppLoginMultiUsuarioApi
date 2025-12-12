// app/home/_layout.tsx
// Layout de pestañas para la sección Home

import { FontAwesome } from "@expo/vector-icons";
import { Tabs } from "expo-router";


// Componente de layout con pestañas
export default function HomeTabs() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#3B82F6",
        tabBarInactiveTintColor: "gray",
      }}
    >
      {/* INICIO */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="home" size={size} color={color} />
          ),
        }}
      />

      {/* PERFIL */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="user" size={size} color={color} />
          ),
        }}
      />

      {/* TAREAS */}
      <Tabs.Screen
        name="tareas"
        options={{
          title: "Tareas",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="list-alt" size={size} color={color} />
          ),
        }}
      />

      {/* CREAR TAREA */}
      <Tabs.Screen
        name="todo-list/create"
        options={{
          title: "Crear",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="plus-square" size={size} color={color} />
          ),
        }}
      />

      {/* ocultar rutas internas */}
      <Tabs.Screen
        name="todo-list/index"
        options={{ href: null }}
      />
      
      <Tabs.Screen
        name="todo-list/edit/[id]"
        options={{ href: null }}
      />
    </Tabs>
  );
}
