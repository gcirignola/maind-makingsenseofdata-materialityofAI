const dm=Object.fromEntries(D.map(d=>[d.id,d])),sm=Object.fromEntries(S.map(s=>[s.id,s]));
const hub={id:'hub',type:'hub',n:'Materialities of AI',r:32};
const nodes=[hub,...D.map(d=>({...d,type:'d',r:23})),...S.map(s=>({...s,type:'s',r:12,dim:s.p})),...K.map(k=>({...k,type:'k',r:7+(k.x?1:0),dim:sm[k.s].p}))];
const links=[];
D.forEach(d=>links.push({source:'hub',target:d.id,col:d.col,k:0}));
S.forEach(s=>links.push({source:s.p,target:s.id,col:dm[s.p].col,k:1}));
K.forEach(k=>{links.push({source:k.s,target:k.id,col:dm[sm[k.s].p].col,k:2});(k.x||[]).forEach(x=>links.push({source:x,target:k.id,col:dm[sm[x].p].col,k:3}))});
const svg=d3.select('#map'),root=svg.append('g');
svg.call(d3.zoom().scaleExtent([.4,3]).on('start',()=>hideCard()).on('zoom',e=>root.attr('transform',e.transform)));
let W=800,H=600;
function size(){const b=svg.node().getBoundingClientRect();W=b.width||800;H=b.height||600;hub.fx=W/2;hub.fy=H/2}
size();
const R=Math.min(W,H)*.32;
D.forEach((c,i)=>{const o=nodes.find(n=>n.id===c.id),a=i*2*Math.PI/5-Math.PI/2;o.x=W/2+R*Math.cos(a);o.y=H/2+R*Math.sin(a)});
nodes.filter(n=>n.type==='s').forEach(n=>{const p=nodes.find(x=>x.id===n.p);n.x=p.x+(Math.random()-.5)*140;n.y=p.y+(Math.random()-.5)*140});
nodes.filter(n=>n.type==='k').forEach(n=>{const p=nodes.find(x=>x.id===n.s);n.x=p.x+(Math.random()-.5)*60;n.y=p.y+(Math.random()-.5)*60});
const link=root.append('g').selectAll('line').data(links).join('line').attr('class','l').attr('stroke',d=>d.col).attr('stroke-dasharray',d=>d.k===3?'3 3':null);
const drag=d3.drag().on('start',(e,d)=>{hideCard();if(!e.active)sim.alphaTarget(.3).restart();d.fx=d.x;d.fy=d.y}).on('drag',(e,d)=>{d.fx=e.x;d.fy=e.y}).on('end',(e,d)=>{if(!e.active)sim.alphaTarget(0);if(d.id!=='hub'){d.fx=null;d.fy=null}});
const node=root.append('g').selectAll('g').data(nodes).join('g').attr('class',d=>'n '+d.type+(d.gap?' gap':'')+(d.re?' re':'')).call(drag)
 .on('click',(e,d)=>{e.stopPropagation();clickNode(e,d)})
 .on('mouseenter',(e,d)=>{hov=d;paint();if(canHover&&d.type==='k'&&!sticky)showCard(e.currentTarget,d,true)}).on('mouseleave',()=>{hov=null;paint();if(canHover&&!sticky)hideCard()});
node.append('circle').attr('r',d=>d.r).attr('fill',d=>d.type==='d'?d.col:d.type==='s'||d.type==='k'?dm[d.dim].col:null);
node.append('text').text(d=>d.n).attr('dy',d=>d.r+12);
svg.on('click',()=>{sel=null;sticky=false;hideCard();home();paint()});
const sim=d3.forceSimulation(nodes)
 .force('link',d3.forceLink(links).id(d=>d.id).distance(l=>[210,120,64,150][l.k]).strength(l=>[.5,.6,.7,.04][l.k]))
 .force('charge',d3.forceManyBody().strength(d=>({hub:-500,d:-520,s:-280,k:-70})[d.type]))
 .force('collide',d3.forceCollide().radius(d=>d.r+(d.type==='k'?18:12)))
 .on('tick',()=>{link.attr('x1',d=>d.source.x).attr('y1',d=>d.source.y).attr('x2',d=>d.target.x).attr('y2',d=>d.target.y);node.attr('transform',d=>`translate(${d.x},${d.y})`)});
