const express = require('express');
const cors = require('cors');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// 静的ファイルの配信 - publicディレクトリを使用
app.use(express.static('public'));
app.use(express.static('.'));

// ルートパスでindex.htmlを返す
app.get('/', (req, res) => {
  const indexPath = path.join(__dirname, 'public', 'index.html');
  const fallbackPath = path.join(__dirname, 'index.html');
  
  // publicフォルダ内のindex.htmlを優先、なければルートのindex.htmlを使用
  const fs = require('fs');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else if (fs.existsSync(fallbackPath)) {
    res.sendFile(fallbackPath);
  } else {
    res.status(404).send('index.html not found');
  }
});

// Gemini API setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// 構文テンプレート（カスタマイズ対応）
const syntaxTemplates = {
  tomonaga: {
    name: "友永構文",
    description: "感情豊かな関西弁風の表現",
    presets: [
      {
        id: 'standard',
        name: '標準',
        description: 'バランスの取れた友永構文',
        settings: { intensity: 'normal', dialect: 'weak', length: 'normal' }
      },
      {
        id: 'mild',
        name: '控えめ',
        description: '関西弁を抑えた上品な友永構文',
        settings: { intensity: 'mild', dialect: 'none', length: 'short' }
      },
      {
        id: 'extreme',
        name: 'バチェラー級',
        description: '感情全開の強烈な友永構文',
        settings: { intensity: 'extreme', dialect: 'strong', length: 'long' }
      }
    ],
    settings: [
      {
        id: 'intensity',
        name: '強調度合い',
        type: 'select',
        options: [
          { value: 'mild', label: '控えめ' },
          { value: 'normal', label: '普通' },
          { value: 'extreme', label: 'バチェラー級' }
        ],
        default: 'normal'
      },
      {
        id: 'dialect',
        name: '関西弁の強さ',
        type: 'select',
        options: [
          { value: 'none', label: 'なし' },
          { value: 'weak', label: '弱め' },
          { value: 'strong', label: '強め' }
        ],
        default: 'weak'
      },
      {
        id: 'length',
        name: '文章の長さ',
        type: 'select',
        options: [
          { value: 'short', label: '短め（100-150文字）' },
          { value: 'normal', label: '普通（150-200文字）' },
          { value: 'long', label: '長め（200-250文字）' }
        ],
        default: 'normal'
      }
    ],
    generatePrompt: (content, settings) => {
      const intensityMap = {
        mild: '感情表現は控えめに、落ち着いた口調で',
        normal: '適度に感情を込めて、親しみやすい口調で',
        extreme: '感情を非常に強く表現し、テンション最大で'
      };
      
      const dialectMap = {
        none: '標準語で',
        weak: '軽く関西弁を混ぜて（「やん」「やで」程度）',
        strong: '関西弁を強く使って（「めっちゃ」「ほんま」「なんやねん」など多用）'
      };
      
      const lengthMap = {
        short: '100-150文字程度',
        normal: '150-200文字程度',
        long: '200-250文字程度'
      };
      
      return `あなたは友永構文で文章を生成してください。

設定：
- 強調度合い: ${intensityMap[settings.intensity]}
- 関西弁: ${dialectMap[settings.dialect]}
- 文章長: ${lengthMap[settings.length]}

特徴：
- 親しみやすい口調
- 「〜やん！」「〜やで！」などの語尾
- 設定に応じた感情表現と関西弁の使用

内容: ${content}

上記の設定に従って、友永構文で文章を生成してください。`;
    }
  },
  
  koizumi: {
    name: "小泉進次郎構文",
    description: "抽象的で哲学的な表現",
    presets: [
      {
        id: 'standard',
        name: '標準',
        description: '典型的な小泉進次郎構文',
        settings: { abstraction: 'moderate', repetition: 'normal', length: 'normal' }
      },
      {
        id: 'concrete',
        name: '具体的',
        description: '比較的わかりやすい小泉構文',
        settings: { abstraction: 'concrete', repetition: 'minimal', length: 'short' }
      },
      {
        id: 'philosophy',
        name: '哲学モード',
        description: '究極に抽象的な小泉構文',
        settings: { abstraction: 'extreme', repetition: 'heavy', length: 'long' }
      }
    ],
    settings: [
      {
        id: 'abstraction',
        name: '抽象度',
        type: 'select',
        options: [
          { value: 'concrete', label: '具体的に' },
          { value: 'moderate', label: 'やや抽象的' },
          { value: 'extreme', label: '完全に抽象的' }
        ],
        default: 'moderate'
      },
      {
        id: 'repetition',
        name: 'フレーズ反復度',
        type: 'select',
        options: [
          { value: 'minimal', label: '少なめ' },
          { value: 'normal', label: '普通' },
          { value: 'heavy', label: '多め' }
        ],
        default: 'normal'
      },
      {
        id: 'length',
        name: '文章の長さ',
        type: 'select',
        options: [
          { value: 'short', label: '短め（100-150文字）' },
          { value: 'normal', label: '普通（150-200文字）' },
          { value: 'long', label: '長め（200-250文字）' }
        ],
        default: 'normal'
      }
    ],
    generatePrompt: (content, settings) => {
      const abstractionMap = {
        concrete: '具体的な内容も含めつつ、小泉進次郎風の言い回しで',
        moderate: '適度に抽象的な表現を使い',
        extreme: '極めて抽象的で哲学的に、具体性を避けて'
      };
      
      const repetitionMap = {
        minimal: 'フレーズの繰り返しは控えめに',
        normal: '適度にフレーズを繰り返し',
        heavy: '同じフレーズや概念を何度も繰り返して'
      };
      
      const lengthMap = {
        short: '100-150文字程度',
        normal: '150-200文字程度',
        long: '200-250文字程度'
      };
      
      return `あなたは小泉進次郎構文で文章を生成してください。

設定：
- 抽象度: ${abstractionMap[settings.abstraction]}
- 反復: ${repetitionMap[settings.repetition]}
- 文章長: ${lengthMap[settings.length]}

特徴：
- 「つまり」「要するに」「ということは」を多用
- 当たり前のことを深遠そうに表現
- 「〜ということです」「〜なのです」で締める

内容: ${content}

上記の設定に従って、小泉進次郎構文で文章を生成してください。`;
    }
  },
  
  murakami: {
    name: "村上春樹構文",
    description: "独特な比喩と内省的な文体",
    presets: [
      {
        id: 'standard',
        name: '標準',
        description: 'バランスの取れた村上春樹構文',
        settings: { metaphor: 'normal', emotion: 'introspective', mystery: 'subtle', length: 'normal' }
      },
      {
        id: 'simple',
        name: 'シンプル',
        description: '読みやすい村上春樹構文',
        settings: { metaphor: 'minimal', emotion: 'introspective', mystery: 'none', length: 'short' }
      },
      {
        id: 'artistic',
        name: '芸術的',
        description: '比喩と謎に満ちた村上春樹構文',
        settings: { metaphor: 'rich', emotion: 'emotional', mystery: 'strong', length: 'long' }
      }
    ],
    settings: [
      {
        id: 'metaphor',
        name: '比喩の度合い',
        type: 'select',
        options: [
          { value: 'minimal', label: '控えめ' },
          { value: 'normal', label: '普通' },
          { value: 'rich', label: 'ユニークな比喩多め' }
        ],
        default: 'normal'
      },
      {
        id: 'emotion',
        name: '感情の表出度',
        type: 'select',
        options: [
          { value: 'detached', label: '淡々' },
          { value: 'introspective', label: 'やや内省的' },
          { value: 'emotional', label: '感情的' }
        ],
        default: 'introspective'
      },
      {
        id: 'mystery',
        name: '謎めいた要素',
        type: 'select',
        options: [
          { value: 'none', label: 'なし' },
          { value: 'subtle', label: '控えめ' },
          { value: 'strong', label: '強め' }
        ],
        default: 'subtle'
      },
      {
        id: 'length',
        name: '文章の長さ',
        type: 'select',
        options: [
          { value: 'short', label: '短め（100-150文字）' },
          { value: 'normal', label: '普通（150-200文字）' },
          { value: 'long', label: '長め（200-250文字）' }
        ],
        default: 'normal'
      }
    ],
    generatePrompt: (content, settings) => {
      const metaphorMap = {
        minimal: '比喩表現は控えめに使い',
        normal: '適度に詩的な比喩を使い',
        rich: '独特で創造的な比喩を多用して'
      };
      
      const emotionMap = {
        detached: '感情を抑制し、客観的な視点で',
        introspective: '内省的で静かな語り口で',
        emotional: '感情を込めて、やや情緒的に'
      };
      
      const mysteryMap = {
        none: '分かりやすく表現し',
        subtle: '少し謎めいた要素を含めて',
        strong: '哲学的で謎めいた表現を多用して'
      };
      
      const lengthMap = {
        short: '100-150文字程度',
        normal: '150-200文字程度',
        long: '200-250文字程度'
      };
      
      return `あなたは村上春樹風の文体で文章を生成してください。

設定：
- 比喩: ${metaphorMap[settings.metaphor]}
- 感情: ${emotionMap[settings.emotion]}
- 謎要素: ${mysteryMap[settings.mystery]}
- 文章長: ${lengthMap[settings.length]}

特徴：
- 「〜のようなもの」「〜みたいな」を使用
- 日常の出来事に深い意味を見出す
- 間接的な感情表現

内容: ${content}

上記の設定に従って、村上春樹風の文体で文章を生成してください。`;
    }
  }
};

