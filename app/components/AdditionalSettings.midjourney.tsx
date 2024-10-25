import React, { useState } from "react";
import {
  Col,
  Flex,
  Form,
  GetProp,
  Modal,
  RadioChangeEvent,
  Row,
  Upload,
  UploadFile,
  UploadProps,
} from "antd";
import { Radio } from "antd";
import { PlusOutlined } from "@ant-design/icons";

import {
  MidjourneyAIEngineOptions,
  MidjourneyImageModeOptions,
} from "../constant";
import { useMobileScreen } from "@/app/utils";

interface AdditionalSettingsMidjourneyProps {
  midjourneyAIEngine: string;
  midjourneyImageMode: string;
  setMidjourneyAIEngine: (engine: string) => void;
  setMidjourneyImageMode: (mode: string) => void;
  setMidjourneyBase64Images: (images: string[]) => void;
}

const AdditionalSettingsMidjourney = (
  props: AdditionalSettingsMidjourneyProps,
) => {
  const onAIEngineChange = ({ target: { value } }: RadioChangeEvent) => {
    props.setMidjourneyAIEngine(value);
  };

  const onImageModeChange = ({ target: { value } }: RadioChangeEvent) => {
    props.setMidjourneyImageMode(value);
  };

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

  const handleCancel = () => setPreviewOpen(false);

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

  // 上传图片，只触发一次
  const handleChange: UploadProps["onChange"] = ({
    file,
    fileList: newFileList,
  }) => {
    setFileList(newFileList);

    if (file.status === "done") {
      let base64Images: string[] = [];
      newFileList.forEach(async (file) => {
        base64Images.push(await getBase64(file.originFileObj as FileType));
      });

      // 将newFileList中文图片转换为base64, 存储在setMidjourneyBase64Images中
      props.setMidjourneyBase64Images(base64Images);
    }
  };

  const uploadButton = (
    <button style={{ border: 0, background: "none" }} type="button">
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>上传图片</div>
    </button>
  );

  const isMobileScreen = useMobileScreen();

  return (
    <Form size={"small"} layout={"horizontal"}>
      <Row>
        <Col span={24}>
          <Flex gap={isMobileScreen ? 0 : 20} vertical={isMobileScreen}>
            <Form.Item label={"AI引擎"}>
              <Radio.Group
                options={MidjourneyAIEngineOptions}
                onChange={onAIEngineChange}
                value={props.midjourneyAIEngine}
                optionType="button"
              />
            </Form.Item>
            <Form.Item label={"模式选择"}>
              <Radio.Group
                options={MidjourneyImageModeOptions}
                onChange={onImageModeChange}
                value={props.midjourneyImageMode}
                optionType="button"
              />
            </Form.Item>
          </Flex>
        </Col>
        <Col span={24}>
          <Form.Item label={"参考图"}>
            <Upload
              action="https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188"
              listType="picture-card"
              fileList={fileList}
              onPreview={handlePreview}
              onChange={handleChange}
            >
              {fileList.length >= 5 ? null : uploadButton}
            </Upload>
            <Modal
              open={previewOpen}
              title={previewTitle}
              footer={null}
              onCancel={handleCancel}
            >
              <img alt="example" style={{ width: "100%" }} src={previewImage} />
            </Modal>
          </Form.Item>
        </Col>
      </Row>
      <div></div>
    </Form>
  );
};

export default AdditionalSettingsMidjourney;
