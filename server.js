<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>友Gemini真也構文</title>
    <!-- faviconを明示的に無効化 -->
    <link rel="icon" href="data:,">
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Times New Roman', 'YuMincho', 'Hiragino Mincho ProN', 'Yu Mincho', 'MS PMincho', serif;
            background: #f8f8f8;
            min-height: 100vh;
            padding: 40px 20px;
            line-height: 1.7;
            color: #2c2c2c;
        }
        
        .container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            border: 1px solid #ddd;
            box-shadow: 0 4px 20px rgba(0,0,0,0.05);
        }
        
        .header {
            padding: 60px 40px;
            text-align: center;
            border-bottom: 1px solid #eee;
        }
        
        .header h1 {
            font-size: 2.8rem;
            margin-bottom: 20px;
            font-weight: 400;
            letter-spacing: 0.05em;
            color: #1a1a1a;
        }
        
        .header p {
            font-size: 1.2rem;
            color: #666;
            font-weight: 300;
        }
        
        .main-content {
            padding: 50px 40px;
        }
        
        .step {
            margin-bottom: 50px;
            padding-bottom: 40px;
            border-bottom: 1px solid #f0f0f0;
        }
        
        .step:last-of-type {
            border-bottom: none;
        }
        
        .step-title {
            font-size: 1.6rem;
            font-weight: 400;
            color: #2c2c2c;
            margin-bottom: 30px;
            letter-spacing: 0.02em;
        }
        
        .step-number {
            display: inline-block;
            width: 32px;
            height: 32px;
            border: 1px solid #333;
            color: #333;
            text-align: center;
            line-height: 30px;
            margin-right: 15px;
            font-size: 0.9rem;
            font-weight: 400;
        }
        
        .syntax-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
        }
        
        .syntax-card {
            border: 1px solid #ddd;
            padding: 30px 25px;
            cursor: pointer;
            transition: all 0.3s ease;
            text-align: left;
            background: white;
        }
        
        .syntax-card:hover {
            border-color: #999;
            box-shadow: 0 2px 10px rgba(0,0,0,0.08);
        }
        
        .syntax-card.selected {
            border-color: #333;
            background: #fafafa;
        }
        
        .syntax-name {
            font-size: 1.3rem;
            font-weight: 400;
            color: #1a1a1a;
            margin-bottom: 12px;
            letter-spacing: 0.02em;
        }
        
        .syntax-description {
            font-size: 1rem;
            color: #666;
            line-height: 1.6;
        }
        
        .input-group {
            margin-bottom: 25px;
        }
        
        .input-label {
            font-weight: 400;
            color: #2c2c2c;
            margin-bottom: 12px;
            display: block;
            font-size: 1.1rem;
        }
        
        .input-field {
            width: 100%;
            padding: 18px;
            border: 1px solid #ddd;
            font-size: 1rem;
            transition: border-color 0.3s ease;
            font-family: inherit;
            background: white;
            resize: vertical;
        }
        
        .input-field:focus {
            outline: none;
            border-color: #999;
        }
        
        .input-field::placeholder {
            color: #aaa;
            font-style: italic;
        }
        
        .generate-btn {
            width: 100%;
            padding: 18px;
            background: #2c2c2c;
            color: white;
            border: none;
            font-size: 1.1rem;
            font-weight: 400;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-top: 30px;
            font-family: inherit;
            letter-spacing: 0.02em;
        }
        
        .generate-btn:hover:not(:disabled) {
            background: #1a1a1a;
        }
        
        .generate-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
        
        .result-container {
            background: #fafafa;
            border: 1px solid #eee;
            padding: 35px;
            margin-top: 40px;
        }
        
        .result-title {
            font-size: 1.3rem;
            font-weight: 400;
            color: #2c2c2c;
            margin-bottom: 20px;
            letter-spacing: 0.02em;
        }
        
        .result-text {
            font-size: 1.2rem;
            line-height: 1.8;
            color: #1a1a1a;
            margin-bottom: 25px;
            padding: 25px;
            background: white;
            border: 1px solid #eee;
            min-height: 120px;
            font-weight: 300;
        }
        
        .copy-btn {
            background: #666;
            color: white;
            border: none;
            padding: 12px 24px;
            cursor: pointer;
            font-weight: 400;
            transition: background 0.3s ease;
            font-family: inherit;
        }
        
        .copy-btn:hover {
            background: #555;
        }
        
        .settings-container {
            background: #fafafa;
            border: 1px solid #eee;
            padding: 35px;
            margin-top: 30px;
        }
        
        .settings-title {
            font-size: 1.2rem;
            font-weight: 400;
            color: #2c2c2c;
            margin-bottom: 30px;
            letter-spacing: 0.02em;
        }
        
        .presets-container {
            margin-bottom: 30px;
        }
        
        .presets-title {
            font-size: 1.1rem;
            font-weight: 400;
            color: #2c2c2c;
            margin-bottom: 15px;
            letter-spacing: 0.02em;
        }
        
        .presets-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 15px;
        }
        
        .preset-card {
            border: 1px solid #ddd;
            padding: 20px;
            cursor: pointer;
            transition: all 0.3s ease;
            text-align: left;
            background: white;
        }
        
        .preset-card:hover {
            border-color: #999;
        }
        
        .preset-card.selected {
            border-color: #333;
            background: #f5f5f5;
        }
        
        .preset-name {
            font-weight: 400;
            color: #1a1a1a;
            margin-bottom: 8px;
            font-size: 1rem;
            letter-spacing: 0.02em;
        }
        
        .preset-description {
            font-size: 0.9rem;
            color: #666;
            line-height: 1.4;
        }
        
        .settings-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 25px;
        }
        
        .setting-item {
            background: white;
            padding: 20px;
            border: 1px solid #eee;
        }
        
        .setting-label {
            font-weight: 400;
            color: #2c2c2c;
            margin-bottom: 10px;
            display: block;
            font-size: 1rem;
        }
        
        .setting-select {
            width: 100%;
            padding: 12px;
            border: 1px solid #ddd;
            font-size: 0.95rem;
            background: white;
            cursor: pointer;
            font-family: inherit;
        }
        
        .setting-select:focus {
            outline: none;
            border-color: #999;
        }
        
        .error {
            background: #f8f8f8;
            color: #666;
            padding: 20px;
            border: 1px solid #ddd;
            margin-top: 20px;
            font-style: italic;
        }
        
        .loading {
            text-align: center;
            padding: 50px;
            color: #666;
            font-size: 1.1rem;
            font-style: italic;
        }
        
        .footer {
            padding: 30px 40px;
            text-align: center;
            border-top: 1px solid #eee;
            background: #fafafa;
            font-size: 0.9rem;
            color: #999;
            font-style: italic;
            letter-spacing: 0.02em;
        }
        
        @media (max-width: 768px) {
            body {
                padding: 20px 10px;
            }
            
            .header {
                padding: 40px 20px;
            }
            
            .header h1 {
                font-size: 2.2rem;
            }
            
            .main-content {
                padding: 30px 20px;
            }
            
            .syntax-grid {
                grid-template-columns: 1fr;
            }
            
            .settings-grid {
                grid-template-columns: 1fr;
            }
            
            .presets-grid {
                grid-template-columns: 1fr;
            }
            
            .step-title {
                font-size: 1.4rem;
            }
        }
    </style>
