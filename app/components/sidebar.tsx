import { useEffect, useRef, useState } from "react";

import styles from "./home.module.scss";

import { IconButton } from "./button";
import SettingsIcon from "../icons/settings.svg";
import GithubIcon from "../icons/github.svg";
import ChatGptIcon from "../icons/chatgpt.svg";
import AddIcon from "../icons/add.svg";
import CloseIcon from "../icons/close.svg";
import MaskIcon from "../icons/mask.svg";
import PluginIcon from "../icons/plugin.svg";
import DragIcon from "../icons/drag.svg";
import wxcode from "../images/wxcode.png";
import Locale from "../locales";

import { useAppConfig, useChatStore } from "../store";
import { showModal } from "./ui-lib";

import {
  MAX_SIDEBAR_WIDTH,
  MIN_SIDEBAR_WIDTH,
  NARROW_SIDEBAR_WIDTH,
  Path,
  REPO_URL,
} from "../constant";

import { Link, useNavigate } from "react-router-dom";
import { useMobileScreen } from "../utils";
import dynamic from "next/dynamic";
import { showConfirm, showToast } from "./ui-lib";

const ChatList = dynamic(async () => (await import("./chat-list")).ChatList, {
  loading: () => null,
});

function useHotKey() {
  const chatStore = useChatStore();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey) {
        if (e.key === "ArrowUp") {
          chatStore.nextSession(-1);
        } else if (e.key === "ArrowDown") {
          chatStore.nextSession(1);
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });
}

function useDragSideBar() {
  const limit = (x: number) => Math.min(MAX_SIDEBAR_WIDTH, x);

  const config = useAppConfig();
  const startX = useRef(0);
  const startDragWidth = useRef(config.sidebarWidth ?? 300);
  const lastUpdateTime = useRef(Date.now());

  const handleMouseMove = useRef((e: MouseEvent) => {
    if (Date.now() < lastUpdateTime.current + 50) {
      return;
    }
    lastUpdateTime.current = Date.now();
    const d = e.clientX - startX.current;
    const nextWidth = limit(startDragWidth.current + d);
    config.update((config) => (config.sidebarWidth = nextWidth));
  });

  const handleMouseUp = useRef(() => {
    startDragWidth.current = config.sidebarWidth ?? 300;
    window.removeEventListener("mousemove", handleMouseMove.current);
    window.removeEventListener("mouseup", handleMouseUp.current);
  });

  const onDragMouseDown = (e: MouseEvent) => {
    startX.current = e.clientX;

    window.addEventListener("mousemove", handleMouseMove.current);
    window.addEventListener("mouseup", handleMouseUp.current);
  };
  const isMobileScreen = useMobileScreen();
  const shouldNarrow =
    !isMobileScreen && config.sidebarWidth < MIN_SIDEBAR_WIDTH;

  useEffect(() => {
    const barWidth = shouldNarrow
      ? NARROW_SIDEBAR_WIDTH
      : limit(config.sidebarWidth ?? 300);
    const sideBarWidth = isMobileScreen ? "100vw" : `${barWidth}px`;
    document.documentElement.style.setProperty("--sidebar-width", sideBarWidth);
  }, [config.sidebarWidth, isMobileScreen, shouldNarrow]);

  return {
    onDragMouseDown,
    shouldNarrow,
  };
}

