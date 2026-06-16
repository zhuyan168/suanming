import React from 'react';

interface EmptySlotProps {
  index: number;
}

export default function EmptySlot({ index }: EmptySlotProps) {
  // Keep the same footprint as CardItem without blocking nearby cards.
  return (
    <div
      className={`
        pointer-events-none relative flex-shrink-0 w-24 h-36 sm:w-28 sm:h-42 md:w-32 md:h-48
        ${index === 0 ? '' : '-ml-12 sm:-ml-14 md:-ml-16'}
      `}
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      <div className="w-full h-full" />
    </div>
  );
}
