import { useState, useEffect, useRef, Fragment } from "react";
import { Popover, Transition } from "@headlessui/react";
import { FaBars } from "react-icons/fa";
import { ActionButtons } from "./EditSermonActionButtons";
import { ModeButtons } from "./ModeButtons";

export const EditorActionBar = ({
  onClearSermon,
  onSave,
  isSaving,
  lastSaved,
}) => {
  const [displayMode, setDisplayMode] = useState("wide"); // wide, narrow, collapsed
  const sidebarRef = useRef(null);

  

  useEffect(() => {
    const element = sidebarRef.current;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width } = entry.contentRect;
        if (width < 420) {
          setDisplayMode("collapsed");
        } else if (width < 580) {
          setDisplayMode("narrow");
        } else {
          setDisplayMode("wide");
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

  return (
    <div
      ref={sidebarRef}
      className="flex justify-between items-center p-3 border-b bg-white rounded-md shadow gap-4 overflow-visible"
    >
      {displayMode === "collapsed" ? (
        <Popover className="relative">
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
            <Popover.Panel className="absolute z-30 mt-2 w-52 bg-white shadow-lg rounded-lg ring-1 ring-black ring-opacity-5">
              <div className="p-2 flex flex-col items-center gap-2">
                <ModeButtons isPopover displayMode={displayMode} />
                <ActionButtons
                  displayMode={displayMode}
                  onClearSermon={onClearSermon}
                  onSave={onSave}
                  isSaving={isSaving}
                  lastSaved={lastSaved}
                  isPopover={true}
                />
              </div>
            </Popover.Panel>
          </Transition>
        </Popover>
      ) : (
        <div className="flex flex-nowrap justify-between items-center gap-4 w-full overflow-hidden">
          <ModeButtons displayMode={displayMode} />
          <ActionButtons
            displayMode={displayMode}
            onClearSermon={onClearSermon}
            onSave={onSave}
            isSaving={isSaving}
            lastSaved={lastSaved}
            isPopover={false}
          />
        </div>
      )}
    </div>
  );
};
