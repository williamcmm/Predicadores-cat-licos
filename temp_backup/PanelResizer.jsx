import React, { useState, useEffect, useCallback } from 'react';

const PanelResizer = ({ initialLeftWidth, minWidth, maxWidth, onResize }) => {
  const [isResizing, setIsResizing] = useState(false);
  const [leftWidth, setLeftWidth] = useState(() => {
    const storedWidth = localStorage.getItem('leftPanelWidth');
    return storedWidth ? parseFloat(storedWidth) : initialLeftWidth;
  });

  const handleStart = useCallback(() => {
    setIsResizing(true);
  }, []);

  const handleMove = useCallback((e) => {
    if (!isResizing) return;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const newLeftWidth = (clientX / window.innerWidth) * 100;
    if (newLeftWidth >= minWidth && newLeftWidth <= maxWidth) {
      setLeftWidth(newLeftWidth);
      onResize(newLeftWidth);
    }
  }, [isResizing, minWidth, maxWidth, onResize]);

  const handleEnd = useCallback(() => {
    setIsResizing(false);
    localStorage.setItem('leftPanelWidth', leftWidth.toString());
  }, [leftWidth]);

  const handleDoubleClick = useCallback(() => {
    setLeftWidth(initialLeftWidth);
    onResize(initialLeftWidth);
    localStorage.setItem('leftPanelWidth', initialLeftWidth.toString());
  }, [initialLeftWidth, onResize]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [handleMove, handleEnd]);

  return (
    <div
      className="relative w-1 bg-gray-300 hover:bg-blue-500 cursor-col-resize"
      onMouseDown={handleStart}
      onTouchStart={handleStart}
      onDoubleClick={handleDoubleClick}
      style={{ flexShrink: 0 }}
    >
      {isResizing && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black text-white text-xs px-2 py-1 rounded-md whitespace-nowrap">
          {`${Math.round(leftWidth)}%`}
        </div>
      )}
    </div>
  );
};

export default PanelResizer;
