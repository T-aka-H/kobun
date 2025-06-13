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

// faviconのリクエストを無視（404エラーを防ぐ）
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

// Gemini API setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// 構文テンプレート（カスタマイズ対応）
const syntaxTemplates = {
  tomonaga: {
    name: "友永構文",
    description: "世に構文界を作り出した男。構文は友永に始まり、友永に終わる。",
    presets: [
      {
        id: 'standard',
        name: '標準',
        description: 'バランスの取れた友永構文',
        settings: { intensity: 'normal', introspection: 'normal', length: 'normal' }
      },
      {
        id: 'mild',
        name: '控えめ',
        description: '落ち着いた友永構文',
        settings: { intensity: 'mild', introspection: 'light', length: 'short' }
      },
      {
        id: 'bachelor',
        name: 'バチェラー級',
        description: '番組での友永真也そのものの強烈な友永構文',
        settings: { intensity: 'extreme', introspection: 'deep', length: 'long' }
      }
    ],
    settings: [
      {
        id: 'intensity',
        name: '感情の強調度',
        type: 'select',
        options: [
          { value: 'mild', label: '控えめ' },
          { value: 'normal', label: '普通' },
          { value: 'extreme', label: 'バチェラー級（最強）' }
        ],
        default: 'normal'
      },
      {
        id: 'introspection',
        name: '内省の深さ',
        type: 'select',
        options: [
          { value: 'light', label: '軽め' },
          { value: 'normal', label: '普通' },
          { value: 'deep', label: '深く内省的' }
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
      const intensityMap = {
        mild: '「正直」「ほんまに」などの強調表現を控えめに使い',
        normal: '「正直」「ほんまに」「めちゃくちゃ」などの強調表現を適度に使い',
        extreme: '「正直」「ほんまに」「めちゃくちゃ」「真剣に」などの強調表現を多用し、感情を最大限に表現して'
      };
      
      const introspectionMap = {
        light: '軽く自分の気持ちを振り返りながら',
        normal: '自分の感情や考えを丁寧に内省しながら',
        deep: '深く自分の内面と向き合い、詩的で比喩的な表現も交えながら'
      };
      
      const lengthMap = {
        short: '100-150文字程度',
        normal: '150-200文字程度',
        long: '200-250文字程度'
      };
      
      return `あなたはバチェラー・ジャパンの友永真也さんの話し方で文章を生成してください。

友永真也さんの特徴：
- 神戸出身の関西弁（「〜やん」「〜やで」「〜やって」など）
- 強調表現の多用：「正直」「ほんまに」「めちゃくちゃ」「真剣に」
- 内省的で詩的な表現
- 感情を丁寧に、時に比喩的に語るスタイル
- 飄々としながらも真剣な語り口

設定：
- 感情強調: ${intensityMap[settings.intensity]}
- 内省度: ${introspectionMap[settings.introspection]}
- 文章長: ${lengthMap[settings.length]}

例文の雰囲気：
「正直、めちゃくちゃ悩みました」
「ほんまに真剣に、真剣に考えました」
「がんばってくれたんやって。みんな真剣に向きあってるんやって。ほんまに、ありがとう」

内容: ${content}

上記の特徴と設定に従って、友永真也さんらしい話し方で文章を生成してください。`;
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