new ResizeObserver(()=>{size();sim.alpha(.3).restart()}).observe(svg.node());
const on=new Set(D.map(d=>d.id));let sel=null,hov=null,reOnly=false;
const hasRe=id=>K.some(k=>(k.s===id||(k.x||[]).includes(id))&&k.re);
const vis=d=>d.type==='hub'||(d.type==='d'?on.has(d.id)&&(!reOnly||hasRe(d.id)):d.type==='s'?on.has(d.p)&&(!reOnly||hasRe(d.id)):(on.has(d.dim)||(d.x||[]).some(x=>on.has(sm[x].p)))&&(!reOnly||d.re));
function paint(){const h=hov||sel,nb=h?new Set([h.id,...links.filter(l=>l.source.id===h.id||l.target.id===h.id).flatMap(l=>[l.source.id,l.target.id])]):null;
 node.style('opacity',d=>!vis(d)?.08:nb&&!nb.has(d.id)?.15:1);
 link.style('opacity',l=>!(vis(l.source)&&vis(l.target))?.04:h&&l.source.id!==h.id&&l.target.id!==h.id?.05:.75)}
const chips=document.getElementById('chips');
D.forEach(c=>{const b=document.createElement('button');b.className='chip';b.setAttribute('aria-pressed','true');b.style.setProperty('--c',c.col);b.innerHTML='<i></i>'+c.n;
 b.onclick=()=>{on.has(c.id)?on.delete(c.id):on.add(c.id);b.setAttribute('aria-pressed',on.has(c.id));paint()};chips.appendChild(b)});
const rb=document.createElement('button');rb.className='chip re';rb.setAttribute('aria-pressed','false');rb.innerHTML='<i></i>Reverse-engineering cases only';
rb.onclick=()=>{reOnly=!reOnly;rb.setAttribute('aria-pressed',reOnly);paint()};chips.appendChild(rb);
const P=document.getElementById('panel'),card=document.getElementById('card'),stage=document.getElementById('stage');
const casesOf=id=>K.filter(k=>k.s===id||(k.x||[]).includes(id));
const btn=(id,t)=>`<button class="li" data-id="${id}">${t}</button>`;
const brief=d=>{const m=d.d.match(/^.*?[a-z0-9)%]\.(?=\s[A-Z]|$)/);return m?m[0]:d.d};
const lnk=d=>[[d.u,(d.gap?'Related source':'Open source')+': '+d.src],[d.u2,d.s2]].filter(x=>x[0]).map(x=>`<span class="lk"><a class="go" href="${x[0]}" target="_blank" rel="noopener noreferrer" data-u="${x[0]}">${x[1]}</a><button class="cp" type="button" data-u="${x[0]}">Copy link</button></span>`).join('');
function hideCard(){card.style.display='none'}
function showCard(el,d,tip){const sr=stage.getBoundingClientRect(),nr=el.getBoundingClientRect();card.style.pointerEvents=tip?'none':'auto';
 card.style.setProperty('--c',dm[d.dim].col);
 card.innerHTML=(tip?'':'<button class="x" aria-label="Close">&times;</button>')+`<h4>${d.n}</h4><p class="q">${d.t}</p><p>${brief(d)}</p>`+(tip?(d.u&&!d.gap?`<p class="q">Click the dot to open the source: ${d.src}</p>`:''):`<p>${lnk(d)}</p>`+(!canHover&&d.u&&!d.gap?`<p class="q">Tap the dot again to open the source site.</p>`:''));
 card.style.display='block';
 const w=card.offsetWidth,h=card.offsetHeight;let x=nr.right-sr.left+8,y=nr.top-sr.top-8;
 if(x+w>sr.width)x=nr.left-sr.left-w-8;x=Math.max(4,x);y=Math.max(4,Math.min(y,sr.height-h-4));
 card.style.left=x+'px';card.style.top=y+'px';const xb=card.querySelector('.x');if(xb)xb.onclick=hideCard}
