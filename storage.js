// storage.jsは保存先を隠すための薄い層です。
// 今はlocalStorageですが、将来FirestoreやSupabaseに変える場合はこの関数群の中身を差し替えます。

const STORAGE_KEY = "kinbenseiInterventionPlannerSaaS";
const LEGACY_STORAGE_KEY = "kinbenseiInterventionPlanner";

function fetchAppState() {
  const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
  if (!saved) return null;
  return JSON.parse(saved);
}

function persistAppState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function clearPersistedAppState() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(LEGACY_STORAGE_KEY);
}

function serializeAppStateForBackup(state) {
  return JSON.stringify(state, null, 2);
}

function parseAppStateBackup(text) {
  return JSON.parse(text);
}
