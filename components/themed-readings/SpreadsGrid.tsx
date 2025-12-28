import { ReactNode } from 'react';

interface SpreadsGridProps {
  children: ReactNode;
}

/**
 * 牌阵网格布局容器
 */
export default function SpreadsGrid({ children }: SpreadsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
      {children}
    </div>
  );
}

