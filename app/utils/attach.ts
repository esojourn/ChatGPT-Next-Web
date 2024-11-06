import { AttachFile } from "../types/attach";

const ATTACH_HISTORY_KEY = "attach_history";
const MAX_HISTORY_LENGTH = 10;

export function saveAttachHistory(file: AttachFile) {
  const history = getAttachHistory();

  // 添加新文件到开头
  history.unshift(file);

  // 只保留最近10条
  if (history.length > MAX_HISTORY_LENGTH) {
    history.length = MAX_HISTORY_LENGTH;
  }

  localStorage.setItem(ATTACH_HISTORY_KEY, JSON.stringify(history));
}

export function getAttachHistory(): AttachFile[] {
  const history = localStorage.getItem(ATTACH_HISTORY_KEY);
  return history ? JSON.parse(history) : [];
}

export function clearAttachHistory() {
  localStorage.removeItem(ATTACH_HISTORY_KEY);
}
