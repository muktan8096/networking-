
/* ============ utils ============ */
function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }
function logMsg(logEl, text){
  const p=document.createElement('div');
  p.className='logline';
  p.textContent=text;
  logEl.appendChild(p);
  logEl.scrollTop=logEl.scrollHeight;
}
function clearLog(logEl){ logEl.innerHTML=''; }
function moveDotThroughNodes(track, dot, nodeEls, stepDelay){
  stepDelay = stepDelay || 650;
  dot.classList.add('show');
  return new Promise(resolve=>{
    let i=0;
    function step(){
      if(i>=nodeEls.length){ resolve(); return; }
      const tr=track.getBoundingClientRect();
      const nr=nodeEls[i].getBoundingClientRect();
      dot.style.left=(nr.left-tr.left+nr.width/2)+'px';
      dot.style.top=(nr.top-tr.top+nr.height/2)+'px';
      i++;
      setTimeout(step, stepDelay);
    }
    step();
  });
}
function randInt(a,b){ return Math.floor(Math.random()*(b-a+1))+a; }

/* ============ theme toggle ============ */
const themeToggle=document.getElementById('themeToggle');
const htmlEl=document.documentElement;
const storageKey='networking-simulator-theme';
const readStateKey='networking-simulator-read';

function applyThemeIcon(){
  const t=htmlEl.getAttribute('data-theme');
  themeToggle.querySelector('.knob').textContent = t==='dark' ? '🌙':'☀️';
}

function setTheme(theme){
  htmlEl.setAttribute('data-theme', theme);
  localStorage.setItem(storageKey, theme);
  applyThemeIcon();
}

const savedTheme=localStorage.getItem(storageKey);
if(savedTheme){
  setTheme(savedTheme);
} else {
  const prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;
  setTheme(prefersDark ? 'dark' : 'light');
}

themeToggle.addEventListener('click', ()=>{
  const current=htmlEl.getAttribute('data-theme');
  setTheme(current==='dark' ? 'light' : 'dark');
});

/* ============ page routing (SPA) ============ */
function pageTitle(id){
  const names={home:'सुरुको पाना', t1:'नेटवर्क भनेको के हो', t2:'Google.com कसरी चल्छ', t3:'OSI मोडल', t4:'TCP/IP मोडल', t5:'IP बनाम MAC', t6:'Switch', t7:'Router', t8:'Packet को यात्रा', t9:'TCP बनाम UDP', t10:'VLAN', t11:'Subnetting', t12:'DNS, DHCP, NAT', quiz:'Quiz'};
  return names[id] || 'नेटवर्किङ सिमुलेटर';
}

function showPage(id){
  const safeId=id || 'home';
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  const target=document.getElementById('page-'+safeId) || document.getElementById('page-home');
  target.classList.add('active');
  document.querySelectorAll('.navlist a').forEach(a=>{
    a.classList.remove('active');
    a.removeAttribute('aria-current');
  });
  const navA=document.querySelector('.navlist a[data-target="'+safeId+'"]');
  if(navA){
    navA.classList.add('active');
    navA.setAttribute('aria-current','page');
  }
  document.querySelector('main').scrollTo(0,0);
  document.title=pageTitle(safeId)+' — नेटवर्किङ सिमुलेटर';
  history.replaceState(null,'','#'+safeId);
}

document.querySelectorAll('.navgo').forEach(a=>{
  a.addEventListener('click', e=>{
    e.preventDefault();
    showPage(a.dataset.target);
  });
});
window.addEventListener('hashchange', ()=>{
  showPage(location.hash.replace('#','')||'home');
});

document.querySelectorAll('button').forEach(btn=>{
  if(!btn.hasAttribute('type')) btn.type='button';
});

/* ============ mark-as-read progress ============ */
const totalTopics=12;
const readSet=new Set(JSON.parse(localStorage.getItem(readStateKey) || '[]'));
const progressFill=document.getElementById('progressFill');
const progressText=document.getElementById('progressText');
function updateProgress(){
  const n=readSet.size;
  progressFill.style.width=(n/totalTopics*100)+'%';
  progressText.textContent=n+' / '+totalTopics+' पूरा भयो';
  localStorage.setItem(readStateKey, JSON.stringify([...readSet]));
}

function syncReadButtons(){
  document.querySelectorAll('.mark-read').forEach(btn=>{
    const id=btn.dataset.topic;
    const navItem=document.querySelector('.navlist a[data-topic="'+id+'"]');
    if(readSet.has(id)){
      btn.classList.add('done'); btn.textContent='✓ पढियो';
      navItem && navItem.classList.add('done');
    } else {
      btn.classList.remove('done'); btn.textContent='○ पढिसकें';
      navItem && navItem.classList.remove('done');
    }
  });
}

