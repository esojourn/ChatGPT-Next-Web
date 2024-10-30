import {
  DEFAULT_MODELS,
  UniSeePath,
  REQUEST_TIMEOUT_MS,
  MidjourneyPath,
} from "@/app/constant";
import { useAppConfig, useChatStore } from "@/app/store";

import {
  AudioOptions,
  AudioWithFileOptions,
  ChatOptions,
  getHeaders,
  LLMApi,
  LLMModel,
  LLMUsage,
  SpeechOptions,
} from "../api";
import Locale from "../../locales";
import {
  EventStreamContentType,
  fetchEventSource,
} from "@fortaine/fetch-event-source";
import { prettyObject } from "@/app/utils/format";
import { formatMjMessage, mjPath } from "@/app/utils/midjourney";
import { getMessageTextContent } from "@/app/utils";

export interface UniSeeListModelResponse {
  object: string;
  data: Array<{
    id: string;
    object: string;
    root: string;
  }>;
}

interface UniSeeMidjourneySettings {
  AIEngine: string;
  imageMode: string;
  base64Images: string[];
}

interface MidjourneyRequestPayloadInterface {
  botType: string;
  prompt: string;
  base64Array: string[];
  base64: string;
}

export class UniSeeSApi implements LLMApi {
  speech(options: SpeechOptions): Promise<ArrayBuffer> {
    throw new Error("Method not implemented.");
  }
  private disableListModels = true;
  private logPrefix = "[UniSee] ---> ";

  log(...args: any[]) {
    console.log(this.logPrefix, ...args);
  }

  path(path: string): string {
    return mjPath(path);
  }

  extractMessage(res: any) {
    return res.choices?.at(0)?.message?.content ?? "";
  }

