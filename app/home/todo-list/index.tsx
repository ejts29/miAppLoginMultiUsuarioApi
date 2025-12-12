// app/home/todo-list/index.tsx
import { useAuth } from "@/src/context/AuthContext";
import { api } from "@/src/services/api";
import { Task } from "@/src/types/todolist";
import { FontAwesome } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
// Pantalla principal de la lista de tareas

// Lista de tareas 
export default function TodoListScreen() {
  const router = useRouter();
  const { token, signOut } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTasks = useCallback(async () => {
    if (!token) return;
    try {
      // Solo mostrar loading global si no es un refresco manual
      if (!refreshing) setIsLoading(true);
      
      const data = await api.getTodos(token);
      setTasks(data);
    } catch (error: any) {
      console.error(error);
      const msg = error.message?.toLowerCase() || "";
      if (msg.includes("401") || msg.includes("unauthorized") || msg.includes("invalid token") || msg.includes("expired")) {
          Alert.alert("Sesión expirada", "Por favor inicia sesión nuevamente.");
          signOut();
      } else {
          Alert.alert("Error", "No se pudieron cargar las tareas");
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [token, refreshing, signOut]); // Dependencias correctas 

  // Cargar tareas al entrar a la pantalla
  useFocusEffect(
    useCallback(() => {
      fetchTasks();
    }, [fetchTasks])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // fetchTasks usará el estado refreshing actual en el próximo render, pero aquí lo forzamos
    // Mejor lógica: llamar a api directamente o ajustar fetchTasks
    // Para simplificar, llamamos a fetchTasks y dejamos que el estado refreshing se maneje
    

  }, []);

  // Simplificamos fetchTasks para recibir parametro showLoading
  const loadTasks = async (showLoading = true) => {
      if (!token) return;
      if (showLoading) setIsLoading(true);
      try {
          const data = await api.getTodos(token);
          setTasks(data || []);
      } catch (error: any) {
          console.error("Error loading tasks", error);
          if (error.message?.includes("401")) signOut();
      } finally {
          setIsLoading(false);
          setRefreshing(false);
      }
  };

  const handleRefresh = () => {
      setRefreshing(true);
      loadTasks(false);
  };

  useFocusEffect(
      useCallback(() => {
          loadTasks(true);
      }, [token])
  );

  

  // Alternar estado completado de una tarea

  const handleToggle = async (id: string, currentStatus: boolean) => {
    if (!token) return;
    const previousTasks = [...tasks];
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !currentStatus } : t))
    );

    try {
      await api.updateTodo(id, token, !currentStatus);
    } catch (error: any) {
      console.error("Toggle error:", error);
      setTasks(previousTasks);
      Alert.alert("Error", "No se pudo actualizar la tarea");
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert("Eliminar tarea", "¿Estás seguro?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          if (!token) return;
          try {
            await api.deleteTodo(id, token);
            setTasks((prev) => prev.filter((t) => t.id !== id));
          } catch (error: any) {
            console.error("Delete error:", error);
            Alert.alert("Error", "No se pudo eliminar la tarea");
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: Task }) => {
    let locData = item.location;
    // Si viene como string, parsearlo. Si viene como objeto, usarlo.
    if (typeof locData === 'string') {
        try { locData = JSON.parse(locData); } catch { locData = null; }
    }

    // La imagen puede venir como 'image' (API estándar) o 'imageUrl'
    const imageSource = item.image || item.imageUrl;

    return (
      <View style={styles.taskItem}>
        {imageSource ? (
           <Image source={{ uri: imageSource }} style={styles.taskImage} />
        ) : (
          <View style={styles.noImageBox}>
             <Text style={{ color: "#888" }}>Sin foto</Text>
          </View>
        )}

        <View style={styles.taskInfo}>
          <Text style={item.completed ? styles.completed : styles.title}>
            {item.title}
          </Text>

          {locData ? (
             <View>
                <Text style={styles.locationText}>
                  Lat: {locData.latitude ? Number(locData.latitude).toFixed(4) : "?"} 
                  {" "}Lon: {locData.longitude ? Number(locData.longitude).toFixed(4) : "?"}
                </Text>
             </View>
          ) : (
            <Text style={{ color: "#888", fontSize: 12 }}>Sin ubicación</Text>
          )}

          <View style={styles.actions}>
            <TouchableOpacity onPress={() => handleToggle(item.id, item.completed)}>
              <FontAwesome
                name={item.completed ? "check-square" : "square-o"}
                size={28}
                color={item.completed ? "green" : "gray"}
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push(`./todo-list/edit/${item.id}` as any)}>
              <FontAwesome
                name="pencil"
                size={28}
                color="#3b82f6"
                style={{ marginLeft: 20 }}
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => handleDelete(item.id)}>
              <FontAwesome
                name="trash"
                size={28}
                color="red"
                style={{ marginLeft: 20 }}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };


  // Renderizado de la pantalla crear lista de tareas
  return (
    <View style={styles.container}>
        <View style={styles.headerContainer}>
             <Text style={styles.header}>Mis Tareas</Text>
             <TouchableOpacity onPress={signOut} style={styles.logoutButton}>
                 <FontAwesome name="sign-out" size={24} color="#3b82f6" />
             </TouchableOpacity>
        </View>
     
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push("./todo-list/create")}
      >
        <Text style={styles.addButtonText}>➕ Crear Nueva Tarea</Text>
      </TouchableOpacity>

      {isLoading ? (
        <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", marginTop: 50, color: "#666" }}>
                No tienes tareas pendientes. ¡Crea una!
            </Text>
          }
          renderItem={renderItem}
        />
      )}
    </View>
  );
}
// Estilos de la pantalla 
const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#fff" },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  header: { fontSize: 26, fontWeight: "bold" },
  logoutButton: { padding: 10 },
  taskItem: { flexDirection: "row", padding: 15, borderBottomWidth: 1, borderColor: "#ddd" },
  taskImage: { width: 90, height: 90, borderRadius: 8, backgroundColor: '#eee' },
  noImageBox: {
    width: 90,
    height: 90,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  taskInfo: { flex: 1, marginLeft: 12, justifyContent: "center" },
  title: { fontSize: 18, fontWeight: '500' },
  completed: { fontSize: 18, textDecorationLine: "line-through", color: "gray" },
  locationText: { fontSize: 12, color: "#666", marginTop: 4 },
  dateText: { fontSize: 11, color: "#999" },
  actions: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  addButton: { backgroundColor: "#3b82f6", padding: 12, borderRadius: 10, marginBottom: 20 },
  addButtonText: { color: "white", textAlign: "center", fontSize: 16, fontWeight: "bold" },
});
