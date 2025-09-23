import { scrollIntoView } from "@/utils/scrollIntoView";
import { useState } from "react";
import { IoChevronDown, IoChevronUp } from "react-icons/io5";

export const SermonNavigateIndex = ({ sermon }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!sermon) return null;
  const ideas = sermon.ideas || [];
  if (ideas.length === 0) return null;

  return (
    <div className="mt-4 mb-6 bg-white rounded-md p-2 shadow">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-blue-500">
            {" "}
            Indice - <span className="italic">ideas principales</span>:
          </h2>
          <span className="hover:bg-gray-100 p-1 rounded">
            {isOpen ? <IoChevronUp /> : <IoChevronDown />}
          </span>
        </div>
      </button>
      <nav className="overflow-x-auto">
        <ol
          className={`flex flex-col whitespace-nowrap gap-2 ${
            isOpen ? "max-h-96 overflow-y-auto mt-2" : "max-h-0 overflow-hidden"
          } transition-all`}
        >
          {ideas.map((idea, idx) => (
            <li key={idea.id} className="list-inside">
              <a
                className="inline-block p-1 px-2 rounded-md bg-gray-100 text-sm text-gray-700 border border-gray-200 hover:bg-gray-200 transition-all"
                href={`#idea-${idea.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollIntoView(`idea-${idea.id}`);
                }}
              >
                {`${idx + 1}. ` + (idea.h1 || `Idea ${idx + 1}`)}
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
};
