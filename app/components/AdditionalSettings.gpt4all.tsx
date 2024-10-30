import { useEffect, useState } from "react";
import { Form, GetProp, Modal, Upload, UploadFile, UploadProps } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { showToast } from "@/app/components/ui-lib";
import Locale from "@/app/locales";
import { UploadRequestOption as RcCustomRequestOptions } from "rc-upload/lib/interface";
import Image from "next/image";

interface AdditionalSettingsGpt4AllProps {
  isAttachFileUploading: boolean;
  attachFileUrl: string | null;
  setIsAttachFileUploading: (isUploading: boolean) => void;
  setAttachFileUrl: (url: string) => void;
}

const AdditionalSettingsGpt4All = (props: AdditionalSettingsGpt4AllProps) => {
  const {
    isAttachFileUploading,
    attachFileUrl,
    setIsAttachFileUploading,
    setAttachFileUrl,
  } = props;

  // 上传图片
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");

  const [fileList, setFileList] = useState<UploadFile[]>([]);

  type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

  const getBase64 = (file: FileType): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  const handleCancel = () => {
    setPreviewOpen(false);
  };

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as FileType);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
    setPreviewTitle(
      file.name || file.url!.substring(file.url!.lastIndexOf("/") + 1),
    );
  };

  const handleChange: UploadProps["onChange"] = async ({
    fileList: newFileList,
    file,
  }) => {
    setFileList(newFileList);
    if (newFileList.length > 0) {
      let file = newFileList[0];
      setIsAttachFileUploading(true);
    }
  };

  const handleUploadFileLimit = (file: FileType) => {
    const maxFileSize = 1024 * 1024 * 5; // 5MB
    if (file && file.size > maxFileSize) {
      showToast(Locale.Chat.Upload.FileSizeExceed);
      return Upload.LIST_IGNORE;
    }
    // if (!file.type.startsWith('image')) {
    //   showToast(Locale.Chat.Upload.FileTypeNotSupported);
    //   return Upload.LIST_IGNORE;
    // }
  };

  const uploadButton = (
    <button style={{ border: 0, background: "none" }} type="button">
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>上传</div>
    </button>
  );

  useEffect(() => {
    if (!attachFileUrl) {
      setFileList([]);
    }
  }, [attachFileUrl]);

  // 首先，确保你已经定义了 showToast 和 Locale 相关的逻辑。

  const customRequest = async (options: RcCustomRequestOptions) => {
    const { onProgress, onSuccess, onError } = options;

    try {
      const file = options.file as File;

      // 模拟从 API 获取上传 URL 和表单数据
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
        }),
      });

      if (!response.ok) {
        throw new Error(Locale.Chat.Upload.FailGetPresignedUrl);
      }

      const { url, fields, fileKey } = await response.json();

      const formData = new FormData();
      Object.entries(fields).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
      formData.append("file", file);

      // 使用 XMLHttpRequest 进行上传
      const xhr = new XMLHttpRequest();
      xhr.open("POST", url, true);

      xhr.upload.onprogress = function (event) {
        if (event.lengthComputable) {
          const percent = (event.loaded / event.total) * 100;
          onProgress?.({ percent: parseFloat(percent.toFixed(2)) });
        }
      };

      xhr.onload = function () {
        if (xhr.status === 204) {
          onSuccess?.({ custom_url: `${url}${fileKey}` });

          setAttachFileUrl(`${url}${fileKey}`);
        } else {
          throw new Error(`Upload failed with status: ${xhr.status}`);
        }
      };

      xhr.onerror = function () {
        onError?.(new Error("Upload error"));
      };

      xhr.send(formData);
    } catch (error: any) {
      onError?.(error);
      showToast(error.message);
    }
  };
  return (
    <Form size={"small"} layout={"vertical"}>
      <Form.Item label={"需要分析的文件"}>
        <Upload
          customRequest={customRequest}
          listType="picture-card"
          fileList={fileList}
          onPreview={handlePreview}
          onChange={handleChange}
          beforeUpload={handleUploadFileLimit}
        >
          {fileList.length >= 1 ? null : uploadButton}
        </Upload>
        <Modal
          open={previewOpen}
          title={previewTitle}
          footer={null}
          onCancel={handleCancel}
        >
          <Image
            alt="example"
            layout="responsive"
            src={previewImage}
            style={{ width: "100%" }}
          />
        </Modal>
      </Form.Item>
    </Form>
  );
};

export default AdditionalSettingsGpt4All;
