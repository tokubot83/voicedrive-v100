import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 57問の質問データ
const stressCheckQuestions = {
  sectionA: {
    title: 'セクションA：仕事のストレス要因について',
    description: '最近1ヶ月間のあなたの仕事について、最もあてはまるものを選択してください。',
    questions: [
      '非常にたくさんの仕事をしなければならない',
      '時間内に仕事が処理しきれない',
      '一生懸命働かなければならない',
      'かなり注意を集中する必要がある',
      '高度の知識や技術が必要なむずかしい仕事だ',
      '勤務時間中はいつも仕事のことを考えていなければならない',
      'からだを大変よく使う仕事だ',
      '自分のペースで仕事ができる',
      '自分で仕事の順番・やり方を決めることができる',
      '職場の仕事の方針に自分の意見を反映できる',
      '自分の技能や知識を仕事で使うことが少ない',
      '私の部署内で意見のくい違いがある',
      '私の部署と他の部署とはうまが合わない',
      '私の職場の雰囲気は友好的である',
      '私の職場の作業環境（騒音、照明、温度、換気など）はよくない',
      '仕事の内容は自分にあっている',
      '働きがいのある仕事だ'
    ]
  },
  sectionB: {
    title: 'セクションB：心身のストレス反応について',
    description: '最近1ヶ月間のあなたの状態について、最もあてはまるものを選択してください。',
    questions: [
      '活気がわいてくる',
      '元気がいっぱいだ',
      '生き生きする',
      '怒りを感じる',
      '内心腹立たしい',
      'イライラしている',
      'ひどく疲れた',
      'へとへとだ',
      'だるい',
      '気がはりつめている',
      '不安だ',
      '落着かない',
      'ゆううつだ',
      '何をするのも面倒だ',
      '物事に集中できない',
      '気分が晴れない',
      '仕事が手につかない',
      '悲しいと感じる',
      'めまいがする',
      '体のふしぶしが痛む',
      '頭が重かったり頭痛がする',
      '首筋や肩がこる',
      '腰が痛い',
      '目が疲れる',
      '動悸や息切れがする',
      '胃腸の具合が悪い',
      '食欲がない',
      '便秘や下痢をする',
      'よく眠れない'
    ]
  },
  sectionC: {
    title: 'セクションC：周囲のサポートについて',
    description: 'あなたの周りの方々について、最もあてはまるものを選択してください。',
    questions: [
      '次の人たちはどのくらい気軽に話ができますか？（上司）',
      '次の人たちはどのくらい気軽に話ができますか？（職場の同僚）',
      '次の人たちはどのくらい気軽に話ができますか？（配偶者、家族、友人等）',
      'あなたが困った時、次の人たちはどのくらい頼りになりますか？（上司）',
      'あなたが困った時、次の人たちはどのくらい頼りになりますか？（職場の同僚）',
      'あなたが困った時、次の人たちはどのくらい頼りになりますか？（配偶者、家族、友人等）',
      'あなたの個人的な問題を相談したら、次の人たちはどのくらいきいてくれますか？（上司）',
      'あなたの個人的な問題を相談したら、次の人たちはどのくらいきいてくれますか？（職場の同僚）',
      'あなたの個人的な問題を相談したら、次の人たちはどのくらいきいてくれますか？（配偶者、家族、友人等）'
    ]
  },
  sectionD: {
    title: 'セクションD：満足度について',
    description: '現在の状況について、最もあてはまるものを選択してください。',
    questions: [
      '仕事に満足だ',
      '家庭生活に満足だ'
    ]
  }
};

