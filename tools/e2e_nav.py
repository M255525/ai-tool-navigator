# 端對端：python tools/e2e_nav.py <截圖資料夾>（需先開 http://127.0.0.1:8887；NAV_BASE 可測線上版）
import sys, io, os, json
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', line_buffering=True)
from playwright.sync_api import sync_playwright
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
BASE = os.environ.get('NAV_BASE', 'http://127.0.0.1:8887/')
errs, fails, outbound = [], [], []
def check(c, msg):
    print(('ok   ' if c else 'FAIL ') + msg)
    if not c: fails.append(msg)
def stub(pg, tag):
    pg.route('**/script.google.com/**', lambda r: r.fulfill(status=200, body='{"marquee":["測試公告：跑馬燈正常"]}', headers={'content-type': 'application/json'}))
    pg.route('**/visitor-badge.laobi.icu/**', lambda r: r.fulfill(status=200, body='', headers={'content-type': 'image/svg+xml'}))
    # 假的 AI 服務：回傳一段含假工具 id 的 JSON，確認只留下目錄內的
    def fake(route):
        outbound.append(route.request.url)
        txt = json.dumps({'summary': '先規劃再拍片', 'steps': [{'step': '定規格', 'tools': ['ai-video-spec-generator', 'not-a-tool'], 'ai': ['capcut'], 'why': '先排分鏡'}, {'step': '配音', 'tools': ['ai-voice-generator-play'], 'ai': [], 'why': '旁白'}]}, ensure_ascii=False)
        route.fulfill(status=200, body=json.dumps({'candidates': [{'content': {'parts': [{'text': txt}]}}]}), headers={'content-type': 'application/json'})
    pg.route('**/generativelanguage.googleapis.com/**', fake)
    pg.on('pageerror', lambda e: errs.append(tag + ': ' + str(e)))
    pg.on('console', lambda m: m.type == 'error' and 'Failed to load resource' not in m.text and errs.append(tag + ': ' + m.text))
    pg.on('request', lambda r: (('openai' in r.url or 'anthropic' in r.url) and outbound.append(r.url)))
with sync_playwright() as p:
    b = p.chromium.launch(); ctx = b.new_context(viewport={'width': 1366, 'height': 900}, permissions=['clipboard-read', 'clipboard-write'])
    t = ctx.new_page(); stub(t, 'D')
    t.goto(BASE, wait_until='domcontentloaded'); t.wait_for_timeout(800)
    check(t.is_visible('#modal.show'), '首訪跳出警語'); t.click('#modal .btn'); t.screenshot(path=os.path.join(OUT, '01_home.png'), full_page=True)
    t.fill('#qIn', '我想開一家手搖飲店'); t.keyboard.press('Enter'); t.wait_for_timeout(400)
    txt = t.inner_text('#result')
    check('開一家店' in txt and '開店前置清單' in txt, '手搖飲 → 開店路線')
    check(t.locator('#result .stop').count() >= 4, '路線有 4 站以上')
    check(len(outbound) == 0, '規則比對沒有送出任何外部請求')
    check('#q=' in t.url, '網址帶問題')
    t.screenshot(path=os.path.join(OUT, '02_shop.png'), full_page=True)
    # 換情境
    if t.locator('.gtabs button').count() > 1:
        t.locator('.gtabs button').nth(1).click(); t.wait_for_timeout(200)
        check(t.locator('.gtabs button[aria-pressed=true]').count() == 1, '切換到第二個情境')
    t.click('[data-ex="幫我做一支產品介紹短影片"]'); t.wait_for_timeout(300)
    check('做短影片' in t.inner_text('#result') and 'AI 影片規格產生器' in t.inner_text('#result'), '範例：短影片')
    check(t.locator('#result .lic').count() >= 1, '需序號工具有標示')
    t.click('[data-act=copyTpl]'); t.wait_for_timeout(200)
    check('分鏡腳本' in t.evaluate('navigator.clipboard.readText()'), '複製情境提示詞')
    t.click('[data-act=copyPrompt]'); t.wait_for_timeout(200)
    clip = t.evaluate('navigator.clipboard.readText()')
    check('ai-video-spec-generator' in clip and '只輸出 JSON' in clip, '複製給 AI 的完整提示詞（含工具清單）')
    # AI（沒金鑰 → 開設定）
    t.click('[data-act=ai]'); t.wait_for_timeout(300)
    check(t.is_visible('#aiK'), '沒金鑰時按 AI 會打開 AI 設定')
    t.fill('#aiK', 'test-key-123'); t.click('[data-act=saveAi]'); t.wait_for_timeout(200); t.keyboard.press('Escape')
    t.click('[data-act=ai]'); t.wait_for_timeout(1500)
    rt = t.inner_text('#result')
    check('AI 建議的路線' in rt and '先規劃再拍片' in rt and 'not-a-tool' not in rt, 'AI 路線顯示，假工具被濾掉')
    check(any('generativelanguage' in u for u in outbound), '有金鑰時才送到 AI 服務')
    t.screenshot(path=os.path.join(OUT, '03_ai.png'), full_page=True)
    # 瀏覽
    t.click('[data-tab=tools]'); t.wait_for_timeout(200)
    check(t.locator('#toolLines .tc').count() == 97, '全部工具 97 個')
    t.fill('#fIn', '貸款'); t.wait_for_timeout(200)
    n = t.locator('#toolLines .tc').count(); check(0 < n < 10, '篩選「貸款」%d 個' % n)
    t.click('[data-tab=goals]'); t.click('.goals [data-goal=teach]'); t.wait_for_timeout(300)
    check('上課互動' in t.inner_text('#result') and '課堂提問牆' in t.inner_text('#result'), '從情境目錄點「上課互動」')
    t.click('[data-tab=gen]'); t.wait_for_timeout(200); check(t.locator('.tc').count() >= 10, '常用 AI 服務清單')
    # 亂打
    t.fill('#qIn', 'zzzxxqq'); t.click('[data-act=ask]'); t.wait_for_timeout(200)
    check('沒有找到很接近的情境' in t.inner_text('#result'), '找不到時給提示')
    # 分享網址還原
    t.goto(BASE + '#q=' + '我要申請鳳凰貸款', wait_until='domcontentloaded'); t.wait_for_timeout(500)
    check('申請創業貸款' in t.inner_text('#result'), '網址還原問題')
    m = ctx.new_page(); stub(m, 'M'); m.set_viewport_size({'width': 375, 'height': 760})
    m.goto(BASE + '#q=做一份提案簡報', wait_until='domcontentloaded'); m.wait_for_timeout(600)
    check(m.evaluate('document.documentElement.scrollWidth <= innerWidth'), '375px 無橫向捲動')
    m.screenshot(path=os.path.join(OUT, '04_mobile.png'), full_page=True)
    print('console 錯誤：', errs[:6]); check(not errs, '沒有 console 錯誤')
    b.close()
print('\n失敗 %d 項' % len(fails) + ('：' + '；'.join(fails) if fails else ''))
sys.exit(1 if fails else 0)
