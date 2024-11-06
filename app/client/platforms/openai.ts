"use client";
// azure and openai, using same models. so using same LLMApi.
import {
  ApiPath,
  OPENAI_BASE_URL,
  DEFAULT_MODELS,
  OpenaiPath,
  Azure,
  REQUEST_TIMEOUT_MS,
  ServiceProvider,
  TTS_Audio_Format,
  TTS_Voice,
} from "@/app/constant";
import {
  ChatMessageTool,
  useAccessStore,
  useAppConfig,
  useChatStore,
  usePluginStore,
} from "@/app/store";
import { collectModelsWithDefaultModel } from "@/app/utils/model";
import {
  preProcessImageContent,
  uploadImage,
  base64Image2Blob,
  stream,
} from "@/app/utils/chat";
import { cloudflareAIGatewayUrl } from "@/app/utils/cloudflare";
import { DalleSize, DalleQuality, DalleStyle } from "@/app/typing";

import {
  AudioOptions,
  AudioWithFileOptions,
  ChatOptions,
  getHeaders,
  getHeadersWithAudio,
  LLMApi,
  LLMModel,
  LLMUsage,
  MultimodalContent,
  SpeechOptions,
} from "../api";
import Locale from "../../locales";
import { getClientConfig } from "@/app/config/client";
import {
  getMessageTextContent,
  isVisionModel,
  isDalle3 as _isDalle3,
  uploadToS3,
} from "@/app/utils";
import { showToast } from "@/app/components/ui-lib";

export interface OpenAIListModelResponse {
  object: string;
  data: Array<{
    id: string;
    object: string;
    root: string;
  }>;
}

export interface RequestPayload {
  messages: {
    role: "system" | "user" | "assistant";
    content: string | MultimodalContent[];
  }[];
  stream?: boolean;
  model: string;
  temperature: number;
  presence_penalty: number;
  frequency_penalty: number;
  top_p: number;
  max_tokens?: number;
}

export interface DalleRequestPayload {
  model: string;
  prompt: string;
  response_format: "url" | "b64_json";
  n: number;
  size: DalleSize;
  quality: DalleQuality;
  style: DalleStyle;
}

export class ChatGPTApi implements LLMApi {
  private disableListModels = true;

  path(path: string): string {
    const accessStore = useAccessStore.getState();

    let baseUrl = "";

    const isAzure = path.includes("deployments");
    if (accessStore.useCustomConfig) {
      if (isAzure && !accessStore.isValidAzure()) {
        throw Error(
          "incomplete azure config, please check it in your settings page",
        );
      }

      baseUrl = isAzure ? accessStore.azureUrl : accessStore.openaiUrl;
    }

    if (baseUrl.length === 0) {
      const isApp = !!getClientConfig()?.isApp;
      const apiPath = isAzure ? ApiPath.Azure : ApiPath.OpenAI;
      baseUrl = isApp ? OPENAI_BASE_URL : apiPath;
    }

    if (baseUrl.endsWith("/")) {
      baseUrl = baseUrl.slice(0, baseUrl.length - 1);
    }
    if (
      !baseUrl.startsWith("http") &&
      !isAzure &&
      !baseUrl.startsWith(ApiPath.OpenAI)
    ) {
      baseUrl = "https://" + baseUrl;
    }

    console.log("[Proxy Endpoint] ", baseUrl, path);

    // try rebuild url, when using cloudflare ai gateway in client
    return cloudflareAIGatewayUrl([baseUrl, path].join("/"));
  }

  async extractMessage(res: any) {
    if (res.error) {
      return "```\n" + JSON.stringify(res, null, 4) + "\n```";
    }
    // dalle3 model return url, using url create image message
    if (res.data) {
      let url = res.data?.at(0)?.url ?? "";
      const b64_json = res.data?.at(0)?.b64_json ?? "";
      if (!url && b64_json) {
        // uploadImage
        url = await uploadImage(base64Image2Blob(b64_json, "image/png"));
      }
      return [
        {
          type: "image_url",
          image_url: {
            url,
          },
        },
      ];
    }
    return res.choices?.at(0)?.message?.content ?? res;
  }

