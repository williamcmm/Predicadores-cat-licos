import { useState } from "react";
import LoginButton from "../../auth/LoginButton";
import ShareButton from "../ShareButton";
import UserMenu from "./UserMenu";
import { useAuth } from "@/context/AuthContext";
import Biblioteca from "@/components/biblioteca/Biblioteca";
import { useSermonStore } from "@/store/sermon-store";
import { useViewModeStore } from "@/store/view-mode-store";

const Header = ({ onOpenAdminPanel }) => {
  const [showBiblioteca, setShowBiblioteca] = useState(false);
  const { currentUser } = useAuth();
  const { openSermon } = useSermonStore();
  const { setMode } = useViewModeStore();

  const handleOpenSermon = (sermonToOpen) => {
    openSermon(sermonToOpen, currentUser);
    setMode("edicion");
    setShowBiblioteca(false);
  };

  return (
    <header className="bg-gradient-to-r from-purple-700 to-purple-500 shadow-lg p-4 text-white">
      <div className="container mx-auto">
        {/* Mobile Layout - SINGLE ROW */}
        <div className="flex justify-center md:justify-between items-center">
          {/* Left - App Name */}
          <div className="flex-shrink-0 max-md:hidden">
            <h1 className="text-lg font-bold">Predicador Católico</h1>
          </div>

          {/* Right - Conditional based on user state */}
          <div className="w-full flex justify-between md:justify-end items-center gap-2">
            {currentUser ? (
              // LOGGED IN: Show Share + Biblioteca + UserMenu
              <>
                <div className="flex items-center gap-2">
                  <ShareButton />
                  <button
                    onClick={() => setShowBiblioteca(!showBiblioteca)}
                    className="custom-btn bg-white !text-purple-700 rounded-md hover:bg-gray-200 transition-colors font-semibold"
                  >
                    Biblioteca
                  </button>
                </div>
                <UserMenu onOpenAdminPanel={onOpenAdminPanel} />
              </>
            ) : (
              // NOT LOGGED IN: Show only Login button
              <LoginButton />
            )}
          </div>
        </div>
      </div>
      {showBiblioteca && (
        <Biblioteca
          onCloseBiblioteca={() => setShowBiblioteca(!showBiblioteca)}
          onOpenSermon={handleOpenSermon}
        />
      )}
    </header>
  );
};

export default Header;
