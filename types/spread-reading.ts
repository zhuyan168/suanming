// 塔罗牌数据结构
export interface SpreadCard {
  id: string;          // 唯一id
  name: string;        // 牌名，如 "Two of Cups"
  cnName?: string;     // 可选中文名，如 "圣杯二"
  upright: boolean;    // 正位true/逆位false
  imageUrl?: string;   // 图片
  keywords?: string[]; // 关键词
}

// 解读结果数据结构
export interface SpreadReading {
  title: string;                 // 一句话主题
  overall: string;               // 总览（1段）
  positions: Array<{
    position: number;            // 1-6
    label: string;               // 位置文案
    reading: string;             // 对应位置解读（1-2段）
  }>;
  shortTerm: {
    trend: string;               // 短期走向总结（1段）
    advice: string[];            // 3条建议（短句）
    watchFor: string[];          // 3个观察点（短句）
  };
  disclaimer: string;            // 温柔免责声明（1句）
}

// API请求参数
export interface ReadingAPIRequest {
  cards: SpreadCard[];
  locale?: "zh" | "en";
}

// API响应
export interface ReadingAPIResponse {
  ok: boolean;
  reading?: SpreadReading;
  error?: string;
}

