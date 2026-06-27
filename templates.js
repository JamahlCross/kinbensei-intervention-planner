// テンプレートは入力欄へ流し込むサンプルデータです。
// categoryは表示上の分類、tierがbasicならFreeでも利用でき、proならPro以上の機能として扱います。
const templateCategories = [
  { id: "child", name: "子供用", description: "宿題、忘れ物、朝の準備など、家庭・学校で使いやすいテンプレートです。" },
  { id: "adult", name: "大人用", description: "資格勉強、仕事、家事管理など、大人の自己管理に使えるテンプレートです。" },
  { id: "support", name: "支援用", description: "療育・学童・支援場面で、声かけや環境調整を考えやすいテンプレートです。" },
  { id: "consulting", name: "コンサル用", description: "面談、提案、顧客対応など、伴走支援や業務改善に使えるテンプレートです。" }
];

const templates = [
  {
    id: "homework",
    name: "宿題開始テンプレート",
    category: "child",
    tier: "basic",
    values: {
      problem: "宿題を始めるまでに時間がかかり、声かけが増える。",
      traits: ["努力・粘り", "自己規律"],
      currentState: "帰宅後、宿題に取りかかるまで時間がかかる。",
      idealState: "決めた合図を見たら、自分で最初の1問に取りかかる。",
      microAction: "ノートと筆箱を机に出す",
      twoMinAction: "問題を1問読む",
      fiveMinAction: "算数を1問だけ解く",
      cueWhen: "夕食後",
      cueWhere: "ダイニングテーブルで",
      cueSignal: "青いファイルを見たら",
      cueBehavior: "算数を1問だけ解く",
      supportPrompt: "青いファイル、見えたね。まず1問だけでいいよ。"
    }
  },
  {
    id: "forgotten",
    name: "忘れ物対策テンプレート",
    category: "child",
    tier: "basic",
    values: {
      problem: "翌日の持ち物確認が抜けやすい。",
      traits: ["整理整頓・計画", "責任感"],
      currentState: "朝になってから必要な物に気づくことが多い。",
      idealState: "前日の決まった時間に、持ち物を1つずつ確認する。",
      microAction: "連絡帳を開く",
      twoMinAction: "明日の持ち物を1つ確認する",
      fiveMinAction: "ランドセルに必要な物を入れる",
      cueWhen: "寝る準備の前",
      cueWhere: "ランドセル置き場で",
      cueSignal: "持ち物カードを見たら",
      cueBehavior: "連絡帳を開いて1つ確認する",
      supportPrompt: "持ち物カードを一緒に見よう。最初の1つだけ確認しよう。"
    }
  },
  {
    id: "qualification-study",
    name: "資格勉強テンプレート",
    category: "adult",
    tier: "basic",
    values: {
      problem: "資格勉強を始めたいが、範囲が広くて後回しになりやすい。",
      traits: ["整理整頓・計画", "努力・粘り", "自己規律"],
      currentState: "勉強時間を作ろうと思っても、何から始めるか迷って着手が遅れる。",
      idealState: "毎日同じきっかけで、短い時間だけでも教材に触れられる。",
      microAction: "テキストを開く",
      twoMinAction: "見出しを1つ読む",
      fiveMinAction: "過去問を1問だけ解く",
      cueWhen: "朝のコーヒー後",
      cueWhere: "机で",
      cueSignal: "資格テキストを見たら",
      cueBehavior: "過去問を1問だけ解く",
      supportPrompt: "合格まで全部やろうとしなくて大丈夫。今日は1問だけ進めよう。"
    }
  },
  {
    id: "morning",
    name: "朝の準備テンプレート",
    category: "child",
    tier: "pro",
    values: {
      problem: "朝の準備が遅れ、声かけが多くなる。",
      traits: ["整理整頓・計画", "自己規律", "責任感"],
      currentState: "次に何をするか分からず止まりやすい。",
      idealState: "準備表を見ながら、1つずつ進める。",
      microAction: "準備表を見る",
      twoMinAction: "服を用意する",
      fiveMinAction: "着替えを始める",
      cueWhen: "朝起きた後",
      cueWhere: "準備スペースで",
      cueSignal: "朝の準備表を見たら",
      cueBehavior: "最初の項目に丸をつける",
      supportPrompt: "準備表の一番上だけ見よう。"
    }
  },
  {
    id: "test",
    name: "テスト勉強テンプレート",
    category: "child",
    tier: "pro",
    values: {
      problem: "テスト勉強の範囲が広く、何から始めるか迷う。",
      traits: ["整理整頓・計画", "努力・粘り", "生産性"],
      currentState: "計画を立てる前に不安が大きくなる。",
      idealState: "今日やる小さな範囲を決めて、短時間から始める。",
      microAction: "範囲表に丸を1つつける",
      twoMinAction: "重要語句を1つ読む",
      fiveMinAction: "問題を1問解く",
      cueWhen: "夕食前",
      cueWhere: "机で",
      cueSignal: "範囲表を見たら",
      cueBehavior: "今日の1問を決める",
      supportPrompt: "全部見なくて大丈夫。今日の1問だけ選ぼう。"
    }
  },
  {
    id: "submission",
    name: "提出物管理テンプレート",
    category: "child",
    tier: "pro",
    values: {
      problem: "提出物を出し忘れたり、締切を忘れたりする。",
      traits: ["整理整頓・計画", "責任感", "生産性"],
      currentState: "提出物の置き場所や確認タイミングが決まっていない。",
      idealState: "提出物を決まった場所に入れ、提出前に確認する。",
      microAction: "提出物フォルダを開く",
      twoMinAction: "出す物を1つ入れる",
      fiveMinAction: "提出物リストにチェックする",
      cueWhen: "学校の準備をするとき",
      cueWhere: "ランドセル置き場で",
      cueSignal: "提出物フォルダを見たら",
      cueBehavior: "提出物を1つ入れる",
      supportPrompt: "提出物フォルダだけ確認しよう。"
    }
  },
  {
    id: "phone",
    name: "スマホ誘惑対策テンプレート",
    category: "child",
    tier: "pro",
    values: {
      problem: "スマホが気になり、予定した学習や準備が止まりやすい。",
      traits: ["衝動制御・先延ばし対策", "自己規律"],
      currentState: "通知や動画で作業が中断しやすい。",
      idealState: "決めた短時間だけスマホから離れて作業する。",
      microAction: "スマホを裏返す",
      twoMinAction: "スマホを離れた場所に置く",
      fiveMinAction: "通知を切って1問進める",
      cueWhen: "学習を始める前",
      cueWhere: "机の横で",
      cueSignal: "スマホ置き場を見たら",
      cueBehavior: "スマホを置き場に置く",
      supportPrompt: "スマホは置き場で休憩。まず5分だけやってみよう。"
    }
  },
  {
    id: "work-priority",
    name: "仕事の優先順位テンプレート",
    category: "adult",
    tier: "pro",
    values: {
      problem: "やることが多く、どれから手をつけるか迷って作業開始が遅れる。",
      traits: ["整理整頓・計画", "生産性", "自己規律"],
      currentState: "タスク一覧を見るだけで負担が大きくなり、メールや細かい作業に流れやすい。",
      idealState: "最初に1つだけ重要タスクを選び、短時間だけ着手する。",
      microAction: "今日のタスク一覧を開く",
      twoMinAction: "一番大事なタスクに印をつける",
      fiveMinAction: "そのタスクの最初の作業を1つ進める",
      cueWhen: "業務開始直後",
      cueWhere: "デスクで",
      cueSignal: "タスク一覧を見たら",
      cueBehavior: "最重要タスクに印をつける",
      supportPrompt: "今日は全部ではなく、最初の1つを選べたら成功にしよう。"
    }
  },
  {
    id: "reading-study",
    name: "読書・学び直しテンプレート",
    category: "adult",
    tier: "pro",
    values: {
      problem: "本や教材を買っても、読み始めるタイミングが作れない。",
      traits: ["努力・粘り", "自己規律", "生産性"],
      currentState: "まとまった時間がないと感じて、学び直しが後回しになる。",
      idealState: "短い時間でも、毎日同じ場所で1ページだけ読む。",
      microAction: "本を手に取る",
      twoMinAction: "1ページだけ読む",
      fiveMinAction: "気になった文に線を引く",
      cueWhen: "昼休みの最初",
      cueWhere: "いつもの席で",
      cueSignal: "本をバッグから出したら",
      cueBehavior: "1ページだけ読む",
      supportPrompt: "読み切らなくて大丈夫。1ページ触れたら前進です。"
    }
  },
  {
    id: "household-admin",
    name: "家事・事務処理テンプレート",
    category: "adult",
    tier: "pro",
    values: {
      problem: "書類、支払い、片づけなどの細かい家事タスクを後回しにしやすい。",
      traits: ["責任感", "整理整頓・計画", "生産性"],
      currentState: "必要だと分かっていても、面倒に感じて着手しにくい。",
      idealState: "決まった曜日に、1つだけ処理して負担をためない。",
      microAction: "処理する書類を1枚出す",
      twoMinAction: "封筒を開ける",
      fiveMinAction: "必要な対応をメモする",
      cueWhen: "日曜の午前",
      cueWhere: "リビングのテーブルで",
      cueSignal: "書類トレーを見たら",
      cueBehavior: "書類を1枚だけ確認する",
      supportPrompt: "今日は1枚だけ。終わらせるより、ためない流れを作ろう。"
    }
  },
  {
    id: "organize",
    name: "整理整頓テンプレート",
    category: "support",
    tier: "pro",
    values: {
      problem: "机や棚が散らかり、必要な物を探す時間が長い。",
      traits: ["整理整頓・計画", "生産性"],
      currentState: "使った物を戻す場所が決まっていない。",
      idealState: "作業後に1か所だけ戻して、次に使いやすい状態にする。",
      microAction: "机の上の1つだけ元の場所に戻す",
      twoMinAction: "筆記用具だけ片づける",
      fiveMinAction: "机の中央を空ける",
      cueWhen: "学習が終わった後",
      cueWhere: "机の前で",
      cueSignal: "片づけカードを見たら",
      cueBehavior: "机の上の1つだけ元の場所に戻す",
      supportPrompt: "1つ戻せたら今日は成功にしよう。"
    }
  },
  {
    id: "procrastination",
    name: "先延ばし対策テンプレート",
    category: "support",
    tier: "pro",
    values: {
      problem: "やることを後回しにして、締切直前に負担が大きくなる。",
      traits: ["衝動制御・先延ばし対策", "自己規律"],
      currentState: "始める前に気が重くなり、別のことを始めやすい。",
      idealState: "気が重いときでも、2分だけ始めて流れを作る。",
      microAction: "教材を開くだけ",
      twoMinAction: "最初の見出しだけ読む",
      fiveMinAction: "1問または1行だけ進める",
      cueWhen: "帰宅して手洗いが終わったら",
      cueWhere: "机で",
      cueSignal: "タイマーを見たら",
      cueBehavior: "2分だけ教材を開く",
      supportPrompt: "終わらせなくていいよ。2分だけ始めよう。"
    }
  },
  {
    id: "restart",
    name: "癇癪後の再開テンプレート",
    category: "support",
    tier: "pro",
    values: {
      problem: "気持ちが崩れた後に活動へ戻るまで時間がかかる。",
      traits: ["努力・粘り", "自己規律"],
      currentState: "失敗感が強くなると再開が難しい。",
      idealState: "落ち着いた後、負担の小さい行動から戻る。",
      microAction: "深呼吸を1回する",
      twoMinAction: "使う物を1つ手に取る",
      fiveMinAction: "前の活動を1分だけ再開する",
      cueWhen: "落ち着いて水を飲んだ後",
      cueWhere: "安心できる場所で",
      cueSignal: "再開カードを見たら",
      cueBehavior: "深呼吸を1回して、使う物を1つ持つ",
      supportPrompt: "戻る力を練習しよう。1つ持てたら十分だよ。"
    }
  },
  {
    id: "transition",
    name: "活動切り替えテンプレート",
    category: "support",
    tier: "pro",
    values: {
      problem: "好きな活動から次の活動へ切り替える時に止まりやすい。",
      traits: ["衝動制御・先延ばし対策", "自己規律"],
      currentState: "終わりの合図が分かりにくく、声かけが強くなりやすい。",
      idealState: "見える合図を使って、次の活動の最初の1動作へ移れる。",
      microAction: "次の活動カードを見る",
      twoMinAction: "使っていた物を1つ置く",
      fiveMinAction: "次の場所へ移動する",
      cueWhen: "タイマーが鳴った後",
      cueWhere: "活動スペースで",
      cueSignal: "次の活動カードを見たら",
      cueBehavior: "使っていた物を1つ置く",
      supportPrompt: "次のカードを見よう。まず1つ置けたら切り替え成功です。"
    }
  },
  {
    id: "visual-cue",
    name: "視覚的cue強化テンプレート",
    category: "support",
    tier: "pro",
    values: {
      problem: "言葉で伝えても忘れやすく、何度も声かけが必要になる。",
      traits: ["整理整頓・計画", "自己規律"],
      currentState: "やることが頭の中だけになっていて、行動のきっかけが残りにくい。",
      idealState: "見える合図を置き、本人が自分で次の行動に気づける。",
      microAction: "合図カードを見る",
      twoMinAction: "カードの最初の項目に触れる",
      fiveMinAction: "最初の行動を1つ行う",
      cueWhen: "活動を始める前",
      cueWhere: "本人の見える場所で",
      cueSignal: "合図カードを見たら",
      cueBehavior: "最初の項目を指さす",
      supportPrompt: "カードが見えたね。最初の1つだけ確認しよう。"
    }
  },
  {
    id: "client-followup",
    name: "顧客フォローアップテンプレート",
    category: "consulting",
    tier: "pro",
    values: {
      problem: "面談後のフォローや連絡が後回しになり、関係維持が弱くなる。",
      traits: ["責任感", "生産性", "整理整頓・計画"],
      currentState: "面談直後は覚えていても、次のタスクに移ると連絡が遅れやすい。",
      idealState: "面談後すぐに、次の一手を1つだけ記録する。",
      microAction: "顧客メモを開く",
      twoMinAction: "次回の論点を1行書く",
      fiveMinAction: "お礼メールの下書きを作る",
      cueWhen: "面談終了直後",
      cueWhere: "デスクで",
      cueSignal: "顧客メモを見たら",
      cueBehavior: "次の一手を1行だけ書く",
      supportPrompt: "完璧な報告より、次の一手を1行残そう。"
    }
  },
  {
    id: "proposal-draft",
    name: "提案書作成テンプレート",
    category: "consulting",
    tier: "pro",
    values: {
      problem: "提案書作成が大きなタスクに感じられ、着手が遅れる。",
      traits: ["生産性", "努力・粘り", "整理整頓・計画"],
      currentState: "完成形を考えすぎて、最初のページに手がつかない。",
      idealState: "粗いメモから始め、提案の骨子を小さく作る。",
      microAction: "提案書ファイルを開く",
      twoMinAction: "見出しを1つ置く",
      fiveMinAction: "顧客の課題を3行だけ書く",
      cueWhen: "午前の集中時間の最初",
      cueWhere: "PCの前で",
      cueSignal: "提案書フォルダを見たら",
      cueBehavior: "見出しを1つ置く",
      supportPrompt: "完成版ではなく、骨子を1つ置けたら前進です。"
    }
  },
  {
    id: "meeting-prep",
    name: "面談準備テンプレート",
    category: "consulting",
    tier: "pro",
    values: {
      problem: "面談準備が直前になり、確認漏れや焦りが出る。",
      traits: ["整理整頓・計画", "責任感"],
      currentState: "資料や論点確認をまとめてやろうとして、負担が大きい。",
      idealState: "前日の決まった時間に、論点を1つだけ確認する。",
      microAction: "面談メモを開く",
      twoMinAction: "相手の目的を1行確認する",
      fiveMinAction: "質問を1つ書く",
      cueWhen: "前日の終業前",
      cueWhere: "デスクで",
      cueSignal: "明日の予定表を見たら",
      cueBehavior: "面談メモを開く",
      supportPrompt: "全部準備しようとせず、最初の質問を1つだけ作ろう。"
    }
  },
  {
    id: "sales-log",
    name: "営業記録テンプレート",
    category: "consulting",
    tier: "pro",
    values: {
      problem: "商談や相談の記録が後回しになり、次回の準備に使いにくい。",
      traits: ["責任感", "生産性"],
      currentState: "記録をまとめて書こうとして、記憶が薄れてから着手している。",
      idealState: "商談直後に、事実と次回アクションを短く残す。",
      microAction: "記録画面を開く",
      twoMinAction: "相手の発言を1つ書く",
      fiveMinAction: "次回アクションを1つ登録する",
      cueWhen: "商談終了後",
      cueWhere: "PCまたはスマホで",
      cueSignal: "記録画面を見たら",
      cueBehavior: "次回アクションを1つ登録する",
      supportPrompt: "きれいな議事録より、次の一手を残そう。"
    }
  }
];
