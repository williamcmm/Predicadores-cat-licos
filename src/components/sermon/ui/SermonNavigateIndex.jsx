import { useState } from "react";
import { IoChevronDown, IoChevronUp } from "react-icons/io5";

export const SermonNavigateIndex = ({ sermon }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!sermon || !sermon.ideas || sermon.ideas.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 mb-6 bg-white rounded-md p-2 shadow">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-blue-500">
          {" "}
          Indice - <span className="italic">ideas principales</span>:
        </h2>
        <button onClick={() => setIsOpen(!isOpen)} className="p-1 rounded hover:bg-gray-100">
          {isOpen ? <IoChevronUp /> : <IoChevronDown />}
        </button>
      </div>
      <nav className="overflow-x-auto">
        <ol className={`flex flex-col whitespace-nowrap gap-2 ${isOpen ? "max-h-96 overflow-y-auto mt-2" : "max-h-0 overflow-hidden"} transition-all`}>
          {sermon.ideas.map((idea) => (
            <li key={idea.id}>
              <a
                className="inline-block p-1 px-2 rounded-md bg-gray-100 text-sm text-gray-700 border border-gray-200 hover:bg-gray-200 transition-all"
                href={`#idea-${idea.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById(`idea-${idea.id}`);
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth", block: "start" });
                    // optionally focus the input inside the idea
                    const input = el.querySelector(
                      "input, textarea, [tabindex]"
                    );
                    if (input) input.focus({ preventScroll: true });
                  }
                }}
              >
                {idea.h1 || `Idea ${sermon.ideas.indexOf(idea) + 1}`}
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
};
