# ai-tool-navigator — AI 工具導航

使用者說出想做的事（「我想開一家手搖飲店」「做一支產品短影片」），從作者的 **97 個線上工具**＋10 個常用 AI 服務裡挑出適合的，像捷運路線一樣排好使用順序（每站一個步驟、站旁是工具卡）。等於整個工作區的入口。2026-11-15 建立（使用者從「還有那些軟體的方向」清單挑了「AI 工具選擇導航」）。畫面是**捷運路線圖風**（深藍站牌標題、12 條彩色路線＝12 個分類、圓圈車站）。

- 純靜態：`index.html`（CSS）＋`data.js`（`window.NAV`：`CATS` 12 類、`TOOLS` 105 個（2026-11-15 加坐姿健康操、2026-11-17 加訓練證書產生器、2026-11-18 加講師簡介與課程型錄產生器、講師現場提詞器、招生成效追蹤；2026-11-20 加開店選址評估，放進 shop 情境）、`GEN` 10 個一般 AI 服務、`GOALS` 37 種情境（2026-11-18 加 `trainer`「當講師接案、整理簡介與課程型錄」）、配對引擎；node 可 require）＋`app.js`＋`manual.html`＋PWA。無序號。
- 本機 port **8887**（`.claude/launch.json` 的 `ai-tool-navigator`）。visitor-badge `m255525.aitoolnavigator`。**2026-11-15 已上線** <https://m255525.github.io/ai-tool-navigator/>（repo 由使用者自己 `gh repo create`；push 時 Pages 還沒開，第一次部署失敗「Get Pages site failed」，開 Pages 後 `gh workflow run pages.yml` 重跑成功）。程式牆在 `REPO_META`，github-dashboard 已補。已放進創業島與創作者小鎮（出生點／梅林、雅典娜正南的燈塔，`FREE`＋`lighthouse`）。

## 資料（重要）
- **`TOOLS` 來源**：2026-11-15 用 `gh api users/M255525/repos` 列出公開 repo，逐一確認 GitHub Pages 網址回 200（97 個，全部是 `https://m255525.github.io/<repo>/`）。名稱沿用 github-dashboard 的 `REPO_META`，🔑 需序號沿用其 `LICENSED_REPOS`（另加 `phoenix-loan-generator`：線上部署的是教學版，要序號）。說明文字自寫。
- **新工具上線時要在 `TOOLS` 加一行，並放進至少一個 `GOALS` 的步驟**（測試會檢查沒被情境用到的工具、序號標記是否和 github-dashboard 一致）。
- `GEN` 只寫「適合做什麼」，**不寫價格與方案**（常變動，警語寫以官方為準）。
- `GOALS`：`kw` 空白分隔的關鍵字（比對方式是「關鍵字是否出現在句子裡」，長的分數高）＋ `steps:[[步驟, [工具id], [一般AI id]]]`＋選填 `tip`、`p`（可複製的提示詞範本）。

## 引擎
- `NAV.match(q)` → `{goals:[{g,s,hit}], tools:[{t,s}]}`：情境用關鍵字＋情境標題雙字詞重疊；工具用關鍵字＋名稱說明雙字詞，前兩個情境的工具加分。門檻：情境 ≥1、工具 ≥1.2。
- `NAV.aiPrompt(q)` 附整份目錄（約 7k 字）要 AI 只輸出 JSON；`NAV.cleanAi(j)` 只留目錄裡的 id（最多 7 步、每步 4 個工具＋3 個 AI）。
- **改 data.js 後跑 `node tools/test_engine.mjs`**（目錄完整性＋21 個常見問法要命中正確情境與工具＋亂打不配＋cleanAi）。

## 畫面
- 三種用法：🔍 幫我找（規則比對，**不送出任何請求**）、✨ AI 幫我排（BYOK 7 家，`callLLM` 從開店前置清單 ai.js 精簡；金鑰存 `nav.ai`）、📋 複製提示詞（免金鑰貼到 ChatGPT 等）。
- 分享網址 `#q=問題&g=情境id`，有 `hashchange` 監聽（同頁改網址也會重讀）。
- 全部路線圖：情境目錄、全部工具（關鍵字／分類篩選）、常用 AI 服務。
- localStorage 前綴 `nav.`：`ai`、`fs`、`theme`、`warnSeen`、`marquee`。測試掛鉤 `window._nav`。
- `python tools/e2e_nav.py <截圖資料夾>`（先開 8887；`NAV_BASE` 可測線上版）：首訪警語、規則比對不送出請求、路線、換情境、範例、需序號標示、複製提示詞、沒金鑰開設定、假 AI 回應過濾假工具、全部工具 97、篩選、情境目錄、找不到提示、網址還原、375px。2026-11-15 本機全過、無 console 錯誤；上線後設 `NAV_BASE=https://m255525.github.io/ai-tool-navigator/` 再跑一輪全過。

## 標準配備
跑馬燈（工作區公告 GAS，滑鼠移入暫停）、⚙ 常用設定（收合式：顯示、AI 設定、清除、關於本工具）、首訪警語、`manual.html#creator`（改 `tools/manual_body.html` 後跑 `python tools/build_manual.py`）、PWA（`tools/make_icons.py`；改版升 `service-worker.js` 的 `CACHE_NAME`）、訪客計數器。

## MCP 同步
`data.js` 也被 `小工具/rules-engine-mcp/` 複製去當 MCP 工具引擎。改了 `data.js` 之後，到該資料夾跑 `node tools/sync_engines.mjs --write` 再 `npm test`。
