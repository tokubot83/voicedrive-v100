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
  // 1. 非常勤職員の慶弔休暇制度（施設内投票フェーズ）
  {
    id: 'post-1',
    type: 'improvement' as PostType,
    proposalType: 'operational',
    filterCategory: 'voting', // 投票対象
    facilityScope: 'tategami_hospital',
    departmentScope: '医療療養病棟',
    content: `非常勤職員の慶弔休暇取得制度の導入提案

現在、非常勤職員には慶弔休暇の制度がありません。実際の現場では、非常勤職員が常勤職員に気を使って、親族の葬儀等でも通常の欠勤扱いで休暇を取得している状況が見受けられます。

【現状の課題】
・非常勤職員が慶弔時に有給休暇を使用するか、欠勤扱いになる
・常勤職員との待遇差により、職場の一体感が損なわれる
・優秀な非常勤職員の定着率に影響

【提案内容】
1. 非常勤職員にも慶弔休暇制度を適用
2. 適用範囲：配偶者、子、父母の死亡時（3日間）
3. 勤続6ヶ月以上の非常勤職員を対象

この提案により、全ての職員が安心して働ける環境を整備できると考えます。`,
    author: {
      id: 'user-7',
      name: '渡辺 由美',
      department: '医療療養病棟',
      role: '看護師（非常勤）',
      avatar: '/api/placeholder/150/150'
    },
    anonymityLevel: 'real_name' as AnonymityLevel,
    priority: 'high' as Priority,
    timestamp: new Date('2025-05-15T10:00:00'),
    votes: generateVoteRecord({
      stronglySupport: 6,
      support: 2,
      neutral: 0,
      oppose: 0,
      stronglyOppose: 0
    }),
    comments: generateComments('post-1', [
      {
        userId: 'user-4',
        content: '現場の声を形にしてくださり、ありがとうございます。看護主任として、この提案を全面的に支持します。実際に非常勤の方が遠慮されている場面を何度も見てきました。'
      },
      {
        userId: 'user-9',
        content: '非常勤の立場から、本当にありがたい提案です。先月、祖母が亡くなった際も有給を使いました。常勤の方に申し訳なくて...',
        isAnonymous: true
      },
      {
        userId: 'user-3',
        content: '病棟師長として、この提案の重要性を認識しています。人事部門と協議を進めており、前向きな検討をいただいています。'
      },
      {
        userId: 'user-8',
        content: '私も非常勤から常勤になりましたが、当時はとても苦労しました。後輩たちのためにも実現してほしいです。'
      }
    ]),
    projectStatus: {
      stage: 'ready' as const,
      score: 180,
      threshold: 150,
      progress: 85
    },
    projectId: 'proj-1',
    votingDeadline: new Date('2025-06-30T23:59:59'),
    eligibleVoters: 10,
    voteBreakdown: {
      agree: 8,
      disagree: 0,
      hold: 0
    }
  },

  // 2. 委員会運営の効率化提案
  {
    id: 'post-2',
    type: 'improvement' as PostType,
    proposalType: 'innovation',
    filterCategory: 'facility', // 施設内投稿
    facilityScope: 'tategami_hospital',
    departmentScope: '医療療養病棟',
    content: `各種委員会の運営方法見直しによる業務効率化

当院では医療安全、感染対策、褥瘡対策など多数の委員会が運営されていますが、会議時間の長期化や資料作成の負担が課題となっています。

【現状の問題点】
・月1回の定例会議が2時間以上かかることが多い
・紙資料の印刷・配布に時間がかかる
・議事録作成に担当者が残業している
・決定事項の周知に時間差がある

【改善提案】
1. オンライン会議システムの活用（現場から参加可能に）
2. 資料の電子化と事前共有システムの導入
3. 議事録のテンプレート化と音声記録の活用
4. 決定事項の院内ポータルでの即時共有

これにより、月間約20時間の業務時間削減が見込まれます。`,
    author: {
      id: 'user-6',
      name: '伊藤 麻衣',
      department: '医療療養病棟',
      role: '看護師',
      avatar: '/api/placeholder/150/150'
    },
    anonymityLevel: 'real_name' as AnonymityLevel,
    priority: 'medium' as Priority,
    timestamp: new Date('2025-06-10T14:30:00'),
    votes: generateVoteRecord({
      stronglySupport: 4,
      support: 3,
      neutral: 1,
      oppose: 0,
      stronglyOppose: 0
    }),
    comments: generateComments('post-2', [
      {
        userId: 'user-3',
        content: '素晴らしい提案です。特に音声記録の活用は、議事録作成の負担を大幅に軽減できそうですね。'
      },
      {
        userId: 'user-5',
        content: 'オンライン参加ができれば、病棟を離れられない時でも参加できます。ぜひ実現してほしいです。'
      }
    ]),
    projectStatus: {
      stage: 'approaching' as const,
      score: 95,
      threshold: 100,
      progress: 65
    },
    projectId: 'proj-3'
  },

  // 3. 休憩室の環境改善
  {
    id: 'post-3',
    type: 'improvement' as PostType,
    proposalType: 'operational',
    filterCategory: 'facility', // 施設内投稿
    facilityScope: 'tategami_hospital',
    departmentScope: '医療療養病棟',
    content: `職員休憩室の環境改善について

療養病棟の休憩室が手狭で、昼食時に座れないスタッフがいます。

【提案】
・休憩時間の分散化（11:30〜、12:00〜、12:30〜の3グループ制）
・立ち食いカウンターの設置
・休憩室の換気扇増設

快適な休憩は午後の業務効率にも影響します。ご検討をお願いします。`,
    author: {
      id: 'user-8',
      name: '中村 さゆり',
      department: '医療療養病棟',
      role: '介護看護補助者',
      avatar: '/api/placeholder/150/150'
    },
    anonymityLevel: 'real_name' as AnonymityLevel,
    priority: 'low' as Priority,
    timestamp: new Date('2025-06-12T09:15:00'),
    votes: generateVoteRecord({
      stronglySupport: 2,
      support: 4,
      neutral: 2,
      oppose: 0,
      stronglyOppose: 0
    }),
    comments: generateComments('post-3', [
      {
        userId: 'user-9',
        content: '私も同感です。特に金曜日は人が多くて大変です。',
        isAnonymous: true
      },
      {
        userId: 'user-4',
        content: '休憩時間の分散化は良いアイデアですね。シフト調整と合わせて検討してみます。'
      }
    ]),
    projectStatus: {
      stage: 'approaching' as const,
      score: 44,
      threshold: 75,
      progress: 45
    }
  },

  // 4. 音声入力システム導入提案
  {
    id: 'post-4',
    type: 'improvement' as PostType,
    proposalType: 'innovation',
    filterCategory: 'voting', // 投票対象
    facilityScope: 'tategami_hospital',
    departmentScope: '医療療養病棟',
    content: `音声入力を活用した申し送り業務の効率化

毎日の申し送り記録作成に多くの時間を費やしています。

【現状】
・手書きメモから電子カルテへの転記に15-20分
・重要事項の記載漏れリスク
・字が読みにくく確認に時間がかかる

【提案】
音声入力システムの導入により：
・記録時間を5分程度に短縮
・リアルタイムでの記録が可能
・検索可能なテキストデータ化

初期投資は必要ですが、年間の残業時間削減効果を考えると十分な費用対効果が見込めます。`,
    author: {
      id: 'user-4',
      name: '田中 恵子',
      department: '医療療養病棟',
      role: '看護主任',
      avatar: '/api/placeholder/150/150'
    },
    anonymityLevel: 'real_name' as AnonymityLevel,
    priority: 'medium' as Priority,
    timestamp: new Date('2025-06-08T16:45:00'),
    votes: generateVoteRecord({
      stronglySupport: 5,
      support: 2,
      neutral: 1,
      oppose: 0,
      stronglyOppose: 0
    }),
    comments: generateComments('post-4', [
      {
        userId: 'user-6',
        content: '音声入力は個人情報保護の観点から、セキュリティ面での検討も必要ですね。'
      },
      {
        userId: 'user-3',
        content: 'IT部門に相談したところ、院内ネットワーク内で完結するシステムなら導入可能とのことでした。'
      },
      {
        userId: 'user-10',
        content: 'リハビリ部門でも同様の課題があります。病院全体での導入を検討してはどうでしょうか。'
      }
    ]),
    projectStatus: {
      stage: 'ready' as const,
      score: 125,
      threshold: 100,
      progress: 78
    },
    projectId: 'proj-2'
  },

  // 5. 新人教育プログラムの改善
  {
    id: 'post-5',
    type: 'improvement' as PostType,
    proposalType: 'operational',
    filterCategory: 'facility', // 施設内投稿
    facilityScope: 'tategami_hospital',
    departmentScope: '医療療養病棟',
    content: `新人看護師・介護職員の教育プログラム改善案

来年度の新人受け入れに向けて、教育プログラムの見直しを提案します。

【現行の課題】
・OJT依存で指導者により差がある
・夜勤導入時期の判断基準が不明確
・メンタルフォローが不十分

【改善案】
1. チェックリスト式の技術習得確認表の導入
2. メンター制度の確立（1年目職員に2-3年目の先輩を配置）
3. 月1回の新人面談の実施
4. 夜勤導入の客観的基準の設定

皆様のご意見をお聞かせください。`,
    author: {
      id: 'user-5',
      name: '高橋 真理',
      department: '医療療養病棟',
      role: '介護看護補助者主任',
      avatar: '/api/placeholder/150/150'
    },
    anonymityLevel: 'real_name' as AnonymityLevel,
    priority: 'high' as Priority,
    timestamp: new Date('2025-06-11T11:00:00'),
    votes: generateVoteRecord({
      stronglySupport: 4,
      support: 3,
      neutral: 1,
      oppose: 0,
      stronglyOppose: 0
    }),
    comments: generateComments('post-5', [
      {
        userId: 'user-7',
        content: '私が新人の頃、メンターがいたらもっと安心できたと思います。ぜひ実現してください。'
      },
      {
        userId: 'user-6',
        content: 'チェックリストは良いですね。到達度が見える化されると、新人も指導者も安心です。'
      },
      {
        userId: 'user-3',
        content: '看護部として、この提案を前向きに検討します。特にメンタルフォローは重要課題です。'
      }
    ]),
    projectStatus: {
      stage: 'approaching' as const,
      score: 110,
      threshold: 125,
      progress: 88
    }
  },

  // 6. 感染対策の効率化（匿名投稿）
  {
    id: 'post-6',
    type: 'improvement' as PostType,
    proposalType: 'operational',
    filterCategory: 'facility', // 施設内投稿
    facilityScope: 'tategami_hospital',
    departmentScope: '医療療養病棟',
    content: `手指消毒剤の配置場所最適化の提案

感染対策は重要ですが、現在の消毒剤配置に改善の余地があります。

・病室入口にはあるが、ナースステーション内が不足
・詰め替え作業が非効率（月2回、計3時間）
・使用期限管理が煩雑

センサー式ディスペンサーの増設と、配置マップの作成を提案します。`,
    author: {
      id: 'user-6',
      name: '匿名',
      department: '医療療養病棟',
      role: 'スタッフ',
      avatar: '/api/placeholder/150/150'
    },
    anonymityLevel: 'anonymous' as AnonymityLevel,
    priority: 'medium' as Priority,
    timestamp: new Date('2025-06-13T13:20:00'),
    votes: generateVoteRecord({
      stronglySupport: 2,
      support: 3,
      neutral: 1,
      oppose: 0,
      stronglyOppose: 0
    }),
    comments: generateComments('post-6', [
      {
        userId: 'user-4',
        content: '感染対策委員会でも同様の意見が出ていました。来月の会議で検討します。'
      }
    ]),
    projectStatus: {
      stage: 'approaching' as const,
      score: 44,
      threshold: 75,
      progress: 35
    }
  },

  // 7. 法人全体のデジタル化推進（全体表示対象）
  {
    id: 'post-7',
    type: 'improvement' as PostType,
    proposalType: 'innovation',
    filterCategory: 'all', // 全体表示
    facilityScope: 'all', // 全法人
    departmentScope: 'all',
    content: `法人全体でのペーパーレス化推進について

医療業界全体でDXが求められる中、当法人でも段階的なペーパーレス化を進めています。

【現状】
・各施設でバラバラなシステム運用
・紙書類の保管コストと管理負担
・情報共有の遅延

【提案】
1. 統一電子カルテシステムの導入
2. 会議資料の完全電子化
3. 職員間情報共有プラットフォームの構築

法人内の皆様からのご意見をお待ちしています。`,
    author: {
      id: 'user-11',
      name: '立神 太郎',
      department: '法人本部',
      role: '理事長',
      avatar: '/api/placeholder/150/150'
    },
    anonymityLevel: 'real_name' as AnonymityLevel,
    priority: 'high' as Priority,
    timestamp: new Date('2025-06-01T09:00:00'),
    votes: generateVoteRecord({
      stronglySupport: 12,
      support: 8,
      neutral: 2,
      oppose: 1,
      stronglyOppose: 0
    }),
    comments: generateComments('post-7', [
      {
        userId: 'user-3',
        content: '立神リハビリテーション温泉病院として、この取り組みを全面的に支持します。段階的な導入が現実的ですね。'
      },
      {
        userId: 'user-12',
        content: '他の施設職員です。システム統一により情報共有がスムーズになることを期待しています。'
      }
    ]),
    projectStatus: {
      stage: 'approaching' as const,
      score: 150,
      threshold: 200,
      progress: 75
    }
  },

  // 8. 他施設職員からの投票対象投稿
  {
    id: 'post-8',
    type: 'improvement' as PostType,
    proposalType: 'operational',
    filterCategory: 'voting', // 投票対象
    facilityScope: 'other_hospital', // 他施設
    departmentScope: '看護部',
    content: `夜勤者用の仮眠室改善プロジェクト

夜勤の質向上のため、仮眠室の環境改善を提案します。

【課題】
・防音が不十分で日中の騒音が気になる
・照明調整ができない
・ベッドの快適性に課題

【改善案】
1. 防音対策の強化
2. 調光可能な照明設備
3. マットレスの交換

同じ課題を抱える他施設の皆様のご意見もお聞かせください。`,
    author: {
      id: 'user-13',
      name: '山田 美咲',
      department: '看護部',
      role: '看護師長',
      avatar: '/api/placeholder/150/150'
    },
    anonymityLevel: 'real_name' as AnonymityLevel,
    priority: 'medium' as Priority,
    timestamp: new Date('2025-06-05T14:00:00'),
    votes: generateVoteRecord({
      stronglySupport: 7,
      support: 3,
      neutral: 1,
      oppose: 0,
      stronglyOppose: 0
    }),
    comments: generateComments('post-8', [
      {
        userId: 'user-4',
        content: '立神リハビリテーション温泉病院でも同様の課題があります。参考にさせてください。'
      }
    ]),
    projectStatus: {
      stage: 'ready' as const,
      score: 95,
      threshold: 100,
      progress: 85
    },
    votingDeadline: new Date('2025-06-25T23:59:59'),
    eligibleVoters: 15,
    voteBreakdown: {
      agree: 11,
      disagree: 0,
      hold: 1
    }
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