document.querySelectorAll('.mark-read').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const id=btn.dataset.topic;
    if(readSet.has(id)){
      readSet.delete(id);
    } else {
      readSet.add(id);
    }
    syncReadButtons();
    updateProgress();
  });
});
syncReadButtons();
updateProgress();
showPage(location.hash.replace('#','')||'home');

/* ============ T1: Network ============ */
(function(){
  const cutBtn=document.getElementById('t1-cut');
  const castBtn=document.getElementById('t1-cast');
  const resetBtn=document.getElementById('t1-reset');
  const arrow1=document.getElementById('t1-cutarrow');
  const arrow2=document.getElementById('t1-cutarrow2');
  const log=document.getElementById('t1log');
  const dot=document.getElementById('t1dot');
  const track=document.getElementById('t1trackLAN');
  let cut=false;
  logMsg(log,'Simulator तयार छ। Button थिच्नुहोस्।');
  cutBtn.addEventListener('click', ()=>{
    cut=!cut;
    arrow1.classList.toggle('cut',cut);
    arrow2.classList.toggle('cut',cut);
    cutBtn.textContent = cut ? '🔌 Internet line जोड्नुहोस्' : '🔌 Internet line काट्नुहोस्';
    logMsg(log, cut ? '❌ Internet line काटियो — ISP सम्म संकेत पुग्दैन।' : '✅ Internet line फेरि जोडियो।');
  });
  castBtn.addEventListener('click', async ()=>{
    castBtn.disabled=true;
    const nodes=[document.getElementById('t1-phone'),document.getElementById('t1-router'),document.getElementById('t1-tv')];
    logMsg(log,'▶ Phone ले TV लाई video cast पठाउँदैछ...');
    await moveDotThroughNodes(track, dot, nodes, 550);
    dot.classList.remove('show');
    logMsg(log,'✅ Local network ले काम गर्‍यो! TV मा video देखियो — Internet चाहिएन।');
    if(cut) logMsg(log,'ℹ️ Internet अझै काटिएकै छ, त्यसैले YouTube जस्तो website भने खोल्न सकिँदैन।');
    castBtn.disabled=false;
  });
  resetBtn.addEventListener('click', ()=>{
    cut=false; arrow1.classList.remove('cut'); arrow2.classList.remove('cut');
    cutBtn.textContent='🔌 Internet line काट्नुहोस्';
    clearLog(log); logMsg(log,'Reset भयो।');
  });
})();

/* ============ T2: DNS Lookup ============ */
(function(){
  const goBtn=document.getElementById('t2-go');
  const resetBtn=document.getElementById('t2-reset');
  const input=document.getElementById('t2-domain');
  const log=document.getElementById('t2log');
  const track=document.getElementById('t2track');
  const dot=document.getElementById('t2dot');
  const nBrowser=document.getElementById('t2-browser');
  const nDns=document.getElementById('t2-dns');
  const nRouter=document.getElementById('t2-router');
  const nServer=document.getElementById('t2-server');
  const allNodes=[nBrowser,nDns,nRouter,nServer];
  function clearOn(){ allNodes.forEach(n=>n.classList.remove('on')); }
  function fakeIp(domain){
    let h=0; for(const c of domain) h=(h*31+c.charCodeAt(0))%223;
    return '142.'+(h%250)+'.'+randInt(1,254)+'.'+randInt(1,254);
  }
  goBtn.addEventListener('click', async ()=>{
    goBtn.disabled=true; clearLog(log); clearOn();
    const domain=(input.value||'google.com').trim();
    const ip=fakeIp(domain);
    logMsg(log,'1. Browser ले DNS Server लाई "'+domain+'" को IP सोध्छ');
    nBrowser.classList.add('on'); await moveDotThroughNodes(track,dot,[nBrowser,nDns],550);
    nDns.classList.add('on');
    await sleep(300);
    logMsg(log,'2. DNS ले फर्काउँछ: '+domain+' → '+ip);
    await moveDotThroughNodes(track,dot,[nDns,nRouter],550);
    nRouter.classList.add('on');
    logMsg(log,'3. Browser ले '+ip+' मा Router मार्फत request पठाउँछ');
    await moveDotThroughNodes(track,dot,[nRouter,nServer],550);
    nServer.classList.add('on');
    logMsg(log,'4. Server ले webpage response पठाउँछ — browser ले देखाउँछ ✅');
    dot.classList.remove('show');
    goBtn.disabled=false;
  });
  resetBtn.addEventListener('click', ()=>{
    clearLog(log); clearOn(); logMsg(log,'Reset भयो।');
  });
  logMsg(log,'Domain टाइप गरेर "Search गर्नुहोस्" थिच्नुहोस्।');
})();

