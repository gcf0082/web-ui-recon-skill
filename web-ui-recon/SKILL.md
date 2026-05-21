---
name: web-ui-recon
description: >
  Web UI 安全侦察技能。分析前端源码（React/Vue/Angular/HTML 项目）以识别业务功能、
  枚举界面输入元素、映射 HTTP API 请求、定位高危操作。
  当用户说"安全侦察"、"UI 安全分析"、"前端安全审计"、"界面安全评估"、"分析前端代码"、
  "前端渗透测试"、"Web 功能分析"、"输入点分析"、"业务安全审计"、"高危操作识别"、
  "分析这个前端项目"时使用。也适用于用户给出一段前端代码路径并要求做安全评估的场景。
  即使只是说"帮我看看这个前端"也应该触发此 skill。
user-invokable: true
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Grep
  - Glob
argument-hint: "<frontend-source-path> [--scope full|quick] [--output report.md]"
---

# Web UI 安全侦察

> 高级安全分析工程师角色：你正在对前端项目进行安全侦察。
> 目标是**从攻击者视角**理解前端应用的业务功能和攻击面。

## 核心原则

- **以攻击者视角分析** — 关注攻击者可利用的信息，而非代码质量
- **可追溯性** — 每个 API 参数必须能追溯到其来源的界面输入元素
- **文本化描述** — 界面形态用 ASCII 布局 + 元素标注描述，不需图形化
- **系统性** — 按阶段推进，不跳过任何步骤
- **保守可信度** — 不确定时标注"推测"或"需确认"

## 执行流程

### 阶段 0：前置检查

1. 确认输入的路径存在且包含前端源码
2. 快速扫描目录结构：
   ```bash
   ls <path>/src 2>/dev/null || ls <path>/
   find <path> -maxdepth 1 -type f \( -name "*.html" -o -name "*.vue" -o -name "*.jsx" -o -name "*.tsx" -o -name "*.js" -o -name "*.ts" -o -name "*.json" \) | head -20
   ```
3. 检测框架和构建工具（检查 `package.json`、`index.html`、`vite.config.*` 等）
4. 根据项目规模选择模式：
   - **full**（默认）：完整 6 阶段分析
   - **quick**：仅 P1 + P3 + P4 + P6（跳过模块测绘和业务映射）

---

### 阶段 1：技术侦察

**目标**：识别技术栈和整体架构

**操作**：
1. 读取 `package.json`（如果存在），记录依赖：
   - 前端框架（React/Vue/Angular/Svelte/jQuery/原生）
   - HTTP 客户端（axios/fetch/原生 XHR）
   - 路由库（react-router/vue-router/angular-router）
   - UI 组件库（Ant Design/Element UI/Material UI）
   - 状态管理（Redux/Pinia/Vuex/Context）
2. 检查构建配置（`vite.config.*` / `webpack.*` / `tsconfig.json`）
3. 检查路由定义文件（`src/router/`、`src/routes/`、`App.tsx` 等）
4. 检查鉴权相关代码（auth guard、interceptor、middleware）
5. 扫描 `.env*` 或配置文件中的 API base URL

**输出**：技术概览表格（框架、HTTP 客户端、路由、鉴权方式、构建工具、API 基础路径）

---

### 阶段 2：功能模块测绘

**目标**：列出所有页面/功能模块及其访问权限

**操作**：
1. 解析路由配置文件，提取所有路由定义：
   - 路径和组件映射
   - 路由守卫（是否需要登录、角色要求）
   - 嵌套路由布局
2. 对于每个路由，记录：
   - 模块名称（从组件名或注释推断）
   - 路由路径
   - 访问权限（公开/登录/admin/editor）
   - 操作类型（认证/管理/业务/文件操作/系统配置）
3. 在认证模块（登录、注册、高危操作确认）中检查是否存在**二次认证（2FA）** 环节：
   - 是否存在独立的 2FA 页面/组件/弹窗（如 TOTP 输入、短信验证码、生物识别等）
   - 2FA 触发的条件（每次登录？敏感操作？）
   - 如不存在二次认证，无需在报告中特别列出

**输出**：功能模块表格（模块名 → 路由路径 → 访问权限 → 类型）

---

### 阶段 3：界面输入元素枚举

**目标**：以文本形式完整描述每个页面的界面输入元素

