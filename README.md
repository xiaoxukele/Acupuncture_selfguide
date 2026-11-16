# 经穴：身体与耳穴学习图谱

## 直接下载使用

[下载离线压缩包](releases/Acupuncture_selfguide-offline-1.0.0.zip)。将整个压缩包解压，进入文件夹后双击 **打开网页.html** 即可使用，不用安装任何开发工具或启动服务器。优先使用电脑上的 Chrome、Edge、Firefox 或 Safari。

请保留网页旁边的 `assets` 文件夹、`app.js` 与 `styles.css`。搜索、筛选、图谱联动和收藏等可离线使用；外部原始文献链接需要联网。收藏与主题只保存在接收者自己的浏览器，移动文件夹或清理浏览器数据可能使收藏失效。

静态 HTML / CSS / JavaScript，`source-data` 保留本次使用的 `data-preparation` 数据快照。无服务端、无症状采集。收藏与主题偏好仅保存在当前浏览器。

## 本地运行

在此目录运行 `npm install`、`npm run build`、`npm run dev`，浏览器打开 http://127.0.0.1:4173 。也可直接打开 `dist/index.html`，主要功能不依赖 fetch。

`npm run build` 将数据与原始 SVG 图复制到 dist，并生成可离线载入的数据脚本。前端使用自定义 SVG 标点层保留原稿坐标，用于学习展示，不用于临床定位。

## 功能

- 按病痛、穴名和国际编码搜索；按身体部位筛选。
- 人体正背面、耳部图切换，相关穴位高亮，图上点选、详情联动和缩放。
- 病痛索引、浏览器本地收藏、浅色/深色主题。
- 按条目查看原始资料、适用范围、干预方式、证据限制与就医提示。
- 导出 CSV / JSON，下载带使用说明的原始 SVG 示意图。
- 响应式布局、键盘可操作标点、原生 dialog 焦点管理与减少动画偏好支持。

## 医学内容状态

这是待专业复核的学习原型。底层数据的 publishable=false 与审定状态不变。网页展示不代表医学审核通过。全部图示均不可用于实际取穴或针刺导航，未加入自行针刺操作信息。

## 验证

`npx playwright test tests/atlas.spec.js` 使用本机 Chrome 检查搜索、筛选、体穴/耳穴联动、隐藏面、收藏持久化、弹窗、主题、手机宽度与控制台错误，运行前需先启动本地预览服务器。`tests/` 中的截图用于核对布局。静态输出位于 dist。

重新打包：`npm run build` 后运行 `python scripts/package_offline.py`。解压后设置环境变量 `ATLAS_OFFLINE_ENTRY` 为 `打开网页.html` 的绝对路径，再运行 `npx playwright test tests/offline.spec.js`，验证断网、无服务器的实际使用流程。
