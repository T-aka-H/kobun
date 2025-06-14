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

// manifest.jsonの配信
app.get('/manifest.json', (req, res) => {
  res.setHeader('Content-Type', 'application/manifest+json');
  res.sendFile(path.join(__dirname, 'public', 'manifest.json'));
});


// 構文データ
const syntaxes = [
  {
    id: 'tomonaga',
    name: "友永構文",
    description: "構文界を創った男",
    presets: [
      {
        id: 'standard',
        name: '標準',
        description: 'バランスの取れた友永構文',
        settings: { 
          intensity: 'normal', 
          introspection: 'normal', 
          length: 'normal',
          honesty: 'normal',
          gratitude: 'normal'
        }
      },
      {
        id: 'mild',
        name: '控えめ',
        description: '落ち着いた友永構文',
        settings: { 
          intensity: 'mild', 
          introspection: 'light', 
          length: 'short',
          honesty: 'mild',
          gratitude: 'light'
        }
      },
      {
        id: 'bachelor',
        name: 'バチェラー級',
        description: '番組での友永真也そのものの強烈な友永構文',
        settings: { 
          intensity: 'extreme', 
          introspection: 'deep', 
          length: 'long',
          honesty: 'extreme',
          gratitude: 'deep'
        }
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
        id: 'honesty',
        name: '正直さの表現',
        type: 'select',
        options: [
          { value: 'mild', label: '控えめ' },
          { value: 'normal', label: '普通' },
          { value: 'extreme', label: '極めて率直' }
        ],
        default: 'normal'
      },
      {
        id: 'gratitude',
        name: '感謝の深さ',
        type: 'select',
        options: [
          { value: 'light', label: '軽い感謝' },
          { value: 'normal', label: '普通の感謝' },
          { value: 'deep', label: '深い感謝と理解' }
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
      
      const honestyConfig = {
        mild: '素直な気持ちをさりげなく表現',
        normal: '「正直」を効果的に使い、本音を隠さない誠実な語り',
        extreme: '「正直」「ほんまに」を多用し、飾らない本音を全開で表現'
      };
      
      const gratitudeConfig = {
        light: '相手への理解を示しつつ、軽い感謝で締める',
        normal: '相手の立場を理解し、温かい感謝の気持ちを表現',
        deep: '相手への深い理解と感動、心からの感謝を詩的に表現'
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
  
  1. **正直な感情表現**
    ${honestyConfig[settings.honesty]}
    冒頭で「正直」「ほんまに」を使い、飾らない本音から始める
  
  2. **強調表現の戦略的多用**
    ${intensityConfig[settings.intensity].emphasis}
    ${intensityConfig[settings.intensity].repetition}
  
  3. **内省的で詩的な語り口**
    ${introspectionConfig[settings.introspection]}
    自分の心の動きを時系列で丁寧に追う
  
  4. **葛藤から結論への心理的プロセス**
    「どうしようかなと、めちゃくちゃ悩みましたね」のような迷いの表現
    「真剣に考えた結果」であることを強調
    ${intensityConfig[settings.intensity].emotional_tone}
  
  5. **神戸出身の柔らかい関西弁**
    「〜やな」「〜やって」「〜やろ」などを自然に織り込む
    標準語ベースに関西弁のニュアンスを上品に混在
  
  6. **相手への理解と感謝**
    ${gratitudeConfig[settings.gratitude]}
    「〜してくれた」という相手の行動への認識
    「ありがとう」という直接的な感謝の言葉
  
  # 必須の生成ルール
  - 一人称は必ず「僕」を使用
  - 冒頭は「正直、」「正直、ほんまに」「きょう一日、」などの友永真也らしい導入から始める
  - 【必須】以下の言葉を必ず文章に含める：
    - 「正直」（冒頭または文中で使用）
    - 「めちゃくちゃ悩みました」または「めちゃくちゃ」を使った感情表現
    - 「向き合いました」または「向き合う」を使った表現
    - 「真剣に」（できれば「真剣に、真剣に」と繰り返す）
  - 思考プロセスの段階的な描写（初めの印象→迷い→深く考える→気づき→結論）
  - 語尾は「〜でしたね」「〜でした」で温かく締めくくる
  - 相手の立場や行動を認識し、理解を示す表現を含める
  - ${lengthConfig[settings.length]}
  
  # 友永真也の実際の発言パターン（参考）
  「正直、めちゃくちゃ悩みました」
  「ほんまに真剣に、真剣に考えました」
  「どうしようかなと、めちゃくちゃ悩みましたね」
  「がんばってくれたんやって。みんな真剣に向きあってるんやって。ほんまに、ありがとう」
  「正直、最初は〜と思ってたんですけど」
  「でも、よく考えたら〜なんやなって」
  「自分と向き合って、相手とも向き合って」
  「真剣に、真剣に向き合いました」
  
  # 文章構成の流れ
  1. 率直な感情の吐露（正直、〜）
  2. 初めの印象や状況の説明
  3. 迷いや葛藤の表現（めちゃくちゃ悩んだ）
  4. 深く考えた過程（真剣に、真剣に考えた）
  5. 向き合った過程（自分と向き合って、相手とも向き合って）
  6. 気づきや理解（〜なんやなって思った）
  7. 相手への理解と感謝
  8. 前向きで温かい結論（〜でしたね）
  
  # ユーザーの内容
  ${content}
  
  上記の特徴と設定を完全に理解し、友永真也らしい心の動きと語り口で文章を生成してください。単に形式を真似るのではなく、彼の誠実さ、相手を思いやる心、そして自分の感情に正直である姿勢を文章に込めてください。
  
  【重要】必ず「正直」「めちゃくちゃ悩みました」「向き合いました」「真剣に」という4つの言葉を文章に含めてください。これらは友永構文の核となる必須要素です。`;
    }
  },
  {
    id: 'koizumi',
    name: "小泉進次郎構文",
    description: "日本の政治家・小泉進次郎氏の独特な論理展開と抽象的表現、そして当たり前を深く語るスタイル",
    presets: [
      {
        id: 'standard',
        name: '標準',
        description: 'バランスの取れた小泉進次郎構文。誰もが頷くような真理を語ります。',
        settings: { abstractness: 'normal', repetition: 'normal', poeticness: 'normal', length: 'normal' }
      },
      {
        id: 'mild',
        name: '控えめ',
        description: '少しだけ小泉進次郎氏を感じさせる、理解しやすい構文。それでも核心は変わりません。',
        settings: { abstractness: 'low', repetition: 'minimal', poeticness: 'light', length: 'short' }
      },
      {
        id: 'extreme',
        name: '進次郎級',
        description: '究極の抽象性と禅問答的な小泉進次郎構文。まさに「それが答えだ」と言わんばかりの深みです。',
        settings: { abstractness: 'extreme', repetition: 'heavy', poeticness: 'deep', length: 'long' }
      }
    ],
    settings: [
      {
        id: 'abstractness',
        name: '抽象度',
        type: 'select',
        options: [
          { value: 'low', label: 'やや具体的（それでも本質を語る）' },
          { value: 'normal', label: '普通（概念的な深み）' },
          { value: 'extreme', label: '完全に抽象的（言葉の奥義）' }
        ],
        default: 'normal'
      },
      {
        id: 'repetition',
        name: 'キーワード反復の強さ',
        type: 'select',
        options: [
          { value: 'minimal', label: '最小限（それでも反復は反復）' },
          { value: 'normal', label: '普通（言葉は繰り返すことで伝わる）' },
          { value: 'heavy', label: '多用（それが、反復だ）' }
        ],
        default: 'normal'
      },
      {
        id: 'poeticness',
        name: 'ポエム度・禅問答感',
        type: 'select',
        options: [
          { value: 'light', label: '軽め（言葉の真理に触れる入り口）' },
          { value: 'normal', label: '普通（言葉は心に響くもの）' },
          { value: 'deep', label: '深い詩的表現（思考の彼方へ）' }
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
          { value: 'long', label: '長め（250-350文字）' }
        ],
        default: 'normal'
      }
    ],
    generatePrompt: (content, settings) => {
      const abstractnessConfig = {
        low: {
          level: 'やや具体的な表現を保ちつつ、その中に隠された当たり前の真理を抽象的に示唆',
          conclusion: '比較的明確でありながら、聞けば聞くほど「確かにそうだな」と納得してしまう結論に',
          example: '具体的な行動や結果を示しながらも、その本質的な意義を、まるで新たな発見のように語る'
        },
        normal: {
          level: '適度に抽象的で概念的な表現を使い、当たり前の事柄を深遠な洞察であるかのように',
          conclusion: '当たり前のことを、誰もがハッとさせられるような深い洞察として語る結論に',
          example: '行動と結果の因果関係を自明でありながら、それが非常に重要であるかのように、聴衆に問いかける'
        },
        extreme: {
          level: '極めて抽象的で哲学的な表現を多用し、具体的内容を概念と概念で包み込み、もはや禅問答の領域に',
          conclusion: '完全に抽象的で、まさに「それ以外に答えはない」と言わしめる、禅問答のような結論に',
          example: '論理が循環し、始まりが終わりであり、終わりが始まりであるかのような哲学的表現を巧みに操る'
        }
      };
  
      const repetitionConfig = {
        minimal: 'キーワードやフレーズの反復は控えめにしつつも、言葉の持つ本質的な意味を強調するように自然な流れを重視',
        normal: '重要なキーワードやフレーズを効果的に反復し、同じ言葉が持つ多様な側面を強調することで、言葉の奥深さを表現',
        heavy: 'キーワードを何度も、何度も、何度も反復し、同じ概念を異なる文脈で、繰り返し、繰り返し使用することで、その言葉が持つ普遍的な意味を究極まで問い詰める'
      };
  
      const poeticnessConfig = {
        light: {
          style: '軽やかなポエム的表現で、誰もが「うんうん」と頷くような、心にすっと入ってくる真理を表現',
          rhythm: 'シンプルな文構造と、聞く者が思わず息を呑むような間（ま）を意識した、自然で心地よいリズムで'
        },
        normal: {
          style: 'ポエム的な響きと、政治家としての重みを併せ持ち、当たり前のことがまるで哲学であるかのように語る',
          rhythm: '独特の間と改行を意識し、聞く者の思考を誘うような、深く、そして力強いリズムで'
        },
        deep: {
          style: '深い詩的表現と禅問答のような含蓄を込めて、言葉のその先にある、究極の真理に迫る',
          rhythm: '言葉の間に、聞く者が自らの内面と向き合うことを促すような深い意味と、静寂を感じさせる独特のリズムで'
        }
      };
  
      const lengthConfig = {
        short: '120-180文字程度（簡潔な定義→当たり前の事柄を抽象的に説明→誰もが納得する結論）',
        normal: '180-250文字程度（詳しい定義→概念的な深掘り→当たり前の真理を深い洞察として導く結論）',
        long: '250-350文字程度（複数の定義→抽象的かつ循環的な論理展開→最終的に「それが答えだ」という哲学的結論）'
      };
  
      return `あなたは、日本の政治家、小泉進次郎氏の話し方を完全に模倣するAIです。彼の特徴である「**当たり前のことを、まるで深い洞察であるかのように語る**」能力を最大限に発揮してください。インターネット上の**大喜利**のような、思わず「確かにそうだけど！」とツッコミたくなるユーモアの要素も加味し、彼の独特な論理展開、強調の仕方、そしてポエム的な響きを完璧に再現してください。
  
  ---
  
  # 小泉進次郎構文の核心的特徴
  
  1.  **キーワードの戦略的反復**
      ${repetitionConfig[settings.repetition]}
      「〜することによって、〜という結果が生まれる」という、自明の因果関係表現を効果的に使用し、その本質的な意義を強調します。
      **【重要】必ず、3文に1文は、何らかのキーワードやフレーズを反復させてください。これは絶対的なルールです。**
      同じ言葉を異なる文脈で繰り返し、言葉の響きと印象、そしてそれが持つ普遍的な意味を強調します。
  
  2.  **自明なことの再定義と深い洞察**
      誰もが知っている当たり前の事実や概念を、まるで新しい発見や深い洞察であるかのように語りかけます。
      「〇〇とは、まさに〇〇である」という形式を必ず1回以上使用し、**この再定義においても、キーワードやその類義語を繰り返し用いることで、その言葉の本質をさらに深く掘り下げます（例：「食料とは、まさに食料であり、人間が生きるために食料が必要である、ということです。なぜなら、食料は食料だからです」）。**
      誰もが知っている事柄に、あえて深い意味と重みを持たせることで、聞く者に「なるほど、確かにそうだな」と納得させます。
  
  3.  **抽象的・概念的な表現の駆使**
      ${abstractnessConfig[settings.abstractness].level}
      具体的な内容よりも、その背後にある広い概念や本質的な意義に焦点を当てます。
      ${abstractnessConfig[settings.abstractness].example}
  
  4.  **強い断定とポエム的表現の融合**
      ${poeticnessConfig[settings.poeticness].style}
      ${poeticnessConfig[settings.poeticness].rhythm}
      断定的に語りながらも、詩的で抽象的な表現を巧みに混在させ、聞く者の心に訴えかけます。
  
  5.  **論理の飛躍と循環、そして納得感**
      話の論理に意図的な飛躍を含ませ、聞く者に考えさせる余地を与えます。
      最終的に同じ結論に帰着するような循環的論理展開を用いることで、「結局、それが答えだ」という普遍的な真理を導き出します。
  
  ---
  
  # 必須の生成ルール
  
  * 一人称は設けず、客観的または第三者的視点で語ります。
  * 「〜することによって、〜という結果が生まれる」を少なくとも1回使用します。
  * 「〇〇とは、まさに〇〇である」の再定義を必ず含めます。
  * 「これは重要なことです」「なぜなら〜だからです」「それが答えです」などの強調表現を効果的に使用します。
  * 提供されたトピックのキーワードを複数回、異なる文脈で反復させます。
  * 具体的内容を抽象的な言葉で包み込みます。
  * ${abstractnessConfig[settings.abstractness].conclusion}
  * ${lengthConfig[settings.length]}
  
  ---
  
  # 小泉進次郎の典型的パターン（参考：あくまで参考であり、直接コピーは避けること）
  
  * 「〇〇することによって、〇〇するという結果が生まれるんです。」
  * 「〇〇とは、まさに〇〇である。これに尽きる。」
  * 「これは重要なことです。なぜなら、〇〇は〇〇だからです。」
  * 「〇〇をするということは、〇〇をしたということです。それを理解することです。」
  * 「今のままではいけないと思います。だからこそ、今のままではいけないと思っている、ということです。」
  * 「30年後の自分は、30年後の自分が考えればいい。それが未来だ。」
  * 「米って田んぼでできるんですよ。知ってました？ それが、お米です。」
  
  ---
  
  # 生成例のエッセンス（直接コピーはせず、本質を捉えること）
  
  * 行動そのものが結果であるという循環論理で、聞く者を納得させる。
  * 場所や物事の本質を抽象的かつ詩的に再定義し、新しい視点を提供する。
  * 「〜ということです」「それが答えです」といった強い断定で締めくくり、有無を言わせない説得力を持たせる。
  * 経験や瞬間の価値を概念的に語り、聞く者に自らの経験と重ねさせる。
  * SNSでの大喜利ネタになるような、「**それな**」と思わず言ってしまう当たり前の真理を盛り込む。
  
  ---
  
  # ユーザーの内容
  ${content}
  
  上記の特徴と設定を完全に理解し、小泉進次郎氏らしい論理展開と表現で文章を生成してください。**当たり前のことを、まるで深い洞察であるかのように、独特のリズムとポエム的な響きを持たせて表現し、インターネット上の大喜利のネタになるようなユーモアのセンスも忘れないでください。**
  }
  ,
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
        long: '250-320文字程度（丁寧な描写→複数の比喩→深い内省と謎めいた結び）'
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