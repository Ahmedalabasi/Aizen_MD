const config = require('../config');
async function withTimeout(promise, ms){ let timer; try{return await Promise.race([promise,new Promise((_,rej)=>{timer=setTimeout(()=>rej(new Error('انتهت مهلة خدمة الذكاء الاصطناعي. حاول لاحقًا.')),ms);})]);}finally{if(timer)clearTimeout(timer);} }
async function ask(prompt){
 const q=String(prompt||'').trim(); if(!q)throw new Error('اكتب النص بعد الأمر.');
 try { const mod=require('algochat-ai'); const fn=mod.chat||mod.default?.chat; if(typeof fn==='function'){const r=await withTimeout(fn(q),config.AI_TIMEOUT_MS); if(r)return typeof r==='string'?r:JSON.stringify(r); } } catch(e){ if(e.message.includes('انتهت مهلة'))throw e; }
 try { const url='https://text.pollinations.ai/'+encodeURIComponent(q); const r=await withTimeout(fetch(url,{headers:{'accept':'text/plain'}}),config.AI_TIMEOUT_MS); if(!r.ok)throw new Error('خدمة الذكاء الاصطناعي غير متاحة الآن.'); return (await r.text()).trim()||'لم تصل إجابة من الخدمة.'; }
 catch(e){throw new Error('تعذر الاتصال بخدمات الذكاء الاصطناعي: '+e.message);}
}
module.exports={ask};
