/* AI 工具導航：工具目錄、情境（我想…）、一般 AI 工具、配對引擎（瀏覽器 window.NAV；node 可 require）
 * 工作區工具：2026-11-15 以 GitHub API 列出 M255525 帳號的公開 repo，逐一確認 GitHub Pages 網址回應 200（97 個）。
 * 說明文字依各專案現況自行撰寫；🔑＝需要課程序號（依 github-dashboard 的 LICENSED_REPOS）。
 * 一般 AI 工具只寫「適合做什麼」，不寫價格與方案（常變動，以官方為準）。 */
(function(root){
'use strict';
var BASE = 'https://m255525.github.io/';

var CATS = [
  {id:'start', n:'創業與資金', ic:'💰'}, {id:'calc', n:'經營試算與分析', ic:'📊'}, {id:'idea', n:'發想與策略', ic:'💡'},
  {id:'ecom', n:'跨境電商', ic:'📦'}, {id:'social', n:'社群與行銷內容', ic:'📣'}, {id:'prompt', n:'提示詞與 AI 技能', ic:'🧩'},
  {id:'media', n:'影片・聲音・圖像', ic:'🎬'}, {id:'class', n:'教學與課堂', ic:'🏫'}, {id:'senior', n:'樂齡與家人', ic:'👵'},
  {id:'life', n:'生活小工具', ic:'🍱'}, {id:'map', n:'地圖與休閒', ic:'🗺'}, {id:'game', n:'遊戲與體感', ic:'🎮'}
];

/* 工作區線上工具：[id, 名稱, 分類, 一句話說明, 關鍵字, 需序號] */
var T = [
  // 創業與資金
  ['loan-eligibility-checker', '創業貸款資格核對', 'start', '回答幾個問題，比對鳳凰貸款與就業保險創業貸款的資格條件', '貸款 資格 鳳凰 創業貸款 青創 能不能借 條件'],
  ['phoenix-loan-generator', '鳳凰貸款申請書產生器', 'start', '一步步填好微型創業鳳凰貸款申請書與營運計畫，匯出文件', '鳳凰 貸款 申請書 營運計畫 計畫書 微型創業', 1],
  ['shop-opening-checklist', '開店前置清單', 'start', '依店型排出登記、稅籍、勞健保、食安到開幕的倒數清單與預算', '開店 開業 登記 稅籍 勞健保 店面 開幕 手續 營業登記'],
  ['shop-site-selector', '開店選址評估', 'start', '台北、新北、桃園、新竹 70 區到村里、最小統計區的開店地點評分，再比較候選店面與數人流', '選址 店址 地點 商圈 開在哪 找店面 店面 租店面 人流 街區 村里 統計區 位置'],
  ['credit-5c-risk-diagnosis', '信用 5C 財務風險診斷', 'start', '從銀行放款角度看財報，算 16 項比率、評等與審查意見書', '銀行 授信 財報 比率 信用 5c 借錢 評等 融資'],
  ['industry-talent-generator', '產業人才投資方案開課申請書', 'start', '替員工訓練課程寫附表二開課申請書，申請政府訓練補助', '訓練 補助 開課 人才投資 申請書 員工訓練'],
  ['course-poster-maker', '課程招生海報產生器', 'class', '填課程資訊，自動排出 A4 海報與 IG／FB／LINE 招生圖，附報名 QR', '招生 海報 傳單 文宣 課程宣傳 報名 qr 社群圖 dm', 1],
  ['enrollment-source-tracker', '招生成效追蹤', 'class', '每個招生管道一條專屬報名連結與 QR，匯入報名名單看哪個管道最有效、能不能額滿', '招生 成效 報名 來源 管道 追蹤 連結 utm 廣告成效 轉換 額滿 報名表 google 表單', 1],
  ['lecture-teleprompter', '講師現場提詞器', 'class', '講台平板用：段落倒數、要點、下一段，落後時建議刪哪段，課後時間報告', '提詞器 時間控制 倒數 計時 時間表 超時 講台 簡報筆 講稿 排課 時間分配'],
  ['instructor-profile-catalog', '講師簡介與課程型錄產生器', 'class', '講師資料填一次，產生三種長度簡介、主持人介紹稿、講師資料表與 A4 課程型錄', '講師簡介 自我介紹 講師資料表 課程型錄 課程介紹 邀課 接案 主持稿 履歷 經歷'],
  ['training-certificate-generator', '訓練證書產生器', 'class', '依出席與成績判斷發證，批次印結訓證書、研習證明與核發清冊', '證書 結訓 結業 研習證明 發證 訓練證明 辦訓 清冊', 1],
  ['employer-payroll-cost-calculator', '雇主人事成本試算', 'start', '算出勞健保、職災、勞退、補充保費、年終的真實人事成本', '人事成本 薪水 勞健保 請人 員工 勞退 薪資 加班'],
  ['my-first-shop-sim', '我的第一家店（開店經營模擬）', 'start', '在遊戲裡先開一次店：籌備 6 關、經營 12 個月，每關連到真實工具', '模擬 開店遊戲 經營 練習 創業遊戲'],
  // 經營試算與分析
  ['restaurant-feasibility-calculator', '餐飲店經營評估試算', 'calc', '坪效、人事、食材成本與損益兩平，評估一家餐飲店能不能做', '餐廳 餐飲 損益 試算 開餐廳 坪效 成本'],
  ['restaurant-menu-mix-calculator', '餐飲菜單組合收支平衡計算機', 'calc', '每道菜的成本與毛利、菜單工程矩陣、要賣幾份才打平', '菜單 定價 毛利 餐點 損益兩平 叫貨'],
  ['tourism-hotel-feasibility-calculator', '觀光飯店經營評估試算', 'calc', '淡旺季逐月損益與損益兩平住房率', '飯店 民宿 旅館 住房率 觀光'],
  ['amazon-cost-calculator', 'Amazon 成本分析計算機', 'calc', 'Amazon FBA／FBM 費用、利潤與售價試算', 'amazon 亞馬遜 fba 費用 利潤 成本', 1],
  ['amazon-listing-mix-calculator', '商品組合收支平衡計算機', 'calc', '多個商品一起看的損益兩平與廣告預算', '商品組合 損益兩平 廣告預算 amazon', 1],
  ['ecommerce-health-dashboard', '跨境電商健檢總覽', 'calc', '整合商品組合健檢、工作進度與各工具序號狀態', '健檢 電商 總覽 儀表板'],
  ['private-domain-rfm-studio', '私域流量與 RFM 顧客分析', 'calc', '會員分群（RFM）、私域流量試算，找出值得經營的顧客', 'rfm 會員 顧客 分群 私域 回購 crm', 1],
  ['member-points-designer', '會員點數制度設計', 'calc', '推會員卡前先算實際回饋率、點數成本、打平門檻與點數負債，附會員辦法草稿', '會員 點數 集點 集點卡 會員卡 紅利 回饋 折抵 忠誠度 會員制度'],
  ['IPA_Kano', 'IPA × Kano 滿意度分析', 'calc', '問卷結果做 IPA 重要度表現分析與 Kano 品質分類', '問卷 滿意度 ipa kano 分析', 1],
  ['personal-digital-workplace-analyzer', '個人職場數位化分析', 'calc', '盤點自己的工作任務，算出用數位工具能省多少時間', '工作效率 省時間 數位化 個人 職場'],
  ['company-digital-transformation-analyzer', '企業數位轉型分析', 'calc', '公司各部門流程盤點、可釋放人力、投資回收期與成熟度', '數位轉型 企業 流程 回收期 公司'],
  ['world-economy-globe', '世界經濟 3D 地圖', 'calc', '61 個經濟體 8 項指標的 3D 地球，看各國經濟與貿易夥伴', '世界 經濟 gdp 出口 國家 貿易'],
  ['staff-shift-planner', '員工排班表', 'calc', '排一週班表，自動排班並檢查勞基法工時、算加班費與人力成本', '排班 班表 輪班 工時 加班 例假 休息日 兼職 工讀 勞基法'],
  // 發想與策略
  ['business-idea-generator', '商業創意產生器', 'idea', '用關鍵字組合出商業點子，並用五個構面評分', '點子 創意 商業點子 想創業 做什麼生意', 1],
  ['business-model-canvas-generator', '商業模式圖產生器', 'idea', '把想法整理成九宮格商業模式圖', '商業模式 bmc 九宮格 獲利模式'],
  ['business-model-pattern-studio', '商業模式組合工作室', 'idea', '輸入產品，自動組合合適的商業模式並做 SWOT、五力、財務健檢', '商業模式 組合 五力 swot 財務'],
  ['where-what-how-strategy-studio', '商業策略工作室', 'idea', '用 Where-What-How 想清楚市場、產品與做法', '策略 市場 定位 競爭'],
  ['new-product-strategy-studio', '新品開發策略工作室', 'idea', '產品五層次、SWOT、定價策略與競品比較', '新產品 定價 競品 五層次', 1],
  ['new-product-dev-system', '新品開發系統化工作坊', 'idea', '從評論與客戶回饋走到痛點、創新方法、曼陀羅與概念提案', '新品 評論 痛點 創新 概念提案', 1],
  ['mandala-thinking', '曼陀羅思考法產生器', 'idea', '九宮格往外擴散想法，適合發想主題與企劃', '曼陀羅 九宮格 發想 腦力激盪'],
  ['scamper-thinking-generator', 'SCAMPER 創新思考法', 'idea', '用替代、合併、調整等七個角度改良產品或服務', 'scamper 改良 創新 發想'],
  ['six-thinking-hats-generator', '六頂思考帽分析', 'idea', '從事實、情緒、風險、優點、創意、統整六個角度看一件事', '六頂思考帽 決策 討論 分析'],
  ['innovation-matrix-studio', '創意打版台', 'idea', '用矩陣交叉組合產生創新點子', '創新 矩陣 組合 點子', 1],
  ['mentors-panel', 'AI 人物顧問團', 'idea', '請巴菲特、賈伯斯等人物視角的 AI 顧問給你不同觀點', '顧問 建議 人物 觀點 請教'],
  ['brand-name-checker', '品牌命名與商標初篩', 'idea', '產生店名品牌名，依商標法初篩撞名與識別性，整理查證清單', '取名 命名 店名 品牌名 商標 註冊 撞名 智慧局 品牌 logo名稱'],
  ['ogsm-strategy-planner', 'OGSM 策略規劃表', 'idea', '把年度策略寫成一頁 OGSM，檢查邏輯、展開到部門、每月追蹤', 'ogsm 年度計畫 年度策略 目標 策略 kpi okr 部門目標 策略展開 追蹤 方針'],
  // 跨境電商
  ['product-keyword-cloud', '跨境電商關鍵字文字雲', 'ecom', '整理商品關鍵字並做成文字雲，找出主要搜尋詞', '關鍵字 文字雲 seo 搜尋詞', 1],
  ['product-title-generator', '跨境商品標題產生器', 'ecom', '用規格、功能、形容詞與核心關鍵詞組出商品標題', '商品標題 標題 上架 listing', 1],
  ['amazon-listing-generator', '亞馬遜五點式產品說明產生器', 'ecom', '寫 Amazon 五點商品說明（bullet points）', '五點 bullet 商品說明 listing 文案', 1],
  ['ecommerce-competitor-analyzer', 'AI 電商競品分析系統', 'ecom', '我的商品對比 1～8 個競品：價格梯、特色矩陣、評論優缺點、定位圖', '競品 比價 競爭對手 定位 評論', 1],
  ['amazon-ppc-advisor', 'Amazon PPC 關鍵字廣告建議', 'ecom', '算出 PPC 出價並給廣告活動建議', 'ppc 廣告 出價 關鍵字廣告', 1],
  ['amazon-review-reply-generator', 'Amazon 客評／客訴回覆信', 'ecom', '針對買家評論或客訴寫回覆，附合規檢查', '客訴 評論 回覆 客服信 負評', 1],
  ['traffic-rank-estimator', '網站流量排名比較', 'ecom', '比較幾個網站的流量排名與規模', '流量 網站 排名 比較', 1],
  ['amazon-logistics-game', '跨境物流大挑戰', 'ecom', '用遊戲學 FBA、海運空運、清關與物流成本', '物流 海運 清關 fba 遊戲', 1],
  ['animal-ecommerce-adventure', '動物朋友的跨境電商大冒險', 'ecom', '故事地圖串起 7 個跨境電商工具，照順序學一遍', '跨境電商 入門 學習地圖 故事', 1],
  // 社群與行銷內容
  ['coffee-ig-planner', '社群內容規劃報告產生器', 'social', '依品牌條件規劃社群方向、平台與內容主題', '社群規劃 ig instagram 內容規劃 品牌'],
  ['annual-marketing-calendar', '全年度行銷行事曆', 'social', '把 52 週的節日與檔期排成時間軸，提早準備題材', '行事曆 檔期 節日 行銷活動 全年'],
  ['SocialPost', '社群貼文產生器', 'social', '寫 FB、IG、Threads 貼文與留言回覆（FB 可直接發布）', '貼文 臉書 fb ig threads 發文 留言'],
  ['social-post-grader', '社群貼文健診站', 'social', '貼文發出前先打分數：八個面向評分並給修改建議', '貼文 評分 健診 檢查 改文案'],
  ['social-editor-sim', '小編經營記（社群經營模擬）', 'social', '用遊戲體驗 12 個月的社群經營、炎上與預算', '小編 社群經營 模擬 遊戲'],
  ['text-organizer-studio', '文字整理編輯器', 'social', '把雜亂的草稿、逐字稿整理成有標題的文件，下載 Word', '整理 草稿 逐字稿 會議記錄 word 文件'],
  ['sonic-logo-studio', '品牌聲音 Logo 產生器', 'social', '依品牌個性產生 3～5 個音的招牌聲音，匯出 WAV／MIDI', '聲音logo 品牌音 jingle 招牌音 音效'],
  ['line-sticker-studio', 'LINE 貼圖自動化助手', 'social', '主題＋角色圖產生 LINE 貼圖，自動切格去背、符合上架規格', 'line 貼圖 sticker 角色'],
  ['edm-template-maker', '電子報 EDM 版型產生器', 'social', '積木組電子報，產出 Gmail、Outlook 不跑版的 HTML，寄前幫你健檢', '電子報 edm email 寄信 會員信 招生信 newsletter mailchimp 促銷信 行銷信', 1],
  // 提示詞與 AI 技能
  ['prompt-console', '提示詞控制台（CRISPE）', 'prompt', '用 CRISPE 框架一格一格組出好提示詞', '提示詞 prompt crispe 框架'],
  ['ai-prompt-generator', 'AI 提示詞產生器', 'prompt', 'TAG、APE、CO-STAR 等框架的提示詞產生器', '提示詞 prompt co-star 框架', 1],
  ['skill-prompt-studio', 'AI 技能提示詞工坊', 'prompt', '把需求轉成 Claude 技能、自訂 GPT、Gem；也能從圖片反推提示詞', '技能 gpts gem 自訂gpt 系統提示詞 反推 逆向', 1],
  ['crispe-game', 'CRISPE 卡牌配對', 'prompt', '用卡牌遊戲練習 CRISPE 提示詞框架', 'crispe 練習 遊戲'],
  ['costar-game', 'CO-STAR 卡牌配對', 'prompt', '用卡牌遊戲練習 CO-STAR 提示詞框架', 'costar co-star 練習'],
  ['swot-game', 'SWOT 卡牌配對', 'prompt', '用卡牌遊戲練習 SWOT 分析', 'swot 練習 分析'],
  // 影片・聲音・圖像
  ['ai-video-spec-generator', 'AI 影片規格產生器', 'media', '選模板、調風格滑桿，自動排分鏡並產生 AI 影片指令', '影片 分鏡 規格 腳本 短影片'],
  ['ai-video-prompt-studio', 'AI 短影片提示詞產生器', 'media', '產生 Sora、Veo、Runway、Kling 的影片提示詞', 'sora veo runway kling 影片提示詞', 1],
  ['ai-video-studio-play', 'AI 影音工坊（瀏覽器版）', 'media', '素材＋旁白配音自動合成影片，打開網頁就能用', '做影片 合成 配音 素材'],
  ['video-editor', '影片先生 影片編輯器', 'media', '在瀏覽器剪輯影片、加字幕', '剪輯 剪片 字幕 剪影片'],
  ['ai-voice-generator-play', 'AI 快速語音產生器', 'media', '文字轉語音配音，也能語音轉文字', '配音 語音 tts 旁白 朗讀 語音轉文字'],
  ['ai-music-prompt-studio', '音樂提示詞產生器', 'media', '產生 Suno 等 AI 音樂工具用的歌曲提示詞', '音樂 歌曲 suno 配樂', 1],
  ['ambient-sound-mixer', '環境音混音桌', 'media', '混出雨聲、海浪、咖啡廳等背景音，匯出無縫循環 WAV', '背景音 白噪音 環境音 助眠 讀書'],
  ['ai-image-prompt-studio', 'AI 繪圖提示詞工廠', 'media', '產生 AI 繪圖提示詞，含電商商品圖風格', '繪圖 圖片 海報 商品圖 生圖 提示詞', 1],
  ['comic-prompt-studio', '漫畫分鏡提示詞工坊', 'media', '把文字變成多格漫畫分鏡與生圖提示詞', '漫畫 分鏡 四格 繪本'],
  ['slide-style-yaml-studio', '簡報風格工坊', 'media', '產生 NotebookLM 簡報風格設定（YAML）', '簡報 notebooklm 投影片 風格 yaml'],
  // 教學與課堂
  ['attendance-qr', '出席簽到 QR', 'class', '投影 QR 讓學生手機掃碼簽到簽退，算遲到早退與出席時數', '簽到 點名 出席 出缺勤 遲到 早退 簽退 打卡 出席時數 qr'],
  ['teacher-classroom-helper', '講師課堂小幫手', 'class', '投影用：抽籤點名、分組、計時、搶答、投票、測驗', '上課 點名 分組 抽籤 搶答 投票 測驗 計時'],
  ['classroom-qa-wall', '課堂提問牆', 'class', '學生用手機匿名提問、按讚排序，也能做文字雲', '提問 匿名 qa 問答 文字雲'],
  ['peer-review-board', '同儕互評', 'class', '上台報告時，同學用手機依量表打分寫評語，產出回饋單', '互評 評分 報告 發表 回饋單'],
  ['classroom-auction-game', '創業資源大競標', 'class', '全班分組用手機競標創業資源，學稀缺與機會成本', '拍賣 競標 課堂遊戲 機會成本'],
  ['printable-game-maker', '列印即玩桌遊產生器', 'class', '把課程題材變成 A4 卡牌、骰子、賓果卡等紙上遊戲', '桌遊 教具 列印 卡牌 賓果'],
  ['practice-submission-lookup', '課堂練習存摺', 'class', '學生輸入學號查自己的練習繳交紀錄', '作業 繳交 練習 學號 查詢'],
  ['exam-score-lookup', '課程成績查詢', 'class', '學生輸入學號與姓名查測驗成績', '成績 分數 考試 查詢'],
  // 樂齡與家人
  ['ai-senior-learning-coach', 'AI 樂齡學習教練', 'senior', '長輩每天一課學用手機與 AI，還有防詐騙練習', '長輩 樂齡 學手機 老人 銀髮'],
  ['scam-message-checker', '詐騙訊息紅綠燈', 'senior', '貼上可疑簡訊或 LINE 訊息，看紅黃綠燈風險，一鍵撥 165', '詐騙 簡訊 可疑 165 假冒'],
  ['next-bus-helper', '交通出門助手', 'senior', '長輩只看下一班公車幾分鐘到（台北市、新北市）', '公車 等車 出門 幾分鐘到', 1],
  ['im-fine-checkin', '「我很好」每日報平安', 'senior', '長輩每天按一下報平安，沒按就通知家人', '報平安 獨居 長輩 通知家人', 1],
  ['big-dial-phonebook', '大字電話簿', 'senior', '長輩點家人大照片就能打電話，家人整理好用 LINE 傳過去', '電話簿 打電話 撥號 通訊錄 聯絡人 長輩手機 大字'],
  ['bp-glucose-notebook', '血壓血糖小本子', 'senior', '記血壓血糖、看趨勢，整理給醫師看', '血壓 血糖 健康紀錄 看醫生'],
  ['family-memoir', '家庭回憶錄', 'senior', '每天問長輩一題，把回憶排成一本書', '回憶錄 長輩故事 家族 傳記'],
  ['seated-exercise-cam', '坐姿健康操', 'senior', '坐著跟示範做 7 個動作，鏡頭幫你數次數，也能跟著語音節拍做', '健康操 做操 運動 動一動 坐著 久坐 伸展 長輩運動 帶操'],
  ['nostalgia-memory-game', '懷舊回憶遊戲', 'senior', '柑仔店戳戳樂：猜老東西、老照片、老歌，適合樂齡團體', '懷舊 樂齡活動 長輩遊戲'],
  // 生活小工具
  ['food-finder', '巷口美食通', 'life', '台北新北找吃的，依條件推薦', '吃什麼 美食 餐廳 午餐'],
  ['group-dining-decider', '聚餐決定器', 'life', '大家住不同地方，找公平的集合點和聚餐類型', '聚餐 約吃飯 集合點'],
  ['fridge-recipe-notes', '冰箱便利貼食譜', 'life', '輸入冰箱裡的材料，找家常菜和飲料做法', '食譜 冰箱 煮什麼 料理'],
  ['food-calorie-tracker', '卡卡日記（拍照卡路里）', 'life', '拍照讓 AI 估卡路里，記錄飲食', '卡路里 減肥 飲食紀錄 熱量'],
  ['expense-tracker-pwa', '隨手記帳', 'life', '手機隨手記帳、看分類報表', '記帳 花費 開銷'],
  // 地圖與休閒
  ['taiwan-temple-festival-calendar', '台灣廟會節慶月曆', 'map', '拖動日期看哪裡有遶境、蜂炮、天燈、中元祭', '廟會 節慶 遶境 媽祖 農曆 蜂炮 天燈'],
  ['taiwan-flower-map', '台灣賞花地圖', 'map', '全年哪裡有什麼花開', '賞花 花季 櫻花 油桐'],
  ['taiwan-camping-map', '台灣露營地圖', 'map', '各營地每個月適不適合露營、要帶什麼', '露營 營地'],
  ['taiwan-trail-map', '台灣自然步道地圖', 'map', '各步道每個月好不好走、季節亮點', '步道 爬山 健行 登山'],
  ['taiwan-stargazing-map', '台灣觀星地圖', 'map', '月相、暗夜時段與觀星點指數', '觀星 星空 銀河 流星雨'],
  ['taiwan-bird-atlas', '台灣賞鳥地圖', 'map', '各熱點每個月看得到哪些鳥', '賞鳥 鳥類'],
  ['taiwan-fish-atlas', '台灣漁港魚汛圖鑑', 'map', '各漁港每個月的當季魚與食譜', '漁港 當季魚 海鮮'],
  ['japan-sakura-season', '日本櫻花季地圖', 'map', '櫻前線北上，各名所開花滿開時間', '日本 櫻花 旅遊'],
  ['startup-island', '創業島', 'map', '把創業相關的工具放進一座島，照創業順序逛', '創業工具 地圖 入口'],
  ['creator-town', '創作者小鎮', 'map', '把內容創作工具放進一座港邊小鎮，照創作順序逛', '內容創作 工具 地圖 入口'],
  // 遊戲與體感
  ['slice-fruit-cam', '體感切水果', 'game', '對著攝影機揮手切水果', '體感 攝影機 遊戲 運動'],
  ['ball-throw-cam', '體感丟球大作戰', 'game', '對著攝影機甩手丟球', '體感 丟球 遊戲'],
  ['whack-a-mole-cam', '體感打地鼠', 'game', '對著攝影機往下敲打地鼠', '體感 打地鼠 遊戲'],
  ['jetski-cam', '體感水上摩托車', 'game', '雙手當把手騎 3D 水上摩托車', '體感 賽車 遊戲'],
  ['voice-control-game', '聲控大冒險', 'game', '用音量、音高、拍手玩遊戲', '聲控 麥克風 遊戲 唱歌'],
  ['Rummikub', '拉密 Rummikub', 'game', '線上拉密牌桌遊', '拉密 桌遊 牌'],
];
var TOOLS = T.map(function(a){ return {id:a[0], n:a[1], c:a[2], d:a[3], k:a[4].split(' '), lic:!!a[5], url:BASE + a[0] + '/'}; });
var toolById = {}; TOOLS.forEach(function(t){ toolById[t.id] = t; });

/* 一般 AI 工具（只寫適合做什麼；功能與方案以官方為準） */
var GEN = [
  {id:'chatgpt', n:'ChatGPT', url:'https://chatgpt.com/', d:'對話式 AI：寫文案、整理資料、腦力激盪、看圖說明', k:'寫作 文案 對話 整理 翻譯'},
  {id:'claude', n:'Claude', url:'https://claude.ai/', d:'擅長長文件閱讀、寫作與程式；可以一次讀很多資料', k:'長文 文件 寫作 程式'},
  {id:'gemini', n:'Gemini', url:'https://gemini.google.com/', d:'Google 的 AI 助理，和 Google 文件、試算表、Gmail 搭配方便', k:'google 文件 搜尋 試算表'},
  {id:'notebooklm', n:'NotebookLM', url:'https://notebooklm.google.com/', d:'上傳講義、PDF、網址，整理重點、做摘要、做語音導讀與簡報', k:'講義 摘要 讀書 簡報 筆記'},
  {id:'perplexity', n:'Perplexity', url:'https://www.perplexity.ai/', d:'會附上來源連結的 AI 搜尋，適合查資料、找出處', k:'查資料 搜尋 來源 研究'},
  {id:'canva', n:'Canva', url:'https://www.canva.com/', d:'套版設計海報、社群圖、簡報，也有 AI 生圖與排版功能', k:'海報 設計 社群圖 簡報 排版'},
  {id:'capcut', n:'CapCut', url:'https://www.capcut.com/', d:'剪短影片、自動字幕、加特效與音樂', k:'剪輯 短影片 字幕 reels'},
  {id:'suno', n:'Suno', url:'https://suno.com/', d:'用文字描述產生歌曲與配樂', k:'音樂 歌曲 配樂'},
  {id:'gamma', n:'Gamma', url:'https://gamma.app/', d:'輸入大綱自動排出簡報或網頁', k:'簡報 投影片 提案'},
  {id:'copilot', n:'Microsoft Copilot', url:'https://copilot.microsoft.com/', d:'微軟的 AI 助理，和 Word、Excel、PowerPoint 搭配', k:'word excel powerpoint office'}
];
var genById = {}; GEN.forEach(function(g){ genById[g.id] = g; });

/* 情境：我想…（步驟＝建議使用順序；tools 是工作區工具 id，ai 是一般 AI 工具 id） */
var GOALS = [
  {id:'loan', ic:'🏦', t:'申請創業貸款', kw:'貸款 鳳凰 借錢 創業貸款 青創 資金 融資 銀行 申請書 週轉',
   steps:[['先確認自己符不符合資格', ['loan-eligibility-checker']], ['把開店手續與開辦預算算清楚', ['shop-opening-checklist', 'restaurant-feasibility-calculator']], ['寫申請書與營運計畫', ['phoenix-loan-generator'], ['chatgpt']], ['用銀行的角度自我檢查財務', ['credit-5c-risk-diagnosis']]],
   tip:'貸款條件與利率以主管機關與銀行公告為準；營運計畫的數字要自己算過，不要直接用 AI 編的數字。',
   p:'我要申請台灣的微型創業鳳凰貸款，開的是【店型／產業】，在【縣市】，預計開辦費【金額】。請幫我列出營運計畫書要寫的段落，每段提醒我需要準備哪些真實數字，不要幫我編數字。'},
  {id:'shop', ic:'🏪', t:'開一家店', kw:'開店 開業 店面 開幕 營業登記 稅籍 開餐廳 開咖啡店 手搖 小吃 擺攤 選址 店址 開在哪',
   steps:[['先在遊戲裡模擬開一次店', ['my-first-shop-sim']], ['挑地點：比區域、街區，再比候選店面', ['shop-site-selector']], ['取店名，先篩商標與撞名', ['brand-name-checker']], ['試算能不能賺錢', ['restaurant-feasibility-calculator', 'restaurant-menu-mix-calculator']], ['算請人要花多少', ['employer-payroll-cost-calculator', 'staff-shift-planner']], ['排出登記到開幕的清單', ['shop-opening-checklist']], ['需要資金就看貸款', ['loan-eligibility-checker', 'phoenix-loan-generator']]],
   tip:'法規門檻（稅籍、勞健保、食安）以開店前置清單的規則與主管機關公告為準。',
   p:'我想在【縣市】開一家【店型】，預算【金額】。請用條列幫我想：主要客群、每月固定成本有哪些、開幕前三個月要做的行銷。不確定的數字請標示【請查證】。'},
  {id:'cost', ic:'🧮', t:'算成本、毛利、損益兩平', kw:'成本 毛利 損益 損益兩平 利潤 定價 賺不賺 試算 打平 售價',
   steps:[['餐飲店整體損益', ['restaurant-feasibility-calculator']], ['菜單每道菜的毛利', ['restaurant-menu-mix-calculator']], ['電商商品的成本與利潤', ['amazon-cost-calculator', 'amazon-listing-mix-calculator']], ['人事成本', ['employer-payroll-cost-calculator']], ['飯店、民宿淡旺季損益', ['tourism-hotel-feasibility-calculator']]],
   tip:'試算工具的數字都可以改，請用自己的真實報價。'},
  {id:'payroll', ic:'👥', t:'算請人的成本、員工薪水', kw:'請人 員工 薪水 勞健保 勞退 人事 加班 年終 雇主 工讀',
   steps:[['算出每位員工的真實人事成本', ['employer-payroll-cost-calculator']], ['排一週的班，檢查工時與加班', ['staff-shift-planner']], ['放回整體損益看養不養得起', ['restaurant-feasibility-calculator']]],
   tip:'費率每年會調整，工具內可以改費率；正式計算請以勞保局、健保署公告為準。'},
  {id:'bank', ic:'📑', t:'看懂財報、評估借款風險', kw:'財報 比率 授信 信用 5c 負債 現金流 dscr 財務健檢',
   steps:[['用銀行放款的角度做財務診斷', ['credit-5c-risk-diagnosis']], ['商業模式的財務健檢', ['business-model-pattern-studio']]]},
  {id:'subsidy', ic:'🎓', t:'申請員工訓練補助、辦訓發證書', kw:'訓練補助 人才投資 開課 員工訓練 產投 結訓證書 研習證明 發證書 辦訓 招生 招生海報 簽到 出席時數',
   steps:[['寫開課申請書附表二', ['industry-talent-generator']], ['做招生海報與社群圖', ['course-poster-maker']], ['寄招生電子報給舊學員', ['edm-template-maker']], ['各管道發專屬報名連結、追蹤報名成效', ['enrollment-source-tracker']], ['每堂掃碼簽到、算出席時數', ['attendance-qr']], ['結訓時批次印證書與核發清冊', ['training-certificate-generator']]], tip:'申請規定以勞動部勞動力發展署當年公告為準。'},
  {id:'idea', ic:'💡', t:'想創業點子、發想主題', kw:'點子 創意 發想 想法 做什麼 腦力激盪 主題 靈感 企劃',
   steps:[['先大量產生點子', ['business-idea-generator', 'mandala-thinking'], ['chatgpt']], ['換角度改良', ['scamper-thinking-generator', 'innovation-matrix-studio']], ['多方檢查', ['six-thinking-hats-generator', 'mentors-panel']]],
   p:'我對【領域／興趣】有興趣，手上有【資源或技能】。請用曼陀羅九宮格幫我發想 8 個可以做的方向，每個方向再寫一句可以怎麼賺錢。'},
  {id:'model', ic:'🧭', t:'整理商業模式與策略', kw:'商業模式 策略 定位 bmc 九宮格 獲利 swot 五力 競爭',
   steps:[['畫出商業模式圖', ['business-model-canvas-generator']], ['找適合的商業模式組合', ['business-model-pattern-studio']], ['想清楚市場、產品、做法', ['where-what-how-strategy-studio']], ['練習 SWOT 分析', ['swot-game']], ['把策略寫成一頁 OGSM 並追蹤', ['ogsm-strategy-planner']], ['請不同人物給意見', ['mentors-panel']]]},
  {id:'newprod', ic:'🧪', t:'開發新產品', kw:'新產品 新品 產品開發 改良 痛點 評論 概念 定價 競品',
   steps:[['從評論與客戶回饋找痛點', ['new-product-dev-system']], ['五層次、定價與競品', ['new-product-strategy-studio', 'ecommerce-competitor-analyzer']], ['用 SCAMPER 改良', ['scamper-thinking-generator']], ['幫新品取名，先篩商標', ['brand-name-checker']]]},
  {id:'ecom', ic:'📦', t:'跨境電商上架（Amazon）', kw:'跨境 電商 amazon 亞馬遜 上架 listing 標題 五點 關鍵字 fba 賣到國外 ppc',
   steps:[['先用故事地圖與物流遊戲了解全貌', ['animal-ecommerce-adventure', 'amazon-logistics-game']], ['找關鍵字', ['product-keyword-cloud']], ['寫標題與五點說明', ['product-title-generator', 'amazon-listing-generator']], ['看競品與定價', ['ecommerce-competitor-analyzer', 'amazon-cost-calculator']], ['開廣告、回評論', ['amazon-ppc-advisor', 'amazon-review-reply-generator']], ['整體健檢', ['ecommerce-health-dashboard']]],
   tip:'跨境電商工具多數需要課程序號，請向授課講師索取。'},
  {id:'competitor', ic:'🔍', t:'分析競爭對手', kw:'競品 競爭對手 比價 對手 市場調查 流量',
   steps:[['商品競品分析', ['ecommerce-competitor-analyzer']], ['網站流量比較', ['traffic-rank-estimator']], ['查公開資料', [], ['perplexity']]]},
  {id:'customer', ic:'❤️', t:'經營會員與顧客分析', kw:'會員 顧客 rfm 回購 私域 crm 滿意度 問卷 客戶 電子報 edm email 點數 集點 集點卡 會員卡 紅利',
   steps:[['設計會員點數，先算回饋成本', ['member-points-designer']], ['會員分群與私域流量', ['private-domain-rfm-studio']],['問卷滿意度分析', ['IPA_Kano']], ['寄會員電子報', ['edm-template-maker']], ['回覆客訴與評論', ['amazon-review-reply-generator']]]},
  {id:'social', ic:'📣', t:'經營社群、寫貼文', kw:'社群 貼文 臉書 fb ig instagram threads 小編 粉專 發文 文案 行銷',
   steps:[['規劃方向與平台', ['coffee-ig-planner']], ['排全年檔期', ['annual-marketing-calendar', 'taiwan-temple-festival-calendar']], ['寫貼文', ['SocialPost'], ['chatgpt']], ['發文前健診', ['social-post-grader']], ['配圖', ['ai-image-prompt-studio'], ['canva']]],
   p:'我經營【品牌／粉專】，目標客群是【客群】，這週想推【主題】。請寫 3 篇不同語氣的 Instagram 貼文，每篇 150 字內，附 5 個 hashtag。'},
  {id:'calendar', ic:'📅', t:'排行銷檔期、找節慶題材', kw:'檔期 行事曆 節日 節慶 活動 檔期規劃 母親節 中秋 廟會',
   steps:[['全年行銷行事曆', ['annual-marketing-calendar']], ['廟會與民俗節慶日期', ['taiwan-temple-festival-calendar']], ['寫成貼文', ['SocialPost']]]},
  {id:'video', ic:'🎬', t:'做短影片', kw:'影片 短影片 reels 抖音 youtube 拍片 腳本 分鏡 影音 宣傳片',
   steps:[['先定好規格與分鏡', ['ai-video-spec-generator']], ['產生 AI 影片提示詞', ['ai-video-prompt-studio']], ['旁白配音', ['ai-voice-generator-play']], ['合成與剪輯', ['ai-video-studio-play', 'video-editor'], ['capcut']], ['加背景音', ['ambient-sound-mixer']]],
   p:'我要拍一支 30 秒的【產品／主題】短影片，觀眾是【客群】。請寫分鏡腳本：每個鏡頭的畫面、旁白、字幕與秒數，開頭 3 秒要有吸睛的鉤子。'},
  {id:'voice', ic:'🎙', t:'配音、旁白、語音轉文字', kw:'配音 旁白 語音 朗讀 tts 聲音 逐字稿 語音轉文字',
   steps:[['文字轉語音或語音轉文字', ['ai-voice-generator-play']], ['整理逐字稿', ['text-organizer-studio']]]},
  {id:'music', ic:'🎵', t:'做音樂、背景音、品牌音', kw:'音樂 歌 配樂 背景音 白噪音 jingle 聲音logo 品牌音 音效 suno',
   steps:[['品牌招牌聲音', ['sonic-logo-studio']], ['AI 歌曲提示詞', ['ai-music-prompt-studio'], ['suno']], ['環境背景音', ['ambient-sound-mixer']]]},
  {id:'image', ic:'🎨', t:'做圖、海報、商品圖', kw:'圖片 海報 商品圖 生圖 繪圖 插圖 封面 設計 midjourney',
   steps:[['產生 AI 繪圖提示詞', ['ai-image-prompt-studio'], ['chatgpt', 'gemini']], ['套版排版', [], ['canva']]],
   p:'請幫我寫一段生圖提示詞：【商品】放在【場景】，【風格】，光線【描述】，畫面比例 1:1，不要出現文字。'},
  {id:'comic', ic:'🗯', t:'做漫畫、繪本、四格', kw:'漫畫 四格 繪本 分鏡 故事',
   steps:[['文字變成漫畫分鏡與提示詞', ['comic-prompt-studio']]]},
  {id:'sticker', ic:'😺', t:'做 LINE 貼圖', kw:'line 貼圖 sticker 表情',
   steps:[['產生貼圖並自動切格、符合規格', ['line-sticker-studio']]]},
  {id:'slides', ic:'📽', t:'做簡報', kw:'簡報 投影片 ppt powerpoint 提案 notebooklm',
   steps:[['先整理內容', ['text-organizer-studio'], ['notebooklm']], ['決定簡報風格', ['slide-style-yaml-studio']], ['自動排版', [], ['gamma', 'canva']]]},
  {id:'organize', ic:'🗂', t:'整理文件、會議紀錄、讀資料', kw:'整理 會議記錄 逐字稿 草稿 摘要 讀 pdf 講義 文件 報告',
   steps:[['把草稿整理成文件', ['text-organizer-studio']], ['讀大量資料、做摘要', [], ['notebooklm', 'claude']]]},
  {id:'prompt', ic:'🧩', t:'學寫提示詞', kw:'提示詞 prompt 怎麼問 ai crispe co-star 框架',
   steps:[['用框架組提示詞', ['prompt-console', 'ai-prompt-generator']], ['用遊戲練習', ['crispe-game', 'costar-game']]]},
  {id:'skill', ic:'🤖', t:'做自己的 AI 助理（GPTs／Gem／技能）', kw:'gpts gem 自訂 技能 skill 助理 機器人 系統提示詞 反推',
   steps:[['把需求寫成技能或自訂 GPT', ['skill-prompt-studio'], ['chatgpt', 'gemini', 'claude']]]},
  {id:'teach', ic:'🏫', t:'上課互動', kw:'上課 教學 學生 課堂 點名 分組 搶答 投票 測驗 互動 講師 老師 互評 互相評分 上台報告',
   steps:[['掃碼簽到', ['attendance-qr']], ['講台上掌握每段時間', ['lecture-teleprompter']], ['暖身：抽籤分組、搶答投票', ['teacher-classroom-helper']], ['讓學生匿名提問', ['classroom-qa-wall']], ['分組活動', ['classroom-auction-game', 'printable-game-maker']], ['上台報告互評', ['peer-review-board']], ['課後查作業與成績', ['practice-submission-lookup', 'exam-score-lookup']]]},
  {id:'teachgame', ic:'🎲', t:'做教具、課堂遊戲', kw:'教具 桌遊 遊戲化 卡牌 賓果 活動設計',
   steps:[['把題材變成紙上桌遊', ['printable-game-maker']], ['全班手機遊戲', ['classroom-auction-game']], ['模擬經營遊戲', ['my-first-shop-sim', 'social-editor-sim']]]},
  {id:'trainer', ic:'🎤', t:'當講師接案、整理簡介與課程型錄', kw:'講師 接案 邀課 講師簡介 自我介紹 課程型錄 講師資料表 主持稿 業師 顧問 經歷',
   steps:[['整理講師簡介、資料表與課程型錄', ['instructor-profile-catalog']], ['開課時做招生海報', ['course-poster-maker']], ['排課與現場時間控制', ['lecture-teleprompter']], ['上課互動與簽到', ['teacher-classroom-helper', 'attendance-qr']], ['結訓發證書', ['training-certificate-generator']]],
   tip:'經歷、證照與授課時數請照實填寫；寄給邀課單位前再核對一次。'},
  {id:'learn', ic:'📚', t:'自學、讀書', kw:'讀書 自學 學習 考試 複習 講義',
   steps:[['把講義丟進去做摘要與問答', [], ['notebooklm']], ['背景音專心讀書', ['ambient-sound-mixer']]]},
  {id:'digital', ic:'⚙', t:'用數位工具提升效率', kw:'效率 省時間 數位轉型 自動化 流程 工作',
   steps:[['盤點自己的工作', ['personal-digital-workplace-analyzer']], ['盤點公司流程', ['company-digital-transformation-analyzer']]]},
  {id:'senior', ic:'👵', t:'幫長輩、照顧家人', kw:'長輩 老人 爸媽 阿公 阿嬤 樂齡 銀髮 獨居 照顧 電話簿 打電話',
   steps:[['教長輩用手機與 AI', ['ai-senior-learning-coach']], ['點照片就能打給家人', ['big-dial-phonebook']], ['防詐騙', ['scam-message-checker']], ['出門坐公車', ['next-bus-helper']], ['每天報平安', ['im-fine-checkin']], ['陪長輩坐著動一動', ['seated-exercise-cam']], ['記血壓血糖', ['bp-glucose-notebook']], ['留下回憶', ['family-memoir', 'nostalgia-memory-game']]]},
  {id:'exercise', ic:'🤸', t:'動一動、做健康操', kw:'運動 健康操 做操 伸展 動一動 久坐 坐太久 活動筋骨 帶操 早操',
   steps:[['坐在椅子上跟著做操，鏡頭幫你數', ['seated-exercise-cam']], ['想動得更起勁，玩體感遊戲', ['slice-fruit-cam', 'whack-a-mole-cam', 'voice-control-game']]],
   tip:'坐姿健康操是活動身體的小幫手，不是醫療或復健工具；有慢性病或關節問題請先問醫師。'},
  {id:'scam', ic:'🚦', t:'判斷是不是詐騙', kw:'詐騙 可疑 簡訊 假冒 165 中獎 投資群組',
   steps:[['貼上訊息看紅綠燈', ['scam-message-checker']]], tip:'有疑慮就撥 165 反詐騙專線。'},
  {id:'food', ic:'🍱', t:'吃什麼、煮什麼、記熱量', kw:'吃什麼 午餐 晚餐 聚餐 食譜 煮 冰箱 熱量 卡路里 減肥',
   steps:[['找吃的', ['food-finder', 'group-dining-decider']], ['用冰箱材料煮', ['fridge-recipe-notes']], ['記熱量', ['food-calorie-tracker']]]},
  {id:'money', ic:'💳', t:'記帳', kw:'記帳 花費 開銷 存錢',
   steps:[['隨手記帳', ['expense-tracker-pwa']]]},
  {id:'trip', ic:'🧳', t:'安排出遊', kw:'出遊 旅遊 爬山 露營 賞花 觀星 賞鳥 週末 去哪玩 櫻花 廟會 漁港 海鮮',
   steps:[['看季節去哪裡', ['taiwan-flower-map', 'taiwan-trail-map', 'taiwan-camping-map', 'taiwan-stargazing-map', 'taiwan-bird-atlas', 'taiwan-temple-festival-calendar']], ['漁港當季魚', ['taiwan-fish-atlas']], ['日本賞櫻', ['japan-sakura-season']]]},
  {id:'play', ic:'🎮', t:'玩遊戲、動一動', kw:'遊戲 好玩 體感 運動 動一動 派對',
   steps:[['攝影機體感遊戲', ['slice-fruit-cam', 'whack-a-mole-cam', 'ball-throw-cam', 'jetski-cam']], ['聲控與桌遊', ['voice-control-game', 'Rummikub']]]},
  {id:'research', ic:'🌏', t:'查資料、看國際經濟', kw:'查資料 研究 資料來源 經濟 國家 gdp 出口 趨勢',
   steps:[['看各國經濟指標', ['world-economy-globe']], ['查資料附來源', [], ['perplexity', 'gemini']]]}
];
var goalById = {}; GOALS.forEach(function(g){ goalById[g.id] = g; g.kws = g.kw.toLowerCase().split(' '); });

/* ---------- 配對引擎 ---------- */
function norm(s){
  var t = String(s == null ? '' : s);
  try{ t = t.normalize('NFKC'); }catch(e){}
  return t.toLowerCase().replace(/[\s,，。、！？!?.:：;；「」『』()（）]+/g, ' ').trim();
}
// 中文沒有空格：用「關鍵字是否出現在句子裡」計分，長的關鍵字分數高
function kwScore(q, kws){
  var s = 0, hit = [];
  kws.forEach(function(k){ if(k && q.indexOf(k) >= 0){ s += 1 + Math.min(3, k.length) * .5; hit.push(k); } });
  return {s:s, hit:hit};
}
function bigrams(s){ var o = {}; s = s.replace(/\s+/g, ''); for(var i = 0; i < s.length - 1; i++) o[s.slice(i, i + 2)] = 1; return o; }
function match(query){
  var q = norm(query);
  if(!q) return {goals:[], tools:[], q:q};
  var qb = bigrams(q);
  var goals = GOALS.map(function(g){ var r = kwScore(q, g.kws); var tb = bigrams(norm(g.t)), ov = 0; Object.keys(tb).forEach(function(k){ if(qb[k]) ov++; }); return {g:g, s:r.s + ov * .6, hit:r.hit}; })
    .filter(function(x){ return x.s >= 1; }).sort(function(a, b){ return b.s - a.s; });
  var gtools = {};
  goals.slice(0, 2).forEach(function(x, gi){ x.g.steps.forEach(function(st){ (st[1] || []).forEach(function(id){ gtools[id] = Math.max(gtools[id] || 0, gi ? 1 : 2); }); }); });
  var tools = TOOLS.map(function(t){
    var r = kwScore(q, t.k.map(function(k){ return k.toLowerCase(); })), nb = bigrams(norm(t.n + t.d)), ov = 0;
    Object.keys(qb).forEach(function(k){ if(nb[k]) ov++; });
    return {t:t, s:r.s * 1.2 + ov * .25 + (gtools[t.id] || 0), hit:r.hit};
  }).filter(function(x){ return x.s >= 1.2; }).sort(function(a, b){ return b.s - a.s; });
  return {goals:goals, tools:tools, q:q};
}

/* 給 AI 的目錄（精簡） */
function catalogText(){
  return TOOLS.map(function(t){ return t.id + '｜' + t.n + '｜' + t.d + (t.lic ? '｜需序號' : ''); }).join('\n');
}
function genText(){ return GEN.map(function(g){ return g.id + '｜' + g.n + '｜' + g.d; }).join('\n'); }
// AI 回傳的 JSON 只留下目錄裡有的 id
function cleanAi(j){
  var out = {summary:'', steps:[]};
  if(!j || typeof j !== 'object') return out;
  out.summary = typeof j.summary === 'string' ? j.summary.slice(0, 300) : '';
  (Array.isArray(j.steps) ? j.steps : []).slice(0, 7).forEach(function(s){
    if(!s || typeof s !== 'object') return;
    var tools = (Array.isArray(s.tools) ? s.tools : []).filter(function(id){ return toolById[id]; }).slice(0, 4);
    var ai = (Array.isArray(s.ai) ? s.ai : []).filter(function(id){ return genById[id]; }).slice(0, 3);
    var t = typeof s.step === 'string' ? s.step.slice(0, 80) : '';
    if(t && (tools.length || ai.length)) out.steps.push({t:t, tools:tools, ai:ai, why:typeof s.why === 'string' ? s.why.slice(0, 120) : ''});
  });
  return out;
}
function aiPrompt(query){
  return '你是台灣課程講師的「AI 工具導航員」。使用者說他想做一件事，請從下面兩份清單挑出最適合的工具，排成 2～6 個步驟。\n' +
    '規則：1. 只能使用清單裡的 id，不可以自己發明工具。2. 優先用「工作區工具」，一般 AI 工具當補充。3. 繁體中文（台灣用語），每步一句話說明為什麼。4. 只輸出 JSON。\n' +
    '格式：{"summary":"一句話總結建議","steps":[{"step":"這一步要做什麼","tools":["工作區工具id"],"ai":["一般AI工具id"],"why":"為什麼用它"}]}\n\n' +
    '【工作區工具】（id｜名稱｜說明）\n' + catalogText() + '\n\n【一般 AI 工具】（id｜名稱｜擅長）\n' + genText() + '\n\n使用者想做的事：' + query;
}

var EXAMPLES = ['我想開一家手搖飲店', '幫我做一支產品介紹短影片', '我要申請鳳凰貸款', '想讓學生上課更踴躍發問', '要寫 IG 貼文但不知道寫什麼', '把會議錄音整理成紀錄', '我想把商品賣到美國 Amazon', '教爸媽分辨詐騙訊息', '做一份提案簡報', '週末想帶家人去走步道'];

var API = {BASE:BASE, CATS:CATS, TOOLS:TOOLS, toolById:toolById, GEN:GEN, genById:genById, GOALS:GOALS, goalById:goalById, EXAMPLES:EXAMPLES,
  norm:norm, match:match, aiPrompt:aiPrompt, cleanAi:cleanAi, catalogText:catalogText};
if(typeof module !== 'undefined' && module.exports) module.exports = API; else root.NAV = API;
})(typeof window !== 'undefined' ? window : globalThis);