export function SideBar(props: { className?: string }) {
  const chatStore = useChatStore();

  // drag side bar
  const { onDragMouseDown, shouldNarrow } = useDragSideBar();
  const navigate = useNavigate();
  const config = useAppConfig();

  useHotKey();

  return (
    <div
      className={`${styles.sidebar} ${props.className} ${
        shouldNarrow && styles["narrow-sidebar"]
      }`}
    >
      <div className={styles["sidebar-header"]}>
        <div className={styles["sidebar-title"]}>FreeGPT for all</div>
        <div className={styles["sidebar-sub-title"]}>
          新闻：
          <br />
          09/26：免费站开放最后几天。献礼国庆，十一之后关闭。
          <br />
          <br />
          <a
            href="#"
            className={styles["more-news"]}
            onClick={() => {
              // setShowNewsModal(!showNewsModal);
              showModal({
                title: "FreeGPT for all",
                children: (
                  <div>
                    <p>09/13</p>
                    <p>
                    3.5免费站暂停一下，成本上升，刷的人太多撑不住。预计1-2天恢复。付费用户不受影响。
                      <br />
                      <br />
                      如需独享付费账号请私信。GPT 4账号，15元起
                      <br />
                      <br />
                      微信ID：alzheimer-ai
                      <br />
                      <img src={wxcode.src} />
                    </p>
                    <hr />
                    <p>08/04</p>
                    <p>
                      本月初免费站恢复试运行，看看新买的key能存活多久。
                      <br />
                      <br />
                      如需独享付费账号请私信。GPT 4账号，15元起
                    </p>
                    <hr />
                    <p>7/22</p>
                    <p>
                      当前因打赏款项耗尽，免费站暂停。7月1日 - 21日
                      有打赏过的朋友请私信联系。
                      <br />
                      无论金额多少，赠送3.5免费账号一枚
                      <br />
                      <br />
                    </p>
                    <hr />
                    <p>7/18</p>
                    <p>
                      支持GPT 4灵活购买，15元起。收入80%继续投入免费站运营
                      <br />
                      详询微信：alzheimer-ai
                    </p>
                    <hr />
                    <p>7/17</p>
                    <p>
                      找到一个比之前更廉价、灵活、而且稳定的GPT 4的渠道。🎈🎉🎊
                    </p>
                    <hr />
                    <p>7/12</p>
                    <p>
                      从7月4号官方新一轮风控，尝试了很多新的渠道。大部分都只能存活几小时，就又被封掉了。这周有了新的解决方案，成本也比之前急剧上涨。从后台看，项目的使用人数不少。建议经常使用，又有些余力的朋友，考虑每月固定打赏个几块钱。能有一定比例的固定打赏，是这个平台能持续下去先决条件。打赏金额，至少80%会投入API购买。
                    </p>
                    <p>
                      今天项目恢复，多亏“支柱”的大额打赏。感谢他凭一己之力，支持众多用户接下来几天的运营开销。🍻🍻🍻
                    </p>
                  </div>
                ),
              });
            }}
          >
            查看详情
          </a>
        </div>
        <div className={styles["sidebar-logo"] + " no-dark"}>
          <ChatGptIcon />
        </div>
      </div>

      <div className={styles["sidebar-header-bar"]}>
        <IconButton
          icon={<MaskIcon />}
          text={shouldNarrow ? undefined : Locale.Mask.Name}
          className={styles["sidebar-bar-button"]}
          onClick={() => navigate(Path.NewChat, { state: { fromHome: true } })}
          shadow
        />
        <IconButton
          icon={<PluginIcon />}
          text={shouldNarrow ? undefined : Locale.Plugin.Name}
          className={styles["sidebar-bar-button"]}
          onClick={() => showToast(Locale.WIP)}
          shadow
        />
      </div>

      <div
        className={styles["sidebar-body"]}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            navigate(Path.Home);
          }
        }}
      >
        <ChatList narrow={shouldNarrow} />
      </div>

      <div className={styles["sidebar-tail"]}>
        <div className={styles["sidebar-actions"]}>
          <div className={styles["sidebar-action"] + " " + styles.mobile}>
            <IconButton
              icon={<CloseIcon />}
              onClick={async () => {
                if (await showConfirm(Locale.Home.DeleteChat)) {
                  chatStore.deleteSession(chatStore.currentSessionIndex);
                }
              }}
            />
          </div>
          <div className={styles["sidebar-action"]}>
            <Link to={Path.Settings}>
              <IconButton icon={<SettingsIcon />} shadow />
            </Link>
          </div>
          <div className={styles["sidebar-action"]}>
            <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
              <IconButton icon={<GithubIcon />} shadow />
            </a>
          </div>
        </div>
        <div>
          <IconButton
            icon={<AddIcon />}
            text={shouldNarrow ? undefined : Locale.Home.NewChat}
            onClick={() => {
              if (config.dontShowMaskSplashScreen) {
                chatStore.newSession();
                navigate(Path.Chat);
              } else {
                navigate(Path.NewChat);
              }
            }}
            shadow
          />
        </div>
      </div>

      <div
        className={styles["sidebar-drag"]}
        onMouseDown={(e) => onDragMouseDown(e as any)}
      >
        <DragIcon />
      </div>
    </div>
  );
}
