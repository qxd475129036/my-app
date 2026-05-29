# 全页面 Redesign 实施计划

> 基于 Plan Mode 讨论后输出的实施方案，用于后续执行会话直接参考。

---

## 概要

对项目中所有 27 个页面 + 4 个基础组件进行统一的商业风格 redesign。

- **配色**: 经典商务蓝 `#2563eb`，白色背景
- **导航**: 左侧边栏（深色 `#1e293b`），可折叠
- **布局**: 混合宽度（目录页 max-w-7xl，数据表页 full-width）
- **响应式**: 桌面优先（1280px+ 优化）
- **字体**: Geist Sans + Geist Mono
- **Dark mode**: 不需要
- **动画**: 轻微过渡（fadeIn、hover、弹窗缩放）
- **首页**: 302 重定向到 `/dashboard`
- **组件**: 提取共享组件库至 `src/app/components/`

---

## 1. 设计系统

### 1.1 重构 `globals.css`

移除所有 dark mode 变量，仅保留 light 模式：

```css
@import "tailwindcss";

:root {
  --background: #ffffff;
  --foreground: #1e293b;
  --card: #f8fafc;
  --card-border: #e2e8f0;
  --muted: #64748b;
  --accent: #2563eb;
  --accent-light: #eff6ff;
  --accent-hover: #1d4ed8;
  --danger: #dc2626;
  --success: #16a34a;
  --warning: #d97706;
  --sidebar-bg: #1e293b;
  --sidebar-text: #cbd5e1;
  --sidebar-active: #2563eb;
  --border: #e2e8f0;
  --radius: 8px;
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-border: var(--card-border);
  --color-border: var(--border);
  --color-muted: var(--muted);
  --color-accent: var(--accent);
  --color-accent-light: var(--accent-light);
  --color-accent-hover: var(--accent-hover);
  --color-danger: var(--danger);
  --color-success: var(--success);
  --color-warning: var(--warning);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

body {
  background: var(--background);
  color: var(--foreground);
}

/* 移除所有 @media (prefers-color-scheme: dark) 块 */
```

### 1.2 字号系统

| 用途 | 字号 | 行高 | 字重 |
|------|------|------|------|
| 表格/标签 | 12px | 1.4 | 400 |
| 正文/UI | 14px | 1.5 | 400 |
| 大正文 | 16px | 1.5 | 400 |
| 子标题 | 20px | 1.4 | 600 |
| 页面标题 | 24px | 1.3 | 700 |
| Dashboard 数字 | 30px | 1.2 | 700 |

### 1.3 间距系统

8px 基准。比例: 2/4/6/8/12/16/20/24/32/40/48/64

---

## 2. 布局架构

```
+---------------------------------------------+
|  Sidebar (w-64)  |  Top Bar (breadcrumb+user)|
|  fixed left       |---------------------------|
|  深色 bg#1e293b   |  Content Area             |
|  可折叠           |  (index: max-w-7xl 居中   |
|                   |   table: full-width px-8) |
|                   |                           |
+---------------------------------------------+
|  Footer (居中, text-sm, 浅色 + 上边框)        |
+---------------------------------------------+
```

### 2.1 Sidebar 导航结构

- 顶部 Logo 区（应用名 "MyApp"）
- 导航分组（带图标）：
  - 📊 Dashboard → `/dashboard`
  - 📋 Master管理 → 展开子项（店铺/请求CD/单价）
  - 📝 请求业务 → 展开子项（一括調整/元データ/承認）
  - 🚚 代引业务 → 展开子项（代引一覧/出金/日历）
  - 💰 退款业务 → 展开子项（退款一覧/CD定義）
  - ⬇️ 明细下载 → 展开子项（保管/配送）
  - 🔧 明细修正 → `/correction`
- 底部：用户名 + 退出按钮

### 2.2 TopBar

- 左侧：面包屑导航（如 Dashboard > 代引业务 > 代引一覧）
- 右侧：用户头像/名称

### 2.3 宽度策略

- 目录/首页页面：`max-w-7xl mx-auto`
- 数据表格页面：`w-full px-8`

---

## 3. 共享组件库

