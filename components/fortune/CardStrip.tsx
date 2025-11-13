import React, { useRef, useEffect, useState } from 'react';
import CardItem, { TarotCard } from './CardItem';

interface CardStripProps {
  cards: TarotCard[];
  onCardClick: (index: number) => void;
  isDisabled: boolean;
  selectedCardIndex: number | null;
  scrollValue: number;
  onScrollChange: (value: number) => void;
}

export default function CardStrip({
  cards,
  onCardClick,
  isDisabled,
  selectedCardIndex,
  scrollValue,
  onScrollChange,
}: CardStripProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);
  const scrollValueRef = useRef(scrollValue);

  // 更新 scrollValueRef
  useEffect(() => {
    scrollValueRef.current = scrollValue;
  }, [scrollValue]);

  // 同步滚动条到容器滚动
  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const maxScroll = container.scrollWidth - container.clientWidth;
    
    if (maxScroll <= 0) return;
    
    const targetScroll = (scrollValue / 100) * maxScroll;
    const currentScroll = container.scrollLeft;
    
    // 只有当差值大于1px时才更新，避免循环
    if (Math.abs(targetScroll - currentScroll) > 1) {
      isScrollingRef.current = true;
      container.scrollLeft = targetScroll;
      // 重置标志
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 50);
    }
  }, [scrollValue]);

  // 监听容器滚动，同步到滚动条
  const handleScroll = () => {
    if (!containerRef.current || isScrollingRef.current) return;
    
    const container = containerRef.current;
    const maxScroll = container.scrollWidth - container.clientWidth;
    
    if (maxScroll <= 0) return;
    
    const scrollPercent = (container.scrollLeft / maxScroll) * 100;
    
    // 只有当差值大于0.5%时才更新，避免循环
    if (Math.abs(scrollPercent - scrollValueRef.current) > 0.5) {
      onScrollChange(scrollPercent);
    }
  };

  return (
    <div className="card-container-wrapper w-full mb-4">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="card-container flex flex-row overflow-x-scroll overflow-y-hidden pb-2 px-2"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {cards.map((card, index) => (
          <CardItem
            key={card.id}
            card={card}
            index={index}
            onClick={onCardClick}
            isDisabled={isDisabled}
            isSelected={selectedCardIndex === index}
          />
        ))}
      </div>
      
      {/* 隐藏默认滚动条样式 */}
      <style jsx>{`
        .card-container::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

