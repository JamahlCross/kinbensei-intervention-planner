// テンプレートは入力欄へ流し込むサンプルデータです。
// tierがbasicならFreeでも利用でき、proならPro以上の機能として扱います。
const templates = [
  {
    id: "homework",
    name: "宿題開始テンプレート",
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
    id: "organize",
    name: "整理整頓テンプレート",
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
    id: "phone",
    name: "スマホ誘惑対策テンプレート",
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
    id: "test",
    name: "テスト勉強テンプレート",
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
    id: "restart",
    name: "癇癪後の再開テンプレート",
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
    id: "morning",
    name: "朝の準備テンプレート",
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
    id: "submission",
    name: "提出物管理テンプレート",
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
  }
];
