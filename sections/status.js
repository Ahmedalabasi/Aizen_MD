'use strict';

const section = {
  title: "قِـسـم الـحـالات",
  aliases: ["قسم الحالات", "الحالات"],
  text: "╭━━〔 ✦ قِـسـم الـحـالات ✦ 〕━━┈⊷\n┃│ ◈ .مشاهدة_تشغيل\n┃│ ◈ .مشاهدة_ايقاف\n┃│ └ تشغيل/ايقاف مشاهدة الحالات\n┃│ ◈ .تفاعل_تشغيل\n┃│ ◈ .تفاعل_ايقاف \n┃│ └ تشغيل/ايقاف تفاعل الحالات\n┃│ ◈ .ايموجي_التفاعل ❤️\n┃│ └ تغيير تفاعل الحالة\n┃│ ◈ .ايموجي_مخصص \n┃│ └مثال : .ايموجي_مخصص 🤍,❤️,💚\n┃│ ◈ .تفاعل_عشوائي \n┃│ └ تفاعل عشوائي ع الحالات \n╰━━━━━━━━━━━━━━━┈⊷\n\n━━━━━━━━━━━━━━━━\n> بواسطة ⁨ـ اﺣﻣد اﻟ۶ﺑاسيᯓ¹⁰ ©."
};


const RANDOM_EMOJIS = ['❤️','🤍','💚','💙','💜','🔥','😍','😂','✨','👍'];
const seenStatuses = new Map();

function defaults() {
  return {
    view: true,
    react: true,
    mode: 'fixed', // random | fixed | custom
    emoji: '❤️',
    custom: ['🤍','❤️','💚'],
    configured: { view: false, react: false, mode: false }
  };
}

function normalizeSettings(current) {
  const d = defaults();
  if (!current || typeof current !== 'object') return d;
  const configured = current.configured || { view: false, react: false, mode: false };
  const result = {
    ...d,
    ...current,
    configured: { ...d.configured, ...configured },
    custom: Array.isArray(current.custom) && current.custom.length ? current.custom : d.custom
  };
  // Upgrade settings created by the earlier version, whose false values were defaults.
  if (!current.configured) {
    result.view = true;
    result.react = true;
    const oldCustom = Array.isArray(current.custom) ? current.custom : [];
    const defaultCustom = ['🤍','❤️','💚'];
    const hasCustomOverride = oldCustom.length && JSON.stringify(oldCustom) !== JSON.stringify(defaultCustom);
    result.mode = current.random ? 'random' : hasCustomOverride ? 'custom' : 'fixed';
  } else if (!result.mode) {
    result.mode = current.random ? 'random' : 'fixed';
  }
  // Keep the default reaction fixed to the requested red heart unless the user explicitly chose a mode.
  if (result.configured && result.configured.mode === false) {
    result.mode = 'fixed';
    result.emoji = current.emoji || '❤️';
  }
  if (!['random', 'fixed', 'custom'].includes(result.mode)) result.mode = 'random';
  result.random = result.mode === 'random'; // legacy compatibility
  return result;
}

function saveSettings(store, settings) {
  settings.random = settings.mode === 'random';
  store.get().statusSettings = settings;
  store.save();
}

