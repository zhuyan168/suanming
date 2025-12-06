// =============================================================================
// API 端点：/api/seasonal-reading
// 用于生成四季牌阵的 DeepSeek AI 解读
// =============================================================================
//
// 请求方法：POST
// 请求参数：
// - cards: 5张塔罗牌数组（按 slot 顺序）
//   - slot 1: 行动与主动性（Wands - Action）
//   - slot 2: 情感和人际关系（Cups - Emotion）
//   - slot 3: 智慧与思想（Swords - Mind）
//   - slot 4: 事业和财运（Pentacles - Material）
//   - slot 5: 本季核心主题（Major Arcana - Core）
//
// 返回格式：
// {
//   coreEnergy: string,
//   action: string,
//   emotion: string,
//   mind: string,
//   material: string,
//   synthesis: string
// }
// =============================================================================

export default async function handler(req, res) {
  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { cards } = req.body;

    // 验证必需参数
    if (!cards || !Array.isArray(cards) || cards.length !== 5) {
      return res.status(400).json({ error: '需要提供五张卡牌信息' });
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    
    if (!apiKey) {
      console.error('DEEPSEEK_API_KEY not found');
      return res.status(500).json({ error: 'API Key 未配置' });
    }

    // 定义五个位置的名称
    const positionNames = [
      "行动与主动性（Action）",
      "情感和人际关系（Emotion）",
      "智慧与思想（Mind）",
      "事业和财运（Material）",
      "本季核心主题（Core）"
    ];

    // 获取当前时间信息
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 0-11，需要+1
    const currentSeason = Math.floor((currentMonth - 1) / 3) + 1; // 1-春, 2-夏, 3-秋, 4-冬
    const seasonNames = ['', '春季', '夏季', '秋季', '冬季'];
    const seasonName = seasonNames[currentSeason];
    
    // 计算本季度的月份范围
    const seasonStartMonth = (currentSeason - 1) * 3 + 1;
    const seasonMonths = [seasonStartMonth, seasonStartMonth + 1, seasonStartMonth + 2];
    
    // 构建卡牌信息字符串
    const cardsInfo = cards.map((card, index) => {
      const orientationText = card.orientation === 'upright' ? '正位' : '逆位';
      const baseMeaning = card.orientation === 'upright' ? card.upright : card.reversed;
      const positionName = positionNames[index];
      return `位置 ${index + 1} [${positionName}]：
- 牌名：${card.name}
- 正逆位：${orientationText}
- 牌义参考：${baseMeaning}
- 关键词：${card.keywords ? card.keywords.join('、') : ''}`;
    }).join('\n\n');

    // 构建 prompt
    const userMessage = `用户在${currentYear}年${seasonName}（${seasonMonths[0]}-${seasonMonths[2]}月）的"四季牌阵"中抽到的五张塔罗牌信息如下：

${cardsInfo}

你是一名经验丰富的塔罗师，请为用户生成本季度（${seasonMonths[0]}-${seasonMonths[2]}月）的深度运势解读。

【重要要求】
1. **生活化表达**：用真实、接地气的语言，让用户能联想到自己的日常生活
2. **具体建议**：提供可执行的行动方案，比如：
   - 沟通技巧："在会议中可以先倾听再发言"
   - 工作习惯："建议每天早上列出当日三个优先事项"
   - 情绪管理："感到焦虑时，可以尝试5分钟深呼吸或短暂散步"
   - 财务规划："这个月适合梳理固定开支，削减不必要的订阅服务"
3. **时间节点提醒**：明确指出本季度各月份的重点和注意事项
   - 比如："${seasonMonths[0]}月上旬需要特别注意..."
   - 或："${seasonMonths[1]}月中下旬可能会遇到..."
4. **避免抽象空谈**：不要用"保持平衡""内在成长"等模糊表述，要说明具体怎么做
5. **温暖务实**：语气温柔但不失真诚，像朋友在给建议

【解读结构】

【本季核心能量】（约200-250字）
- 解读 slot5（大阿卡那）揭示的本季主题
- **重点说明**：这个季度的核心课题是什么？对日常生活有什么实际影响？
- **时间提醒**：本季度哪个月份是关键转折期？需要在什么时候做好准备？
- 给出1-2个具体的应对策略

【行动（Action）】（约180-200字）
- 解读 slot1（权杖牌）对行为模式的暗示
- **具体建议**：
  - 可以采取的3个具体行动（比如：调整作息、主动沟通、学习新技能）
  - 需要避免的2个行为模式
- **时间节点**：哪个月份适合主动出击？哪个月份需要韬光养晦？

【情绪与人际（Emotion）】（约180-200字）
- 解读 slot2（圣杯牌）对情感和人际的影响
- **实际场景**：
  - 在职场关系中可能遇到什么情况？如何应对？
  - 亲密关系或家人相处需要注意什么？
  - 自我情绪管理的具体方法（如运动、日记、找人倾诉）
- **月份提醒**：哪个月份人际关系容易出现波动？

【思维（Mind）】（约180-200字）
- 解读 slot3（宝剑牌）对思维方式的启示
- **思考方向**：
  - 需要调整的思维习惯（比如：过度分析、犹豫不决、想太多）
  - 决策时要考虑的关键因素
  - 学习或信息获取方面的建议
- **注意事项**：本季度在做重要决定时要特别留意什么？

【现实事务（Material）】（约180-200字）
- 解读 slot4（星币牌）对事业和财务的影响
- **工作/学习**：
  - 职业发展的机会点和注意事项
  - 项目推进的节奏建议
  - 技能提升的具体方向
- **财务管理**：
  - 收入和支出的平衡建议
  - 投资或大额消费的时机选择
  - 需要控制的消费类型
- **月份重点**：哪个月份适合谈薪酬/找工作/开始新项目？

【综合建议】（约150-180字）
- 总结本季度最重要的3个关注点
- 给出一条清晰、有力、可执行的核心建议
- 用一句温暖的话鼓励用户

【JSON格式要求】
请将解读结果输出为一个 JSON 对象，包含以下字段：
{
  "coreEnergy": "本季核心能量的内容",
  "action": "行动维度的内容",
  "emotion": "情绪与人际的内容",
  "mind": "思维维度的内容",
  "material": "现实事务的内容",
  "synthesis": "综合建议的内容"
}

请确保：
- 返回合法的 JSON 格式，不要包含 Markdown 代码块标记
- 每个字段的内容是自然流畅的段落文字，不需要包含标题
- 文字亲切、务实、有画面感
- 包含具体的月份提醒和可执行建议`;

    // 调用 DeepSeek API
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: '你是一位经验丰富的塔罗占卜师和生活咨询师。你的特点是：1）善于将塔罗牌的智慧转化为具体可行的生活建议；2）语言温暖、真诚、接地气，像一位贴心的朋友在给建议；3）关注实际生活场景，提供的建议都是用户日常能做到的；4）会明确指出时间节点，告诉用户"什么时候该注意什么"；5）避免使用玄学术语和抽象概念，用大白话说清楚；6）每条建议都具体、可执行，让用户看完就知道该怎么做。',
          },
          {
            role: 'user',
            content: userMessage,
          },
        ],
        temperature: 0.7,
        max_tokens: 2500,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API error:', errorText);
      return res.status(500).json({ error: 'DeepSeek API 调用失败' });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return res.status(500).json({ error: '未能获取有效响应' });
    }

    // 解析 JSON
    let readingData;
    try {
      // 尝试提取 JSON 对象（处理可能的 Markdown 代码块）
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        readingData = JSON.parse(jsonMatch[0]);
      } else {
        readingData = JSON.parse(content);
      }
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Raw Content:', content);
      return res.status(500).json({ error: '解析解读数据失败' });
    }

    // 验证返回的数据结构
    const requiredFields = ['coreEnergy', 'action', 'emotion', 'mind', 'material', 'synthesis'];
    const missingFields = requiredFields.filter(field => !readingData[field]);
    
    if (missingFields.length > 0) {
      console.error('Missing fields in response:', missingFields);
      return res.status(500).json({ error: '解读数据不完整' });
    }

    return res.status(200).json(readingData);

  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({ error: '服务器内部错误' });
  }
}