以下组件创建在 `src/app/components/` 下。

### 3.1 `DataTable.tsx`

通用泛型数据表格。

Props:
```ts
interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => ReactNode;
  width?: string;
  align?: "left" | "center" | "right";
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  selectable?: boolean;
  selectedIds?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;
  onSort?: (key: string, direction: "asc" | "desc") => void;
  sortKey?: string;
  sortDirection?: "asc" | "desc";
  emptyMessage?: string;
  loading?: boolean;
  pageSize?: number;
  currentPage?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}
```

特性：
- 全选 checkbox
- 列头排序
- 斑马条纹（`even:bg-gray-50`）
- 行 hover 高亮
- 空状态显示
- 内嵌分页（集成 Pagination 组件）
- 大数据量虚拟滚动（数据 > 200 行时自动启用 `@tanstack/react-virtual`，外部无感知）

依赖：`@tanstack/react-virtual`（详见 3.11 节）

### 3.2 `Pagination.tsx`

```ts
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
}
```

- 显示 "显示 X-Y / 共 Z 件"
- 上一页/下一页 + 数字按钮
- 每页条数选择器（10/20/50/100）

### 3.3 `SearchInput.tsx`

```ts
interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
}
```

- 左侧搜索图标
- 右侧清除按钮（有输入时显示）
- 300ms debounce

### 3.4 `FilterSelect.tsx`

```ts
interface FilterOption {
  label: string;
  value: string;
}

interface FilterSelectProps {
  label: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
}
```

- 下拉选择器
- 第一个选项总是 "全部"

### 3.5 `Modal.tsx`

```ts
type ModalSize = "sm" | "md" | "lg" | "xl";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: ModalSize;
  footer?: ReactNode;
}
```

- 点击遮罩关闭
- 右上角 X 关闭按钮
- 缩放 + 淡入动画 (`scale-95 → scale-100`, `opacity-0 → opacity-100`)
- 大小映射：sm(384px) / md(512px) / lg(640px) / xl(768px)

### 3.6 `StatusBadge.tsx`

```ts
interface StatusBadgeProps {
  status: string;
  mapping?: Record<string, { label: string; color: string }>;
}
```

默认状态颜色映射：
| 状态 | 颜色 | 背景 |
|------|------|------|
| pending / 申請中 | `#d97706` (黄) | `#fffbeb` |
| approved / 承認済 / 完了 | `#16a34a` (绿) | `#f0fdf4` |
| rejected / 却下済 | `#dc2626` (红) | `#fef2f2` |
| processing / 処理中 | `#2563eb` (蓝) | `#eff6ff` |
| cancelled | `#64748b` (灰) | `#f1f5f9` |

### 3.7 `StatCard.tsx`

```ts
interface StatCardProps {
  label: string;
  value: string;
  change?: string;
  changeType?: "up" | "down" | "neutral";
}
```

- 白色卡片 (`bg-white`, `shadow-sm`, `border`, `rounded-lg`)
- 上方小字标签（muted）
- 中间大数字（bold, 30px）
- 下方变化率（绿色/+、红色/-）

### 3.8 `ActionBar.tsx`

```ts
interface ActionBarProps {
  selectedCount: number;
  actions: { label: string; onClick: () => void; variant?: "primary" | "danger" | "default" }[];
}
```

- 仅在 `selectedCount > 0` 时显示
- 固定底部或表格上方浮动条
- 显示 "已选择 X 项"
- 操作按钮组（如：批量批准、批量驳回）

### 3.9 `PageHeader.tsx`

```ts
interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}
```

- 左：标题（24px, bold）+ 描述（14px, muted）
- 右：操作按钮区

### 3.10 `StepIndicator.tsx`

```ts
interface Step {
  label: string;
  description?: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}
```

- 水平步骤条
- 已完成步骤蓝色填充
- 当前步骤蓝色边框
- 未完成步骤灰色

---

## 4. 各页面 Redesign 详细方案

### 4.1 登录页 `/login/page.tsx`