async function handleCommand({ cmd, arg, reply, store, prefix }) {
  const commands = ['مشاهدة_تشغيل','مشاهدة_ايقاف','تفاعل_تشغيل','تفاعل_ايقاف','ايموجي_التفاعل','ايموجي_مخصص','تفاعل_عشوائي'];
  if (!commands.includes(cmd)) return false;
  const x = normalizeSettings(store.get().statusSettings);
  if (cmd === 'مشاهدة_تشغيل' || cmd === 'مشاهدة_ايقاف') {
    x.view = cmd === 'مشاهدة_تشغيل';
    x.configured.view = true;
    await reply(x.view ? 'تم تشغيل مشاهدة الحالات.' : 'تم إيقاف مشاهدة الحالات.');
  } else if (cmd === 'تفاعل_تشغيل') {
    x.react = true;
    if (!x.mode) x.mode = 'random';
    x.configured.react = true;
    await reply('تم تشغيل التفاعل على الحالات.');
  } else if (cmd === 'تفاعل_ايقاف') {
    x.react = false;
    x.configured.react = true;
    await reply('تم إيقاف جميع التفاعلات على الحالات.');
  } else if (cmd === 'ايموجي_التفاعل') {
    const rawEmoji = String(arg || '').trim();
    const emoji = typeof Intl.Segmenter === 'function' ? [...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(rawEmoji)][0]?.segment : Array.from(rawEmoji)[0];
    if (!emoji) { await reply(`الإيموجي الحالي: ${x.emoji}\nلتغييره: ${prefix}ايموجي_التفاعل ❤️`); return true; }
    x.emoji = emoji;
    x.mode = 'fixed';
    x.react = true;
    x.configured.mode = true;
    x.configured.react = true;
    await reply(`تم تفعيل الإيموجي الثابت: ${emoji}`);
  } else if (cmd === 'ايموجي_مخصص') {
    const list = String(arg || '').split(/[،,\s]+/u).filter(Boolean).slice(0, 15);
    if (!list.length) { await reply('مثال: .ايموجي_مخصص 🤍,❤️,💚'); return true; }
    x.custom = list;
    x.mode = 'custom';
    x.react = true;
    x.configured.mode = true;
    x.configured.react = true;
    await reply('تم تفعيل الإيموجيات المخصصة: ' + list.join(' '));
  } else if (cmd === 'تفاعل_عشوائي') {
    x.mode = 'random';
    x.react = true;
    x.configured.mode = true;
    x.configured.react = true;
    await reply('تم تفعيل التفاعل العشوائي بإيموجيات البوت.');
  }
  saveSettings(store, x);
  return true;
}

async function handleStatusMessage(sock, msg, settings, store) {
  const x = normalizeSettings(settings);
  const key = msg.key || {};
  if (key.fromMe) return;
  const statusId = key.id;
  if (!statusId) return;

  // Status authors may arrive with a device suffix or as a LID JID.
  let participant = key.participant || msg.participant || key.participantAlt || msg.participantAlt || null;
  if (participant && participant.includes(':')) participant = participant.replace(/:\d+(?=@)/, '');
  if (participant && participant.endsWith('@c.us')) participant = participant.replace(/@c\.us$/, '@s.whatsapp.net');
  if (participant && participant.endsWith('@lid')) {
    try {
      const mapper = sock.signalRepository?.lidMapping;
      if (typeof mapper?.getPNForLID === 'function') participant = await mapper.getPNForLID(participant) || participant;
    } catch (err) {
      store.log(`تعذر تحويل معرف ناشر الحالة: ${err.message}`);
    }
  }

  const dedupeKey = `${participant || 'unknown'}:${statusId}`;
  if (seenStatuses.has(dedupeKey)) return;
  seenStatuses.set(dedupeKey, Date.now());
  if (seenStatuses.size > 2000) seenStatuses.delete(seenStatuses.keys().next().value);

  if (x.view) {
    try { await sock.readMessages([key]); }
    catch (err) { store.log(`تعذرت مشاهدة الحالة ${statusId}: ${err.message}`); }
  }
  if (!x.react) return;
  if (!participant || participant === 'status@broadcast' || participant.endsWith('@broadcast')) {
    store.log(`لم يتم التفاعل مع الحالة ${statusId}: لم يصل معرف ناشر الحالة (participant).`);
    return;
  }

  let pool;
  if (x.mode === 'fixed') pool = [x.emoji || '❤️'];
  else if (x.mode === 'custom') pool = x.custom?.length ? x.custom : ['🤍','❤️','💚'];
  else pool = RANDOM_EMOJIS;
  const emoji = pool[Math.floor(Math.random() * pool.length)];

  try {
    // Use the working relayMessage reaction format from the reference bot.
    // Baileys generates a fresh message ID for the reaction while the key points
    // to the original status message.
    await sock.relayMessage(
      'status@broadcast',
      {
        reactionMessage: {
          key: {
            remoteJid: 'status@broadcast',
            id: statusId,
            participant,
            fromMe: false
          },
          text: emoji
        }
      },
      { statusJidList: [participant] }
    );
    store.log(`تم إرسال تفاعل ${emoji} على الحالة ${statusId} لصاحبها ${participant}.`);
  } catch (err) {
    store.log(`فشل التفاعل مع الحالة ${statusId} لصاحبها ${participant}: ${err.message}`);
  }
}


Object.assign(section, { defaults, normalizeSettings, handleCommand, handleStatusMessage });
module.exports = section;
