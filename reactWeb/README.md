# Oasis Navigation System - React Frontend

基于 React 19 + Vite + TypeScript + Antd 构建的导航网站管理系统前端。

## 功能特性

- 🚀 **React 19** - 最新的 React 版本，支持并发特性
- ⚡ **Vite** - 极速的开发构建工具
- 🎨 **Tailwind CSS** + **Ant Design** - 现代化的UI设计
- 📱 **响应式设计** - 支持桌面端和移动端
- 🔍 **搜索和过滤** - 支持按分类和关键词搜索导航
- 👁️ **多视图模式** - 支持网格和列表两种展示方式
- 🔐 **管理后台** - 完整的导航、分类、系统配置管理
- 🔒 **账户信息保护** - 敏感信息加密显示
- 📦 **TypeScript** - 完整的类型支持

## 技术栈

- **框架**: React 19 + TypeScript
- **构建工具**: Vite 7
- **UI组件**: Ant Design 5 + Tailwind CSS 4
- **状态管理**: React Query (TanStack Query)
- **HTTP客户端**: Axios
- **图标**: Lucide React
- **样式**: PostCSS + Autoprefixer

## 项目结构

```
src/
├── components/          # 公共组件
│   ├── AdminSidebar/   # 管理侧边栏
│   ├── IconDisplay/    # 图标显示组件
│   ├── LoginModal/     # 登录弹窗
│   ├── NavGrid/        # 网格视图
│   └── NavList/        # 列表视图
├── hooks/              # 自定义Hook
│   └── useNavigation.ts
├── pages/              # 页面组件
│   ├── Admin/          # 管理后台
│   └── Navigation/     # 导航首页
├── services/           # API服务
│   └── api.ts
├── types/              # 类型定义
│   └── index.ts
├── utils/              # 工具函数
│   └── request.ts
├── App.tsx             # 主应用
├── main.tsx           # 应用入口
└── index.css          # 全局样式
```

## 快速开始

### 环境要求

- Node.js >= 20.11.0（推荐）
- npm >= 10.2.4

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

项目将在 http://localhost:3000 启动，自动代理后端 API 到 http://localhost:1249

访问地址：
- 导航首页: http://localhost:3000
- 管理后台: http://localhost:3000/admin

## 构建部署

### 构建模式说明

项目支持三种构建模式：

#### 1. 合并部署模式（推荐）

**适用场景**: 将前端打包到 Spring Boot 后端的静态资源目录，通过后端统一提供服务

```bash
npm run build:merged
```

构建产物输出到: `../api/src/main/resources/static`

特点：
- 前后端合并部署，只需一个端口
- 无需配置跨域
- 生产环境推荐方式
- Docker 镜像使用此模式

#### 2. 标准生产构建

```bash
npm run build
```

构建产物输出到: `./dist`

特点：
- 标准的 Vite 构建
- 生产模式配置
- 可独立部署到 Nginx 等静态服务器

#### 3. 独立部署模式

```bash
npm run build:standalone
```

构建产物输出到: `./dist`

特点：
- 独立的前端服务部署
- 需要配置后端 API 地址
- 适合前后端分离部署

### 预览生产版本

```bash
npm run preview
```

预览服务将在 http://localhost:3000 启动

## 开发指南

### 代码检查

```bash
# 运行 ESLint 检查
npm run lint

# 自动修复 ESLint 问题
npm run lint:fix
```

### TypeScript 类型检查

```bash
npm run type-check
```

### 项目脚本说明

| 命令 | 说明 | 输出目录 |
|------|------|---------|
| `npm run dev` | 启动开发服务器 | - |
| `npm run build` | 标准生产构建 | `./dist` |
| `npm run build:merged` | 合并部署构建 | `../api/src/main/resources/static` |
| `npm run build:standalone` | 独立部署构建 | `./dist` |
| `npm run preview` | 预览生产版本 | - |
| `npm run lint` | ESLint 代码检查 | - |
| `npm run lint:fix` | 自动修复代码问题 | - |
| `npm run type-check` | TypeScript 类型检查 | - |

## 环境变量配置

项目使用不同的环境变量文件来管理不同部署模式：

### 环境变量文件

