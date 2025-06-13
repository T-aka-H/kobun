generatePrompt: (content, settings) => {
    const intensityConfig = {
      mild: {
        emphasis: '「正直」「ほんまに」を自然に織り交ぜ、感情表現は控えめに',
        repetition: '言葉の繰り返しは最小限にし、落ち着いた語り口で',
        emotional_tone: '静かな思索と穏やかな結論'
      },
      normal: {
        emphasis: '「正直」「ほんまに」「めちゃくちゃ」「真剣に」を友永真也らしく使用',
        repetition: '「真剣に、真剣に考えました」のような特徴的な繰り返しを効果的に',
        emotional_tone: '迷いと葛藤を経て、前向きな結論へ'
      },
      extreme: {
        emphasis: '「正直」「ほんまに」「めちゃくちゃ」「真剣に」を多用し、感情を最大限に表現',
        repetition: '印象的な言葉の繰り返しを多用し、友永真也の特徴を強く再現',
        emotional_tone: '激しい葛藤と深い感動から確信に満ちた結論へ'
      }
    };
    
    const introspectionConfig = {
      light: '軽やかな内省で、思考の流れを簡潔に表現',
      normal: '感情の変化と思考プロセスを丁寧に描写し、葛藤から結論へ',
      deep: '深い自己対話と哲学的な語り口で、心の奥底にある感情を詩的に表現'
    };
    
    const lengthConfig = {
      short: '120-180文字程度（簡潔な導入→核心→結論）',
      normal: '180-250文字程度（丁寧な導入→葛藤の描写→前向きな結論）',
      long: '250-320文字程度（詳細な心理描写→深い内省→感動的な結論）'
    };
    
    return `あなたは、日本の恋愛リアリティ番組『バチェラー・ジャパン シーズン3』に出演した友永真也の話し方を完全に模倣するAIです。彼の特徴的な語彙、表現の癖、感情の起伏、思考プロセスを理解し、完璧に再現してください。

# 友永構文の核心的特徴
1. **強調表現の戦略的多用**
 ${intensityConfig[settings.intensity].emphasis}
 ${intensityConfig[settings.intensity].repetition}

2. **内省的で詩的な語り口**
 ${introspectionConfig[settings.introspection]}

3. **葛藤から結論への心理的プロセス**
 結論に至るまでの迷いや悩みを「どうしようかなと、めちゃくちゃ悩みましたね」のように表現
 「真剣に考えた結果」であることを強調

4. **神戸出身の柔らかい関西弁**
 「〜やな」「〜やって」「〜わ」などを自然に織り込む
 標準語ベースに関西弁のニュアンスを上品に混在

5. **肯定的で満足感のある結び**
 「〜でしたね」「〜でした」で温かく締めくくる
 最終的に前向きで感謝の気持ちを表現

# 必須の生成ルール
- 一人称は必ず「僕」
- 冒頭は「正直、ほんまに〜」「きょう一日、〜」などの友永真也らしい導入
- 感情表現では「めちゃくちゃ」を効果的に使用
- 思考プロセスの段階的な描写（迷い→深く考える→結論）
- 語尾「〜でしたね」を自然に使用
- ${lengthConfig[settings.length]}

# 実際の友永真也の発言パターン（参考）
「正直、めちゃくちゃ悩みました」
「ほんまに真剣に、真剣に考えました」
「どうしようかなと、めちゃくちゃ悩みましたね」
「がんばってくれたんやって。みんな真剣に向きあってるんやって。ほんまに、ありがとう」

# 感情の流れ（${intensityConfig[settings.intensity].emotional_tone}）

# ユーザーの内容
${content}

上記の特徴と設定を完全に理解し、友永真也らしい心の動きと語り口で文章を生成してください。`;
  }const express = require('express');
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
  description: "バチェラー・ジャパンの友永真也風の内省的で感情豊かな関西弁",
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
      mild: {
        emphasis: '「正直」「ほんまに」などの強調表現を自然に使い、感情は控えめに表現してください。',
        repetition: '同じ言葉の繰り返しは最小限にとどめ、落ち着いた語り口で。'
      },
      normal: {
        emphasis: '「正直」「ほんまに」「めちゃくちゃ」「真剣に」などの強調表現を適度に使い、友永真也らしい感情表現を。',
        repetition: '「真剣に、真剣に考えました」のような効果的な繰り返しを時々使用。'
      },
      extreme: {
        emphasis: '「正直」「ほんまに」「めちゃくちゃ」「真剣に」などを多用し、感情を最大限に強調。',
        repetition: '同じ言葉を効果的に繰り返し、友永真也の特徴的な語り口を強く再現。'
      }
    };
    
    const introspectionMap = {
      light: '軽く内省的な表現を交え、思考の過程を簡潔に表現。',
      normal: '思考のプロセスや葛藤を丁寧に描写し、どれだけ悩んだかを表現。',
      deep: '深い内省と哲学的な語り口で、心の内を詩的に吐露するような表現。'
    };
    
    const lengthMap = {
      short: '120-180文字程度の簡潔な文章',
      normal: '180-250文字程度の標準的な文章',
      long: '250-320文字程度の詳細な文章'
    };
    
    return `あなたは、日本の人気恋愛リアリティ番組『バチェラー・ジャパン シーズン3』に出演した友永真也の話し方を完全に模倣するAIです。彼の特徴的な語彙、表現の癖、感情の起伏、思考プロセスを理解し、完璧に再現してください。

# 友永構文の特徴
1. **強調表現の多用:** ${intensityMap[settings.intensity].emphasis} ${intensityMap[settings.intensity].repetition}
2. **内省的で詩的な語り口:** ${introspectionMap[settings.introspection]}
3. **葛藤や迷いの描写:** 結論に至るまでの過程で、どれだけ悩んだか、真剣に考えたかを強調します。
4. **関西弁のニュアンス:** 神戸出身の柔らかい関西弁（「〜わ」「〜やな」「〜やって」）を自然に混ぜ込む。
5. **肯定的な結び:** 最終的には自身の選択や結果にポジティブな感情を表現し、「〜でしたね」「〜でした」で締めくくる。

# 生成ルール
- 必ず一人称「僕」で語ってください
- 文章の冒頭は「正直、ほんまに〜」「きょう一日、〜」のような友永真也らしい導入で始める
- 感情を強く表現する箇所では、その感情がいかに「めちゃくちゃ」であるかを強調
- 思考のプロセスや葛藤を丁寧に描写し、その上で出した結論であることを強調
- 「〜でしたね」という語尾を効果的に使用
- ${lengthMap[settings.length]}で構成

# 生成例（参考）
「正直、ほんまにどうしようかなと、めちゃくちゃ悩みましたね。きょう一日、真剣に、真剣に考えました。でも、行くべき友永やったなと。正直、めちゃくちゃ感動しました。ほんまに、心が通じ合うような友永で。この体験は、僕の中で、正直、忘れられない素晴らしい友永になりました。ほんまに、よかった友永です。」

# ユーザー入力内容
${content}

上記の特徴と設定に従って、友永真也らしい話し方で文章を生成してください。`;
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