/* ============ T3: OSI encapsulation ============ */
(function(){
  const LAYERS=[
    {n:7,name:'Application',s:'Message तयार पारियो',r:'Message पढियो'},
    {n:6,name:'Presentation',s:'Encrypt/format गरियो',r:'Decrypt गरियो'},
    {n:5,name:'Session',s:'Session maintain भयो',r:'Session जाँचियो'},
    {n:4,name:'Transport',s:'TCP ले टुक्रा पार्यो',r:'टुक्रा जोडियो (TCP)'},
    {n:3,name:'Network',s:'IP address थपियो',r:'IP address हेरियो'},
    {n:2,name:'Data Link',s:'MAC address थपियो',r:'MAC address हेरियो'},
    {n:1,name:'Physical',s:'Wi-Fi signal भएर उड्यो',r:'Wi-Fi signal प्राप्त भयो'}
  ];
  const senderCol=document.getElementById('t3-sender');
  const recvCol=document.getElementById('t3-receiver');
  senderCol.innerHTML = LAYERS.map(l=>'<div class="layer-row" id="t3-s'+l.n+'"><b>L'+l.n+'</b>'+l.name+'<small>'+l.s+'</small></div>').join('');
  const rev=[...LAYERS].reverse();
  recvCol.innerHTML = rev.map(l=>'<div class="layer-row" id="t3-r'+l.n+'"><b>L'+l.n+'</b>'+l.name+'<small>'+l.r+'</small></div>').join('');
  const log=document.getElementById('t3log');
  const dot=document.getElementById('t3dot');
  const grid=dot.parentElement;
  const goBtn=document.getElementById('t3-go');
  const resetBtn=document.getElementById('t3-reset');
  function allRows(){ return document.querySelectorAll('#t3-sender .layer-row, #t3-receiver .layer-row'); }
  goBtn.addEventListener('click', async ()=>{
    goBtn.disabled=true;
    clearLog(log); allRows().forEach(r=>r.classList.remove('on'));
    const msg=(document.getElementById('t3-msg').value||'Hello').trim();
    logMsg(log,'📨 पठाउने Message: "'+msg+'"');
    for(const l of LAYERS){
      const row=document.getElementById('t3-s'+l.n);
      row.classList.add('on');
      logMsg(log,'L'+l.n+' ('+l.name+'): '+l.s);
      await sleep(280);
    }
    logMsg(log,'📡 Physical layer बाट transmit भयो...');
    const lastSender=document.getElementById('t3-s1');
    const firstRecv=document.getElementById('t3-r1');
    await moveDotThroughNodes(grid, dot, [lastSender, firstRecv], 700);
    dot.classList.remove('show');
    for(const l of rev){
      const row=document.getElementById('t3-r'+l.n);
      row.classList.add('on');
      logMsg(log,'L'+l.n+' ('+l.name+'): '+l.r);
      await sleep(280);
    }
    logMsg(log,'✅ Receiver ले पूरा message "'+msg+'" पढ्यो!');
    goBtn.disabled=false;
  });
  resetBtn.addEventListener('click', ()=>{
    clearLog(log); allRows().forEach(r=>r.classList.remove('on')); logMsg(log,'Reset भयो।');
  });
  logMsg(log,'Message लेखेर "पठाउनुहोस्" थिच्नुहोस्।');
})();

