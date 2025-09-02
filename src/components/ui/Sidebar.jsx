import React, { useState, useEffect, useRef, Fragment } from 'react';
import { Popover, Transition } from '@headlessui/react';
import { FaBars } from 'react-icons/fa';
import SermonSaveButton from '../sermon/SermonSaveButton';
import { useAccessControl } from '../../hooks/useAccessControl';

const Sidebar = ({ modo, setModo, onClearSermon, onSave, isSaving, lastSaved }) => {
  const [displayMode, setDisplayMode] = useState('wide'); // wide, narrow, collapsed
  const sidebarRef = useRef(null);
  const { hasAccess, getAccessMessage } = useAccessControl();

  const modes = [
    { id: 'edicion', name: 'Modo Edición', shortName: 'Edición' },
    { id: 'estudio', name: 'Modo Estudio', shortName: 'Estudio' },
    { id: 'predicacion', name: 'Modo Predicación', shortName: 'Predicación' },
  ];

  useEffect(() => {
    const element = sidebarRef.current;
    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        const { width } = entry.contentRect;
        if (width < 420) {
          setDisplayMode('collapsed');
        } else if (width < 580) {
          setDisplayMode('narrow');
        } else {
          setDisplayMode('wide');
        }
      }
    });

    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  const renderButtons = (isPopover = false) => {
    const actionButtonClassName = "px-4 py-2 rounded-md text-sm transition-all";

    if (isPopover) {
        return (
            <>
                <div className="flex flex-col items-center gap-2 w-full">
                    {modes.map((m) => (
                        <button
                            key={m.id}
                            className={`w-full px-3 py-2 rounded-md text-sm font-semibold transition-all duration-200 text-center 
                            ${modo === m.id 
                                ? 'bg-blue-600 text-white shadow-md' 
                                : 'bg-transparent text-gray-600 hover:bg-blue-50 hover:text-blue-700'
                            }`}
                            onClick={() => setModo(m.id)}
                        >
                            {m.name}
                        </button>
                    ))}
                </div>
                <div className="flex flex-col items-center gap-2 w-full pt-4 border-t">
                    <button
                        onClick={onClearSermon}
                        className={`${actionButtonClassName} w-full font-medium bg-transparent text-red-600 hover:bg-red-50 border border-red-200 hover:border-red-400`}>
                        Limpiar
                    </button>
                    {hasAccess.saveSermon ? (
                        <SermonSaveButton 
                            onSave={onSave} 
                            isSaving={isSaving} 
                            lastSaved={lastSaved} 
                            className={`${actionButtonClassName} w-full border border-transparent`} 
                        />
                    ) : (
                        <button
                            onClick={() => alert(getAccessMessage('saveSermon'))}
                            className={`${actionButtonClassName} w-full font-medium bg-gray-300 text-gray-500 cursor-not-allowed border border-gray-300`}
                            disabled
                        >
                            🔒 Guardar (Bloqueado)
                        </button>
                    )}
                </div>
            </>
        )
    }

    return (
    <>
      <div className={'items-center border border-gray-200 rounded-lg p-1 flex'}>
        {modes.map((m) => (
          <button
            key={m.id}
            className={`px-3 py-2 rounded-md text-sm font-semibold transition-all duration-200 text-left 
              ${modo === m.id 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-transparent text-gray-600 hover:bg-blue-50 hover:text-blue-700'
              }`}
            onClick={() => setModo(m.id)}
          >
            {displayMode === 'wide' ? m.name : m.shortName}
          </button>
        ))}
      </div>

      <div className={displayMode === 'collapsed' ? 'flex items-center gap-1' : 'flex items-center gap-2 sm:gap-4'}>
        <button
          onClick={onClearSermon}
          className={`${displayMode === 'collapsed' ? 'px-2 py-1 text-xs' : actionButtonClassName} font-medium bg-transparent text-red-600 hover:bg-red-50 border border-red-200 hover:border-red-400 transition-all`}>
          {displayMode === 'collapsed' ? 'X' : 'Limpiar'}
        </button>
        {hasAccess.saveSermon ? (
            <SermonSaveButton 
                onSave={onSave} 
                isSaving={isSaving} 
                lastSaved={lastSaved} 
                className={`${displayMode === 'collapsed' ? 'px-2 py-1 text-xs' : actionButtonClassName} border border-transparent`} 
                compact={displayMode === 'collapsed'}
            />
        ) : (
            <button
                onClick={() => alert(getAccessMessage('saveSermon'))}
                className={`${displayMode === 'collapsed' ? 'px-2 py-1 text-xs' : actionButtonClassName} font-medium bg-gray-300 text-gray-500 cursor-not-allowed border border-gray-300`}
                disabled
                title={getAccessMessage('saveSermon')}
            >
                {displayMode === 'collapsed' ? '🔒' : '🔒 Guardar'}
            </button>
        )}
      </div>
    </>
  )};

  return (
    <div ref={sidebarRef} className="flex justify-between items-center p-3 border-b border-gray-200 gap-4">
      {displayMode === 'collapsed' ? (
        <Popover className="relative">
          {({ open }) => (
            <>
              <Popover.Button className="p-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <FaBars className="h-5 w-5" />
              </Popover.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 translate-y-1"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-1"
              >
                <Popover.Panel className="absolute z-10 mt-2 w-auto bg-white shadow-lg rounded-lg ring-1 ring-black ring-opacity-5">
                  <div className="p-2 flex flex-col items-center gap-2">
                    {renderButtons(true)}
                  </div>
                </Popover.Panel>
              </Transition>
            </>
          )}
        </Popover>
      ) : (
        <div className="flex flex-nowrap justify-between items-center gap-4 w-full overflow-hidden">
            {renderButtons()}
        </div>
      )}
    </div>
  );
};

export default Sidebar;