</head>
<body>
    <div id="root"></div>

    <script type="text/babel">
        const { useState, useEffect } = React;

        const API_BASE_URL = window.location.origin;

        function App() {
            const [syntaxes, setSyntaxes] = useState([]);
            const [selectedSyntax, setSelectedSyntax] = useState('');
            const [selectedPreset, setSelectedPreset] = useState('');
            const [content, setContent] = useState('');
            const [settings, setSettings] = useState({});
            const [result, setResult] = useState('');
            const [isLoading, setIsLoading] = useState(false);
            const [error, setError] = useState('');
            const [resultSyntaxName, setResultSyntaxName] = useState('');

            useEffect(() => {
                fetchSyntaxes();
            }, []);

            useEffect(() => {
                // 構文が選択されたときにデフォルト設定をセット
                if (selectedSyntax) {
                    const syntax = syntaxes.find(s => s.id === selectedSyntax);
                    if (syntax) {
                        const defaultSettings = {};
                        syntax.settings.forEach(setting => {
                            defaultSettings[setting.id] = setting.default;
                        });
                        setSettings(defaultSettings);
                        setSelectedPreset('standard'); // デフォルトで標準プリセットを選択
                    }
                }
            }, [selectedSyntax, syntaxes]);

            const fetchSyntaxes = async () => {
                try {
                    const response = await fetch(`${API_BASE_URL}/api/syntaxes`);
                    const data = await response.json();
                    setSyntaxes(data);
                } catch (error) {
                    console.error('Failed to fetch syntaxes:', error);
                    setError('構文データの取得に失敗しました');
                }
            };

            const handlePresetChange = (presetId) => {
                setSelectedPreset(presetId);
                const syntax = syntaxes.find(s => s.id === selectedSyntax);
                if (syntax) {
                    const preset = syntax.presets.find(p => p.id === presetId);
                    if (preset) {
                        setSettings(preset.settings);
                    }
                }
            };

            const handleSettingChange = (settingId, value) => {
                setSettings(prev => ({
                    ...prev,
                    [settingId]: value
                }));
                // カスタム設定になったらプリセット選択を解除
                setSelectedPreset('');
            };

            const handleGenerate = async () => {
                if (!selectedSyntax || !content.trim()) {
                    setError('構文と内容を選択・入力してください');
                    return;
                }

                setIsLoading(true);
                setError('');
                setResult('');

                try {
                    const response = await fetch(`${API_BASE_URL}/api/generate`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            syntaxId: selectedSyntax,
                            content: content.trim(),
                            settings: settings
                        })
                    });

                    const data = await response.json();

                    if (data.success) {
                        setResult(data.generatedText);
                        setResultSyntaxName(data.syntaxName);
                    } else {
                        setError(data.error || '生成に失敗しました');
                    }
                } catch (error) {
                    console.error('Generation error:', error);
                    setError('サーバーエラーが発生しました');
                } finally {
                    setIsLoading(false);
                }
            };

            const handleCopy = async () => {
                try {
                    await navigator.clipboard.writeText(result);
                    alert('コピーしました');
                } catch (error) {
                    console.error('Copy failed:', error);
                    alert('コピーに失敗しました');
                }
            };

            const selectedSyntaxData = syntaxes.find(s => s.id === selectedSyntax);

            return (
                <div className="container">
                    <div className="header">
                        <h1>友Gemini真也構文</h1>
                        <p>文章を様々な構文で表現します</p>
                    </div>
                    
                    <div className="main-content">
                        {/* Step 1: 構文選択 */}
                        <div className="step">
                            <h2 className="step-title">
                                <span className="step-number">一</span>
                                構文を選択
                            </h2>
                            <div className="syntax-grid">
                                {syntaxes.map(syntax => (
                                    <div
                                        key={syntax.id}
                                        className={`syntax-card ${selectedSyntax === syntax.id ? 'selected' : ''}`}
                                        onClick={() => setSelectedSyntax(syntax.id)}
                                    >
                                        <div className="syntax-name">{syntax.name}</div>
                                        <div className="syntax-description">{syntax.description}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Step 2: 内容入力 */}
                        <div className="step">
                            <h2 className="step-title">
                                <span className="step-number">二</span>
                                内容を入力
                            </h2>
                            <div className="input-group">
                                <label className="input-label">表現したいこと、表現したい気持ち</label>
                                <textarea
                                    className="input-field"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="今日の出来事、感想、思いなどを自由にお書きください"
                                    rows="4"
                                />
                            </div>
                        </div>

                        {/* Step 2.5: カスタマイズ設定 */}
                        {selectedSyntaxData && (
                            <div className="settings-container">
                                <div className="settings-title">
                                    詳細設定
                                </div>
                                
                                {/* プリセット選択 */}
                                <div className="presets-container">
                                    <div className="presets-title">
                                        プリセット
                                    </div>
                                    <div className="presets-grid">
                                        {selectedSyntaxData.presets.map(preset => (
                                            <div
                                                key={preset.id}
                                                className={`preset-card ${selectedPreset === preset.id ? 'selected' : ''}`}
                                                onClick={() => handlePresetChange(preset.id)}
                                            >
                                                <div className="preset-name">{preset.name}</div>
                                                <div className="preset-description">{preset.description}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                
                                {/* 個別設定 */}
                                <div className="settings-grid">
                                    {selectedSyntaxData.settings.map(setting => (
                                        <div key={setting.id} className="setting-item">
                                            <label className="setting-label">{setting.name}</label>
                                            <select
                                                className="setting-select"
                                                value={settings[setting.id] || setting.default}
                                                onChange={(e) => handleSettingChange(setting.id, e.target.value)}
                                            >
                                                {setting.options.map(option => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Step 3: 生成 */}
                        <div className="step">
                            <h2 className="step-title">
                                <span className="step-number">三</span>
                                文章を生成
                            </h2>
                            <button
                                className="generate-btn"
                                onClick={handleGenerate}
                                disabled={isLoading || !selectedSyntax || !content.trim()}
                            >
                                {isLoading ? '生成中...' : '生成する'}
                            </button>
                        </div>

                        {/* エラー表示 */}
                        {error && (
                            <div className="error">
                                {error}
                            </div>
                        )}

                        {/* 結果表示 */}
                        {result && (
                            <div className="result-container">
                                <div className="result-title">
                                    生成された{resultSyntaxName}
                                </div>
                                <div className="result-text">
                                    {result}
                                </div>
                                <button className="copy-btn" onClick={handleCopy}>
                                    文章をコピー
                                </button>
                            </div>
                        )}
                    </div>
                    
                    <div className="footer">
                        Present for Y developed by T.H.
                    </div>
                </div>
            );
        }

        ReactDOM.render(<App />, document.getElementById('root'));
    </script>
</body>
</html>