  async speech(options: SpeechOptions): Promise<ArrayBuffer> {
    const requestPayload = {
      model: options.model,
      input: options.input,
      voice: options.voice,
      response_format: options.response_format,
      speed: options.speed,
    };

    console.log("[Request] openai speech payload: ", requestPayload);

    const controller = new AbortController();
    options.onController?.(controller);

    try {
      const speechPath = this.path(OpenaiPath.SpeechPath);
      const speechPayload = {
        method: "POST",
        body: JSON.stringify(requestPayload),
        signal: controller.signal,
        headers: getHeaders(),
      };

      // make a fetch request
      const requestTimeoutId = setTimeout(
        () => controller.abort(),
        REQUEST_TIMEOUT_MS,
      );

      const res = await fetch(speechPath, speechPayload);
      clearTimeout(requestTimeoutId);
      return await res.arrayBuffer();
    } catch (e) {
      console.log("[Request] failed to make a speech request", e);
      throw e;
    }
  }

  async chat(options: ChatOptions) {
    const modelConfig = {
      ...useAppConfig.getState().modelConfig,
      ...useChatStore.getState().currentSession().mask.modelConfig,
      ...{
        model: options.config.model,
        providerName: options.config.providerName,
      },
    };

    let requestPayload: RequestPayload | DalleRequestPayload;

    const isDalle3 = _isDalle3(options.config.model);
    const isO1 = options.config.model.startsWith("o1");
    if (isDalle3) {
      const prompt = getMessageTextContent(
        options.messages.slice(-1)?.pop() as any,
      );
      requestPayload = {
        model: options.config.model,
        prompt,
        // URLs are only valid for 60 minutes after the image has been generated.
        response_format: "b64_json", // using b64_json, and save image in CacheStorage
        n: 1,
        size: options.config?.size ?? "1024x1024",
        quality: options.config?.quality ?? "standard",
        style: options.config?.style ?? "vivid",
      };
    } else {
      const visionModel = isVisionModel(options.config.model);
      const messages: ChatOptions["messages"] = [];
      for (const v of options.messages) {
        const content = visionModel
          ? await preProcessImageContent(v.content)
          : getMessageTextContent(v);
        if (!(isO1 && v.role === "system"))
          messages.push({ role: v.role, content });
      }

      // O1 not support image, tools (plugin in ChatGPTNextWeb) and system, stream, logprobs, temperature, top_p, n, presence_penalty, frequency_penalty yet.
      requestPayload = {
        messages,
        stream: !isO1 ? options.config.stream : false,
        model: modelConfig.model,
        temperature: !isO1 ? modelConfig.temperature : 1,
        presence_penalty: !isO1 ? modelConfig.presence_penalty : 0,
        frequency_penalty: !isO1 ? modelConfig.frequency_penalty : 0,
        top_p: !isO1 ? modelConfig.top_p : 1,
        // max_tokens: Math.max(modelConfig.max_tokens, 1024),
        // Please do not ask me why not send max_tokens, no reason, this param is just shit, I dont want to explain anymore.
      };

      // add max_tokens to vision model
      if (visionModel) {
        requestPayload["max_tokens"] = Math.max(modelConfig.max_tokens, 4000);
      }
    }

    console.log("[Request] openai payload: ", requestPayload);

    const shouldStream = !isDalle3 && !!options.config.stream && !isO1;
    const controller = new AbortController();
    options.onController?.(controller);

    try {
      let chatPath = "";
      if (modelConfig.providerName === ServiceProvider.Azure) {
        // find model, and get displayName as deployName
        const { models: configModels, customModels: configCustomModels } =
          useAppConfig.getState();
        const {
          defaultModel,
          customModels: accessCustomModels,
          useCustomConfig,
        } = useAccessStore.getState();
        const models = collectModelsWithDefaultModel(
          configModels,
          [configCustomModels, accessCustomModels].join(","),
          defaultModel,
        );
        const model = models.find(
          (model) =>
            model.name === modelConfig.model &&
            model?.provider?.providerName === ServiceProvider.Azure,
        );
        chatPath = this.path(
          (isDalle3 ? Azure.ImagePath : Azure.ChatPath)(
            (model?.displayName ?? model?.name) as string,
            useCustomConfig ? useAccessStore.getState().azureApiVersion : "",
          ),
        );
      } else {
        chatPath = this.path(
          isDalle3 ? OpenaiPath.ImagePath : OpenaiPath.ChatPath,
        );
      }
      if (shouldStream) {
        let index = -1;
        const [tools, funcs] = usePluginStore
          .getState()
          .getAsTools(
            useChatStore.getState().currentSession().mask?.plugin || [],
          );
        // console.log("getAsTools", tools, funcs);
        stream(
          chatPath,
          requestPayload,
          getHeaders(),
          tools as any,
          funcs,
          controller,
          // parseSSE
          (text: string, runTools: ChatMessageTool[]) => {
            // console.log("parseSSE", text, runTools);
            const json = JSON.parse(text);
            const choices = json.choices as Array<{
              delta: {
                content: string;
                tool_calls: ChatMessageTool[];
              };
            }>;
            const tool_calls = choices[0]?.delta?.tool_calls;
            if (tool_calls?.length > 0) {
              const id = tool_calls[0]?.id;
              const args = tool_calls[0]?.function?.arguments;
              if (id) {
                index += 1;
                runTools.push({
                  id,
                  type: tool_calls[0]?.type,
                  function: {
                    name: tool_calls[0]?.function?.name as string,
                    arguments: args,
                  },
                });
              } else {
                // @ts-ignore
                runTools[index]["function"]["arguments"] += args;
              }
            }
            return choices[0]?.delta?.content;
          },
          // processToolMessage, include tool_calls message and tool call results
          (
            requestPayload: RequestPayload,
            toolCallMessage: any,
            toolCallResult: any[],
          ) => {
            // reset index value
            index = -1;
            // @ts-ignore
            requestPayload?.messages?.splice(
              // @ts-ignore
              requestPayload?.messages?.length,
              0,
              toolCallMessage,
              ...toolCallResult,
            );
          },
          options,
        );
      } else {
        const chatPayload = {
          method: "POST",
          body: JSON.stringify(requestPayload),
          signal: controller.signal,
          headers: getHeaders(),
        };

        // make a fetch request
        const requestTimeoutId = setTimeout(
          () => controller.abort(),
          isDalle3 || isO1 ? REQUEST_TIMEOUT_MS * 4 : REQUEST_TIMEOUT_MS, // dalle3 using b64_json is slow.
        );

        const res = await fetch(chatPath, chatPayload);
        clearTimeout(requestTimeoutId);

        const resJson = await res.json();
        const message = await this.extractMessage(resJson);
        options.onFinish(message);
      }
    } catch (e) {
      console.log("[Request] failed to make a chat request", e);
      options.onError?.(e as Error);
    }
  }
  async usage() {
    const formatDate = (d: Date) =>
      `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d
        .getDate()
        .toString()
        .padStart(2, "0")}`;
    const ONE_DAY = 1 * 24 * 60 * 60 * 1000;
    const now = new Date();
    // const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    // 将开始日志设定为2020-01-01
    const startOfMonth = new Date(2020, 0, 1);
    const startDate = formatDate(startOfMonth);
    const endDate = formatDate(new Date(Date.now() + ONE_DAY));

    const [used, subs] = await Promise.all([
      fetch(
        this.path(
          `${OpenaiPath.UsagePath}?start_date=${startDate}&end_date=${endDate}`,
        ),
        {
          method: "GET",
          headers: getHeaders(),
        },
      ),
      fetch(this.path(OpenaiPath.SubsPath), {
        method: "GET",
        headers: getHeaders(),
      }),
    ]);

    if (used.status === 401) {
      throw new Error(Locale.Error.Unauthorized);
    }

    if (!used.ok || !subs.ok) {
      throw new Error("Failed to query usage from openai");
    }

    const response = (await used.json()) as {
      total_usage?: number;
      error?: {
        type: string;
        message: string;
      };
    };

    const total = (await subs.json()) as {
      hard_limit_usd?: number;
    };

    if (response.error && response.error.type) {
      throw Error(response.error.message);
    }

    if (response.total_usage) {
      response.total_usage = Math.round(response.total_usage) / 100;
    }

    if (total.hard_limit_usd) {
      total.hard_limit_usd = Math.round(total.hard_limit_usd * 100) / 100;
    }

    return {
      used: response.total_usage,
      total: total.hard_limit_usd,
    } as LLMUsage;
  }

