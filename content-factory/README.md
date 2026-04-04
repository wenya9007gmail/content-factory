# 内容变现工厂 V3

一个面向创作者的「内容流水线」SaaS：涵盖 IP 定位、账号搭建、选题库、内容工厂、发布、数据、自动优化、变现追踪八大模块。前端完全静态、无需编译即可运行，为了便于部署到 Vercel/Netlify，这里提供了一个 Next.js 包装以及后端代理接口。

## 功能亮点
- ✅ 一份 HTML 即包含完整 UI/交互，复制到任何静态托管即可运行
- ✅ 统一 API 设置面板，可配置国内/海外多家模型
- ✅ 新增 `/api/proxy` 后端：隐藏真实 API Key，支持流式输出
- ✅ Landing 页提示 + 入口，便于外部访问

## 本地运行
```bash
npm install
npm run dev
```
浏览器访问 `http://localhost:3000/factory.html` （或点击首页按钮跳转）。

## 部署
1. 将仓库推送到 GitHub（或任何 Git 服务）
2. 在 Vercel 新建项目，连接该仓库
3. `npm install`、`npm run build` 默认即可，无需额外构建步骤
4. 部署完成后，通过 `<vercel-domain>/factory.html` 即可访问

部署到 Vercel 后，API Key 由前端输入、后端代理 `/api/proxy` 转发，避免敏感信息暴露。

## Setup
1. 复制 `.env.example` → `.env.local`，填入 Supabase、AI Provider、MCP 等密钥。
2. 运行 `npm install`（或 `pnpm install`）同步依赖。
3. 执行 `npm run dev`，浏览器访问 `http://localhost:3000`。
4. 产品范围与演进请参考 `docs/superpowers/specs/2026-04-01-content-factory-design.md`。
5. 如需抓取发布后的指标并触发自动学习，运行 `npm run fetch:metrics`（需要 `SUPABASE_SERVICE_ROLE_KEY`）。
