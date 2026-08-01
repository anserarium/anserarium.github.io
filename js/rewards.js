/* ═══════════════════════════════════════════════════════════
   rewards.js — the acquisitions department
   Decides what enters the cabinet and in what order it is
   presented. Returns a queue; it does not touch the DOM.
   ═══════════════════════════════════════════════════════════ */
window.AN = window.AN || {};

AN.rewards = (function(){

  function unowned(cat){
    var S = AN.state.get();
    return AN.pool(cat).filter(function(x){ return !S.col[x.id] && !x.award; });
  }

  /* deterministic-ish shuffle so the order feels arbitrary but never repeats */
  function pick(cat){
    var list = unowned(cat);
    if (!list.length) return null;
    return list[Math.floor(Math.random()*list.length)];
  }

  /* if a drawer runs dry, take from the next one that has anything left */
  var FALLBACK = ['flora','lep','min','fauna','curio'];
  function pickAny(preferred){
    var hit = pick(preferred);
    if (hit) return {spec:hit, cat:preferred};
    for (var i=0;i<FALLBACK.length;i++){
      var c = FALLBACK[i];
      if (c === preferred) continue;
      var h = pick(c);
      if (h) return {spec:h, cat:c};
    }
    return null;
  }

  var KICKER = {
    flora:'A new pressing',
    lep:'A new specimen, pinned',
    fauna:'A new arrival',
    min:'A stone, for the work done',
    curio:'For the shelf'
  };
  var SOUND = { flora:'bell', lep:'pin', fauna:'pin', min:'seal', curio:'cloche' };

  function specimenCard(spec, cat, kicker){
    AN.state.collect(spec.id, cat);
    return {
      type:'specimen', cat:cat, spec:spec,
      kicker:kicker || KICKER[cat],
      sound:(cat === 'fauna' && /^fa2[1-6]$/.test(spec.id)) ? 'goose' : SOUND[cat],
      art:AN.draw(spec, cat)
    };
  }

  /* ── the whole evaluation, run after any change to the register ── */
  function after(wasComplete){
    var S = AN.state.get(), q = [];
    var rec = AN.state.peek(AN.state.today());
    var nowComplete = AN.state.isComplete(rec);

    /* 1. stones, for individual ticks — partial credit is credit */
    while (S.marks - S.minAt >= 5){
      S.minAt += 5;
      var m = pickAny('min');
      if (m) q.push(specimenCard(m.spec, m.cat, m.cat === 'min' ? KICKER.min : KICKER[m.cat]));
    }

    /* 2. the day's own specimens */
    if (nowComplete && !wasComplete){
      AN.state.onComplete();
      var n = S.completes;
      var f = pickAny('flora');
      if (f) q.push(specimenCard(f.spec, f.cat, f.cat === 'flora' ? 'The day’s pressing' : KICKER[f.cat]));
      if (n % 3 === 0){
        var l = pickAny('lep');
        if (l) q.push(specimenCard(l.spec, l.cat, l.cat === 'lep' ? 'Three days — a specimen for the pin board' : KICKER[l.cat]));
      }
      if (n % 7 === 0){
        var c = pickAny('fauna');
        if (c) q.push(specimenCard(c.spec, c.cat, c.cat === 'fauna' ? 'Seven days — something has moved in' : KICKER[c.cat]));
      }
    }

    /* 3. plates */
    q = q.concat(plates());
    AN.state.save();
    return q;
  }

  function plates(){
    var S = AN.state.get(), snap = AN.state.snapshot(), out = [];
    AN.ACHIEVEMENTS.forEach(function(a){
      if (S.plates[a.id]) return;
      var ok = false;
      try{ ok = !!a.test(snap); }catch(e){ ok = false; }
      if (!ok) return;
      S.plates[a.id] = AN.state.today();

      var granted = null, gcat = null;
      if (a.grants){
        var gid = a.grants.curio || a.grants.fauna || a.grants.flora || a.grants.lep || a.grants.min;
        gcat = a.grants.curio ? 'curio' : a.grants.fauna ? 'fauna' : a.grants.flora ? 'flora'
             : a.grants.lep ? 'lep' : a.grants.min ? 'min' : null;
        if (gid){
          var hit = AN.find(gid);
          if (hit && AN.state.collect(gid, gcat)) granted = hit.spec;
          else if (hit) granted = hit.spec;
        }
      }
      var unlocks = [];
      if (a.unlock){
        Object.keys(a.unlock).forEach(function(kind){
          if (AN.state.unlock(kind, a.unlock[kind])) unlocks.push({kind:kind, name:a.unlock[kind]});
        });
      }
      out.push({
        type:'plate', ach:a, spec:granted, cat:gcat, unlocks:unlocks,
        kicker:'A plate for the wall',
        sound:a.sound || 'fanfare',
        art:granted ? AN.draw(granted, gcat) : AN.art.seal()
      });
    });
    AN.state.save();
    return out;
  }

  /* what the register should dangle in front of you next */
  function nextUp(){
    var S = AN.state.get(), c = AN.state.counts();
    var toStone = 5 - ((S.marks - S.minAt) % 5);
    if (!c.complete){
      if (c.done === 0) return {txt:'One tick opens the day. Five ticks — of any kind, on any day — earns a stone.', art:null};
      var left = c.total - c.done;
      if (toStone <= left && toStone > 0)
        return {txt:'<b>'+toStone+' more tick'+(toStone>1?'s':'')+'</b> and a stone comes out of the drawer.', art:null};
      return {txt:'<b>'+left+' left</b> for a complete day, and the day’s pressing.', art:null};
    }
    var n = S.completes, to3 = 3 - (n % 3), to7 = 7 - (n % 7);
    if (n % 7 === 0) return {txt:'Seven days closed out. The cabinet is even with you.', art:null};
    if (to3 <= to7) return {txt:'<b>'+to3+' more complete day'+(to3>1?'s':'')+'</b> and something gets pinned.', art:null};
    return {txt:'<b>'+to7+' more complete day'+(to7>1?'s':'')+'</b> and something moves into the fauna drawer.', art:null};
  }

  return {after:after, plates:plates, nextUp:nextUp, pickAny:pickAny};
})();
