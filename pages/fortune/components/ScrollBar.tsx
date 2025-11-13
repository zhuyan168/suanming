import React from 'react';

interface ScrollBarProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export default function ScrollBar({ value, onChange, disabled = false }: ScrollBarProps) {
  return (
    <div className="w-full px-2 mb-6">
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className="scrollbar w-full h-2 bg-gray-800/50 rounded-full appearance-none cursor-pointer 
                   focus:outline-none focus:ring-2 focus:ring-primary/50
                   disabled:opacity-50 disabled:cursor-not-allowed
                   [&::-webkit-slider-thumb]:appearance-none
                   [&::-webkit-slider-thumb]:w-4
                   [&::-webkit-slider-thumb]:h-4
                   [&::-webkit-slider-thumb]:rounded-full
                   [&::-webkit-slider-thumb]:bg-gradient-to-r
                   [&::-webkit-slider-thumb]:from-primary
                   [&::-webkit-slider-thumb]:to-purple-500
                   [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(127,19,236,0.8)]
                   [&::-webkit-slider-thumb]:cursor-pointer
                   [&::-webkit-slider-thumb]:transition-all
                   [&::-webkit-slider-thumb]:duration-200
                   [&::-webkit-slider-thumb]:hover:scale-125
                   [&::-moz-range-thumb]:w-4
                   [&::-moz-range-thumb]:h-4
                   [&::-moz-range-thumb]:rounded-full
                   [&::-moz-range-thumb]:bg-gradient-to-r
                   [&::-moz-range-thumb]:from-primary
                   [&::-moz-range-thumb]:to-purple-500
                   [&::-moz-range-thumb]:border-0
                   [&::-moz-range-thumb]:shadow-[0_0_10px_rgba(127,19,236,0.8)]
                   [&::-moz-range-thumb]:cursor-pointer
                   [&::-moz-range-thumb]:transition-all
                   [&::-moz-range-thumb]:duration-200
                   [&::-moz-range-thumb]:hover:scale-125
                   [&::-moz-range-track]:bg-gray-800/50
                   [&::-moz-range-track]:rounded-full
                   [&::-moz-range-track]:h-2"
        style={{
          background: `linear-gradient(to right, 
            rgba(127, 19, 236, 0.3) 0%, 
            rgba(127, 19, 236, 0.3) ${value}%, 
            rgba(255, 255, 255, 0.1) ${value}%, 
            rgba(255, 255, 255, 0.1) 100%)`,
        }}
      />
    </div>
  );
}

