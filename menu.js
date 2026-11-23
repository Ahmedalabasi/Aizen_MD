'use strict';
const sections = require('./sections');
function normalize(value){return String(value||'').replace(/^\s*\./,'').replace(/[\u064B-\u065F\u0670\u0640]/g,'').replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/\s+/g,' ').trim().toLowerCase();}
function main({user,mode,prefix,version,developerNumber,channel}){return `╭━━━〔 ✦ 𝐀𝐈𝐙𝐄𝐍 𝐌𝐃 ✦ 〕━━━┈⊷
┃╭──────────────────
┃│ الـمُـسـتـخـدم :❯ ${user}
┃│ الـوضـع :❯ ${mode}
┃│ الـبـادئـة :❯ ${prefix}
┃│ الإصـدار :❯ ${version}
┃╰──────────────────
╰━━━━━━━━━━━━━━━┈⊷

> أَهْـلا بــــڪ‌ فــي 𝐀𝐈𝐙𝐄𝐍 𝐌𝐃 .
> قـم بـارسـال القـســم او رقـــمــة مــن اسـفــل القــائـمــة بالـرد علـي الرسـالــة.
> او ارسـل امــر *.تنصيب* لـ اسـتـخـدام الـبـوت.

╭━━〔 ✦ قـائـمـة الاقـسـام ✦ 〕━━┈⊷
┃ 1.0 │ ◈ .قسم حماية بالمجموعة
┃ 2.0 │ ◈ .قسم الادارة
┃ 3.0 │ ◈ .قسم التحكم بالمجموعة
┃ 4.0 │ ◈ .قسم الذكاء الاصطناعي
┃ 5.0 │ ◈ .قسم الترفية والتسلية
┃ 6.0 │ ◈ .قسم التصميم والابداع
┃ 7.0 │ ◈ .قسم التنزيلات
┃ 8.0 │ ◈ .قسم الحالات
┃ 9.0 │ ◈ .قسم المالك والمطور
┃10.0│ ◈ .قسم الاعدادات والمساعدة
╰━━━━━━━━━━━━━━━┈⊷

━━━━━━━━━━━━━━━━
┃│ ◈ المطور : ⁨ـ اﺣﻣد اﻟ۶ﺑاسيᯓ¹⁰ .
┃│ ◈ رقم المطور : +${developerNumber}
┃│ ◈ قناة البوت : ${channel}
━━━━━━━━━━━━━━━━
> بواسطة ⁨ـ اﺣﻣد اﻟ۶ﺑاسيᯓ¹⁰ ©.`;}
function sectionText(index){const s=sections[index-1];return s?.text||null;}
function sectionFromText(text){const n=normalize(text);const i=sections.findIndex(s=>s.aliases.some(a=>normalize(a)===n));return i<0?null:i+1;}
module.exports={sections,main,sectionText,sectionFromText};
