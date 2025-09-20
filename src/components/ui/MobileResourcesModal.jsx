import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { FaTimes } from "react-icons/fa";
import ResourcePanel from "../resources/ResourcePanel";

export const MobileResourcesModal = ({ isOpen, onClose }) => {
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen">
                  <div className="flex h-screen pb-16 flex-col overflow-y-scroll bg-gray-50 pt-6 shadow-xl">
                    <div className="px-4 sm:px-6 flex items-center justify-between">
                      <Dialog.Title className="text-base font-semibold leading-6 text-gray-900">
                        Buscador de Recursos
                      </Dialog.Title>
                      <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1 transition-colors"
                        aria-label="Cerrar panel de recursos"
                      >
                        <FaTimes className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="relative mt-6 flex-1 px-4 sm:px-6">
                      <ResourcePanel />
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};
