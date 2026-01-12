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
        className="scrollbar w-full h-2.5 bg-white/5 rounded-full appearance-none cursor-pointer 
                   focus:outline-none focus:ring-2 focus:ring-primary/50
                   disabled:opacity-50 disabled:cursor-not-allowed
                   [&::-webkit-slider-thumb]:appearance-none
                   [&::-webkit-slider-thumb]:w-6
                   [&::-webkit-slider-thumb]:h-6
                   [&::-webkit-slider-thumb]:rounded-full
                   [&::-webkit-slider-thumb]:bg-white
                   [&::-webkit-slider-thumb]:border-[3px]
                   [&::-webkit-slider-thumb]:border-primary
                   [&::-webkit-slider-thumb]:shadow-[0_0_15px_rgba(127,19,236,1)]
                   [&::-webkit-slider-thumb]:cursor-pointer
                   [&::-webkit-slider-thumb]:transition-all
                   [&::-webkit-slider-thumb]:duration-200
                   [&::-webkit-slider-thumb]:hover:scale-110
                   [&::-moz-range-thumb]:w-6
                   [&::-moz-range-thumb]:h-6
                   [&::-moz-range-thumb]:rounded-full
                   [&::-moz-range-thumb]:bg-white
                   [&::-moz-range-thumb]:border-[3px]
                   [&::-moz-range-thumb]:border-primary
                   [&::-moz-range-thumb]:shadow-[0_0_15px_rgba(127,19,236,1)]
                   [&::-moz-range-thumb]:cursor-pointer
                   [&::-moz-range-thumb]:transition-all
                   [&::-moz-range-thumb]:duration-200
                   [&::-moz-range-thumb]:hover:scale-110
                   [&::-moz-range-track]:bg-white/5
                   [&::-moz-range-track]:rounded-full
                   [&::-moz-range-track]:h-2.5"
        style={{
          background: `linear-gradient(to right, 
            rgba(127, 19, 236, 0.8) 0%, 
            rgba(127, 19, 236, 0.8) ${value}%, 
            rgba(255, 255, 255, 0.05) ${value}%, 
            rgba(255, 255, 255, 0.05) 100%)`,
        }}
      />
    </div>
  );
}

