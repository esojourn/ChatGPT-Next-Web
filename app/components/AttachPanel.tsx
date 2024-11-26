import { useState, useRef, useEffect } from "react";
import styles from "./attach-panel.module.scss";
import { AttachFile } from "../types/attach";
import { getAttachHistory, saveAttachHistory } from "../utils/attach";
import { uploadToS3 } from "../utils";
import { v4 as uuidv4 } from "uuid";
import { showToast } from "./ui-lib";
import Locale from "../locales";
import FileCheckIcon from "../icons/file-check.svg";
import DeleteIcon from "../icons/clear.svg";

export function AttachPanel(props: {
  onClose: () => void;
  onSelect: (file: AttachFile) => void;
  selectedFiles: AttachFile[];
  setSelectedFiles: (files: AttachFile[]) => void;
}) {
  const [history, setHistory] = useState<AttachFile[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<HTMLDivElement>(null); // 添加历史记录区域的ref

  // 加载历史记录
  useEffect(() => {
    const files = getAttachHistory();
    // 按日期升序排列
    const sortedFiles = files.sort((a, b) => a.date - b.date);
    setHistory(sortedFiles);

    // 添加滚动到底部的逻辑
    setTimeout(() => {
      if (historyRef.current) {
        historyRef.current.scrollTop = historyRef.current.scrollHeight;
      }
    }, 0);
  }, []);

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        props.onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [props]);

  // 处理文件上传
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith("image/");

    if (isImage) {
      // 处理图片文件
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        const newFile: AttachFile = {
          id: uuidv4(),
          type: "image",
          url: base64,
          name: file.name,
          date: Date.now(),
          size: file.size,
        };

        saveAttachHistory(newFile);
        const newHistory = getAttachHistory().sort((a, b) => a.date - b.date);
        setHistory(newHistory);
        props.onSelect(newFile);
      };
      reader.readAsDataURL(file);
    } else {
      // 处理其他文件 - 上传到S3
      try {
        await uploadToS3({
          uploadFile: file,
          onProgress: (progress) => {
            const loadingIcon = document.createElement("div");
            loadingIcon.className = styles["loading-icon"];
            loadingIcon.innerHTML = "<LoadingIcon />";
            event.target.parentElement?.appendChild(loadingIcon);
          },
          onError: (error) => {
            showToast(Locale.Chat.Upload.Fail);
          },
          onSuccess: (url) => {
            const newFile: AttachFile = {
              id: uuidv4(),
              type: "file",
              url: url.custom_url,
              name: file.name,
              date: Date.now(),
              size: file.size,
            };
            saveAttachHistory(newFile);
            const newHistory = getAttachHistory().sort(
              (a, b) => a.date - b.date,
            );
            setHistory(newHistory);
            props.onSelect(newFile);
          },
        });
      } catch (error) {
        showToast(Locale.Chat.Upload.Fail);
      }
    }
  };

  return (
    <div
      className={`${styles["attach-panel"]} ${
        props.selectedFiles.length > 5
          ? styles["selected-list-2-line"]
          : styles["selected-list-1-line"]
      }`}
      ref={panelRef}
    >
      <div className={styles["attach-history"]} ref={historyRef}>
        {history.map((file) => {
          const isSelected = props.selectedFiles.some(
            (selectedFile) => selectedFile.id === file.id,
          );

          if (isSelected) {
            return null;
          }

          return (
            <div
              key={file.id}
              className={`${styles["attach-item"]} ${
                isSelected ? styles["attach-item-selected"] : ""
              }`}
              onClick={(e) => {
                e.stopPropagation(); // 阻止事件冒泡
                props.onSelect(file);
              }}
            >
              {file.type === "image" ? (
                <img
                  src={file.url}
                  alt={file.name}
                  className={styles["attach-preview"]}
                />
              ) : (
                <div className={styles["file-icon"]}>
                  <FileCheckIcon />
                </div>
              )}
              <div className={styles["attach-info"]}>
                <div className={styles["attach-name"]}>{file.name}</div>
                <div className={styles["attach-date"]}>
                  {new Date(file.date).toLocaleString()}
                </div>
              </div>
              <div
                className={styles["delete-button"]}
                onClick={(e) => {
                  e.stopPropagation(); // 防止触发选择事件
                  const newHistory = history.filter(
                    (_, i) => i !== history.indexOf(file),
                  );
                  setHistory(newHistory);
                }}
              >
                <DeleteIcon />
              </div>
            </div>
          );
        })}
      </div>
      <div
        className={`${styles["attach-selected-list"]}
        `}
      >
        {props.selectedFiles.length === 0 && (
          <div className={styles["attach-selected-tip"]}>
            附件可以从历史记录中选择
            <br />
            也可以上传新文件
          </div>
        )}

        {props.selectedFiles.map((file) => (
          <div
            key={file.id}
            className={`${styles["attach-selected-item"]} ${
              file.type === "image"
                ? styles["attach-selected-item-image"]
                : styles["attach-selected-item-file"]
            }`}
          >
            {file.type === "image" ? (
              <img
                src={file.url}
                alt={file.name}
                className={styles["attach-preview"]}
              />
            ) : (
              file.name
            )}
            <div className={styles["selected-attach-mask"]}>
              <div
                className={styles["selected-attach-delete-button"]}
                onClick={(e) => {
                  e.stopPropagation();
                  const newSelectedFiles = props.selectedFiles.filter(
                    (f) => f.id !== file.id,
                  );
                  props.setSelectedFiles(newSelectedFiles);
                }}
              >
                <DeleteIcon />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className={styles["attach-header"]}>
        <div
          className={styles["upload-area"]}
          onClick={() => document.getElementById("file-upload")?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const files = e.dataTransfer.files;
            if (files.length > 0) {
              // @ts-ignore
              handleFileUpload({ target: { files } });
            }
          }}
        >
          <input
            type="file"
            onChange={handleFileUpload}
            style={{ display: "none" }}
            id="file-upload"
            multiple // 允许选择多个文件
          />
          <span>拖放文件到这里，或点击上传新文件</span>
        </div>
      </div>
    </div>
  );
}