  async models(): Promise<LLMModel[]> {
    if (this.disableListModels) {
      return DEFAULT_MODELS.slice();
    }

    const res = await fetch(this.path(OpenaiPath.ListModelPath), {
      method: "GET",
      headers: {
        ...getHeaders(),
      },
    });

    const resJson = (await res.json()) as OpenAIListModelResponse;
    const chatModels = resJson.data?.filter(
      (m) => m.id.startsWith("gpt-") || m.id.startsWith("chatgpt-"),
    );
    console.log("[Models]", chatModels);

    if (!chatModels) {
      return [];
    }

    //由于目前 OpenAI 的 disableListModels 默认为 true，所以当前实际不会运行到这场
    let seq = 1000; //同 Constant.ts 中的排序保持一致
    return chatModels.map((m) => ({
      name: m.id,
      available: true,
      sorted: seq++,
      provider: {
        id: "openai",
        providerName: "OpenAI",
        providerType: "openai",
        sorted: 1,
      },
    }));
  }

  // speech, 将文本生成音频
  async audioSpeech(options: AudioOptions) {
    const session = useChatStore.getState().currentSession();

    const modelConfig = {
      ...useAppConfig.getState().modelConfig,
      ...useChatStore.getState().currentSession().mask.modelConfig,
      ...{
        model: options.config.model,
      },
    };

    const requestPayload = {
      model: modelConfig.model,
      input: options.prompt, // 最大4096, 控制字符长度
      voice: session.settings.voice || TTS_Voice.Alloy, // 语音
      response_format: session.settings.responseFormat || TTS_Audio_Format.MP3, // 音频格式
      speed: 1, // XXX: 0.25-4之间，1.0默认值，后期添加
    };

    console.log("[Request] openai payload: ", requestPayload);

    const controller = new AbortController();
    options.onController?.(controller);

    try {
      const audioSpeechPath = this.path(OpenaiPath.AudioSpeechPath);
      const audioSpeechPayload = {
        method: "POST",
        body: JSON.stringify(requestPayload),
        signal: controller.signal,
        headers: getHeadersWithAudio(),
      };

      // make a fetch request
      const requestTimeoutId = setTimeout(
        () => controller.abort(),
        REQUEST_TIMEOUT_MS,
      );

      const res = await fetch(audioSpeechPath, audioSpeechPayload);
      clearTimeout(requestTimeoutId);

      let message: any;

      let contentType = res.headers.get("content-type");
      if (contentType && contentType.startsWith("audio/")) {
        const blob = await res.blob();

        const audioFile = new File([blob], "audio.mp3", {
          type: blob.type,
        });

        let audioFileUrl = "";
        await uploadToS3({
          uploadFile: audioFile,
          onSuccess: (url: any) => {
            audioFileUrl = url.custom_url;
            showToast(Locale.Chat.Upload.Success);
          },
          onError: (error: any) => {
            // console.error("[Request] failed to upload audio file", error.name +':'+error.message);
            // console.log("Upload failed:", error);
            // 服务器端错误..
            // 定义好的错误信息
            showToast(Locale.Chat.Upload.Fail);
          },
        });
        if (audioFileUrl != "") {
          // 一个音频文件，我们将它保存到AWS中
          message = {
            type: "audio",
            audio_url: audioFileUrl,
          };
        } else {
          message = "请求失败，音频文件上传失败";
        }
      } else {
        message = "请求失败，返回内容不是音频文件";
      }

      // const message = this.extractMessage(resJson);
      options.onFinish(message);
    } catch (e) {
      console.log("[Request] failed to make a chat request", e);
      options.onError?.(e as Error);
    }
  }

