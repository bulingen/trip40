import { useState } from "react";

export function BottomSheet({ children }: { children: React.ReactNode }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-20 bg-base-100 rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.15)] transition-transform duration-300 ease-in-out md:hidden ${
        expanded ? "translate-y-0" : "translate-y-[calc(100%-3.5rem)]"
      }`}
      style={{ maxHeight: "85vh" }}
    >
      {/* Drag handle */}
      <button
        className="w-full flex justify-center py-3 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-10 h-1.5 rounded-full bg-base-300" />
      </button>

      {/* Peek label when collapsed */}
      {!expanded && (
        <button
          className="w-full text-center text-sm font-medium text-base-content/60 -mt-1 pb-2 cursor-pointer"
          onClick={() => setExpanded(true)}
        >
          Suggestions
        </button>
      )}

      {/* Scrollable content */}
      <div
        className={`overflow-y-auto px-4 pb-6 ${
          expanded ? "h-[calc(85vh-3.5rem)]" : "h-0 overflow-hidden"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
