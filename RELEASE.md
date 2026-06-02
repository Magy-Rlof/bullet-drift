# 发布准备

## 发布目标

将《弹幕漂移》作为一个静态网页小游戏发布到 GitHub，并通过 GitHub Pages 提供在线访问。

## 推荐仓库信息

- 仓库名：`bullet-drift`
- 描述：`A lightweight Canvas bullet-dodging browser game`
- 可见性：公开或私有都可以；如果希望 GitHub Pages 公开访问，建议使用公开仓库。
- Topics：`canvas-game`、`javascript`、`browser-game`、`bullet-hell`、`github-pages`

## 发布前文件检查

根目录应至少包含：

```text
index.html
styles.css
game.js
favicon.svg
README.md
PRODUCT.md
DESIGN.md
RELEASE.md
server.mjs
.gitignore
```

其中 `index.html`、`styles.css`、`game.js`、`favicon.svg` 是线上运行所需文件。`server.mjs` 只用于本地测试。

## 本地验证

运行：

```bash
node --check game.js
node server.mjs
```

打开：

```text
http://127.0.0.1:4173
```

如果端口被占用，PowerShell 中运行：

```powershell
$env:PORT=4180; node server.mjs
```

## 手动测试清单

- 准备态可以开始游戏。
- 键盘移动正常。
- 触控 / 鼠标拖动为相对拖动，不会把主角直接吸到手指位置。
- 暂停后战场信息仍可见，继续时没有旧字幕闪烁。
- 桌面全屏后只显示游戏内容和必要按钮。
- 桌面全屏按 `Esc` 退出全屏，不触发暂停。
- 手机横屏没有上下滚动，游戏画面占比足够大。
- 手机竖屏显示横屏提示、规则和道具说明。
- `C` 清场、`S` 护盾、`L` 减速都能触发。
- 时效道具倒计时跟随主角，且不导致 HUD 抖动。
- 撞击失败后可以立刻重开。
- 刷新最高分时显示“新纪录”反馈。
- 使用 `?resetData=1` 可以清理本游戏本地数据。

## 发布截图

当前已准备 1 张实机截图：

```text
docs/screenshot-gameplay.png
```

用途：作为 README 预览图，展示实际游戏场地、弹幕和道具倒计时效果。

## 推送到 GitHub

添加远程仓库：

```bash
git remote add origin https://github.com/<your-name>/bullet-drift.git
```

推送：

```bash
git push -u origin main
```

如果远程仓库已经存在，先确认：

```bash
git remote -v
```

## 开启 GitHub Pages

1. 打开 GitHub 仓库。
2. 进入 `Settings` -> `Pages`。
3. `Source` 选择 `Deploy from a branch`。
4. `Branch` 选择 `main`。
5. 目录选择 `/ (root)`。
6. 保存并等待 Pages 构建完成。

发布后访问地址通常是：

```text
https://<your-name>.github.io/bullet-drift/
```

## 发布后复查

- 在线页面可以打开。
- `favicon.svg` 正常显示。
- 中英文切换正常。
- 最高分能在浏览器中保存。
- 页面刷新后游戏仍能正常开始。
- 手机浏览器横屏体验正常。
