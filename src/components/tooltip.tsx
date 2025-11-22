import { useState, useRef, useEffect } from "react";

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<"top" | "bottom">("top");
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceAbove = rect.top;
      const spaceBelow = window.innerHeight - rect.bottom;

      // Show tooltip below if not enough space above
      setPosition(
        spaceAbove < 100 && spaceBelow > spaceAbove ? "bottom" : "top",
      );
    }
  }, [isVisible]);

  return (
    <div
      ref={triggerRef}
      className="relative inline-flex"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={`absolute left-1/2 -translate-x-1/2 z-50 ${
            position === "top" ? "bottom-full mb-2" : "top-full mt-2"
          }`}
        >
          <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
            {content}
            <div
              className={`absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45 ${
                position === "top" ? "-bottom-1" : "-top-1"
              }`}
            />
          </div>
        </div>
      )}
    </div>
  );
}
