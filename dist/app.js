(() => {
 'use strict';
 const {conditions,points,sources,outline,earPaths}=window.ATLAS_DATA;
 const $=s=>document.querySelector(s);
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const pointMap=new Map(points.map(p=>[p.id,p]));
 const shortNames={'headache':'头痛','neck-pain':'颈部疼痛','shoulder-pain':'肩周炎相关肩痛','tennis-elbow':'网球肘','low-back-pain':'腰背痛','sciatica':'坐骨神经痛','knee-oa':'膝关节痛','heel-pain':'足跟痛','toothache':'牙痛','gastric-pain':'胃脘痛','dysmenorrhea':'痛经','constipation':'便秘','insomnia':'失眠与睡眠不佳','allergic-rhinitis':'过敏性鼻炎'};
 const icons={'头面':'ph-head-circuit','颈肩':'ph-person-simple','上肢':'ph-hand','腰背':'ph-person-simple','腰腿':'ph-person-simple-walk','下肢':'ph-footprints','腹部':'ph-circle-half','盆腹':'ph-flower','睡眠':'ph-moon'};
 const regions=['全部','头面','颈肩','上肢','腰腿','下肢','腹部','睡眠'];
 let saved=[];try{saved=JSON.parse(localStorage.getItem('atlas-favorites')||'[]');if(!Array.isArray(saved))saved=[]}catch{}
 saved=saved.filter(id=>conditions.some(c=>c.id===id));
 let state={page:'atlas',condition:'low-back-pain',point:'body-bl23',system:'body',view:'back',query:'',region:'全部',zoom:1,saved};
 let toastTimeout;
 function current(){return conditions.find(c=>c.id===state.condition)}
 function notify(message){$('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>$('#toast').classList.remove('show'),2400)}
 function groupRegion(c){return ['腰背','腰腿'].includes(c.region)?'腰腿':c.region==='盆腹'?'腹部':c.region}
 function matches(c){
  const q=state.query.trim().toLowerCase().replace(/\s+/g,'');
  const hay=[c.name,shortNames[c.id],c.region,...[...c.body_point_ids,...c.ear_point_ids].flatMap(id=>{const p=pointMap.get(id);return[p.name,p.code||'',p.code==='GV29'?'EX-HN3':'']})].join('').toLowerCase().replace(/\s+/g,'');
  return (!q||hay.includes(q))&&(state.region==='全部'||groupRegion(c)===state.region);
 }
 function filtered(){return conditions.filter(matches)}
 function countFavorites(){$('#favorite-count').textContent=state.saved.length}
 function saveCondition(){
  const exists=state.saved.includes(state.condition);state.saved=exists?state.saved.filter(x=>x!==state.condition):[...state.saved,state.condition];
  try{localStorage.setItem('atlas-favorites',JSON.stringify(state.saved))}catch{notify('浏览器限制了本地存储，收藏仅在本次使用中保留');renderDetail();countFavorites();return}
  notify(exists?'已取消收藏':'已加入收藏，保存在此浏览器中');countFavorites();renderDetail();if(state.page==='favorites')renderCatalog();
 }
 function selectCondition(id){
  const c=conditions.find(x=>x.id===id);if(!c)return;
  state.condition=id;
  const list=state.system==='body'?c.body_point_ids:c.ear_point_ids;
  state.point=list[0]||c.body_point_ids[0];
  const p=pointMap.get(state.point);if(p?.system==='body'&&p.diagram)state.view=p.diagram.view;
  state.zoom=1;render();
 }
 function selectPoint(id){
  const p=pointMap.get(id);if(!p)return;
  state.point=id;state.system=p.system;
  if(p.system==='body'&&p.diagram)state.view=p.diagram.view;
  renderFigure();renderDetail();
 }
 function setPage(page){
  state.page=page;$('#atlas-page').hidden=page!=='atlas';$('#catalog-page').hidden=page==='atlas';
  document.querySelectorAll('[data-page]').forEach(b=>{b.classList.toggle('active',b.dataset.page===page);b.setAttribute('aria-current',b.dataset.page===page?'page':'false')});
  $('#breadcrumb-title').textContent={atlas:'穴位图谱',index:'病痛索引',favorites:'我的收藏'}[page];
  if(page!=='atlas')renderCatalog();
 }
 function renderFilters(){
  $('#region-filters').innerHTML=regions.map(r=>`<button data-region="${r}" class="${state.region===r?'active':''}" aria-pressed="${state.region===r}">${r}</button>`).join('');
 }
 function renderList(){
  const list=filtered();$('#result-count').textContent=`${list.length} 项`;
  $('#condition-list').innerHTML=list.length?list.map(c=>`<button class="condition-row ${c.id===state.condition?'active':''}" data-condition="${c.id}" aria-pressed="${c.id===state.condition}"><span class="condition-icon"><i class="ph ${icons[c.region]||'ph-person-simple'}" aria-hidden="true"></i></span><span><strong>${esc(shortNames[c.id])}</strong><small>${c.body_point_ids.length} 个体穴 · ${c.ear_point_ids.length} 个耳穴</small></span><i class="ph ph-caret-right" aria-hidden="true"></i></button>`).join(''):`<div class="empty-state"><i class="ph ph-magnifying-glass" aria-hidden="true"></i>没有找到相关条目<p>试试“腰痛”“神门”或“LI4”</p><button data-clear>清除筛选</button></div>`;
 }
 function renderDetail(){
  const c=current(),p=pointMap.get(state.point),isSaved=state.saved.includes(c.id),associated=[...c.body_point_ids,...c.ear_point_ids].includes(p?.id);
  function chips(ids){return ids.map(id=>{const p=pointMap.get(id);return `<button class="point-chip ${state.point===id?'active':''}" data-point="${id}" aria-pressed="${state.point===id}" title="查看${esc(p.system==='body'?'体穴':'耳穴')}${esc(p.name)}">${esc(p.name)}</button>`}).join('')}
  const related=conditions.filter(x=>[...x.body_point_ids,...x.ear_point_ids].includes(p?.id));
  $('#condition-detail').innerHTML=`<div class="detail-top"><div class="detail-kicker">当前病痛 / ${esc(c.region)}<button class="icon-button ${isSaved?'saved':''}" id="save-condition" title="${isSaved?'取消收藏':'收藏当前病痛'}" aria-label="${isSaved?'取消收藏':'收藏当前病痛'}" aria-pressed="${isSaved}"><i class="ph ${isSaved?'ph-bookmark-simple':'ph-bookmark-simple'}" aria-hidden="true"></i></button></div><h2>${esc(shortNames[c.id])}</h2><p class="detail-subtitle">${esc(c.scope_note)}</p><span class="association-note"><i class="ph ph-leaf" aria-hidden="true"></i>传统常用关联，非个体处方</span></div>
  <div class="point-section"><div class="section-label">相关体穴<span>${c.body_point_ids.length} 个穴位</span></div><div class="point-chips">${chips(c.body_point_ids)}</div><p class="modality">资料方式：${esc(c.body_modality)}</p></div>
  <div class="point-section"><div class="section-label">相关耳穴<span>${c.ear_point_ids.length} 个穴位</span></div><div class="point-chips">${chips(c.ear_point_ids)}</div><p class="modality">耳针与贴压须由专业人员区分</p></div>
  ${p?`<div class="selected-point"><div class="detail-kicker">正在查看 / ${p.system==='ear'?'耳穴':'体穴'}</div><div class="point-detail-title"><strong>${esc(p.name)}</strong><code>${esc(p.code||(p.system==='ear'?'耳部穴位':'非固定穴'))}</code></div><p>${esc(p.region)}${!p.diagram?'，本图无外侧固定标点':''}</p><p class="region-note">${p.diagram?'仅为部位索引，非标准定位原文。':'隐藏面或不固定位置不投影到外侧图。'}</p>${!associated?`<p class="region-note">与当前病痛未收录关联。</p><div class="related-links">已收录于：${related.map(x=>`<button data-condition="${x.id}">${esc(shortNames[x.id])}</button>`).join('')||'暂无病痛关联'}</div>`:''}</div>`:''}
  <div class="detail-actions"><button class="source-action primary" id="condition-sources"><i class="ph ph-book-open" aria-hidden="true"></i>查看依据</button><button class="source-action" id="evidence-button"><i class="ph ph-text-align-left" aria-hidden="true"></i>证据说明</button></div><div class="safety-note"><strong><i class="ph ph-warning-circle" aria-hidden="true"></i>需要先就医的情况</strong>${esc(c.safety_note)}</div>`;
 }
 function renderFigure(){
  const c=current(),ear=state.system==='ear';
  document.querySelectorAll('[data-system]').forEach(b=>b.setAttribute('aria-selected',b.dataset.system===state.system));
  $('#diagram-system-label').textContent=ear?'AURICULAR':'BODY';$('#figure-title').textContent=ear?'耳郭外侧':`人体${state.view==='front'?'正面':'背面'}`;
  $('#view-switch').hidden=ear;document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===state.view));
  $('#orientation').innerHTML=ear?'耳郭外侧视图<br><span>耳屏位于画面左侧</span>':`${state.view==='front'?'正面':'背面'}视图<br><span>双侧穴择一侧示意</span>`;
  $('#zoom-reset').textContent=`${Math.round(state.zoom*100)}%`;$('#zoom-reset').setAttribute('aria-label',`当前 ${Math.round(state.zoom*100)}%，点击恢复图谱缩放`);$('#zoom-in').disabled=state.zoom>=1.6;$('#zoom-out').disabled=state.zoom<=.8;
  const visible=points.filter(p=>p.system===state.system&&p.diagram&&(ear||p.diagram.view===state.view));
  const related=ear?c.ear_point_ids:c.body_point_ids;
  let paths;
  if(ear)paths=earPaths.map(p=>`<path class="${p.class==='contour'?'anatomy':'anatomy-line'}" d="${p.d}"/>`).join('');
  else paths=`<g transform="translate(350 100)"><path d="${outline}" class="anatomy"/></g>`+(state.view==='front'?`<path class="anatomy-line" d="M320 246 Q330 241 340 246 M360 246 Q370 241 380 246 M350 252 V270 L344 272 M336 282 Q350 290 364 282 M350 337 V532 M279 380 Q314 367 343 382 M357 382 Q386 367 421 380 M299 480 Q303 534 333 558 M367 558 Q397 534 401 480 M281 744 Q303 756 324 744 M376 744 Q398 756 419 744 M179 601 L184 618 M188 600 L193 620 M516 600 L511 620 M525 601 L520 618"/><circle cx="350" cy="480" r="3" class="anatomy-line"/>`:`<path class="anatomy-line" d="M1050 299 V550 M991 401 Q1022 426 1042 398 M1058 398 Q1078 426 1109 401" transform="translate(-700 0)"/><path class="anatomy-line" d="M290 339 Q304 368 300 405 M410 339 Q396 368 400 405 M283 552 Q313 584 350 562 Q387 584 417 552 M282 744 H320 M380 744 H418 M286 819 Q308 838 302 872 M398 872 Q392 838 414 819 M179 601 L184 618 M188 600 L193 620"/>`);
  const marked=visible.filter(p=>related.includes(p.id)||p.id===state.point);
  const labelPositions=new Map();
  for(const side of ['left','right']){
   const sorted=marked.filter(p=>(p.diagram.x<(ear?440:350)?'left':'right')===side).sort((a,b)=>a.diagram.y-b.diagram.y);
   let last=ear?180:180;for(const p of sorted){const y=Math.max(last+42,p.diagram.y);last=y;labelPositions.set(p.id,{side,y})}
  }
  let labels='';
  for(const p of marked){const {side,y}=labelPositions.get(p.id),{x,y:py}=p.diagram;const right=side==='right';const lx=ear?(right?707:216):(right?565:135);const edge=right?lx-12:lx+12;const tx=right?'start':'end';labels+=`<path class="point-leader" d="M${x} ${py} L${edge} ${y-6}"/><text class="point-label" text-anchor="${tx}" x="${lx}" y="${y}">${esc(p.name)}</text>${p.code?`<text class="point-label-code" text-anchor="${tx}" x="${lx}" y="${y+19}">${esc(p.code)}</text>`:''}`}
  const dots=visible.map(p=>`<g class="point-marker ${related.includes(p.id)?'related':''} ${state.point===p.id?'selected':''}" data-marker="${p.id}" tabindex="0" role="button" aria-label="查看${p.system==='ear'?'耳穴':'体穴'}${esc(p.name)}${p.code?' '+esc(p.code):''}"><title>${esc(p.name)}：${esc(p.region)}，示意位置待复核</title><circle class="hit" cx="${p.diagram.x}" cy="${p.diagram.y}" r="17"/><circle class="halo" cx="${p.diagram.x}" cy="${p.diagram.y}" r="14"/><circle class="point-dot" cx="${p.diagram.x}" cy="${p.diagram.y}" r="4"/></g>`).join('');
  // Native SVG retains the original draft's display coordinates; no clinical position conversion.
  const viewBox=ear?'130 140 670 790':'75 165 575 865';
  $('#figure').style.transform=`scale(${state.zoom})`;
  $('#figure').innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" aria-label="${ear?'耳部':`人体${state.view==='front'?'正面':'背面'}`}穴位部位索引示意，待专业复核" role="group">${paths}${labels}${dots}</svg>`;
  const hidden=points.filter(p=>p.system===state.system&&!p.diagram&&related.includes(p.id));
  $('#hidden-points').hidden=!hidden.length;
  $('#hidden-points').innerHTML=ear?`内侧隐藏面：${hidden.map(p=>`<button data-point="${p.id}">${esc(p.name)}</button>`).join('')}（不标在外侧）`:`非固定定位：${hidden.map(p=>`<button data-point="${p.id}">${esc(p.name)}</button>`).join('')}`;
 }
 function renderCatalog(){
  const isFavorite=state.page==='favorites';const list=filtered().filter(c=>!isFavorite||state.saved.includes(c.id));
  $('#catalog-title').textContent=isFavorite?'我的收藏':'病痛索引';$('#catalog-count').textContent=isFavorite?`${list.length} 项，保存在此浏览器`:`${list.length} 项常见病痛 / 问题`;
  const nameList=ids=>ids.map(id=>pointMap.get(id).name).join('、');
  $('#catalog-list').innerHTML=list.length?list.map(c=>`<article class="catalog-row"><div><small>${esc(c.region)}</small><h3>${esc(shortNames[c.id])}</h3></div><div><small>相关体穴</small><p>${esc(nameList(c.body_point_ids))}</p></div><div><small>相关耳穴</small><p>${esc(nameList(c.ear_point_ids))}</p></div><button class="source-action" data-open-condition="${c.id}">查看图谱<i class="ph ph-arrow-right" aria-hidden="true"></i></button></article>`).join(''):`<div class="empty-state"><i class="ph ${isFavorite?'ph-bookmark-simple':'ph-magnifying-glass'}" aria-hidden="true"></i>${isFavorite?'还没有符合筛选的收藏':'没有找到相关条目'}<p>${isFavorite?'在穴位图谱右侧点击书签，保存常用病痛条目。':'试试搜索“足三里”或清除筛选。'}</p><button data-clear>清除筛选</button><button data-back-atlas>前往图谱</button></div>`;
 }
 function render(){renderFilters();renderList();renderFigure();renderDetail();countFavorites();if(state.page!=='atlas')renderCatalog()}
 function dialog(title,content,kicker='阅读资料'){
  $('#dialog-title').textContent=title;$('#dialog-eyebrow').textContent=kicker;$('#dialog-content').innerHTML=content;$('#info-dialog').showModal();
 }
 function showSources(onlyCurrent=false){
  const c=current();const ids=new Set([...c.body_source_ids,...c.ear_source_ids,...c.evidence.source_ids]);
  const list=onlyCurrent?sources.filter(s=>ids.has(s.id)):sources;
  dialog(onlyCurrent?`${shortNames[c.id]}的资料依据`:'资料与来源',`<p>${onlyCurrent?'体穴与耳穴可能来自不同资料，请结合适用人群和干预方式阅读。':'本图谱整理公开标准信息与医疗机构资料。公开可查不等于疗效已证实，也不等于图片可自由转载。'}</p><div class="dialog-notice">当前为研究草稿，全部点位待专业复核。查阅日期：2026-11-16。</div>${list.map(s=>`<article class="source-record"><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)} <i class="ph ph-arrow-up-right" aria-hidden="true"></i></a><small>${esc(s.publisher)}</small><p>${esc(s.scope)}</p></article>`).join('')}<div class="dialog-downloads"><a href="assets/conditions.csv" download>下载关联表 CSV</a><a href="assets/conditions.json" download>病痛数据 JSON</a><a href="assets/points.json" download>穴位数据 JSON</a></div>`);
 }
 function showEvidence(){const c=current();dialog('如何理解这些关联',`<h3>${esc(shortNames[c.id])}</h3><div class="dialog-notice">${c.evidence.status==='some_support'?'部分相关疼痛类型的整体针灸研究有一定支持。':'本资料包尚未独立评估该问题及本表配穴的疗效证据。'}</div><p>${esc(c.evidence.note)}</p><h3>配穴资料与疗效证据是两回事</h3><p>列出某穴位曾用于某类病症，只说明资料中的传统或临床关联，不代表这组穴位已经通过高质量研究验证，也不代表适合每一个人。</p><h3>不同方式不能互换</h3><p>针刺、耳针、耳穴贴压、按揉与艾灸是不同干预。人体针灸的研究结论不能直接用于耳穴，按揉的资料也不能当作自行针刺处方。</p><h3>本条目适用范围</h3><p>${esc(c.scope_note)}</p><p>本页没有完成系统综述或 GRADE 分级，不承诺治愈或具体有效率。</p>${c.evidence.source_ids.includes('efficacy')?`<a target="_blank" rel="noopener noreferrer" href="${esc(sources.find(s=>s.id==='efficacy').url)}">阅读 NCCIH 疗效与安全概述 <i class="ph ph-arrow-up-right" aria-hidden="true"></i></a>`:''}`,'证据与适用边界')}
 function showAbout(){dialog('使用图谱前，请先了解',`<div class="dialog-notice">仅供学习参考，不用于诊断、自行针刺或急症处理。</div><h3>如何探索</h3><p>搜索病痛、穴名或编码，选择条目后切换人体与耳部。点选穴位可查看部位索引；正面与背面随所选体穴切换。书签可将病痛条目保存在当前浏览器。</p><h3>示意图的限制</h3><p>本图谱包含 14 类问题、33 项体穴条目和 25 项耳穴条目，并非完整标准图谱。图中的位置、形态和比例均待专业复核，不能用于临床取穴或进针导航。耳郭内侧隐藏面不强行标到外侧。</p><h3>请由合格专业人员操作</h3><p>页面不提供进针深度、角度或操作参数。孕期、使用抗凝药物、凝血问题及局部皮肤感染等情况，应先告知医生。出现急症时及时就医。</p><h3>别把名称当成诊断</h3><p>耳穴的“心”“胃”等是传统命名，不是器官诊断工具；体穴“神门”和耳穴“神门”是两个不同部位。</p><h3>数据与隐私</h3><p>搜索和收藏在浏览器本地运行，不收集你的症状或诊断信息。收藏依赖此浏览器存储，清理浏览器数据后会丢失。</p>`,'学习参考与安全边界')}
 document.addEventListener('click',e=>{
  const region=e.target.closest('[data-region]');if(region){state.region=region.dataset.region;renderFilters();renderList();if(state.page!=='atlas')renderCatalog();return}
  const condition=e.target.closest('[data-condition]');if(condition){selectCondition(condition.dataset.condition);return}
  const point=e.target.closest('[data-point]');if(point){selectPoint(point.dataset.point);return}
  const marker=e.target.closest('[data-marker]');if(marker){selectPoint(marker.dataset.marker);return}
  const system=e.target.closest('[data-system]');if(system){state.system=system.dataset.system;state.zoom=1;const ids=state.system==='ear'?current().ear_point_ids:current().body_point_ids;selectPoint(ids[0]);return}
  const view=e.target.closest('[data-view]');if(view){state.view=view.dataset.view;state.zoom=1;renderFigure();return}
  const page=e.target.closest('[data-page]');if(page){setPage(page.dataset.page);return}
  const open=e.target.closest('[data-open-condition]');if(open){selectCondition(open.dataset.openCondition);setPage('atlas');return}
  if(e.target.closest('[data-clear]')){state.query='';state.region='全部';$('#search').value='';render();return}
  if(e.target.closest('[data-back-atlas]')){setPage('atlas');return}
  if(e.target.closest('#save-condition')){saveCondition();return}
  if(e.target.closest('#condition-sources')){showSources(true);return}
  if(e.target.closest('#evidence-button')){showEvidence();return}
 });
 $('#search').addEventListener('input',e=>{state.query=e.target.value;renderList();if(state.page!=='atlas')renderCatalog()});
 document.addEventListener('keydown',e=>{
  const marker=e.target.closest('[data-marker]');if(marker&&(e.key==='Enter'||e.key===' ')){e.preventDefault();const id=marker.dataset.marker;selectPoint(id);requestAnimationFrame(()=>document.querySelector(`[data-marker="${id}"]`)?.focus());return}
  if(e.key==='/'&&!['INPUT','TEXTAREA'].includes(document.activeElement.tagName)&&!$('#info-dialog').open){e.preventDefault();$('#search').focus()}
 });
 $('#sources-button').addEventListener('click',()=>showSources());$('#about-button').addEventListener('click',showAbout);$('#footer-about').addEventListener('click',showAbout);
 $('#close-dialog').addEventListener('click',()=>$('#info-dialog').close());$('#info-dialog').addEventListener('click',e=>{if(e.target===$('#info-dialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close()}});
 function zoom(amount){state.zoom=Math.min(1.6,Math.max(.8,Math.round((state.zoom+amount)*10)/10));renderFigure()}
 $('#zoom-in').addEventListener('click',()=>zoom(.2));$('#zoom-out').addEventListener('click',()=>zoom(-.2));$('#zoom-reset').addEventListener('click',()=>{state.zoom=1;renderFigure()});
 $('#download-map').addEventListener('click',()=>{const a=document.createElement('a');a.href=`assets/${state.system==='ear'?'ear':'body'}-acupoints.svg`;a.download=`${state.system==='ear'?'耳部':'人体'}穴位示意图-待专业复核.svg`;a.click();notify('已下载示意图，请保留图上的使用说明')});
 function updateThemeButton(){const dark=document.documentElement.dataset.theme==='dark';$('#theme-button span').textContent=dark?'切换浅色':'切换深色';$('#theme-button i').className=`ph ${dark?'ph-sun':'ph-moon'}`}
 $('#theme-button').addEventListener('click',()=>{const theme=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=theme;try{localStorage.setItem('atlas-theme',theme)}catch{}updateThemeButton()});
 document.querySelector('.brand').addEventListener('click',e=>{e.preventDefault();setPage('atlas')});
 updateThemeButton();setPage('atlas');render();
})();