/* ============ T4: TCP/IP 4 layers ============ */
(function(){
  const LAYERS=[
    {name:'Application Layer', proto:'HTTP, DNS, FTP, SMTP', desc:'HTTP request बन्छ — "मलाई feed देखाऊ"'},
    {name:'Transport Layer', proto:'TCP, UDP', desc:'TCP ले Facebook server सँग connection बनाउँछ'},
    {name:'Internet Layer', proto:'IP, ICMP', desc:'IP address हेरेर बाटो पत्ता लाग्छ'},
    {name:'Network Access Layer', proto:'Ethernet, Wi-Fi', desc:'Mobile data/Wi-Fi मार्फत signal भौतिक रूपमा पठाइन्छ'}
  ];
  const wrap=document.getElementById('t4-layers');
  wrap.innerHTML=LAYERS.map((l,i)=>'<div class="layer-row" id="t4-l'+i+'"><b>'+l.name+'</b> <span style="color:var(--amber)">'+l.proto+'</span><small>'+l.desc+'</small></div>').join('');
  const log=document.getElementById('t4log');
  const goBtn=document.getElementById('t4-go');
  const resetBtn=document.getElementById('t4-reset');
  goBtn.addEventListener('click', async ()=>{
    goBtn.disabled=true; clearLog(log);
    document.querySelectorAll('#t4-layers .layer-row').forEach(r=>r.classList.remove('on'));
    logMsg(log,'📱 Facebook app खोलियो...');
    for(let i=0;i<LAYERS.length;i++){
      document.getElementById('t4-l'+i).classList.add('on');
      logMsg(log,LAYERS[i].name+' → '+LAYERS[i].desc);
      await sleep(500);
    }
    logMsg(log,'✅ Feed load भयो!');
    goBtn.disabled=false;
  });
  resetBtn.addEventListener('click', ()=>{
    clearLog(log); document.querySelectorAll('#t4-layers .layer-row').forEach(r=>r.classList.remove('on')); logMsg(log,'Reset भयो।');
  });
  logMsg(log,'"Facebook खोल्नुहोस्" थिच्नुहोस्।');
})();

/* ============ T5: IP vs MAC ============ */
(function(){
  const ipEl=document.getElementById('t5-ip');
  const macEl=document.getElementById('t5-mac');
  const log=document.getElementById('t5log');
  const MAC='3C:97:0E:1A:B2:C4';
  const places={
    home:{ip:'192.168.1.15', label:'घर'},
    office:{ip:'192.168.5.22', label:'Office'},
    cafe:{ip:'10.20.30.44', label:'Cafe'}
  };
  function connect(key){
    const p=places[key];
    ipEl.textContent=p.ip;
    ipEl.classList.add('on');
    macEl.classList.remove('on');
    setTimeout(()=>ipEl.classList.remove('on'),600);
    logMsg(log, p.label+' को Wi-Fi मा जोडियो → नयाँ IP मिल्यो: '+p.ip+' | MAC उही नै रह्यो: '+MAC);
  }
  document.getElementById('t5-home').addEventListener('click', ()=>connect('home'));
  document.getElementById('t5-office').addEventListener('click', ()=>connect('office'));
  document.getElementById('t5-cafe').addEventListener('click', ()=>connect('cafe'));
  logMsg(log,'फरक-फरक Wi-Fi मा जोडेर IP बदलिने तर MAC नबदलिने हेर्नुहोस्।');
})();

/* ============ T6: Switch MAC table ============ */
(function(){
  const sendBtn=document.getElementById('t6-send');
  const resetBtn=document.getElementById('t6-reset');
  const log=document.getElementById('t6log');
  const track=document.getElementById('t6track');
  const dot=document.getElementById('t6dot');
  const tbody=document.getElementById('t6table');
  const pc1=document.getElementById('t6-pc1'), pc2=document.getElementById('t6-pc2'),
        pc3=document.getElementById('t6-pc3'), sw=document.getElementById('t6-switch');
  let learned=false;
  function setTable(){
    tbody.innerHTML = learned
      ? '<tr><td>PC1 MAC</td><td>Port 1</td></tr><tr><td>PC3 MAC</td><td>Port 3</td></tr>'
      : '<tr><td colspan="2" style="color:var(--text-dim)">— table खाली छ —</td></tr>';
  }
  sendBtn.addEventListener('click', async ()=>{
    sendBtn.disabled=true;
    if(!learned){
      logMsg(log,'PC1 → PC3: switch लाई PC3 कुन port मा छ थाहा छैन।');
      await moveDotThroughNodes(track,dot,[pc1,sw],500);
      pc2.classList.add('on'); pc3.classList.add('on');
      logMsg(log,'⚡ Flooding: सबै port मा पठाइयो (Port 2 र Port 3 दुवैमा)');
      await sleep(700);
      pc2.classList.remove('on');
      logMsg(log,'PC3 ले जवाफ फर्कायो → Switch ले "PC3 MAC = Port 3" table मा राख्यो ✅');
      await moveDotThroughNodes(track,dot,[pc3,sw],500);
      dot.classList.remove('show');
      pc3.classList.remove('on');
      learned=true; setTable();
      sendBtn.textContent='▶ फेरि PC1 → PC3 पठाउनुहोस्';
    } else {
      logMsg(log,'PC1 → PC3: यसपल्ट switch लाई थाहा छ, direct मात्र port 3 मा पठायो — flooding चाहिएन।');
      pc3.classList.add('on');
      await moveDotThroughNodes(track,dot,[pc1,sw,pc3],500);
      dot.classList.remove('show');
      pc3.classList.remove('on');
      logMsg(log,'✅ PC2 को bandwidth र privacy दुवै जोगियो — उसले यो traffic देख्दैन।');
    }
    sendBtn.disabled=false;
  });
  resetBtn.addEventListener('click', ()=>{
    learned=false; setTable(); clearLog(log);
    sendBtn.textContent='▶ PC1 → PC3 पठाउनुहोस्';
    logMsg(log,'Table मेटियो। फेरि सुरुदेखि हेर्नुहोस्।');
  });
  setTable();
  logMsg(log,'"PC1 → PC3 पठाउनुहोस्" थिचेर flooding हेर्नुहोस्, अनि फेरि थिचेर direct forwarding हेर्नुहोस्।');
})();

