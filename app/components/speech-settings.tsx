import React, { useState } from "react";
import { Select } from "./ui-lib";
import {
  DEFAULT_VOICE,
  DEFAULT_AUDIO_FORMAT,
  TTS_Audio_Format,
  TTS_Voice,
} from "@/app/constant";
import { useChatStore } from "@/app/store";
import Locals from "@/app/locales";
import styles from "./model-settings.module.scss";

const SpeechSettings = () => {
  const chatStore = useChatStore();
  const session = chatStore.currentSession();

  const [voice, setVoice] = useState(session?.settings?.voice || DEFAULT_VOICE);
  const [response_format, setResponseFormat] = useState(
    session?.settings?.responseFormat || DEFAULT_AUDIO_FORMAT,
  );
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const defaultSettings = {
    voice: DEFAULT_VOICE,
    responseFormat: DEFAULT_AUDIO_FORMAT,
    playbackSpeed: 1,
  };

  return (
    <div className={styles["horizontal-layout"]}>
      <label>{Locals.Chat.Settings.Voice}</label>
      <Select
        value={voice}
        onChange={(e) => {
          setVoice(e.target.value);
          chatStore.updateCurrentSession((session) => {
            if (!session.settings) {
              session.settings = defaultSettings;
            }
            session.settings.voice = e.target.value;
          });
        }}
      >
        {Object.entries(TTS_Voice).map(([k, v]) => (
          <option value={v} key={k}>
            {k}
          </option>
        ))}
      </Select>
      <label>{Locals.Chat.Settings.responseFormat}</label>
      <Select
        value={response_format}
        onChange={(e) => {
          setResponseFormat(e.target.value);
          chatStore.updateCurrentSession((session) => {
            if (!session.settings) {
              session.settings = defaultSettings;
            }
            session.settings.responseFormat = e.target.value;
          });
        }}
      >
        {Object.entries(TTS_Audio_Format).map(([k, v]) => (
          <option value={v} key={k}>
            {k}
          </option>
        ))}
      </Select>
      {/*<label>速率</label>*/}
      {/*<InputRange*/}
      {/*  value="1.00"*/}
      {/*  min="0.25"*/}
      {/*  max="4.00"*/}
      {/*  step="0.01"*/}
      {/*  onChange={(e) => {*/}
      {/*    setPlaybackSpeed(e.currentTarget.valueAsNumber);*/}
      {/*    // chatStore.updateCurrentSession((session) => {*/}
      {/*    //   if (!session.settings) {*/}
      {/*    //     session.settings = defaultSettings;*/}
      {/*    //   }*/}
      {/*    //   session.settings.playbackSpeed = e.currentTarget.valueAsNumber;*/}
      {/*    // });*/}
      {/*  }}></InputRange>*/}
    </div>
  );
};

export default SpeechSettings;
