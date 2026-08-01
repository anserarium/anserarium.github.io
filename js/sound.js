/* ═══════════════════════════════════════════════════════════
   sound.js — the Cabinet's acoustics
   Every noise is synthesised at runtime; nothing is sampled.
   The palette is deliberately period-correct: brass, wood,
   glass, wax, paper. No arcade chimes anywhere in this house.
   ═══════════════════════════════════════════════════════════ */
window.AN = window.AN || {};

AN.sound = (function(){
  var ctx = null, master = null, on = true;

  function boot(){
    if (ctx) return ctx;
    var C = window.AudioContext || window.webkitAudioContext;
    if (!C) return null;
    ctx = new C();
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
    return ctx;
  }
  function ready(){
    if (!on) return null;
    var c = boot();
    if (!c) return null;
    if (c.state === 'suspended') c.resume();
    return c;
  }
  function t(){ return ctx.currentTime; }

  /* small reverb: a decaying noise impulse, built once */
  var verb = null;
  function reverb(){
    if (verb || !ctx) return verb;
    var len = Math.floor(ctx.sampleRate * 1.5), buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (var ch=0; ch<2; ch++){
      var d = buf.getChannelData(ch);
      for (var i=0;i<len;i++){
        var e = Math.pow(1 - i/len, 2.6);
        d[i] = (Math.random()*2-1) * e * 0.5;
      }
    }
    verb = ctx.createConvolver(); verb.buffer = buf;
    var g = ctx.createGain(); g.gain.value = 0.22;
    verb.connect(g); g.connect(master);
    return verb;
  }

  /* one struck partial */
  function partial(freq, amp, dur, type, at, detune, sendVerb){
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'sine';
    o.frequency.value = freq;
    if (detune) o.detune.value = detune;
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(Math.max(amp,0.0002), at + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    o.connect(g); g.connect(master);
    if (sendVerb){ var r = reverb(); if (r) g.connect(r); }
    o.start(at); o.stop(at + dur + 0.05);
  }

  /* filtered noise burst — wood, paper, cloth, wax */
  function noise(dur, at, filt, freq, q, amp, sweepTo){
    var len = Math.max(1, Math.floor(ctx.sampleRate * dur));
    var buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
    for (var i=0;i<len;i++) d[i] = (Math.random()*2-1);
    var src = ctx.createBufferSource(); src.buffer = buf;
    var f = ctx.createBiquadFilter(); f.type = filt || 'bandpass';
    f.frequency.setValueAtTime(freq, at);
    if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, at + dur);
    f.Q.value = q || 1;
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(amp, at + Math.min(0.012, dur*0.3));
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    src.connect(f); f.connect(g); g.connect(master);
    src.start(at); src.stop(at + dur + 0.02);
  }

  var K = {
    /* ── a graphite tick: pencil against the register ── */
    tick: function(){
      var n = t();
      noise(0.045, n, 'bandpass', 2400, 2.2, 0.11, 1500);
      partial(880, 0.035, 0.05, 'triangle', n);
    },

    /* ── the check: nib stroke, then a small brass tap ── */
    check: function(){
      var n = t();
      noise(0.085, n, 'bandpass', 1700, 1.4, 0.1, 3200);
      partial(1244.5, 0.09, 0.5, 'sine', n+0.03, 0, true);
      partial(1864.6, 0.035, 0.4, 'sine', n+0.03, 0, true);
      partial(2637,   0.016, 0.3, 'sine', n+0.03);
    },

    /* ── an undo: the nib lifted, ink blotted ── */
    uncheck: function(){
      var n = t();
      noise(0.09, n, 'lowpass', 900, 0.8, 0.075, 380);
      partial(392, 0.05, 0.16, 'triangle', n);
    },

    /* ── a pip filled: water into a glass ── */
    pip: function(i, total){
      var n = t(), step = (i||0)/Math.max(1,(total||8)-1);
      var f = 520 * Math.pow(2, step*0.75);   /* the vessel fills, pitch climbs */
      partial(f, 0.075, 0.22, 'sine', n, 0, true);
      partial(f*2.02, 0.028, 0.16, 'sine', n);
      noise(0.05, n, 'bandpass', f*3, 3, 0.045);
    },

    /* ── drawer of the cabinet sliding on its runners ── */
    drawer: function(){
      var n = t();
      noise(0.20, n, 'lowpass', 620, 0.7, 0.10, 240);
      noise(0.06, n+0.18, 'bandpass', 300, 1.2, 0.07);
      partial(96, 0.06, 0.18, 'sine', n+0.17);
    },

    /* ── a page turned ── */
    page: function(){
      var n = t();
      noise(0.14, n, 'highpass', 1500, 0.6, 0.055, 4200);
      noise(0.07, n+0.09, 'bandpass', 2600, 0.9, 0.035);
    },

    /* ── the entomological pin, pressed home into cork ── */
    pin: function(){
      var n = t();
      noise(0.035, n, 'bandpass', 3400, 3, 0.13);          /* steel */
      noise(0.10, n+0.015, 'lowpass', 500, 0.9, 0.08, 200);/* cork */
      partial(2093, 0.05, 0.3, 'sine', n, 0, true);
    },

    /* ── glass cloche set down over a specimen ── */
    cloche: function(){
      var n = t();
      partial(1567.98, 0.10, 1.5, 'sine', n, 0, true);
      partial(2349.3,  0.05, 1.2, 'sine', n, 4, true);
      partial(3135.9,  0.028, 0.9, 'sine', n, -5, true);
      partial(4186,    0.012, 0.6, 'sine', n);
      noise(0.02, n, 'highpass', 6000, 1, 0.05);
    },

    /* ── brass hand-bell: the daily register completed ── */
    bell: function(){
      var n = t(), f = 659.25;                              /* E5 */
      [[1,0.12,2.4],[2.005,0.07,1.9],[2.98,0.045,1.5],[4.02,0.028,1.1],[5.43,0.016,0.8],[6.79,0.01,0.6]]
        .forEach(function(p){ partial(f*p[0], p[1], p[2], 'sine', n, (Math.random()*8-4), true); });
      noise(0.03, n, 'bandpass', 5200, 2, 0.06);
    },

    /* ── the wax seal: a soft press and a settling ── */
    seal: function(){
      var n = t();
      noise(0.13, n, 'lowpass', 420, 0.8, 0.12, 150);
      partial(146.83, 0.10, 0.32, 'sine', n);
      partial(220,    0.04, 0.22, 'triangle', n+0.01);
    },

    /* ── a small ascending figure: a milestone entered in the ledger ── */
    fanfare: function(){
      var n = t(), sc = [523.25, 659.25, 783.99, 1046.5];   /* C E G C */
      sc.forEach(function(f,i){
        partial(f, 0.085 - i*0.012, 1.2, 'sine', n + i*0.115, 0, true);
        partial(f*2, 0.03, 0.7, 'sine', n + i*0.115, 3, true);
      });
      noise(0.04, n+0.345, 'bandpass', 4800, 2, 0.05);
    },

    /* ── the goose. obviously the goose gets its own sound. ── */
    goose: function(){
      var n = t();
      var o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(300, n);
      o.frequency.exponentialRampToValueAtTime(430, n+0.07);
      o.frequency.exponentialRampToValueAtTime(250, n+0.26);
      f.type = 'bandpass'; f.frequency.value = 1100; f.Q.value = 3.4;
      g.gain.setValueAtTime(0.0001, n);
      g.gain.exponentialRampToValueAtTime(0.085, n+0.035);
      g.gain.setValueAtTime(0.085, n+0.16);
      g.gain.exponentialRampToValueAtTime(0.0001, n+0.30);
      o.connect(f); f.connect(g); g.connect(master);
      var r = reverb(); if (r) g.connect(r);
      o.start(n); o.stop(n+0.35);
    },

    /* ── the lovebug's own note: a private, warm fifth ── */
    heart: function(){
      var n = t();
      partial(329.63, 0.075, 1.9, 'sine', n, 0, true);
      partial(493.88, 0.06,  2.2, 'sine', n+0.09, 0, true);
      partial(659.25, 0.04,  2.4, 'sine', n+0.18, 0, true);
      partial(987.77, 0.018, 1.6, 'sine', n+0.27, 0, true);
    }
  };

  var api = {};
  Object.keys(K).forEach(function(k){
    api[k] = function(a,b){ if (!ready()) return; try{ K[k](a,b); }catch(e){} };
  });
  api.enabled = function(v){
    if (v === undefined) return on;
    on = !!v;
    if (on) ready();
    return on;
  };
  api.unlock = function(){ ready(); };
  api.buzz = function(pattern){
    try{ if (navigator.vibrate) navigator.vibrate(pattern); }catch(e){}
  };
  return api;
})();
