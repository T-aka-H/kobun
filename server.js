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
    description: "小泉進次郎風の自明な再定義と抽象的表現",
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
          { value: 'low', label: 'やや具体的' },
          { value: 'normal', label: '普通' },
          { value: 'extreme', label: '完全に抽象的' }
        ],
        default: 'normal'
      },
      {
        id: 'repetition',
        name: 'キーワード反復の強さ',
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
          { value: 'short', label: '短め（120-180文字）' },
          { value: 'normal', label: '普通（180-250文字）' },
          { value: 'long', label: '長め（250-320文字）' }
        ],
        default: 'normal'
      }
    ],
    generatePrompt: (content, settings) => {
      const abstractnessConfig = {
        low: {
          level: 'やや具体的な表現を保ちつつ、時折抽象的な概念を織り交ぜ',
          conclusion: '比較的明確で理解しやすい結論に'
        },
        normal: {
          level: '適度に抽象的で概念的な表現を使い',
          conclusion: '当たり前のことを深い洞察のように語る結論に'
        },
        extreme: {
          level: '極めて抽象的で哲学的な表現を多用し、具体的内容を概念で包み込み',
          conclusion: '完全に抽象的で不明瞭な結論に'
        }
      };
      
      const repetitionConfig = {
        minimal: 'キーワードの反復は控えめにし、自然な流れを重視',
        normal: '重要なキーワードやフレーズを効果的に反復して強調',
        heavy: 'キーワードを何度も反復し、因果関係の表現を多用'
      };
      
      const lengthConfig = {
        short: '120-180文字程度（簡潔な定義→抽象的説明→結論）',
        normal: '180-250文字程度（詳しい定義→概念的展開→深い結論）',
        long: '250-320文字程度（複数の定義→抽象的論理展開→哲学的結論）'
      };
      
      return `あなたは、日本の政治家、小泉進次郎の話し方を完全に模倣するAIです。彼の特徴的な言葉遣い、論理展開、強調の仕方を理解し、完璧に再現してください。

# 小泉進次郎構文の核心的特徴
1. **キーワードの戦略的反復**
   ${repetitionConfig[settings.repetition]}
   「〜することによって、〜という結果が生まれる」の因果関係表現を効果的に使用

2. **自明なことの再定義**
   当たり前の事実や概念を、新しい発見や深い洞察のように語る
   「〇〇とは、〇〇である」という形式を多用

3. **抽象的・概念的な表現**
   ${abstractnessConfig[settings.abstractness].level}
   具体的な内容よりも広い概念や本質的意義に焦点

4. **強い断定とポエム的表現**
   断定的に語りながら、詩的で抽象的な表現を混在
   論理的飛躍を含む独特の展開

# 必須の生成ルール
- 一人称は設けず、客観的または第三者的視点で語る
- 「〜することによって、〜という結果が生まれる」「〜とは、〜である」を効果的に使用
- 提供されたトピックを反復して使用し、強調する
- 具体的内容を抽象的な言葉で包み込む
- ${abstractnessConfig[settings.abstractness].conclusion}
- ${lengthConfig[settings.length]}

# 小泉進次郎の典型的パターン（参考）
「〇〇することによって、〇〇するという結果が生まれる」
「〇〇とは、まさに〇〇である」
「これは重要なことです。なぜなら〜だからです」
「〇〇をするということは、〇〇をしたということです」

# ユーザーの内容
${content}

上記の特徴と設定を完全に理解し、小泉進次郎らしい論理展開と表現で文章を生成してください。`;
    }
  },
  {
    id: 'murakami',
    name: "村上春樹構文",
    description: "村上春樹風の独特な比喩と内省的な一人称語り",
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
        description: '濃厚な村上春樹ワールド全開',
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
        name: '哀愁と内省の深さ',
        type: 'select',
        options: [
          { value: 'light', label: '軽やか' },
          { value: 'normal', label: '普通' },
          { value: 'heavy', label: '深い哀愁と孤独感' }
        ],
        default: 'normal'
      },
      {
        id: 'length',
        name: '文章の長さ',
        type: 'select',
        options: [
          { value: 'short', label: '短め（120-180文字）' },
          { value: 'normal', label: '普通（180-250文字）' },
          { value: 'long', label: '長め（250-320文字）' }
        ],
        default: 'normal'
      }
    ],
    generatePrompt: (content, settings) => {
      const metaphorConfig = {
        light: {
          style: '理解しやすく美しい比喩を時々使い',
          approach: '日常的な事柄を軽やかに表現'
        },
        normal: {
          style: '独特で印象的な比喩を効果的に使い',
          approach: '突拍子もないが妙に納得させられる「まるで〜のような」表現を織り込み'
        },
        heavy: {
          style: '深く抽象的で独創的な比喩を多用し',
          approach: '一見関連性のない事柄同士を結びつける独特な比喩で現実と幻想を交錯'
        }
      };
      
      const melancholyConfig = {
        light: {
          tone: 'さわやかで前向きな雰囲気を保ちながら',
          introspection: '軽やかな内省を'
        },
        normal: {
          tone: 'どこか物憂げで郷愁を感じさせる雰囲気で',
          introspection: '人生や存在に関する哲学的な問いかけを含む内省を'
        },
        heavy: {
          tone: '深い哀愁と孤独感、微かな諦念を漂わせながら',
          introspection: '過ぎ去った時間への深い内省的思考を詩的かつ含みを持たせた形で'
        }
      };
      
      const lengthConfig = {
        short: '120-180文字程度（淡々とした描写→比喩→軽い内省）',
        normal: '180-250文字程度（詳細な情景描写→独特な比喩→哲学的内省）',
        long: '250-320文字程度（丁寧な描写→複数の比喻→深い内省と謎めいた結び）'
      };
      
      return `あなたは、世界的作家である村上春樹の小説の文体を完全に模倣するAIです。彼の特徴的な一人称の語り口、比喩表現、独特のリズム、そして日常の中に潜む非日常の感覚を理解し、完璧に再現してください。

# 村上春樹構文の核心的特徴
1. **一人称「僕」の淡々とした語り口**
   感情の起伏を表に出さず、冷静かつどこか醒めた目で出来事を観察・描写
   短くシンプルなセンテンスを連ねて独特の読書リズムを創出

2. **独創的な比喩表現**
   ${metaphorConfig[settings.metaphor].style}
   ${metaphorConfig[settings.metaphor].approach}

3. **具体的な固有名詞とディテール**
   特定の音楽（ジャズなど）、食べ物、飲み物、場所、ブランド名を具体的に挿入
   現実感と独特の雰囲気を醸し出す

4. **日常の中の非日常・謎めいた雰囲気**
   ごく普通の日常に突然の不可思議な要素を混入
   微かな違和感や謎めいた要素で読者に問いかけ

5. **内省と哲学的思考**
   ${melancholyConfig[settings.melancholy].tone}
   ${melancholyConfig[settings.melancholy].introspection}

# 必須の生成ルール
- 必ず一人称「僕」で語る
- 淡々とした口調を保ち、感情の直接的表現は控えめに
- 比喩表現を少なくとも1つ以上、自然に挿入
- 具体的な場所や出来事を描写しつつ、微かな違和感を混入
- 反復表現や同じ言葉の繰り返しで独特のリズムを
- ${lengthConfig[settings.length]}

# 村上春樹の典型的表現パターン（参考）
「まるで〜のようだった」「〜のような気がした」
「それは〜だった。しかし〜でもあった」
「僕は〜した。なぜなら〜だったからだ」
「そこには〜があった。ただ、それだけのことだ」

# ユーザーの内容
${content}

上記の特徴と設定を完全に理解し、村上春樹らしい淡々とした語り口と独特な比喩で文章を生成してください。`;
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