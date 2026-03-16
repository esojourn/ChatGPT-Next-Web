# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
yarn dev          # 开发服务器
yarn build        # 生产构建 (standalone 模式)
yarn start        # 启动生产服务器
yarn lint         # ESLint 检查
yarn export       # 静态导出 (用于 Tauri 桌面应用)
yarn app:dev      # Tauri 桌面应用开发
yarn app:build    # Tauri 桌面应用构建
```

## Architecture

Next.js 13 App Router 项目，使用 react-router-dom 做客户端路由，Zustand 做状态管理，SCSS Modules 做样式。

### 路由

客户端路由定义在 `app/constant.ts` 的 `Path` 枚举中，由 `app/components/home.tsx` 中的 react-router-dom `HashRouter` 驱动。Next.js App Router 仅用于 API 路由。

### 状态管理 (Zustand)

所有 store 在 `app/store/`，通过 `persist` 中间件持久化到 localStorage：

- `chat.ts` — 会话列表、消息历史、发送/重试逻辑
- `config.ts` — 应用配置（主题、模型参数、字体大小等）
- `access.ts` — 访问控制（API Key、访问码、服务端配置）
- `mask.ts` — 角色预设（Mask）管理
- `prompt.ts` — 提示词库
- `sync.ts` — 数据同步
- `update.ts` — 版本更新检查

Store key 常量在 `app/constant.ts` 的 `StoreKey` 枚举中，修改会导致用户本地数据丢失。

### API 层

```
ClientApi (app/client/api.ts)
  └── LLMApi 抽象类
        └── ChatGPTApi (app/client/platforms/openai.ts)
```

`LLMApi` 定义了 `chat()`, `usage()`, `models()` 三个抽象方法。新增 AI 提供商需在 `app/client/platforms/` 下实现此接口。

服务端 API 代理在 `app/api/openai/[...path]/route.ts`，将请求转发到 OpenAI，支持流式响应（SSE）。认证逻辑在 `app/api/auth.ts`。

### 构建模式

`next.config.mjs` 通过 `BUILD_MODE` 环境变量切换：
- `standalone`（默认）— 服务端渲染，支持 API 代理
- `export` — 纯静态导出，用于 Tauri 桌面客户端，无服务端 API 路由

### 关键约定

- SVG 文件通过 `@svgr/webpack` 作为 React 组件导入
- 样式使用 SCSS Modules（`*.module.scss`），无 Tailwind
- 国际化文件在 `app/locales/`，新增语言需在此目录添加对应文件
- 模型列表在 `app/constant.ts` 的 `DEFAULT_MODELS` 中定义
- 环境变量：`OPENAI_API_KEY`、`CODE`（访问码）、`API_URL`（自定义 API 地址）、`BASE_URL`
