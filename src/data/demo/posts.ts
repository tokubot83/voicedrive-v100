import { Post, PostType, AnonymityLevel, Priority, VoteOption, Comment } from '../../types';
import { getDemoUserById } from './users';

// Helper function to generate comments that match the expected Comment interface
const generateComments = (postId: string, comments: Array<{
  userId: string;
  content: string;
  isAnonymous?: boolean;
  timestamp?: Date;
}>): Comment[] => {
  return comments.map((comment, index) => ({
    id: `comment-${postId}-${index + 1}`,
    postId: postId,
    content: comment.content,
    author: getDemoUserById(comment.userId) || {
      id: comment.userId,
      name: comment.isAnonymous ? '匿名' : '不明',
      department: '医療療養病棟',
      role: 'スタッフ'
    },
    commentType: 'support' as const,
    anonymityLevel: comment.isAnonymous ? 'anonymous' : 'real_name' as AnonymityLevel,
    privacyLevel: 'full' as const,
    timestamp: comment.timestamp || new Date(Date.now() - (comments.length - index) * 24 * 60 * 60 * 1000),
    likes: Math.floor(Math.random() * 10),
    hasLiked: false
  }));
};

// Helper function to generate votes in the correct format
const generateVoteRecord = (voteData: {
  stronglySupport: number;
  support: number;
  neutral: number;
  oppose: number;
  stronglyOppose: number;
}): Record<VoteOption, number> => {
  return {
    'strongly-support': voteData.stronglySupport,
    'support': voteData.support,
    'neutral': voteData.neutral,
    'oppose': voteData.oppose,
    'strongly-oppose': voteData.stronglyOppose
  };
};

