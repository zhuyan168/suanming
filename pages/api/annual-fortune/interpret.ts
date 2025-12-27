/**
 * 年度运势解读 API
 * 
 * 会员功能说明：
 * - 非会员：使用本地规则生成（100% 可用）
 * - 会员：使用 LLM 生成个性化解读（TODO: 需会员系统）
 * 
 * ⚠️ 当前阶段：会员系统未实现，LLM 功能被禁用
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { generateAnnualReading, validateInterpretation } from '../../../utils/annual-interpretation';
import type { TarotCard, AnnualInterpretation } from '../../../types/annual-fortune';
import { isMemberPlaceholder } from '../../../utils/membership-placeholder';

interface InterpretRequest {
  themeCard: TarotCard;
  monthCards: Record<number, TarotCard>;
  year?: number;
  // useLLM 参数已移除，改为由会员状态决定
}

/**
 * 调用 DeepSeek API 生成解读
 * 使用生活化、国际化的提示词
 */
async function generateWithLLM(
  themeCard: TarotCard,
  monthCards: Record<number, TarotCard>,
  year: number
): Promise<AnnualInterpretation | null> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  
  if (!apiKey) {
    console.warn('⚠️ DEEPSEEK_API_KEY not configured, falling back to local generation');
    return null;
  }

  try {
    // 构建月份牌列表
    const monthCardsText = Object.entries(monthCards)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .map(([month, card]) => {
        const orientation = card.isReversed ? '逆位' : '正位';
        const meaning = card.isReversed ? card.reversed : card.upright;
        return `- ${month}月：${card.name}（${orientation}）- ${meaning}`;
      })
      .join('\n');

    // System Prompt
    const systemPrompt = `你是一位资深的塔罗解读师，擅长将塔罗牌的象征意义转化为生活化、实用的建议。

你的风格特点：
1. 语言生活化，像朋友聊天，不用玄学术语
2. 给出具体场景和可执行的建议，不泛泛而谈
3. 避免"疗愈式"表达，不说"你值得""你很好"这类话
4. 更像一份"年度生活指南"，而非占卜结果
5. 正位偏积极实用，逆位提醒挑战和调整方向

重要原则：
- 不要夸张神化塔罗牌
- 不要给出绝对性预言（"你一定会..."）
- 多用"可能""建议""留意"等词
- 结合真实生活场景（工作、人际、健康等）
- 考虑季节和月份的自然节奏`;

    // User Prompt
    const userPrompt = `请为以下年度运势提供解读，时间是 ${year} 年。

# 牌面信息

## 年度主题牌（贯穿全年的核心能量）
- 牌名：${themeCard.name}
- 正逆位：${themeCard.isReversed ? '逆位' : '正位'}
- 牌义：正位 - ${themeCard.upright} / 逆位 - ${themeCard.reversed}

## 各月份牌
${monthCardsText}

---

请以 JSON 格式返回，结构如下：

\`\`\`json
{
  "yearKeywords": ["关键词1", "关键词2", "关键词3", "关键词4"],
  "yearOverview": [
    "第一句：年度整体趋势",
    "第二句：全年能量特点",
    "第三句：最值得关注的方向"
  ],
  "yearWarnings": [
    "需要注意的点1",
    "需要注意的点2",
    "需要注意的点3"
  ],
  "months": {
    "1": {
      "keywords": ["关键词1", "关键词2"],
      "focusAreas": ["事业", "人际"],
      "advice": "一句具体建议，30-40字，可执行",
      "risk": "风险提示（逆位时必填）",
      "monthlyNote": "本月特别注意事项，20-30字"
    }
  },
  "highlights": [3, 6, 10],
  "lowlights": [2, 8],
  "actionList": [
    "行动建议1：具体可执行，30-40字",
    "行动建议2：具体可执行，30-40字",
    "行动建议3：具体可执行，30-40字"
  ]
}
\`\`\`

# 月份特点参考（基于季节和自然节奏）
- 1月：新年开始、设定目标、规划全年
- 2月：冬末春初、能量转换期
- 3月：春季开始、活力上升、适合启动新计划
- 4月：春季中期、稳步推进
- 5月：春末夏初、活动增加
- 6月：夏季开始、年中节点、阶段性总结
- 7月：盛夏、能量充沛或需要休息调整
- 8月：夏末、为秋季做准备
- 9月：秋季开始、收获期、新阶段
- 10月：秋季中期、稳定期
- 11月：秋末冬初、储备期、总结反思
- 12月：年底、收尾、为新年做准备

# 语言风格要求
❌ 不要："你会迎来美好的一年"（太绝对）
✅ 应该："今年可能会遇到几个不错的转机，留意春季（3-5月）"

请严格按照 JSON 格式输出，不要添加其他内容。`;

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000 // 增加 token 限制，因为内容更详细
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ DeepSeek API error:', errorText);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error('❌ No content in DeepSeek response');
      return null;
    }

    // 解析 JSON
    let interpretation: any;
    try {
      // 尝试提取 JSON（可能包裹在 ```json ``` 中）
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                       content.match(/```\s*([\s\S]*?)\s*```/) ||
                       content.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const jsonStr = jsonMatch[1] || jsonMatch[0];
        interpretation = JSON.parse(jsonStr);
      } else {
        interpretation = JSON.parse(content);
      }
    } catch (parseError) {
      console.error('❌ Failed to parse DeepSeek response as JSON:', parseError);
      console.error('Response content:', content);
      return null;
    }

    // 验证数据完整性
    if (!validateInterpretation(interpretation)) {
      console.error('❌ Invalid interpretation structure from DeepSeek');
      return null;
    }

    console.log('✅ Successfully generated interpretation with DeepSeek');
    return interpretation;

  } catch (error) {
    console.error('❌ Error calling DeepSeek API:', error);
    return null;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { themeCard, monthCards, year }: InterpretRequest = req.body;

    // 验证输入
    if (!themeCard || !monthCards) {
      return res.status(400).json({ error: 'Missing required fields: themeCard, monthCards' });
    }

    // 验证月份牌数据完整性
    for (let month = 1; month <= 12; month++) {
      if (!monthCards[month]) {
        return res.status(400).json({ error: `Missing card for month ${month}` });
      }
    }

    const currentYear = year || new Date().getFullYear();
    let interpretation: AnnualInterpretation | null = null;
    let method = 'local';

    // TODO: 会员功能 - LLM 增强解读
    // 检查用户是否为会员（当前永远为 false）
    const isMember = isMemberPlaceholder();

    // 临时启用 LLM（用于测试和开发）
    // 正式上线后，需要恢复会员检查
    const enableLLM = process.env.ENABLE_LLM_FOR_ALL === 'true' || isMember;

    if (enableLLM) {
      // 会员用户或临时启用：尝试使用 LLM 生成个性化解读
      console.log('🤖 Attempting LLM interpretation...');
      interpretation = await generateWithLLM(themeCard, monthCards, currentYear);
      
      if (interpretation) {
        method = 'llm';
        console.log('✅ LLM interpretation generated successfully');
      } else {
        // LLM 失败，fallback 到本地规则
        console.warn('⚠️ LLM failed, falling back to local rules');
        method = 'llm-fallback-local';
      }
    }

    // 非会员或 LLM 失败：使用本地规则生成
    if (!interpretation) {
      console.log('📋 Generating interpretation with local rules...');
      interpretation = generateAnnualReading(themeCard, monthCards);
    }

    // 返回结果
    return res.status(200).json({
      success: true,
      interpretation,
      method, // 'local' | 'llm' | 'llm-fallback-local'
      year: currentYear,
      // TODO: 添加会员标识（当前为 false）
      isMember: false
    });

  } catch (error: any) {
    console.error('❌ Error in interpret API:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

