import styles from "@/app/components/api-key-log.module.scss";
import { useNavigate } from "react-router-dom";
import Locale from "@/app/locales";
import { IconButton } from "@/app/components/button";
import CloseIcon from "@/app/icons/close.svg";
import { API_LOG_BASE_URL, Path } from "@/app/constant";
import { ErrorBoundary } from "@/app/components/error";
import React, { useEffect, useState } from "react";
import { getHeaders } from "@/app/client/api";
import { ConfigProvider, Table, theme as antdTheme } from "antd";
import type { GetProp, TableProps } from "antd";
import { useAppConfig } from "@/app/store";
import { getCSSVar } from "@/app/utils";

type ColumnsType<T> = TableProps<T>["columns"];
type TablePaginationConfig = Exclude<
  GetProp<TableProps, "pagination">,
  boolean
>;

interface DataType {
  id: number;
  created_at: string;
  model_name: string;
  prompt_tokens: number;
  completion_tokens: number;
  quota: number;
}

interface TableParams {
  pagination?: TablePaginationConfig;
}

var QuotaPerUnit = 500 * 1000.0;

const columns: ColumnsType<DataType> = [
  {
    title: Locale.ApiKeyLog.Table.CreatedAt,
    dataIndex: "created_at",
    render: (text) => new Date(text).toLocaleString(),
  },
  {
    title: Locale.ApiKeyLog.Table.ModelName,
    dataIndex: "model_name",
    render: (text) => {
      return text.replace("gpt-4-all", "gpt-4-plus");
    },
  },
  {
    title: Locale.ApiKeyLog.Table.PromptTokens,
    dataIndex: "prompt_tokens",
    align: "right",
  },
  {
    title: Locale.ApiKeyLog.Table.CompletionTokens,
    dataIndex: "completion_tokens",
    align: "right",
  },
  {
    title: Locale.ApiKeyLog.Table.Quota,
    dataIndex: "quota",
    render: (text) => "$" + (text / QuotaPerUnit).toFixed(6),
    align: "right",
  },
];

export function ApiKeyLog() {
  const api_log_url = API_LOG_BASE_URL;

  const config = useAppConfig();
  const navigate = useNavigate();
  const theme = config.theme;

  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      position: ["bottomCenter"],
      showSizeChanger: false,
      current: currentPage,
      pageSize: 10,
    },
  });

  const [logTheme, setLogTheme] = useState({
    algorithm: antdTheme.defaultAlgorithm,
  });

  useEffect(() => {
    // Fetch data from API based on currentPage
    fetchData();
  }, [JSON.stringify(tableParams)]);

  useEffect(() => {
    let themeValue = {
      algorithm: antdTheme.defaultAlgorithm,
    };
    const rootTheme = getCSSVar("--theme");
    console.log("rootTheme: ", rootTheme);

    if (theme === "dark") {
      themeValue = {
        algorithm: antdTheme.darkAlgorithm,
      };
    }

    setLogTheme(themeValue);
  }, [theme]);

  const fetchData = async () => {
    setLoading(true);
    await fetch(`${api_log_url}?page=${currentPage}`, {
      method: "GET",
      headers: getHeaders(),
    })
      .then((res) => res.json())
      .then((results) => {
        setLogs(results.data);
        setTableParams({
          ...tableParams,
          pagination: {
            ...tableParams.pagination,
            total: results.total,
          },
        });

        setLoading(false);
      });
  };

  const handleTableChange: TableProps["onChange"] = (pagination) => {
    setCurrentPage(pagination.current || 1);
    setTableParams({
      pagination,
    });

    // `dataSource` is useless since `pageSize` changed
    if (pagination.pageSize !== tableParams.pagination?.pageSize) {
      setLogs([]);
    }
  };

  return (
    <ErrorBoundary>
      <div className="window-header" data-tauri-drag-region>
        <div className="window-header-title">
          <div className="window-header-main-title">
            {Locale.ApiKeyLog.Title}
          </div>
          <div className="window-header-sub-title">
            {Locale.ApiKeyLog.SubTitle}
          </div>
        </div>
        <div className="window-actions">
          <div className="window-action-button"></div>
          <div className="window-action-button"></div>
          <div className="window-action-button">
            <IconButton
              icon={<CloseIcon />}
              onClick={() => navigate(Path.Settings)}
              bordered
            />
          </div>
        </div>
      </div>
      <div className={`${styles["logs-body"]} custom-antd`}>
        <ConfigProvider
          theme={{
            ...logTheme,
            cssVar: true,
          }}
        >
          <Table
            columns={columns}
            rowKey={(record) => record.id}
            dataSource={logs}
            pagination={tableParams.pagination}
            loading={loading}
            onChange={handleTableChange}
          />
        </ConfigProvider>
      </div>
    </ErrorBoundary>
  );
}
