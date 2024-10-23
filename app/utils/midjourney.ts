import Locale from "@/app/locales";
import { useAccessStore } from "@/app/store";
import { getClientConfig } from "@/app/config/client";
import { ApiPath, DEFAULT_API_HOST } from "@/app/constant";

export function formatMjMessage(resJson: any, messageContent: string): string {
  switch (resJson.code) {
    case 1: // 提交成功
      const prefixContent = Locale.Midjourney.TaskPrefix(
        messageContent,
        resJson.result,
      );

      return (
        prefixContent +
        `[${new Date().toLocaleString()}] - ${
          Locale.Midjourney.TaskSubmitOk
        }: ` +
        Locale.Midjourney.PleaseWait
      );

    case 21: // 已存在
      return Locale.Midjourney.TaskSubmitExist;
    case 22: // 排队中
      return Locale.Midjourney.TaskSubmitQueuing;
    case 4: // 程序内部错误
    default:
      return Locale.Midjourney.TaskSubmitErr(
        resJson.error || Locale.Midjourney.UnknownError,
      );
  }
}

export function mjPath(path: string): string {
  const accessStore = useAccessStore.getState();
  let baseUrl = accessStore.uniSeeUrl;

  if (baseUrl.length === 0) {
    const isApp = !!getClientConfig()?.isApp;
    baseUrl = isApp ? DEFAULT_API_HOST : ApiPath.UniSee;
  }

  if (baseUrl.endsWith("/")) {
    baseUrl = baseUrl.slice(0, baseUrl.length - 1);
  }
  if (!baseUrl.startsWith("http") && !baseUrl.startsWith(ApiPath.UniSee)) {
    baseUrl = "https://" + baseUrl;
  }
  console.log("test", baseUrl, path);
  return [baseUrl, path].join("/");
}