  // transcriptions, 将音频转录成文本。
  async audioTranscriptions(options: AudioWithFileOptions) {
    const session = useChatStore.getState().currentSession();
    const { file } = options;

    const modelConfig = {
      ...useAppConfig.getState().modelConfig,
      ...useChatStore.getState().currentSession().mask.modelConfig,
      ...{
        model: options.config.model,
      },
    };
    function getExtensionByMimeType(mimeType: string) {
      const audioMimeTypes = {
        "audio/mpeg": "mp3",
        "audio/wav": "wav",
        "audio/ogg": "ogg",
        "audio/webm": "webm",
        "audio/flac": "flac",
        "audio/aac": "aac",
        "audio/mp4": "mp4",
        "audio/opus": "ogg",
      };

      // @ts-ignore
      return audioMimeTypes[mimeType] || "";
    }

    await fetch(file)
      .then((response) => response.blob())
      // .then(async blob => {
      //   let fileUrl = '';
      //   console.log('uploading!', blob);
      //   await uploadToS3({
      //     uploadFile: new File([blob], 'audio.mp3', {
      //       type: blob.type,
      //     }),
      //     onSuccess: (url) => {
      //       console.log('upload success!', url);
      //       fileUrl = url.custom_url;
      //       showToast(Locale.Chat.Upload.Success);
      //     },
      //     onError: (error) => {
      //       console.error("Upload failed:", error);
      //       // 服务器端错误..
      //       // 定义好的错误信息
      //       showToast(Locale.Chat.Upload.Fail);
      //     },
      //   })
      //   return fileUrl;
      // })
      .then(async (blob) => {
        // const requestPayload = {
        //   model: modelConfig.model, // 必须 当前仅有whisper-1
        //   file:, // 必须 要转录的音频文件，采用以下格式之一：mp3、mp4、mpeg、mpga、m4a、wav 或 webm。
        //   prompt: options.prompt, // 可选 文本，用于指导模型的风格或继续之前的音频片段。提示应与音频语言相匹配。
        //   response_format: WHISPER_RESPONSE_TYPE, // 可选
        //   temperature: 1, // 可选, 0-1之间，越高越随机
        //   language: "", // 可选 以ISO-639-1代码表示的语言代码。如果未指定，将自动检测语言。
        // };

        // 创建一个 File 对象，将 Blob 数据包装在其中
        const file = new File([blob], getExtensionByMimeType(blob.type), {
          type: blob.type,
        });
        // 创建一个 input 元素
        const fileInput: HTMLInputElement = document.createElement("input");
        fileInput.type = "file";

        // 将 File 对象赋给 input 元素的 files 属性
        const fileList = new DataTransfer();
        fileList.items.add(file);
        fileInput.files = fileList.files;

        console.log("fileInput", fileInput);

        var formData = new FormData();
        formData.append("file", fileInput.files[0], "");
        formData.append("model", "whisper-1");
        formData.append("prompt", options.prompt);
        formData.append("response_format", "json");
        formData.append("temperature", "0");
        formData.append("language", "");

        console.log("[Request] openai payload formData: ", formData);

        const controller = new AbortController();
        options.onController?.(controller);
        try {
          const audioPath = this.path(OpenaiPath.AudioTranscriptionsPath);
          const headers = getHeaders();
          headers["Content-Type"] = "multipart/form-data";
          const audioPayload = {
            method: "POST",
            body: formData,
            signal: controller.signal,
            headers: headers,
          };

          // make a fetch request
          const requestTimeoutId = setTimeout(
            () => controller.abort(),
            REQUEST_TIMEOUT_MS,
          );

          const res = await fetch(audioPath, audioPayload);
          clearTimeout(requestTimeoutId);

          const resJson = await res.json();
          // 返回格式: { text: 'string' }
          const message = this.extractMessage(resJson);
          options.onFinish(message);
        } catch (e) {
          console.log("[Request] failed to make a chat request", e);
          options.onError?.(e as Error);
        }
      });
  }

