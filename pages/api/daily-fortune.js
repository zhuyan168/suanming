import { isEnglishRequest, withAiOutputLanguage } from '../../lib/aiLanguage';
import { requireAccessOrRespond, recordReadingHistory } from '../../lib/accessServer';
import { parseAIJson } from '../../lib/parseAIJson';

export default async function handler(req, res) {
  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const accessStatus = await requireAccessOrRespond({ req, res, spreadAccess: 'free' });
  if (!accessStatus) return;

  try {
    const { cardName, orientation, baseMeaning } = req.body;

    // 验证必需参数
    if (!cardName || !orientation || !baseMeaning) {
      return res.status(400).json({ error: '缺少必需参数' });
    }

    const isEn = isEnglishRequest(req);

  const apiKey = process.env.DEEPSEEK_API_KEY;
    
    // 调试信息（仅开发环境）
    if (process.env.NODE_ENV === 'development') {
      console.log('API Key exists:', !!apiKey);
    }
    
    if (!apiKey) {
      console.error('DEEPSEEK_API_KEY not found in environment variables');
      return res.status(500).json({ 
        error: 'API Key 未配置',
        debug: process.env.NODE_ENV === 'development' ? '请检查 .env.local 文件是否存在且包含 DEEPSEEK_API_KEY' : undefined
      });
    }

    // 构建 prompt（按照用户提供的模板）
    const orientationText = isEn
      ? (orientation === 'upright' ? 'Upright' : 'Reversed')
      : (orientation === 'upright' ? '正位' : '逆位');
    const userMessage = isEn ? `The user drew the following tarot card for today's daily reading:

- Card: ${cardName}
- Orientation: ${orientationText}
- Card meaning: ${baseMeaning}

Generate today's detailed daily fortune in natural English. Return one JSON object with these fields:

- overall: overall fortune, 1-2 sentences
- love: love and relationships, 1-2 sentences
- career: career and study, 1-2 sentences
- wealth: money and resources, 1 sentence
- health: health or self-care advice, 1 sentence
- luckyColor: lucky color, English color name
- luckyNumber: lucky number, between 1 and 99
- quote: a short gentle quote, under 10 English words, aligned with the reading

Return JSON only. Do not include any Chinese text.` : `用户今天抽到的塔罗牌信息如下：

- 牌名：${cardName}
- 正逆位：${orientationText}
- 牌义说明：${baseMeaning}

请根据以上信息，用中文生成今天的详细运势解读，要求输出为一个 JSON 对象，字段包括：

- overall：综合运势，1～2句话
- love：爱情运势，1～2句话
- career：事业和学业运势，1～2句话
- wealth：财运，1句话
- health：健康建议，1句话
- luckyColor：幸运色，中文颜色名称即可
- luckyNumber：幸运数字，1～99之间
- quote：幸运箴言，不超过15个字，语气温柔治愈，需要和整体运势呼应

只返回JSON，不要任何解释文字。`;

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
            content: isEn
              ? 'You are a warm, professional tarot reader writing for an English-speaking audience.'
              : '你现在是一名温柔、专业的塔罗占卜师。',
          },
          {
            role: 'user',
            content: withAiOutputLanguage(userMessage, isEn),
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData = {};
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { raw: errorText };
      }
      
      console.error('DeepSeek API error status:', response.status);
      console.error('DeepSeek API error response:', errorData);
      
      return res.status(500).json({ 
        error: 'DeepSeek API 调用失败',
        status: response.status,
        details: errorData,
        message: errorData.error?.message || errorData.message || '未知错误'
      });
    }

    const data = await response.json();
    
    // 提取返回内容
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      return res.status(500).json({ error: '未能获取有效响应' });
    }

    let fortuneData;
    try {
      fortuneData = parseAIJson(content);
    } catch (parseError) {
      console.error('JSON 解析失败:', parseError);
      console.error('原始内容:', content);
      return res.status(500).json({ error: '解析运势数据失败' });
    }

    // 验证返回的数据结构
    const requiredFields = ['overall', 'love', 'career', 'wealth', 'health', 'luckyColor', 'luckyNumber', 'quote'];
    const missingFields = requiredFields.filter(field => !fortuneData[field]);
    
    if (missingFields.length > 0) {
      console.error('缺少必需字段:', missingFields);
      return res.status(500).json({ 
        error: '运势数据不完整',
        missingFields 
      });
    }

    if (accessStatus.userId) {
      await recordReadingHistory({
        userId: accessStatus.userId,
        spreadType: 'fortune-daily',
        cards: [{ cardName, orientation }],
        readingResult: fortuneData,
        resultPath: '/fortune/daily'
      });
    }

    return res.status(200).json({
      success: true,
      fortune: fortuneData
    });

  } catch (error) {
    console.error('API route error:', error);
    return res.status(500).json({ 
      error: '服务器内部错误',
      message: error.message 
    });
  }
}

