// app/home/todo-list/create.tsx
// Pantalla para crear una nueva tarea
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Button,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
// Tipos de datos

//  relacionados con la ubicación
import { useAuth } from "@/src/context/AuthContext";
import { api } from "@/src/services/api";
import { LocationData } from "@/src/types/todolist";

// Pantalla para crear una nueva tarea
export default function CreateTodoScreen() {
  const router = useRouter();
  const { token } = useAuth();
  
  const [title, setTitle] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Solicitar permisos al montar el componente
  useEffect(() => {
    (async () => {
      // 📸 Permisos cámara
      await ImagePicker.requestCameraPermissionsAsync();
      // 📍 Permisos ubicación
      await Location.requestForegroundPermissionsAsync();
    })();
  }, []);

  // 📸 Tomar foto
  const handlePickImage = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  // 📍 Obtener ubicación
  const handleGetLocation = async () => {
    setIsLoading(true);
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocationData({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: location.timestamp,
      });
      Alert.alert("Éxito", "Ubicación registrada");
    } catch (error) {
      console.error("Error al obtener la ubicación:", error);
      Alert.alert("Error", "No se pudo obtener ubicación. Verifica GPS.");
    } finally {
      setIsLoading(false);
    }
  };

// Guardar tarea vía API
const handleSaveTask = async () => {
  if (!token) {
      Alert.alert("Error", "No estás autenticado");
      return;
  }
  if (!title.trim()) {
    return Alert.alert("Error", "El título es obligatorio");
  }

  setIsLoading(true);
  try {
    // Enviamos undefined si es null para que api.ts no lo incluya en el payload
    // Generar URL placeholder si hay foto (Backend no soporta carga archivos)
    const imageToSend = photoUri 
        ? `https://picsum.photos/200?random=${Date.now()}` 
        : undefined;

        // Llamada a la API para crear la tarea
    await api.createTodo(token, {
      title: title.trim(),
      photoUri: imageToSend, 
      location: locationData ? {
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        timestamp: locationData.timestamp
      } : undefined,
    });

    
    Alert.alert("Éxito", "Tarea creada");
    // Volver a la lista
    if (router.canGoBack()) {
        router.back();
    } else {
        router.replace("/home/todo-list");
    }
  } catch (e: any) {
    console.log(e);
    const msg = e.message?.toLowerCase() || "";
    if (msg.includes("401") || msg.includes("unauthorized")) {
        Alert.alert("Error", "Sesión expirada");
    } else {
        Alert.alert("Error al guardar", e.message || "Inténtalo de nuevo");
    }
  } finally {
    setIsLoading(false);
  }
};

// Renderizado de la pantalla de creación de tarea
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Crear Nueva Tarea</Text>

      <TextInput
        style={styles.input}
        placeholder="Título de la tarea *(obligatorio)"
        value={title}
        onChangeText={setTitle}
      />

      {/* FOTO */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📷 Foto (Opcional)</Text>
        {photoUri ? (
          <Image 
            source={{ uri: photoUri }} 
            style={styles.imagePreview} 
            resizeMode="cover" 
          />
        ) : (
          <Text style={styles.placeholder}>No hay foto</Text>
        )}
        <Button title="Tomar Foto" onPress={handlePickImage} />
      </View>

      {/* UBICACIÓN */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📍 Ubicación (Opcional)</Text>
        {locationData ? (
          <Text>
            Lat: {locationData.latitude.toFixed(4)}{"\n"}
            Long: {locationData.longitude.toFixed(4)}
          </Text>
        ) : (
          <Text style={styles.placeholder}>No hay ubicación</Text>
        )}

        {/* Botón para obtener ubicación */}
        <Button
          title={isLoading ? "Obteniendo..." : "Obtener Ubicación Actual"}
          onPress={handleGetLocation}
          disabled={isLoading}
        />

        {isLoading && <ActivityIndicator style={{ marginTop: 10 }} />}
      </View>

      {/* GUARDAR */}
      <View style={{ marginTop: 20, marginBottom: 50 }}>
        <Button
            title={isLoading ? "Guardando..." : "Guardar Tarea"}
            onPress={handleSaveTask}
            disabled={isLoading}
        />
      </View>
    </ScrollView>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    marginVertical: 20,
    textAlign: "center",
  },
  section: { marginVertical: 20 },
  sectionTitle: { fontSize: 18, marginBottom: 10, fontWeight: '600' },
  imagePreview: {
    width: "100%",
    height: 300,
    marginVertical: 10,
    borderRadius: 10,

  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    fontSize: 16
  },
  placeholder: { color: "#888", marginBottom: 10 },
});