// API Routes
app.get('/api/syntaxes', (req, res) => {
  const syntaxes = Object.keys(syntaxTemplates).map(key => ({
    id: key,
    name: syntaxTemplates[key].name,
    description: syntaxTemplates[key].description,
    presets: syntaxTemplates[key].presets,
    settings: syntaxTemplates[key].settings
  }));
  res.json(syntaxes);
});

app.post('/api/generate', async (req, res) => {
  try {
    const { syntaxId, content, settings = {} } = req.body;
    
    if (!syntaxId || !content) {
      return res.status(400).json({ error: 'syntaxId and content are required' });
    }
    
    const template = syntaxTemplates[syntaxId];
    if (!template) {
      return res.status(400).json({ error: 'Invalid syntax ID' });
    }
    
    // デフォルト設定をマージ
    const finalSettings = {};
    template.settings.forEach(setting => {
      finalSettings[setting.id] = settings[setting.id] || setting.default;
    });
    
    const prompt = template.generatePrompt(content, finalSettings);
    
    // Gemini API call with retry logic
    let result;
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      try {
        result = await model.generateContent(prompt);
        break;
      } catch (error) {
        attempts++;
        if (attempts === maxAttempts) {
          throw error;
        }
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
      }
    }
    
    const response = await result.response;
    const generatedText = response.text();
    
    res.json({
      success: true,
      generatedText: generatedText.trim(),
      syntaxName: template.name,
      usedSettings: finalSettings
    });
    
  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate text',
      details: error.message 
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Health check: http://localhost:${port}/health`);
});