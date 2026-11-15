/* AI 工具導航：畫面 */
(function(){
'use strict';
var N = window.NAV, $ = function(id){ return document.getElementById(id); };
var PFX = 'nav.';
var BADGE = 'https://visitor-badge.laobi.icu/badge?page_id=m255525.aitoolnavigator';
function lsGet(k){ try{ return localStorage.getItem(PFX + k); }catch(e){ return null; } }
function lsSet(k, v){ try{ localStorage.setItem(PFX + k, v); }catch(e){} }
function lsJson(k, d){ try{ var v = JSON.parse(lsGet(k)); return v == null ? d : v; }catch(e){ return d; } }
function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]; }); }
var standalone = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone;
function openModal(h){ $('modalBox').innerHTML = h; $('modal').classList.add('show'); }
function closeModal(){ $('modal').classList.remove('show'); }
var toastT;
function toast(s){ var t = document.querySelector('.toast'); if(!t){ t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); } t.textContent = s; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(function(){ t.hidden = true; }, 2800); }
function copyText(s, ok){ var done = function(){ toast(ok || '已複製'); }; if(navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(s).then(done, function(){ fb(); done(); }); else { fb(); done(); } function fb(){ var t = document.createElement('textarea'); t.value = s; document.body.appendChild(t); t.select(); try{ document.execCommand('copy'); }catch(e){} t.remove(); } }
function catOf(id){ return N.CATS.filter(function(c){ return c.id === id; })[0]; }
function col(cat){ return 'var(--c-' + cat + ')'; }

/* ---------- 狀態 ---------- */
var V = {q:'', res:null, goal:null, ai:null, aiMsg:'', aiErr:false, tab:'goals', filter:'', cat:''};
(function(){ var h = new URLSearchParams(location.hash.slice(1)); if(h.get('q')){ V.q = h.get('q').slice(0, 120); } if(N.goalById[h.get('g')]) V.goal = h.get('g'); })();
function setHash(){ try{ history.replaceState(null, '', location.pathname + (V.q || V.goal ? '#' + (V.q ? 'q=' + encodeURIComponent(V.q) : '') + (V.goal ? (V.q ? '&' : '') + 'g=' + V.goal : '') : '')); }catch(e){} }

/* ---------- AI（自備金鑰；只存在這台瀏覽器） ---------- */
function geminiModelFix(m){ var r = {'gemini-2.5-flash':'gemini-3.6-flash', 'gemini-2.5-flash-lite':'gemini-3.5-flash-lite', 'gemini-2.5-pro':'gemini-3.8-flash', 'gemini-2.0-flash':'gemini-3.6-flash', 'gemini-1.5-flash':'gemini-3.6-flash', 'gemini-1.5-pro':'gemini-3.1-pro-preview', 'gemini-3-pro':'gemini-3.1-pro-preview', 'gemini-3-pro-preview':'gemini-3.1-pro-preview', 'gemini-3.5-pro':'gemini-3.1-pro-preview'}; m = String(m || '').trim().replace(/^models\//, ''); return r[m] || m; }
var PROVIDERS = {
  gemini: {label:'Gemini（Google AI Studio）', models:[['gemini-3.5-flash', 'Gemini 3.5 Flash（推薦）'], ['gemini-3.1-pro-preview', 'Gemini 3.1 Pro 預覽版'], ['gemini-3.5-flash-lite', 'Gemini 3.5 Flash-Lite（省錢）']]},
  openai: {label:'OpenAI', url:'https://api.openai.com/v1/chat/completions', models:[['gpt-5-mini', 'GPT-5 mini（推薦）'], ['gpt-5', 'GPT-5'], ['gpt-4o-mini', 'GPT-4o mini（省錢）']]},
  claude: {label:'Claude（Anthropic）', models:[['claude-sonnet-5-5', 'Claude Sonnet 5.5（推薦）'], ['claude-opus-5-5', 'Claude Opus 5.5'], ['claude-haiku-5-5', 'Claude Haiku 5.5（省錢）']]},
  openrouter: {label:'OpenRouter', url:'https://openrouter.ai/api/v1/chat/completions', models:[['openai/gpt-4o-mini', 'OpenAI GPT-4o mini'], ['google/gemini-2.5-flash', 'Google Gemini 2.5 Flash'], ['anthropic/claude-sonnet-4.5', 'Claude Sonnet 4.5']]},
  xai: {label:'xAI Grok', url:'https://api.x.ai/v1/chat/completions', models:[['grok-4', 'Grok 4'], ['grok-3-mini', 'Grok 3 mini']]},
  deepseek: {label:'DeepSeek', url:'https://api.deepseek.com/chat/completions', models:[['deepseek-chat', 'DeepSeek Chat']]},
  custom: {label:'自訂（OpenAI 相容端點，例如 Ollama）', models:[]}
};
function aiCfg(){ var c = lsJson('ai', {}); if(!PROVIDERS[c.provider]) c.provider = 'gemini'; return c; }
function aiModel(c){ c = c || aiCfg(); return (c.modelCustom || '').trim() || c.model || ((PROVIDERS[c.provider].models[0]) || [''])[0]; }
function aiReady(){ var c = aiCfg(); return c.provider === 'custom' ? !!(c.base || '').trim() && !!aiModel(c) : !!c.key; }
async function callLLM(prompt){
  var c = aiCfg(), p = c.provider, model = aiModel(c), url, headers, body, extract;
  if(p === 'claude'){
    url = 'https://api.anthropic.com/v1/messages';
    headers = {'content-type':'application/json', 'x-api-key':c.key, 'anthropic-version':'2023-06-01', 'anthropic-dangerous-direct-browser-access':'true'};
    body = {model:model, max_tokens:2500, messages:[{role:'user', content:prompt}]};
    extract = function(d){ return (d.content || []).filter(function(b){ return b.type === 'text'; }).map(function(b){ return b.text; }).join(''); };
  } else if(p !== 'gemini'){
    var base = (c.base || '').trim().replace(/\/+$/, '');
    url = p === 'custom' ? (/\/chat\/completions$/.test(base) ? base : base + '/chat/completions') : PROVIDERS[p].url;
    headers = {'content-type':'application/json'}; if(c.key) headers.authorization = 'Bearer ' + c.key;
    body = {model:model, messages:[{role:'user', content:prompt}]};
    extract = function(d){ return d.choices && d.choices[0] && d.choices[0].message && d.choices[0].message.content; };
  } else {
    url = 'https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(geminiModelFix(model)) + ':generateContent';
    headers = {'content-type':'application/json', 'x-goog-api-key':c.key};
    body = {contents:[{parts:[{text:prompt}]}], generationConfig:{responseMimeType:'application/json'}};
    extract = function(d){ var ps = (d.candidates && d.candidates[0] && d.candidates[0].content && d.candidates[0].content.parts) || []; return ps.map(function(x){ return x.text || ''; }).join(''); };
  }
  for(var attempt = 1; attempt <= 3; attempt++){
    var resp = await fetch(url, {method:'POST', headers:headers, body:JSON.stringify(body), signal:AbortSignal.timeout(120000)});
    var raw = await resp.text();
    if(resp.ok){ var t = extract(JSON.parse(raw)); if(!t) throw new Error('回應中沒有文字內容'); return t; }
    var em = raw.slice(0, 200); try{ var e = JSON.parse(raw); em = (e.error && e.error.message) || e.message || em; }catch(x){}
    if({429:1, 500:1, 503:1, 529:1}[resp.status] && attempt < 3){ await new Promise(function(r){ setTimeout(r, attempt * 5000); }); continue; }
    throw new Error('HTTP ' + resp.status + '：' + em);
  }
}
function parseJson(t){ var s = t.indexOf('{'), e = t.lastIndexOf('}'); if(s < 0 || e < s) throw new Error('AI 回傳的不是 JSON'); return JSON.parse(t.slice(s, e + 1)); }

/* ---------- 搜尋 ---------- */
function ask(q){
  V.q = String(q || '').trim().slice(0, 120); V.ai = null; V.aiMsg = '';
  V.res = V.q ? N.match(V.q) : null;
  V.goal = V.res && V.res.goals[0] ? V.res.goals[0].g.id : null;
  setHash(); render(); var r = $('result'); if(r) r.scrollIntoView({behavior:'smooth', block:'start'});
}
async function askAi(){
  var q = ($('qIn') || {}).value || V.q; q = String(q).trim();
  if(!q){ toast('先寫下你想做的事'); return; }
  if(!aiReady()){ toast('請先在 ⚙ 常用設定填入 AI 金鑰；沒有金鑰可以按「複製提示詞」貼到 ChatGPT'); openSettings('ai'); return; }
  if(V.q !== q) ask(q);
  V.aiMsg = 'AI 排路線中…（約 10～30 秒）'; V.aiErr = false; paintResult();
  try{ V.ai = N.cleanAi(parseJson(await callLLM(N.aiPrompt(q)))); V.aiMsg = V.ai.steps.length ? '✨ AI 排好的路線（只用目錄裡的工具）' : 'AI 沒有給出可用的建議，請改寫得具體一點。'; }
  catch(e){ V.aiMsg = '失敗：' + (e && e.message || e); V.aiErr = true; }
  paintResult();
}

/* ---------- 畫面 ---------- */
function topBar(){
  return '<div class="top"><h1><span class="dotline"><i style="background:var(--c-start)"></i><i style="background:var(--c-idea)"></i><i style="background:var(--c-calc)"></i><i style="background:var(--c-prompt)"></i></span>AI 工具導航 <small>說出想做的事，幫你排好路線</small></h1>' +
    '<a class="ibtn" href="manual.html">📖 操作手冊</a><button class="ibtn" data-act="settings" aria-label="常用設定">⚙</button></div>' +
    '<p class="warn-line">推薦是規則比對的參考，工具功能與 AI 服務方案以各官方頁面為準。<button data-act="warn">⚠ 使用警語</button></p>';
}
function toolCard(id){
  var t = N.toolById[id]; if(!t) return '';
  return '<a class="tc" style="--cc:' + col(t.c) + '" href="' + esc(t.url) + '" target="_blank" rel="noopener"><b>' + esc(t.n) + (t.lic ? '<span class="lic" title="需要課程序號，請向授課講師索取">🔑 需序號</span>' : '') + '</b><small>' + esc(t.d) + '</small><span class="go2">開啟 ↗</span></a>';
}
function genPill(id){ var g = N.genById[id]; return g ? '<a class="gai" href="' + esc(g.url) + '" target="_blank" rel="noopener" title="' + esc(g.d) + '">🤖 ' + esc(g.n) + '</a>' : ''; }
function routeHtml(steps, color){
  return '<div class="route" style="--lc:' + color + '">' + steps.map(function(s, i){
    return '<div class="stop" data-n="' + (i + 1) + '"><h3>' + esc(s.t) + '</h3>' + (s.why ? '<div class="why">' + esc(s.why) + '</div>' : '') +
      (s.tools.length ? '<div class="tl">' + s.tools.map(toolCard).join('') + '</div>' : '') +
      (s.ai.length ? '<div>' + s.ai.map(genPill).join('') + '<span class="small">　一般 AI 工具（另開官方網站）</span></div>' : '') + '</div>';
  }).join('') + '</div>';
}
function goalSteps(g){ return g.steps.map(function(s){ return {t:s[0], tools:s[1] || [], ai:s[2] || []}; }); }
function goalColor(g){ var first = g.steps.map(function(s){ return (s[1] || [])[0]; }).filter(Boolean)[0]; return first ? col(N.toolById[first].c) : 'var(--accent)'; }
function resultHtml(){
  var r = V.res, g = V.goal ? N.goalById[V.goal] : null;
  if(!r && !g) return '';
  var h = '<section class="card" id="result">';
  if(V.q) h += '<div class="small">你想做的事</div><h2 style="font-size:1.3rem">「' + esc(V.q) + '」</h2>';
  if(r && r.goals.length > 1) h += '<div class="small" style="margin-top:.5rem">最接近的情境（點一下換路線）</div><div class="gtabs">' + r.goals.slice(0, 4).map(function(x){ return '<button data-goal="' + x.g.id + '" aria-pressed="' + (x.g.id === V.goal) + '">' + x.g.ic + ' ' + esc(x.g.t) + '</button>'; }).join('') + '</div>';
  if(V.ai && V.ai.steps.length){
    h += '<h3 style="margin-top:1rem">✨ AI 建議的路線</h3>' + (V.ai.summary ? '<p class="lead">' + esc(V.ai.summary) + '</p>' : '') + routeHtml(V.ai.steps, 'var(--c-prompt)');
  }
  if(g){
    h += '<h3 style="margin-top:1rem">' + g.ic + ' ' + esc(g.t) + '：建議路線</h3>' + routeHtml(goalSteps(g), goalColor(g));
    if(g.tip) h += '<div class="tip">💡 ' + esc(g.tip) + '</div>';
    if(g.p) h += '<div class="ptpl"><b>📝 可以直接拿去問一般 AI 的提示詞</b>（把【】換成你的情況）<pre>' + esc(g.p) + '</pre><button class="btn alt sm" data-act="copyTpl">📋 複製</button></div>';
  } else if(r && !r.goals.length) h += '<p class="empty">沒有找到很接近的情境。可以換個說法，例如「我想做…」「我要寫…」，或按「✨ AI 幫我排」「📋 複製提示詞」。</p>';
  var inRoute = {}; if(g) g.steps.forEach(function(s){ (s[1] || []).forEach(function(id){ inRoute[id] = 1; }); });
  var more = r ? r.tools.filter(function(x){ return !inRoute[x.t.id]; }).slice(0, 6) : [];
  if(more.length) h += '<h3 style="margin-top:1.2rem">🔎 也可能用得到</h3><div class="tl">' + more.map(function(x){ return toolCard(x.t.id); }).join('') + '</div>';
  h += '<div class="go"><button class="btn alt sm" data-act="share">🔗 分享這條路線</button></div>';
  return h + '</section>';
}
function browseHtml(){
  var h = '<section class="card"><h2 style="font-size:1.2rem">🗺 全部路線圖</h2><div class="tabs2"><button data-tab="goals" aria-pressed="' + (V.tab === 'goals') + '">我想…（' + N.GOALS.length + ' 種情境）</button><button data-tab="tools" aria-pressed="' + (V.tab === 'tools') + '">全部工具（' + N.TOOLS.length + ' 個）</button><button data-tab="gen" aria-pressed="' + (V.tab === 'gen') + '">常用 AI 服務</button></div>';
  if(V.tab === 'goals') h += '<div class="goals">' + N.GOALS.map(function(g){ return '<button data-goal="' + g.id + '"><span>' + g.ic + '</span>' + esc(g.t) + '</button>'; }).join('') + '</div>';
  else if(V.tab === 'gen') h += '<p class="lead">這些是外部的 AI 服務，只寫它們擅長做什麼；功能、免費額度與付費方案常變動，請以官方網站為準。</p><div class="tl" style="margin-top:.7rem">' + N.GEN.map(function(g){ return '<a class="tc" href="' + esc(g.url) + '" target="_blank" rel="noopener"><b>🤖 ' + esc(g.n) + '</b><small>' + esc(g.d) + '</small><span class="go2">官方網站 ↗</span></a>'; }).join('') + '</div>';
  else {
    h += '<div class="filter"><input id="fIn" value="' + esc(V.filter) + '" placeholder="輸入關鍵字篩選，例如：貼文、貸款、影片" aria-label="篩選工具"><select id="fCat" aria-label="分類"><option value="">全部分類</option>' + N.CATS.map(function(c){ return '<option value="' + c.id + '"' + (V.cat === c.id ? ' selected' : '') + '>' + c.ic + ' ' + c.n + '</option>'; }).join('') + '</select></div><div id="toolLines">' + toolLines() + '</div>';
  }
  return h + '</section>';
}
function toolLines(){
  var f = N.norm(V.filter), n = 0;
  var h = N.CATS.filter(function(c){ return !V.cat || c.id === V.cat; }).map(function(c){
    var list = N.TOOLS.filter(function(t){ return t.c === c.id && (!f || N.norm(t.n + t.d + t.k.join(' ')).indexOf(f) >= 0); });
    n += list.length;
    return list.length ? '<div class="line" style="--cc:' + col(c.id) + '"><h3><i></i>' + c.ic + ' ' + c.n + '<span class="small">' + list.length + ' 個</span></h3><div class="tl">' + list.map(function(t){ return toolCard(t.id); }).join('') + '</div></div>' : '';
  }).join('');
  return n ? h : '<p class="empty">找不到符合的工具，換個關鍵字試試。</p>';
}
function footer(){
  return '<footer class="foot">👤 創作者 Mark Tsai（蔡豐全）<a href="mailto:tsaimark@gmail.com">tsaimark@gmail.com</a><br><a href="manual.html">📖 操作手冊</a><a href="#" data-act="warn">⚠ 使用警語</a>' +
    (standalone ? '' : '<a href="#" data-act="install">📲 加入主畫面</a>') + '<a href="https://m255525.github.io/startup-island/" target="_blank" rel="noopener">🏝 創業島</a><a href="https://m255525.github.io/creator-town/" target="_blank" rel="noopener">🏘 創作者小鎮</a>' +
    '<br><img src="' + BADGE + '" alt="訪客次數" height="20" loading="lazy" style="vertical-align:middle;margin-top:.4rem"></footer>';
}
function render(){
  var h = topBar() +
    '<section class="card ask"><h2>你想<em>做什麼</em>？</h2><p class="lead">用一句話說說看，我從 ' + N.TOOLS.length + ' 個線上工具和常用 AI 服務裡，幫你排出使用順序。</p>' +
    '<div class="askrow"><input id="qIn" maxlength="120" value="' + esc(V.q) + '" placeholder="例如：我想開一家手搖飲店" aria-label="你想做的事" autocomplete="off"><button class="btn" data-act="ask">🔍 幫我找</button></div>' +
    '<div class="chips">' + N.EXAMPLES.map(function(e){ return '<button class="chip" data-ex="' + esc(e) + '">' + esc(e) + '</button>'; }).join('') + '</div>' +
    '<div class="modes"><button class="btn alt sm" data-act="ai">✨ AI 幫我排（需自己的金鑰）</button><button class="btn alt sm" data-act="copyPrompt">📋 複製提示詞（免金鑰，貼到 ChatGPT 等）</button>' +
    '<span class="small">「幫我找」用規則比對、不用金鑰，也不會把你打的字傳出去；用 AI 時才會把這句話和工具清單送到你設定的 AI 服務。</span></div>' +
    '<div class="msg' + (V.aiErr ? ' err' : '') + '" id="aiMsg">' + esc(V.aiMsg) + '</div></section>' +
    '<div id="resWrap">' + resultHtml() + '</div>' + browseHtml() + footer();
  var a = document.activeElement, keepId = a && a.id, sel = null; try{ if(keepId) sel = [a.selectionStart, a.selectionEnd]; }catch(e){}
  $('app').innerHTML = h;
  if(keepId && $(keepId)){ $(keepId).focus(); try{ if(sel) $(keepId).setSelectionRange(sel[0], sel[1]); }catch(e){} }
}
function paintResult(){ var w = $('resWrap'); if(w) w.innerHTML = resultHtml(); var m = $('aiMsg'); if(m){ m.textContent = V.aiMsg; m.className = 'msg' + (V.aiErr ? ' err' : ''); } }

/* ---------- 事件 ---------- */
var ACT = {
  ask:function(){ ask(($('qIn') || {}).value); },
  ai:function(){ askAi(); },
  copyPrompt:function(){ var q = String(($('qIn') || {}).value || V.q).trim(); if(!q){ toast('先寫下你想做的事'); return; } copyText(N.aiPrompt(q), '已複製！貼到 ChatGPT、Claude 或 Gemini，它會從工具清單幫你排路線'); },
  copyTpl:function(){ var g = N.goalById[V.goal]; if(g && g.p) copyText(g.p, '已複製提示詞，把【】換成你的情況'); },
  share:function(){ var u = location.href; if(navigator.share) navigator.share({title:'AI 工具導航', url:u}).catch(function(){}); else copyText(u, '已複製分享連結'); },
  warn:function(){ showWarn(); }, close:closeModal, settings:function(){ openSettings(); }, install:function(){ install(); },
  saveAi:function(){ var c = aiCfg(); c.provider = $('aiP').value; c.key = $('aiK').value.trim(); c.model = $('aiM').value; c.modelCustom = $('aiMC').value.trim(); c.base = $('aiB').value.trim(); lsSet('ai', JSON.stringify(c)); toast(aiReady() ? 'AI 設定已儲存' : '已儲存（還沒有金鑰）'); openSettings('ai'); },
  clearAi:function(){ lsSet('ai', '{}'); toast('已清除 AI 金鑰'); openSettings('ai'); },
  fs:function(el){ lsSet('fs', el.dataset.v); applyView(); openSettings('view'); },
  theme:function(el){ lsSet('theme', el.dataset.v); applyView(); openSettings('view'); },
  wipe:function(){ try{ Object.keys(localStorage).forEach(function(k){ if(k.indexOf(PFX) === 0) localStorage.removeItem(k); }); }catch(e){} closeModal(); toast('這台電腦上的設定與金鑰已清除'); applyView(); }
};
document.addEventListener('click', function(e){
  var el = e.target.closest('[data-act],[data-ex],[data-goal],[data-tab]'); if(!el) return;
  var ds = el.dataset;
  if(el.tagName === 'A' && ds.act) e.preventDefault();
  if(ds.ex){ ask(ds.ex); return; }
  if(ds.goal){ V.goal = ds.goal; if(!V.res || !V.res.goals.some(function(x){ return x.g.id === ds.goal; })){ V.q = ''; V.res = null; V.ai = null; } setHash(); if($('resWrap')) paintResult(); var r = $('result'); if(r) r.scrollIntoView({behavior:'smooth', block:'start'}); return; }
  if(ds.tab){ V.tab = ds.tab; render(); return; }
  if(ACT[ds.act]) ACT[ds.act](el);
});
document.addEventListener('keydown', function(e){
  if(e.key === 'Escape') closeModal();
  if(e.key === 'Enter' && !e.isComposing && e.target && e.target.id === 'qIn'){ e.preventDefault(); ask(e.target.value); }
});
document.addEventListener('input', function(e){ if(e.target.id === 'fIn'){ V.filter = e.target.value; $('toolLines').innerHTML = toolLines(); } });
document.addEventListener('change', function(e){ if(e.target.id === 'fCat'){ V.cat = e.target.value; $('toolLines').innerHTML = toolLines(); } if(e.target.id === 'aiP'){ var p = PROVIDERS[e.target.value]; $('aiM').innerHTML = p.models.map(function(m){ return '<option value="' + m[0] + '">' + m[1] + '</option>'; }).join(''); $('baseRow').hidden = e.target.value !== 'custom'; } });
$('modal').addEventListener('click', function(e){ if(e.target.id === 'modal') closeModal(); });
window.addEventListener('hashchange', function(){
  var h = new URLSearchParams(location.hash.slice(1)), q = (h.get('q') || '').slice(0, 120), g = h.get('g');
  if(q && q !== V.q){ ask(q); return; }
  if(N.goalById[g] && g !== V.goal){ V.goal = g; render(); }
});

/* ---------- 警語、設定 ---------- */
var WARN = '<h2>⚠ 使用警語</h2><ul>' +
  '<li>「幫我找」是<b>規則比對</b>：依你打的字對照情境與工具關鍵字，推薦的是參考路線，不一定是唯一或最好的做法。</li>' +
  '<li>工作區工具的說明依各工具現況整理（2026-11）；標示 🔑 的工具需要課程序號，請向授課講師索取。</li>' +
  '<li>一般 AI 服務（ChatGPT、Gemini、Canva…）是外部網站，本工具只寫它們擅長什麼，<b>功能、免費額度與付費方案常變動，以官方網站為準</b>；使用時請遵守各服務的條款，不要輸入個資或機密資料。</li>' +
  '<li>「✨ AI 幫我排」會把你打的那句話和工具清單送到你自己設定的 AI 服務；金鑰只存在這台瀏覽器，不會傳到其他地方。AI 只能挑清單裡的工具，結果仍請自行判斷。</li>' +
  '<li>貸款、勞健保、稅務等規定以主管機關最新公告為準；AI 產生的內容請自行查證。</li>' +
  '<li>本工具為個人製作的教學工具，與各 AI 服務商無關，也不代表推薦或背書。</li></ul>';
function showWarn(){ openModal(WARN + '<div class="stack"><button class="btn" data-act="close">我知道了</button></div>'); }
function sec(id, title, val, body, open){ return '<details class="set-sec"' + (open ? ' open' : '') + '><summary><span class="sst">' + title + '</span><span class="ssv">' + esc(val) + '</span></summary><div class="set-body">' + body + '</div></details>'; }
function openSettings(openId){
  var c = aiCfg(), p = PROVIDERS[c.provider], fs = lsGet('fs') || 'm', th = lsGet('theme') || 'auto';
  var b = function(act, v, label, cur){ return '<button class="btn sm' + (cur === v ? '' : ' alt') + '" data-act="' + act + '" data-v="' + v + '">' + label + '</button>'; };
  openModal('<h2>⚙ 常用設定</h2>' +
    sec('view', '顯示', (fs === 'xl' ? '大字' : '標準字') + '・' + {auto:'跟隨系統', light:'淺色', dark:'深色'}[th], '<div class="go" style="margin-top:0">' + b('fs', 'm', '標準字', fs) + b('fs', 'xl', '大字（投影用）', fs) + '</div><div class="go">' + b('theme', 'auto', '跟隨系統', th) + b('theme', 'light', '淺色', th) + b('theme', 'dark', '深色', th) + '</div>', openId === 'view') +
    sec('ai', '🤖 AI 設定（選填，自備金鑰）', aiReady() ? p.label.replace(/（.*/, '') + '・' + aiModel(c) : '未設定',
      '<p class="small">只有按「✨ AI 幫我排」才會用到。金鑰只存在這台瀏覽器。</p><label class="fld">服務商<select id="aiP">' + Object.keys(PROVIDERS).map(function(k){ return '<option value="' + k + '"' + (k === c.provider ? ' selected' : '') + '>' + PROVIDERS[k].label + '</option>'; }).join('') + '</select></label>' +
      '<label class="fld">API 金鑰<input id="aiK" type="password" autocomplete="off" value="' + esc(c.key || '') + '" placeholder="貼上你的金鑰"></label>' +
      '<label class="fld">模型<select id="aiM">' + p.models.map(function(m){ return '<option value="' + m[0] + '"' + (m[0] === c.model ? ' selected' : '') + '>' + m[1] + '</option>'; }).join('') + '</select></label>' +
      '<label class="fld">或自己輸入模型名稱<input id="aiMC" value="' + esc(c.modelCustom || '') + '" placeholder="留空就用上面選的"></label>' +
      '<label class="fld" id="baseRow"' + (c.provider === 'custom' ? '' : ' hidden') + '>端點網址<input id="aiB" value="' + esc(c.base || '') + '" placeholder="例如 http://localhost:11434/v1"></label>' +
      '<div class="go"><button class="btn sm" data-act="saveAi">儲存</button><button class="btn alt sm" data-act="clearAi">清除金鑰</button></div>', openId === 'ai') +
    sec('wipe', '🧹 清除這台電腦的資料', '', '<p class="small">清掉 AI 金鑰、字體與配色設定。</p><button class="btn alt sm" data-act="wipe">清除</button>') +
    sec('about', '關於本工具', '', '<p>👤 創作者 Mark Tsai（蔡豐全）<br><a href="mailto:tsaimark@gmail.com">tsaimark@gmail.com</a></p><div class="go"><a class="btn alt sm" href="manual.html">📖 操作手冊</a><a class="btn alt sm" href="manual.html#creator">👤 創作者資訊</a><button class="btn alt sm" data-act="warn">⚠ 使用警語</button>' + (standalone ? '' : '<button class="btn alt sm" data-act="install">📲 加入主畫面</button>') + '</div><p class="small">訪客數 <img src="' + BADGE + '" alt="訪客次數" height="20" loading="lazy" style="vertical-align:middle"></p>') +
    '<div class="stack"><button class="btn" data-act="close">關閉</button></div>');
}
function applyView(){ document.documentElement.dataset.fs = lsGet('fs') === 'xl' ? 'xl' : 'm'; var th = lsGet('theme'); if(th === 'light' || th === 'dark') document.documentElement.setAttribute('data-theme', th); else document.documentElement.removeAttribute('data-theme'); }
function install(){
  closeModal();
  if(window._dp){ window._dp.prompt(); window._dp = null; return; }
  openModal('<h2>📲 加入主畫面</h2><ul><li><b>iPhone／iPad（Safari）</b>：按「分享」→「加入主畫面」。</li><li><b>Android（Chrome）</b>：右上角「⋮」→「安裝應用程式」。</li><li><b>電腦（Chrome／Edge）</b>：網址列右邊的安裝圖示。</li></ul><div class="stack"><button class="btn" data-act="close">知道了</button></div>');
}

/* ---------- 跑馬燈（工作區共用公告） ---------- */
function initMarquee(){
  var URL_ = "https://script.google.com/macros/s/AKfycbwKX0DNNbY8y4nf90BFTHtxgfqJcHHcZasRrgycl4QAe52_hkjMWSkYk4xOsqU-JPCROw/exec";
  var bar = $('marqueeBar'), track = $('marqueeTrack'), lastKey = null;
  function add(c, text){ var re = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, li = 0, m; while((m = re.exec(text))){ if(m.index > li) c.appendChild(document.createTextNode(text.slice(li, m.index))); var a = document.createElement('a'); a.href = m[2]; a.textContent = m[1]; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.style.color = 'inherit'; c.appendChild(a); li = re.lastIndex; } if(li < text.length) c.appendChild(document.createTextNode(text.slice(li))); }
  function show(items){ if(!items || !items.length) return; var k = JSON.stringify(items); if(k === lastKey) return; lastKey = k; track.innerHTML = ''; var fr = document.createDocumentFragment(); function pass(){ items.forEach(function(it, i){ if(i) fr.appendChild(document.createTextNode('　★　')); add(fr, String(it)); }); } pass(); fr.appendChild(document.createTextNode('　★　')); pass(); track.appendChild(fr); bar.classList.add('show'); document.body.classList.add('has-marquee'); track.style.animationDuration = Math.max(track.scrollWidth / 2 / 70, 12) + 's'; }
  function fetchM(){ fetch(URL_, {method:'POST', body:JSON.stringify({serial:''})}).then(function(r){ return r.json(); }).then(function(d){ if(d && Array.isArray(d.marquee) && d.marquee.length){ lsSet('marquee', JSON.stringify(d.marquee)); show(d.marquee); } }).catch(function(){}); }
  show(lsJson('marquee', [])); fetchM(); setInterval(fetchM, 20 * 60 * 1000);
}

window.addEventListener('beforeinstallprompt', function(e){ e.preventDefault(); window._dp = e; });
if('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('service-worker.js').catch(function(){});
applyView();
if(V.q){ V.res = N.match(V.q); if(!V.goal && V.res.goals[0]) V.goal = V.res.goals[0].g.id; }
render();
if(!lsGet('warnSeen')){ lsSet('warnSeen', '1'); showWarn(); }
initMarquee();
window._nav = {V:V, ask:ask, render:render, N:N};
})();