const canHover=matchMedia('(hover:hover)').matches;let sticky=false;
function go(d,tap){sel=d;pick(d);paint();sticky=!canHover||!!tap;if(d.type==='k'&&(!canHover||tap))showCard(node.filter(n=>n.id===d.id).node(),d);else if(d.type!=='k')hideCard()}
function toast(m){let t=document.getElementById('toast');if(!t){t=document.createElement('div');t.id='toast';t.setAttribute('role','status');document.body.appendChild(t)}t.textContent=m;t.style.display='block';clearTimeout(t._h);t._h=setTimeout(()=>t.style.display='none',5000)}
function openSrc(u){let w=null;try{w=window.open(u,'_blank')}catch(_){}
 if(w){try{w.opener=null}catch(_){}return true}
 toast('The browser blocked the new tab. Use "Copy link" and paste it into the address bar.');return false}
function fallbackCopy(u,done){const t=document.createElement('textarea');t.value=u;t.style.cssText='position:fixed;opacity:0';document.body.appendChild(t);t.select();try{document.execCommand('copy');done()}catch(_){toast(u)}t.remove()}
function copyLink(u,b){const done=()=>{b.textContent='Copied';setTimeout(()=>b.textContent='Copy link',1500)};
 if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(u).then(done,()=>fallbackCopy(u,done));else fallbackCopy(u,done)}
document.addEventListener('click',e=>{const a=e.target.closest('a.go'),b=e.target.closest('.cp');
 if(a){e.preventDefault();openSrc(a.dataset.u)}else if(b){e.preventDefault();copyLink(b.dataset.u,b)}});
function clickNode(e,d){const again=sel===d,link=d.type==='k'&&d.u&&!d.gap;
 go(d,1);
 if(link&&(canHover||again))openSrc(d.u)}
function home(){P.innerHTML=`<h2>How to read this</h2><p>The centre is the main topic. Around it sit five dimensions, each split into sub-topics, with real cases at the edges: people, organizations and events that actually happened.</p><p>Hover a dot for a quick description, then click it to open the source site in a new tab (on touch screens, tap once for the summary and again to open). The side panel adds actors, details and the case's link to AI's materialization, including its economic side.</p><p class="q">${K.filter(k=>!k.gap).length} cases and ${K.filter(k=>k.gap).length} gaps. Ringed cases (${K.filter(k=>k.re).length}) are reverse engineering itself. Most evidence is press reporting or allegations, and each case carries a label.</p>`}
function pick(d){
 if(d.type==='hub'){home();return}
 let h;
 if(d.type==='d')h=`<h2 style="--c:${d.col}">${d.n}</h2><p>${d.d}</p><h3>Sub-topics</h3>`+S.filter(s=>s.p===d.id).map(s=>btn(s.id,`${s.n} (${casesOf(s.id).length})`)).join('');
 else if(d.type==='s')h=`<h2 style="--c:${dm[d.p].col}">${d.n}</h2><p class="q">${dm[d.p].n}</p><p>${d.d}</p><h3>Cases</h3>`+casesOf(d.id).map(k=>btn(k.id,k.n)).join('');
 else{const s=sm[d.s],c=dm[s.p];
  h=`<h2 style="--c:${c.col}">${d.n}</h2><p><span class="tag" style="--c:${c.col}">${c.n}</span><span class="tag">${s.n}</span>${(d.x||[]).map(x=>`<span class="tag" style="--c:${dm[sm[x].p].col}">${sm[x].n}</span>`).join('')}</p><p class="q">Evidence: ${d.t}</p><p>${brief(d)}</p><p>${lnk(d)}</p><h3>Details</h3><p>${d.d}</p>`+(d.w?`<h3>Actors</h3><p>${d.w}</p>`:'')+`<h3>Link to AI materialization</h3><p>${d.ai}</p>`}
 P.innerHTML=h;
 P.querySelectorAll('.li').forEach(b=>b.onclick=()=>go(nodes.find(n=>n.id===b.dataset.id),1));
}
home();paint();