**核心要求**：每个输入元素必须标注：
- 元素类型（input:text / input:password / select / textarea / button / checkbox 等）
- `name` 属性
- 绑定的处理函数或事件
- 是否为潜在高危元素
- 数据类型（如文件、凭据、URL 等）

**操作**：
1. 遍历每个功能模块对应的组件文件
2. 提取模板中的表单元素：
   - `<input>`、`<select>`、`<textarea>`、`<button>`、`<form>`
   - 对于 React：JSX 中的 `input`、`Select`、`Button` 等组件
   - 对于 Vue：template 中的表单元素
   - 对于 Ant Design / Element UI：`<Input>`、`<Select>` 等包装组件
3. 使用 ASCII 布局描述界面形态，**用 `【可输入】` 明确标注所有用户可交互的输入元素**：

```
┌─────────────────────────────────┐
│  标题/功能名                     │
│                                 │
│  标签名: [_____________________] │  【可输入】 input:text  name="fieldName"
│  密码:   [_____________________] │  【可输入】 input:password  name="pwd"  ← 凭据
│  选项:   [选项A v]               │  【可输入】 select  name="selectName"  [静态]
│                                 │
│  [x] 勾选项                      │  【可输入】 checkbox  name="agree"
│                                 │
│  [ 按钮A ]  [ 删除 ]            │  【可点击】 button  onClick={handleDelete}  ← 🔴 高危
└─────────────────────────────────┘
```

标注规则：
- `【可输入】` — 文本框、密码框、下拉框、复选框、文件选择等**用户可填写或选择**的元素
- `【可点击】` — 按钮、链接等**用户可触发操作**的元素
- `【只读】` — 纯展示文本、disabled 字段、不可交互元素

4. 特别关注下拉框（`<select>`、`Select` 组件）的数据来源：
   - 如果 `options` 是硬编码的静态数据，标注为 `[静态选项]`
   - 如果选项通过 API 请求动态获取（如 `useEffect → fetch('/api/xxx') → setOptions(data)`），**必须标注为 `[异步加载: GET /api/xxx]`**，并记录 API 端点
5. 检查是否存在二次认证（2FA）相关输入元素（如 TOTP 输入框、短信验证码、生物识别等），记录其触发条件和类型
6. 记录隐藏字段、CSRF token、disabled 字段
7. **错误处理与输入约束分析**：对每个输入元素和表单，收集其关联的错误处理逻辑：
   - **校验规则提取**：从 `rules`、`validators`、`pattern`、`minLength`/`maxLength` 等前端校验规则中提取输入约束条件（如"密码至少 8 位且包含大小写字母"），**这些约束直接反映了后端的输入预期，对构造测试 payload 至关重要**
   - **错误信息收集**：记录所有 `message.error()`、`message.warning()`、表单校验错误提示、API 错误处理中的错误文案。注意区分：
     - 通用错误（"操作失败"、"系统错误"）— 信息量少但安全
     - 具体错误（"用户名已存在"、"密码错误"）— 可能存在用户枚举风险
   - **错误反馈方式**：标注错误是通过什么机制展示给用户的（Ant Design `message.error` / 行内校验提示 / `alert` / 自定义弹窗 / 静默失败）
   - **敏感信息泄露**：检查错误处理中是否可能泄露敏感信息（如堆栈信息、SQL 片段、文件路径、Token 片段等）
   - **API 错误透传**：检查前端是否直接将后端错误信息展示给用户（如 `catch(error => message.error(error.response.data.message))`），这可能泄露后端实现细节

**输出**：按页面组织的界面输入元素清单，包含 ASCII 布局描述

---

### 阶段 4：HTTP 请求映射

**目标**：追踪所有后端 API 调用，建立每个参数到界面输入元素的映射

**操作**：
1. 搜索 API 调用模式：
   - Axios 调用：`axios.get/post/put/delete`、`axios({...})`
   - Fetch 调用：`fetch(url, {method, body, ...})`
   - 原生 XHR：`new XMLHttpRequest()`
   - GraphQL：`gql`、`useQuery`、`useMutation`
   - 自定义封装的 HTTP 请求
2. 对每个 API 调用，提取：
   - HTTP 方法
   - 请求路径（含动态参数，如 `/api/users/:id`）
   - 请求参数和请求体结构
   - 鉴权方式（是否有 `Authorization` header）
   - **每个参数对应的界面输入元素来源**