  // translations, 将音频翻译成英文。
  async audioTranslations(options: AudioWithFileOptions) {
    // TODO: 取得Session中的设置
    const modelConfig = {
      ...useAppConfig.getState().modelConfig,
      ...useChatStore.getState().currentSession().mask.modelConfig,
      ...{
        model: options.config.model,
      },
    };

    const requestPayload = {
      model: modelConfig.model, // 必须 当前仅有whisper-1
      file: options.file, // 必须 要转录的音频文件，采用以下格式之一：mp3、mp4、mpeg、mpga、m4a、wav 或 webm。
      prompt: options.prompt, // 可选 文本，用于指导模型的风格或继续之前的音频片段。提示应与音频语言相匹配。
      response_format: "", // 可选
      temperature: 1, // 可选, 0-1之间，越高越随机
    };

    console.log("[Request] openai payload: ", requestPayload);

    const controller = new AbortController();
    options.onController?.(controller);

    try {
      const audioPath = this.path(OpenaiPath.AudioTranslationsPath);
      const audioPayload = {
        method: "POST",
        body: JSON.stringify(requestPayload),
        signal: controller.signal,
        headers: getHeaders(),
      };

      // make a fetch request
      const requestTimeoutId = setTimeout(
        () => controller.abort(),
        REQUEST_TIMEOUT_MS,
      );

      const res = await fetch(audioPath, audioPayload);
      clearTimeout(requestTimeoutId);

      const resJson = await res.json();
      // 返回格式: { text: 'string' }
      const message = this.extractMessage(resJson);
      options.onFinish(message);
    } catch (e) {
      console.log("[Request] failed to make a chat request", e);
      options.onError?.(e as Error);
    }
  }
}
export { OpenaiPath };
