/* ═══════════════════════════════════════════════════════════
   state.js — the register itself
   Everything lives in this device's localStorage. There is no
   account, no server and nothing leaves the phone.
   ═══════════════════════════════════════════════════════════ */
window.AN = window.AN || {};

AN.TASKS = [
  {key:'water', name:'Drink at least two litres of water',
   note:'roughly eight glasses — tap one each time', tally:8, unit:'glass', units:'glasses', short:'Two litres of water'},
  {key:'meal',  name:'Eat at least one proper meal',
   note:'toast at four in the afternoon is a meal', tally:0, short:'A proper meal'},
  {key:'walk',  name:'Get out of bed and walk ten minutes',
   note:'any pace, anywhere, including indoors', tally:0, short:'Up, and ten minutes out'},
  {key:'talk',  name:'Talk with at least two people',
   note:'in person or online — they count the same', tally:2, unit:'person', units:'people', short:'Two people spoken to'},
  {key:'sleep', name:'Sleep at least six hours',
   note:'tick it for the night you have just had', tally:0, short:'Six hours of sleep'},
  {key:'kind',  name:'Do one thing purely for yourself',
   note:'no purpose, no productivity, no justification', tally:0, field:true, short:'One thing just for you'}
];

AN.state = (function(){
  var KEY = 'anserarium.v1';
  var S = null;

  function blank(){
    return {
      v:1,
      born:dayKey(new Date()),
      days:{},                       /* dayKey → {t:{}, n:{}, note:'', rest:bool} */
      col:{},                        /* specimenId → {d:dayKey, cat:'flora'} */
      seen:{},                       /* specimenId → true once viewed */
      plates:{},                     /* achievementId → dayKey */
      marks:0,                       /* monotonic count of ticks ever made */
      minAt:0,                       /* marks value at last mineral */
      completes:0,                   /* monotonic count of complete days */
      restUsed:0,
      rest:{month:monthKey(new Date()), left:3},
      flags:{dawn:false,night:false,returned:false,mended:false,perfectWeek:false},
      display:{slots:[null,null,null,null,null,null,null,null,null],
               backdrop:'felt', paper:'default', accent:'oxblood'},
      unlocked:{backdrop:['felt'], paper:['default'], accent:['oxblood']},
      settings:{sound:true, reminder:false, reminderAt:'09:30', plateSeen:false},
      lastOpen:null
    };
  }

  /* ── dates, in the device's own timezone ─────────────────── */
  function dayKey(d){
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
  }
  function monthKey(d){ return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0'); }
  function parseKey(k){ var p = k.split('-'); return new Date(+p[0], +p[1]-1, +p[2]); }
  function shift(k, n){ var d = parseKey(k); d.setDate(d.getDate()+n); return dayKey(d); }
  function today(){ return dayKey(new Date()); }

  /* ── persistence ─────────────────────────────────────────── */
  /* forward-fill any keys added after this copy was installed */
  function hydrate(obj){
    S = obj;
    var b = blank();
    Object.keys(b).forEach(function(k){ if (S[k] === undefined) S[k] = b[k]; });
    Object.keys(b.settings).forEach(function(k){ if (S.settings[k] === undefined) S.settings[k] = b.settings[k]; });
    Object.keys(b.flags).forEach(function(k){ if (S.flags[k] === undefined) S.flags[k] = b.flags[k]; });
    if (!S.display.slots || S.display.slots.length !== 9) S.display.slots = [null,null,null,null,null,null,null,null,null];
    rollMonth();
    return S;
  }
  function load(){
    var raw = null;
    try{ raw = localStorage.getItem(KEY); }catch(e){}
    var obj;
    try{ obj = raw ? JSON.parse(raw) : blank(); }catch(e){ obj = blank(); }
    return hydrate(obj);
  }
  function save(){
    try{ localStorage.setItem(KEY, JSON.stringify(S)); }catch(e){}
  }
  function get(){ return S || load(); }

  function rollMonth(){
    var m = monthKey(new Date());
    if (S.rest.month !== m){ S.rest = {month:m, left:3}; }
  }

  /* ── day records ─────────────────────────────────────────── */
  function day(k){
    k = k || today();
    if (!S.days[k]) S.days[k] = {t:{}, n:{}, note:'', rest:false};
    return S.days[k];
  }
  function peek(k){ return S.days[k || today()] || null; }

  function isComplete(rec){
    if (!rec) return false;
    return AN.TASKS.every(function(t){ return !!rec.t[t.key]; });
  }
  function countChecked(rec){
    if (!rec) return 0;
    return AN.TASKS.filter(function(t){ return !!rec.t[t.key]; }).length;
  }
  function counts(k){
    var rec = peek(k || today());
    return { done: countChecked(rec), total: AN.TASKS.length, complete: isComplete(rec) };
  }

  /* a day "holds the sequence" if it was complete or deliberately rested */
  function holds(k){
    var rec = S.days[k];
    return !!rec && (rec.rest || isComplete(rec));
  }

  function streak(){
    var t = today(), n = 0, cur = t;
    if (!holds(t)) cur = shift(t,-1);
    while (holds(cur)){ n++; cur = shift(cur,-1); }
    return n;
  }
  function bestStreak(){
    var keys = Object.keys(S.days).filter(holds).sort();
    if (!keys.length) return 0;
    var best = 1, run = 1;
    for (var i=1;i<keys.length;i++){
      if (shift(keys[i-1],1) === keys[i]) run++; else run = 1;
      if (run > best) best = run;
    }
    return best;
  }

  /* ── aggregate snapshot used by the achievement tests ────── */
  function snapshot(){
    var task = {}, notes = 0;
    AN.TASKS.forEach(function(t){ task[t.key] = 0; });
    Object.keys(S.days).forEach(function(k){
      var r = S.days[k];
      AN.TASKS.forEach(function(t){ if (r.t[t.key]) task[t.key]++; });
      if (r.t.kind && r.note && r.note.trim()) notes++;
    });
    var have = {flora:0, lep:0, fauna:0, min:0, curio:0, total:0}, geese = 0;
    var GEESE = {fa21:1,fa22:1,fa23:1,fa24:1,fa25:1,fa26:1};
    Object.keys(S.col).forEach(function(id){
      var c = S.col[id].cat;
      if (have[c] !== undefined) have[c]++;
      have.total++;
      if (GEESE[id]) geese++;
    });
    return {
      streak:streak(), best:bestStreak(),
      totalComplete:S.completes, totalChecks:S.marks,
      task:task, notes:notes, have:have, geese:geese,
      restUsed:S.restUsed, flags:S.flags
    };
  }

  /* ── mutation ────────────────────────────────────────────── */
  function toggle(key){
    var k = today(), rec = day(k), was = !!rec.t[key];
    if (was){
      delete rec.t[key];
      if (rec.n) delete rec.n[key];
    } else {
      rec.t[key] = true;
      var def = AN.TASKS.filter(function(t){ return t.key===key; })[0];
      if (def && def.tally) rec.n[key] = def.tally;
      S.marks++;
      stampTime();
    }
    save();
    return !was;
  }
  function bump(key, to){
    var k = today(), rec = day(k);
    var def = AN.TASKS.filter(function(t){ return t.key===key; })[0];
    if (!def || !def.tally) return false;
    rec.n[key] = to;
    var full = to >= def.tally;
    if (full && !rec.t[key]){ rec.t[key] = true; S.marks++; stampTime(); }
    if (!full && rec.t[key]) delete rec.t[key];
    save();
    return full;
  }
  function note(txt){ day(today()).note = txt.slice(0,160); save(); }

  function stampTime(){
    var h = new Date().getHours();
    if (h < 7) S.flags.dawn = true;
    if (h >= 0 && h < 4) S.flags.night = true;
  }

  function spendRest(k){
    rollMonth();
    if (S.rest.left <= 0) return false;
    var rec = day(k);
    if (rec.rest || isComplete(rec)) return false;
    rec.rest = true;
    S.rest.left--;
    S.restUsed++;
    save();
    return true;
  }

  /* called once per launch, after the day may have rolled over */
  function openSession(){
    var t = today();
    if (S.lastOpen && S.lastOpen !== t){
      var gap = Math.round((parseKey(t) - parseKey(S.lastOpen)) / 86400000);
      if (gap >= 3) S.flags.returned = true;
    }
    S.lastOpen = t;
    save();
  }

  /* recorded when a day is completed — spots the recovery pattern */
  function onComplete(){
    S.completes++;
    var t = today(), y = shift(t,-1), rec = S.days[y];
    if (S.completes > 1 && (!rec || (!rec.rest && !isComplete(rec)))) S.flags.mended = true;
    /* a clean Monday-to-Sunday week */
    var d = parseKey(t), dow = (d.getDay()+6)%7, ok = true;
    for (var i=0;i<=dow;i++){ if (!holds(shift(t,-i))) { ok = false; break; } }
    if (ok && dow === 6) S.flags.perfectWeek = true;
    save();
  }

  function collect(id, cat){
    if (S.col[id]) return false;
    S.col[id] = {d:today(), cat:cat};
    save();
    return true;
  }
  function ownAll(cat){
    var pool = AN.pool(cat);
    return pool.every(function(x){ return !!S.col[x.id]; });
  }

  function unlock(kind, name){
    if (!S.unlocked[kind]) S.unlocked[kind] = [];
    if (S.unlocked[kind].indexOf(name) < 0){ S.unlocked[kind].push(name); save(); return true; }
    return false;
  }
  function hasUnlocked(kind, name){ return (S.unlocked[kind]||[]).indexOf(name) >= 0; }

  function setDisplay(patch){ Object.assign(S.display, patch); save(); }
  function setSlot(i, id){ S.display.slots[i] = id; save(); }
  function setSetting(k, v){ S.settings[k] = v; save(); }
  function markSeen(id){ if (!S.seen[id]){ S.seen[id] = true; save(); } }

  function reset(){ S = blank(); save(); }
  function exportJSON(){ return JSON.stringify(S); }
  function importJSON(txt){
    var o = JSON.parse(txt);
    if (!o || typeof o !== 'object' || !o.days || !o.col) throw new Error('not an Anserarium backup');
    hydrate(o);          /* NOT load() — that would read the old copy straight back over it */
    save();
  }

  return {
    load:load, save:save, get:get,
    today:today, dayKey:dayKey, shift:shift, parseKey:parseKey, monthKey:monthKey,
    day:day, peek:peek, counts:counts, isComplete:isComplete, holds:holds,
    streak:streak, bestStreak:bestStreak, snapshot:snapshot,
    toggle:toggle, bump:bump, note:note, spendRest:spendRest,
    openSession:openSession, onComplete:onComplete,
    collect:collect, ownAll:ownAll,
    unlock:unlock, hasUnlocked:hasUnlocked,
    setDisplay:setDisplay, setSlot:setSlot, setSetting:setSetting, markSeen:markSeen,
    reset:reset, exportJSON:exportJSON, importJSON:importJSON
  };
})();

/* ── one place to ask for a category's list and its renderer ── */
AN.pool = function(cat){
  return cat === 'flora' ? AN.FLORA
       : cat === 'lep'   ? AN.LEPIDOPTERA
       : cat === 'fauna' ? AN.FAUNA
       : cat === 'min'   ? AN.MINERALIA
       : cat === 'curio' ? AN.CURIOSITIES : [];
};
AN.find = function(id){
  var cats = ['flora','lep','fauna','min','curio'];
  for (var i=0;i<cats.length;i++){
    var hit = AN.pool(cats[i]).filter(function(x){ return x.id === id; })[0];
    if (hit) return {spec:hit, cat:cats[i]};
  }
  return null;
};
AN.draw = function(spec, cat){
  return cat === 'flora' ? AN.art.flower(spec.art, spec.id)
       : cat === 'lep'   ? AN.art.lep(spec.art, spec.id)
       : cat === 'fauna' ? AN.art.fauna(spec.art, spec.id)
       : cat === 'min'   ? AN.art.mineral(spec.art, spec.id)
       : AN.art.curio(spec.art, spec.id);
};
AN.CATS = [
  {key:'flora', title:'Flora',        sub:'Pressed plants — one for every complete day.'},
  {key:'lep',   title:'Lepidoptera',  sub:'Butterflies and moths — one every third complete day.'},
  {key:'fauna', title:'Fauna',        sub:'Critters, geese and fossils — one every seventh complete day.'},
  {key:'min',   title:'Mineralia',    sub:'Stones — one for every five ticks, whatever day they fall on.'},
  {key:'curio', title:'Curiosities',  sub:'Shelf objects — granted with the plates, at milestones.'}
];
