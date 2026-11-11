let DATA, CULTURE, DAILY, currentView="dashboard", currentChapter=1, vocabSort="chapter", vocabSearch="", vocabChapter="all", alphaFilter="all", quizMode="typing", quizIndex=0, quizItems=[], revealed=false;
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const saved=key=>JSON.parse(localStorage.getItem(key)||"[]");
const setSaved=(key,val)=>localStorage.setItem(key,JSON.stringify(val));
const completed=()=>saved("klp_completed");
const savedWords=()=>saved("klp_saved_words");
const viewed=()=>saved("klp_highlights");
const chapter=id=>DATA.chapters.find(c=>c.id===Number(id));
const allWords=()=>DATA.chapters.flatMap(c=>c.vocabulary.map(w=>({...w,chapterId:c.id,chapterDay:c.day,chapterTitle:c.title})));
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function render(){const names={dashboard:"Dashboard",chapters:"Chapters",vocabulary:"Vocabulary",grammar:"Grammar Album",conversation:"Conversations",reading:"Reading",quiz:"Quiz & Flashcards",culture:"Korean Culture & Stories",daily:"Daily Vocabulary Library"};$("#pageTitle").textContent=names[currentView]||"Dashboard";$$(".nav-item[data-view]").forEach(b=>b.classList.toggle("active",b.dataset.view===currentView));$("#content").innerHTML=({dashboard:dashboard,chapters:chaptersView,vocabulary:vocabularyView,grammar:grammarView,conversation:conversationView,reading:readingView,quiz:quizView,culture:cultureView,daily:dailyView})[currentView]();updateProgress();bindDynamic();}
function updateProgress(){let pct=Math.round(completed().length/DATA.chapters.length*100);$("#sideProgress").textContent=pct+"%";$("#sideBar").style.width=pct+"%";}
function dashboard(){let done=completed();return `<section class="hero"><div><div class="eyebrow" style="color:#e0e2ff">YOUR KOREAN JOURNEY</div><h2>매일 조금씩, 꾸준히!</h2><p>Learn Korean one chapter at a time. Your progress stays on this device.</p><div style="margin-top:18px"><button class="btn" onclick="openChapter(1)" style="background:white;color:#555fd0">Start learning →</button></div></div><div class="hero-korean">한국어</div></section>
<div class="stats"><div class="stat"><small>Completed chapters</small><strong>${done.length}/${DATA.chapters.length}</strong></div><div class="stat"><small>Vocabulary entries</small><strong>${allWords().length}</strong></div><div class="stat"><small>Saved words</small><strong>${savedWords().length}</strong></div><div class="stat"><small>Course progress</small><strong>${Math.round(done.length/DATA.chapters.length*100)}%</strong></div></div>
<div class="section-head"><div><h2>Continue your study</h2><p>Pick up where you left off.</p></div><button class="btn secondary small" onclick="setView('chapters')">All chapters</button></div>
<div class="chapter-grid">${DATA.chapters.slice(0,6).map(ch=>chapterCard(ch)).join("")}</div>
<div class="section-head"><div><h2>Quick access</h2><p>Review what you have learned.</p></div></div><div class="two-col"><div class="panel"><h3>Saved vocabulary</h3><p class="muted">${savedWords().length} words saved for later review.</p><button class="btn secondary small" onclick="setView('vocabulary')">Open vocabulary</button></div><div class="panel"><h3>Grammar album</h3><p class="muted">Review grammar patterns from your lessons.</p><button class="btn secondary small" onclick="setView('grammar')">Review grammar</button></div><div class="panel"><h3>Korean Culture & Stories</h3><p class="muted">${CULTURE.items.length} sayings, folktales, jokes and short stories.</p><button class="btn secondary small" onclick="setView('culture')">Explore culture</button></div><div class="panel"><h3>Daily Vocabulary</h3><p class="muted">${DAILY.words.length.toLocaleString()} independent vocabulary entries.</p><button class="btn secondary small" onclick="setView('daily')">Start daily review</button></div></div>`}
function chapterCard(ch){let done=completed().includes(ch.id);return `<article class="chapter-card" onclick="openChapter(${ch.id})"><div class="day">${esc(ch.day)} · ${ch.vocabulary.length} WORDS</div><h3>${esc(ch.title)}</h3><p>${esc(ch.title_ko)}</p><div class="card-bottom"><span>${done?"✓ Completed":"Not completed"}</span><span class="tag ${done?"done":""}">${done?"Done":"Open lesson"} →</span></div></article>`}
function chaptersView(){return `<div class="section-head"><div><h2>All chapters</h2><p>23 learning chapters · follow the November study plan.</p></div></div><div class="toolbar"><input class="field search" id="chapterSearch" placeholder="Search chapter..."><select class="field" id="chapterStatus"><option value="all">All chapters</option><option value="done">Completed</option><option value="todo">Not completed</option></select></div><div class="chapter-grid" id="chapterGrid">${DATA.chapters.map(ch=>chapterCard(ch)).join("")}</div>`}
function openChapter(id){currentChapter=Number(id);currentView="chapters";lessonView();$$(".nav-item[data-view]").forEach(b=>b.classList.toggle("active",b.dataset.view==="chapters"));$("#pageTitle").textContent=chapter(id).day+" · "+chapter(id).title;$("#sidebar").classList.remove("open");}
function lessonView(){let ch=chapter(currentChapter);$("#content").innerHTML=`<div class="lesson-head"><div><div class="eyebrow">${ch.day} · CHAPTER ${ch.id}</div><h2>${esc(ch.title)}</h2><div class="muted">${esc(ch.title_ko)} · ${ch.vocabulary.length} vocabulary words</div></div><div><button class="btn secondary small" onclick="setView('chapters')">← All chapters</button> <button class="btn small" onclick="toggleComplete(${ch.id})">${completed().includes(ch.id)?"✓ Completed":"Mark complete"}</button></div></div>
<div class="section-head"><div><h2>Vocabulary</h2><p>Learn the words before reading the lesson.</p></div><button class="btn secondary small" onclick="setView('vocabulary')">Vocabulary library</button></div><div class="vocab-grid">${ch.vocabulary.map(w=>wordCard(w,ch.id)).join("")}</div>
<div class="section-head"><div><h2>Grammar</h2><p>Simple patterns used in the conversation and passage.</p></div></div><div class="panel">${ch.grammar.map(g=>grammarItem(g)).join("")}</div>
<div class="section-head"><div><h2>Conversation</h2><p>Text-message style · up to three speakers.</p></div></div><div class="panel chat">${ch.conversation.map(m=>chatBubble(m,ch)).join("")}</div>${colorLegend()}
<div class="section-head"><div><h2>Reading passage</h2><p>Tap a Korean word to highlight it. Select a word to save it.</p></div></div><div class="panel"><div class="split-reading"><div class="reading-pane"><h4>KOREAN PASSAGE</h4>${highlightPassage(ch)}</div><div class="reading-pane english"><h4>ENGLISH TRANSLATION</h4>${esc(ch.passage.en)}</div></div><div class="reading-actions"><button class="btn secondary small" onclick="setView('reading')">Open reading practice</button><button class="btn secondary small" onclick="toggleComplete(${ch.id})">Mark ${completed().includes(ch.id)?"incomplete":"complete"}</button></div></div>`;
window.scrollTo(0,0);}
function wordCard(w,chId){let isSaved=savedWords().some(x=>x.ko===w.ko);return `<div class="word-card"><div class="word-top"><div><div class="ko">${esc(w.ko)}</div><div class="en">${esc(w.en)}</div><div class="roman">${esc(w.romanization)}</div></div><button class="save-word ${isSaved?"saved":""}" onclick="toggleWord('${esc(w.ko)}')" title="Save word">${isSaved?"★":"☆"}</button></div></div>`}
function grammarItem(g){return `<div class="grammar-item"><strong>${esc(g.name)} · ${esc(g.meaning)}</strong><p>${esc(g.rule)}</p>${(g.examples||[]).map(e=>`<p><b>${esc(e[0])}</b> — ${esc(e[1])}</p>`).join("")}</div>`}
function renderKoreanMarkup(markup,fallback,ch){
  // Apply inline colors as well as CSS classes so coding remains visible even
  // if a host page or cached stylesheet overrides the portal stylesheet.
  if(markup){
    return String(markup).replace(/<span class="kword ([^"]+)" title="([^"]*)">([^<]*)<\/span>/g,
      (match,classes,title,word)=>{
        const safe=esc(word);
        const styleParts=[];
        if(classes.split(/\s+/).includes("verb")) styleParts.push("color:#16803d;font-weight:700");
        if(classes.split(/\s+/).includes("conjunction")) styleParts.push("color:#b88700;font-weight:700");
        if(classes.split(/\s+/).includes("frequency")) styleParts.push("color:#9333ea;font-weight:700");
        if(classes.split(/\s+/).includes("chunk")) styleParts.push("text-decoration:underline dotted #7b83d8 1.5px;text-underline-offset:4px;background:rgba(123,131,216,.10);border-radius:3px;padding:0 1px");
        const inlineStyle=styleParts.length?` style="${styleParts.join(';')}"`:"";
        return `<span class="${esc(classes)}"${inlineStyle} title="${esc(title)}" data-word="${safe}" onclick="saveFromPassage('${safe}')">${safe}</span>`;
      });
  }
  return esc(fallback||"");
}
function colorLegend(){return `<div class="color-legend"><span><i class="legend-dot verb"></i>Verb</span><span><i class="legend-dot conjunction"></i>Conjunction</span><span><i class="legend-dot frequency"></i>Frequency adverb</span><span><i class="legend-underline"></i>Read together</span></div>`}
function chatBubble(m,ch){return `<div class="chat-row ${m.speaker==="B"?"me":""}"><div class="avatar">${m.speaker}</div><div class="bubble-wrap"><div class="speaker">${esc(m.name)}</div><div class="bubble">${renderKoreanMarkup(m.textHtml,m.text,ch)}</div><div class="bubble-en">${esc(m.en)}</div></div></div>`}
function highlightPassage(ch){return renderKoreanMarkup(ch.passage.koHtml,ch.passage.ko,ch)}
function vocabularyView(){let words=allWords();if(vocabChapter!=="all")words=words.filter(w=>w.chapterId===Number(vocabChapter));if(vocabSearch)words=words.filter(w=>(w.ko+w.en+w.romanization).toLowerCase().includes(vocabSearch.toLowerCase()));if(alphaFilter!=="all")words=words.filter(w=>w.ko.startsWith(alphaFilter));if(vocabSort==="alpha")words.sort((a,b)=>a.ko.localeCompare(b.ko,"ko"));else words.sort((a,b)=>a.chapterId-b.chapterId);return `<div class="section-head"><div><h2>Vocabulary library</h2><p>${words.length} words · save words for later review.</p></div><span class="pill">${savedWords().length} saved</span></div><div class="toolbar"><input class="field search" id="vocabSearch" placeholder="Search Korean, English or romanization..." value="${esc(vocabSearch)}"><select class="field" id="vocabChapter"><option value="all">All chapters</option>${DATA.chapters.map(c=>`<option value="${c.id}" ${String(vocabChapter)===String(c.id)?"selected":""}>${c.day}: ${esc(c.title)}</option>`).join("")}</select><select class="field" id="vocabSort"><option value="chapter" ${vocabSort==="chapter"?"selected":""}>Chapter order</option><option value="alpha" ${vocabSort==="alpha"?"selected":""}>Korean alphabetical</option></select></div><div class="alphabet">${"ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎ".split("").map(a=>`<button class="${alphaFilter===a?"active":""}" onclick="setAlpha('${a}')">${a}</button>`).join("")}<button class="${alphaFilter==="all"?"active":""}" onclick="setAlpha('all')">All</button></div><div class="section-head"><div><h2 style="font-size:14px">Word list</h2></div></div><div class="vocab-grid">${words.slice(0,300).map(w=>wordCard(w,w.chapterId)).join("")||'<div class="empty">No matching vocabulary found.</div>'}</div>${words.length>300?`<p class="muted">Showing first 300 results. Use filters to narrow the list.</p>`:""}`}
function setAlpha(a){alphaFilter=a;render()}
function grammarView(){let all=DATA.chapters.flatMap(c=>c.grammar.map(g=>({...g,day:c.day,title:c.title})));return `<div class="section-head"><div><h2>Grammar album</h2><p>All grammar patterns introduced across the course.</p></div><span class="pill">${all.length} grammar notes</span></div><div class="panel">${all.map(g=>`<div class="grammar-item"><div class="eyebrow">${g.day} · ${esc(g.title)}</div>${grammarItem(g)}</div>`).join("")}</div>`}
function conversationView(){return `<div class="section-head"><div><h2>Conversation library</h2><p>Practice Korean chat-style conversations by chapter.</p></div></div><div class="toolbar"><select class="field" id="conversationChapter">${DATA.chapters.map(c=>`<option value="${c.id}" ${c.id===currentChapter?"selected":""}>${c.day}: ${esc(c.title)}</option>`).join("")}</select></div><div id="conversationPanel" class="panel chat">${chapter(currentChapter).conversation.map(m=>chatBubble(m,chapter(currentChapter))).join("")}</div>${colorLegend()}`}
function readingView(){let ch=chapter(currentChapter);return `<div class="section-head"><div><h2>Reading practice</h2><p>Korean and English side by side. Tap Korean words to save them.</p></div></div><div class="toolbar"><select class="field" id="readingChapter">${DATA.chapters.map(c=>`<option value="${c.id}" ${c.id===currentChapter?"selected":""}>${c.day}: ${esc(c.title)}</option>`).join("")}</select><button class="btn secondary small" onclick="clearHighlights()">Clear highlights</button></div><div class="panel"><div class="split-reading"><div class="reading-pane"><h4>KOREAN · TAP WORDS TO SAVE</h4><div id="koreanReading">${highlightPassage(ch)}</div></div><div class="reading-pane english"><h4>ENGLISH</h4><div id="englishReading">${esc(ch.passage.en)}</div></div></div>${colorLegend()}<p class="muted" style="font-size:11px">Tap a highlighted word or expression to save it. Saved words are kept on this device.</p></div>`}
function quizView(){return `<div class="section-head"><div><h2>Quiz & flashcards</h2><p>Practice recalling Korean words from their English meanings.</p></div></div><div class="toolbar"><select class="field" id="quizChapter"><option value="all">All chapters</option>${DATA.chapters.map(c=>`<option value="${c.id}">${c.day}: ${esc(c.title)}</option>`).join("")}</select><select class="field" id="quizMode"><option value="typing">Type Korean from English</option><option value="flash">Flip cards</option></select><button class="btn" onclick="startQuiz()">Start practice</button></div><div id="quizArea" class="panel quiz-card"><div class="empty">Choose a chapter and practice mode, then press Start practice.</div></div>`}

