// app/home/todo-list/edit/[id].tsx
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
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

// Contexto de autenticación
import { useAuth } from "@/src/context/AuthContext";
import { api } from "@/src/services/api";
import { LocationData } from "@/src/types/todolist";

// Pantalla para editar una tarea existente
export default function EditTodoScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // Obtener I
  const { token } = useAuth();
  
  const [title, setTitle] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [completed, setCompleted] = useState(false); // Mantener estado completed
  const [isLoading, setIsLoading] = useState(true); // Carga inicial true
  const [isSaving, setIsSaving] = useState(false);

  // Cargar datos de la tarea
  useEffect(() => {
    const loadTask = async () => {
        if (!token || !id) return;
        try {
            // Estrategia: Obtener todas y filtrar localmente (según plan)
            const tasks = await api.getTodos(token);
            const task = tasks.find(t => t.id === id);
            
            if (!task) {
                Alert.alert("Error", "Tarea no encontrada");
                router.back();
                return;
            }

            // Pre-llenar formulario
            setTitle(task.title);
            setCompleted(task.completed);
            
            // Imagen
            const img = task.image || task.imageUrl;
            if (img) setPhotoUri(img);

            // Ubicación
            if (task.location) {
                // Manejar si viene como string parseado o ya objeto
               let loc = task.location;
               if (typeof loc === 'string') {
                   try { loc = JSON.parse(loc); } catch {}
               }
               // Validar estructura simple
               if (loc && loc.latitude && loc.longitude) {
                   setLocationData({
                       latitude: Number(loc.latitude),
                       longitude: Number(loc.longitude),
                       timestamp: loc.timestamp || Date.now()
                   });
               }
            }

        } catch (error) {
            console.error("Error loading task:", error);
            Alert.alert("Error", "No se pudo cargar la tarea");
            router.back();
        } finally {
            setIsLoading(false);
        }
    };

    loadTask();
  }, [id, token]);


  // Tomar foto (Igual que Create)
  const handlePickImage = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (perm.status !== 'granted') {
         Alert.alert("Permiso denegado", "Se necesita acceso a la cámara");
         return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  // Obtener ubicación (Igual que Create)
  const handleGetLocation = async () => {
    const perm = await Location.requestForegroundPermissionsAsync();
    if (perm.status !== 'granted') {
         Alert.alert("Permiso denegado", "Se necesita acceso a la ubicación");
         return;
    }

    setIsSaving(true); // Reusar spinner de guardado o loading local
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocationData({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: location.timestamp,
      });
      Alert.alert("Éxito", "Ubicación actualizada");
    } catch (error) {
      console.error("Location error:", error);
      Alert.alert("Error", "No se pudo obtener ubicación.");
    } finally {
      setIsSaving(false);
    }
  };

  // Guardar cambios
  const handleUpdate = async () => {
    if (!token) return;
    if (!title.trim()) return Alert.alert("Error", "El título es obligatorio");

    setIsSaving(true);
    try {
        // Manejar imagen: si es local (file:) enviar URL falsa
        
        let imageToSend = photoUri;
        if (photoUri && photoUri.startsWith("file:")) {
             imageToSend = `https://picsum.photos/200?random=${Date.now()}`;
        }
        
        await api.updateTodo(id as string, token, {
            title: title.trim(),
            completed,
            image: imageToSend,
            location: locationData ? {
                latitude: locationData.latitude,
                longitude: locationData.longitude,
                timestamp: locationData.timestamp
            } : undefined
        });

        Alert.alert("Éxito", "Tarea actualizada correctamente");
        router.back();

    } catch (e: any) {
        console.error(e);
        Alert.alert("Error", e.message || "No se pudo actualizar");
    } finally {
        setIsSaving(false);
    }
  };

  if (isLoading) {
      return <View style={styles.center}><ActivityIndicator size="large" color="#3b82f6" /></View>;
  }
  // Renderizar formulario de edición
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Editar Tarea</Text>

      <Text style={styles.label}>Título</Text>
      <TextInput
        style={styles.input}
        placeholder="Título"
        value={title}
        onChangeText={setTitle}
      />

      {/* FOTO */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📷 Foto</Text>
        {photoUri ? (
          <Image 
            source={{ uri: photoUri }} 
            style={styles.imagePreview} 
            resizeMode="cover" 
          />
        ) : (
          <Text style={styles.placeholder}>Sin foto</Text>
        )}
        <Button title={photoUri ? "Cambiar Foto" : "Agregar Foto"} onPress={handlePickImage} />
      </View>

      {/* UBICACIÓN */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📍 Ubicación</Text>
        {locationData ? (
          <Text style={{ marginBottom: 10 }}>
            Lat: {locationData.latitude.toFixed(4)}, Lon: {locationData.longitude.toFixed(4)}
          </Text>
        ) : (
          <Text style={styles.placeholder}>Sin ubicación</Text>
        )}
        <Button
          title="Actualizar Ubicación"
          onPress={handleGetLocation}
        />
      </View>

      {/* GUARDAR */}
      <View style={{ marginTop: 30, marginBottom: 50 }}>
        <Button
            title={isSaving ? "Guardando..." : "Guardar Cambios"}
            onPress={handleUpdate}
            disabled={isSaving}
        />
        <View style={{ marginTop: 10 }}>
            <Button
                title="Cancelar"
                color="red"
                onPress={() => router.back()}
                disabled={isSaving}
            />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 26, fontWeight: "bold", marginVertical: 20, textAlign: "center" },
  section: { marginVertical: 15 },
  sectionTitle: { fontSize: 18, marginBottom: 10, fontWeight: '600' },
  imagePreview: { width: "100%", height: 250, marginVertical: 10, borderRadius: 10, backgroundColor: '#eee' },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 15, fontSize: 16, marginBottom: 10 },
  label: { fontWeight: "bold", marginBottom: 5 },
  placeholder: { color: "#888", marginBottom: 10, fontStyle: 'italic' },
});
