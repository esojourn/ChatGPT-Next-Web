/* eslint-disable @next/next/no-img-element */
import styles from "./ui-lib.module.scss";
import LoadingIcon from "../icons/three-dots.svg";
import CloseIcon from "../icons/close.svg";
import EyeIcon from "../icons/eye.svg";
import EyeOffIcon from "../icons/eye-off.svg";
import DownIcon from "../icons/down.svg";
import ConfirmIcon from "../icons/confirm.svg";
import CancelIcon from "../icons/cancel.svg";
import MaxIcon from "../icons/max.svg";
import MinIcon from "../icons/min.svg";
import SearchIcon from "../icons/search.svg";
import VisionEyeIcon from "../icons/vision-eye.svg";
import HelpIcon from "../icons/help.svg";
import ClearQueryIcon from "../icons/clear-query.svg";

import Locale from "../locales";

import { createRoot } from "react-dom/client";
import React, {
  CSSProperties,
  HTMLProps,
  MouseEvent,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { IconButton } from "./button";
import { Gizmo } from "../types/gizmo";
import {
  CHATGPT_GPTS_DATA_URL,
  CHATGPT_GPTS_QUERY_URL,
  ServiceProvider,
} from "../constant";

export function Popover(props: {
  children: JSX.Element;
  content: JSX.Element;
  open?: boolean;
  onClose?: () => void;
}) {
  return (
    <div className={styles.popover}>
      {props.children}
      {props.open && (
        <div className={styles["popover-mask"]} onClick={props.onClose}></div>
      )}
      {props.open && (
        <div className={styles["popover-content"]}>{props.content}</div>
      )}
    </div>
  );
}

export function Card(props: { children: JSX.Element[]; className?: string }) {
  return (
    <div className={styles.card + " " + props.className}>{props.children}</div>
  );
}

export function ListItem(props: {
  title?: string;
  subTitle?: string | JSX.Element;
  children?: JSX.Element | JSX.Element[];
  icon?: JSX.Element;
  className?: string;
  onClick?: (e: MouseEvent) => void;
  vertical?: boolean;
}) {
  return (
    <div
      className={
        styles["list-item"] +
        ` ${props.vertical ? styles["vertical"] : ""} ` +
        ` ${props.className || ""}`
      }
      onClick={props.onClick}
    >
      <div className={styles["list-header"]}>
        {props.icon && <div className={styles["list-icon"]}>{props.icon}</div>}
        <div className={styles["list-item-title"]}>
          <div>{props.title}</div>
          {props.subTitle && (
            <div className={styles["list-item-sub-title"]}>
              {props.subTitle}
            </div>
          )}
        </div>
      </div>
      {props.children}
    </div>
  );
}

export function List(props: { children: React.ReactNode; id?: string }) {
  return (
    <div className={styles.list} id={props.id}>
      {props.children}
    </div>
  );
}

export function ListWithStyle(props: {
  children: React.ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <div className={styles.list + " " + props.className} id={props.id}>
      {props.children}
    </div>
  );
}

export function Loading() {
  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <LoadingIcon />
    </div>
  );
}