/* ============ T7: Router ============ */
(function(){
  const goBtn=document.getElementById('t7-go');
  const resetBtn=document.getElementById('t7-reset');
  const log=document.getElementById('t7log');
  const track=document.getElementById('t7track');
  const dot=document.getElementById('t7dot');
  const a=document.getElementById('t7-a'), r=document.getElementById('t7-router'), b=document.getElementById('t7-b');
  const row1=document.getElementById('t7row1'), row2=document.getElementById('t7row2');
  goBtn.addEventListener('click', async ()=>{
    goBtn.disabled=true;
    logMsg(log,'KTM Host ले Pokhara Host लाई packet पठायो (destination: 10.10.10.0/24)');
    row1.classList.remove('on'); row2.classList.remove('on');
    await moveDotThroughNodes(track,dot,[a,r],550);
    r.classList.add('on');
    logMsg(log,'📡 Router ले routing table हेर्‍यो...');
    await sleep(400);
    row2.classList.add('on');
    logMsg(log,'✅ Table मा भेटियो: 10.10.10.0/24 → Directly Connected');
    await moveDotThroughNodes(track,dot,[r,b],550);
    dot.classList.remove('show'); r.classList.remove('on');
    logMsg(log,'📬 Packet Pokhara Host सम्म सफलतापूर्वक पुग्यो!');
    goBtn.disabled=false;
  });
  resetBtn.addEventListener('click', ()=>{
    clearLog(log); row1.classList.remove('on'); row2.classList.remove('on'); logMsg(log,'Reset भयो।');
  });
  logMsg(log,'"Packet पठाउनुहोस्" थिचेर routing हेर्नुहोस्।');
})();

/* ============ T8: Packet journey / traceroute ============ */
(function(){
  const goBtn=document.getElementById('t8-go');
  const resetBtn=document.getElementById('t8-reset');
  const log=document.getElementById('t8log');
  const track=document.getElementById('t8track');
  const dot=document.getElementById('t8dot');
  const nodes=[1,2,3,4,5,6].map(i=>document.getElementById('t8-'+i));
  const hops=[
    {name:'PC (तिमी)', ip:'192.168.1.15'},
    {name:'Switch', ip:'192.168.1.1'},
    {name:'Home Router', ip:'192.168.1.1'},
    {name:'ISP Exchange', ip:'103.'+randInt(10,250)+'.4.1'},
    {name:'Internet Backbone', ip:'72.14.'+randInt(200,250)+'.1'},
    {name:'Google Server', ip:'142.250.'+randInt(1,250)+'.'+randInt(1,250)}
  ];
  goBtn.addEventListener('click', async ()=>{
    goBtn.disabled=true; clearLog(log);
    nodes.forEach(n=>n.classList.remove('on'));
    logMsg(log,'▶ tracert google.com चलाइँदैछ...');
    for(let i=0;i<nodes.length;i++){
      await moveDotThroughNodes(track,dot,[nodes[i]],450);
      nodes[i].classList.add('on');
      const ms=(i+1)*randInt(8,25);
      logMsg(log,'Hop '+(i+1)+': '+hops[i].name+' ('+hops[i].ip+') — '+ms+' ms');
      await sleep(150);
    }
    dot.classList.remove('show');
    logMsg(log,'✅ Google Server सम्म पुग्यो — कुल समय १ सेकेन्ड भन्दा पनि कम!');
    goBtn.disabled=false;
  });
  resetBtn.addEventListener('click', ()=>{
    clearLog(log); nodes.forEach(n=>n.classList.remove('on')); logMsg(log,'Reset भयो।');
  });
  logMsg(log,'"Traceroute सुरु गर्नुहोस्" थिच्नुहोस्।');
})();

