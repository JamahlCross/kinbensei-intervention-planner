// review.jsは記録や入力内容から文章を作る層です。
// 外部AIに差し替える場合も、まずはこのファイルの関数を置き換えると見通しがよくなります。

function calculateRecordStats(records) {
  const safeRecords = Array.isArray(records) ? records : [];
  const total = safeRecords.length;
  const success = safeRecords.filter((record) => record.done === "yes").length;
  const rate = total ? Math.round((success / total) * 100) : 0;
  const averagePrompts = total ? safeRecords.reduce((sum, item) => sum + Number(item.prompts || 0), 0) / total : 0;
  return { total, success, rate, averagePrompts };
}

function getSimpleSuggestion(rate, total) {
  if (!total) return "記録を追加すると、成功率に応じた次の提案が表示されます。";
  if (rate >= 80) return "成功率80%以上です。少し難易度を上げる段階です。";
  if (rate >= 50) return "成功率50〜79%です。同じ行動を継続しましょう。";
  return "成功率50%未満です。行動をもっと小さくする、cueを見直すことを優先しましょう。";
}

function getDetailedSuggestion(records) {
  const stats = calculateRecordStats(records);
  if (!stats.total) return "記録を追加すると、声かけ回数や気分も含めた詳細提案が表示されます。";

  const suggestions = [];
  if (stats.rate >= 80) suggestions.push("成功率が高いため、次週は少しだけ難易度を上げてもよさそうです。");
  else if (stats.rate >= 50) suggestions.push("成功率は中程度です。行動は維持し、cueや環境を整えましょう。");
  else suggestions.push("成功率が低めです。行動をさらに小さくして、始める負担を下げましょう。");

  if (stats.averagePrompts >= 3) suggestions.push("声かけ回数が多めです。視覚的cueを目立つ場所に置くと、支援者の声かけを減らしやすくなります。");
  if (countMood(records, ["疲れていた", "不安そうだった"]) >= Math.ceil(stats.total / 2)) {
    suggestions.push("疲れや不安の記録が多めです。時間帯や量を見直し、成功しやすい場面から始めましょう。");
  }

  return suggestions.join(" ");
}

function generateWeeklyReview(records) {
  const recent = Array.isArray(records) ? records.slice(-7) : [];
  const stats = calculateRecordStats(recent);
  if (!stats.total) return "直近の記録がまだありません。まずは1週間分を目安に記録してみましょう。";

  const promptTrend = stats.averagePrompts >= 3 ? "声かけ回数は多めです" : stats.averagePrompts >= 1 ? "声かけ回数は中程度です" : "少ない声かけで実行できています";
  const toughMoodCount = countMood(recent, ["疲れていた", "不安そうだった"]);
  const moodTrend = toughMoodCount >= Math.ceil(stats.total / 2)
    ? "疲れや不安が出やすい週でした"
    : "気分は比較的安定しています";
  const successConditions = findSuccessConditions(recent);
  const proposal = stats.rate >= 80
    ? "次週は少しだけ難易度を上げるか、声かけを1回減らすことを検討できます。"
    : stats.rate >= 50
      ? "現在の小行動は維持しつつ、cueをより目立つ場所に置くことをおすすめします。"
      : "行動をさらに小さくし、実行する時間帯や場所を見直すことをおすすめします。";

  return `今週の実行率は${stats.rate}%です。${promptTrend}。${moodTrend}。成功しやすい条件は「${successConditions}」です。${proposal}`;
}

function generateParentLetter(data, behaviorSentence) {
  const safeData = data || {};
  const traits = safeData.traits && safeData.traits.length ? safeData.traits.join("、") : "勤勉性の土台";
  const value = [safeData.easeValue, safeData.personalMeaning, safeData.idealSelf].filter(Boolean).join(" ");
  const micro = safeData.microAction || "とても小さな行動";

  return `今回の計画では、${traits}を少しずつ育てることをねらいます。本人にとっては、${value || "できた感覚を積み重ね、自信につなげること"}が大切な意味になります。最初から大きな行動を求めるのではなく、「${micro}」のような小行動から始めることで、取りかかりの負担を下げます。${behaviorSentence ? `具体的には「${behaviorSentence}」という形で、きっかけと行動を結びつけます。` : "きっかけと行動を分かりやすく決めて、始めやすい形にします。"}日々の記録を見ながら、成功率や声かけ回数、気分の様子を確認し、1週間ごとに行動の大きさやcueを見直します。`;
}

function countMood(records, moods) {
  const safeRecords = Array.isArray(records) ? records : [];
  return safeRecords.filter((record) => moods.includes(record.mood)).length;
}

function findSuccessConditions(records) {
  const successRecords = records.filter((record) => record.done === "yes");
  if (!successRecords.length) return "まだ十分に見えていません";
  const lowPrompt = successRecords.filter((record) => Number(record.prompts || 0) <= 1).length;
  if (lowPrompt >= Math.ceil(successRecords.length / 2)) return "声かけが少ない日でも始められた場面";
  return "支援者の最初の声かけが入った場面";
}
