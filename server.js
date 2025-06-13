const express = require('express');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 3000;

// Gemini AI初期化
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ミドルウェア
app.use(express.json());
app.use(express.static('public'));

// 構文データ
const syntaxes = [
  {
    id: 'tomonaga',
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
    }
  },
  {
    id: 'koizumi',
    name: "小泉構文",
    description: "小泉進次郎風の抽象的で哲学的な表現",
    presets: [
      {
        id: 'standard',
        name: '標準',
        description: 'バランスの取れた小泉構文',
        settings: { abstractness: 'normal', repetition: 'normal', length: 'normal' }
      },
      {
        id: 'mild',
        name: '控えめ',
        description: '分かりやすい小泉構文',
        settings: { abstractness: 'low', repetition: 'minimal', length: 'short' }
      },
      {
        id: 'extreme',
        name: '進次郎級',
        description: '究極の抽象性を持つ小泉構文',
        settings: { abstractness: 'extreme', repetition: 'heavy', length: 'long' }
      }
    ],
    settings: [
      {
        id: 'abstractness',
        name: '抽象度',
        type: 'select',
        options: [
          { value: 'low', label: '具体的' },
          { value: 'normal', label: '普通' },
          { value: 'extreme', label: '超抽象的' }
        ],
        default: 'normal'
      },
      {
        id: 'repetition',
        name: '同語反復の強さ',
        type: 'select',
        options: [
          { value: 'minimal', label: '最小限' },
          { value: 'normal', label: '普通' },
          { value: 'heavy', label: '多用' }
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
      const abstractnessMap = {
        low: '具体的で分かりやすい表現を心がけ、',
        normal: '適度に抽象的な表現を交えて、',
        extreme: '極めて抽象的で哲学的な表現を多用し、'
      };
      
      const repetitionMap = {
        minimal: '同語反復は控えめに使用',
        normal: '効果的な同語反復を適度に使用',
        heavy: '同語反復を多用して独特のリズムを作る'
      };
      
      const lengthMap = {
        short: '100-150文字程度',
        normal: '150-200文字程度',
        long: '200-250文字程度'
      };
      
      return `あなたは小泉進次郎構文で文章を生成してください。

特徴：
- ${abstractnessMap[settings.abstractness]}
- ${repetitionMap[settings.repetition]}
- 「〜ということです」「〜というものです」などの語尾
- 一見深そうで実は当たり前のことを言う
- 文章長: ${lengthMap[settings.length]}

内容: ${content}

上記の設定に従って、小泉構文で文章を生成してください。`;
    }
  },
  {
    id: 'murakami',
    name: "村上春樹構文",
    description: "村上春樹風の独特な比喩と文体",
    presets: [
      {
        id: 'standard',
        name: '標準',
        description: 'バランスの取れた村上春樹構文',
        settings: { metaphor: 'normal', melancholy: 'normal', length: 'normal' }
      },
      {
        id: 'mild',
        name: '控えめ',
        description: '読みやすい村上春樹構文',
        settings: { metaphor: 'light', melancholy: 'light', length: 'short' }
      },
      {
        id: 'extreme',
        name: 'ハルキスト級',
        description: '濃厚な村上春樹ワールド',
        settings: { metaphor: 'heavy', melancholy: 'heavy', length: 'long' }
      }
    ],
    settings: [
      {
        id: 'metaphor',
        name: '比喩の濃さ',
        type: 'select',
        options: [
          { value: 'light', label: '軽め' },
          { value: 'normal', label: '普通' },
          { value: 'heavy', label: '濃厚' }
        ],
        default: 'normal'
      },
      {
        id: 'melancholy',
        name: '哀愁の深さ',
        type: 'select',
        options: [
          { value: 'light', label: '軽やか' },
          { value: 'normal', label: '普通' },
          { value: 'heavy', label: '深い哀愁' }
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
      const metaphorMap = {
        light: '軽やかで理解しやすい比喩を時々使い、',
        normal: '独特で印象的な比喩を効果的に使い、',
        heavy: '深く印象的な比喩を多用し、現実と幻想を交錯させ、'
      };
      
      const melancholyMap = {
        light: 'さわやかで前向きな雰囲気で',
        normal: 'どこか物憂げで郷愁を感じさせる雰囲気で',
        heavy: '深い哀愁と孤独感を漂わせながら'
      };
      
      const lengthMap = {
        short: '100-150文字程度',
        normal: '150-200文字程度',
        long: '200-250文字程度'
      };
      
      return `あなたは村上春樹風の文体で文章を生成してください。

特徴：
- ${metaphorMap[settings.metaphor]}
- ${melancholyMap[settings.melancholy]}
- 「〜のような気がした」「〜だった」などの過去形
- 日常的な事象を詩的に表現
- 文章長: ${lengthMap[settings.length]}

内容: ${content}

上記の設定に従って、村上春樹風の文体で文章を生成してください。`;
    }
  }
];

// APIエンドポイント

// 構文一覧の取得
app.get('/api/syntaxes', (req, res) => {
  try {
    const syntaxList = syntaxes.map(({ generatePrompt, ...syntax }) => syntax);
    res.json(syntaxList);
  } catch (error) {
    console.error('Error fetching syntaxes:', error);
    res.status(500).json({ error: 'Failed to fetch syntaxes' });
  }
});

// 文章生成
app.post('/api/generate', async (req, res) => {
  try {
    const { syntaxId, content, settings } = req.body;

    if (!syntaxId || !content) {
      return res.status(400).json({ 
        success: false, 
        error: '構文IDと内容は必須です' 
      });
    }

    const syntax = syntaxes.find(s => s.id === syntaxId);
    if (!syntax) {
      return res.status(404).json({ 
        success: false, 
        error: '指定された構文が見つかりません' 
      });
    }

    // Gemini APIキーの確認
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ 
        success: false, 
        error: 'API設定に問題があります' 
      });
    }

    // プロンプト生成
    const prompt = syntax.generatePrompt(content, settings || {});

    // Gemini APIで文章生成
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const generatedText = response.text();

    res.json({
      success: true,
      generatedText: generatedText.trim(),
      syntaxName: syntax.name
    });

  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({ 
      success: false, 
      error: '文章生成中にエラーが発生しました' 
    });
  }
});

// ヘルスチェック
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Tomogemini Syntax Generator'
  });
});

// ルートパス
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

module.exports = app;