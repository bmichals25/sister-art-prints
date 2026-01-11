'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface Position {
  scale: number;
  offsetX: number;
  offsetY: number;
}

interface ArtworkPositionerProps {
  imageUrl: string;
  productType: 'poster' | 'canvas' | 'framed';
  initialPosition?: Partial<Position>;
  onPositionChange: (position: Position) => void;
}

const PRODUCT_CONFIG: Record<string, {
  aspect: number;
  label: string;
  frameStyle?: string;
}> = {
  poster: {
    aspect: 2/3,
    label: 'Poster (2:3)',
  },
  canvas: {
    aspect: 3/4,
    label: 'Canvas (3:4)',
  },
  framed: {
    aspect: 2/3,
    label: 'Framed (2:3)',
    frameStyle: 'border-[12px] border-gray-800 shadow-lg',
  },
};

export function ArtworkPositioner({ imageUrl, productType, initialPosition, onPositionChange }: ArtworkPositionerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);

  const [position, setPosition] = useState<Position>({
    scale: 100,
    offsetX: 0,
    offsetY: 0,
    ...initialPosition,
  });

  const config = PRODUCT_CONFIG[productType];

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.offsetX,
      y: e.clientY - position.offsetY
    });
  }, [position.offsetX, position.offsetY]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    const newOffsetX = e.clientX - dragStart.x;
    const newOffsetY = e.clientY - dragStart.y;

    // Limit movement to reasonable bounds
    const maxOffset = 100;
    setPosition(prev => ({
      ...prev,
      offsetX: Math.max(-maxOffset, Math.min(maxOffset, newOffsetX)),
      offsetY: Math.max(-maxOffset, Math.min(maxOffset, newOffsetY)),
    }));
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    onPositionChange(position);
  }, [position, onPositionChange]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -5 : 5;
    setPosition(prev => ({
      ...prev,
      scale: Math.max(50, Math.min(200, prev.scale + delta)),
    }));
  }, []);

  const handleReset = () => {
    setPosition({ scale: 100, offsetX: 0, offsetY: 0 });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="text-sm font-medium text-gray-700 capitalize">{productType}</span>
          <span className="text-xs text-gray-500 ml-2">{config.label}</span>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="text-xs text-[#d4846a] hover:text-[#c4745a] font-medium"
        >
          Reset
        </button>
      </div>

      {/* Visual Editor */}
      <div className="relative bg-gray-50 rounded-xl p-4">
        {/* Hint text */}
        <p className="text-xs text-gray-400 text-center mb-3">
          Drag to position • Scroll to zoom
        </p>

        {/* Preview Frame */}
        <div
          className="relative mx-auto overflow-hidden bg-white shadow-xl"
          style={{
            width: '240px',
            height: `${240 / config.aspect}px`,
          }}
        >
          {/* Frame decoration for framed type */}
          {productType === 'framed' && (
            <div className="absolute inset-0 border-[12px] border-gray-800 pointer-events-none z-20" />
          )}

          {/* Canvas texture for canvas type */}
          {productType === 'canvas' && (
            <div
              className="absolute inset-0 pointer-events-none z-10"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.03) 50%, transparent 100%)',
                boxShadow: 'inset 0 0 30px rgba(0,0,0,0.1)',
              }}
            />
          )}

          {/* Artwork container */}
          <div
            ref={containerRef}
            className={`absolute inset-0 overflow-hidden ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            style={{
              padding: productType === 'framed' ? '12px' : '0',
            }}
            onMouseDown={handleMouseDown}
            onWheel={handleWheel}
          >
            <div
              className="relative w-full h-full flex items-center justify-center"
              style={{
                transform: `translate(${position.offsetX}px, ${position.offsetY}px)`,
              }}
            >
              <img
                ref={imageRef}
                src={imageUrl}
                alt="Artwork"
                className="max-w-none pointer-events-none select-none"
                style={{
                  width: `${position.scale}%`,
                  height: 'auto',
                  objectFit: 'contain',
                }}
                onLoad={() => setImageLoaded(true)}
                draggable={false}
              />
            </div>
          </div>

          {/* Loading state */}
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="animate-spin w-6 h-6 border-2 border-gray-300 border-t-[#d4846a] rounded-full" />
            </div>
          )}
        </div>

        {/* Scale Slider */}
        <div className="mt-4 px-2">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Zoom</span>
            <span>{position.scale}%</span>
          </div>
          <input
            type="range"
            min="50"
            max="200"
            step="5"
            value={position.scale}
            onChange={(e) => setPosition(prev => ({ ...prev, scale: Number(e.target.value) }))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#d4846a]"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>50%</span>
            <span>200%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ArtworkPositionerTabs({
  imageUrl,
  positions,
  onPositionsChange
}: {
  imageUrl: string;
  positions: Record<string, Position>;
  onPositionsChange: (positions: Record<string, Position>) => void;
}) {
  const [activeTab, setActiveTab] = useState<'poster' | 'canvas' | 'framed'>('poster');

  const handlePositionChange = useCallback((type: string, position: Position) => {
    onPositionsChange({
      ...positions,
      [type]: position,
    });
  }, [positions, onPositionsChange]);

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Position Artwork for Each Print Type
      </label>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
        {(['poster', 'canvas', 'framed'] as const).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setActiveTab(type)}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-all ${
              activeTab === type
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Active Positioner */}
      <ArtworkPositioner
        imageUrl={imageUrl}
        productType={activeTab}
        initialPosition={positions[activeTab]}
        onPositionChange={(pos) => handlePositionChange(activeTab, pos)}
      />
    </div>
  );
}