const StressCheckDemoPage: React.FC = () => {
  const navigate = useNavigate();
  const [started, setStarted] = useState(false);
  const [currentSection, setCurrentSection] = useState('sectionA');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState('00:00');

  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1);

  const allQuestions = [
    ...stressCheckQuestions.sectionA.questions.map((q, i) => ({ section: 'sectionA', index: i, text: q })),
    ...stressCheckQuestions.sectionB.questions.map((q, i) => ({ section: 'sectionB', index: i, text: q })),
    ...stressCheckQuestions.sectionC.questions.map((q, i) => ({ section: 'sectionC', index: i, text: q })),
    ...stressCheckQuestions.sectionD.questions.map((q, i) => ({ section: 'sectionD', index: i, text: q }))
  ];

  const totalQuestions = allQuestions.length;
  const currentQuestion = allQuestions[currentQuestionNumber - 1];

  // タイマー更新
  useEffect(() => {
    if (started) {
      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        setElapsedTime(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [started, startTime]);

  const handleStart = () => {
    setStarted(true);
  };

  const handleAnswer = (value: number) => {
    const questionKey = `q${currentQuestionNumber}`;
    setAnswers({ ...answers, [questionKey]: value });
  };

  const handleNext = () => {
    const questionKey = `q${currentQuestionNumber}`;
    if (!answers[questionKey]) {
      alert('回答を選択してください。');
      return;
    }

    if (currentQuestionNumber < totalQuestions) {
      // 次の質問へ
      setCurrentQuestionNumber(currentQuestionNumber + 1);
      const nextQuestion = allQuestions[currentQuestionNumber]; // currentQuestionNumber は次の質問のインデックス
      setCurrentSection(nextQuestion.section);
      setCurrentQuestionIndex(nextQuestion.index);
    } else {
      // 完了
      handleComplete();
    }
  };

  const handleComplete = () => {
    alert('ストレスチェック（デモ）を完了しました。\n\n【デモ環境のお知らせ】\nこれはデモンストレーション用の実装です。\n実際の運用では、回答データは労働安全衛生法に基づき、\n実施事務従事者のみが取り扱い、\n結果は実施者（産業医等）が確認します。');
    navigate('/hr-announcements');
  };

  const handleBack = () => {
    if (currentQuestionNumber > 1) {
      setCurrentQuestionNumber(currentQuestionNumber - 1);
      const prevQuestion = allQuestions[currentQuestionNumber - 2];
      setCurrentSection(prevQuestion.section);
      setCurrentQuestionIndex(prevQuestion.index);
    }
  };

  const progress = (currentQuestionNumber / totalQuestions) * 100;

  if (!started) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 flex items-center justify-center p-4 stress-check-demo-page" style={{ marginTop: '-80px' }}>
        <div className="max-w-3xl w-full">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* ヘッダー */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-8 text-white">
              <h1 className="text-3xl font-bold mb-2">🏥 2025年度 ストレスチェック</h1>
              <p className="text-purple-100">厚生労働省版 職業性ストレス簡易調査票（57項目）</p>
            </div>

            {/* 法的説明 */}
            <div className="p-8">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-6">
                <h2 className="text-lg font-bold text-blue-900 mb-3">
                  📋 労働安全衛生法に基づく実施について
                </h2>
                <div className="text-sm text-blue-800 space-y-2">
                  <p>
                    • 本ストレスチェックは、労働安全衛生法第66条の10に基づき実施されます。
                  </p>
                  <p>
                    • 回答データは、労働安全衛生規則第52条の10～20の規定により厳格に管理されます。
                  </p>
                  <p>
                    • <strong>結果は実施者（産業医等）のみが確認</strong>し、本人の同意なく事業者に提供されません。
                  </p>
                  <p>
                    • 実施事務従事者は守秘義務を負い、違反した場合は刑事罰の対象となります。
                  </p>
                </div>
              </div>

              <div className="bg-green-50 border-l-4 border-green-500 p-6 mb-6">
                <h2 className="text-lg font-bold text-green-900 mb-3">
                  🔒 プライバシー保護について
                </h2>
                <div className="text-sm text-green-800 space-y-2">
                  <p>
                    • 個人の検査結果は、<strong>実施者と実施事務従事者のみ</strong>が取り扱います。
                  </p>
                  <p>
                    • 人事部門を含む事業者側は、個別の結果にアクセスできません。
                  </p>
                  <p>
                    • 集団分析結果のみが組織改善のために活用されます。
                  </p>
                  <p>
                    • データは暗号化され、5年間保存後に適切に廃棄されます。
                  </p>
                </div>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 mb-6">
                <h2 className="text-lg font-bold text-yellow-900 mb-3">
                  ⚠️ デモ環境のお知らせ
                </h2>
                <div className="text-sm text-yellow-800">
                  <p>
                    これは準備室メンバー向けのデモンストレーションです。
                    実際の運用では、職員カルテシステムと連携し、
                    より厳格なセキュリティ環境で実施されます。
                  </p>
                </div>
              </div>

              {/* 実施概要 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl mb-2">📝</div>
                  <div className="text-sm font-semibold text-gray-700">全57問</div>
                  <div className="text-xs text-gray-500">4つのセクション</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl mb-2">⏱️</div>
                  <div className="text-sm font-semibold text-gray-700">約10分</div>
                  <div className="text-xs text-gray-500">平均所要時間</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl mb-2">💾</div>
                  <div className="text-sm font-semibold text-gray-700">自動保存</div>
                  <div className="text-xs text-gray-500">中断・再開可能</div>
                </div>
              </div>

              {/* 開始ボタン */}
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => navigate('/hr-announcements')}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  戻る
                </button>
                <button
                  onClick={handleStart}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
                >
                  ストレスチェックを開始する
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 質問画面
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 stress-check-demo-page">
      <div className="max-w-4xl mx-auto p-4" style={{ marginTop: '-80px', paddingTop: '100px' }}>
        {/* ヘッダー */}
        <div className="bg-white rounded-t-2xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-800">ストレスチェック実施中</h1>
            <div className="flex items-center gap-2 text-gray-600">
              <span>⏱️</span>
              <span className="font-mono">{elapsedTime}</span>
            </div>
          </div>

          {/* プログレスバー */}
          <div className="mb-2">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>質問 {currentQuestionNumber} / {totalQuestions}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* セクション表示 */}
          <div className="text-sm text-purple-600 font-medium">
            {stressCheckQuestions[currentSection as keyof typeof stressCheckQuestions].title}
          </div>
        </div>

        {/* 質問カード */}
        <div className="bg-white shadow-lg p-8">
          <div className="mb-8">
            <div className="text-sm text-gray-500 mb-2">
              {stressCheckQuestions[currentSection as keyof typeof stressCheckQuestions].description}
            </div>
            <div className="text-xl font-medium text-gray-800">
              {currentQuestion?.text}
            </div>
          </div>

          {/* 回答選択肢 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { value: 1, label: 'そうだ', desc: '(1点)' },
              { value: 2, label: 'まあそうだ', desc: '(2点)' },
              { value: 3, label: 'ややちがう', desc: '(3点)' },
              { value: 4, label: 'ちがう', desc: '(4点)' }
            ].map(option => (
              <button
                key={option.value}
                onClick={() => handleAnswer(option.value)}
                className={`p-4 border-2 rounded-lg transition-all ${
                  answers[`q${currentQuestionNumber}`] === option.value
                    ? 'border-purple-500 bg-purple-100'
                    : 'border-gray-300 hover:border-purple-500 hover:bg-purple-50'
                }`}
              >
                <div className="font-medium text-gray-800">{option.label}</div>
                <div className="text-xs text-gray-500">{option.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* ナビゲーション */}
        <div className="bg-white rounded-b-2xl shadow-lg p-6">
          <div className="flex justify-between items-center">
            <button
              onClick={handleBack}
              disabled={currentQuestionNumber === 1}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                currentQuestionNumber === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              ← 前の質問
            </button>

            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500">
                <span className="text-green-600">✓ 自動保存済み</span>
              </div>

              <button
                onClick={handleNext}
                className={`px-6 py-3 rounded-lg font-medium transition-all transform ${
                  currentQuestionNumber === totalQuestions
                    ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5'
                    : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5'
                }`}
              >
                {currentQuestionNumber === totalQuestions ? '完了する' : '次の質問 →'}
              </button>
            </div>

            <button
              onClick={() => navigate('/hr-announcements')}
              className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
            >
              中断する
            </button>
          </div>
        </div>

        {/* デモ表示 */}
        <div className="mt-4 bg-yellow-100 border border-yellow-400 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>デモ環境：</strong>
            実際の運用では、このデータは労働安全衛生法に基づき、
            実施者（産業医等）と実施事務従事者のみが取り扱います。
          </p>
        </div>
      </div>
    </div>
  );
};

export default StressCheckDemoPage;