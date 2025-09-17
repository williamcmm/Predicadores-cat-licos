import { createContext, useContext, useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import app from "../config/firebase";
import { getFunctions, httpsCallable } from "firebase/functions";

const AuthContext = createContext();
const db = getFirestore(app);

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [superAdminEmails, setSuperAdminEmails] = useState([]);
  const auth = getAuth(app);

  useEffect(() => {
    const loadSuperAdmins = async () => {
      try {
        const functions = getFunctions(app);
        const getConfig = httpsCallable(functions, "getConfig");
        const result = await getConfig();

        setSuperAdminEmails(result.data.superAdminEmails);
        console.log(
          "✅ Super admins cargados desde Firebase:",
          result.data.superAdminEmails
        );
      } catch (error) {
        console.error("❌ Error cargando super admins desde Firebase:", error);
        // Fallback a .env.local
        const localEmails = import.meta.env.VITE_SUPER_ADMINS?.split(",") || [];
        setSuperAdminEmails(localEmails);
        console.log(
          "🔄 Usando super admins locales como fallback:",
          localEmails
        );
      }
    };

    loadSuperAdmins();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Usuario logueado - obtener perfil y rol
        const profile = await getUserProfile(user);
        const idTokenResult = await user.getIdTokenResult();
        let userRole = idTokenResult.claims.role || null;

        // TEMPORAL: Hardcode super admin para william.comunidad@gmail.com
        if (!userRole && superAdminEmails.includes(user.email)) {
          userRole = "super_admin";
        }

        if (!userRole && profile?.userRole && profile.userRole !== "user") {
          userRole = profile.userRole;
        }

        // DEFAULT: Si no hay rol específico, usar "user"
        if (!userRole) {
          userRole = "user";
        }

        setCurrentUser({
          ...user,
          userLevel: profile?.userLevel || "básico",
          userRole: userRole,
        });
        setUserProfile(profile);

        // Actualizar último login
        await updateLastLogin(user.uid);

        // ✅ SINCRONIZACIÓN AUTOMÁTICA: Actualizar DB si el rol cambió
        if (profile && profile.userRole !== userRole) {
          await updateUserRoleInDB(user.uid, userRole);
        }
      } else {
        // Usuario deslogueado - limpiar estado
        setCurrentUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [auth]);

  // Función para obtener/crear perfil de usuario con nivel
  const getUserProfile = async (user) => {
    if (!user) return null;

    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        // Usuario existente - retornar perfil
        return userDoc.data();
      } else {
        // Nuevo usuario - crear perfil con nivel básico
        const newUserProfile = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || "",
          photoURL: user.photoURL || "",
          userLevel: "básico", // Nivel por defecto
          createdAt: new Date(),
          lastLogin: new Date(),
          userRole: "user", // Rol por defecto
        };

        await setDoc(userDocRef, newUserProfile);
        return newUserProfile;
      }
    } catch (error) {
      console.error("Error obteniendo perfil de usuario:", error);
      return null;
    }
  };

  // Función para actualizar último login
  const updateLastLogin = async (userId) => {
    try {
      const userDocRef = doc(db, "users", userId);
      await setDoc(userDocRef, { lastLogin: new Date() }, { merge: true });
    } catch (error) {
      console.error("Error actualizando último login:", error);
    }
  };

  const updateUserRoleInDB = async (userId, userRole) => {
    try {
      const userDocRef = doc(db, "users", userId);
      await setDoc(
        userDocRef,
        {
          userRole: userRole,
          updatedAt: new Date(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error("❌ Error actualizando userRole en DB:", error);
    }
  };

  // Función para cerrar sesión
  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error("AuthContext: Error al cerrar sesión:", error);
      throw error;
    }
  };

  // Función para convertir userLevel a membershipLevel numérico
  const getMembershipLevel = (userProfile) => {
    if (!userProfile) return 0;

    const levelMap = {
      básico: 1,
      intermedio: 2,
      avanzado: 3,
      administrador: 4,
    };

    return levelMap[userProfile.userLevel] || 0;
  };

  const value = {
    currentUser,
    userProfile,
    loading,
    logout,
    getUserProfile,
    userRole: currentUser?.userRole || null,
    membershipLevel: getMembershipLevel(userProfile),
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