/* ============ T9: TCP vs UDP ============ */
(function(){
  const tcpBtn=document.getElementById('t9-tcp');
  const udpBtn=document.getElementById('t9-udp');
  const resetBtn=document.getElementById('t9-reset');
  const log=document.getElementById('t9log');
  const track=document.getElementById('t9track');
  const dot=document.getElementById('t9dot');
  const a=document.getElementById('t9-a'), b=document.getElementById('t9-b');
  tcpBtn.addEventListener('click', async ()=>{
    tcpBtn.disabled=true; udpBtn.disabled=true; clearLog(log);
    logMsg(log,'🏦 Banking app: TCP connection बनाउँदैछ (3-way handshake)...');
    await moveDotThroughNodes(track,dot,[a,b],500); logMsg(log,'→ SYN पठायो');
    await moveDotThroughNodes(track,dot,[b,a],500); logMsg(log,'← SYN-ACK फर्कियो');
    await moveDotThroughNodes(track,dot,[a,b],500); logMsg(log,'→ ACK पठायो — connection बन्यो ✅');
    for(let i=1;i<=3;i++){
      await moveDotThroughNodes(track,dot,[a,b],450);
      logMsg(log,'→ Data packet '+i+' पठायो (रकम: Rs. '+(i*1000)+')');
      await moveDotThroughNodes(track,dot,[b,a],450);
      logMsg(log,'← ACK: packet '+i+' सही ठाउँमा पुग्यो');
    }
    dot.classList.remove('show');
    logMsg(log,'✅ पूरै रकम सही र सुरक्षित transfer भयो — एउटै byte हराएन।');
    tcpBtn.disabled=false; udpBtn.disabled=false;
  });
  udpBtn.addEventListener('click', async ()=>{
    tcpBtn.disabled=true; udpBtn.disabled=true; clearLog(log);
    logMsg(log,'📹 Video call: UDP ले handshake नगरी सीधै frame पठाउँदैछ...');
    for(let i=1;i<=5;i++){
      const dropped = i===3;
      await moveDotThroughNodes(track,dot,[a,b],320);
      if(dropped){ logMsg(log,'✗ Frame '+i+' बाटोमै हरायो — तर पर्खिएन, call जारी छ'); }
      else{ logMsg(log,'→ Frame '+i+' पुग्यो (कुनै ACK चाहिएन)'); }
    }
    dot.classList.remove('show');
    logMsg(log,'✅ Call चालु नै रह्यो — एक frame हराए पनि थोरै lag देखियो मात्र, call रोकिएन।');
    tcpBtn.disabled=false; udpBtn.disabled=false;
  });
  resetBtn.addEventListener('click', ()=>{ clearLog(log); logMsg(log,'Reset भयो।'); });
  logMsg(log,'TCP र UDP दुवै चलाएर भिन्नता तुलना गर्नुहोस्।');
})();

/* ============ T10: VLAN ============ */
(function(){
  const goBtn=document.getElementById('t10-go');
  const resetBtn=document.getElementById('t10-reset');
  const fromSel=document.getElementById('t10-from');
  const toSel=document.getElementById('t10-to');
  const log=document.getElementById('t10log');
  function vlanOf(name){ return name.split('-')[0]; }
  goBtn.addEventListener('click', ()=>{
    const from=fromSel.value, to=toSel.value;
    const same=vlanOf(from)===vlanOf(to);
    if(from===to){ logMsg(log,'⚠️ एउटै device छान्नुभयो — फरक device छान्नुहोस्।'); return; }
    if(same){
      logMsg(log,'✅ '+from+' → '+to+': दुवै उही VLAN मा छन् — Access मिल्यो!');
    } else {
      logMsg(log,'🚫 '+from+' → '+to+': फरक VLAN — Blocked! (जस्तै Finance ले HR को PC access गर्न खोज्दा)');
    }
  });
  resetBtn.addEventListener('click', ()=>{ clearLog(log); logMsg(log,'Reset भयो।'); });
  logMsg(log,'दुई device छानेर "Access प्रयास गर्नुहोस्" थिच्नुहोस्।');
})();