  async chat(options: ChatOptions) {
    console.log("[UniSee] chat options: ", options);
    let isMidjourney = options.config.model.startsWith("midjourney");
    const modelConfig = {
      ...useAppConfig.getState().modelConfig,
      ...useChatStore.getState().currentSession().mask.modelConfig,
      ...{
        model: options.config.model,
      },
    };

    let lastMessage = options.messages[options.messages.length - 1];
    let lastMessageContent = getMessageTextContent(lastMessage);

    let additional_settings =
      options.additionalSettings as UniSeeMidjourneySettings;
    console.log("[UniSee] additional_settings: ", additional_settings);

    // 设置默认的additional_settings
    if (!additional_settings) {
      additional_settings = {
        AIEngine: "MID_JOURNEY",
        imageMode: "text2image",
        base64Images: [],
      };
    }

    if (additional_settings.AIEngine == "NIJI_JOURNEY") {
      lastMessageContent = lastMessageContent + " --niji";
    }

    let apiPath = UniSeePath.ChatPath;
    let requestPayload = {};
    if (isMidjourney) {
      switch (additional_settings?.imageMode) {
        case "multiImage":
          apiPath = MidjourneyPath.BlendPath;
          requestPayload = {
            //botType: additional_settings.AIEngine,
            base64Array: additional_settings.base64Images,
          };
          break;
        case "image2text":
          apiPath = MidjourneyPath.DescribePath;
          requestPayload = {
            // botType: additional_settings.AIEngine,
            base64: additional_settings.base64Images[0],
          };
          break;
        case "text2image":
        default:
          apiPath = MidjourneyPath.ImaginePath;
          requestPayload = {
            // botType: additional_settings.AIEngine,
            prompt: lastMessageContent,
            base64Array: additional_settings.base64Images,
          };
          break;
      }
    } else {
      // GPT-4
      const messages = options.messages.map((v) => ({
        role: v.role,
        content: v.content,
      }));

      requestPayload = {
        messages,
        stream: options.config.stream,
        model: modelConfig.model,
        temperature: modelConfig.temperature,
        presence_penalty: modelConfig.presence_penalty,
        frequency_penalty: modelConfig.frequency_penalty,
        top_p: modelConfig.top_p,
        // max_tokens: Math.max(modelConfig.max_tokens, 1024),
        // Please do not ask me why not send max_tokens, no reason, this param is just shit, I dont want to explain anymore.
      };
    }

    this.log("[Request] payload: ", requestPayload);

    const controller = new AbortController();
    options.onController?.(controller);

    try {
      apiPath = this.path(apiPath);
      const chatPayload = {
        method: "POST",
        body: JSON.stringify(requestPayload),
        signal: controller.signal,
        headers: getHeaders(),
      };

      this.log("[Request] ", apiPath, chatPayload);

      // make a fetch request
      const requestTimeoutId = setTimeout(
        () => controller.abort(),
        REQUEST_TIMEOUT_MS,
      );

      //
      if (isMidjourney) {
        const res = await fetch(apiPath, chatPayload);
        clearTimeout(requestTimeoutId);

        let message = "";
        if (res.ok) {
          const resJson = await res.json();
          message = formatMjMessage(resJson, lastMessageContent);
          // options.onFinish(message, resJson);
          options.onFinish(message);
        } else {
          options.onFinish(res.statusText);
        }
      } else {
        const shouldStream = !!options.config.stream;
        if (shouldStream) {
          let responseText = "";
          let remainText = "";
          let finished = false;

          // animate response to make it looks smooth
          function animateResponseText() {
            if (finished || controller.signal.aborted) {
              responseText += remainText;
              console.log("[Response Animation] finished");
              return;
            }

            if (remainText.length > 0) {
              const fetchCount = Math.max(
                1,
                Math.round(remainText.length / 60),
              );
              const fetchText = remainText.slice(0, fetchCount);
              responseText += fetchText;
              remainText = remainText.slice(fetchCount);
              options.onUpdate?.(responseText, fetchText);
            }

            requestAnimationFrame(animateResponseText);
          }

          // start animation
          animateResponseText();

          const finish = () => {
            if (!finished) {
              finished = true;
              options.onFinish(responseText + remainText);
            }
          };

          controller.signal.onabort = finish;

          fetchEventSource(apiPath, {
            ...chatPayload,
            async onopen(res) {
              clearTimeout(requestTimeoutId);
              const contentType = res.headers.get("content-type");
              console.log(
                "[UniSee] request response content type: ",
                contentType,
              );

              if (contentType?.startsWith("text/plain")) {
                responseText = await res.clone().text();
                return finish();
              }

              if (
                !res.ok ||
                !res.headers
                  .get("content-type")
                  ?.startsWith(EventStreamContentType) ||
                res.status !== 200
              ) {
                const responseTexts = [responseText];
                let extraInfo = await res.clone().text();
                try {
                  const resJson = await res.clone().json();
                  extraInfo = prettyObject(resJson);
                } catch {}

                if (res.status === 401) {
                  responseTexts.push(Locale.Error.Unauthorized);
                }

                if (extraInfo) {
                  responseTexts.push(extraInfo);
                }

                responseText = responseTexts.join("\n\n");

                return finish();
              }
            },
            onmessage(msg) {
              if (msg.data === "[DONE]" || finished) {
                return finish();
              }
              const text = msg.data;
              try {
                const json = JSON.parse(text) as {
                  choices: Array<{
                    delta: {
                      content: string;
                    };
                  }>;
                };
                const delta = json.choices[0]?.delta?.content;
                if (delta) {
                  remainText += delta;
                }
              } catch (e) {
                console.error("[Request] parse error", text);
              }
            },
            onclose() {
              finish();
            },
            onerror(e) {
              options.onError?.(e);
              throw e;
            },
            openWhenHidden: true,
          });
        } else {
          const res = await fetch(apiPath, chatPayload);
          clearTimeout(requestTimeoutId);

          const resJson = await res.json();
          const message = this.extractMessage(resJson);
          options.onFinish(message);
        }
      }
    } catch (e) {
      this.log("[Request] failed to make a chat request", e);
      options.onError?.(e as Error);
    }
  }

  usage(): Promise<LLMUsage> {
    throw new Error("Method not implemented.");
  }

  async models(): Promise<LLMModel[]> {
    if (this.disableListModels) {
      return DEFAULT_MODELS.slice();
    }

    const res = await fetch(this.path(UniSeePath.ListModelPath), {
      method: "GET",
      headers: {
        ...getHeaders(),
      },
    });

    const resJson = (await res.json()) as UniSeeListModelResponse;
    const chatModels = resJson.data?.filter((m) => m.id.startsWith("gpt-"));
    console.log("[Models]", chatModels);

    if (!chatModels) {
      return [];
    }

    return chatModels.map((m) => ({
      name: m.id,
      subTitle: "",
      available: true,
      sorted: 0,
      provider: {
        id: "unisee",
        providerName: "UniSee",
        providerType: "unisee",
        sorted: 0,
      },
    }));
  }

  audioSpeech(options: AudioOptions): Promise<void> {
    throw new Error("Method not implemented.");
  }
  audioTranscriptions(options: AudioWithFileOptions): Promise<void> {
    throw new Error("Method not implemented.");
  }
  audioTranslations(options: AudioWithFileOptions): Promise<void> {
    throw new Error("Method not implemented.");
  }
}

export { UniSeePath };
