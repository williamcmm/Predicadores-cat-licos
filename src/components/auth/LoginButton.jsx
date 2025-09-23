import { signInWithGoogle, signOutUser } from "@/services/auth/authService";
import { useAuth } from "@/context/AuthContext";
import { FcGoogle } from "react-icons/fc";

const LoginButton = () => {
  const { currentUser, loading } = useAuth();

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Error durante el login:", error);

      // Mostrar mensaje de error específico al usuario
      let errorMessage = "Error durante el inicio de sesión";
      if (error.code === "auth/popup-closed-by-user") {
        errorMessage = "El popup fue cerrado antes de completar el login";
      } else if (error.code === "auth/popup-blocked") {
        errorMessage = "El popup fue bloqueado por el navegador";
      } else if (error.code === "auth/unauthorized-domain") {
        errorMessage = "Dominio no autorizado para el login";
      }

      alert(errorMessage);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.error("Error signing out:", error);
      alert("Error al cerrar sesión");
    }
  };

  if (loading) {
    return (
      <div className="px-4 py-2 bg-gray-500 text-white rounded-md">
        Cargando...
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <button
        onClick={handleSignIn}
        className="custom-btn bg-white !text-gray-800 rounded-md hover:bg-gray-200"
      >
        <FcGoogle size={25} />
        <span>Iniciar Sesión</span>
      </button>
    </div>
  );
};

export default LoginButton;