/* ============ T11: Subnetting ============ */
(function(){
  const buttons=document.querySelectorAll('.t11-btn');
  const countEl=document.getElementById('t11-count');
  const usableEl=document.getElementById('t11-usable');
  const blocksEl=document.getElementById('t11-blocks');
  function render(prefix){
    const blockSize=Math.pow(2,32-prefix);
    const numSubnets=Math.max(1,Math.floor(256/blockSize));
    const usable = prefix>=31 ? blockSize : blockSize-2;
    countEl.textContent=numSubnets;
    usableEl.textContent=usable;
    let html='';
    for(let i=0;i<numSubnets;i++){
      const start=i*blockSize;
      const end=start+blockSize-1;
      html+='<div class="subnet-block"><span>Subnet '+(i+1)+': 192.168.1.'+start+'/'+prefix+'</span><span style="color:var(--text-dim)">192.168.1.'+start+' – 192.168.1.'+end+'</span></div>';
    }
    blocksEl.innerHTML=html;
  }
  buttons.forEach(b=>{
    b.addEventListener('click', ()=>{
      buttons.forEach(x=>x.classList.remove('primary'));
      b.classList.add('primary');
      render(parseInt(b.dataset.p));
    });
  });
  render(25);
})();

/* ============ T12: DHCP -> DNS -> NAT ============ */
(function(){
  const dhcpBtn=document.getElementById('t12-dhcp');
  const dnsBtn=document.getElementById('t12-dns');
  const natBtn=document.getElementById('t12-nat');
  const resetBtn=document.getElementById('t12-reset');
  const log=document.getElementById('t12log');
  let privateIp=null;
  dhcpBtn.addEventListener('click', ()=>{
    privateIp='192.168.1.'+randInt(10,99);
    logMsg(log,'📶 Phone ले Router (DHCP) लाई IP मागेको छ...');
    logMsg(log,'✅ DHCP ले automatic IP दियो: '+privateIp);
    dhcpBtn.disabled=true; dnsBtn.disabled=false;
  });
  dnsBtn.addEventListener('click', ()=>{
    const fakeIp='157.240.'+randInt(1,250)+'.'+randInt(1,250);
    logMsg(log,'🔍 Facebook app खोल्दा DNS लाई facebook.com को IP सोधियो...');
    logMsg(log,'✅ DNS ले फर्कायो: facebook.com → '+fakeIp);
    dnsBtn.disabled=true; natBtn.disabled=false;
  });
  natBtn.addEventListener('click', ()=>{
    const publicIp='103.'+randInt(1,250)+'.'+randInt(1,250)+'.'+randInt(1,250);
    logMsg(log,'🌐 Request घर बाहिर internet मा जाँदैछ...');
    logMsg(log,'✅ NAT ले '+privateIp+' (private) लाई '+publicIp+' (public, ISP दिएको) मा बदलिदियो');
    logMsg(log,'ℹ️ घरका ५ वटै device बाहिरबाट हेर्दा एउटै Public IP मार्फत देखिन्छन्।');
    natBtn.disabled=true;
  });
  resetBtn.addEventListener('click', ()=>{
    privateIp=null; clearLog(log);
    dhcpBtn.disabled=false; dnsBtn.disabled=true; natBtn.disabled=true;
    logMsg(log,'Reset भयो। "DHCP: IP माग्नुहोस्" बाट सुरु गर्नुहोस्।');
  });
  logMsg(log,'क्रमैसँग 1️⃣ → 2️⃣ → 3️⃣ थिच्नुहोस्।');
})();

