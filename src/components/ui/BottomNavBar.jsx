import { FaPen, FaBook } from 'react-icons/fa';

export const BottomNavBar = ({ className = "", onResourcesToggle, isResourcesActive = false }) => {
  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-40 ${className}`}>
      <button 
        className="flex flex-col items-center justify-center w-full pt-2 pb-1 text-blue-600"
        aria-label="Editor"
      >
        <FaPen className="h-6 w-6" />
        <span className="text-xs mt-1">Editor</span>
      </button>
      <button 
        onClick={onResourcesToggle}
        className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors ${
          isResourcesActive ? 'text-blue-600' : 'text-gray-500'
        }`}
        aria-label="Recursos"
      >
        <FaBook className="h-6 w-6" />
        <span className="text-xs mt-1">Recursos</span>
      </button>
    </div>
  );
};