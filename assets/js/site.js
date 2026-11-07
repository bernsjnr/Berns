/* Shared: giant wordmark fit (home) and copy-email (footer). */
(function(){
function fitGiant(){
  const el=document.getElementById('giant');if(!el)return;
  const box=el.parentElement.clientWidth;if(!box)return;
  el.style.fontSize='100px';
  const w=el.getBoundingClientRect().width;
  el.style.fontSize=(100*box/w*0.995)+'px';
}
fitGiant();
window.addEventListener('resize',fitGiant);
if(document.fonts&&document.fonts.ready){Promise.race([document.fonts.ready,new Promise(r=>setTimeout(r,1500))]).then(fitGiant)}

const copy=document.getElementById('copy');
if(copy)copy.addEventListener('click',e=>{
  const t='info@bernsds.com',btn=e.currentTarget;
  const done=()=>{btn.textContent='Copied';setTimeout(()=>btn.textContent='Copy email',1600)};
  const sel=()=>{const r=document.createRange();r.selectNodeContents(document.getElementById('email'));const s=getSelection();s.removeAllRanges();s.addRange(r);btn.textContent='Selected, press copy'};
  try{navigator.clipboard.writeText(t).then(done,sel)}catch(err){sel()}
});
})();
