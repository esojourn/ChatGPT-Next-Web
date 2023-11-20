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
import mjsample from "../images/mjsample.png";
import chat from "../images/chat.jpg";
import qrcode from "../images/qrcode128.png";
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
        <div className={styles["sidebar-title"]}>GPT for all</div>
        <div className={styles["sidebar-sub-title"]}>
          新闻：
          <br />
          免费站人太多时，会暂停几小时，可以稍后再来。
          <br />
          付费用户扣费倍率下调。目前费率相当于官方的90%。
          <br />
          新开通Midjourney，直连。多人拼车不限量 / 独享每月200张 / 独享不限量。
          <br />
          <br />
          <a
            href="#"
            className={styles["more-news"]}
            onClick={() => {
              // setShowNewsModal(!showNewsModal);
              showModal({
                title: "GPT for all",
                children: (
                  <div>
                    <p>00/00</p>
                    <p>
                      付费稳定账号，含GPT 4，15元起
                      <br />
                      Midjourney，直连。
                      <br />
                      - 独享10美金，基础会员99元/月 限200张
                      <br />
                      - 独享30美金，标准会员279元/月 不限量
                      <br />
                      - 3人共享30美金标准会员，99元/月，不限量
                      <br />
                      - 6人共享30美金标准会员，59元/月，不限量
                      <br />
                      <br />
                      <img src={mjsample.src} className={styles["mjsample"]} />
                      <br />
                      <br />
                      微信ID：alzheimer-ai
                      <br />
                      <img src={wxcode.src} />
                    </p>
                    <hr />
                    <p>23/10/25</p>
                    <p>抽空把Midjourney平台准备好了。</p>
                    <hr />
                    <p>09/30</p>
                    <p>扣费倍率下调，目前相关于官方的90%</p>
                    <p>费率如有变化，我会随时在公告里注明。</p>
                    <hr />
                    <p>09/26</p>
                    <h1>通知</h1>
                    <p>免费站最后开放几天，十一之后准备关了。献礼国庆。</p>
                    <p>
                      以前看动物世界，羚羊敢于在狮子旁边漫步。旁白解释说，这是因为它们知道这时候狮子已经吃饱了。
                    </p>
                    <p>
                      最近发生了两件事，羚羊应该警觉。毕竟上有老下有小，浑身软肋，需要每天自我审查一下比较好。
                    </p>
                    <p>
                      一件事离我比较远，菜农卖了10几块蔬菜，被指农药超标，罚款几万。另一件事河北程序员使用GitHub和zoom工作，被认定所有收入违法，罚款100万。过去20年，狮子是饱的。最近两年，狮子饿了。
                    </p>
                    <p>
                      一直觉得大城市的底线和宽容度高一些，但是第二件事离我很近。我需要坦白，我的职业技能全部都是来自于google里查到的知识。毕竟学校讲授的内容太过时。外面在用oracle的时候，学校里只讲foxbase。很多实用的技术，我在学校里连名字都没有听过。这样看来，脑子里的知识来源已经违法了。不知道会不会枪毙。
                    </p>

                    <h1>初衷</h1>
                    <p>
                      做免费站的想法，来源于ChatGPT横空出世时的惊艳。如同20多年前，从DOS命令行时代，看到Photoshop里那只翠绿红眼的青蛙图片。所有人都知道，又一项改变未来，也会影响很多人就业的技术革新出现了。地球上，大部分的人都可以免费使用。但有极少数地方的人，需要大量技能，才能有这个机会。我希望能分享这样的机会，不成为少数人的特权，也希望借这个热度尝试一下自媒体运营。
                    </p>
                    <p>
                      开始给自己定了一个小目标，公众号关注1000人就不做了。没想到在风口，这个目标太小了，瞬间达成。在我犹豫关闭时，一位学生朋友的打赏，让我决心继续走下去。
                    </p>
                    <p>
                      <img src={chat.src} width="30%" />
                    </p>

                    <h1>结语</h1>
                    <p>
                      我知道用户里有不少大学生。当年美国恶法《禁酒令》实行的时候，酒精饮料从来没有消亡，我这小破站关闭之后，相信你们不难找到其他替代。
                    </p>
                    <p>
                      还有一些老骨灰的繁絮唠叨：在AI造成变革的时代中，保持对新事物的兴趣，对抗自己的惰性，多读一些好书，学好英文。
                    </p>
                    <p>
                      后面我准备回到最初的想法，在条件允许范围内，授人以渔，分享一些自己感兴趣的内容。
                    </p>
                    <p>
                      “阿兹海默”，在公众号和小红书中继续分享，有缘再会！
                      <br />
                      <img src={qrcode.src} width="100px" />
                    </p>
                    <p>
                      <i>
                        ** GPT 4和3.5
                        16K的付费用户不用担心，除非遇到不可抗力。我会负责支持维护到底。
                      </i>
                    </p>

                    <hr />
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
