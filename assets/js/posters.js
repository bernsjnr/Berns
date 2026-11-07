/* Poster data, placeholder artwork and cards. Replace draw() artwork with real files (see CLAUDE.md, next steps 2). */
(function(){
const C={blue:'#080CDF',ink:'#1A1A1A',paper:'#F3F1EC',stone:'#D6D2C8',white:'#FFFFFF'};
const TITLE="'scale-variable','Arial Black',Arial,sans-serif";
const BODY="'neue-haas-grotesk-text','Helvetica Neue',Helvetica,Arial,sans-serif";
const PW=1000,PH=1414;

function font(ctx,w,size,family,stretch){ctx.font=`${w} ${size}px ${family}`;try{ctx.fontStretch=stretch||'normal'}catch(e){}}
function fitSize(ctx,text,maxW,family,stretch){font(ctx,900,200,family,stretch);return 200*maxW/ctx.measureText(text).width}
function stack(ctx,lines,x,top,maxW,maxH,color,stretch){
  let sizes=lines.map(t=>fitSize(ctx,t,maxW,TITLE,stretch||'expanded'));
  const total=sizes.reduce((a,s)=>a+s*.84,0);if(total>maxH){const k=maxH/total;sizes=sizes.map(s=>s*k)}
  ctx.fillStyle=color;ctx.textBaseline='alphabetic';let y=top;
  lines.forEach((t,i)=>{font(ctx,900,sizes[i],TITLE,stretch||'expanded');y+=sizes[i]*.74;ctx.fillText(t,x,y);y+=sizes[i]*.1});
}
function foot(ctx,color,l,m,r){
  ctx.fillStyle=color;ctx.fillRect(60,1300,880,2);
  font(ctx,700,22,BODY);try{ctx.letterSpacing='3.5px'}catch(e){}
  ctx.textBaseline='alphabetic';ctx.textAlign='left';ctx.fillText(l,60,1352);
  ctx.textAlign='center';ctx.fillText(m,500,1352);ctx.textAlign='right';ctx.fillText(r,940,1352);
  ctx.textAlign='left';try{ctx.letterSpacing='0px'}catch(e){}
}

const POSTERS=[
 {id:'feel',name:'Make it feel like you',no:'01',draw(ctx){ctx.fillStyle=C.blue;ctx.fillRect(0,0,PW,PH);stack(ctx,['MAKE','IT FEEL','LIKE','YOU'],60,70,880,1150,C.white);foot(ctx,C.white,'BERNS','NO. 01','2026')}},
 {id:'duality',name:'Duality',no:'02',draw(ctx){ctx.fillStyle=C.paper;ctx.fillRect(0,0,PW,PH);
   ctx.fillStyle=C.blue;ctx.beginPath();ctx.arc(500,560,340,Math.PI,0);ctx.fill();
   ctx.fillStyle=C.ink;ctx.beginPath();ctx.arc(500,600,340,0,Math.PI);ctx.fill();
   ctx.fillStyle=C.paper;ctx.beginPath();ctx.arc(500,400,62,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(500,760,62,0,Math.PI*2);ctx.fill();
   stack(ctx,['DUALITY'],60,1040,880,220,C.ink);foot(ctx,C.ink,'BERNS','NO. 02','2026')}},
 {id:'smooth',name:'Slow is smooth',no:'03',draw(ctx){ctx.fillStyle=C.ink;ctx.fillRect(0,0,PW,PH);
   stack(ctx,['SLOW IS','SMOOTH.','SMOOTH IS','FAST.'],60,70,880,640,C.white);
   for(let i=0;i<8;i++){const y=780+i*62;ctx.fillStyle=C.white;ctx.fillRect(130,y,810,2);font(ctx,700,26,BODY);ctx.fillText(String(8-i),68,y+42)}
   ctx.fillRect(130,780+8*62,810,2);foot(ctx,C.white,'BERNS','NO. 03','2026')}},
 {id:'motion',name:'Motion',no:'04',draw(ctx){ctx.fillStyle=C.stone;ctx.fillRect(0,0,PW,PH);
   const st=['ultra-condensed','extra-condensed','condensed','semi-condensed','normal','semi-expanded','expanded'];
   st.forEach((s,i)=>{font(ctx,900,150,TITLE,s);ctx.fillStyle=i===6?C.blue:C.ink;ctx.fillText('MOTION',60,200+i*158)});
   foot(ctx,C.ink,'BERNS','DESIGN / MOTION','2026')}}
];

/* Example prices and options. Replace with real ones. */
const SIZES=[{id:'a3',label:'A3',mm:[297,420],price:45,frame:50},{id:'a2',label:'A2',mm:[420,594],price:70,frame:70},{id:'5070',label:'50 × 70 cm',mm:[500,700],price:90,frame:85}];
const FRAMES=[{id:'none',label:'Unframed',sw:C.white},{id:'black',label:'Black',sw:'#1A1A1A',col:'#1E1D1B',grain:'#000000'},{id:'oak',label:'Natural oak',sw:'#C9A77C',col:'#C9A77C',grain:'#9C7A50'},{id:'white',label:'White',sw:'#F4F4F2',col:'#F2F1ED',grain:'#DCD9D2'}];

const canvases={};
function art(p){if(!canvases[p.id]){const c=document.createElement('canvas');c.width=PW;c.height=PH;p.draw(c.getContext('2d'));canvases[p.id]=c}return canvases[p.id]}

/* Wait for the Adobe Fonts kit (max 1.5s) so artwork draws in the real faces */
const ready=(document.fonts&&document.fonts.load?Promise.race([
  Promise.all([document.fonts.load("900 100px 'scale-variable'"),document.fonts.load("700 20px 'neue-haas-grotesk-text'")].map(p=>p.catch(()=>{}))),
  new Promise(r=>setTimeout(r,1500))
]):Promise.resolve());

/* Poster cards: any element with data-poster-cards gets a card per poster (optionally data-exclude="id") */
function cards(){
  document.querySelectorAll('[data-poster-cards]').forEach(el=>{
    const skip=el.dataset.exclude;el.innerHTML='';
    POSTERS.filter(p=>p.id!==skip).forEach(p=>{
      const a=document.createElement('a');a.className='poster-card';a.href='/shop/'+p.id+'/';
      a.innerHTML=`<img alt="${p.name} poster" src="${art(p).toDataURL('image/jpeg',.82)}"><div class="row"><span class="h">${p.name}</span><span class="label">From £${SIZES[0].price}</span></div>`;
      el.appendChild(a);
    });
  });
}

window.Berns={C,TITLE,BODY,POSTERS,SIZES,FRAMES,art,ready};
ready.then(cards);
})();
