// src/context/AuthContext.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../services/api";

// Definición del tipo para el contexto de autenticación
type AuthContextType = {
  token: string | null;
  user: string | null;
  isLoading: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
};

// Creación del contexto con valores por defecto
const AuthContext = createContext<AuthContextType>({
  token: null,
  user: null,
  isLoading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
});


// Hook personalizado para usar el contexto de autenticación
export function useAuth() {
  return useContext(AuthContext);
}

// Proveedor del contexto de autenticación y lógica asociada
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Daniel Castro: Verificación del flujo de autenticación. Se busca evitar problemas de
  // sincronización entre navegación y estado de sesión.
  // Cargar token y user al inicio
  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("userToken");
        const storedUser = await AsyncStorage.getItem("userEmail");
        if (storedToken) {
          setToken(storedToken);
        }
        if (storedUser) {
          setUser(storedUser);
        }
      } catch (e) {
        console.error("Error cargando token", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadToken();
  }, []);

  // Función para iniciar sesión
  const signIn = async (email: string, pass: string) => {
    // Limpieza básica
    const cleanEmail = email.trim();
    const cleanPass = pass.trim();

    // Intentar login 
    try {
      const data = await api.login(cleanEmail, cleanPass);
      if (data.token) {
        await AsyncStorage.setItem("userToken", data.token);
        await AsyncStorage.setItem("userEmail", cleanEmail);
        setToken(data.token);
        setUser(cleanEmail);
        router.replace("/home"); 
      }
    } catch (error) {
      console.error("SignIn Error:", error);
      throw error;
    }
  };

  // Función para registrar usuario
  const signUp = async (email: string, pass: string) => {
    // Limpieza básica
    const cleanEmail = email.trim();
    const cleanPass = pass.trim();

    try {
      // Intentar registro
      await api.register(cleanEmail, cleanPass);
      // Auto-login tras registro exitoso
      await signIn(cleanEmail, cleanPass);
    } catch (error: any) {
       console.log("SignUp error:", error.message);
       // Logica de "User already exists" -> Intentar Login
       // Ajustamos el match del string dependiendo de lo que devuelva la API
       const msg = error.message?.toLowerCase() || "";
       if (msg.includes("already exists") || msg.includes("ya existe") || msg.includes("duplicate")) {
           console.log("Usuario existe, intentando login automático...");
           try {
               await signIn(cleanEmail, cleanPass);
           } catch (loginError: any) {
               console.log("Auto-login falló:", loginError.message);
               // Si falla el login despues de fallar registro,
               // es casi seguro que la password no coincide.
               if (loginError.message?.includes("401") || loginError.message?.includes("Credenciales")) {
                   throw new Error("El usuario ya existe y la contraseña no coincide. Por favor verifica tus datos o inicia sesión.");
               }
               throw new Error("El usuario ya existe y no se pudo iniciar sesión automáticamente: " + loginError.message);
           }
       } else {
           throw error;
       }
    }
  };

  // Función para cerrar sesión 
  const signOut = async () => {
    try {
        await AsyncStorage.clear(); // Limpiar todo es más seguro
    } catch(e) {
        console.error("Error clearing storage", e);
    }
    setToken(null);
    setUser(null);
    router.replace("/auth");
  };

  // Proveer el contexto a los componentes hijos
  return (
    <AuthContext.Provider
      value={{
        token,
        // @ts-ignore
        user, 
        isLoading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
