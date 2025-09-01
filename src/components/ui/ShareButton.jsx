import React, { useState } from 'react';
import { FaShare } from 'react-icons/fa';

const ShareButton = () => {
  const [showShareMenu, setShowShareMenu] = useState(false);

  const shareUrl = 'https://predicadores-catolicos.web.app';
  const shareText = '¡Descubre El Predicador Católico! Una herramienta completa para preparar homilías y sermones.';

  const shareOptions = [
    {
      name: 'WhatsApp',
      url: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
      color: 'bg-green-500'
    },
    {
      name: 'Facebook',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      color: 'bg-blue-600'
    },
    {
      name: 'Twitter',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      color: 'bg-blue-400'
    },
    {
      name: 'Email',
      url: `mailto:?subject=${encodeURIComponent('El Predicador Católico')}&body=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
      color: 'bg-gray-600'
    }
  ];

  const handleShare = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    setShowShareMenu(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowShareMenu(!showShareMenu)}
        className="px-3 py-2 text-xs sm:px-4 sm:py-2 sm:text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-semibold flex items-center gap-2"
      >
        <FaShare className="text-xs" />
        Compartir
      </button>

      {showShareMenu && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="py-2">
            {shareOptions.map((option) => (
              <button
                key={option.name}
                onClick={() => handleShare(option.url)}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
              >
                <div className={`w-3 h-3 rounded-full ${option.color}`}></div>
                {option.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShareButton;
