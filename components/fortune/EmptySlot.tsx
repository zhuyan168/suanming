import React from 'react';

interface EmptySlotProps {
  index: number;
}

export default function EmptySlot({ index }: EmptySlotProps) {
  // 计算重叠偏移量，与 CardItem 保持一致
  return (
    <div
      className={`
        relative flex-shrink-0 w-24 h-36 sm:w-28 sm:h-42 md:w-32 md:h-48
        ${index === 0 ? '' : '-ml-12 sm:-ml-14 md:-ml-16'}
      `}
      style={{
        zIndex: 200 - index,
      }}
    >
      {/* 透明占位，保持布局 */}
      <div className="w-full h-full" />
    </div>
  );
}

