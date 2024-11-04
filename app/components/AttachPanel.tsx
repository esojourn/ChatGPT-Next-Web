import { useState, useEffect } from "react";
import { IconButton } from "./button";
import { Upload } from "antd";
import styles from "./attach-panel.module.scss";
import UploadIcon from "../icons/upload.svg";
import CloseIcon from "../icons/close.svg";
import Locale from "../locales";

export function AttachPanel(props: {
  onClose: () => void;
  onSelect: (url: string) => void;
}) {
  const [recentFiles, setRecentFiles] = useState<
    Array<{
      url: string;
      name: string;
      date: string;
    }>
  >([]);

  // 加载最近文件
  useEffect(() => {
    // TODO: 从本地存储或API获取最近文件列表
    const mockRecentFiles = [
      { url: "url1", name: "文件1.pdf", date: "2024-01-01" },
      // ... 更多测试数据
    ];
    setRecentFiles(mockRecentFiles);
  }, []);

  return (
    <div className={styles["attach-panel"]}>
      <div className={styles["panel-header"]}>
        <div className={styles["title"]}>{Locale.Chat.AttachPanel.Title}</div>
        <IconButton icon={<CloseIcon />} onClick={props.onClose} />
      </div>

      <div className={styles["recent-files"]}>
        <div className={styles["section-title"]}>
          {Locale.Chat.AttachPanel.Recent}
        </div>
        <div className={styles["files-grid"]}>
          {recentFiles.map((file, index) => (
            <div
              key={index}
              className={styles["file-item"]}
              onClick={() => props.onSelect(file.url)}
            >
              file:
              <div className={styles["file-info"]}>
                <div className={styles["file-name"]}>{file.name}</div>
                <div className={styles["file-date"]}>{file.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles["upload-section"]}>
        <div className={styles["section-title"]}>
          {Locale.Chat.AttachPanel.Upload}
        </div>
        <Upload.Dragger
          multiple={true}
          showUploadList={false}
          customRequest={async (options) => {
            // TODO: 实现文件上传逻辑
            const url = "uploaded-file-url";
            props.onSelect(url);
          }}
        >
          <div className={styles["upload-area"]}>
            <UploadIcon />
            <div>{Locale.Chat.AttachPanel.DropMessage}</div>
          </div>
        </Upload.Dragger>
      </div>
    </div>
  );
}