function cultureView(){
 const items=CULTURE.items||[];
 if(!items.length) return `<div class="section-head"><div><h2>Korean Culture & Stories</h2><p>The culture data file is not available yet.</p></div></div><div class="panel"><p class="muted">Add your existing <b>culture.json</b> file to the same folder as index.html to restore this section. The rest of the portal is working.</p></div>`;
 return `<div class="section-head"><div><h2>Korean Culture & Stories</h2><p>Independent reading: sayings, proverbs, folktales, wordplay and short stories. These do not count toward chapter progress.</p></div><span class="word-count">${items.length} readings</span></div>
 <div class="toolbar"><input class="field search" id="cultureSearch" placeholder="Search title or story..."><select class="field" id="cultureType"><option value="all">All types</option><option value="proverb">Proverbs</option><option value="saying">Sayings</option><option value="folktale">Folktales</option><option value="joke">Korean jokes</option><option value="slogan">Slogans</option><option value="story">Short stories</option></select></div>
 <div class="culture-grid" id="cultureGrid">${items.map(cultureCard).join("")}</div>`;
}
function cultureCard(item){return `<article class="culture-card" onclick="openCulture('${item.id}')"><div class="culture-type">${esc(item.type)} · ${esc(item.level)}</div><h3>${esc(item.title)}</h3><p>${esc(item.subtitle)}</p><div class="card-bottom"><span>${item.vocab.length} vocabulary items</span><span>Read →</span></div></article>`}
function openCulture(id){
 const item=CULTURE.items.find(x=>x.id===id); if(!item)return;
 currentView="culture"; $("#pageTitle").textContent="Korean Culture & Stories";
 let p=esc(item.ko);
 item.vocab.slice().sort((a,b)=>b[0].length-a[0].length).forEach(v=>{let w=esc(v[0]);p=p.split(w).join(`<span class="new-word" onclick="saveFromPassage('${w}')">${w}</span>`)});
 $("#content").innerHTML=`<div class="lesson-head"><div><div class="eyebrow">KOREAN CULTURE · ${esc(item.type.toUpperCase())}</div><div class="culture-detail-title">${esc(item.title)}</div><div class="muted">${esc(item.subtitle)} · ${esc(item.level)}</div></div><button class="btn secondary small" onclick="setView('culture')">← All readings</button></div>
 <div class="panel" style="margin-top:18px"><div class="split-reading"><div class="reading-pane"><h4>KOREAN PASSAGE</h4>${p}</div><div class="reading-pane english"><h4>ENGLISH TRANSLATION</h4>${esc(item.en)}</div></div></div>
 <div class="section-head"><div><h2>Vocabulary from this reading</h2><p>Tap the star to save a word to your personal review list.</p></div></div><div class="vocab-grid">${item.vocab.map(v=>wordCard({ko:v[0],en:v[1],romanization:"",tags:["new"]},0)).join("")}</div>`;
 window.scrollTo(0,0);
}
function dailySet(){
 const words=DAILY.words||[];
 const now=new Date();
 const stamp=now.getFullYear()+"-"+(now.getMonth()+1)+"-"+now.getDate();
 const dayNo=Math.floor((new Date(now.getFullYear(),now.getMonth(),now.getDate())-new Date(now.getFullYear(),0,0))/86400000);
 if(!words.length) return {stamp,dayNo,items:[]};
 const count=Math.max(1,Number(DAILY.dailyCount)||20);
 const startIndex=((dayNo-1)*count)%words.length;
 return {stamp,dayNo,items:Array.from({length:Math.min(count,words.length)},(_,i)=>words[(startIndex+i)%words.length])};
}
function dailyView(){
 const set=dailySet();
 const cats=[...new Set(DAILY.words.map(w=>w.category))];
 if(!DAILY.words.length) return `<div class="section-head"><div><h2>Daily Vocabulary</h2><p>The daily vocabulary data file is not available yet.</p></div></div><div class="panel"><p class="muted">Add your existing <b>daily_vocabulary.json</b> file to the same folder as index.html to restore this section. The rest of the portal is working.</p></div>`;
 return `<div class="hero"><div><div class="eyebrow" style="color:#e0e2ff">A LITTLE KOREAN EVERY DAY</div><h2>오늘의 단어</h2><p>Daily vocabulary is separate from your chapter lessons. No homework, just explore and review.</p></div><div class="hero-korean">단어</div></div>
 <div class="stats"><div class="stat"><small>Total vocabulary entries</small><strong>${DAILY.words.length.toLocaleString()}+</strong></div><div class="stat"><small>Today's words</small><strong>${set.items.length}</strong></div><div class="stat"><small>Saved words</small><strong>${savedWords().length}</strong></div><div class="stat"><small>Today's date</small><strong style="font-size:17px">${set.stamp}</strong></div></div>
 <div class="section-head"><div><h2>Today's 20 words</h2><p>A fresh set is selected each calendar day. You can browse the full library below.</p></div><span class="word-count">DAY ${set.dayNo}</span></div>
 <div class="panel">${set.items.map(w=>dailyWordRow(w)).join("")}</div>
 <div class="section-head"><div><h2>Explore the full vocabulary library</h2><p>Search more than 1,500 words and useful expressions by category.</p></div></div>
 <div class="toolbar"><input class="field search" id="dailySearch" placeholder="Search Korean or English..."><select class="field" id="dailyCategory"><option value="all">All categories</option>${cats.map(c=>`<option>${esc(c)}</option>`).join("")}</select><select class="field" id="dailySort"><option value="ko">Korean alphabetical</option><option value="en">English alphabetical</option></select></div>
 <div class="section-head"><div><h2 id="dailyResultCount">${DAILY.words.length.toLocaleString()} entries</h2></div><span class="pill">Independent library</span></div><div class="panel" id="dailyResults">${DAILY.words.slice(0,100).map(dailyWordRow).join("")}<p class="muted">Showing first 100 entries. Search or choose a category to narrow the list.</p></div>`;
}
function dailyWordRow(w){let savedNow=savedWords().some(x=>x.ko===w.ko);return `<div class="daily-word"><div><div class="ko">${esc(w.ko)}</div><div class="en">${esc(w.en)}</div><div class="meta">${esc(w.romanization)} · ${esc(w.category)}${w.kind==="expression"?" · expression":""}</div></div><button class="save-word ${savedNow?"saved":""}" onclick="toggleWord('${esc(w.ko)}');this.classList.toggle('saved')" title="Save word">${savedNow?"★":"☆"}</button></div>`}
function filterDaily(){
 const q=($("#dailySearch")?.value||"").toLowerCase(),cat=$("#dailyCategory")?.value||"all",sort=$("#dailySort")?.value||"ko";
 let list=DAILY.words.filter(w=>(cat==="all"||w.category===cat)&&(`${w.ko} ${w.en} ${w.romanization}`).toLowerCase().includes(q));
 list.sort((a,b)=>sort==="en"?a.en.localeCompare(b.en):a.ko.localeCompare(b.ko,"ko"));
 $("#dailyResultCount").textContent=list.length.toLocaleString()+" entries";
 $("#dailyResults").innerHTML=list.slice(0,200).map(dailyWordRow).join("")+(list.length>200?`<p class="muted">Showing first 200 of ${list.length}. Refine your search for more.</p>`:"")||'<div class="empty">No words found.</div>';
}

