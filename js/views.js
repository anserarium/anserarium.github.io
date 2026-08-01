/* ═══════════════════════════════════════════════════════════
   views.js — everything the cabinet shows
   ═══════════════════════════════════════════════════════════ */
window.AN = window.AN || {};

AN.views = (function(){
  var $ = function(s, r){ return (r||document).querySelector(s); };
  var $$ = function(s, r){ return Array.prototype.slice.call((r||document).querySelectorAll(s)); };
  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g, function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }

  var MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  var DOW = ['M','T','W','T','F','S','S'];

  function longDate(d){
    var n = d.getDate(), ord = (n%10===1&&n!==11)?'st':(n%10===2&&n!==12)?'nd':(n%10===3&&n!==13)?'rd':'th';
    return ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][d.getDay()] +
           ', the ' + n + ord + ' of ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear();
  }

  /* ═════════════════════════ REGISTER ═════════════════════════ */
  function register(){
    var S = AN.state.get(), c = AN.state.counts(), rec = AN.state.day();
    var streak = AN.state.streak(), now = new Date();
    var noteIdx = Math.abs(hashKey(AN.state.today())) % AN.FIELDNOTES.length;
    var pct = c.done / c.total, circ = 2*Math.PI*32;
    var toStone = 5 - ((S.marks - S.minAt) % 5);
    var nx = AN.rewards.nextUp();

    var h = '<div class="page-head view-in">' +
      '<p class="date">' + esc(longDate(now)) + '</p>' +
      '<h2>The Day’s Register</h2>' +
      '<p class="sub">' + esc(greeting(c, streak)) + '</p></div>';

    /* apparatus */
    h += '<div class="sheet"><div class="apparatus">' +
      '<div class="dial"><svg viewBox="0 0 76 76">' +
        '<circle class="dial-track" cx="38" cy="38" r="32"/>' +
        '<circle class="dial-fill" cx="38" cy="38" r="32" stroke-dasharray="'+circ+'" stroke-dashoffset="'+(circ*(1-pct))+'"/>' +
      '</svg><div class="dial-txt"><div>'+c.done+'<small>of six</small></div></div></div>' +
      '<div class="apparatus-txt">' +
        '<p class="big" style="margin:0 0 3px">' + (c.complete
            ? 'The day is complete.'
            : c.done ? 'Recorded so far: ' + c.done + ' of six.' : 'Nothing recorded yet today.') + '</p>' +
        '<p class="small" style="margin:0">' + (streak>0
            ? streak + ' day' + (streak>1?'s':'') + ' held in sequence' + (S.days[AN.state.today()] && S.days[AN.state.today()].rest ? ' — today is a rest day' : '')
            : 'The sequence starts whenever you like.') + '</p>' +
        '<div class="meter"><i style="width:'+Math.round(((5-toStone)/5)*100)+'%"></i></div>' +
        '<p class="small" style="margin:5px 0 0">' + toStone + ' tick' + (toStone>1?'s':'') + ' to the next stone</p>' +
      '</div></div>' +
      '<div class="nextup"><div class="nextup-art">' + AN.art.seal() + '</div>' +
      '<div class="nextup-txt">' + nx.txt + '</div></div>' +
      '</div>';

    /* the six */
    h += '<ul class="tasks">';
    AN.TASKS.forEach(function(t){
      var on = !!rec.t[t.key];
      h += '<li class="task' + (on?' done':'') + '" data-task="' + t.key + '">' +
        '<button class="t-box" data-toggle="' + t.key + '" aria-pressed="' + on + '" aria-label="' + esc(t.name) + '">' +
          AN.art.icon('tick') + '</button>' +
        '<div class="t-main">' +
          '<div class="t-name">' + esc(t.name) + '</div>' +
          '<div class="t-note">' + esc(t.note) + '</div>';
      if (t.tally){
        var got = rec.n[t.key] || 0;
        h += '<div class="pips" data-pips="' + t.key + '">';
        for (var i=1;i<=t.tally;i++){
          h += '<button class="pip' + (i<=got?' on':'') + '" data-pip="' + t.key + '" data-i="' + i + '" aria-label="' + i + '"><span>' + i + '</span></button>';
        }
        h += '</div><div class="pips-lbl">' + got + ' of ' + t.tally + ' ' + esc(got === 1 ? t.unit : t.units) + '</div>';
      }
      if (t.field){
        h += '<div class="indulge"><input id="indulge" maxlength="160" placeholder="what was it? (optional, for the commonplace book)" value="' + esc(rec.note||'') + '"></div>';
      }
      h += '</div></li>';
    });
    h += '</ul>';

    /* rest seals */
    /* yesterday can only be covered if the register was actually opened
       yesterday — otherwise there is nothing there to be rescued */
    var y = AN.state.shift(AN.state.today(), -1);
    var yMissed = !!S.days[y] && !AN.state.holds(y);
    h += '<div class="sheet"><h3>Rest seals</h3>' +
      '<p class="t-note" style="margin:-4px 0 10px">Three a month. Spending one holds the sequence without pretending the day was something it wasn’t.</p>' +
      '<div class="rest-row"><div class="seals">';
    for (var s=0;s<3;s++) h += '<div class="seal' + (s < (3 - S.rest.left) ? ' spent' : '') + '"></div>';
    h += '</div><div style="flex:1"><span class="t-note">' + S.rest.left + ' left this month</span></div></div>';
    h += '<div class="modal-actions" style="justify-content:flex-start;margin-top:12px">';
    if (!c.complete && !rec.rest && S.rest.left > 0) h += '<button class="btn-ghost" data-rest="today">Rest today</button>';
    if (yMissed && S.rest.left > 0) h += '<button class="btn-ghost" data-rest="yesterday">Cover yesterday</button>';
    if (rec.rest) h += '<span class="t-note">Today is sealed as a rest day.</span>';
    h += '</div></div>';

    /* field note */
    h += '<div class="sheet flat" style="background:none;border-style:dashed;box-shadow:none">' +
      '<p class="eyebrow">Field note · no. ' + (noteIdx+1) + '</p>' +
      '<p style="margin:0;font-size:14.5px;line-height:1.65">' + esc(AN.FIELDNOTES[noteIdx]) + '</p></div>';

    return h;
  }

  function greeting(c, streak){
    if (c.complete) return 'Everything on the list is done. Nothing further is required of you today.';
    if (c.done === 0) return 'Six small things. Any of them, in any order, counts on its own.';
    if (c.done >= 4) return 'Nearly all of it. Whatever is left will keep if it has to.';
    if (streak >= 7) return 'The sequence is holding. Keep going or don’t; the drawers stay where they are.';
    return 'Something is recorded. That already beats an empty page.';
  }

  function hashKey(s){
    var h = 0;
    for (var i=0;i<s.length;i++){ h = (h*31 + s.charCodeAt(i)) | 0; }
    return h;
  }

  /* ═════════════════════════ CABINET ═════════════════════════ */
  function cabinet(){
    var S = AN.state.get(), snap = AN.state.snapshot();
    var totalPool = AN.CATS.reduce(function(a,c){ return a + AN.pool(c.key).length; }, 0);
    var plateCount = Object.keys(S.plates).length;

    var h = '<div class="page-head view-in"><p class="date">Catalogue</p><h2>The Cabinet</h2>' +
      '<p class="sub">' + snap.have.total + ' of ' + totalPool + ' specimens accounted for.</p></div>';

    h += '<div class="cab-stats">' +
      '<div class="cab-stat"><b>' + snap.have.total + '</b><span>specimens</span></div>' +
      '<div class="cab-stat"><b>' + snap.totalComplete + '</b><span>full days</span></div>' +
      '<div class="cab-stat"><b>' + plateCount + '</b><span>plates</span></div>' +
      '<div class="cab-stat"><b>' + snap.best + '</b><span>best run</span></div>' +
      '</div>';

    /* Drawers are drawn only while open. A cabinet with every drawer
       pulled out at once is both unusable and, with this many
       specimens on one page, genuinely too much for a phone. */
    AN.CATS.forEach(function(cat){
      var pool = AN.pool(cat.key);
      var got = pool.filter(function(x){ return !!S.col[x.id]; }).length;
      var fresh = pool.filter(function(x){ return S.col[x.id] && !S.seen[x.id]; }).length;
      var open = openDrawers[cat.key];
      h += '<div class="drawer"><button class="drawer-head" data-drawer="' + cat.key + '" aria-expanded="' + !!open + '">' +
        '<span class="drawer-pull"></span><h3>' + esc(cat.title) + '</h3>' +
        (fresh ? '<span class="drawer-new">' + fresh + ' new</span>' : '') +
        '<span class="drawer-count">' + got + ' / ' + pool.length + '</span>' +
        '<span class="drawer-chev">' + (open ? '−' : '+') + '</span></button>';
      if (open){
        h += '<div class="drawer-body"><p class="drawer-note">' + esc(cat.sub) + '</p><div class="grid">';
        pool.forEach(function(x){
          var have = !!S.col[x.id];
          if (!have){
            h += '<button class="cell locked" data-spec="' + x.id + '"><span class="tag">—</span></button>';
            return;
          }
          var isNew = !S.seen[x.id], onShow = S.display.slots.indexOf(x.id) >= 0;
          h += '<button class="cell' + (isNew?' new':'') + (onShow?' on-display':'') + '" data-spec="' + x.id + '">' +
            ((cat.key==='lep'||cat.key==='fauna') ? '<span class="pinhead"></span>' : '') +
            AN.draw(x, cat.key) +
            '<span class="tag">' + esc(x.name) + '</span></button>';
        });
        h += '</div></div>';
      }
      h += '</div>';
    });

    /* plates */
    var pOpen = openDrawers.plates;
    h += '<div class="drawer"><button class="drawer-head" data-drawer="plates" aria-expanded="' + !!pOpen + '">' +
      '<span class="drawer-pull"></span><h3>Plates</h3>' +
      '<span class="drawer-count">' + plateCount + ' / ' + AN.ACHIEVEMENTS.length + '</span>' +
      '<span class="drawer-chev">' + (pOpen ? '−' : '+') + '</span></button>';
    if (pOpen){
      h += '<div class="drawer-body"><p class="drawer-note">Milestones, recorded. Each one released something into a drawer.</p>';
      AN.ACHIEVEMENTS.forEach(function(a){
        var on = !!S.plates[a.id];
        h += '<div class="entry" style="' + (on?'':'opacity:.42') + '">' +
          '<span class="when">' + (on ? esc(S.plates[a.id]) : 'not yet') + '</span>' +
          '<div class="what" style="font-style:normal;font-variant:small-caps;letter-spacing:.05em;font-size:16px">' + esc(a.name) + '</div>' +
          (on ? '<div class="t-note" style="font-style:normal">' + esc(a.note) + '</div>' : '') +
          '</div>';
      });
      h += '</div>';
    }
    h += '</div>';
    return h;
  }

  var openDrawers = {flora:true};
  function toggleDrawer(k){
    openDrawers[k] = !openDrawers[k];
    return !!openDrawers[k];
  }

  /* ═════════════════════════ VITRINE ═════════════════════════ */
  function vitrine(){
    var S = AN.state.get(), d = S.display;
    var h = '<div class="page-head view-in"><p class="date">Display</p><h2>The Vitrine</h2>' +
      '<p class="sub">Nine slots. Put whatever you are proudest of where you can see it.</p></div>';

    h += '<div class="vitrine"><div class="vit-back" style="background:' + AN.art.backdrop(d.backdrop) + '"></div>' +
         '<div class="vit-shelves">';
    for (var r=0;r<3;r++){
      h += '<div class="vit-shelf">';
      for (var i=0;i<3;i++){
        var idx = r*3+i, id = d.slots[idx], hit = id ? AN.find(id) : null;
        h += '<button class="vit-slot' + (hit?'':' empty') + '" data-slot="' + idx + '">' +
          (hit ? AN.draw(hit.spec, hit.cat) + '<span class="vit-label">' + esc(hit.spec.name) + '</span>' : '') +
          '</button>';
      }
      h += '</div>';
    }
    h += '</div><div class="vit-glare"></div></div>';

    h += '<div class="sheet"><h3>Furniture</h3>' +
      '<p class="opt-lbl">Case lining</p><div class="opt-row">' +
      Object.keys(AN.art.backdrops).map(function(k){
        var un = AN.state.hasUnlocked('backdrop', k);
        return '<button class="swatch' + (un?'':' lock') + '" data-set="backdrop" data-val="' + k + '" ' +
          'aria-pressed="' + (d.backdrop===k) + '" style="background:' + AN.art.backdrop(k) + '" title="' + k + '"></button>';
      }).join('') + '</div>';

    var PAPERS = {'default':'#EFE5D0', vellum:'#F5EEDD', foxed:'#E8D9BC', slate:'#DFE0DA', marine:'#E2E6E4', blush:'#F0E2DA', night:'#2A2620'};
    h += '<p class="opt-lbl">Paper</p><div class="opt-row">' +
      Object.keys(PAPERS).map(function(k){
        var un = AN.state.hasUnlocked('paper', k);
        return '<button class="swatch' + (un?'':' lock') + '" data-set="paper" data-val="' + k + '" ' +
          'aria-pressed="' + (d.paper===k) + '" style="background:' + PAPERS[k] + '" title="' + k + '"></button>';
      }).join('') + '</div>';

    var INKS = {oxblood:'#7B2D26', sage:'#6F7A5A', slate:'#5A6B7B', brass:'#8A6A2E', violet:'#5B4470', ochre:'#8A5A22'};
    h += '<p class="opt-lbl">Ink</p><div class="opt-row">' +
      Object.keys(INKS).map(function(k){
        var un = AN.state.hasUnlocked('accent', k);
        return '<button class="swatch' + (un?'':' lock') + '" data-set="accent" data-val="' + k + '" ' +
          'aria-pressed="' + (d.accent===k) + '" style="background:' + INKS[k] + '" title="' + k + '"></button>';
      }).join('') + '</div>';
    h += '<p class="t-note" style="margin-top:14px">Locked furniture is released by the plates in the Cabinet.</p></div>';
    return h;
  }

  /* ═════════════════════════ LEDGER ═════════════════════════ */
  var calMonth = null;
  function ledger(){
    var S = AN.state.get(), snap = AN.state.snapshot();
    var now = calMonth ? AN.state.parseKey(calMonth + '-01') : new Date();
    var yr = now.getFullYear(), mo = now.getMonth();
    var first = new Date(yr, mo, 1), lead = (first.getDay()+6)%7;
    var days = new Date(yr, mo+1, 0).getDate();
    var todayK = AN.state.today();

    var h = '<div class="page-head view-in"><p class="date">Record</p><h2>The Ledger</h2>' +
      '<p class="sub">Every day the register was opened, and what came of it.</p></div>';

    h += '<div class="sheet"><h3 style="display:flex;align-items:center;gap:10px">' +
      '<button class="btn-ghost" data-cal="-1" style="padding:4px 10px">‹</button>' +
      '<span style="flex:1;text-align:center">' + MONTHS[mo] + ' ' + yr + '</span>' +
      '<button class="btn-ghost" data-cal="1" style="padding:4px 10px">›</button></h3>';
    h += '<div class="cal">' + DOW.map(function(d){ return '<div class="cal-dow">'+d+'</div>'; }).join('');
    for (var b=0;b<lead;b++) h += '<div></div>';
    for (var dd=1; dd<=days; dd++){
      var k = yr + '-' + String(mo+1).padStart(2,'0') + '-' + String(dd).padStart(2,'0');
      var rec = S.days[k], cls = 'cal-d';
      if (rec && rec.rest) cls += ' rest';
      else if (rec && AN.state.isComplete(rec)) cls += ' full';
      else if (rec && Object.keys(rec.t).length) cls += ' part';
      if (k === todayK) cls += ' today';
      if (k > todayK) cls += ' future';
      h += '<div class="' + cls + '">' + dd + '</div>';
    }
    h += '</div><div class="cal-legend">' +
      '<span><i style="background:var(--accent)"></i>complete</span>' +
      '<span><i style="background:rgba(176,141,79,.26)"></i>partial</span>' +
      '<span><i style="background:repeating-linear-gradient(45deg,var(--paper-edge) 0 3px,transparent 3px 6px)"></i>rested</span>' +
      '</div></div>';

    h += '<div class="sheet"><h3>Totals</h3><div class="statgrid">' +
      '<div class="cab-stat"><b>' + snap.streak + '</b><span>current run</span></div>' +
      '<div class="cab-stat"><b>' + snap.best + '</b><span>longest run</span></div>' +
      '<div class="cab-stat"><b>' + snap.totalComplete + '</b><span>complete days</span></div>' +
      '<div class="cab-stat"><b>' + snap.totalChecks + '</b><span>ticks, all told</span></div>' +
      '</div>';
    h += '<div class="rule"></div><p class="eyebrow">By habit</p>';
    AN.TASKS.forEach(function(t){
      var v = snap.task[t.key], max = Math.max(1, Math.max.apply(null, AN.TASKS.map(function(x){ return snap.task[x.key]; })));
      h += '<div style="margin-bottom:9px"><div style="display:flex;justify-content:space-between;font-size:13px">' +
        '<span>' + esc(t.short || t.name) + '</span><span class="muted">' + v + '</span></div>' +
        '<div class="meter"><i style="width:' + Math.round(v/max*100) + '%"></i></div></div>';
    });
    h += '</div>';

    /* commonplace book */
    var notes = Object.keys(S.days).filter(function(k){ return S.days[k].note && S.days[k].note.trim(); }).sort().reverse();
    h += '<div class="sheet"><h3>The Commonplace Book</h3>' +
      '<p class="t-note" style="margin:-4px 0 8px">Everything you did purely because you wanted to.</p>';
    if (!notes.length) h += '<p class="t-note">Nothing written down yet. The field is on the register, under the sixth task.</p>';
    notes.slice(0,60).forEach(function(k){
      h += '<div class="entry"><span class="when">' + esc(k) + '</span><div class="what">' + esc(S.days[k].note) + '</div></div>';
    });
    h += '</div>';
    return h;
  }

  /* ═════════════════════════ COLOPHON ═════════════════════════ */
  function colophon(){
    var S = AN.state.get();
    var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
              (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    var standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;

    var h = '<div class="page-head view-in"><p class="date">Front matter</p><h2>Colophon</h2>' +
      '<p class="sub">What this is, how to keep it, and where it came from.</p></div>';

    h += '<div class="sheet colo">' + '<div style="width:66px;margin:0 auto 8px">' + AN.art.goose('#4A3527') + '</div>' +
      '<h3>Anserarium</h3>' +
      '<p style="font-size:14.5px">A cabinet of curiosities, kept for Goose.</p>' +
      '<p class="t-note" style="font-style:normal">Six things a person needs in a day, and a collection that grows every time you manage any of them. Nothing here is a test. Partial credit is credit, rest days are a feature, and a missed day removes exactly nothing from the drawers.</p>' +
      '<p class="t-note" style="font-style:normal">Everything you record stays on this device. There is no account and no server — which also means clearing your browser data would clear the cabinet, so there is a backup button further down.</p>' +
      '</div>';

    if (!standalone){
      h += '<div class="sheet"><h3>Keeping it to hand</h3>';
      if (iOS){
        h += '<p class="t-note" style="font-style:normal">On an iPhone or iPad, in <b>Safari</b>:</p><ol class="steps">' +
          '<li>Tap the <b>Share</b> button — the square with the arrow, at the bottom of the screen.</li>' +
          '<li>Scroll down and tap <b>Add to Home Screen</b>.</li>' +
          '<li>Tap <b>Add</b>. It will sit on your home screen with its own icon and open without any browser around it.</li></ol>';
      } else {
        h += '<p class="t-note" style="font-style:normal">On a Mac, in <b>Safari</b>: <b>File › Add to Dock</b>. In <b>Chrome</b> or <b>Edge</b>: the install icon at the right-hand end of the address bar, then <b>Install</b>.</p>' +
          '<p class="t-note" style="font-style:normal">On an iPhone, open this link in <b>Safari</b>, tap <b>Share</b>, then <b>Add to Home Screen</b>.</p>';
      }
      h += '<p class="t-note" style="font-style:normal;margin-top:10px">It works offline once installed.</p></div>';
    }

    /* settings */
    h += '<div class="sheet"><h3>Settings</h3>' +
      '<div class="setting"><div class="s-main"><b>Cabinet sounds</b><span>brass, wood, glass and wax — all made up on the spot by the browser</span></div>' +
        '<button class="switch" data-sw="sound" aria-pressed="' + (S.settings.sound?'true':'false') + '"></button></div>' +
      '<div class="setting"><div class="s-main"><b>A daily nudge</b><span>one quiet reminder, at a time you pick</span></div>' +
        '<button class="switch" data-sw="reminder" aria-pressed="' + (S.settings.reminder?'true':'false') + '"></button></div>';
    if (S.settings.reminder){
      h += '<div class="setting"><div class="s-main"><b>At</b><span>phones will not wake an app on their own, so this hands you a repeating calendar reminder instead — which does work, and which you can delete any time</span></div>' +
        '<input type="time" id="remAt" value="' + esc(S.settings.reminderAt) + '"></div>' +
        '<div class="modal-actions" style="justify-content:flex-start"><button class="btn-ghost" data-ics>Add the daily reminder</button></div>';
    }
    h += '</div>';

    /* backup */
    h += '<div class="sheet"><h3>Backup</h3>' +
      '<p class="t-note" style="font-style:normal">The whole cabinet, as one small file. Worth doing occasionally.</p>' +
      '<div class="modal-actions" style="justify-content:flex-start">' +
        '<button class="btn-ghost" data-export>Save a backup</button>' +
        '<button class="btn-ghost" data-import>Restore from a backup</button>' +
      '</div><input type="file" id="importFile" accept="application/json,.json" hidden></div>';

    /* dedication — quiet, and only opens if you go looking */
    h += '<div class="dedication">' +
      '<div class="rule"></div>' +
      '<p class="eyebrow" style="margin-bottom:2px">Anserarium · vol. i · kept for Goose</p>' +
      '<button class="dedi-btn" id="dediBtn" aria-label="colophon mark" style="color:var(--accent)">' + AN.art.icon('heart') + '</button>' +
      '<div class="dedi-note" id="dediNote"><div class="dedi-inner">' +
        '<p>This was built for you on purpose, by somebody who thinks you are worth the trouble of an entire cabinet.</p>' +
        '<p>Drink the water. Eat the thing. Go outside for ten minutes. Say something to two people. Sleep. Then do one thing that is only for you.</p>' +
        '<p>That is the whole syllabus. You do not have to be good at it, and nothing in here keeps score against you.</p>' +
        '<p class="vv">I love you very very very very very much.</p>' +
        '<p class="dedi-sign">— your lovebug</p>' +
      '</div></div></div>';

    return h;
  }

  /* ═════════════════════════ MODAL ═════════════════════════ */
  function specModal(id){
    var hit = AN.find(id);
    if (!hit) return '';
    var S = AN.state.get(), have = !!S.col[id];
    var cat = AN.CATS.filter(function(c){ return c.key === hit.cat; })[0];
    if (!have){
      return '<div class="spec-art" style="opacity:.12;filter:grayscale(1)">' + AN.draw(hit.spec, hit.cat) + '</div>' +
        '<p class="spec-cat">' + esc(cat.title) + ' · not yet in the cabinet</p>' +
        '<h3 class="spec-name" style="color:var(--ink-faint)">Unrecorded</h3>' +
        '<p class="spec-fact muted" style="text-align:center">' + esc(cat.sub) + '</p>';
    }
    AN.state.markSeen(id);
    var onShow = S.display.slots.indexOf(id) >= 0;
    return '<div class="spec-art">' + AN.draw(hit.spec, hit.cat) + '</div>' +
      '<p class="spec-cat">' + esc(cat.title) + '</p>' +
      '<h3 class="spec-name">' + esc(hit.spec.name) + '</h3>' +
      '<p class="spec-latin">' + esc(hit.spec.latin) + '</p>' +
      '<div class="rule"></div>' +
      '<p class="spec-fact">' + esc(hit.spec.fact) + '</p>' +
      '<p class="spec-meta">Entered the cabinet ' + esc(S.col[id].d) + '</p>' +
      '<div class="modal-actions">' +
        '<button class="btn-ghost" data-display="' + id + '" aria-pressed="' + onShow + '">' +
          (onShow ? 'On display' : 'Put on display') + '</button></div>';
  }

  function slotPicker(idx){
    var S = AN.state.get();
    var owned = [];
    AN.CATS.forEach(function(c){
      AN.pool(c.key).forEach(function(x){ if (S.col[x.id]) owned.push({spec:x, cat:c.key}); });
    });
    var h = '<p class="spec-cat">Slot ' + (idx+1) + ' of nine</p>' +
      '<h3 class="spec-name">Choose a specimen</h3>';
    if (!owned.length) return h + '<p class="spec-fact muted" style="text-align:center">Nothing in the cabinet yet. Tick something on the register and come back.</p>';
    h += '<div class="modal-actions"><button class="btn-ghost" data-put="' + idx + '" data-id="">Leave it empty</button></div>' +
      '<div class="picker" style="margin-top:10px">';
    owned.forEach(function(o){
      h += '<button class="cell" data-put="' + idx + '" data-id="' + o.spec.id + '">' + AN.draw(o.spec, o.cat) +
        '<span class="tag">' + esc(o.spec.name) + '</span></button>';
    });
    return h + '</div>';
  }

  function setCalMonth(delta){
    /* built from year/month directly — setMonth() on the 31st rolls the
       date forward into the following month and eats the step */
    var base = calMonth ? AN.state.parseKey(calMonth + '-01') : new Date();
    calMonth = AN.state.monthKey(new Date(base.getFullYear(), base.getMonth() + delta, 1));
  }

  return {
    register:register, cabinet:cabinet, vitrine:vitrine, ledger:ledger, colophon:colophon,
    specModal:specModal, slotPicker:slotPicker, setCalMonth:setCalMonth, longDate:longDate, esc:esc,
    toggleDrawer:toggleDrawer
  };
})();