布局：左右两栏
- **左栏** (w-96, 深蓝 #1e293b background)：
  - 应用名 "MyApp" (大号白色)
  - 标语 "業務管理システム" (白色半透明)
  - 底部装饰性线条/几何图形
- **右栏** (flex-1, white background)：
  - 居中白色卡片 (max-w-sm)
  - 标题 "ログイン"
  - 用户名输入框 + 密码输入框
  - "ログイン" 蓝色按钮 (w-full)
  - 底部版权信息

### 4.2 首页 `/page.tsx`

替换为 `next/navigation` 的 `redirect("/dashboard")`。

### 4.3 Dashboard `/dashboard/page.tsx`

```
PageHeader(title="Dashboard", description="ようこそ、{user}さん")
StatCard x 4（横排）
```

四个 StatCard：总用户数 / 营收 / 活跃会话 / 处理中请求
下方：最近活动列表（简单表格或卡片列表）

### 4.4 Master 管理模块

#### 4.4.1 首页 `/master/page.tsx`

```
PageHeader(title="Master管理", description="マスターデータ管理")
3 个入口卡片（店铺管理 / 请求CD管理 / 单价管理）
```

卡片样式：
- 白色背景，边框，圆角
- 左上：图标（圆形背景） + 标题 + 说明
- 右下：→ 箭头指示

#### 4.4.2 店铺管理 `/master/store/page.tsx`

```
PageHeader(title="店铺管理", actions=[<新規登録 button>])
[SearchInput] [FilterSelect(状态)]
DataTable(
  columns: [店铺CD, 店铺名, 住所, 電話番号, ステータス(StatusBadge), 操作],
  actions: [編集, 削除]
)
Pagination
Modal(新規登録/編集): 店铺CD, 店铺名, 住所, 電話番号, ステータス
```

#### 4.4.3 请求CD管理 `/master/request-cd/page.tsx`

```
PageHeader(title="请求CD管理")
[SearchInput] [FilterSelect(区分)]
DataTable(columns: [CD, 名称, 区分, 必須(チェック), 説明, 操作])
Modal(新規/編集): CD, 名称, 区分, 必須(checkbox), 説明, 表示順
```

#### 4.4.4 单价管理 `/master/price/page.tsx`

```
PageHeader(title="单价管理")
[SearchInput] [FilterSelect(店铺)]
DataTable(columns: [商品CD, 商品名, 店铺, 単価, 適用開始日, 操作])
Modal(編集): 単価, 適用開始日
```

### 4.5 请求业务模块

#### 4.5.1 首页 `/request/page.tsx`

同 master/ 首页结构，3 个入口卡片（一括価格修正 / 元データ管理 / 承認管理）

#### 4.5.2 一括価格修正 `/request/bulk-adjust/page.tsx`

```
PageHeader(title="一括価格修正")
StepIndicator(steps: [条件設定, プレビュー, 適用実行], currentStep)
```

- **Step 1 条件設定**：
  - 店铺選択（下拉） + 商品筛选（输入） + 金额范围
  - 「次へ」按钮
- **Step 2 プレビュー**：
  - DataTable(columns: [商品CD, 商品名, 現価格, 新価格, 差額])
  - 「戻る」「適用」按钮
- **Step 3 適用実行**：
  - 确认信息汇总
  - 「実行」按钮
  - 完成后显示结果（成功件数、失败件数）

#### 4.5.3 元データ管理 `/request/metadata/page.tsx`

```
PageHeader(title="元データ管理", actions=[<新規登録 button>])
[SearchInput] [FilterSelect(区分)]
DataTable(columns: [ID, 名称, 区分, 必須, 表示順, 説明, 操作])
Modal(新規/編集)
```

#### 4.5.4 承認管理 `/request/approval/page.tsx`

```
PageHeader(title="承認管理")
Tab 切换: [全部 / 未承認 / 承認済 / 却下済]
[SearchInput] [FilterSelect(種類)]
ActionBar(actions: [一括承認, 一括却下])
DataTable(columns: [checkbox, ID, 依頼者, 種類, ステータス, 作成日, 操作], selectable)
Pagination
Modal(承認/却下): 処理備考(textarea)
```

- Tab 切换时筛选数据
- ActionBar 在选中行 > 0 时显示

### 4.6 代引业务模块

#### 4.6.1 首页 `/delivery/page.tsx`

3 个入口卡片（代引管理 / 支付管理 / 配送日历）

#### 4.6.2 代引管理 `/delivery/list/page.tsx`

```
PageHeader(title="代引管理", actions=[<CSV出力 button>])
[SearchInput] [FilterSelect(状态)] [FilterSelect(店铺)]
ActionBar(actions: [一括処理])
DataTable(columns: [checkbox, 注文番号, 店铺, 商品, 金額, ステータス, 顧客名, 作成日, 操作], selectable)
Pagination
Modal(詳細): 全部订单信息展示
Modal(処理): 処理備考
```

#### 4.6.3 出金管理 `/delivery/payment/page.tsx`

```
PageHeader(title="出金管理")
[SearchInput] [FilterSelect(状态)] [FilterSelect(店铺)]
DataTable(columns: [ID, 注文番号, 店铺, 金額, 振込先, 依頼日, ステータス, 操作])
Pagination
```

#### 4.6.4 代引日历 `/delivery/calendar/page.tsx`

```
PageHeader(title="代引日历")
月份切换: < 2026年5月 >
月历表格 (7列: 日〜土)
  每个格子:
    - 日付数字
    - 入金日标记（蓝色点）
    - 结算日标记（绿色点）
    - 出金日标记（橙色点）
点击日期 → Modal(編集): 入金日, 结算日, 出金日, 備考
```

### 4.7 退款业务模块

#### 4.7.1 首页 `/refund/page.tsx`

2 个入口卡片（退款记录管理 / CD 定义管理）

#### 4.7.2 退款记录管理 `/refund/list/page.tsx`

```
PageHeader(title="退款记录管理", actions=[<CSV出力 button>])
[SearchInput] [FilterSelect(状态)] [FilterSelect(店铺)] [日付範囲 from/to]
ActionBar(actions: [一括承認, 一括却下])
DataTable(columns: [checkbox, 返品番号, 注文番号, 店铺, 商品, 数量, 金額, 理由, ステータス, 操作], selectable)
Pagination
Modal(承認/却下): 備考
```

#### 4.7.3 CD定義管理 `/refund/cd/page.tsx`

```
PageHeader(title="CD定義管理", actions=[<新規登録 button>, <CSV取込 button>])
[SearchInput] [FilterSelect(区分)]
DataTable(columns: [CD, 名称, 説明, 表示順, ステータス, 操作])
Modal(新規/編集): CD, 名称, 説明, 表示順, ステータス
```

### 4.8 明细下载模块

#### 4.8.1 首页 `/download/page.tsx`

2 个入口卡片（保管明细下载 / 配送明细下载）

#### 4.8.2 保管明细下载 `/download/hokan/page.tsx`

```
PageHeader(title="保管明细下载")
条件区域 (Card):
  日付範囲: [開始日] ~ [終了日]
  店铺選択: [FilterSelect]
  商品選択: [SearchInput]
  [CSV ダウンロード] [Excel ダウンロード] 按钮

下载历史:
  DataTable(columns: [ID, 文件名, 下载日, 形式(StatusBadge), 记录数])
```

#### 4.8.3 配送明细下载 `/download/sohaku/page.tsx`

同 hokan 结构，条件字段调整为配送相关。

### 4.9 明细修正 `/correction/page.tsx`

```
PageHeader(title="明细修正", description="価格修正申請管理", actions=[<新規修正申請 button>])
[SearchInput] [FilterSelect(ステータス)]
ActionBar(actions: [一括承認, 一括却下])
DataTable(columns: [checkbox, ID, 商品名, 店铺, 旧価格, 新価格, 理由, ステータス, 作成日, 操作], selectable)
Pagination
Modal(新規/編集): 商品名, 店铺, 旧価格, 新価格, 理由
Modal(承認/却下): 備考
```

---

## 5. 文件变更清单

### 5.1 修改文件

| 文件 | 变更内容 |
|------|---------|
| `src/app/globals.css` | 重构 CSS 变量，移除 dark mode |
| `src/app/layout.tsx` | 移除 `dark:` 类，更新 body 样式 |
| `src/app/page.tsx` | 替换为 `redirect("/dashboard")` |
| `src/app/components/Navbar.tsx` | 整体替换为 `Sidebar.tsx` |
| `src/app/components/Footer.tsx` | 简化为单行居中文字 + 上边框 |
| `src/app/components/LayoutClient.tsx` | 更新为 Sidebar + TopBar + Content 三栏布局 |
| `src/app/login/layout.tsx` | 移除 `dark:` 类 |
| `src/app/login/page.tsx` | 重新设计左右分栏布局 |
| `src/app/dashboard/page.tsx` | 使用 StatCard，移除 dark mode 引用 |
| `src/app/master/page.tsx` | 统一卡片样式 |
| `src/app/master/store/page.tsx` | 使用 DataTable + SearchInput + Modal |
| `src/app/master/request-cd/page.tsx` | 同上 |
| `src/app/master/price/page.tsx` | 同上 |
| `src/app/request/page.tsx` | 统一卡片样式 |
| `src/app/request/bulk-adjust/page.tsx` | StepIndicator + DataTable |
| `src/app/request/metadata/page.tsx` | DataTable + Modal |
| `src/app/request/approval/page.tsx` | Tab + ActionBar + DataTable + Modal |
| `src/app/delivery/page.tsx` | 统一卡片样式 |
| `src/app/delivery/list/page.tsx` | DataTable + ActionBar + Modal |
| `src/app/delivery/payment/page.tsx` | DataTable |
| `src/app/delivery/calendar/page.tsx` | 保留月历核心逻辑，统一样式变量 |
| `src/app/refund/page.tsx` | 统一卡片样式 |
| `src/app/refund/list/page.tsx` | DataTable + ActionBar + Modal |
| `src/app/refund/cd/page.tsx` | DataTable + Modal |
| `src/app/download/page.tsx` | 统一卡片样式 |
| `src/app/download/hokan/page.tsx` | DataTable + 条件区域 |
| `src/app/download/sohaku/page.tsx` | DataTable + 条件区域 |
| `src/app/correction/page.tsx` | DataTable + ActionBar + Modal |

### 5.2 新增文件

| 文件 | 说明 |
|------|------|
| `src/app/components/Sidebar.tsx` | 左侧导航栏 |
| `src/app/components/TopBar.tsx` | 顶部栏（面包屑 + 用户信息） |
| `src/app/components/DataTable.tsx` | 通用数据表格 |
| `src/app/components/Pagination.tsx` | 分页器 |
| `src/app/components/SearchInput.tsx` | 搜索输入框 |
| `src/app/components/FilterSelect.tsx` | 下拉筛选 |
| `src/app/components/Modal.tsx` | 通用弹窗 |
| `src/app/components/StatusBadge.tsx` | 状态标签 |
| `src/app/components/StatCard.tsx` | 统计卡片 |
| `src/app/components/ActionBar.tsx` | 批量操作栏 |
| `src/app/components/PageHeader.tsx` | 页面标题区 |
| `src/app/components/StepIndicator.tsx` | 步骤指示器 |

### 5.3 删除文件

无删除。`Navbar.tsx` 内容替换为 `Sidebar`，文件名和导出可保留兼容（内部重写）。

---

## 6. 执行顺序

建议按以下顺序逐步实施，每完成一组可 `npm run build` 验证：

### Phase 1 — 基础设施 ✅
✅ 1. 重构 `globals.css`（新设计 tokens）
✅ 2. 更新 `layout.tsx`（移除 dark class）
✅ 3. 创建所有共享组件（12 个组件文件）
✅ 4. 重写 `Sidebar.tsx` + `TopBar.tsx`
✅ 5. 更新 `LayoutClient.tsx`

### Phase 2 — 登录 + 首页 + Dashboard ✅
✅ 6. 重写 `login/layout.tsx` + `login/page.tsx`
✅ 7. 重写 `page.tsx`（redirect）
✅ 8. 重写 `dashboard/page.tsx`

### Phase 3 — Master 模块（4 pages） ✅
✅ 9. `master/page.tsx` + `master/store/page.tsx`
✅ 10. `master/request-cd/page.tsx` + `master/price/page.tsx`

### Phase 4 — 请求业务模块（4 pages） ✅
✅ 11. `request/page.tsx` + `request/bulk-adjust/page.tsx`
✅ 12. `request/metadata/page.tsx` + `request/approval/page.tsx`

### Phase 5 — 代引业务模块（4 pages） ✅
✅ 13. `delivery/page.tsx` + `delivery/list/page.tsx`
✅ 14. `delivery/payment/page.tsx` + `delivery/calendar/page.tsx`

### Phase 6 — 退款业务 + 明细下载 + 修正（7 pages） ✅
✅ 15. `refund/`（3 pages）
✅ 16. `download/`（3 pages）
✅ 17. `correction/page.tsx`

### Phase 7 — 验证 ✅
✅ 18. `npm run build` + `npm run lint`

---

## 7. 常见陷阱与注意事项

1. **`eslint.config.mjs`** 中可能配置了 `no-unused-vars` 等规则，共享组件接口需 export 供外部使用
2. **所有页面目前都是 `"use client"`**，DataTable 等组件也需要是 client component
3. **路径别名 `@/*` 已配置**，组件引用使用 `@/app/components/DataTable`
4. **`next.config.ts`** 有 `trailingSlash: true`，所有 Link href 需以 `/` 结尾或保持一致性
5. **`src/proxy.ts`** 中间件保护路由，修改不影响 auth 逻辑
6. **CSS 变量名**统一用 `var(--xxx)` 引用，避免在 Tailwind class 中硬编码颜色
7. **每页 mock 数据保留**，不引入真实后端

---

## 8. 验收标准

- [ ] `npm run build` 无错误
- [ ] `npm run lint` 无 warning
- [ ] 登录页显示左右分栏布局
- [ ] 侧边栏所有导航项跳转正确
- [ ] 子菜单展开/折叠正常
- [ ] 所有 DataTable 显示数据、排序、分页正常
- [ ] Modal 打开/关闭/动画正常
- [ ] 搜索/筛选功能正常工作
- [ ] ActionBar 在选中时显示、取消选中后隐藏
- [ ] `/` 自动跳转到 `/dashboard`
- [ ] 所有页面蓝色主题一致
- [ ] 内容区域默认 `max-w-7xl`，数据表格页为 full-width

### 3.11 虚拟滚动集成说明

#### 3.11.1 技术选型

使用 **`@tanstack/react-virtual`** 而非 `react-window`。

原因：
- `@tanstack/react-virtual` 不替换 DOM 标签，能和 `<table>` / `<tbody>` / `<tr>` 原生表格元素配合
- `react-window` 用 `<div>` 渲染列表，无法直接用于表格结构
- 无额外依赖，`@tanstack/react-virtual` 已存在于项目中或只需轻量安装

#### 3.11.2 集成方式

只集成到 `DataTable` 内部实现，外部调用方无感知：

```ts
// DataTable 内部逻辑（伪代码）
const VIRTUALIZATION_THRESHOLD = 200;
const useVirtualization = data.length > VIRTUALIZATION_THRESHOLD;

if (useVirtualization) {
  // 使用 @tanstack/react-virtual 包裹 tbody
  // 固定行高（建议 48px），只渲染可视区行
  // 保持表头 thead 固定不动
} else {
  // 普通渲染全部行
}
```

#### 3.11.3 边界行为

| 条件 | 行为 |
|------|------|
| 数据 ≤ 200 行 | 普通渲染，不启用虚拟化 |
| 数据 > 200 行 | 自动启用虚拟化，固定行高 48px |
| 数据动态变化（筛选/搜索） | 数据刷新后重新计算是否启用 |
| 分页 + 虚拟化 | 分页在前端生效（当前页数据），虚拟化作用于当前页内的行 |
| 排序 + 虚拟化 | 排序后重新计算虚拟列表，滚动位置重置到顶部 |

#### 3.11.4 依赖安装

```bash
npm install @tanstack/react-virtual
```
