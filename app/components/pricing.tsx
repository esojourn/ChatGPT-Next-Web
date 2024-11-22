import React, { useEffect, useState } from "react";
import { PRICING_API_PATH } from "../constant";
import { Table, ConfigProvider } from "antd";
import { useAppConfig } from "../store";
import { Theme } from "../store/config";

export function Pricing() {
  const [prices, setPrices] = useState([]);
  const config = useAppConfig();

  const theme = config.theme;

  useEffect(() => {
    async function fetchPrices() {
      try {
        const response = await fetch(PRICING_API_PATH);
        const json = await response.json();
        setPrices(json.data);
      } catch (error) {
        console.error("Error fetching pricing data:", error);
      }
    }

    fetchPrices();
  }, []);

  const columns = [
    { title: "模型", dataIndex: "model_name" },
    { title: "官方价格", dataIndex: "official_price" },
    { title: "官方RMB", dataIndex: "official_rmb" },
    { title: "本站RMB", dataIndex: "site_rmb" },
    { title: "折扣率", dataIndex: "discount_rate" },
  ];

  return (
    <ConfigProvider
      theme={{
        token: { colorBgContainer: theme === Theme.Dark ? "#141414" : "#fff" },
      }}
    >
      <h1>价格说明</h1>
      <p>本站当前已启用模型 总计 0 个</p>

      <Table dataSource={prices} columns={columns} />
    </ConfigProvider>
  );
}