/* ============ Quiz (reused) ============ */
const QUESTIONS=[
  {q:"1. Network भनेको के हो?", options:["एउटा मात्र device जसले data बनाउँछ","दुई वा दुईभन्दा बढी devices जोडिएर data आदानप्रदान गर्ने प्रणाली","Internet चलाउने कम्पनी","एउटा website"], correct:1},
  {q:"2. Browser मा google.com टाइप गर्दा सबैभन्दा पहिले कुन काम हुन्छ?", options:["Router ले सीधै webpage देखाउँछ","Google server ले automatic IP दिन्छ","Browser ले DNS Server लाई google.com को IP सोध्छ","Switch ले MAC table बनाउँछ"], correct:2},
  {q:"3. OSI Model मा IP addressing कुन तहमा हुन्छ?", options:["Application (7)","Transport (4)","Network (3)","Physical (1)"], correct:2},
  {q:"4. TCP/IP Model मा HTTP, DNS, FTP कुन तहमा पर्छन्?", options:["Network Access Layer","Internet Layer","Transport Layer","Application Layer"], correct:3},
  {q:"5. MAC Address को बारेमा कुन कुरा सही हो?", options:["यो network फेरिँदा बदलिन्छ","यो device को physical/hardware address हो, बदलिँदैन","यो DHCP सर्भरले दिन्छ","यो domain नाम हो"], correct:1},
  {q:"6. Switch ले frame कसरी पठाउँछ?", options:["सबै port मा एकैचोटि पठाउँछ","MAC Address Table हेरेर सही port मा मात्र पठाउँछ","Random port मा पठाउँछ","DNS लाई सोधेर पठाउँछ"], correct:1},
  {q:"7. Router को मुख्य काम के हो?", options:["फरक-फरक network हरूलाई जोड्ने र IP अनुसार packet forward गर्ने","MAC address table बनाउने","Domain नाम IP मा बदल्ने","Broadcast domain छुट्याउने मात्र"], correct:0},
  {q:"8. PC बाट Google सम्मको सही यात्रा क्रम कुन हो?", options:["PC → Router → Switch → ISP → Google","PC → Switch → Router → ISP → Internet → Google","PC → Internet → Switch → Google","PC → ISP → PC → Google"], correct:1},
  {q:"9. TCP मा connection बनाउन प्रयोग हुने 3-way handshake क्रम कुन हो?", options:["ACK → SYN → SYN-ACK","SYN → SYN-ACK → ACK","SYN-ACK → SYN → ACK","ACK → ACK → SYN"], correct:1},
  {q:"10. VLAN ले मुख्यतया के गर्छ?", options:["Internet को speed बढाउँछ","एउटै physical switch लाई logically अलग-अलग network मा बाँड्छ","IP address लाई MAC मा बदल्छ","DNS server चलाउँछ"], correct:1},
  {q:"11. 192.168.1.0/24 लाई /25 मा subnet गर्दा कति usable address प्रति subnet हुन्छ?", options:["256","128","126","64"], correct:2},
  {q:"12. Private IP लाई Internet मा जाँदा Public IP मा बदल्ने काम कुनले गर्छ?", options:["DNS","DHCP","VLAN","NAT"], correct:3}
];
const form=document.getElementById('quizForm');
QUESTIONS.forEach((item,qi)=>{
  const card=document.createElement('div');
  card.className='qcard';
  card.innerHTML=`
    <div class="qnum">प्रश्न ${qi+1} / ${QUESTIONS.length}</div>
    <div class="qtext">${item.q}</div>
    <div class="options">
      ${item.options.map((opt,oi)=>`
        <label class="opt" data-q="${qi}" data-o="${oi}">
          <input type="radio" name="q${qi}" value="${oi}">
          <span>${opt}</span>
        </label>
      `).join('')}
    </div>`;
  form.appendChild(card);
});
const submitBtn=document.getElementById('submitBtn');
const retryBtn=document.getElementById('retryBtn');
const scoreBox=document.getElementById('scoreBox');
const scoreNum=document.getElementById('scoreNum');
const scoreRemark=document.getElementById('scoreRemark');
function checkAllAnswered(){
  const answered=QUESTIONS.every((_,qi)=>form.querySelector(`input[name="q${qi}"]:checked`));
  submitBtn.disabled=!answered;
}
form.addEventListener('change', checkAllAnswered);
submitBtn.addEventListener('click', ()=>{
  let score=0;
  QUESTIONS.forEach((item,qi)=>{
    const selected=form.querySelector(`input[name="q${qi}"]:checked`);
    const selectedVal=selected?parseInt(selected.value):-1;
    const labels=form.querySelectorAll(`.opt[data-q="${qi}"]`);
    labels.forEach(label=>{
      const oi=parseInt(label.dataset.o);
      label.classList.add('disabled');
      if(oi===item.correct) label.classList.add('correct');
      else if(oi===selectedVal) label.classList.add('wrong');
    });
    if(selectedVal===item.correct) score++;
  });
  scoreNum.textContent=`${score} / ${QUESTIONS.length}`;
  let remark;
  if(score===QUESTIONS.length) remark="उत्कृष्ट! तिमीले सबै networking concept राम्ररी बुझेका छौ।";
  else if(score>=9) remark="राम्रो! थोरै topic फेरि हेर्नुहोस्।";
  else if(score>=6) remark="ठीकै छ, माथिका notes फेरि पढेर अभ्यास गर्नुहोस्।";
  else remark="फिक्री नगर्नुहोस् — notes फेरि पढेर एक पटक फेरि प्रयास गर्नुहोस्।";
  scoreRemark.textContent=remark;
  scoreBox.style.display='block';
  submitBtn.style.display='none';
  retryBtn.style.display='inline-block';
  scoreBox.scrollIntoView({behavior:'smooth', block:'center'});
});
retryBtn.addEventListener('click', ()=>{
  form.reset();
  form.querySelectorAll('.opt').forEach(el=>el.classList.remove('correct','wrong','disabled'));
  scoreBox.style.display='none';
  submitBtn.style.display='inline-block';
  retryBtn.style.display='none';
  submitBtn.disabled=true;
});
