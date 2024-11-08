import { showToast } from "../components/ui-lib";
import { AttachFile } from "../types/attach";
import { MAX_ATTACH_FILE_COUNT } from "../constant";

const ATTACH_HISTORY_KEY = "attach_history";

export function saveAttachHistory(file: AttachFile) {
  const history = getAttachHistory();

  if (history.length >= MAX_ATTACH_FILE_COUNT) {
    // 超出最大数量，显示提示信息
    showToast("附件历史记录已满，请删除一些附件");
    return;
  }

  // 添加新文件到开头
  history.unshift(file);

  // 只保留最近20条
  if (history.length > MAX_ATTACH_FILE_COUNT) {
    history.length = MAX_ATTACH_FILE_COUNT;
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
