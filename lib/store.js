const fs = require('fs');
const path = require('path');
const config = require('../config');
const file = path.join(config.DATA_DIR, 'store.json');
function fresh(){ return { mode:'public', maintenance:false, prefix:config.PREFIX, language:'ar', groups:{}, warnings:{}, muted:{}, blocked:{}, users:{}, logs:[], violations:{}, stats:{messages:0,commands:0,startedAt:Date.now()}, statusSettings:{view:true,react:true,mode:'fixed',emoji:'❤️',custom:['🤍','❤️','💚'],random:false,configured:{view:false,react:false,mode:false}}, privateSettings:{} }; }
function load(){
  fs.mkdirSync(config.DATA_DIR,{recursive:true});
  if(!fs.existsSync(file)){ const d=fresh(); fs.writeFileSync(file,JSON.stringify(d,null,2)); return d; }
  try { const d=JSON.parse(fs.readFileSync(file,'utf8')); return Object.assign(fresh(),d,{groups:d.groups||{},warnings:d.warnings||{},muted:d.muted||{},blocked:d.blocked||{},users:d.users||{},logs:d.logs||[],violations:d.violations||{},stats:d.stats||fresh().stats,statusSettings:d.statusSettings||{view:true,react:true,mode:'fixed',emoji:'❤️',custom:['🤍','❤️','💚'],random:false,configured:{view:false,react:false,mode:false}},privateSettings:d.privateSettings||{}}); }
  catch(e){ console.error('تعذر قراءة store.json، سيتم استخدام بيانات جديدة:',e.message); return fresh(); }
}
let data=load(), timer=null, dirty=false;
function flush(){ if(!dirty)return; fs.mkdirSync(config.DATA_DIR,{recursive:true}); const tmp=file+'.tmp'; fs.writeFileSync(tmp,JSON.stringify(data)); fs.renameSync(tmp,file); dirty=false; }
function save(){ dirty=true; if(timer)clearTimeout(timer); timer=setTimeout(()=>{timer=null;try{flush();}catch(e){console.error('Store save:',e.message);}},2500); }
function log(text){ data.logs.push({at:new Date().toISOString(),text:String(text).slice(0,400)}); if(data.logs.length>100)data.logs.splice(0,data.logs.length-100); save(); }
process.on('beforeExit',()=>{if(timer)clearTimeout(timer);try{flush();}catch{}});
process.on('SIGINT',()=>{try{flush();}finally{process.exit(0);}});
process.on('SIGTERM',()=>{try{flush();}finally{process.exit(0);}});
module.exports={get:()=>data,save,flush,log};