export const demoPosts: Post[] = [
  // 1. 法人議題レベル（600点以上） - 理事会提出案件
  {
    id: 'post-1',
    type: 'improvement' as PostType,
    proposalType: 'innovation',
    filterCategory: 'voting',
    facilityScope: 'obara_hospital',
    departmentScope: '医療情報部',
    content: `全法人統一のAI問診システム導入提案

全法人3施設で現在バラバラの問診システムを使用していますが、統一システム導入で大幅な効率化とコスト削減が期待できます。

【現状の課題】
・3施設で異なるシステムを使用（維持費用の重複）
・患者情報の施設間連携が困難
・AI活用機能がなく、問診時間が長い
・システム更新タイミングがバラバラ

【提案内容】
1. 法人全体でAI問診システムを統一導入
2. 初期投資：約2,000万円（システム開発・導入費用）
3. 年間維持費：600万円（現在の3分の1に削減）
4. 問診時間を平圧30%短縮見込み
5. 患者満足度の向上

この投資は3年で回収可能で、将来的には大幅なコスト削減と医療の質向上が実現できます。`,
    author: {
      id: 'user-7',
      name: '渡辺 由美',
      department: '医療情報部',
      role: 'システムエンジニア',
      avatar: '/api/placeholder/150/150',
      permissionLevel: 5
    },
    anonymityLevel: 'real_name' as AnonymityLevel,
    priority: 'urgent' as Priority,
    timestamp: new Date('2025-01-15T10:00:00'),
    votes: generateVoteRecord({
      stronglySupport: 45,
      support: 32,
      neutral: 8,
      oppose: 3,
      stronglyOppose: 1
    }),
    comments: generateComments('post-1', [
      {
        userId: 'user-4',
        content: '経営企画部でも同様の問題意識を持っていました。法人全体での統一は必須ですね。理事会への提出を支持します。'
      },
      {
        userId: 'user-9',
        content: '小原病院でもシステム更新を検討していたので、統一システムはありがたいです。'
      },
      {
        userId: 'user-3',
        content: '立神リハビリテーション温泉病院のシステム担当です。AI機能の導入で、リハビリ計画の立案も効率化できそうです。'
      },
      {
        userId: 'user-8',
        content: '初期投資は大きいですが、長期的に見ればコスト削減効果は明らかですね。理事会での承認を期待します。'
      },
      {
        userId: 'user-10',
        content: '患者様にとっても、待ち時間短縮は大きなメリットです。是非実現してほしいです。'
      }
    ]),
    // 法人議題レベル（スコア650点相当）
    committeeStatus: 'committee_submitted' as const,
    committeeInfo: {
      committees: ['病院運営委員会', '情報システム委員会'],
      submissionDate: new Date('2025-01-10'),
      submittedBy: {
        id: 'user-admin-1',
        name: '山田院長',
        permissionLevel: 15
      },
      note: '理事会への上申準備中'
    }
  },

  // 2. 施設議題レベル（100-299点） - 委員会提出可能
  {
    id: 'post-2',
    type: 'improvement' as PostType,
    proposalType: 'operational',
    filterCategory: 'facility',
    facilityScope: 'obara_hospital',
    departmentScope: '看護部',
    content: `看護職員の勤務シフト最適化システム導入

現在、看護部では紙ベースのシフト管理を行っており、毎月のシフト作成に多大な時間を要しています。

【現状の課題】
・シフト作成に毎月3日間程度かかる
・急な欠勤・休暇への対応が困難
・スタッフのスキル・資格を考慮した配置が難しい
・労働基準法の遵守確認が手作業

【提案内容】
1. AI活用シフト作成システムの導入
2. スタッフの希望、スキル、資格を自動考慮
3. 労働基準法チェック機能搭載
4. スマホでのシフト確認・変更申請機能

導入費用約300万円で、年間400時間以上の業務時間削減が見込まれます。`,
    author: {
      id: 'user-6',
      name: '伊藤 麻衣',
      department: '看護部',
      role: '看護師長',
      avatar: '/api/placeholder/150/150',
      permissionLevel: 8
    },
    anonymityLevel: 'real_name' as AnonymityLevel,
    priority: 'high' as Priority,
    timestamp: new Date('2025-01-10T14:30:00'),
    votes: generateVoteRecord({
      stronglySupport: 18,
      support: 14,
      neutral: 5,
      oppose: 2,
      stronglyOppose: 0
    }),
    comments: generateComments('post-2', [
      {
        userId: 'user-3',
        content: '看護部以外の部門でも同様の課題があります。病院全体で導入を検討してほしいです。'
      },
      {
        userId: 'user-5',
        content: 'シフト作成の負担が減れば、患者様へのケアにもっと時間をかけられます。'
      },
      {
        userId: 'user-4',
        content: '委員会での検討を提案します。業務改善委員会で取り上げるべき重要案件です。'
      }
    ]),
    // 施設議題レベル（スコア150点相当）
    committeeStatus: 'under_review' as const
  },

  // 3. 部署議題レベル（50-99点）
  {
    id: 'post-3',
    type: 'improvement' as PostType,
    proposalType: 'operational',
    filterCategory: 'department',
    facilityScope: 'obara_hospital',
    departmentScope: '事務部',
    content: `請求業務のRPA化による効率改善

毎月のレセプト請求業務に多くの時間がかかっており、月末月初の残業が常態化しています。

【現状の課題】
・レセプト点数計算に1件あたり5分
・月間約2000件の処理が必要
・入力ミスによる返戻が月数50件程度

【提案内容】
1. RPAツール導入で定型業務を自動化
2. 点数計算・チェックの自動化
3. エラー検出機能の実装

導入費用約50万円で、月隓40時間の業務時間削減が期待できます。`,
    author: {
      id: 'user-8',
      name: '中村 さゆり',
      department: '事務部',
      role: '医事課主任',
      avatar: '/api/placeholder/150/150',
      permissionLevel: 4
    },
    anonymityLevel: 'real_name' as AnonymityLevel,
    priority: 'medium' as Priority,
    timestamp: new Date('2025-01-12T09:15:00'),
    votes: generateVoteRecord({
      stronglySupport: 5,
      support: 8,
      neutral: 3,
      oppose: 1,
      stronglyOppose: 0
    }),
    comments: generateComments('post-3', [
      {
        userId: 'user-9',
        content: '事務部全体の問題ですね。RPA導入は必須だと思います。'
      },
      {
        userId: 'user-4',
        content: '初期費用はかかりますが、残業削減効果を考えれば十分ペイしますね。'
      },
      {
        userId: 'user-6',
        content: '部門内での合意が得られれば、予算申請を検討します。'
      }
    ]),
    // 部署議題レベル（スコア65点相当）
  },

  // 4. 部署検討レベル（30-49点）
  {
    id: 'post-4',
    type: 'improvement' as PostType,
    proposalType: 'operational',
    filterCategory: 'department',
    facilityScope: 'obara_hospital',
    departmentScope: '外来',
    content: `外来待合室の混雑緩和対策

午前中の外来が非常に混雑し、患者様から苦情が寄せられています。

【現状の課題】
・午前9-11時に患者が集中
・待ち時間が最大90分を超える
・待合室の座席不足
・スタッフの精神的負担増

【提案内容】
1. 予約時間枠の細分化（15分単位→
10分単位）
2. ウェブ予約システムの導入
3. 待ち時間表示モニターの設置
4. 混雑状況リアルタイム配信

これらの対策で患者満足度の向上とスタッフの負担軽減が期待できます。`,
    author: {
      id: 'user-4',
      name: '田中 恵子',
      department: '外来',
      role: '外来看護師長',
      avatar: '/api/placeholder/150/150',
      permissionLevel: 3
    },
    anonymityLevel: 'real_name' as AnonymityLevel,
    priority: 'medium' as Priority,
    timestamp: new Date('2025-01-08T16:45:00'),
    votes: generateVoteRecord({
      stronglySupport: 3,
      support: 4,
      neutral: 2,
      oppose: 1,
      stronglyOppose: 0
    }),
    comments: generateComments('post-4', [
      {
        userId: 'user-6',
        content: '予約システムの導入は大賛成です。患者様の利便性も向上します。'
      },
      {
        userId: 'user-3',
        content: '待ち時間表示だけでもストレスが減ると思います。ぜひ実現したいですね。'
      }
    ]),
    // 部署検討レベル（スコア35点相当）
  },

  // 5. 検討中レベル（0-29点）
  {
    id: 'post-5',
    type: 'improvement' as PostType,
    proposalType: 'operational',
    filterCategory: 'department',
    facilityScope: 'obara_hospital',
    departmentScope: '医療情報部',
    content: `カルテ記載テンプレートの改善提案

電子カルテの記載テンプレートが使いにくいとの声があります。

【問題点】
・疾患別のテンプレートが不足
・入力項目が多すぎる
・表示が見づらい

【提案】
1. よく使う疾患のテンプレート追加
2. 必須項目を明確化
3. UIの改善

まずは部署内で話し合ってみたいと思います。`,
    author: {
      id: 'user-5',
      name: '高橋 真理',
      department: '医療情報部',
      role: 'システム担当',
      avatar: '/api/placeholder/150/150',
      permissionLevel: 2
    },
    anonymityLevel: 'real_name' as AnonymityLevel,
    priority: 'low' as Priority,
    timestamp: new Date('2025-01-11T11:00:00'),
    votes: generateVoteRecord({
      stronglySupport: 1,
      support: 2,
      neutral: 2,
      oppose: 0,
      stronglyOppose: 0
    }),
    comments: generateComments('post-5', [
      {
        userId: 'user-7',
        content: '私も同じことを感じていました。部署内で話し合いましょう。'
      },
      {
        userId: 'user-6',
        content: 'テンプレート改善は業務効率に直結しますね。'
      }
    ]),
    // 検討中レベル（スコア18点相当）
  },

  // 6. 法人検討レベル（300-599点）
  {
    id: 'post-6',
    type: 'improvement' as PostType,
    proposalType: 'innovation',
    filterCategory: 'corporation',
    facilityScope: 'all',
    departmentScope: 'all',
    content: `全法人統一の職員評価制度改革

現在の職員評価制度について、法人全体で根本的な見直しが必要です。

【現状の課題】
・年功序列型が主体で若手のモチベーション低下
・評価基準が不明確で不公平感がある
・スキルアップへのインセンティブ不足
・部署間での評価格差

【提案内容】
1. コンピテンシー評価制度の導入
2. 360度フィードバックの実施
3. 目標管理制度の導入
4. キャリアパスの明確化

これにより、職員満足度の向上と定着率改善が期待できます。`,
    author: {
      id: 'user-11',
      name: '立神 太郎',
      department: '経営企画部',
      role: '理事',
      avatar: '/api/placeholder/150/150',
      permissionLevel: 12
    },
    anonymityLevel: 'real_name' as AnonymityLevel,
    priority: 'high' as Priority,
    timestamp: new Date('2025-01-05T13:20:00'),
    votes: generateVoteRecord({
      stronglySupport: 28,
      support: 22,
      neutral: 8,
      oppose: 3,
      stronglyOppose: 1
    }),
    comments: generateComments('post-6', [
      {
        userId: 'user-4',
        content: '人事評価制度の改革は組織全体の活性化につながりますね。'
      },
      {
        userId: 'user-3',
        content: '特に若手職員のモチベーション向上は急務です。全面的に支持します。'
      },
      {
        userId: 'user-8',
        content: '360度評価は公平性が高まりそうで良いですね。'
      }
    ]),
    // 法人検討レベル（スコア380点相当）
  },

  // 7. フリーボイス（改善提案以外）
  {
    id: 'post-7',
    type: 'community' as PostType,
    filterCategory: 'all',
    facilityScope: 'obara_hospital',
    departmentScope: '外来',
    content: `最近、患者様から「外来のスタッフが親切になった」というお褒めの言葉をいただきました！

みんなで取り組んだ「笑顔で挨拶キャンペーン」の成果が出ているようで、とても嬉しいです。

これからも患者様に寄り添った対応を心がけていきましょう！`,
    author: {
      id: 'user-2',
      name: '佐藤 花子',
      department: '外来',
      role: '看護師',
      avatar: '/api/placeholder/150/150',
      permissionLevel: 2
    },
    anonymityLevel: 'real_name' as AnonymityLevel,
    timestamp: new Date('2025-01-14T09:00:00'),
    comments: generateComments('post-7', [
      {
        userId: 'user-3',
        content: '素晴らしい！みんなの努力が実を結びましたね。'
      },
      {
        userId: 'user-4',
        content: '患者様からのお褒めの言葉が一番のご褒美ですね！'
      }
    ])
  },

  // 8. コンプライアンス窓口
  {
    id: 'post-8',
    type: 'report' as PostType,
    filterCategory: 'all',
    facilityScope: 'obara_hospital',
    departmentScope: '匿療情報部',
    content: `患者情報の取り扱いに関する注意喚起

最近、患者情報の取り扱いに関するインシデントが発生しました。

【事例】
・メモ用紙をデスクに放置したまま離席
・患者名が見える状態でパソコンを放置
・共用スペースでの患者情報に関する会話

【対策】
1. クリアデスクの徹底
2. パソコンのロック習慣化
3. 情報セキュリティ研修の実施

全職員で情報管理の重要性を再確認しましょう。`,
    author: {
      id: 'user-13',
      name: '匿名',
      department: '医療情報部',
      role: 'スタッフ',
      avatar: '/api/placeholder/150/150',
      permissionLevel: 1
    },
    anonymityLevel: 'anonymous' as AnonymityLevel,
    priority: 'urgent' as Priority,
    timestamp: new Date('2025-01-14T15:00:00'),
    comments: generateComments('post-8', [
      {
        userId: 'user-12',
        content: '情報管理の徹底は重要ですね。全員で意識を高めましょう。'
      }
    ])
  },

  // === 小原病院看護部デモ投稿 ===
  
  // 9. 夜勤看護師の安全対策強化（看護部長からの提案）
  {
    id: 'kohara-post-1',
    type: 'improvement' as PostType,
    proposalType: 'safety',
    filterCategory: 'voting', // 投票対象
    facilityScope: 'kohara_hospital',
    departmentScope: '看護部',
    content: `夜勤看護師の安全対策強化についてのご提案

小原病院看護部長の田中です。近年、全国的に医療施設での夜勤時のインシデント発生が課題視されており、当院でも予防的な対策を強化したいと考えております。

【現状の課題】
・夜勤時間帯（22時～翌朝6時）での緊急対応時の人員配置が手薄
・一人夜勤業務での孤立感とストレス
・緊急時の迅速な連絡体制の見直し必要

【提案内容】
1. 夜勤看護師向けの緊急通報システム導入（ナースコール連動型）
2. 夜勤時の複数名体制への段階的移行（各病棟最低2名配置）
3. 月1回の夜勤時安全研修の実施
4. 夜勤専従看護師の処遇改善（夜勤手当見直し）

患者様の安全と職員の働きやすさの両立を目指し、ご検討いただければと思います。`,
    author: {
      id: 'kohara-nursing-director',
      name: '田中 美津子',
      department: '看護部',
      role: '看護部長',
      avatar: '/api/placeholder/150/150'
    },
    anonymityLevel: 'real_name' as AnonymityLevel,
    priority: 'high' as Priority,
    timestamp: new Date('2025-06-10T09:00:00'),
    votes: generateVoteRecord({
      stronglySupport: 8,
      support: 4,
      neutral: 1,
      oppose: 0,
      stronglyOppose: 0
    }),
    comments: generateComments('kohara-post-1', [
      {
        userId: 'kohara-3f-head',
        content: '3階病棟師長として、この提案を全面支持いたします。夜勤時の緊急対応で不安を感じることが多々あります。'
      },
      {
        userId: 'kohara-4f-nurse',
        content: '現場の看護師として、夜勤の複数名体制は本当に助かります。患者様にもより良いケアが提供できると思います。'
      },
      {
        userId: 'kohara-5f-supervisor',
        content: '夜勤専従の処遇改善も含まれており、現実的で包括的な提案だと感じます。ぜひ実現させたいです。'
      }
    ]),
    projectStatus: {
      stage: 'ready' as const,
      score: 85,
      threshold: 100,
      progress: 70
    },
    votingDeadline: new Date('2025-06-30T23:59:59'),
    eligibleVoters: 21,
    voteBreakdown: {
      agree: 13,
      disagree: 0,
      hold: 1
    }
  },

  // 10. 病棟間看護師交流研修プログラム（3階病棟師長提案）
  {
    id: 'kohara-post-2',
    type: 'improvement' as PostType,
    proposalType: 'training',
    filterCategory: 'facility', // 施設内共有
    facilityScope: 'kohara_hospital',
    departmentScope: '3階病棟',
    content: `病棟間看護師交流研修プログラムの導入提案

3階病棟師長の加藤です。各病棟の特性を活かした看護技術の共有と、看護師のスキルアップを目的とした研修プログラムを提案いたします。

【背景】
・各病棟で蓄積された専門知識や技術の共有不足
・看護師のキャリア開発機会の拡充必要
・病棟間の連携強化による患者ケアの質向上

【プログラム内容】
1. 月1回の病棟間ローテーション研修（半日程度）
2. 各病棟の特色ある看護技術の発表会（四半期毎）
3. 新人看護師向けの病棟見学プログラム
4. ベテラン看護師による指導技術の共有

【期待される効果】
・看護技術の標準化と向上
・職員のモチベーション向上
・病棟間のコミュニケーション強化

皆様のご意見をお聞かせください。`,
    author: {
      id: 'kohara-3f-head',
      name: '加藤 理恵',
      department: '3階病棟',
      role: '3階病棟師長',
      avatar: '/api/placeholder/150/150'
    },
    anonymityLevel: 'real_name' as AnonymityLevel,
    priority: 'medium' as Priority,
    timestamp: new Date('2025-06-08T14:30:00'),
    votes: generateVoteRecord({
      stronglySupport: 5,
      support: 7,
      neutral: 2,
      oppose: 0,
      stronglyOppose: 0
    }),
    comments: generateComments('kohara-post-2', [
      {
        userId: 'kohara-education-director',
        content: '教育師長として、この提案は非常に有意義だと思います。教育プログラムとの連携も検討させていただきます。'
      },
      {
        userId: 'kohara-5f-head',
        content: '5階病棟でも似たような課題を感じていました。是非、連携して進めていきましょう。'
      },
      {
        userId: 'kohara-outpatient-nurse',
        content: '外来でも参考になる内容が多そうです。病棟見学をさせていただきたいです。'
      }
    ]),
    projectStatus: {
      stage: 'planning' as const,
      score: 78,
      threshold: 85,
      progress: 60
    },
    votingDeadline: new Date('2025-06-25T23:59:59'),
    eligibleVoters: 18,
    voteBreakdown: {
      agree: 12,
      disagree: 0,
      hold: 2
    }
  },

  // 11. 透析室での患者教育資材の充実（透析室主任提案）
  {
    id: 'kohara-post-3',
    type: 'resource_request' as PostType,
    proposalType: 'equipment',
    filterCategory: 'voting', // 投票対象
    facilityScope: 'kohara_hospital',
    departmentScope: '人工透析室',
    content: `透析患者様向け教育資材の充実についてのお願い

人工透析室主任の藤田です。透析患者様へのより効果的な療養指導のため、教育資材の充実をお願いしたく提案いたします。

【現状の課題】
・既存の教育パンフレットが古く、内容更新が必要
・視覚的で分かりやすい説明資料の不足
・患者様の年齢層に応じた教材の必要性

【要求資材】
1. デジタル教育用タブレット（3台）
2. 透析の仕組み説明用3Dモデル
3. 食事指導用食品サンプルセット
4. 血管アクセス管理指導用教材

【予算見積】
・デジタル教材システム：約150,000円
・実物教材セット：約80,000円
・年次更新費用：約30,000円

【期待される効果】
・患者様の透析に対する理解度向上
・セルフケア能力の向上
・医療事故の予防

透析患者様の QOL 向上のため、ご検討のほどよろしくお願いいたします。`,
    author: {
      id: 'kohara-dialysis-supervisor',
      name: '藤田 千代',
      department: '人工透析室',
      role: '透析室主任',
      avatar: '/api/placeholder/150/150'
    },
    anonymityLevel: 'real_name' as AnonymityLevel,
    priority: 'medium' as Priority,
    timestamp: new Date('2025-06-07T11:15:00'),
    votes: generateVoteRecord({
      stronglySupport: 6,
      support: 3,
      neutral: 1,
      oppose: 0,
      stronglyOppose: 0
    }),
    comments: generateComments('kohara-post-3', [
      {
        userId: 'kohara-nursing-director',
        content: '患者教育の重要性を考慮し、前向きに検討いたします。予算計画に組み込んで参ります。'
      },
      {
        userId: 'kohara-dialysis-nurse',
        content: '現場で患者様から「もっと分かりやすい説明がほしい」との声をよく聞きます。この提案に賛成です。'
      }
    ]),
    projectStatus: {
      stage: 'ready' as const,
      score: 92,
      threshold: 100,
      progress: 80
    },
    votingDeadline: new Date('2025-06-28T23:59:59'),
    eligibleVoters: 12,
    voteBreakdown: {
      agree: 10,
      disagree: 0,
      hold: 1
    }
  },

  // 12. 外来待ち時間短縮のための予約システム改善（外来師長提案）
  {
    id: 'kohara-post-4',
    type: 'improvement' as PostType,
    proposalType: 'system',
    filterCategory: 'facility', // 施設内共有
    facilityScope: 'kohara_hospital',
    departmentScope: '外来',
    content: `外来患者様の待ち時間短縮のための予約システム改善提案

外来師長の高橋です。外来の予約システム改善により、患者様の満足度向上と効率的な外来運営を目指したいと思います。

【現状の問題点】
・予約時間に大幅な遅れが発生（平均30-60分遅延）
・患者様からの苦情が月平均15件
・看護師の説明・謝罪対応時間の増加

【改善提案】
1. リアルタイム予約状況表示システムの導入
2. 診察予約の15分間隔制への変更（現在30分間隔）
3. 患者様向けスマートフォンアプリでの待ち時間通知
4. 緊急患者対応時の予約調整プロトコル策定

【導入効果予測】
・待ち時間20%短縮
・患者満足度調査スコア向上
・スタッフの負担軽減

【導入コスト】
・システム改修費：約300,000円
・月額運用費：約15,000円

患者様により良い医療サービスを提供するため、ご協力をお願いいたします。`,
    author: {
      id: 'kohara-outpatient-head',
      name: '高橋 愛子',
      department: '外来',
      role: '外来師長',
      avatar: '/api/placeholder/150/150'
    },
    anonymityLevel: 'real_name' as AnonymityLevel,
    priority: 'high' as Priority,
    timestamp: new Date('2025-06-06T16:45:00'),
    votes: generateVoteRecord({
      stronglySupport: 4,
      support: 8,
      neutral: 1,
      oppose: 1,
      stronglyOppose: 0
    }),
    comments: generateComments('kohara-post-4', [
      {
        userId: 'kohara-outpatient-supervisor',
        content: '外来主任として、現場の実情をよく把握された提案だと思います。患者様対応がより円滑になることを期待します。'
      },
      {
        userId: 'kohara-nursing-director',
        content: 'システム導入には予算が必要ですが、患者満足度向上は重要な課題です。段階的な導入を検討いたします。'
      },
      {
        userId: 'kohara-outpatient-nurse',
        content: '現場で患者様の待ち時間の長さを日々感じています。改善されることを切に願います。'
      }
    ]),
    projectStatus: {
      stage: 'planning' as const,
      score: 73,
      threshold: 85,
      progress: 55
    },
    votingDeadline: new Date('2025-06-25T23:59:59'),
    eligibleVoters: 16,
    voteBreakdown: {
      agree: 12,
      disagree: 1,
      hold: 1
    }
  },

  // 13. 手術室看護師のスキルアップ研修（手術室主任提案）
  {
    id: 'kohara-post-5',
    type: 'training_request' as PostType,
    proposalType: 'training',
    filterCategory: 'voting', // 投票対象
    facilityScope: 'kohara_hospital',
    departmentScope: '中材手術室',
    content: `手術室看護師向け専門研修の実施について

手術室主任の石井です。手術室看護師の専門性向上のため、外部研修への参加と院内研修の充実を提案いたします。

【現状の課題】
・新しい手術器械・技術への対応遅れ
・緊急手術時の対応スキル不足
・感染管理の最新ガイドライン対応

【研修計画】
1. 外部研修参加（年2回）
   - 手術看護学会セミナー
   - 器械管理技術研修
2. 院内研修の充実（月1回）
   - 緊急手術対応シミュレーション
   - 感染管理プロトコル確認
3. 他施設見学研修（年1回）

【予算要求】
・外部研修参加費：年間150,000円
・教材・機材費：80,000円
・見学研修旅費：50,000円

【期待される効果】
・手術の安全性向上
・チーム医療の質向上
・職員のモチベーション向上

手術室の更なる安全性確保のため、ご理解とご支援をお願いいたします。`,
    author: {
      id: 'kohara-or-supervisor',
      name: '石井 優子',
      department: '中材手術室',
      role: '手術室主任',
      avatar: '/api/placeholder/150/150'
    },
    anonymityLevel: 'real_name' as AnonymityLevel,
    priority: 'high' as Priority,
    timestamp: new Date('2025-06-05T13:20:00'),
    votes: generateVoteRecord({
      stronglySupport: 7,
      support: 2,
      neutral: 0,
      oppose: 0,
      stronglyOppose: 0
    }),
    comments: generateComments('kohara-post-5', [
      {
        userId: 'kohara-or-nurse',
        content: '手術室看護師として、専門性を高める機会をいただけるのは大変ありがたいです。最新の知識・技術を学んでいきたいです。'
      },
      {
        userId: 'kohara-education-director',
        content: '教育師長として、専門研修は非常に重要だと考えます。看護部全体の教育計画との調整を図りながら進めさせていただきます。'
      },
      {
        userId: 'kohara-nursing-director',
        content: '手術室の安全性は病院全体の信頼に関わります。研修予算の確保に向けて調整いたします。'
      }
    ]),
    projectStatus: {
      stage: 'ready' as const,
      score: 98,
      threshold: 100,
      progress: 90
    },
    votingDeadline: new Date('2025-06-27T23:59:59'),
    eligibleVoters: 11,
    voteBreakdown: {
      agree: 9,
      disagree: 0,
      hold: 0
    }
  },

  // 14. 看護補助者の業務範囲明確化（4階病棟主任提案）
  {
    id: 'kohara-post-6',
    type: 'policy_proposal' as PostType,
    proposalType: 'operational',
    filterCategory: 'facility', // 施設内共有
    facilityScope: 'kohara_hospital',
    departmentScope: '4階病棟',
    content: `看護補助者の業務範囲明確化について

4階病棟主任の山口です。看護補助者の業務範囲を明確化し、より安全で効率的な病棟業務を実現したいと思います。

【現状の問題】
・看護補助者の業務範囲があいまい
・看護師との役割分担が不明確
・業務上の責任の所在が曖昧

【明確化提案】
◆看護補助者が実施可能な業務
1. 患者移送・体位変換
2. 病室・共用部清掃
3. 食事配膳・下膳
4. リネン交換
5. 物品補充・整理

◆看護師のみが実施する業務
1. バイタルサイン測定
2. 薬剤に関する業務
3. 医療器具の操作
4. 患者・家族への説明

【導入効果】
・業務の明確化による安全性向上
・職員の役割意識向上
・効率的な人員配置

【実施方法】
1. 業務分担表の作成・配布
2. 全職員向け説明会開催
3. 1ヶ月間の試験運用
4. 課題検討・修正

チームワーク向上のため、皆様のご意見をお聞かせください。`,
    author: {
      id: 'kohara-4f-supervisor',
      name: '山口 里美',
      department: '4階病棟',
      role: '4階病棟主任',
      avatar: '/api/placeholder/150/150'
    },
    anonymityLevel: 'real_name' as AnonymityLevel,
    priority: 'medium' as Priority,
    timestamp: new Date('2025-06-04T10:30:00'),
    votes: generateVoteRecord({
      stronglySupport: 3,
      support: 6,
      neutral: 3,
      oppose: 1,
      stronglyOppose: 0
    }),
    comments: generateComments('kohara-post-6', [
      {
        userId: 'kohara-4f-nurse',
        content: '業務分担が明確になることで、お互いの立場を尊重した協働ができると思います。'
      },
      {
        userId: 'kohara-4f-assistant',
        content: '看護補助者として、自分の役割がはっきりすることで、より責任を持って業務に取り組めます。'
      },
      {
        userId: 'kohara-3f-supervisor',
        content: '3階病棟でも同様の課題があります。参考にさせていただきたいです。'
      }
    ]),
    projectStatus: {
      stage: 'planning' as const,
      score: 65,
      threshold: 75,
      progress: 45
    },
    votingDeadline: new Date('2025-06-22T23:59:59'),
    eligibleVoters: 14,
    voteBreakdown: {
      agree: 9,
      disagree: 1,
      hold: 3
    }
  }
];