| 文件 | 用途 | 构建命令 |
|------|------|---------|
| `.env.development` | 开发环境 | `npm run dev` |
| `.env.production` | 生产环境（合并部署） | `npm run build:merged` |
| `.env.standalone` | 独立部署环境 | `npm run build:standalone` |
| `.env.example` | 环境变量示例 | - |

### 环境变量说明

```env
# 部署模式
VITE_DEPLOY_MODE=merged|standalone

# 项目基础路径
VITE_BASE_PATH=/

# API 接口前缀（开发环境使用，生产环境根据部署模式配置）
VITE_API_BASE_URL=/api
```

### 不同部署模式的配置

#### 开发环境 (.env.development)
```env
VITE_DEPLOY_MODE=development
VITE_BASE_PATH=/
VITE_API_BASE_URL=/api  # Vite 代理到 http://localhost:1249
```

#### 合并部署 (.env.production)
```env
VITE_DEPLOY_MODE=merged
VITE_BASE_PATH=/
VITE_API_BASE_URL=  # 为空，直接调用同源后端接口
```

#### 独立部署 (.env.standalone)
```env
VITE_DEPLOY_MODE=standalone
VITE_BASE_PATH=/
VITE_API_BASE_URL=http://your-backend-api.com/api  # 后端 API 地址
```

### 自定义配置

如需自定义配置，可创建 `.env.local` 文件（不会被 Git 跟踪）：

```env
# 自定义 API 地址
VITE_API_BASE_URL=http://localhost:8080/api

# 其他自定义配置...
```

## 部署指南

### 方式一：合并部署（推荐）

将前端构建到后端静态资源目录，与 Java 后端一起部署：

```bash
# 1. 构建前端
npm run build:merged

# 2. 前端文件会自动输出到 ../api/src/main/resources/static

# 3. 构建后端 JAR（会包含前端静态文件）
cd ../api
mvn clean package

# 4. 运行应用
cd target/output
java -jar api-0.0.1-SNAPSHOT.jar

# 访问: http://localhost:1249
```

### 方式二：Nginx 独立部署

构建独立的前端静态文件，部署到 Nginx：

```bash
# 1. 修改 .env.standalone 配置后端 API 地址
# VITE_API_BASE_URL=http://your-backend-api.com/api

# 2. 构建
npm run build:standalone

# 3. 将 dist 目录内容复制到 Nginx 静态目录
cp -r dist/* /usr/share/nginx/html/

# 4. Nginx 配置示例
```

