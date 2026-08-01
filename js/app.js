/* ═══════════════════════════════════════════════════════════
   app.js — the curator
   Routing, events, ceremonies, and the small amount of
   plumbing a cabinet needs.
   ═══════════════════════════════════════════════════════════ */
(function(){
  var AN = window.AN;
  var $ = function(s, r){ return (r||document).querySelector(s); };
  var $$ = function(s, r){ return Array.prototype.slice.call((r||document).querySelectorAll(s)); };

  var view = 'register';
  var queue = [];
  var modalMode = null;

  /* ── theme ───────────────────────────────────────────────── */
  function applyTheme(){
    var d = AN.state.get().display;
    document.documentElement.setAttribute('data-paper', d.paper);
    document.documentElement.setAttribute('data-accent', d.accent);
    var meta = $('meta[name=theme-color]');
    if (meta) meta.setAttribute('content', d.paper === 'night' ? '#171310' : '#2E211A');
  }

  /* ── rendering ───────────────────────────────────────────── */
  function render(){
    var el = $('#view-' + view);
    if (!el) return;
    el.innerHTML = AN.views[view]();
    $$('.view').forEach(function(v){ v.hidden = (v.dataset.view !== view); });
    $$('.tab').forEach(function(t){ t.classList.toggle('is-on', t.dataset.go === view); });
    var s = AN.state.streak();
    $('#streak-num').textContent = s;
    $('#streak-chip').style.opacity = s ? 1 : .55;
    refreshDots();
    window.scrollTo(0, 0);
  }

  function refreshDots(){
    var S = AN.state.get();
    var unseen = Object.keys(S.col).filter(function(id){ return !S.seen[id]; }).length;
    var tab = $$('.tab').filter(function(t){ return t.dataset.go === 'cabinet'; })[0];
    if (!tab) return;
    var dot = $('.dot', tab);
    if (unseen && view !== 'cabinet'){
      if (!dot){ dot = document.createElement('span'); dot.className = 'dot'; tab.appendChild(dot); }
    } else if (dot) dot.remove();
  }

  function go(v){
    if (v === view) return;
    view = v;
    if (AN.state.get().settings.sound) AN.sound.drawer();
    render();
  }

  /* ── toast ───────────────────────────────────────────────── */
  var toastT = null;
  function toast(msg){
    var t = $('#toast');
    t.textContent = msg; t.hidden = false;
    clearTimeout(toastT);
    toastT = setTimeout(function(){ t.hidden = true; }, 2600);
  }

  /* ── ceremonies ──────────────────────────────────────────── */
  function runQueue(){
    if (!queue.length){ $('#ceremony').hidden = true; render(); return; }
    var item = queue[0];
    var c = $('#ceremony');
    $('#cer-kicker').textContent = item.kicker;
    $('#cer-art').innerHTML = item.art;
    if (item.type === 'specimen'){
      $('#cer-name').textContent = item.spec.name;
      $('#cer-latin').textContent = item.spec.latin;
      $('#cer-fact').textContent = item.spec.fact;
      $('#cer-tail').textContent = '';
      $('#cer-spec').textContent = '';
      /* deliberately not marked seen here — the badge on the Cabinet is
         what sends her back to look at it properly */
    } else {
      $('#cer-name').textContent = item.ach.name;
      $('#cer-latin').textContent = item.spec ? item.spec.name : '';
      $('#cer-fact').textContent = item.ach.note;
      $('#cer-tail').textContent = item.ach.tail || '';
      /* what the plate actually put in the drawers, kept separate from
         whatever the plate itself had to say */
      var spec = '';
      if (item.spec) spec = 'Into the drawer: ' + item.spec.name + '. ' + item.spec.fact;
      if (item.unlocks && item.unlocks.length){
        spec += (spec ? ' ' : '') + 'Released for the Vitrine: ' +
          item.unlocks.map(function(u){ return u.name + ' ' + u.kind; }).join(', ') + '.';
      }
      $('#cer-spec').textContent = spec;
    }
    $('#cer-more').hidden = queue.length < 2;
    $('#cer-more').textContent = queue.length > 1 ? (queue.length - 1) + ' more waiting' : '';
    $('#cer-next').textContent = queue.length > 1 ? 'Pin it, and the next' : 'Pin it to the board';
    c.hidden = false;
    reflow(c);
    if (AN.state.get().settings.sound) AN.sound[item.sound] ? AN.sound[item.sound]() : AN.sound.bell();
    AN.sound.buzz(item.type === 'plate' ? [14,60,14,60,26] : [12,50,18]);
  }
  function reflow(node){
    /* restart the entry animations for each successive card */
    $$('.cer-stage > *, .cer-art, .cer-pin, .cer-spec', node).forEach(function(n){
      n.style.animation = 'none'; void n.offsetWidth; n.style.animation = '';
    });
  }

  function petals(){
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var wrap = document.createElement('div');
    wrap.className = 'confetti';
    var cols = ['#C4384E','#E8B430','#7FA6D4','#8E6EB4','#6F7A5A','#EFE5D0'];
    for (var i=0;i<26;i++){
      var p = document.createElement('div');
      p.className = 'petal';
      var sz = 6 + Math.random()*9;
      p.style.left = (Math.random()*100) + 'vw';
      p.style.width = sz + 'px'; p.style.height = (sz*0.62) + 'px';
      p.style.background = cols[i % cols.length];
      p.style.borderRadius = '60% 40% 55% 45% / 60% 55% 45% 40%';
      p.style.opacity = 0.85;
      p.style.setProperty('--spin', (Math.random()*900-450) + 'deg');
      p.style.animation = 'fall ' + (2.6 + Math.random()*2.4) + 's linear ' + (Math.random()*0.9) + 's forwards';
      wrap.appendChild(p);
    }
    document.body.appendChild(wrap);
    setTimeout(function(){ wrap.remove(); }, 6200);
  }

  /* ── the register's own interactions ─────────────────────── */
  function saveIndulge(){
    var f = $('#indulge');
    if (f) AN.state.note(f.value);
  }

  function afterChange(wasComplete, wasCount){
    var S = AN.state.get();
    var nowComplete = AN.state.isComplete(AN.state.peek(AN.state.today()));
    queue = AN.rewards.after(wasComplete);
    if (nowComplete && !wasComplete){ petals(); }
    if (queue.length) runQueue(); else render();
  }

  document.addEventListener('click', function(e){
    var t = e.target.closest('button, [data-close]');
    if (!t) return;
    var S = AN.state.get();

    /* nav */
    if (t.dataset.go){ saveIndulge(); go(t.dataset.go); return; }

    /* bookplate */
    if (t.id === 'plate-enter'){
      AN.sound.unlock();
      AN.state.setSetting('plateSeen', true);
      var p = $('#plate'); p.classList.add('leaving');
      setTimeout(function(){ p.hidden = true; p.classList.remove('leaving'); }, 560);
      if (S.settings.sound) AN.sound.cloche();
      return;
    }

    /* ceremony */
    if (t.id === 'cer-next'){ queue.shift(); if (S.settings.sound) AN.sound.pin(); runQueue(); return; }

    /* a task box */
    if (t.dataset.toggle){
      var was = AN.state.isComplete(AN.state.peek(AN.state.today()));
      saveIndulge();
      var on = AN.state.toggle(t.dataset.toggle);
      if (S.settings.sound) on ? AN.sound.check() : AN.sound.uncheck();
      AN.sound.buzz(on ? 12 : 6);
      afterChange(was);
      return;
    }

    /* a tally pip */
    if (t.dataset.pip){
      var key = t.dataset.pip, i = +t.dataset.i;
      var rec = AN.state.day(), cur = rec.n[key] || 0;
      var to = (cur === i) ? i - 1 : i;
      var wasC = AN.state.isComplete(AN.state.peek(AN.state.today()));
      saveIndulge();
      var def = AN.TASKS.filter(function(x){ return x.key === key; })[0];
      AN.state.bump(key, to);
      if (S.settings.sound){ to > cur ? AN.sound.pip(to, def.tally) : AN.sound.tick(); }
      AN.sound.buzz(8);
      afterChange(wasC);
      return;
    }

    /* rest seals */
    if (t.dataset.rest){
      var k = t.dataset.rest === 'today' ? AN.state.today() : AN.state.shift(AN.state.today(), -1);
      if (AN.state.spendRest(k)){
        if (S.settings.sound) AN.sound.seal();
        toast(t.dataset.rest === 'today' ? 'Today is sealed. Nothing more is owed.' : 'Yesterday is covered. The sequence holds.');
        queue = AN.rewards.plates();
        if (queue.length) runQueue(); else render();
      }
      return;
    }

    /* a drawer */
    if (t.dataset.drawer){
      var wasOpen = t.getAttribute('aria-expanded') === 'true';
      AN.views.toggleDrawer(t.dataset.drawer);
      if (S.settings.sound) wasOpen ? AN.sound.tick() : AN.sound.drawer();
      var y = window.scrollY;
      $('#view-cabinet').innerHTML = AN.views.cabinet();
      window.scrollTo(0, Math.min(y, document.documentElement.scrollHeight));
      return;
    }

    /* a specimen cell */
    if (t.dataset.spec){ openModal('spec', t.dataset.spec); return; }

    /* vitrine slot */
    if (t.dataset.slot !== undefined && t.classList.contains('vit-slot')){ openModal('slot', +t.dataset.slot); return; }
    if (t.dataset.put !== undefined){
      AN.state.setSlot(+t.dataset.put, t.dataset.id || null);
      if (S.settings.sound) AN.sound.cloche();
      closeModal(); render(); return;
    }
    if (t.dataset.display){
      var id = t.dataset.display, slots = S.display.slots;
      var at = slots.indexOf(id);
      if (at >= 0){ AN.state.setSlot(at, null); toast('Taken off display.'); }
      else {
        var free = slots.indexOf(null);
        if (free < 0){ toast('The vitrine is full — clear a slot first.'); return; }
        AN.state.setSlot(free, id);
        if (S.settings.sound) AN.sound.cloche();
        toast('Placed in the vitrine.');
      }
      closeModal(); render(); return;
    }

    /* furniture */
    if (t.dataset.set){
      var kind = t.dataset.set, val = t.dataset.val;
      if (!AN.state.hasUnlocked(kind, val)){ toast('Still locked — a plate in the Cabinet releases this.'); return; }
      var patch = {}; patch[kind] = val;
      AN.state.setDisplay(patch);
      applyTheme();
      if (S.settings.sound) AN.sound.page();
      render(); return;
    }

    /* calendar */
    if (t.dataset.cal){ AN.views.setCalMonth(+t.dataset.cal); if (S.settings.sound) AN.sound.page(); render(); return; }

    /* switches */
    if (t.dataset.sw){
      var k2 = t.dataset.sw, v = !(S.settings[k2]);
      AN.state.setSetting(k2, v);
      if (k2 === 'sound'){ AN.sound.enabled(v); if (v) AN.sound.bell(); }
      if (k2 === 'reminder' && v) requestNotify();
      render(); return;
    }

    /* colophon buttons */
    if (t.hasAttribute('data-ics')){ makeICS(); return; }
    if (t.hasAttribute('data-export')){ exportBackup(); return; }
    if (t.hasAttribute('data-import')){ $('#importFile').click(); return; }
    if (t.id === 'dediBtn'){
      var n = $('#dediNote');
      n.classList.toggle('open');
      if (n.classList.contains('open') && S.settings.sound) AN.sound.heart();
      return;
    }

    /* modal dismissal */
    if (t.hasAttribute('data-close')){ closeModal(); return; }
  });

  document.addEventListener('input', function(e){
    if (e.target.id === 'indulge') AN.state.note(e.target.value);
    if (e.target.id === 'remAt') AN.state.setSetting('reminderAt', e.target.value);
  });
  document.addEventListener('change', function(e){
    if (e.target.id === 'importFile' && e.target.files && e.target.files[0]) importBackup(e.target.files[0]);
  });

  /* ── modal ───────────────────────────────────────────────── */
  function openModal(mode, arg){
    modalMode = mode;
    $('#modal-body').innerHTML = mode === 'spec' ? AN.views.specModal(arg) : AN.views.slotPicker(arg);
    $('#modal').hidden = false;
    if (AN.state.get().settings.sound) AN.sound.page();
  }
  function closeModal(){
    $('#modal').hidden = true;
    if (view === 'cabinet') render(); else refreshDots();
  }

  /* ── reminders ───────────────────────────────────────────── */
  function requestNotify(){
    if (!('Notification' in window)) return;
    try{ Notification.requestPermission(); }catch(e){}
  }
  function makeICS(){
    var S = AN.state.get(), at = (S.settings.reminderAt || '09:30').split(':');
    var d = new Date(); d.setDate(d.getDate()+1);
    var pad = function(n){ return String(n).padStart(2,'0'); };
    var start = d.getFullYear() + pad(d.getMonth()+1) + pad(d.getDate()) + 'T' + pad(+at[0]) + pad(+at[1]) + '00';
    var stamp = new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d+/,'');
    var ics = [
      'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Anserarium//Register//EN','CALSCALE:GREGORIAN',
      'BEGIN:VEVENT','UID:anserarium-daily-' + Date.now() + '@local','DTSTAMP:' + stamp,
      'DTSTART:' + start,'DURATION:PT10M','RRULE:FREQ=DAILY',
      'SUMMARY:The cabinet is open','DESCRIPTION:Six small things. Any of them counts on its own.',
      'BEGIN:VALARM','TRIGGER:PT0M','ACTION:DISPLAY','DESCRIPTION:The cabinet is open','END:VALARM',
      'END:VEVENT','END:VCALENDAR'
    ].join('\r\n');
    download(new Blob([ics], {type:'text/calendar'}), 'anserarium-daily.ics');
    toast('Open the file to add the daily reminder.');
  }

  /* ── backup ──────────────────────────────────────────────── */
  function download(blob, name){
    var url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = name; document.body.appendChild(a); a.click();
    setTimeout(function(){ a.remove(); URL.revokeObjectURL(url); }, 1200);
  }
  function exportBackup(){
    download(new Blob([AN.state.exportJSON()], {type:'application/json'}),
             'anserarium-' + AN.state.today() + '.json');
    toast('Backup saved.');
  }
  function importBackup(file){
    var r = new FileReader();
    r.onload = function(){
      try{
        AN.state.importJSON(r.result);
        applyTheme(); render();
        toast('Cabinet restored.');
        if (AN.state.get().settings.sound) AN.sound.cloche();
      }catch(err){ toast('That file was not a backup.'); }
    };
    r.readAsText(file);
  }

  /* ── boot ────────────────────────────────────────────────── */
  function boot(){
    AN.state.load();
    var S = AN.state.get();
    AN.state.openSession();
    AN.sound.enabled(!!S.settings.sound);
    applyTheme();

    $('#brand-mark').innerHTML = AN.art.goose('#E8D9B4');
    $('#plate-seal').innerHTML = AN.art.seal();
    $$('.tab-i').forEach(function(n){ n.innerHTML = AN.art.icon(n.dataset.i); });

    if (!S.settings.plateSeen) $('#plate').hidden = false;

    render();

    /* anything earned while the app was closed — a rolled-over day, a
       backdated plate — is presented on the way in rather than silently */
    queue = AN.rewards.plates();
    if (queue.length) setTimeout(runQueue, S.settings.plateSeen ? 500 : 1400);

    /* first gesture unlocks the audio context on iOS */
    ['pointerdown','touchstart','keydown'].forEach(function(ev){
      window.addEventListener(ev, function once(){ AN.sound.unlock(); window.removeEventListener(ev, once); }, {once:true});
    });

    /* the day can turn over while the app sits open on a bedside table */
    var lastDay = AN.state.today();
    setInterval(function(){
      var t = AN.state.today();
      if (t !== lastDay){ lastDay = t; AN.state.openSession(); render(); }
    }, 60000);

    document.addEventListener('visibilitychange', function(){
      if (document.visibilityState === 'visible'){
        var t = AN.state.today();
        if (t !== lastDay){ lastDay = t; AN.state.openSession(); render(); }
      }
    });

    /* ?nosw=1 keeps the worker out of the way while the cabinet is being built */
    if ('serviceWorker' in navigator && location.search.indexOf('nosw') < 0){
      window.addEventListener('load', function(){
        navigator.serviceWorker.register('sw.js').catch(function(){});
      });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