interface ModalProps {
  title: string;
  children?: any;
  actions?: React.ReactNode[];
  defaultMax?: boolean;
  footer?: React.ReactNode;
  onClose?: () => void;
}
export function Modal(props: ModalProps) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        props.onClose?.();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [isMax, setMax] = useState(!!props.defaultMax);

  return (
    <div
      className={
        styles["modal-container"] + ` ${isMax && styles["modal-container-max"]}`
      }
    >
      <div className={styles["modal-header"]}>
        <div className={styles["modal-title"]}>{props.title}</div>

        <div className={styles["modal-header-actions"]}>
          <div
            className={styles["modal-header-action"]}
            onClick={() => setMax(!isMax)}
          >
            {isMax ? <MinIcon /> : <MaxIcon />}
          </div>
          <div
            className={styles["modal-header-action"]}
            onClick={props.onClose}
          >
            <CloseIcon />
          </div>
        </div>
      </div>

      <div className={styles["modal-content"]}>{props.children}</div>

      <div className={styles["modal-footer"]}>
        {props.footer}
        <div className={styles["modal-actions"]}>
          {props.actions?.map((action, i) => (
            <div key={i} className={styles["modal-action"]}>
              {action}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function showModal(props: ModalProps) {
  const div = document.createElement("div");
  div.className = "modal-mask";
  document.body.appendChild(div);

  const root = createRoot(div);
  const closeModal = () => {
    props.onClose?.();
    root.unmount();
    div.remove();
  };

  div.onclick = (e) => {
    if (e.target === div) {
      closeModal();
    }
  };

  root.render(<Modal {...props} onClose={closeModal}></Modal>);
}

export type ToastProps = {
  content: string;
  action?: {
    text: string;
    onClick: () => void;
  };
  onClose?: () => void;
};

export function Toast(props: ToastProps) {
  return (
    <div className={styles["toast-container"]}>
      <div className={styles["toast-content"]}>
        <span>{props.content}</span>
        {props.action && (
          <button
            onClick={() => {
              props.action?.onClick?.();
              props.onClose?.();
            }}
            className={styles["toast-action"]}
          >
            {props.action.text}
          </button>
        )}
      </div>
    </div>
  );
}

export function showToast(
  content: string,
  action?: ToastProps["action"],
  delay = 3000,
) {
  const div = document.createElement("div");
  div.className = styles.show;
  document.body.appendChild(div);

  const root = createRoot(div);
  const close = () => {
    div.classList.add(styles.hide);

    setTimeout(() => {
      root.unmount();
      div.remove();
    }, 300);
  };

  setTimeout(() => {
    close();
  }, delay);

  root.render(<Toast content={content} action={action} onClose={close} />);
}

export type InputProps = React.HTMLProps<HTMLTextAreaElement> & {
  autoHeight?: boolean;
  rows?: number;
};

export function Input(props: InputProps) {
  return (
    <textarea
      {...props}
      className={`${styles["input"]} ${props.className}`}
    ></textarea>
  );
}

export function PasswordInput(
  props: HTMLProps<HTMLInputElement> & { aria?: string },
) {
  const [visible, setVisible] = useState(false);
  function changeVisibility() {
    setVisible(!visible);
  }

  return (
    <div className={"password-input-container"}>
      <IconButton
        aria={props.aria}
        icon={visible ? <EyeIcon /> : <EyeOffIcon />}
        onClick={changeVisibility}
        className={"password-eye"}
      />
      <input
        {...props}
        type={visible ? "text" : "password"}
        className={"password-input"}
      />
    </div>
  );
}

export function Select(
  props: React.DetailedHTMLProps<
    React.SelectHTMLAttributes<HTMLSelectElement> & {
      align?: "left" | "center";
    },
    HTMLSelectElement
  >,
) {
  const { className, children, align, ...otherProps } = props;
  return (
    <div
      className={`${styles["select-with-icon"]} ${
        align === "left" ? styles["left-align-option"] : ""
      } ${className}`}
    >
      <select className={styles["select-with-icon-select"]} {...otherProps}>
        {children}
      </select>
      <DownIcon className={styles["select-with-icon-icon"]} />
    </div>
  );
}

export function showConfirm(content: any) {
  const div = document.createElement("div");
  div.className = "modal-mask";
  document.body.appendChild(div);

  const root = createRoot(div);
  const closeModal = () => {
    root.unmount();
    div.remove();
  };

  return new Promise<boolean>((resolve) => {
    root.render(
      <Modal
        title={Locale.UI.Confirm}
        actions={[
          <IconButton
            key="cancel"
            text={Locale.UI.Cancel}
            onClick={() => {
              resolve(false);
              closeModal();
            }}
            icon={<CancelIcon />}
            tabIndex={0}
            bordered
            shadow
          ></IconButton>,
          <IconButton
            key="confirm"
            text={Locale.UI.Confirm}
            type="primary"
            onClick={() => {
              resolve(true);
              closeModal();
            }}
            icon={<ConfirmIcon />}
            tabIndex={0}
            autoFocus
            bordered
            shadow
          ></IconButton>,
        ]}
        onClose={closeModal}
      >
        {content}
      </Modal>,
    );
  });
}

function PromptInput(props: {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  const [input, setInput] = useState(props.value);
  const onInput = (value: string) => {
    props.onChange(value);
    setInput(value);
  };

  return (
    <textarea
      className={styles["modal-input"]}
      autoFocus
      value={input}
      onInput={(e) => onInput(e.currentTarget.value)}
      rows={props.rows ?? 3}
    ></textarea>
  );
}

export function showPrompt(content: any, value = "", rows = 3) {
  const div = document.createElement("div");
  div.className = "modal-mask";
  document.body.appendChild(div);

  const root = createRoot(div);
  const closeModal = () => {
    root.unmount();
    div.remove();
  };

  return new Promise<string>((resolve) => {
    let userInput = value;

    root.render(
      <Modal
        title={content}
        actions={[
          <IconButton
            key="cancel"
            text={Locale.UI.Cancel}
            onClick={() => {
              closeModal();
            }}
            icon={<CancelIcon />}
            bordered
            shadow
            tabIndex={0}
          ></IconButton>,
          <IconButton
            key="confirm"
            text={Locale.UI.Confirm}
            type="primary"
            onClick={() => {
              resolve(userInput);
              closeModal();
            }}
            icon={<ConfirmIcon />}
            bordered
            shadow
            tabIndex={0}
          ></IconButton>,
        ]}
        onClose={closeModal}
      >
        <PromptInput
          onChange={(val) => (userInput = val)}
          value={value}
          rows={rows}
        ></PromptInput>
      </Modal>,
    );
  });
}

export function showImageModal(
  img: string,
  defaultMax?: boolean,
  style?: CSSProperties,
  boxStyle?: CSSProperties,
) {
  showModal({
    title: Locale.Export.Image.Modal,
    defaultMax: defaultMax,
    children: (
      <div style={{ display: "flex", justifyContent: "center", ...boxStyle }}>
        <img
          src={img}
          alt="preview"
          style={
            style ?? {
              maxWidth: "100%",
            }
          }
        ></img>
      </div>
    ),
  });
}

export function Selector<T>(props: {
  items: Array<{
    title: string;
    subTitle?: string;
    value: T;
    disable?: boolean;
    isVision?: boolean;
  }>;
  defaultSelectedValue?: T[] | T;
  onSelection?: (selection: T[]) => void;
  onClose?: () => void;
  multiple?: boolean;
}) {
  const [selectedValues, setSelectedValues] = useState<T[]>(
    Array.isArray(props.defaultSelectedValue)
      ? props.defaultSelectedValue
      : props.defaultSelectedValue !== undefined
      ? [props.defaultSelectedValue]
      : [],
  );

  const handleSelection = (e: MouseEvent, value: T) => {
    if (props.multiple) {
      e.stopPropagation();
      const newSelectedValues = selectedValues.includes(value)
        ? selectedValues.filter((v) => v !== value)
        : [...selectedValues, value];
      setSelectedValues(newSelectedValues);
      props.onSelection?.(newSelectedValues);
    } else {
      setSelectedValues([value]);
      props.onSelection?.([value]);
      props.onClose?.();
    }
  };

  return (
    <div className={styles["selector"]} onClick={() => props.onClose?.()}>
      <div className={styles["selector-content"]}>
        <List>
          {props.items.map((item, i) => {
            const selected = selectedValues.includes(item.value);
            return (
              <ListItem
                className={`${styles["selector-item"]} ${
                  item.disable && styles["selector-item-disabled"]
                }`}
                key={i}
                title={item.title}
                subTitle={item.subTitle}
                icon={item.isVision ? <VisionEyeIcon /> : <></>}
                onClick={(e) => {
                  if (item.disable) {
                    e.stopPropagation();
                  } else {
                    handleSelection(e, item.value);
                  }
                }}
              >
                {selected ? (
                  <div
                    style={{
                      height: 10,
                      width: 10,
                      backgroundColor: "var(--primary)",
                      borderRadius: 10,
                    }}
                  ></div>
                ) : (
                  <></>
                )}
              </ListItem>
            );
          })}
        </List>
      </div>
    </div>
  );
}

export function PluginsSelector<T>(props: {
  items: Array<{
    title: string;
    subTitle?: string;
    value: T;
    disable?: boolean;
    helpLink?: string;
  }>;
  defaultSelectedValue?: T[] | T;
  onSelection?: (selection: T[]) => void;
  onClose?: () => void;
  multiple?: boolean;
}) {
  const [selectedValues, setSelectedValues] = useState<T[]>(
    Array.isArray(props.defaultSelectedValue)
      ? props.defaultSelectedValue
      : props.defaultSelectedValue !== undefined
      ? [props.defaultSelectedValue]
      : [],
  );

  const handleSelection = (e: MouseEvent, value: T) => {
    if (props.multiple) {
      e.stopPropagation();
      const newSelectedValues = selectedValues.includes(value)
        ? selectedValues.filter((v) => v !== value)
        : [...selectedValues, value];
      setSelectedValues(newSelectedValues);
      props.onSelection?.(newSelectedValues);
    } else {
      setSelectedValues([value]);
      props.onSelection?.([value]);
      props.onClose?.();
    }
  };

  return (
    <div
      className={`${styles["selector"]} ${styles["plugins-selector"]}`}
      onClick={() => props.onClose?.()}
    >
      <div className={styles["selector-content"]}>
        <div className={styles["help-link-container"]}>
          <a
            href="https://blog.alz-ai.cn/tags/tips"
            target="_blank"
            rel="noopener noreferrer"
            className={styles["help-link"]}
            onClick={(e) => e.stopPropagation()}
          >
            <span>💡</span>
            了解插件的使用
          </a>
        </div>
        <List>
          {props.items.map((item, i) => {
            const selected = selectedValues.includes(item.value);
            return (
              <ListItem
                className={`${styles["selector-item"]} ${
                  item.disable && styles["selector-item-disabled"]
                }`}
                key={i}
                title={item.title}
                subTitle={item.subTitle}
                onClick={(e) => {
                  if (item.disable) {
                    e.stopPropagation();
                  } else {
                    handleSelection(e, item.value);
                  }
                }}
              >
                <>
                  {item.helpLink && (
                    <a
                      href={item.helpLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles["help-icon"]}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <HelpIcon />
                    </a>
                  )}
                  {selected && (
                    <div
                      style={{
                        height: 10,
                        width: 10,
                        backgroundColor: "var(--primary)",
                        borderRadius: 10,
                      }}
                    ></div>
                  )}
                </>
              </ListItem>
            );
          })}
        </List>
      </div>
    </div>
  );
}

export function FullScreen(props: any) {
  const { children, right = 10, top = 10, ...rest } = props;
  const ref = useRef<HTMLDivElement>();
  const [fullScreen, setFullScreen] = useState(false);
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      ref.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);
  useEffect(() => {
    const handleScreenChange = (e: any) => {
      if (e.target === ref.current) {
        setFullScreen(!!document.fullscreenElement);
      }
    };
    document.addEventListener("fullscreenchange", handleScreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleScreenChange);
    };
  }, []);
  return (
    <div ref={ref} style={{ position: "relative" }} {...rest}>
      <div style={{ position: "absolute", right, top }}>
        <IconButton
          icon={fullScreen ? <MinIcon /> : <MaxIcon />}
          onClick={toggleFullscreen}
          bordered
        />
      </div>
      {children}
    </div>
  );
}

export function ModelSelectorWithGPTs<T>(props: {
  items: Array<{
    title: string;
    subTitle?: string;
    value: T;
    disable?: boolean;
    isVision?: boolean;
  }>;
  defaultSelectedValue?: T;
  onSelection?: (selection: T) => void;
  onClose?: () => void;
  onLoadMore?: () => void;

  gizmos: Array<Gizmo>;
  setGizmos?: (gizmos: Gizmo[]) => void;
  isLoadingGpts?: boolean;
  setIsLoadingGpts?: (loading: boolean) => void;
}) {
  const [activeTab, setActiveTab] = useState<"models" | "gpts">("models");
  const [selectedValue, setSelectedValue] = useState<T | undefined>(
    props.defaultSelectedValue,
  );
  const [searchTerm, setSearchTerm] = useState("");

  const [gptsType, setGptsType] = useState<"all" | "query">("all");

  useEffect(() => {
    const [currentModel] = selectedValue?.toString().split("@") ?? [];
    if (currentModel?.startsWith("gpt-4-gizmo")) {
      setActiveTab("gpts");
    }
  }, [selectedValue]);

  const handleSelection = (value: T) => {
    if (activeTab === "gpts") {
      value = `${value}@OpenAI` as T;
    }

    setSelectedValue(value);
    props.onSelection?.(value);
    props.onClose?.();
  };

  // const filteredGizmos = props.gizmos.filter(gizmo =>
  //   gizmo.name.toLowerCase().includes(searchTerm.toLowerCase())
  // );

  return (
    <div
      className={`${styles["selector"]} ${styles["selector-with-gpts"]}`}
      onClick={() => props.onClose?.()}
    >
      <div className={styles["selector-content"]}>
        <div className={styles["selector-tabs"]}>
          <div
            className={`${styles["selector-tab"]} ${
              activeTab === "models" ? styles["active"] : ""
            }`}
            onClick={(e) => {
              e.stopPropagation();
              setActiveTab("models");
            }}
          >
            模型
          </div>
          <div
            className={`${styles["selector-tab"]} ${
              activeTab === "gpts" ? styles["active"] : ""
            }`}
            onClick={(e) => {
              e.stopPropagation();
              setActiveTab("gpts");
            }}
          >
            GPTs
          </div>
        </div>

        {activeTab === "gpts" && (
          <div className={styles["gpts-search-container"]}>
            <input
              type="text"
              placeholder="搜索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles["gpts-search-input"]}
              onFocus={(e) => {
                e.stopPropagation();
                // 移除placeholder
                e.target.placeholder = "";
              }}
              onBlur={(e) => {
                e.stopPropagation();
                // 恢复placeholder
                e.target.placeholder = "搜索...";
              }}
              onClick={(e) => {
                // 阻止冒泡
                e.stopPropagation();
              }}
            />
            {gptsType === "query" && (
              <button
                type="button"
                className={styles["gpts-search-button"]}
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchTerm("");
                  setGptsType("all");
                  props.setIsLoadingGpts?.(true);
                  fetch(CHATGPT_GPTS_DATA_URL)
                    .then((res) => res.json())
                    .then((data) => {
                      props.setGizmos?.(data?.gpts ?? []);
                      props.setIsLoadingGpts?.(false);
                    })
                    .catch((err) => {
                      console.error("Failed to fetch gpts:", err);
                      props.setIsLoadingGpts?.(false);
                    });
                }}
              >
                <ClearQueryIcon />
              </button>
            )}
            <button
              type="submit"
              className={styles["gpts-search-button"]}
              onClick={(e) => {
                e.stopPropagation();
                props.setIsLoadingGpts?.(true);
                // 通过searchTerm来搜索
                fetch(`${CHATGPT_GPTS_QUERY_URL}?q=${searchTerm}`)
                  .then((res) => res.json())
                  .then((data) => {
                    setGptsType("query");
                    props.setGizmos?.(data.data?.list ?? []);
                    props.setIsLoadingGpts?.(false);
                  })
                  .catch((err) => {
                    console.error("Failed to fetch gpts:", err);
                    props.setIsLoadingGpts?.(false);
                  });
              }}
            >
              <SearchIcon />
            </button>
          </div>
        )}

        {props.isLoadingGpts && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "20px 0",
              height: "100px",
            }}
          >
            <LoadingIcon />
          </div>
        )}

        {!props.isLoadingGpts && (
          <ListWithStyle
            className={
              activeTab === "models"
                ? styles["models-list"]
                : styles["gpts-list"]
            }
          >
            {activeTab === "models"
              ? props.items.map((item, i) => {
                  const selected = selectedValue === item.value;
                  return (
                    <ListItem
                      className={`${styles["selector-item"]} ${
                        item.disable && styles["selector-item-disabled"]
                      } ${selected && styles["selector-item-selected"]}`}
                      key={i}
                      title={item.title}
                      subTitle={item.subTitle}
                      icon={item.isVision ? <VisionEyeIcon /> : <></>}
                      onClick={(e) => {
                        if (item.disable) {
                          e.stopPropagation();
                        } else {
                          handleSelection(item.value);
                        }
                      }}
                    >
                      {selected ? (
                        <div
                          style={{
                            height: 10,
                            width: 10,
                            backgroundColor: "var(--primary)",
                            borderRadius: 10,
                          }}
                        ></div>
                      ) : (
                        <></>
                      )}
                    </ListItem>
                  );
                })
              : props.gizmos.map((item, i) => {
                  const selected =
                    selectedValue === `${item.gid}@${ServiceProvider.OpenAI}`;
                  return (
                    <ListItem
                      className={`${styles["selector-item"]} ${
                        selected && styles["selector-item-selected"]
                      } `}
                      key={i}
                      title={item.name}
                      subTitle={item.info}
                      icon={
                        <img
                          src={item.logo}
                          style={{ width: 64, height: 64 }}
                        />
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelection(item.gid as T);
                      }}
                    >
                      <></>
                    </ListItem>
                  );
                })}
          </ListWithStyle>
        )}

        {activeTab === "gpts" && searchTerm === "" && gptsType === "all" && (
          <>
            <div className={styles["gpts-load-more-container"]}>
              <a
                className={styles["gpts-load-more-button"]}
                onClick={(e) => {
                  e.stopPropagation();
                  props.onLoadMore?.();
                }}
              >
                更多模型
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