function filterCulture(){let q=($("#cultureSearch")?.value||"").toLowerCase(),type=$("#cultureType")?.value||"all";let list=CULTURE.items.filter(x=>(type==="all"||x.type===type)&&(x.title+" "+x.subtitle+" "+x.ko).toLowerCase().includes(q));$("#cultureGrid").innerHTML=list.map(cultureCard).join("")||'<div class="empty">No readings found.</div>'}
function toggleComplete(id){let arr=completed();arr=arr.includes(id)?arr.filter(x=>x!==id):[...arr,id];setSaved("klp_completed",arr);updateProgress();lessonView()}
function toggleWord(ko){let arr=savedWords();let found=allWords().find(w=>w.ko===ko)||DAILY.words.find(w=>w.ko===ko);if(!found){for(const item of CULTURE.items){const v=item.vocab.find(x=>x[0]===ko);if(v){found={ko:v[0],en:v[1]};break}}}arr=arr.some(x=>x.ko===ko)?arr.filter(x=>x.ko!==ko):[...arr,{ko,en:found?.en||""}];setSaved("klp_saved_words",arr);if(currentView==="vocabulary")render();else if(currentView==="chapters")lessonView()}
function saveFromPassage(ko){toggleWord(ko);let el=[...$$("[data-word]")].find(x=>x.dataset.word===ko);if(el)el.classList.add("word-highlight")}
function clearHighlights(){$$("[data-word]").forEach(x=>x.classList.remove("word-highlight"))}
function setView(v){currentView=v;$("#sidebar").classList.remove("open");render();window.scrollTo(0,0)}
function bindDynamic(){
let cs=$("#chapterSearch");if(cs)cs.oninput=()=>{let q=cs.value.toLowerCase(),status=$("#chapterStatus").value;$("#chapterGrid").innerHTML=DATA.chapters.filter(c=>(c.title+c.day+c.title_ko).toLowerCase().includes(q)).filter(c=>status==="all"||(status==="done"?completed().includes(c.id):!completed().includes(c.id))).map(chapterCard).join("")};
let st=$("#chapterStatus");if(st)st.onchange=()=>cs.dispatchEvent(new Event("input"));
let vs=$("#vocabSearch");if(vs)vs.oninput=()=>{vocabSearch=vs.value;let pos=vs.selectionStart;render();let x=$("#vocabSearch");x.focus();x.setSelectionRange(pos,pos)};
let vc=$("#vocabChapter");if(vc)vc.onchange=()=>{vocabChapter=vc.value;render()};
let so=$("#vocabSort");if(so)so.onchange=()=>{vocabSort=so.value;render()};
let cc=$("#conversationChapter");if(cc)cc.onchange=()=>{currentChapter=Number(cc.value);$("#conversationPanel").innerHTML=chapter(currentChapter).conversation.map(m=>chatBubble(m,chapter(currentChapter))).join("")};
let rc=$("#readingChapter");if(rc)rc.onchange=()=>{currentChapter=Number(rc.value);$("#koreanReading").innerHTML=highlightPassage(chapter(currentChapter));$("#englishReading").textContent=chapter(currentChapter).passage.en};
let qm=$("#quizMode");if(qm)qm.onchange=()=>quizMode=qm.value;
let dq=$("#dailySearch");if(dq)dq.oninput=filterDaily;
let dc=$("#dailyCategory");if(dc)dc.onchange=filterDaily;
let ds=$("#dailySort");if(ds)ds.onchange=filterDaily;
let cq=$("#cultureSearch");if(cq)cq.oninput=filterCulture;
let ct=$("#cultureType");if(ct)ct.onchange=filterCulture;
}
function startQuiz(){let ch=$("#quizChapter").value;quizMode=$("#quizMode").value;quizItems=(ch==="all"?allWords():allWords().filter(w=>w.chapterId===Number(ch)));quizItems=quizItems.sort(()=>Math.random()-.5);quizIndex=0;revealed=false;showQuiz()}
function showQuiz(){let area=$("#quizArea"),w=quizItems[quizIndex];if(!w){area.innerHTML=`<div class="empty"><h3>Practice complete!</h3><p>You reviewed ${quizItems.length} words.</p><button class="btn" onclick="startQuiz()">Practice again</button></div>`;return}
if(quizMode==="flash"){area.innerHTML=`<div class="quiz-prompt">FLASHCARD ${quizIndex+1} / ${quizItems.length}</div><div class="quiz-answer">${revealed?esc(w.ko):esc(w.en)}</div><div class="muted">${revealed?esc(w.romanization):"Think of the Korean word, then flip the card."}</div><div style="display:flex;justify-content:center;gap:8px;margin-top:22px"><button class="btn secondary" onclick="revealed=!revealed;showQuiz()">${revealed?"Hide answer":"Flip card"}</button><button class="btn" onclick="quizIndex++;revealed=false;showQuiz()">Next →</button></div>`}
else{area.innerHTML=`<div class="quiz-prompt">TYPE THE KOREAN WORD · ${quizIndex+1} / ${quizItems.length}</div><div class="quiz-answer">${esc(w.en)}</div><input class="quiz-input" id="quizAnswer" placeholder="Type Korean here..." autocomplete="off"><div style="margin-top:13px"><button class="btn" onclick="checkAnswer()">Check answer</button> <button class="btn secondary" onclick="quizIndex++;showQuiz()">Skip</button></div><div id="quizFeedback"></div>`;$("#quizAnswer").focus();$("#quizAnswer").addEventListener("keydown",e=>{if(e.key==="Enter")checkAnswer()})}}
function checkAnswer(){let w=quizItems[quizIndex],val=$("#quizAnswer").value.trim().replace(/\s/g,""),correct=w.ko.replace(/\s/g,"");let good=val===correct;$("#quizFeedback").innerHTML=`<div class="feedback ${good?"good":"bad"}">${good?"Correct!":"Not quite. Correct answer: "+esc(w.ko)} ${w.romanization?"("+esc(w.romanization)+")":""}</div><button class="btn small" style="margin-top:10px" onclick="quizIndex++;showQuiz()">Next word →</button>`}
$("#mainNav").addEventListener("click",e=>{let b=e.target.closest("[data-view]");if(b)setView(b.dataset.view)});
$("#themeToggle").onclick=toggleTheme;$("#topTheme").onclick=toggleTheme;$("#menuToggle").onclick=()=>$("#sidebar").classList.toggle("open");
function toggleTheme(){let dark=document.documentElement.dataset.theme!=="dark";document.documentElement.dataset.theme=dark?"dark":"light";localStorage.setItem("klp_theme",dark?"dark":"light");$("#themeToggle").innerHTML=dark?"☀ <span>Light mode</span>":"☾ <span>Dark mode</span>";$("#topTheme").textContent=dark?"☀":"☾"}
async function loadJsonFile(fileName, required=false){
  const url=new URL(fileName, document.baseURI);
  url.searchParams.set("v", "20261112-3");
  try {
    const response=await fetch(url.href, {cache:"no-store"});
    if(!response.ok) throw new Error(`${fileName}: HTTP ${response.status}`);
    return await response.json();
  } catch(error) {
    if(required) throw error;
    console.warn(`Optional data file not loaded: ${fileName}`, error);
    return fileName==="culture.json" ? {items:[]} : {words:[],dailyCount:20};
  }
}
async function init(){
  try {
    DATA=await loadJsonFile("korea.json", true);
    if(!DATA || !Array.isArray(DATA.chapters) || !DATA.chapters.length) throw new Error("korea.json does not contain a valid chapters array.");
    const optional=await Promise.all([loadJsonFile("culture.json"),loadJsonFile("daily_vocabulary.json")]);
    CULTURE=optional[0] && Array.isArray(optional[0].items) ? optional[0] : {items:[]};
    DAILY=optional[1] && Array.isArray(optional[1].words) ? optional[1] : {words:[],dailyCount:20};
    const t=localStorage.getItem("klp_theme");
    if(t==="dark"){
      document.documentElement.dataset.theme="dark";
      $("#themeToggle").innerHTML="☀ <span>Light mode</span>";
      $("#topTheme").textContent="☀";
    }
    render();
  } catch(error) {
    console.error("Korean Learning Portal failed to start:", error);
    const message=esc(error.message||String(error));
    $("#content").innerHTML=`<div class="panel"><h2>Unable to load the Korean course data</h2><p>${message}</p><p class="muted">Check that <b>korea.json</b> is in the same published folder as index.html and that its filename uses lowercase letters.</p><button class="btn" onclick="location.reload()">Try again</button></div>`;
    $("#pageTitle").textContent="Loading error";
  }
}
init();