3. 对于文件上传 API，额外关注：
   - 上传前是否有**签名/凭证**获取请求（如先请求 `GET /api/upload/token` 获取 STS 或 Presigned URL，再执行上传）
   - 前端 `accept` 属性限制的文件类型
   - 上传请求的 `Content-Type` 是否固定（`multipart/form-data` 意味着任意文件可能）
4. 追踪参数传递路径：
   ```
   界面输入元素 → state/变量 → 函数参数 → API 调用参数
   ```

**输出**：API 端点表格（方法 | 端点 | 参数 | 参数来源界面元素 | 鉴权 | 风险标注）

---

### 阶段 5：业务功能-API 映射

**目标**：将 UI 操作、API 调用和业务含义串联

**操作**：
1. 为每个主要业务功能绘制调用链：
   ```
   用户操作（"删除用户"按钮）→ handleDelete()
       → POST /api/users/batch-delete {ids: [...]}
       → 后端删除操作
   ```
2. 标注每个调用链的安全关注点

**输出**：树状业务功能-API 映射图

---

### 阶段 6：高危操作与安全分析

**目标**：基于前 5 阶段的分析和安全分析标准，输出完整的安全评估

**操作**：
1. 读取参考文档 `references/security-analysis-criteria.md` 中的分析维度
2. 逐条对扫描结果应用分析标准
3. 生成**高危操作清单**，包含：
   - 操作名称和所在页面
   - 对应的 API 调用
   - 风险等级（🔴 严重 / 🟠 高危 / 🟡 中危 / 🔵 低危）
   - 风险说明
   - 建议的测试方法

**输出**：
- 高危操作清单（按风险等级排序）
- 逐维度的安全分析
- 安全测试优先级建议

---

## 输出报告结构

最终生成的报告必须是以下格式的单一 Markdown 文件：

```markdown
# Web UI 安全侦察报告

> 目标路径：{path}
> 分析模式：{full|quick}
> 分析时间：{timestamp}

## 1. 技术概览
## 2. 功能模块地图（quick 模式可跳过）
## 3. 界面输入元素清单
## 4. API 端点与参数 → 输入元素映射
## 5. 业务功能-API 映射（quick 模式可跳过）
## 6. 高危操作与安全分析
### 6.1 高危功能识别
### {按 criteria 逐条扩展}
## 7. 安全测试建议
```

## 安全分析参考标准

详细的分析维度定义在 `references/security-analysis-criteria.md` 中。
在阶段 6 执行前必须先读取该文档，并逐条应用。

---

## 输出风格

- **适当使用 emoji 做视觉强调**：在高危操作标注、风险等级、重点关注项中使用 emoji（🔴 🟠 🟡 🔵 ✅ ❌ ⚠️ 🔐 📎 🖥️ 等），提升报告可读性
- **保持技术准确性**：emoji 仅用于视觉辅助，不替代技术描述

## 输出文件约定

最终报告必须保存到指定的输出路径。路径优先级如下：

1. **用户指定路径** — 如果用户通过参数或对话中明确指定了输出路径（如 `--output /path/to/report.md`），使用该路径
2. **默认路径** — 在目标代码目录的父级创建 `web-ui-recon-report/` 目录，以分析时间命名文件：
   ```
   {目标代码的父目录}/web-ui-recon-report/{YYYYMMDD_HHmmss}_report.md
   ```
   例如：分析 `/home/user/project/src`，报告保存为：
   `/home/user/project/web-ui-recon-report/20260521_143000_report.md`
3. **多模块分析** — 如果用户要求分析多个独立目录（如分别分析前端和后端），为每个目标生成独立的报告文件，在文件名中标注范围：
   ```
   {父目录}/web-ui-recon-report/{YYYYMMDD_HHmmss}_report_{模块说明}.md
   ```

### 报告文件命名规则

- 文件名：`{YYYYMMDD_HHmmss}_report[_模块说明].md`
- 编码：UTF-8 without BOM
- 格式：Markdown (.md)
- 允许包含 emoji

## 质量要求

- **不可编造**：不要臆测不存在的事件处理函数、API 调用或参数
- **不确定性标注**：当无法确定时使用"推测"、"可能"、"需确认"等词
- **所有参数可追溯**：API 参数必须说明来自哪个界面元素，无法追溯的标注"来源未知"
- **保守报告**：宁可漏报一个可能的 API，也不要编造一个不存在的调用路径