// Export helper functions
export const getDemoPostById = (id: string): Post | undefined => {
  return demoPosts.find(post => post.id === id);
};

export const getDemoPostsByType = (type: PostType): Post[] => {
  return demoPosts.filter(post => post.type === type);
};

export const getDemoPostsByDepartment = (department: string): Post[] => {
  return demoPosts.filter(post => post.author.department === department);
};

// 新しいフィルター対応のヘルパー関数
export const getDemoPostsByFilter = (filter: 'voting' | 'facility' | 'all', userFacilityId: string = 'tategami_hospital'): Post[] => {
  switch (filter) {
    case 'voting':
      return demoPosts.filter(post => 
        post.filterCategory === 'voting' ||
        (post.votingDeadline && post.votingDeadline > new Date()) ||
        (post.projectStatus?.stage === 'ready')
      );
    case 'facility':
      return demoPosts.filter(post => 
        post.filterCategory === 'facility' && 
        post.facilityScope === userFacilityId
      );
    case 'all':
      return demoPosts.filter(post => 
        post.filterCategory === 'all' || 
        post.facilityScope === 'all' ||
        post.facilityScope !== userFacilityId ||
        post.filterCategory === undefined // 既存投稿の後方互換性
      );
    default:
      return demoPosts;
  }
};

export { demoPosts as posts };
export default demoPosts;