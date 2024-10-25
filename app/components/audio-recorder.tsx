import React, { useState, useEffect } from "react";
import styles from "./chat.module.scss";
import { IconButton } from "@/app/components/button";
import AudioRecorderIcon from "../icons/audio-recorder.svg";
import Locales from "@/app/locales";

interface AudioRecorderProps {
  setAudioURL: (url: string) => void;
}

const AudioRecorder = (props: AudioRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null,
  );
  const [error, setError] = useState("");
  const [recordedTime, setRecordedTime] = useState(0); // 记录已录制的时间
  const [timer, setTimer] = useState<number | NodeJS.Timeout | null>(null); // 用来存储定时器

  useEffect(() => {
    // 请求用户权限
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        // 设置媒体捕获
        const newMediaRecorder = new MediaRecorder(stream);
        setMediaRecorder(newMediaRecorder);

        // 处理数据
        newMediaRecorder.ondataavailable = (e) => {
          props.setAudioURL(URL.createObjectURL(e.data));
        };
      })
      .catch((error) => {
        console.error("Error accessing the microphone", error);
        // TODO: 增加错误信息，结合到NextWeb
      });
  }, []);

  useEffect(() => {
    if (isRecording) {
      const newTimer = setInterval(() => {
        setRecordedTime((prevTime) => prevTime + 1);
      }, 1000);

      setTimer(newTimer);
    } else if (timer) {
      clearInterval(timer);
      setTimer(null);
    }

    // 清除定时器
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [isRecording, timer]);

  const startRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.start();
      setIsRecording(true);
      setRecordedTime(0); // 开始录音时重置已录制时间
      setError("");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  // 将秒数格式化为 MM:SS 的形式
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <IconButton
      text={
        isRecording
          ? Locales.Chat.AudioRecorder.Stop
          : Locales.Chat.AudioRecorder.Start
      }
      icon={<AudioRecorderIcon />}
      onClick={isRecording ? stopRecording : startRecording}
      className={`${styles["audio-recorder-button"]} ${
        isRecording ? styles["recording"] : ""
      }`}
      type="primary"
    />
  );
};

export default AudioRecorder;