Nginx 配置文件 (`/etc/nginx/conf.d/oasis.conf`):

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /usr/share/nginx/html;
    index index.html;

    # 单页应用路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 代理（可选，如果后端跨域）
    location /api {
        proxy_pass http://your-backend:1249;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

### 方式三：Docker 部署

使用 Docker 构建并部署（已包含在项目根目录的 Dockerfile 中）：

```bash
# 从项目根目录构建
docker build -t tannnn/oasis:latest -f api/Dockerfile .

# 运行容器
docker run -d -p 1249:1249 --name oasis tannnn/oasis:latest

# 或使用 Docker Compose
docker-compose up -d
```

详细说明请参考根目录的 [DOCKER.md](../DOCKER.md)

### 方式四：Vercel / Netlify 部署

适合纯前端独立部署：

#### Vercel 部署

```bash
# 1. 安装 Vercel CLI
npm i -g vercel

# 2. 登录
vercel login

# 3. 部署
vercel --prod
```

#### Netlify 部署

创建 `netlify.toml`:

```toml
[build]
  command = "npm run build:standalone"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

然后通过 Netlify CLI 或 Web 界面部署。

## 开发最佳实践

### 目录结构规范

```
src/
├── components/     # 公共可复用组件
│   └── [Component]/
│       ├── index.tsx
│       └── [Component].css (可选)
├── pages/         # 页面组件
├── hooks/         # 自定义 Hooks
├── services/      # API 服务层
├── types/         # TypeScript 类型定义
└── utils/         # 工具函数
```

### 代码风格

- 使用 ESLint + TypeScript 保证代码质量
- 组件使用函数式组件 + Hooks
- 优先使用 TypeScript 类型推导
- 使用 Tailwind CSS 进行样式开发
- 复杂逻辑抽离为自定义 Hooks

### 性能优化

- 使用 React.memo 优化组件渲染
- 使用 useMemo / useCallback 缓存计算结果
- 路由懒加载（如需要）
- 图片压缩和懒加载
- 使用 React Query 管理服务端状态

### API 调用规范

所有 API 调用统一通过 `src/services/api.ts` 管理：

```typescript
import { request } from '@/utils/request';

export const navigationApi = {
  // 获取导航列表
  getNavigations: () => request.get('/nav/list'),

  // 创建导航
  createNavigation: (data: NavigationAdd) =>
    request.post('/nav/add', data),
};
```

## 故障排查

### 常见问题

#### 1. 开发服务器无法启动

```bash
# 清理依赖重新安装
rm -rf node_modules package-lock.json
npm install
```

#### 2. 构建失败

```bash
# 检查 TypeScript 类型���误
npm run type-check

# 检查 ESLint 错误
npm run lint
```

#### 3. API 请求 404

检查：
- 后端服务是否启动（http://localhost:1249）
- Vite 代理配置是否正确
- API 路径是否正确

#### 4. 页面空白

检查浏览器控制台错误信息：
- 路由配置是否正确
- 静态资源路径是否正确
- BASE_PATH 环境变量配置

### 调试技巧

```bash
# 查看详细构建日志
npm run build -- --debug

# 使用 React DevTools 调试组件
# Chrome/Firefox 扩展商店搜索 "React Developer Tools"

# 分析打包体积
npm run build
npx vite-bundle-visualizer
```

## 主要功能

### 导航首页
- 展示所有导航项
- 支持按分类筛选
- 支持关键词搜索
- 网格/列表视图切换
- 账户信息查看（需密钥）

### 管理后台
- **导航管理**: 增删改查导航项
- **分类管理**: 管理导航分类
- **系统配置**: 系统参数设置

### 安全特性
- 管理员登录验证（JWT Token）
- 账户信息密钥保护
- 敏感数据加密显示
- XSS 防护

## 技术细节

### Vite 配置说明

项目通过 `vite.config.ts` 配置不同模式的构建：

```typescript
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // 根据 mode 决定输出目录
  const isMergedMode = mode === 'production'
  const outDir = isMergedMode
    ? path.resolve(__dirname, '../api/src/main/resources/static')
    : 'dist'

  return {
    base: env.VITE_BASE_PATH || '/',
    build: { outDir },
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: 'http://localhost:1249',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  }
})
```

### 构建优化

- **代码分割**: 自动按路由和组件分割
- **Tree Shaking**: 自动移除未使用代码
- **资源压缩**: CSS/JS 自动压缩
- **资源指纹**: 文件名包含 hash，利于缓存
- **Chunk 优化**: 合理的 chunk 分割策略

构建产物结构：
```
dist/
├── index.html
├── js/
│   ├── index-[hash].js      # 入口文件
│   └── [name]-[hash].js     # 分块文件
├── css/
│   └── [name]-[hash].css
└── assets/
    └── [name]-[hash].[ext]  # 图片、字体等静态资源
```

## 更新日志

### v1.0.0 (2024-10)
- ✨ 初始版本发布
- 🎨 React 19 + Vite 7 + TypeScript
- 📦 支持多种部署模式
- 🔐 管理后台功能
- 📱 响应式设计

## 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 提交 Pull Request

### 提交规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式调整（不影响功能）
refactor: 代码重构
perf: 性能优化
test: 测试相关
chore: 构建/工具链相关
```

示例：
```
feat: 添加导航项拖拽排序功能
fix: 修复分类筛选不生效的问题
docs: 更新 README 部署说明
```

## 相关文档

- [项目总体说明](../README.md)
- [Docker 部署指南](../DOCKER.md)
- [后端 API 文档](../api/README.md)

## 技术支持

- 问题反馈: [GitHub Issues](https://github.com/yourusername/oasis/issues)
- 讨论交流: [GitHub Discussions](https://github.com/yourusername/oasis/discussions)

## 作者

- **作者**: tannnn
- **项目**: Oasis Navigation System
- **版本**: 1.0.0

## 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](../LICENSE) 文件
