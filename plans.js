// プランごとの制限や使える機能は、この設定だけを見れば分かるようにしています。
// 将来はログイン後の契約状態を見て、currentPlanだけを切り替える想定です。
const planConfig = {
  free: {
    name: "Free",
    price: "無料",
    statusText: "Free：1ケース・7日記録まで",
    caseLimit: 1,
    recordLimit: 7,
    templates: "basic",
    features: {
      plan: true,
      print: true,
      pdfExport: false,
      csvExport: false,
      weeklyReview: false,
      parentLetter: false,
      sharing: false,
      detailedSuggestion: false
    },
    bullets: ["1ケースまで", "記録7日分まで", "介入計画書作成", "印刷対応", "PDF・CSV出力なし", "簡易提案のみ", "週次レビューなし", "保護者説明文なし", "共有機能なし"]
  },
  pro: {
    name: "Pro",
    price: "月額2,980円想定",
    statusText: "Pro：複数ケース・長期記録・レポート機能",
    caseLimit: 30,
    recordLimit: Infinity,
    templates: "all",
    features: {
      plan: true,
      print: true,
      pdfExport: true,
      csvExport: true,
      weeklyReview: true,
      parentLetter: true,
      sharing: false,
      detailedSuggestion: true
    },
    bullets: ["30ケースまで", "記録期間無制限", "介入計画書作成", "印刷対応", "PDF出力導線", "CSV出力", "全テンプレート", "詳細改善提案", "週次レビュー", "保護者説明文生成", "共有機能は近日対応"]
  },
  team: {
    name: "Team",
    price: "月額9,800円想定",
    statusText: "Team：施設向け管理機能",
    caseLimit: 100,
    recordLimit: Infinity,
    templates: "all",
    features: {
      plan: true,
      print: true,
      pdfExport: true,
      csvExport: true,
      weeklyReview: true,
      parentLetter: true,
      sharing: true,
      detailedSuggestion: true
    },
    bullets: ["スタッフ複数名", "ケース100件", "権限管理", "施設ロゴ入りレポート", "支援会議用レポート", "編集履歴"]
  }
};
