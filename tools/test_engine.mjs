// 引擎測試：node tools/test_engine.mjs
import { createRequire } from 'module';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const N = require(path.join(here, '..', 'data.js'));
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };

// 1. 目錄完整：id 不重複、分類存在、情境引用的工具都存在
const ids = new Set(); N.TOOLS.forEach(t => { ok(!ids.has(t.id), '重複 ' + t.id); ids.add(t.id); ok(N.CATS.some(c => c.id === t.c), '分類 ' + t.id); ok(t.d.length <= 50, '說明太長 ' + t.id); });
N.GOALS.forEach(g => g.steps.forEach(s => { (s[1] || []).forEach(id => ok(N.toolById[id], g.id + ' 引用不存在的工具 ' + id)); (s[2] || []).forEach(id => ok(N.genById[id], g.id + ' 引用不存在的 AI ' + id)); }));
// 每個工具至少出現在一個情境（才找得到）
const used = new Set(); N.GOALS.forEach(g => g.steps.forEach(s => (s[1] || []).forEach(id => used.add(id))));
const orphan = N.TOOLS.filter(t => !used.has(t.id) && !['startup-island', 'creator-town', 'ecommerce-health-dashboard'].includes(t.id)).map(t => t.id);
ok(orphan.length <= 6, '沒被情境用到的工具太多：' + orphan.join(','));
if (orphan.length) console.log('（只能用關鍵字找到的工具：' + orphan.join('、') + '）');
// 與線上清單一致（有工作區時比對 github-dashboard 的 REPO_META）
const gd = path.join(here, '..', '..', '..', '資料儀表板', 'github-dashboard', 'index.html');
if (existsSync(gd)) {
  const src = readFileSync(gd, 'utf8'), lic = src.slice(src.indexOf('LICENSED_REPOS'), src.indexOf(']);', src.indexOf('LICENSED_REPOS')));
  N.TOOLS.forEach(t => { const isLic = lic.includes("'" + t.id + "'"); if (t.id !== 'phoenix-loan-generator') ok(isLic === t.lic, '序號標記不一致 ' + t.id); });
}
// 2. 常見問法要命中正確情境與工具
const cases = [
  ['我想開一家手搖飲店', 'shop', 'shop-opening-checklist'], ['我要申請鳳凰貸款', 'loan', 'phoenix-loan-generator'], ['幫我做一支產品介紹短影片', 'video', 'ai-video-spec-generator'],
  ['想讓學生上課更踴躍發問', 'teach', 'classroom-qa-wall'], ['要寫 IG 貼文但不知道寫什麼', 'social', 'SocialPost'], ['把會議錄音整理成紀錄', 'organize', 'text-organizer-stu dio'.replace(' ', '')],
  ['我想把商品賣到美國 Amazon', 'ecom', 'product-title-generator'], ['教爸媽分辨詐騙訊息', 'scam', 'scam-message-checker'], ['做一份提案簡報', 'slides', 'slide-style-yaml-studio'],
  ['週末想帶家人去走步道', 'trip', 'taiwan-trail-map'], ['請一個員工一個月要花多少錢', 'payroll', 'employer-payroll-cost-calculator'], ['菜單怎麼定價才有賺', 'cost', 'restaurant-menu-mix-calculator'],
  ['幫我畫 LINE 貼圖', 'sticker', 'line-sticker-studio'], ['我想做一個自己的 GPTs', 'skill', 'skill-prompt-studio'], ['想知道對手賣多少錢', 'competitor', 'ecommerce-competitor-analyzer'],
  ['做品牌的音效', 'music', 'sonic-logo-studio'], ['今天晚餐煮什麼', 'food', 'fridge-recipe-notes'], ['學生上台報告要互相評分', 'teach', 'peer-review-board'],
  ['ChatGPT 怎麼問比較好', 'prompt', 'prompt-console'], ['媽祖遶境是哪幾天', null, 'taiwan-temple-festival-calendar'], ['我想幫產品拍漫畫廣告', 'comic', 'comic-prompt-studio']
];
cases.forEach(([q, g, t]) => {
  const r = N.match(q);
  if (g) ok(r.goals[0] && r.goals[0].g.id === g, q + ' → 情境 ' + (r.goals[0] ? r.goals[0].g.id : '無') + '（應為 ' + g + '）');
  const top = r.tools.slice(0, 8).map(x => x.t.id);
  ok(top.includes(t), q + ' → 前 8 個工具沒有 ' + t + '：' + top.join(','));
});
ok(N.match('').goals.length === 0 && N.match('   ').tools.length === 0, '空白不回傳');
ok(N.match('asdfqwer').goals.length === 0, '亂打不亂配');
// 3. AI 回傳清理
const c = N.cleanAi({summary:'x', steps:[{step:'寫貼文', tools:['SocialPost', 'fake-tool'], ai:['chatgpt', 'nope'], why:'因為'}, {step:'空的', tools:['nope']}, 'bad']});
ok(c.steps.length === 1 && c.steps[0].tools.join() === 'SocialPost' && c.steps[0].ai.join() === 'chatgpt', 'cleanAi 只留目錄內的 id');
ok(N.aiPrompt('開店').includes('shop-opening-checklist') && N.aiPrompt('開店').length < 12000, 'AI 提示詞含目錄且長度合理 ' + N.aiPrompt('開店').length);
console.log(`工具 ${N.TOOLS.length}、情境 ${N.GOALS.length}、一般 AI ${N.GEN.length}；通過 ${pass}，失敗 ${fail}`);
process.exit(fail ? 1 : 0);
