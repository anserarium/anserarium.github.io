/* ═══════════════════════════════════════════════════════════
   art.js — the illustrator
   Every specimen in this cabinet is drawn at runtime from its
   own parameters. Nothing is an image file; nothing is fetched.
   viewBox is always 0 0 100 100.
   ═══════════════════════════════════════════════════════════ */
window.AN = window.AN || {};

AN.art = (function(){
  var uid = 0;
  function id(){ return 'a' + (++uid); }

  /* ── colour helpers ─────────────────────────────────────── */
  function hx2(c){
    c = c.replace('#','');
    if (c.length === 3) c = c[0]+c[0]+c[1]+c[1]+c[2]+c[2];
    return [parseInt(c.slice(0,2),16), parseInt(c.slice(2,4),16), parseInt(c.slice(4,6),16)];
  }
  function s2hx(r,g,b){
    function p(v){ v = Math.max(0, Math.min(255, Math.round(v))); return (v<16?'0':'') + v.toString(16); }
    return '#' + p(r)+p(g)+p(b);
  }
  function dk(c, a){ var v = hx2(c); return s2hx(v[0]*(1-a), v[1]*(1-a), v[2]*(1-a)); }
  function lt(c, a){ var v = hx2(c); return s2hx(v[0]+(255-v[0])*a, v[1]+(255-v[1])*a, v[2]+(255-v[2])*a); }
  function mix(c1, c2, a){
    var x = hx2(c1), y = hx2(c2);
    return s2hx(x[0]+(y[0]-x[0])*a, x[1]+(y[1]-x[1])*a, x[2]+(y[2]-x[2])*a);
  }

  /* ── deterministic noise, so a specimen always looks the same ── */
  function seedOf(str){
    var h = 2166136261;
    for (var i=0;i<str.length;i++){ h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function prng(seed){
    var s = seed >>> 0;
    return function(){
      s |= 0; s = s + 0x6D2B79F5 | 0;
      var x = Math.imul(s ^ s >>> 15, 1 | s);
      x = x + Math.imul(x ^ x >>> 7, 61 | x) ^ x;
      return ((x ^ x >>> 14) >>> 0) / 4294967296;
    };
  }
  function n(v){ return Math.round(v*100)/100; }

  /* ── wrapper ────────────────────────────────────────────── */
  function wrap(inner){
    return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' + inner + '</svg>';
  }
  function sheen(gid, c, soft){
    return '<radialGradient id="'+gid+'" cx="34%" cy="26%" r="78%">' +
      '<stop offset="0%" stop-color="'+lt(c, soft===undefined?0.42:soft)+'"/>' +
      '<stop offset="58%" stop-color="'+c+'"/>' +
      '<stop offset="100%" stop-color="'+dk(c,0.34)+'"/></radialGradient>';
  }

  /* ═══════════════════════════════════════════════════════════
     FLORA — pressed plants
     ═══════════════════════════════════════════════════════════ */
  function petal(L, w, waist, tipW, notch){
    var cw = w*waist, tw = w*tipW;
    if (notch){
      return 'M0,0C'+n(-cw)+','+n(-L*.3)+' '+n(-w)+','+n(-L*.6)+' '+n(-w*.6)+','+n(-L*.9)+
             'C'+n(-w*.42)+','+n(-L*1.03)+' '+n(-w*.15)+','+n(-L*.98)+' 0,'+n(-L*.85)+
             'C'+n(w*.15)+','+n(-L*.98)+' '+n(w*.42)+','+n(-L*1.03)+' '+n(w*.6)+','+n(-L*.9)+
             'C'+n(w)+','+n(-L*.6)+' '+n(cw)+','+n(-L*.3)+' 0,0Z';
    }
    return 'M0,0C'+n(-cw)+','+n(-L*.32)+' '+n(-w)+','+n(-L*.66)+' '+n(-tw)+','+n(-L*.93)+
           'C'+n(-tw*.55)+','+n(-L*1.02)+' '+n(tw*.55)+','+n(-L*1.02)+' '+n(tw)+','+n(-L*.93)+
           'C'+n(w)+','+n(-L*.66)+' '+n(cw)+','+n(-L*.32)+' 0,0Z';
  }

  function leafPath(L, w, kind){
    if (kind === 'grass') return 'M0,0C'+n(w*.5)+','+n(-L*.4)+' '+n(w*.4)+','+n(-L*.8)+' 0,'+n(-L)+
                                 'C'+n(-w*.15)+','+n(-L*.8)+' '+n(-w*.2)+','+n(-L*.4)+' 0,0Z';
    if (kind === 'lance') return 'M0,0C'+n(w*.7)+','+n(-L*.3)+' '+n(w*.5)+','+n(-L*.75)+' 0,'+n(-L)+
                                 'C'+n(-w*.5)+','+n(-L*.75)+' '+n(-w*.7)+','+n(-L*.3)+' 0,0Z';
    if (kind === 'heart') return 'M0,0C'+n(w*1.05)+','+n(-L*.22)+' '+n(w*.95)+','+n(-L*.85)+' 0,'+n(-L)+
                                 'C'+n(-w*.95)+','+n(-L*.85)+' '+n(-w*1.05)+','+n(-L*.22)+' 0,0Z';
    if (kind === 'lobed') return 'M0,0C'+n(w)+','+n(-L*.12)+' '+n(w*.5)+','+n(-L*.4)+' '+n(w*.9)+','+n(-L*.55)+
                                 'C'+n(w*.45)+','+n(-L*.66)+' '+n(w*.4)+','+n(-L*.88)+' 0,'+n(-L)+
                                 'C'+n(-w*.4)+','+n(-L*.88)+' '+n(-w*.45)+','+n(-L*.66)+' '+n(-w*.9)+','+n(-L*.55)+
                                 'C'+n(-w*.5)+','+n(-L*.4)+' '+n(-w)+','+n(-L*.12)+' 0,0Z';
    /* ovate */
    return 'M0,0C'+n(w)+','+n(-L*.28)+' '+n(w*.62)+','+n(-L*.82)+' 0,'+n(-L)+
           'C'+n(-w*.62)+','+n(-L*.82)+' '+n(-w)+','+n(-L*.28)+' 0,0Z';
  }

  function floret(cx, cy, r, c1, c2, pc){
    var o = '', k = pc || 5;
    for (var i=0;i<k;i++){
      o += '<ellipse cx="'+n(cx)+'" cy="'+n(cy - r*.62)+'" rx="'+n(r*.45)+'" ry="'+n(r*.66)+'" fill="'+c1+'" '+
           'transform="rotate('+n(i*360/k)+' '+n(cx)+' '+n(cy)+')"/>';
    }
    o += '<circle cx="'+n(cx)+'" cy="'+n(cy)+'" r="'+n(r*.3)+'" fill="'+c2+'"/>';
    return o;
  }

  function flower(p, key){
    var R = prng(seedOf(key || p.name || 'f'));
    var stemC = p.stem || '#6E7A52';
    var cx = 50, cy = p.cy || 38;
    var pc = p.p || 5, form = p.form || 'simple';
    var c1 = p.c1, c2 = p.c2 || lt(p.c1, .32), ctr = p.ctr || '#C8A83E';
    var g1 = id(), out = '';

    out += '<defs>' + sheen(g1, c1, .34) +
      '<linearGradient id="'+g1+'s" x1="0" y1="1" x2="0" y2="0">' +
      '<stop offset="0%" stop-color="'+dk(stemC,.22)+'"/><stop offset="100%" stop-color="'+lt(stemC,.16)+'"/>' +
      '</linearGradient></defs>';

    /* stem */
    var bend = (R()*10-5);
    out += '<path d="M50,96 C'+n(50+bend)+',82 '+n(cx+bend*.4)+',60 '+cx+','+n(cy+4)+'" fill="none" ' +
           'stroke="url(#'+g1+'s)" stroke-width="'+(p.thick||2.4)+'" stroke-linecap="round"/>';

    /* leaves */
    if (p.leaf !== 'none'){
      var lk = p.leaf || 'ovate', ln = p.leaves === undefined ? 2 : p.leaves;
      for (var li=0; li<ln; li++){
        var side = li%2 ? 1 : -1, ly = 84 - li*15, ang = side*(46 + R()*18), sc = 1 - li*.13;
        out += '<g transform="translate('+n(50+bend*.55)+','+ly+') rotate('+n(ang)+') scale('+n(sc)+')">' +
               '<path d="'+leafPath(p.lL||20, p.lW||7, lk)+'" fill="'+(p.leafC||mix(stemC,'#8FA06A',.4))+'" ' +
               'stroke="'+dk(stemC,.3)+'" stroke-width=".5"/>' +
               '<path d="M0,0L0,'+n(-(p.lL||20)*.9)+'" stroke="'+dk(stemC,.34)+'" stroke-width=".45" opacity=".7"/></g>';
      }
    }

    /* the bloom */
    if (form === 'umbel'){
      var fn = p.florets || 13;
      for (var u=0; u<fn; u++){
        var ua = (u/fn)*Math.PI*2, ur = 14 + (u%3)*3.4;
        var ux = cx + Math.cos(ua)*ur*1.06, uy = cy + Math.sin(ua)*ur*.62;
        out += '<path d="M'+cx+','+n(cy+6)+'Q'+n((cx+ux)/2)+','+n(cy+2)+' '+n(ux)+','+n(uy)+'" fill="none" stroke="'+stemC+'" stroke-width=".7"/>';
      }
      for (var u2=0; u2<fn; u2++){
        var a2 = (u2/fn)*Math.PI*2, r2 = 14 + (u2%3)*3.4;
        out += floret(cx + Math.cos(a2)*r2*1.06, cy + Math.sin(a2)*r2*.62, 4.4, c1, ctr, 5);
      }
      out += floret(cx, cy, 4.4, c1, ctr, 5);

    } else if (form === 'spike'){
      var rows = p.rows || 7;
      for (var s=0; s<rows; s++){
        var sy = cy - 14 + s*5.6, sw = 13 * (1 - Math.abs(s-rows*.42)/rows*.75);
        out += floret(cx - sw, sy, 3.6 - s*.1, c1, c2, 4);
        out += floret(cx + sw, sy, 3.6 - s*.1, c1, c2, 4);
        if (s%2) out += floret(cx, sy - 2, 3.2, mix(c1,c2,.4), ctr, 4);
      }
    } else if (form === 'bell'){
      var bn = p.bells || 3;
      for (var b=0; b<bn; b++){
        var bx = cx + (b - (bn-1)/2) * 15, by = cy + 4 + (b%2)*6;
        out += '<path d="M'+n(bx)+','+n(by-14)+'C'+n(bx-8)+','+n(by-8)+' '+n(bx-9)+','+n(by+6)+' '+n(bx-6)+','+n(by+10)+
               'C'+n(bx-2)+','+n(by+13)+' '+n(bx+2)+','+n(by+13)+' '+n(bx+6)+','+n(by+10)+
               'C'+n(bx+9)+','+n(by+6)+' '+n(bx+8)+','+n(by-8)+' '+n(bx)+','+n(by-14)+'Z" ' +
               'fill="url(#'+g1+')" stroke="'+dk(c1,.32)+'" stroke-width=".5"/>';
        out += '<path d="M'+n(bx-6)+','+n(by+10)+'Q'+n(bx)+','+n(by+14)+' '+n(bx+6)+','+n(by+10)+'" fill="'+c2+'" opacity=".85"/>';
      }
    } else if (form === 'cup'){
      var cn = p.p || 6;
      for (var q=0; q<cn; q++){
        out += '<g transform="translate('+cx+','+n(cy+13)+') rotate('+n((q-(cn-1)/2)*17)+')">' +
               '<path d="'+petal(p.L||30, (p.w||11), .34, .5, false)+'" fill="'+(q%2?c2:'url(#'+g1+')')+'" ' +
               'stroke="'+dk(c1,.3)+'" stroke-width=".5"/></g>';
      }
    } else if (form === 'pompom'){
      var layers = 3;
      for (var y=layers; y>=1; y--){
        var count = 6 + y*3, L = (p.L||17) * (y/layers);
        for (var i=0;i<count;i++){
          out += '<g transform="translate('+cx+','+cy+') rotate('+n(i*360/count + y*11)+')">' +
                 '<path d="'+petal(L, L*.42, .5, .55, false)+'" fill="'+mix(c1,c2, 1 - y/layers)+'" opacity=".95"/></g>';
        }
      }
      out += '<circle cx="'+cx+'" cy="'+cy+'" r="3" fill="'+ctr+'"/>';
    } else {
      /* simple / composite / star / ray */
      var L = p.L || (form === 'composite' ? 26 : 24);
      var w = p.w || (form === 'composite' ? 4.6 : 9);
      if (form === 'star'){ w = p.w || 5; }
      var back = (form === 'composite' || pc > 8);
      if (back){
        for (var k=0;k<pc;k++){
          out += '<g transform="translate('+cx+','+cy+') rotate('+n(k*360/pc + 180/pc)+')">' +
                 '<path d="'+petal(L*.88, w, .42, p.tipW===undefined?.42:p.tipW, false)+'" fill="'+dk(c2,.1)+'" opacity=".8"/></g>';
        }
      }
      for (var j=0;j<pc;j++){
        var jit = (R()*7-3.5);
        out += '<g transform="translate('+cx+','+cy+') rotate('+n(j*360/pc + jit)+')">' +
               '<path d="'+petal(L, w, .42, p.tipW===undefined?.42:p.tipW, !!p.notch)+'" ' +
               'fill="url(#'+g1+')" stroke="'+dk(c1,.28)+'" stroke-width=".45" stroke-opacity=".65"/>' +
               '<path d="M0,'+n(-L*.12)+'L0,'+n(-L*.82)+'" stroke="'+dk(c1,.34)+'" stroke-width=".4" opacity=".45"/></g>';
      }
      /* centre */
      var cs = p.ctrStyle || (form === 'composite' ? 'disc' : 'boss');
      if (cs === 'disc'){
        out += '<circle cx="'+cx+'" cy="'+cy+'" r="'+(p.cr||8)+'" fill="'+ctr+'"/>';
        out += '<circle cx="'+cx+'" cy="'+cy+'" r="'+(p.cr||8)+'" fill="none" stroke="'+dk(ctr,.35)+'" stroke-width=".6"/>';
        for (var d=0; d<26; d++){
          var da = R()*Math.PI*2, dr = Math.sqrt(R())*((p.cr||8)-1.4);
          out += '<circle cx="'+n(cx+Math.cos(da)*dr)+'" cy="'+n(cy+Math.sin(da)*dr)+'" r=".8" fill="'+dk(ctr,.34)+'" opacity=".75"/>';
        }
      } else if (cs === 'stamens'){
        for (var m=0;m<9;m++){
          var ma = m*40 + 10, mx = cx + Math.cos(ma*Math.PI/180)*7.5, my = cy + Math.sin(ma*Math.PI/180)*7.5;
          out += '<path d="M'+cx+','+cy+'L'+n(mx)+','+n(my)+'" stroke="'+dk(ctr,.2)+'" stroke-width=".7"/>' +
                 '<circle cx="'+n(mx)+'" cy="'+n(my)+'" r="1.7" fill="'+ctr+'"/>';
        }
        out += '<circle cx="'+cx+'" cy="'+cy+'" r="2.6" fill="'+lt(ctr,.3)+'"/>';
      } else {
        out += '<circle cx="'+cx+'" cy="'+cy+'" r="'+(p.cr||5)+'" fill="'+ctr+'"/>';
        out += '<circle cx="'+n(cx-1.2)+'" cy="'+n(cy-1.4)+'" r="'+((p.cr||5)*.42)+'" fill="'+lt(ctr,.45)+'" opacity=".8"/>';
      }
    }
    return wrap(out);
  }

  /* ═══════════════════════════════════════════════════════════
     LEPIDOPTERA — pinned butterflies & moths
     ═══════════════════════════════════════════════════════════ */
  function lep(p, key){
    var R = prng(seedOf(key || p.name || 'l'));
    var moth = !!p.moth;
    var c1 = p.c1, c2 = p.c2 || lt(p.c1,.3), c3 = p.c3 || dk(p.c1,.36);
    var bodyC = p.body || dk(p.c1,.5);
    var cp = id(), gf = id(), gh = id();

    var span = p.span || (moth ? 40 : 38);
    var fwY  = p.fwY  || (moth ? -13 : -22);
    var apex = p.apex === undefined ? 1 : p.apex;
    var hw   = p.hw || (moth ? 30 : 30);
    var tail = p.tail || 0;

    /* forewing, right side, origin at thorax */
    var fw = 'M0,-13'+
      'C'+n(span*.26)+','+n(fwY*1.16)+' '+n(span*.7)+','+n(fwY*1.3*apex)+' '+n(span)+','+n(fwY*.95*apex)+
      'C'+n(span*1.06)+','+n(fwY*.45)+' '+n(span*.9)+','+n(-2)+' '+n(span*.52)+',3.4'+
      'C'+n(span*.3)+',5.4 '+n(span*.1)+',3 0,1Z';

    /* hindwing, right side */
    var hwd = 'M0,0'+
      'C'+n(hw*.3)+',1 '+n(hw*.86)+','+n(2)+' '+n(hw)+','+n(11)+
      'C'+n(hw*1.02)+','+n(18)+' '+n(hw*.66)+','+n(24+tail*.4)+' '+n(hw*.34+tail*.2)+','+n(26+tail)+
      'C'+n(hw*.2)+','+n(22)+' '+n(hw*.08)+','+n(12)+' 0,7Z';

    var o = '<defs>' +
      '<linearGradient id="'+gf+'" x1="0" y1="0" x2="1" y2=".4">' +
        '<stop offset="0%" stop-color="'+c2+'"/><stop offset="55%" stop-color="'+c1+'"/><stop offset="100%" stop-color="'+c3+'"/></linearGradient>' +
      '<linearGradient id="'+gh+'" x1="0" y1="0" x2=".6" y2="1">' +
        '<stop offset="0%" stop-color="'+lt(c1,.12)+'"/><stop offset="100%" stop-color="'+(p.hc||c3)+'"/></linearGradient>' +
      '<clipPath id="'+cp+'"><path d="'+fw+'"/><path d="'+hwd+'" transform="translate(0,2)"/></clipPath>' +
      '</defs>';

    /* pattern drawn inside a clipped group, mirrored with the wings */
    function pattern(){
      var s = '', pat = p.pat || 'plain', pc = p.patc || dk(c1,.55);
      if (pat === 'bands'){
        s += '<path d="M'+n(span*.2)+',-40L'+n(span*.42)+',-40L'+n(span*.3)+',34L'+n(span*.08)+',34Z" fill="'+pc+'" opacity=".8"/>';
        s += '<path d="M'+n(span*.6)+',-40L'+n(span*.76)+',-40L'+n(span*.66)+',34L'+n(span*.5)+',34Z" fill="'+pc+'" opacity=".55"/>';
      } else if (pat === 'edge'){
        s += '<path d="'+fw+'" fill="none" stroke="'+pc+'" stroke-width="7" opacity=".85"/>';
        s += '<path d="'+hwd+'" transform="translate(0,2)" fill="none" stroke="'+pc+'" stroke-width="6" opacity=".8"/>';
      } else if (pat === 'tips'){
        s += '<path d="M'+n(span*.62)+','+n(fwY*1.5)+'L'+n(span*1.2)+','+n(fwY*1.5)+'L'+n(span*1.2)+',6L'+n(span*.78)+',6Z" fill="'+pc+'" opacity=".9"/>';
      } else if (pat === 'spots'){
        for (var i=0;i<7;i++){
          var sx = span*(.24 + R()*.62), sy = -30 + R()*54;
          s += '<circle cx="'+n(sx)+'" cy="'+n(sy)+'" r="'+n(1.6+R()*2.6)+'" fill="'+pc+'" opacity=".85"/>';
        }
      } else if (pat === 'eyespots'){
        s += '<circle cx="'+n(span*.62)+'" cy="'+n(fwY*.55)+'" r="5.6" fill="'+pc+'"/>' +
             '<circle cx="'+n(span*.62)+'" cy="'+n(fwY*.55)+'" r="2.6" fill="'+lt(c2,.6)+'"/>' +
             '<circle cx="'+n(span*.62)+'" cy="'+n(fwY*.55)+'" r="1" fill="#1B140E"/>';
        s += '<circle cx="'+n(hw*.56)+'" cy="17" r="4.6" fill="'+pc+'"/>' +
             '<circle cx="'+n(hw*.56)+'" cy="17" r="2" fill="'+lt(c2,.6)+'"/>';
      } else if (pat === 'veins'){
        for (var v=0; v<7; v++){
          s += '<path d="M0,-6 L'+n(span*1.05*Math.cos((v*13-8)*Math.PI/180))+','+n(-40+v*11)+'" stroke="'+pc+'" stroke-width="1.1" opacity=".65" fill="none"/>';
        }
        for (var v2=0; v2<5; v2++){
          s += '<path d="M0,4 L'+n(hw*1.05)+','+n(6+v2*6)+'" stroke="'+pc+'" stroke-width="1" opacity=".55" fill="none"/>';
        }
      } else if (pat === 'marble'){
        for (var m=0;m<9;m++){
          var mx = span*(.1+R()*.85), my = -34 + R()*62;
          s += '<ellipse cx="'+n(mx)+'" cy="'+n(my)+'" rx="'+n(2+R()*5)+'" ry="'+n(1.4+R()*3)+'" fill="'+pc+'" opacity="'+n(.3+R()*.4)+'" transform="rotate('+n(R()*180)+' '+n(mx)+' '+n(my)+')"/>';
        }
      } else if (pat === 'stripes'){
        for (var t2=0;t2<6;t2++){
          s += '<path d="M'+n(-4+t2*3)+',-42L'+n(4+t2*9)+',36" stroke="'+pc+'" stroke-width="'+n(1.6+ (t2%2)*1.6)+'" opacity=".8" fill="none"/>';
        }
      } else if (pat === 'lace'){
        for (var q=0;q<14;q++){
          s += '<circle cx="'+n(span*(.15+R()*.8))+'" cy="'+n(-32+R()*60)+'" r="'+n(1+R()*1.8)+'" fill="none" stroke="'+pc+'" stroke-width=".9" opacity=".7"/>';
        }
      }
      /* every wing gets a pale outer margin fleck row */
      if (p.fleck !== false){
        for (var f=0; f<8; f++){
          s += '<circle cx="'+n(span*(.86 + R()*.16))+'" cy="'+n(fwY + f*5.4)+'" r="'+n(.7+R()*.7)+'" fill="'+lt(c2,.7)+'" opacity=".7"/>';
        }
      }
      return s;
    }

    function side(sign){
      var g = '<g transform="translate(50,50)' + (sign<0 ? ' scale(-1,1)' : '') + '">';
      g += '<path d="'+hwd+'" transform="translate(0,2)" fill="url(#'+gh+')" stroke="'+dk(c1,.5)+'" stroke-width=".55"/>';
      g += '<path d="'+fw+'" fill="url(#'+gf+')" stroke="'+dk(c1,.5)+'" stroke-width=".55"/>';
      g += '<g clip-path="url(#'+cp+')">'+pattern()+'</g>';
      g += '<path d="'+fw+'" fill="none" stroke="'+dk(c1,.55)+'" stroke-width=".55"/>';
      g += '</g>';
      return g;
    }

    o += side(-1) + side(1);

    /* body */
    var bl = moth ? 22 : 24, bw = moth ? 4.4 : 2.8;
    o += '<ellipse cx="50" cy="'+n(50 - bl*.32)+'" rx="'+n(bw*1.25)+'" ry="'+n(bl*.24)+'" fill="'+lt(bodyC,.1)+'"/>';
    o += '<path d="M50,'+n(50-bl*.55)+'C'+n(50-bw)+','+n(50-bl*.2)+' '+n(50-bw*.7)+','+n(50+bl*.5)+' 50,'+n(50+bl*.62)+
         'C'+n(50+bw*.7)+','+n(50+bl*.5)+' '+n(50+bw)+','+n(50-bl*.2)+' 50,'+n(50-bl*.55)+'Z" fill="'+bodyC+'"/>';
    for (var sg=0; sg<6; sg++){
      o += '<path d="M'+n(50-bw*.8)+','+n(50-bl*.1+sg*2.5)+'Q50,'+n(50-bl*.1+sg*2.5+.9)+' '+n(50+bw*.8)+','+n(50-bl*.1+sg*2.5)+'" stroke="'+dk(bodyC,.3)+'" stroke-width=".5" fill="none" opacity=".7"/>';
    }
    if (moth){
      for (var fz=0; fz<10; fz++){
        var fa = fz*36, fr = 5.2;
        o += '<path d="M50,'+n(50-bl*.34)+'l'+n(Math.cos(fa*Math.PI/180)*fr)+','+n(Math.sin(fa*Math.PI/180)*fr*.7)+'" stroke="'+lt(bodyC,.22)+'" stroke-width=".9" opacity=".55"/>';
      }
    }
    /* head + eyes */
    o += '<circle cx="50" cy="'+n(50-bl*.62)+'" r="'+n(bw*.95)+'" fill="'+dk(bodyC,.15)+'"/>';
    /* antennae */
    var ay = 50 - bl*.68;
    if (moth && p.plumed !== false){
      [-1,1].forEach(function(s){
        o += '<path d="M50,'+n(ay)+'Q'+n(50+s*9)+','+n(ay-7)+' '+n(50+s*15)+','+n(ay-3)+'" fill="none" stroke="'+dk(bodyC,.1)+'" stroke-width=".9"/>';
        for (var b2=1;b2<7;b2++){
          var bx = 50 + s*(3+b2*1.9), by = ay - 2.6 - Math.sin(b2/7*Math.PI)*4.4;
          o += '<path d="M'+n(bx)+','+n(by)+'l'+n(s*1.2)+',2.6M'+n(bx)+','+n(by)+'l'+n(s*1.2)+',-2.6" stroke="'+dk(bodyC,.05)+'" stroke-width=".55" opacity=".8"/>';
        }
      });
    } else {
      [-1,1].forEach(function(s){
        o += '<path d="M50,'+n(ay)+'Q'+n(50+s*8)+','+n(ay-11)+' '+n(50+s*13)+','+n(ay-15)+'" fill="none" stroke="'+dk(bodyC,.1)+'" stroke-width=".85" stroke-linecap="round"/>';
        o += '<ellipse cx="'+n(50+s*13.4)+'" cy="'+n(ay-15.4)+'" rx="1.5" ry="1" fill="'+dk(bodyC,.1)+'" transform="rotate('+n(s*-30)+' '+n(50+s*13.4)+' '+n(ay-15.4)+')"/>';
      });
    }
    return wrap(o);
  }

  /* ═══════════════════════════════════════════════════════════
     FAUNA — the critters
     ═══════════════════════════════════════════════════════════ */
  var F = {};

  F.beetle = function(p, R){
    var c = p.c1, g = id(), o = '<defs>'+sheen(g, c, p.metal? .62 : .3)+'</defs>';
    var W = p.w || 24, H = p.h || 30, cy = 54;
    /* legs */
    for (var s=-1;s<=1;s+=2){
      for (var l=0;l<3;l++){
        var ly = cy - 12 + l*11, out = W*(l===1?1.55:1.32), dy = 10 + l*3;
        o += '<path d="M'+n(50+s*W*.5)+','+n(ly)+'Q'+n(50+s*out)+','+n(ly+2)+' '+n(50+s*out*.92)+','+n(ly+dy)+'" fill="none" stroke="'+dk(c,.62)+'" stroke-width="1.8" stroke-linecap="round"/>';
      }
    }
    /* head */
    o += '<ellipse cx="50" cy="'+n(cy-H*.72)+'" rx="'+n(W*.44)+'" ry="'+n(W*.34)+'" fill="'+dk(c,.55)+'"/>';
    /* horns — laid out in absolute coordinates so they always fit the plate */
    var hb = cy - H*.78;                      /* where a horn leaves the head */
    if (p.horn === 'rhino'){
      /* one heavy cephalic horn, thick at the base, forked at the tip —
         drawn as a single silhouette so it reads as a horn, not antennae */
      o += '<path d="M44.6,'+n(hb+4)+
           'C44.2,'+n(hb-3)+' 44.4,'+n(hb-9)+' 42.8,'+n(hb-15)+
           'C41.6,'+n(hb-20)+' 40.4,'+n(hb-23)+' 38.6,'+n(hb-26)+
           'C42,'+n(hb-23)+' 45.4,'+n(hb-19)+' 47.6,'+n(hb-15)+
           'L50,'+n(hb-12)+'L52.4,'+n(hb-15)+
           'C54.6,'+n(hb-19)+' 58,'+n(hb-23)+' 61.4,'+n(hb-26)+
           'C59.6,'+n(hb-23)+' 58.4,'+n(hb-20)+' 57.2,'+n(hb-15)+
           'C55.6,'+n(hb-9)+' 55.8,'+n(hb-3)+' 55.4,'+n(hb+4)+'Z" ' +
           'fill="'+lt(dk(c,.42),.16)+'" stroke="'+dk(c,.64)+'" stroke-width=".6" stroke-linejoin="round"/>';
      /* a highlight down the ridge, so the horn has a front and a side */
      o += '<path d="M48.6,'+n(hb+3)+'C48.2,'+n(hb-4)+' 48.4,'+n(hb-10)+' 47.2,'+n(hb-15)+
           'C48.6,'+n(hb-13)+' 49.4,'+n(hb-13)+' 50,'+n(hb-12)+
           'C50.6,'+n(hb-13)+' 51.4,'+n(hb-13)+' 52.8,'+n(hb-15)+
           'C51.6,'+n(hb-10)+' 51.8,'+n(hb-4)+' 51.4,'+n(hb+3)+'Z" fill="'+lt(dk(c,.3),.3)+'" opacity=".55"/>';
      /* the smaller thoracic horn, angled forward from the shoulder */
      o += '<path d="M58,'+n(hb+9)+'C62,'+n(hb+3)+' 65,'+n(hb-1)+' 68,'+n(hb-4)+
           'C65.4,'+n(hb+2)+' 63,'+n(hb+6)+' 61,'+n(hb+11)+'Z" fill="'+dk(c,.5)+'"/>';
    } else if (p.horn === 'stag'){
      [-1,1].forEach(function(s){
        o += '<path d="M'+n(50+s*4)+','+n(hb+2)+'C'+n(50+s*15)+','+n(hb-4)+' '+n(50+s*18)+','+n(hb-14)+' '+n(50+s*11)+','+n(hb-22)+
             '" fill="none" stroke="'+dk(c,.5)+'" stroke-width="2.6" stroke-linecap="round"/>';
        o += '<path d="M'+n(50+s*17)+','+n(hb-9)+'l'+n(-s*7)+',-3" stroke="'+dk(c,.5)+'" stroke-width="1.7" stroke-linecap="round"/>';
        o += '<path d="M'+n(50+s*15)+','+n(hb-17)+'l'+n(-s*6)+',-2" stroke="'+dk(c,.5)+'" stroke-width="1.5" stroke-linecap="round"/>';
      });
    } else if (p.horn === 'snout'){
      o += '<path d="M50,'+n(hb+2)+'C49,'+n(hb-6)+' 48.6,'+n(hb-11)+' 48,'+n(hb-15)+'" stroke="'+dk(c,.5)+'" stroke-width="2.8" stroke-linecap="round" fill="none"/>';
      o += '<path d="M42,'+n(hb-2)+'l-5,-4M58,'+n(hb-2)+'l5,-4" stroke="'+dk(c,.5)+'" stroke-width="1.6" stroke-linecap="round"/>';
    } else {
      [-1,1].forEach(function(s){
        o += '<path d="M'+n(50+s*3)+','+n(cy-H*.84)+'Q'+n(50+s*10)+','+n(cy-H*1.06)+' '+n(50+s*11)+','+n(cy-H*1.28)+'" fill="none" stroke="'+dk(c,.55)+'" stroke-width="1.2" stroke-linecap="round"/>';
      });
    }
    /* pronotum */
    o += '<path d="M'+n(50-W*.62)+','+n(cy-H*.34)+'C'+n(50-W*.66)+','+n(cy-H*.62)+' '+n(50-W*.34)+','+n(cy-H*.72)+' 50,'+n(cy-H*.72)+
         'C'+n(50+W*.34)+','+n(cy-H*.72)+' '+n(50+W*.66)+','+n(cy-H*.62)+' '+n(50+W*.62)+','+n(cy-H*.34)+'Z" fill="'+dk(c,.42)+'"/>';
    /* elytra */
    o += '<path d="M'+n(50-W*.66)+','+n(cy-H*.36)+'C'+n(50-W*.78)+','+n(cy+H*.1)+' '+n(50-W*.5)+','+n(cy+H*.52)+' 50,'+n(cy+H*.56)+
         'C'+n(50+W*.5)+','+n(cy+H*.52)+' '+n(50+W*.78)+','+n(cy+H*.1)+' '+n(50+W*.66)+','+n(cy-H*.36)+'Z" fill="url(#'+g+')" stroke="'+dk(c,.55)+'" stroke-width=".6"/>';
    o += '<path d="M50,'+n(cy-H*.36)+'L50,'+n(cy+H*.55)+'" stroke="'+dk(c,.6)+'" stroke-width=".8"/>';
    if (p.pat === 'spots'){
      [[-.3,-.06],[.3,-.06],[-.34,.2],[.34,.2],[0,.34],[-.24,-.26],[.24,-.26]].forEach(function(sp){
        o += '<circle cx="'+n(50+sp[0]*W*2)+'" cy="'+n(cy+sp[1]*H*2)+'" r="'+n(W*.13)+'" fill="'+(p.spot||'#241A12')+'"/>';
      });
    } else if (p.pat === 'stripes'){
      [-.42,-.16,.16,.42].forEach(function(f){
        o += '<path d="M'+n(50+f*W)+','+n(cy-H*.34)+'C'+n(50+f*W*1.1)+','+n(cy+H*.06)+' '+n(50+f*W*.9)+','+n(cy+H*.3)+' '+n(50+f*W*.62)+','+n(cy+H*.5)+'" stroke="'+(p.spot||dk(c,.6))+'" stroke-width="1.8" fill="none" opacity=".9"/>';
      });
    } else if (p.pat === 'ridge'){
      for (var r=1;r<5;r++){
        [-1,1].forEach(function(s){
          o += '<path d="M'+n(50+s*r*W*.14)+','+n(cy-H*.32)+'C'+n(50+s*r*W*.16)+','+n(cy+H*.1)+' '+n(50+s*r*W*.13)+','+n(cy+H*.32)+' '+n(50+s*r*W*.08)+','+n(cy+H*.5)+'" stroke="'+dk(c,.35)+'" stroke-width=".7" fill="none" opacity=".8"/>';
        });
      }
    } else if (p.pat === 'band'){
      o += '<path d="M'+n(50-W*.74)+','+n(cy-H*.02)+'h'+n(W*1.48)+'v'+n(H*.2)+'h'+n(-W*1.48)+'Z" fill="'+(p.spot||'#F0E3C4')+'" opacity=".9"/>';
    }
    /* shine */
    o += '<ellipse cx="'+n(50-W*.28)+'" cy="'+n(cy-H*.16)+'" rx="'+n(W*.2)+'" ry="'+n(H*.22)+'" fill="#fff" opacity="'+(p.metal?.34:.17)+'" transform="rotate(-14 '+n(50-W*.28)+' '+n(cy-H*.16)+')"/>';
    return o;
  };

  F.snail = function(p, R){
    var sc = p.c1, bc = p.c2 || '#C4A98A', g = id();
    var o = '<defs>'+sheen(g, sc, .34)+'</defs>';
    /* body */
    o += '<path d="M14,74C10,68 16,62 26,62C40,62 52,63 62,64C74,65 84,68 86,72C88,76 82,78 70,78L20,78C15,78 12,77 14,74Z" fill="'+bc+'" stroke="'+dk(bc,.35)+'" stroke-width=".6"/>';
    o += '<path d="M18,76Q50,80 84,74" stroke="'+dk(bc,.28)+'" stroke-width=".8" fill="none" opacity=".7"/>';
    /* eyestalks */
    [[20,58,-14],[26,57,6]].forEach(function(e){
      o += '<path d="M'+e[0]+',64Q'+n(e[0]-5)+','+n(e[1]-6)+' '+n(e[0]-7+e[2]*.2)+','+n(e[1]-14)+'" fill="none" stroke="'+bc+'" stroke-width="2.2" stroke-linecap="round"/>';
      o += '<circle cx="'+n(e[0]-7+e[2]*.2)+'" cy="'+n(e[1]-15)+'" r="2.1" fill="'+dk(bc,.4)+'"/>';
      o += '<circle cx="'+n(e[0]-7.6+e[2]*.2)+'" cy="'+n(e[1]-15.6)+'" r=".7" fill="#fff" opacity=".7"/>';
    });
    /* shell: a logarithmic spiral, with the growth rate solved backwards
       from the radius we want it to finish at so it always fits the plate */
    var cx = 58, cy = 42, turns = p.turns || 3.1, a = 2.0, R0 = p.R || 25;
    var b = Math.log(R0/a) / (turns*Math.PI*2);
    var pts = [];
    for (var i=0; i<=turns*40; i++){
      var th = i/40*Math.PI*2, r = a*Math.exp(b*th);
      pts.push([cx + Math.cos(th+Math.PI)*r, cy + Math.sin(th+Math.PI)*r*.94]);
    }
    o += '<circle cx="'+n(cx)+'" cy="'+n(cy)+'" r="'+n(R0+1.5)+'" fill="url(#'+g+')" stroke="'+dk(sc,.45)+'" stroke-width=".8"/>';
    var d = 'M'+n(pts[0][0])+','+n(pts[0][1]);
    pts.forEach(function(q){ d += 'L'+n(q[0])+','+n(q[1]); });
    o += '<path d="'+d+'" fill="none" stroke="'+dk(sc,.4)+'" stroke-width="1.5" opacity=".85"/>';
    if (p.bands){
      o += '<path d="'+d+'" fill="none" stroke="'+(p.bandC||dk(sc,.62))+'" stroke-width=".7" opacity=".9" transform="translate(0,3)"/>';
    }
    o += '<ellipse cx="'+n(cx-6)+'" cy="'+n(cy-8)+'" rx="6" ry="4.4" fill="#fff" opacity=".2" transform="rotate(-28 '+n(cx-6)+' '+n(cy-8)+')"/>';
    return o;
  };

  F.bee = function(p, R){
    var c = p.c1, st = p.c2 || '#2A1F14', o = '';
    /* wings */
    [-1,1].forEach(function(s){
      o += '<ellipse cx="'+n(50+s*15)+'" cy="40" rx="14" ry="6.6" fill="#EAF0F2" opacity=".62" stroke="#B8C6CC" stroke-width=".5" transform="rotate('+n(s*-24)+' '+n(50+s*15)+' 40)"/>';
      o += '<ellipse cx="'+n(50+s*11)+'" cy="47" rx="9.6" ry="4.6" fill="#EAF0F2" opacity=".55" stroke="#B8C6CC" stroke-width=".5" transform="rotate('+n(s*-12)+' '+n(50+s*11)+' 47)"/>';
    });
    /* legs */
    for (var s2=-1;s2<=1;s2+=2){ for (var l=0;l<3;l++){
      o += '<path d="M'+n(50+s2*6)+','+n(50+l*6)+'Q'+n(50+s2*16)+','+n(54+l*6)+' '+n(50+s2*14)+','+n(64+l*4)+'" fill="none" stroke="'+dk(st,.1)+'" stroke-width="1.5" stroke-linecap="round"/>';
    }}
    /* abdomen */
    o += '<ellipse cx="50" cy="62" rx="12" ry="17" fill="'+c+'" stroke="'+dk(c,.4)+'" stroke-width=".6"/>';
    for (var b=0;b<3;b++){
      o += '<path d="M'+n(38.4+b*.6)+','+n(52+b*8.6)+'a12,17 0 0 0 '+n(23-b*1.2)+',0" fill="none" stroke="'+st+'" stroke-width="'+n(4.4-b*.5)+'"/>';
    }
    if (p.sting) o += '<path d="M50,79l0,6" stroke="'+st+'" stroke-width="1.6" stroke-linecap="round"/>';
    /* thorax */
    o += '<ellipse cx="50" cy="43" rx="10" ry="9" fill="'+(p.fuzz||'#8A6A3C')+'"/>';
    for (var f=0;f<16;f++){
      var fa = f*22.5*Math.PI/180;
      o += '<path d="M'+n(50+Math.cos(fa)*8.6)+','+n(43+Math.sin(fa)*7.6)+'l'+n(Math.cos(fa)*3)+','+n(Math.sin(fa)*2.6)+'" stroke="'+lt(p.fuzz||'#8A6A3C',.28)+'" stroke-width="1" opacity=".8"/>';
    }
    /* head */
    o += '<ellipse cx="50" cy="31" rx="7.4" ry="6.4" fill="'+dk(st,.05)+'"/>';
    o += '<ellipse cx="45.6" cy="30" rx="2.4" ry="3.4" fill="#15100B"/><ellipse cx="54.4" cy="30" rx="2.4" ry="3.4" fill="#15100B"/>';
    [-1,1].forEach(function(s){
      o += '<path d="M'+n(50+s*3)+',26Q'+n(50+s*9)+',19 '+n(50+s*12)+',15" fill="none" stroke="'+dk(st,.05)+'" stroke-width="1.3" stroke-linecap="round"/>';
    });
    return o;
  };

  F.dragonfly = function(p, R){
    var c = p.c1, w = p.wing || '#DCE7EA', o = '';
    [-1,1].forEach(function(s){
      o += '<ellipse cx="'+n(50+s*22)+'" cy="35" rx="21" ry="5" fill="'+w+'" opacity=".55" stroke="'+dk(w,.22)+'" stroke-width=".5" transform="rotate('+n(s*-13)+' '+n(50+s*22)+' 35)"/>';
      o += '<ellipse cx="'+n(50+s*20)+'" cy="45" rx="19" ry="4.4" fill="'+w+'" opacity=".48" stroke="'+dk(w,.22)+'" stroke-width=".5" transform="rotate('+n(s*9)+' '+n(50+s*20)+' 45)"/>';
      for (var v=0;v<5;v++){
        o += '<path d="M'+n(50+s*4)+',35L'+n(50+s*(10+v*8))+','+n(31+v*1.6)+'" stroke="'+dk(w,.3)+'" stroke-width=".35" opacity=".6"/>';
      }
    });
    /* abdomen */
    o += '<path d="M47.4,44C46,58 45.6,74 48,88C50,90 50,90 52,88C54.4,74 54,58 52.6,44Z" fill="'+c+'" stroke="'+dk(c,.45)+'" stroke-width=".5"/>';
    for (var sg=0;sg<8;sg++){
      o += '<path d="M'+n(46.6+sg*.14)+','+n(48+sg*5)+'h'+n(6.8-sg*.3)+'" stroke="'+dk(c,.5)+'" stroke-width=".8" opacity=".8"/>';
    }
    o += '<ellipse cx="50" cy="40" rx="6.4" ry="7.4" fill="'+dk(c,.22)+'"/>';
    o += '<circle cx="50" cy="29" r="7" fill="'+dk(c,.35)+'"/>';
    o += '<circle cx="46" cy="27.6" r="4.2" fill="'+(p.eye||'#4E7C86')+'"/><circle cx="54" cy="27.6" r="4.2" fill="'+(p.eye||'#4E7C86')+'"/>';
    o += '<circle cx="44.8" cy="26" r="1.3" fill="#fff" opacity=".65"/>';
    return o;
  };

  F.spider = function(p, R){
    var c = p.c1, o = '';
    for (var s=-1;s<=1;s+=2){ for (var l=0;l<4;l++){
      var a = -34 + l*26, ln = 26 - Math.abs(l-1.5)*3;
      o += '<path d="M50,50Q'+n(50+s*ln*.7)+','+n(50+a*.5)+' '+n(50+s*ln)+','+n(50+a)+'Q'+n(50+s*ln*1.1)+','+n(56+a)+' '+n(50+s*ln*.86)+','+n(64+a*.6)+'" fill="none" stroke="'+dk(c,.5)+'" stroke-width="1.7" stroke-linecap="round"/>';
    }}
    o += '<ellipse cx="50" cy="62" rx="14" ry="17" fill="'+c+'" stroke="'+dk(c,.45)+'" stroke-width=".6"/>';
    if (p.pat === 'cross'){
      o += '<path d="M50,49v16M43,56h14M45.4,63h9.2" stroke="'+(p.spot||'#F2E7CE')+'" stroke-width="2" stroke-linecap="round"/>';
    } else if (p.pat === 'hourglass'){
      o += '<path d="M46,53l8,0l-3,7l3,7l-8,0l3,-7Z" fill="'+(p.spot||'#B03A2E')+'"/>';
    } else if (p.pat === 'chevron'){
      for (var v=0;v<4;v++) o += '<path d="M43,'+n(52+v*7)+'l7,4l7,-4" fill="none" stroke="'+(p.spot||'#EBDCBE')+'" stroke-width="1.5"/>';
    }
    o += '<ellipse cx="50" cy="43" rx="9" ry="8" fill="'+dk(c,.28)+'"/>';
    [[46,39],[54,39],[48,35.6],[52,35.6]].forEach(function(e,i){
      o += '<circle cx="'+e[0]+'" cy="'+e[1]+'" r="'+(i<2?2.1:1.5)+'" fill="#14100C"/>';
    });
    return o;
  };

  F.frog = function(p, R){
    var c = p.c1, o = '', g = id();
    o = '<defs>'+sheen(g, c, .32)+'</defs>';
    /* back legs */
    [-1,1].forEach(function(s){
      o += '<path d="M'+n(50+s*13)+',62C'+n(50+s*29)+',60 '+n(50+s*33)+',72 '+n(50+s*24)+',78C'+n(50+s*20)+',81 '+n(50+s*12)+',76 '+n(50+s*11)+',70Z" fill="'+dk(c,.16)+'" stroke="'+dk(c,.42)+'" stroke-width=".5"/>';
      o += '<path d="M'+n(50+s*24)+',78l'+n(s*8)+',3M'+n(50+s*24)+',78l'+n(s*7)+',6M'+n(50+s*24)+',78l'+n(s*3)+',7" stroke="'+dk(c,.42)+'" stroke-width="1.4" stroke-linecap="round"/>';
    });
    /* body */
    o += '<ellipse cx="50" cy="57" rx="21" ry="19" fill="url(#'+g+')" stroke="'+dk(c,.42)+'" stroke-width=".6"/>';
    /* front legs */
    [-1,1].forEach(function(s){
      o += '<path d="M'+n(50+s*13)+',56Q'+n(50+s*20)+',68 '+n(50+s*16)+',76" fill="none" stroke="'+dk(c,.14)+'" stroke-width="4.4" stroke-linecap="round"/>';
      o += '<path d="M'+n(50+s*16)+',76l'+n(s*5)+',3M'+n(50+s*16)+',76l'+n(s*3)+',5" stroke="'+dk(c,.42)+'" stroke-width="1.3" stroke-linecap="round"/>';
    });
    if (p.pat === 'blotch'){
      for (var i=0;i<6;i++){
        var bx = 50 + (R()*28-14), by = 50 + (R()*20-8);
        o += '<ellipse cx="'+n(bx)+'" cy="'+n(by)+'" rx="'+n(2.4+R()*3.4)+'" ry="'+n(2+R()*2.6)+'" fill="'+(p.spot||dk(c,.5))+'" opacity=".8"/>';
      }
    } else if (p.pat === 'stripe'){
      o += '<path d="M50,39v34" stroke="'+(p.spot||lt(c,.5))+'" stroke-width="3.4" opacity=".85"/>';
    } else if (p.pat === 'bands'){
      [-1,1].forEach(function(s){
        o += '<path d="M'+n(50+s*6)+',40C'+n(50+s*16)+',48 '+n(50+s*17)+',64 '+n(50+s*9)+',74" fill="none" stroke="'+(p.spot||dk(c,.5))+'" stroke-width="2.6" opacity=".8"/>';
      });
    }
    /* head + eyes */
    o += '<ellipse cx="50" cy="40" rx="17" ry="12" fill="'+lt(c,.08)+'" stroke="'+dk(c,.4)+'" stroke-width=".6"/>';
    [-1,1].forEach(function(s){
      o += '<circle cx="'+n(50+s*9)+'" cy="33" r="6" fill="'+lt(c,.18)+'" stroke="'+dk(c,.4)+'" stroke-width=".5"/>';
      o += '<circle cx="'+n(50+s*9)+'" cy="33" r="4" fill="'+(p.eye||'#C8A03A')+'"/>';
      o += '<ellipse cx="'+n(50+s*9)+'" cy="33" rx="1.2" ry="3.4" fill="#120E0A"/>';
      o += '<circle cx="'+n(50+s*7.6)+'" cy="31" r="1.1" fill="#fff" opacity=".8"/>';
    });
    o += '<path d="M42,45Q50,50 58,45" fill="none" stroke="'+dk(c,.42)+'" stroke-width=".9"/>';
    return o;
  };

  F.bird = function(p, R){
    var c = p.c1, c2 = p.c2 || lt(p.c1,.3), beak = p.beak || '#C89A32', o = '', g = id();
    var neck = p.neck === undefined ? 1 : p.neck;       /* 0 = tucked, 2 = long goose neck */
    var bodyW = p.bw || 22, bodyH = p.bh || 17;
    var by = p.by || 58;
    var hx = 50 + (p.hx === undefined ? 12 : p.hx);
    var hy = p.hy !== undefined ? p.hy : by - 12 - neck*13;
    o = '<defs>'+sheen(g, c, .3)+'</defs>';

    /* legs */
    if (p.legs !== false){
      [-1,1].forEach(function(s){
        o += '<path d="M'+n(50+s*4)+','+n(by+bodyH*.72)+'v'+n(p.legL||9)+'" stroke="'+(p.legC||beak)+'" stroke-width="1.9" stroke-linecap="round"/>';
        if (p.web) o += '<path d="M'+n(50+s*4-4)+','+n(by+bodyH*.72+(p.legL||9))+'h8l-4,-2Z" fill="'+(p.legC||beak)+'"/>';
        else o += '<path d="M'+n(50+s*4)+','+n(by+bodyH*.72+(p.legL||9))+'l-3,2M'+n(50+s*4)+','+n(by+bodyH*.72+(p.legL||9))+'l3,2" stroke="'+(p.legC||beak)+'" stroke-width="1.4" stroke-linecap="round"/>';
      });
    }
    /* tail */
    o += '<path d="M'+n(50-bodyW*.82)+','+n(by-2)+'L'+n(50-bodyW*1.5)+','+n(by-(p.tailUp||6))+'L'+n(50-bodyW*1.34)+','+n(by+5)+'Z" fill="'+dk(c,.2)+'"/>';
    /* body */
    o += '<ellipse cx="50" cy="'+n(by)+'" rx="'+n(bodyW)+'" ry="'+n(bodyH)+'" fill="url(#'+g+')" stroke="'+dk(c,.4)+'" stroke-width=".6"/>';
    /* neck */
    if (neck > 0.15){
      o += '<path d="M'+n(50+bodyW*.42)+','+n(by-bodyH*.5)+
           'C'+n(50+bodyW*.95)+','+n(by-bodyH*.9-neck*4)+' '+n(hx+5)+','+n(hy+neck*10)+' '+n(hx)+','+n(hy+3)+
           'L'+n(hx-8)+','+n(hy+3)+
           'C'+n(hx-9)+','+n(hy+neck*11)+' '+n(50+bodyW*.2)+','+n(by-bodyH*.86)+' '+n(50-bodyW*.1)+','+n(by-bodyH*.66)+'Z" ' +
           'fill="'+(p.neckC||c)+'" stroke="'+dk(c,.4)+'" stroke-width=".55"/>';
    }
    /* wing */
    o += '<path d="M'+n(50-bodyW*.5)+','+n(by-bodyH*.25)+
         'C'+n(50-bodyW*.2)+','+n(by-bodyH*.85)+' '+n(50+bodyW*.55)+','+n(by-bodyH*.6)+' '+n(50+bodyW*.6)+','+n(by+bodyH*.05)+
         'C'+n(50+bodyW*.3)+','+n(by+bodyH*.6)+' '+n(50-bodyW*.3)+','+n(by+bodyH*.55)+' '+n(50-bodyW*.5)+','+n(by-bodyH*.25)+'Z" ' +
         'fill="'+c2+'" opacity=".9" stroke="'+dk(c,.32)+'" stroke-width=".5"/>';
    for (var f=0;f<4;f++){
      o += '<path d="M'+n(50-bodyW*.34+f*4)+','+n(by+bodyH*.22)+'q4,3 9,2" fill="none" stroke="'+dk(c2,.28)+'" stroke-width=".6" opacity=".7"/>';
    }
    /* head */
    var hr = p.hr || 8, hcx = hx - 4;
    o += '<ellipse cx="'+n(hcx)+'" cy="'+n(hy)+'" rx="'+n(hr)+'" ry="'+n(hr*(p.hsq||.92))+'" fill="'+(p.headC||c)+'" stroke="'+dk(c,.4)+'" stroke-width=".55"/>';
    if (p.crest){
      o += '<path d="M'+n(hcx-4)+','+n(hy-hr*.78)+'q-3,-8 3,-9q1,5 4,7Z" fill="'+(p.crestC||c2)+'"/>';
    }
    if (p.cheek){
      o += '<path d="M'+n(hcx-5)+','+n(hy+1)+'q5,6 9,1" fill="none" stroke="'+p.cheek+'" stroke-width="3.4" stroke-linecap="round"/>';
    }

    if (p.eyes === 'pair'){
      /* a face seen head-on: the owls and the small perching birds */
      if (p.disc){
        o += '<path d="M'+n(hcx)+','+n(hy+hr*.92)+'C'+n(hcx-hr*1.05)+','+n(hy+hr*.4)+' '+n(hcx-hr*1.02)+','+n(hy-hr*.85)+' '+n(hcx-hr*.4)+','+n(hy-hr*.9)+
             'C'+n(hcx-hr*.14)+','+n(hy-hr*.86)+' '+n(hcx)+','+n(hy-hr*.6)+' '+n(hcx)+','+n(hy-hr*.44)+
             'C'+n(hcx)+','+n(hy-hr*.6)+' '+n(hcx+hr*.14)+','+n(hy-hr*.86)+' '+n(hcx+hr*.4)+','+n(hy-hr*.9)+
             'C'+n(hcx+hr*1.02)+','+n(hy-hr*.85)+' '+n(hcx+hr*1.05)+','+n(hy+hr*.4)+' '+n(hcx)+','+n(hy+hr*.92)+'Z" ' +
             'fill="'+(p.disc)+'" stroke="'+dk(c,.3)+'" stroke-width=".5"/>';
      }
      [-1,1].forEach(function(s){
        var ex = hcx + s*hr*.4, ey = hy - hr*.12;
        if (p.bigEye) o += '<circle cx="'+n(ex)+'" cy="'+n(ey)+'" r="'+n(hr*.32)+'" fill="'+(p.ring||lt(c,.55))+'"/>';
        o += '<circle cx="'+n(ex)+'" cy="'+n(ey)+'" r="'+n(p.bigEye?hr*.23:hr*.17)+'" fill="'+(p.eye||'#1A130D')+'"/>';
        o += '<circle cx="'+n(ex-hr*.07)+'" cy="'+n(ey-hr*.08)+'" r="'+n(hr*.07)+'" fill="#fff" opacity=".85"/>';
      });
      o += '<path d="M'+n(hcx)+','+n(hy+hr*.06)+'l'+n(hr*.2)+','+n(hr*.44)+'l'+n(-hr*.4)+',0Z" fill="'+beak+'"/>';
      return o;
    }

    /* beak, in profile */
    if (p.beakType === 'hook'){
      o += '<path d="M'+n(hx+3)+','+n(hy-2)+'q6,1 5,5q-1,4 -6,3Z" fill="'+beak+'" stroke="'+dk(beak,.3)+'" stroke-width=".4"/>';
    } else if (p.beakType === 'long'){
      o += '<path d="M'+n(hx+3)+','+n(hy-1)+'l'+n(p.beakL||18)+',3l'+n(-(p.beakL||18))+',3Z" fill="'+beak+'"/>';
    } else {
      o += '<path d="M'+n(hx+3)+','+n(hy-3)+'l'+n(p.beakL||10)+','+n(3.2)+'l'+n(-(p.beakL||10))+','+n(3.6)+'Z" fill="'+beak+'" stroke="'+dk(beak,.28)+'" stroke-width=".4"/>';
      o += '<path d="M'+n(hx+3)+','+n(hy+.4)+'l'+n((p.beakL||10)*.9)+',.3" stroke="'+dk(beak,.4)+'" stroke-width=".5"/>';
    }
    /* eye */
    o += '<circle cx="'+n(hcx-.6)+'" cy="'+n(hy-2)+'" r="'+(p.bigEye?3:1.9)+'" fill="'+(p.eye||'#1A130D')+'"/>';
    o += '<circle cx="'+n(hcx-1.2)+'" cy="'+n(hy-2.7)+'" r=".8" fill="#fff" opacity=".85"/>';
    if (p.bigEye) o += '<circle cx="'+n(hcx-.6)+'" cy="'+n(hy-2)+'" r="5" fill="none" stroke="'+(p.ring||lt(c,.5))+'" stroke-width="1.4"/>';
    return o;
  };

  F.mammal = function(p, R){
    var c = p.c1, o = '', g = id();
    o = '<defs>'+sheen(g, c, .28)+'</defs>';
    if (p.tail === 'long') o += '<path d="M30,66Q14,66 16,52Q17,46 22,45" fill="none" stroke="'+(p.tailC||lt(c,.28))+'" stroke-width="2.2" stroke-linecap="round"/>';
    o += '<ellipse cx="50" cy="60" rx="26" ry="17" fill="url(#'+g+')" stroke="'+dk(c,.38)+'" stroke-width=".6"/>';
    if (p.spines){
      for (var i=0;i<26;i++){
        var a = 190 + (i/25)*160, ax = 50 + Math.cos(a*Math.PI/180)*25, ay = 60 + Math.sin(a*Math.PI/180)*16.4;
        o += '<path d="M'+n(ax)+','+n(ay)+'l'+n(Math.cos(a*Math.PI/180)*8)+','+n(Math.sin(a*Math.PI/180)*7)+'" stroke="'+(p.spineC||dk(c,.42))+'" stroke-width="1.5" stroke-linecap="round"/>';
      }
    }
    if (p.fluff){
      for (var f=0;f<20;f++){
        var fa = 175 + (f/19)*190;
        o += '<path d="M'+n(50+Math.cos(fa*Math.PI/180)*25.4)+','+n(60+Math.sin(fa*Math.PI/180)*16.6)+'l'+n(Math.cos(fa*Math.PI/180)*3.4)+','+n(Math.sin(fa*Math.PI/180)*3)+'" stroke="'+lt(c,.2)+'" stroke-width="1.2" opacity=".8"/>';
      }
    }
    /* head */
    var hx = 72, hy = 52;
    o += '<path d="M'+n(hx-8)+','+n(hy+6)+'C'+n(hx-2)+','+n(hy-8)+' '+n(hx+14)+','+n(hy-4)+' '+n(hx+16)+','+n(hy+5)+
         'C'+n(hx+17)+','+n(hy+11)+' '+n(hx+2)+','+n(hy+14)+' '+n(hx-8)+','+n(hy+6)+'Z" fill="'+lt(c,.08)+'" stroke="'+dk(c,.38)+'" stroke-width=".55"/>';
    /* ears */
    var er = p.ear === 'big' ? 7.4 : 4.4;
    o += '<circle cx="'+n(hx-2)+'" cy="'+n(hy-6)+'" r="'+n(er)+'" fill="'+lt(c,.05)+'" stroke="'+dk(c,.36)+'" stroke-width=".5"/>';
    o += '<circle cx="'+n(hx-2)+'" cy="'+n(hy-6)+'" r="'+n(er*.55)+'" fill="'+(p.inner||'#D8A9A0')+'" opacity=".8"/>';
    o += '<circle cx="'+n(hx+16.6)+'" cy="'+n(hy+5.4)+'" r="1.9" fill="'+(p.nose||'#54372E')+'"/>';
    o += '<circle cx="'+n(hx+7)+'" cy="'+n(hy+1)+'" r="1.9" fill="#181209"/>';
    o += '<circle cx="'+n(hx+6.4)+'" cy="'+n(hy+.3)+'" r=".7" fill="#fff" opacity=".8"/>';
    [-1,0,1].forEach(function(s){
      o += '<path d="M'+n(hx+16)+','+n(hy+5)+'q8,'+n(s*4-1)+' 12,'+n(s*6-1)+'" fill="none" stroke="'+dk(c,.3)+'" stroke-width=".5" opacity=".7"/>';
    });
    /* feet */
    [-1,1].forEach(function(s){
      o += '<ellipse cx="'+n(50+s*13)+'" cy="76" rx="6" ry="3" fill="'+dk(c,.16)+'"/>';
    });
    return o;
  };

  F.ammonite = function(p, R){
    var c = p.c1, g = id(), o = '<defs>'+sheen(g, c, .34)+'</defs>';
    var cx = 50, cy = 52, a = 2.2, maxR = p.R || 34;
    var b = Math.log(maxR/a) / ((p.turns||3.2)*Math.PI*2);
    o += '<circle cx="'+cx+'" cy="'+cy+'" r="'+n(maxR)+'" fill="url(#'+g+')" stroke="'+dk(c,.45)+'" stroke-width=".9"/>';
    /* septa */
    for (var i=0;i<(p.turns||3.2)*22;i++){
      var th = i/22*Math.PI*2, r = a*Math.exp(b*th);
      if (r > maxR) break;
      var x1 = cx + Math.cos(th)*r*.28, y1 = cy + Math.sin(th)*r*.28;
      var x2 = cx + Math.cos(th)*r, y2 = cy + Math.sin(th)*r;
      o += '<path d="M'+n(x1)+','+n(y1)+'Q'+n((x1+x2)/2 - Math.sin(th)*3)+','+n((y1+y2)/2 + Math.cos(th)*3)+' '+n(x2)+','+n(y2)+'" fill="none" stroke="'+dk(c,.4)+'" stroke-width=".7" opacity=".72"/>';
    }
    var d = '';
    for (var j=0;j<=(p.turns||3.2)*40;j++){
      var t2 = j/40*Math.PI*2, r2 = a*Math.exp(b*t2);
      if (r2 > maxR) break;
      d += (j?'L':'M') + n(cx + Math.cos(t2)*r2) + ',' + n(cy + Math.sin(t2)*r2);
    }
    o += '<path d="'+d+'" fill="none" stroke="'+dk(c,.55)+'" stroke-width="1.3"/>';
    o += '<ellipse cx="'+n(cx-maxR*.34)+'" cy="'+n(cy-maxR*.4)+'" rx="'+n(maxR*.26)+'" ry="'+n(maxR*.17)+'" fill="#fff" opacity=".2" transform="rotate(-30 '+n(cx-maxR*.34)+' '+n(cy-maxR*.4)+')"/>';
    return o;
  };

  F.star = function(p, R){
    var c = p.c1, arms = p.arms || 5, o = '', g = id();
    o = '<defs>'+sheen(g, c, .3)+'</defs>';
    var d = '';
    for (var i=0;i<arms*2;i++){
      var a = (i/(arms*2))*Math.PI*2 - Math.PI/2, r = i%2 ? 13 : 36;
      d += (i?'L':'M') + n(50+Math.cos(a)*r) + ',' + n(50+Math.sin(a)*r);
    }
    o += '<path d="'+d+'Z" fill="url(#'+g+')" stroke="'+dk(c,.42)+'" stroke-width=".8" stroke-linejoin="round"/>';
    for (var k=0;k<arms;k++){
      var ka = (k/arms)*Math.PI*2 - Math.PI/2;
      o += '<path d="M50,50L'+n(50+Math.cos(ka)*32)+','+n(50+Math.sin(ka)*32)+'" stroke="'+dk(c,.3)+'" stroke-width=".8" opacity=".6"/>';
      for (var q=1;q<7;q++){
        var qr = q*4.6;
        o += '<circle cx="'+n(50+Math.cos(ka)*qr)+'" cy="'+n(50+Math.sin(ka)*qr)+'" r="'+n(1.5-q*.12)+'" fill="'+lt(c,.42)+'" opacity=".8"/>';
      }
    }
    return o;
  };

  F.crab = function(p, R){
    var c = p.c1, o = '', g = id();
    o = '<defs>'+sheen(g, c, .3)+'</defs>';
    for (var s=-1;s<=1;s+=2){ for (var l=0;l<4;l++){
      var ang = -6 + l*20;
      o += '<path d="M'+n(50+s*17)+','+n(52+l*4)+'Q'+n(50+s*32)+','+n(52+ang)+' '+n(50+s*36)+','+n(66+l*4)+'" fill="none" stroke="'+dk(c,.32)+'" stroke-width="2.2" stroke-linecap="round"/>';
    }}
    /* claws */
    [-1,1].forEach(function(s){
      o += '<path d="M'+n(50+s*16)+',44Q'+n(50+s*30)+',34 '+n(50+s*33)+',26" fill="none" stroke="'+dk(c,.28)+'" stroke-width="3.2" stroke-linecap="round"/>';
      o += '<path d="M'+n(50+s*33)+',26q'+n(s*8)+',-6 '+n(s*4)+',-10q'+n(-s*8)+',1 '+n(-s*10)+',5q'+n(s*2)+',6 '+n(s*6)+',5Z" fill="'+lt(c,.12)+'" stroke="'+dk(c,.4)+'" stroke-width=".5"/>';
    });
    o += '<path d="M22,56C22,42 34,34 50,34C66,34 78,42 78,56C78,68 66,74 50,74C34,74 22,68 22,56Z" fill="url(#'+g+')" stroke="'+dk(c,.42)+'" stroke-width=".7"/>';
    o += '<path d="M32,50q18,7 36,0" fill="none" stroke="'+dk(c,.32)+'" stroke-width=".8" opacity=".6"/>';
    [[42,44],[58,44]].forEach(function(e){
      o += '<path d="M'+e[0]+','+e[1]+'v-8" stroke="'+dk(c,.35)+'" stroke-width="1.8"/><circle cx="'+e[0]+'" cy="'+n(e[1]-9)+'" r="2.4" fill="#1B140D"/>';
    });
    return o;
  };

  F.trilobite = function(p, R){
    var c = p.c1, o = '', g = id();
    o = '<defs>'+sheen(g, c, .26)+'</defs>';
    o += '<path d="M50,18C64,18 72,26 72,38C72,54 64,80 50,86C36,80 28,54 28,38C28,26 36,18 50,18Z" fill="url(#'+g+')" stroke="'+dk(c,.45)+'" stroke-width=".8"/>';
    o += '<path d="M30,34C36,26 64,26 70,34" fill="none" stroke="'+dk(c,.4)+'" stroke-width="1"/>';
    for (var i=0;i<9;i++){
      var y = 36 + i*5.2, w2 = 21 - i*1.7;
      o += '<path d="M'+n(50-w2)+','+n(y)+'Q50,'+n(y+2.4)+' '+n(50+w2)+','+n(y)+'" fill="none" stroke="'+dk(c,.38)+'" stroke-width=".9" opacity=".85"/>';
    }
    o += '<path d="M42,20C40,42 41,66 50,84C59,66 60,42 58,20" fill="none" stroke="'+dk(c,.42)+'" stroke-width=".9"/>';
    [[42,28],[58,28]].forEach(function(e){
      o += '<ellipse cx="'+e[0]+'" cy="'+e[1]+'" rx="3.4" ry="2.4" fill="'+dk(c,.5)+'"/>';
      o += '<ellipse cx="'+e[0]+'" cy="'+e[1]+'" rx="1.8" ry="1.2" fill="'+lt(c,.4)+'" opacity=".7"/>';
    });
    return o;
  };

  F.feather = function(p, R){
    var c = p.c1, c2 = p.c2 || lt(p.c1,.4), o = '';
    var yTip = 8, yVane = 74, yEnd = 94;        /* vane ends well short of the quill */
    var W = p.wide || 27;
    for (var i=0;i<74;i++){
      var t2 = i/73, y = yTip + (yVane - yTip)*t2;
      /* full at a third of the way down, tapering to nothing at both ends */
      var wdt = Math.pow(Math.sin(Math.pow(t2,.52)*Math.PI), .72) * W * (1 - t2*.28);
      var cc = mix(c, c2, p.band ? (Math.sin(t2*Math.PI*(p.bands||5))>0?.95:.05) : (.15 + t2*.5));
      [-1,1].forEach(function(s){
        o += '<path d="M50,'+n(y)+'L'+n(50 + s*wdt)+','+n(y - wdt*.34)+'" stroke="'+cc+'" stroke-width="1.7" stroke-linecap="round" opacity=".94"/>';
      });
    }
    /* rachis through the vane, then the bare quill below it */
    o += '<path d="M50,'+n(yTip)+'C51.4,34 51.4,58 50.6,'+n(yVane)+'" fill="none" stroke="'+dk(c,.42)+'" stroke-width="1.6" stroke-linecap="round"/>';
    o += '<path d="M48.9,'+n(yVane-4)+'C48.6,'+n(yVane+8)+' 48.8,'+n(yEnd-6)+' 49.6,'+n(yEnd)+
         'C50.8,'+n(yEnd-6)+' 51.4,'+n(yVane+8)+' 52.1,'+n(yVane-4)+'Z" ' +
         'fill="'+lt(c,.55)+'" stroke="'+dk(c,.35)+'" stroke-width=".5"/>';
    o += '<path d="M49.6,'+n(yVane)+'C49.4,'+n(yVane+9)+' 49.6,'+n(yEnd-7)+' 50,'+n(yEnd-2)+'" fill="none" stroke="'+dk(c,.28)+'" stroke-width=".5" opacity=".7"/>';
    return o;
  };

  function fauna(p, key){
    var R = prng(seedOf(key || p.name || 'c'));
    var fn = F[p.kind] || F.beetle;
    return wrap(fn(p, R));
  }

  /* ═══════════════════════════════════════════════════════════
     MINERALIA
     ═══════════════════════════════════════════════════════════ */
  function crystalPrism(cx, base, w, h, c, tilt){
    var g = id();
    var s = '<defs><linearGradient id="'+g+'" x1="0" y1="0" x2="1" y2="0">' +
      '<stop offset="0%" stop-color="'+dk(c,.3)+'"/><stop offset="38%" stop-color="'+lt(c,.32)+'"/>' +
      '<stop offset="70%" stop-color="'+c+'"/><stop offset="100%" stop-color="'+dk(c,.4)+'"/></linearGradient></defs>';
    var t2 = tilt || 0, tipY = base - h, midY = base - h*.78;
    s += '<g transform="rotate('+n(t2)+' '+n(cx)+' '+n(base)+')">';
    s += '<path d="M'+n(cx-w)+','+n(base)+'L'+n(cx-w)+','+n(midY)+'L'+n(cx)+','+n(tipY)+'L'+n(cx+w)+','+n(midY)+'L'+n(cx+w)+','+n(base)+'Z" fill="url(#'+g+')" stroke="'+dk(c,.5)+'" stroke-width=".6" stroke-linejoin="round"/>';
    s += '<path d="M'+n(cx-w*.3)+','+n(base)+'L'+n(cx-w*.3)+','+n(midY+1)+'L'+n(cx)+','+n(tipY)+'L'+n(cx+w*.3)+','+n(midY+1)+'L'+n(cx+w*.3)+','+n(base)+'" fill="'+lt(c,.24)+'" opacity=".55" stroke="'+dk(c,.35)+'" stroke-width=".4"/>';
    s += '<path d="M'+n(cx-w)+','+n(midY)+'L'+n(cx+w)+','+n(midY)+'" stroke="'+dk(c,.42)+'" stroke-width=".4" opacity=".7"/>';
    s += '</g>';
    return s;
  }

  function mineral(p, key){
    var R = prng(seedOf(key || p.name || 'm'));
    var c = p.c1, h = p.habit || 'prism', o = '', g = id();

    if (h === 'prism'){
      o += crystalPrism(50, 86, p.w||16, p.h||58, c, 0);
      o += crystalPrism(33, 86, 8, 30, mix(c,'#ffffff',.16), -8);
      o += crystalPrism(66, 86, 9, 36, mix(c,'#000000',.1), 7);
    } else if (h === 'cluster'){
      var ns = p.n || 5;
      for (var i=0;i<ns;i++){
        var cx = 26 + i*(48/(ns-1)) + (R()*6-3);
        o += crystalPrism(cx, 88, 6+R()*5, 24+R()*34, mix(c, i%2?'#ffffff':'#000000', .08+R()*.12), (cx-50)*.36);
      }
    } else if (h === 'cube'){
      var s2 = p.s || 30, X = 50, Y = 58;
      o += '<path d="M'+n(X-s2)+','+n(Y-s2*.5)+'L'+n(X)+','+n(Y-s2)+'L'+n(X+s2)+','+n(Y-s2*.5)+'L'+n(X)+','+n(Y)+'Z" fill="'+lt(c,.34)+'" stroke="'+dk(c,.45)+'" stroke-width=".6"/>';
      o += '<path d="M'+n(X-s2)+','+n(Y-s2*.5)+'L'+n(X)+','+n(Y)+'L'+n(X)+','+n(Y+s2)+'L'+n(X-s2)+','+n(Y+s2*.5)+'Z" fill="'+c+'" stroke="'+dk(c,.45)+'" stroke-width=".6"/>';
      o += '<path d="M'+n(X+s2)+','+n(Y-s2*.5)+'L'+n(X)+','+n(Y)+'L'+n(X)+','+n(Y+s2)+'L'+n(X+s2)+','+n(Y+s2*.5)+'Z" fill="'+dk(c,.26)+'" stroke="'+dk(c,.45)+'" stroke-width=".6"/>';
      if (p.striate){
        for (var k=1;k<5;k++){
          o += '<path d="M'+n(X-s2)+','+n(Y-s2*.5+k*s2*.3)+'L'+n(X)+','+n(Y+k*s2*.3)+'" stroke="'+dk(c,.4)+'" stroke-width=".5" opacity=".6"/>';
        }
      }
    } else if (h === 'octa'){
      var r = p.r || 30;
      o += '<path d="M50,'+n(58-r)+'L'+n(50+r*.8)+',58L50,'+n(58+r)+'L'+n(50-r*.8)+',58Z" fill="'+lt(c,.26)+'" stroke="'+dk(c,.45)+'" stroke-width=".6"/>';
      o += '<path d="M50,'+n(58-r)+'L'+n(50+r*.8)+',58L50,58Z" fill="'+dk(c,.18)+'"/>';
      o += '<path d="M50,'+n(58+r)+'L'+n(50-r*.8)+',58L50,58Z" fill="'+dk(c,.3)+'"/>';
      o += '<path d="M50,'+n(58-r)+'L50,'+n(58+r)+'M'+n(50-r*.8)+',58L'+n(50+r*.8)+',58" stroke="'+dk(c,.4)+'" stroke-width=".5"/>';
    } else if (h === 'rhomb'){
      var w2 = p.w || 30, h2 = p.h || 24;
      o += '<path d="M'+n(50-w2)+',52L'+n(50-w2*.5)+','+n(52-h2)+'L'+n(50+w2)+','+n(52-h2)+'L'+n(50+w2*.5)+',52Z" fill="'+lt(c,.3)+'" stroke="'+dk(c,.45)+'" stroke-width=".6"/>';
      o += '<path d="M'+n(50-w2)+',52L'+n(50+w2*.5)+',52L'+n(50+w2*.5)+','+n(52+h2)+'L'+n(50-w2)+','+n(52+h2)+'Z" fill="'+c+'" stroke="'+dk(c,.45)+'" stroke-width=".6"/>';
      o += '<path d="M'+n(50+w2*.5)+',52L'+n(50+w2)+','+n(52-h2)+'L'+n(50+w2)+','+n(52+h2*.5)+'L'+n(50+w2*.5)+','+n(52+h2)+'Z" fill="'+dk(c,.28)+'" stroke="'+dk(c,.45)+'" stroke-width=".6"/>';
    } else if (h === 'geode'){
      o += '<circle cx="50" cy="52" r="34" fill="'+(p.rind||'#9A8A72')+'" stroke="'+dk(p.rind||'#9A8A72',.35)+'" stroke-width="1"/>';
      o += '<circle cx="50" cy="52" r="27" fill="'+dk(c,.42)+'"/>';
      for (var q=0;q<34;q++){
        var qa = q/34*Math.PI*2, qr = 27;
        var x1 = 50+Math.cos(qa)*qr, y1 = 52+Math.sin(qa)*qr;
        var ln = 5 + R()*7;
        o += '<path d="M'+n(x1)+','+n(y1)+'L'+n(50+Math.cos(qa-.05)*(qr-ln))+','+n(52+Math.sin(qa-.05)*(qr-ln))+
             'L'+n(50+Math.cos(qa+.05)*(qr-ln))+','+n(52+Math.sin(qa+.05)*(qr-ln))+'Z" fill="'+mix(c,'#ffffff',R()*.5)+'" opacity=".9"/>';
      }
      o += '<circle cx="50" cy="52" r="9" fill="'+dk(c,.55)+'"/>';
    } else if (h === 'botryo'){
      var blobs = [[38,60,15],[57,58,17],[47,44,13],[64,44,10],[33,44,9]];
      blobs.forEach(function(b){
        var bg = id();
        o += '<defs><radialGradient id="'+bg+'" cx="34%" cy="28%" r="76%">' +
             '<stop offset="0%" stop-color="'+lt(c,.5)+'"/><stop offset="60%" stop-color="'+c+'"/><stop offset="100%" stop-color="'+dk(c,.36)+'"/></radialGradient></defs>';
        o += '<circle cx="'+b[0]+'" cy="'+b[1]+'" r="'+b[2]+'" fill="url(#'+bg+')" stroke="'+dk(c,.42)+'" stroke-width=".5"/>';
      });
    } else if (h === 'banded'){
      var bands = p.bands || ['#D8C0A0','#B98F62','#E7DCC8','#9A6B45','#EFE6D3'];
      o += '<clipPath id="'+g+'"><path d="M22,52C22,32 36,20 52,20C70,20 80,34 80,54C80,72 66,84 50,84C32,84 22,70 22,52Z"/></clipPath>';
      o += '<g clip-path="url(#'+g+')">';
      for (var bi=0; bi<26; bi++){
        o += '<circle cx="52" cy="52" r="'+n(34 - bi*1.3)+'" fill="none" stroke="'+bands[bi%bands.length]+'" stroke-width="'+n(1.4+ (bi%3))+'"/>';
      }
      o += '</g>';
      o += '<path d="M22,52C22,32 36,20 52,20C70,20 80,34 80,54C80,72 66,84 50,84C32,84 22,70 22,52Z" fill="none" stroke="'+dk(c,.4)+'" stroke-width="1"/>';
    } else if (h === 'needle'){
      for (var i2=0;i2<11;i2++){
        var a2 = -78 + i2*15.6;
        o += '<path d="M50,84L'+n(50+Math.cos((a2-90)*Math.PI/180)*(30+R()*16))+','+n(84+Math.sin((a2-90)*Math.PI/180)*(30+R()*16))+'" stroke="'+mix(c,'#ffffff',R()*.4)+'" stroke-width="'+n(1.4+R()*1.6)+'" stroke-linecap="round"/>';
      }
      o += '<ellipse cx="50" cy="85" rx="17" ry="5" fill="'+dk(c,.4)+'"/>';
    } else { /* nodule */
      var ng = id();
      o += '<defs><radialGradient id="'+ng+'" cx="36%" cy="28%" r="76%">' +
           '<stop offset="0%" stop-color="'+lt(c,.44)+'"/><stop offset="62%" stop-color="'+c+'"/><stop offset="100%" stop-color="'+dk(c,.4)+'"/></radialGradient></defs>';
      var d = 'M', N = 13;
      for (var v=0; v<N; v++){
        var va = v/N*Math.PI*2, vr = 28 + (R()*8-4);
        d += (v?'L':'') + n(50+Math.cos(va)*vr) + ',' + n(52+Math.sin(va)*vr*.92);
      }
      o += '<path d="'+d+'Z" fill="url(#'+ng+')" stroke="'+dk(c,.45)+'" stroke-width=".7" stroke-linejoin="round"/>';
      for (var vn=0; vn<5; vn++){
        o += '<path d="M'+n(30+R()*12)+','+n(36+R()*30)+'q'+n(12+R()*14)+','+n(R()*16-8)+' '+n(24+R()*10)+','+n(R()*8-4)+'" fill="none" stroke="'+(p.vein||lt(c,.55))+'" stroke-width="'+n(.8+R())+'" opacity=".75"/>';
      }
    }
    /* a specular glint for every stone */
    o += '<ellipse cx="40" cy="38" rx="6" ry="3.2" fill="#fff" opacity="'+(p.dull? .1 : .3)+'" transform="rotate(-32 40 38)"/>';
    return wrap(o);
  }

  /* ═══════════════════════════════════════════════════════════
     CURIOSITIES — the shelf objects
     ═══════════════════════════════════════════════════════════ */
  var C = {};
  var BRASS = '#B08D4F', BRASS_D = '#6E5526', WOOD = '#5B4130';

  C.globe = function(p){
    var sea = p.c1 || '#7C9AA8', land = p.c2 || '#B7A46E', g = id();
    var o = '<defs>'+sheen(g, sea, .3)+'</defs>';
    o += '<path d="M50,74v12" stroke="'+(p.wood||WOOD)+'" stroke-width="5" stroke-linecap="round"/>';
    o += '<path d="M30,90h40l-4,-5h-32Z" fill="'+(p.wood||WOOD)+'" stroke="'+dk(p.wood||WOOD,.4)+'" stroke-width=".6"/>';
    o += '<ellipse cx="50" cy="85" rx="17" ry="4" fill="'+lt(p.wood||WOOD,.12)+'"/>';
    o += '<path d="M22,44a28,28 0 1 0 56,0a28,28 0 1 0 -56,0" fill="none" stroke="'+BRASS+'" stroke-width="3.4"/>';
    o += '<path d="M22,44a28,28 0 0 0 28,28" fill="none" stroke="'+dk(BRASS,.28)+'" stroke-width="3.4"/>';
    o += '<circle cx="50" cy="44" r="24" fill="url(#'+g+')" stroke="'+dk(sea,.4)+'" stroke-width=".6"/>';
    /* a plausible arrangement of continents, not any actual one */
    o += '<path d="M33,30q7,-5 13,0q5,4 2,9q-4,6 -11,4q-7,-3 -4,-13Z" fill="'+land+'" opacity=".95"/>';
    o += '<path d="M42,45q5,-2 7,3q1,6 -1,12q-2,6 -6,3q-4,-4 -3,-11q0,-5 3,-7Z" fill="'+land+'" opacity=".95"/>';
    o += '<path d="M57,34q8,-2 11,4q2,6 -2,9q-6,4 -10,-1q-4,-6 1,-12Z" fill="'+land+'" opacity=".92"/>';
    o += '<path d="M60,52q7,0 8,6q0,6 -6,7q-6,0 -6,-6q0,-6 4,-7Z" fill="'+land+'" opacity=".9"/>';
    o += '<path d="M26,44q24,-9 48,0M26,44q24,9 48,0M50,20v48" fill="none" stroke="'+dk(sea,.35)+'" stroke-width=".5" opacity=".55"/>';
    o += '<ellipse cx="41" cy="34" rx="7" ry="4.4" fill="#fff" opacity=".22" transform="rotate(-30 41 34)"/>';
    return o;
  };

  C.box = function(p){
    var w = p.c1 || '#6A4A32', lid = p.c2 || dk(p.c1||'#6A4A32',.15), o = '';
    o += '<path d="M18,44L50,30L82,44L82,72L50,86L18,72Z" fill="'+w+'" stroke="'+dk(w,.4)+'" stroke-width=".7" stroke-linejoin="round"/>';
    o += '<path d="M18,44L50,58L50,86L18,72Z" fill="'+dk(w,.24)+'"/>';
    o += '<path d="M82,44L50,58L50,86L82,72Z" fill="'+dk(w,.06)+'"/>';
    o += '<path d="M18,44L50,30L82,44L50,58Z" fill="'+lid+'"/>';
    o += '<path d="M18,44L50,58L82,44" fill="none" stroke="'+BRASS+'" stroke-width="1.2" opacity=".85"/>';
    o += '<path d="M50,58v28" stroke="'+dk(w,.5)+'" stroke-width=".6"/>';
    o += '<circle cx="50" cy="66" r="3.4" fill="'+BRASS+'" stroke="'+BRASS_D+'" stroke-width=".6"/>';
    o += '<circle cx="50" cy="66" r="1.2" fill="'+BRASS_D+'"/>';
    if (p.inlay){
      o += '<path d="M50,36L64,42L50,48L36,42Z" fill="'+(p.inlay)+'" opacity=".9"/>';
    }
    if (p.studs){
      [[28,48],[72,48],[28,66],[72,66]].forEach(function(s){
        o += '<circle cx="'+s[0]+'" cy="'+s[1]+'" r="1.6" fill="'+BRASS+'"/>';
      });
    }
    return o;
  };

  C.ring = function(p){
    var band = p.c1 || BRASS, stone = p.c2 || '#7E4A6E', g = id();
    var o = '<defs>'+sheen(g, stone, .5)+'</defs>';
    o += '<circle cx="50" cy="60" r="22" fill="none" stroke="'+dk(band,.3)+'" stroke-width="6"/>';
    o += '<circle cx="50" cy="60" r="22" fill="none" stroke="'+lt(band,.28)+'" stroke-width="2.6"/>';
    if (p.cut === 'round'){
      o += '<circle cx="50" cy="32" r="12" fill="url(#'+g+')" stroke="'+dk(stone,.4)+'" stroke-width=".6"/>';
      for (var i=0;i<8;i++){
        var a = i*45*Math.PI/180;
        o += '<path d="M50,32L'+n(50+Math.cos(a)*12)+','+n(32+Math.sin(a)*12)+'" stroke="'+lt(stone,.4)+'" stroke-width=".6" opacity=".6"/>';
      }
    } else if (p.cut === 'cabochon'){
      o += '<ellipse cx="50" cy="32" rx="13" ry="10" fill="url(#'+g+')" stroke="'+dk(stone,.4)+'" stroke-width=".7"/>';
      o += '<ellipse cx="46" cy="28" rx="4.4" ry="2.6" fill="#fff" opacity=".42" transform="rotate(-24 46 28)"/>';
    } else {
      o += '<path d="M50,20L62,30L50,44L38,30Z" fill="url(#'+g+')" stroke="'+dk(stone,.4)+'" stroke-width=".6"/>';
      o += '<path d="M38,30L62,30M50,20L50,44" stroke="'+lt(stone,.45)+'" stroke-width=".7" opacity=".7"/>';
    }
    [[38,36],[62,36]].forEach(function(s){ o += '<circle cx="'+s[0]+'" cy="'+s[1]+'" r="2.4" fill="'+band+'"/>'; });
    return o;
  };

  C.brooch = function(p){
    var m = p.c1 || BRASS, en = p.c2 || '#4E6B78', o = '', g = id();
    o = '<defs>'+sheen(g, en, .4)+'</defs>';
    o += '<path d="M50,16L60,32L78,36L64,50L68,70L50,60L32,70L36,50L22,36L40,32Z" fill="'+m+'" stroke="'+dk(m,.35)+'" stroke-width=".7" stroke-linejoin="round"/>';
    o += '<circle cx="50" cy="44" r="13" fill="url(#'+g+')" stroke="'+dk(m,.3)+'" stroke-width="1.4"/>';
    for (var i=0;i<6;i++){
      var a = i*60*Math.PI/180;
      o += '<circle cx="'+n(50+Math.cos(a)*20)+'" cy="'+n(44+Math.sin(a)*20)+'" r="2.6" fill="'+(p.c3||'#E4D7B4')+'" stroke="'+dk(m,.3)+'" stroke-width=".4"/>';
    }
    o += '<circle cx="50" cy="44" r="4.6" fill="'+lt(en,.4)+'" opacity=".7"/>';
    o += '<path d="M30,74q20,10 40,0" fill="none" stroke="'+dk(m,.3)+'" stroke-width="1.4"/>';
    return o;
  };

  C.book = function(p){
    var cov = p.c1 || '#6B2F2A', pg = '#EDE2C6', o = '';
    o += '<path d="M22,22h50a6,6 0 0 1 6,6v46a6,6 0 0 1 -6,6h-50Z" fill="'+cov+'" stroke="'+dk(cov,.4)+'" stroke-width=".7"/>';
    o += '<path d="M22,22h6v58h-6Z" fill="'+dk(cov,.3)+'"/>';
    o += '<path d="M28,26h48v50h-48Z" fill="'+pg+'"/>';
    for (var i=0;i<7;i++) o += '<path d="M76,'+n(28+i*7)+'h2" stroke="'+dk(pg,.16)+'" stroke-width="4"/>';
    o += '<path d="M34,34h30M34,40h30M34,46h22" stroke="'+dk(pg,.4)+'" stroke-width="1" opacity=".55"/>';
    o += '<path d="M22,34h6M22,50h6M22,66h6" stroke="'+BRASS+'" stroke-width="1.6" opacity=".9"/>';
    if (p.title !== false){
      o += '<rect x="38" y="54" width="24" height="14" rx="1" fill="'+(p.c2||BRASS)+'" opacity=".8"/>';
      o += '<path d="M42,59h16M42,63h11" stroke="'+dk(p.c2||BRASS,.45)+'" stroke-width="1.1"/>';
    }
    if (p.clasp){
      o += '<path d="M76,44h6v12h-6Z" fill="'+BRASS+'" stroke="'+BRASS_D+'" stroke-width=".5"/>';
    }
    return o;
  };

  C.key = function(p){
    var m = p.c1 || BRASS, o = '';
    o += '<circle cx="50" cy="26" r="14" fill="none" stroke="'+m+'" stroke-width="5"/>';
    o += '<circle cx="50" cy="26" r="7" fill="none" stroke="'+dk(m,.25)+'" stroke-width="1.2"/>';
    if (p.orn){
      [[36,16],[64,16],[36,36],[64,36]].forEach(function(s){ o += '<circle cx="'+s[0]+'" cy="'+s[1]+'" r="3" fill="'+m+'"/>'; });
    }
    o += '<path d="M47,40h6v40h-6Z" fill="'+m+'"/>';
    o += '<path d="M53,64h11v6h-11ZM53,74h8v6h-8Z" fill="'+m+'"/>';
    o += '<path d="M47,40h2v40h-2Z" fill="'+lt(m,.3)+'" opacity=".7"/>';
    o += '<circle cx="50" cy="26" r="14" fill="none" stroke="'+lt(m,.34)+'" stroke-width="1.4" opacity=".7"/>';
    return o;
  };

  C.compass = function(p){
    var m = p.c1 || BRASS, face = p.c2 || '#EDE3C8', o = '', g = id();
    o = '<defs>'+sheen(g, m, .42)+'</defs>';
    o += '<circle cx="50" cy="52" r="32" fill="url(#'+g+')" stroke="'+BRASS_D+'" stroke-width="1"/>';
    o += '<circle cx="50" cy="52" r="26" fill="'+face+'" stroke="'+dk(face,.3)+'" stroke-width=".7"/>';
    for (var i=0;i<32;i++){
      var a = i*11.25*Math.PI/180, ln = i%8===0?6:(i%4===0?4:2.2);
      o += '<path d="M'+n(50+Math.cos(a)*25)+','+n(52+Math.sin(a)*25)+'L'+n(50+Math.cos(a)*(25-ln))+','+n(52+Math.sin(a)*(25-ln))+'" stroke="'+dk(face,.55)+'" stroke-width=".7"/>';
    }
    o += '<path d="M50,30L55,52L50,74L45,52Z" fill="'+(p.c3||'#8E3A2E')+'"/>';
    o += '<path d="M50,52L55,52L50,74L45,52Z" fill="'+dk(face,.6)+'"/>';
    o += '<circle cx="50" cy="52" r="3" fill="'+m+'" stroke="'+BRASS_D+'" stroke-width=".5"/>';
    o += '<path d="M44,14h12v8h-12Z" fill="'+m+'"/><circle cx="50" cy="14" r="5" fill="none" stroke="'+m+'" stroke-width="2.6"/>';
    return o;
  };

  C.hourglass = function(p){
    var w = p.c1 || WOOD, sand = p.c2 || '#D2B071', o = '';
    o += '<path d="M22,16h56v6h-56ZM22,82h56v6h-56Z" fill="'+w+'" stroke="'+dk(w,.35)+'" stroke-width=".6"/>';
    o += '<path d="M28,16v72M72,16v72" stroke="'+w+'" stroke-width="3.4" stroke-linecap="round"/>';
    o += '<path d="M34,22h32L52,52l14,30h-32L48,52Z" fill="#E6EEF0" opacity=".45" stroke="#B9C8CE" stroke-width=".7"/>';
    o += '<path d="M34,22h32L53,49h-6Z" fill="'+sand+'" opacity=".92"/>';
    o += '<path d="M50,52l1,0l10,30h-22Z" fill="'+sand+'" opacity=".92"/>';
    o += '<path d="M50,53v22" stroke="'+dk(sand,.16)+'" stroke-width="1.1" opacity=".9"/>';
    o += '<path d="M36,24h28L54,46" fill="none" stroke="#fff" stroke-width="1" opacity=".35"/>';
    return o;
  };

  C.loupe = function(p){
    var m = p.c1 || BRASS, o = '', g = id();
    o = '<defs><radialGradient id="'+g+'" cx="34%" cy="28%" r="80%">' +
        '<stop offset="0%" stop-color="#FBFDFD" stop-opacity=".85"/><stop offset="60%" stop-color="#D7E4E7" stop-opacity=".45"/>' +
        '<stop offset="100%" stop-color="#A9BDC4" stop-opacity=".55"/></radialGradient></defs>';
    o += '<path d="M40,62L26,84" stroke="'+(p.c2||WOOD)+'" stroke-width="8" stroke-linecap="round"/>';
    o += '<path d="M40,62L28,80" stroke="'+lt(p.c2||WOOD,.2)+'" stroke-width="2.6" stroke-linecap="round" opacity=".7"/>';
    o += '<circle cx="50" cy="42" r="26" fill="url(#'+g+')" stroke="'+m+'" stroke-width="5"/>';
    o += '<circle cx="50" cy="42" r="26" fill="none" stroke="'+lt(m,.34)+'" stroke-width="1.4"/>';
    o += '<path d="M36,30q10,-8 20,-2" fill="none" stroke="#fff" stroke-width="3" opacity=".5" stroke-linecap="round"/>';
    return o;
  };

  C.inkwell = function(p){
    var glass = p.c1 || '#4A5B6B', o = '', g = id();
    o = '<defs>'+sheen(g, glass, .34)+'</defs>';
    o += '<path d="M62,60C62,42 70,28 78,18" fill="none" stroke="'+(p.c2||'#D8CBAE')+'" stroke-width="4" stroke-linecap="round"/>';
    o += '<path d="M76,20q6,-8 8,-6q1,3 -6,10Z" fill="'+(p.c2||'#D8CBAE')+'"/>';
    o += '<path d="M62,60l-3,-8" stroke="'+dk(glass,.2)+'" stroke-width="2.4" stroke-linecap="round"/>';
    o += '<path d="M30,52h40l-4,28a6,6 0 0 1 -6,5h-20a6,6 0 0 1 -6,-5Z" fill="url(#'+g+')" stroke="'+dk(glass,.45)+'" stroke-width=".7"/>';
    o += '<path d="M32,64h36l-2,16a6,6 0 0 1 -6,5h-20a6,6 0 0 1 -6,-5Z" fill="'+dk(glass,.5)+'" opacity=".9"/>';
    o += '<path d="M26,46h48v8h-48Z" fill="'+(p.c3||BRASS)+'" stroke="'+BRASS_D+'" stroke-width=".6"/>';
    o += '<path d="M36,58h4v22h-4Z" fill="#fff" opacity=".22"/>';
    return o;
  };

  C.watch = function(p){
    var m = p.c1 || BRASS, face = p.c2 || '#EFE6CE', o = '', g = id();
    o = '<defs>'+sheen(g, m, .4)+'</defs>';
    o += '<path d="M50,16v-6M44,10h12" stroke="'+m+'" stroke-width="3"/>';
    o += '<circle cx="50" cy="4" r="4" fill="none" stroke="'+m+'" stroke-width="2"/>';
    o += '<circle cx="50" cy="54" r="34" fill="url(#'+g+')" stroke="'+BRASS_D+'" stroke-width="1"/>';
    o += '<circle cx="50" cy="54" r="28" fill="'+face+'" stroke="'+dk(face,.3)+'" stroke-width=".7"/>';
    for (var i=0;i<12;i++){
      var a = (i*30-90)*Math.PI/180;
      o += '<path d="M'+n(50+Math.cos(a)*25)+','+n(54+Math.sin(a)*25)+'L'+n(50+Math.cos(a)*21)+','+n(54+Math.sin(a)*21)+'" stroke="'+dk(face,.6)+'" stroke-width="'+(i%3===0?1.7:.9)+'"/>';
    }
    o += '<path d="M50,54L50,36M50,54L64,60" stroke="'+dk(face,.72)+'" stroke-width="2" stroke-linecap="round"/>';
    o += '<circle cx="50" cy="54" r="2.2" fill="'+dk(face,.72)+'"/>';
    o += '<circle cx="50" cy="70" r="6" fill="none" stroke="'+dk(face,.4)+'" stroke-width=".7"/>';
    return o;
  };

  C.spectacles = function(p){
    var m = p.c1 || BRASS, o = '';
    o += '<circle cx="28" cy="52" r="17" fill="#E9F1F3" opacity=".4" stroke="'+m+'" stroke-width="3.4"/>';
    o += '<circle cx="72" cy="52" r="17" fill="#E9F1F3" opacity=".4" stroke="'+m+'" stroke-width="3.4"/>';
    o += '<path d="M45,50q5,-5 10,0" fill="none" stroke="'+m+'" stroke-width="3"/>';
    o += '<path d="M11,50q-6,-6 -4,-16M89,50q6,-6 4,-16" fill="none" stroke="'+m+'" stroke-width="2.6" stroke-linecap="round"/>';
    o += '<path d="M18,42q8,-6 18,-2M62,40q10,-4 18,2" fill="none" stroke="#fff" stroke-width="2.4" opacity=".45" stroke-linecap="round"/>';
    return o;
  };

  C.lantern = function(p){
    var m = p.c1 || BRASS, glow = p.c2 || '#E9C169', o = '', g = id();
    o = '<defs><radialGradient id="'+g+'" cx="50%" cy="55%" r="60%">' +
        '<stop offset="0%" stop-color="'+lt(glow,.5)+'"/><stop offset="65%" stop-color="'+glow+'"/><stop offset="100%" stop-color="'+dk(glow,.4)+'"/></radialGradient></defs>';
    o += '<path d="M50,10a10,10 0 0 1 0,10" fill="none" stroke="'+m+'" stroke-width="2.4"/>';
    o += '<path d="M34,22h32l4,8h-40Z" fill="'+m+'" stroke="'+BRASS_D+'" stroke-width=".6"/>';
    o += '<path d="M32,30h36v44h-36Z" fill="url(#'+g+')" opacity=".9"/>';
    o += '<path d="M32,30h36v44h-36Z" fill="none" stroke="'+m+'" stroke-width="3"/>';
    o += '<path d="M44,30v44M56,30v44M32,52h36" stroke="'+m+'" stroke-width="1.6" opacity=".9"/>';
    o += '<path d="M30,74h40l3,10h-46Z" fill="'+m+'" stroke="'+BRASS_D+'" stroke-width=".6"/>';
    o += '<path d="M50,44q4,4 0,10q-4,-6 0,-10Z" fill="#FFF3D0"/>';
    return o;
  };

  C.candle = function(p){
    var wax = p.c1 || '#EDE0C4', o = '';
    o += '<path d="M36,84h28l-2,-8h-24Z" fill="'+(p.c2||BRASS)+'" stroke="'+BRASS_D+'" stroke-width=".6"/>';
    o += '<path d="M42,76h16l-1,-42h-14Z" fill="'+wax+'" stroke="'+dk(wax,.24)+'" stroke-width=".6"/>';
    o += '<path d="M43,40q-3,10 0,20q2,-10 0,-20Z" fill="'+lt(wax,.6)+'" opacity=".7"/>';
    o += '<path d="M44,34q3,-4 6,-1q3,4 6,1l-1,4h-10Z" fill="'+dk(wax,.1)+'"/>';
    o += '<path d="M50,32v-5" stroke="#3A2E22" stroke-width="1.4"/>';
    o += '<path d="M50,8q9,10 0,20q-9,-10 0,-20Z" fill="#E9A83E" opacity=".9"/>';
    o += '<path d="M50,14q5,6 0,12q-5,-6 0,-12Z" fill="#FFF0C4"/>';
    return o;
  };

  C.telescope = function(p){
    var m = p.c1 || BRASS, o = '';
    o += '<g transform="rotate(-26 50 50)">';
    o += '<path d="M16,44h48v14h-48Z" fill="'+m+'" stroke="'+BRASS_D+'" stroke-width=".6"/>';
    o += '<path d="M64,40h20v22h-20Z" fill="'+lt(m,.14)+'" stroke="'+BRASS_D+'" stroke-width=".6"/>';
    o += '<path d="M10,40h8v22h-8Z" fill="'+dk(m,.2)+'" stroke="'+BRASS_D+'" stroke-width=".6"/>';
    o += '<path d="M16,46h68v3h-68Z" fill="'+lt(m,.4)+'" opacity=".7"/>';
    o += '<path d="M84,40h3v22h-3Z" fill="#DCEBEF" opacity=".7"/>';
    o += '</g>';
    o += '<path d="M50,58L32,88M50,58L68,88M50,58L50,90" stroke="'+(p.c2||WOOD)+'" stroke-width="3.4" stroke-linecap="round"/>';
    return o;
  };

  C.belljar = function(p){
    var base = p.c1 || WOOD, o = '', g = id();
    o = '<defs><linearGradient id="'+g+'" x1="0" y1="0" x2="1" y2="0">' +
        '<stop offset="0%" stop-color="#FFFFFF" stop-opacity=".26"/><stop offset="26%" stop-color="#D6E4E8" stop-opacity=".08"/>' +
        '<stop offset="72%" stop-color="#FFFFFF" stop-opacity=".05"/><stop offset="100%" stop-color="#BCD0D6" stop-opacity=".2"/></linearGradient></defs>';
    o += '<ellipse cx="50" cy="84" rx="30" ry="7" fill="'+base+'" stroke="'+dk(base,.4)+'" stroke-width=".7"/>';
    o += '<ellipse cx="50" cy="80" rx="30" ry="7" fill="'+lt(base,.14)+'" stroke="'+dk(base,.4)+'" stroke-width=".7"/>';
    /* the treasure inside */
    if (p.inner === 'moss'){
      o += '<ellipse cx="50" cy="74" rx="19" ry="7" fill="#5E6E42"/>';
      o += '<path d="M38,73q4,-18 12,-21q8,3 12,21Z" fill="'+(p.c2||'#8DA05E')+'"/>';
      for (var mi=0; mi<9; mi++){
        var mx = 40 + mi*2.6, my = 70 - Math.sin(mi/8*Math.PI)*15;
        o += '<path d="M'+n(mx)+',73L'+n(mx)+','+n(my)+'" stroke="'+dk(p.c2||'#8DA05E',.28)+'" stroke-width="1.1" opacity=".8"/>';
        o += '<circle cx="'+n(mx)+'" cy="'+n(my)+'" r="1.5" fill="'+lt(p.c2||'#8DA05E',.3)+'"/>';
      }
    } else if (p.inner === 'rose'){
      o += '<path d="M50,74v-14" stroke="#6E7A4E" stroke-width="1.8"/>';
      o += '<circle cx="50" cy="54" r="9" fill="'+(p.c2||'#9C4756')+'"/>';
      o += '<circle cx="50" cy="54" r="5.4" fill="'+lt(p.c2||'#9C4756',.24)+'"/>';
      o += '<circle cx="50" cy="54" r="2.4" fill="'+dk(p.c2||'#9C4756',.24)+'"/>';
    } else {
      o += '<path d="M50,74v-12" stroke="#6E7A4E" stroke-width="1.6"/>';
      o += '<ellipse cx="43" cy="58" rx="8" ry="4.4" fill="'+(p.c2||'#7C6EA0')+'" transform="rotate(-24 43 58)"/>';
      o += '<ellipse cx="57" cy="58" rx="8" ry="4.4" fill="'+(p.c2||'#7C6EA0')+'" transform="rotate(24 57 58)"/>';
      o += '<circle cx="50" cy="59" r="2.4" fill="#3A2F24"/>';
    }
    o += '<path d="M26,80V44C26,26 38,16 50,16C62,16 74,26 74,44v36Z" fill="url(#'+g+')" stroke="#AEC2C8" stroke-width="1.2"/>';
    o += '<circle cx="50" cy="13" r="4.4" fill="#DCE9ED" stroke="#AEC2C8" stroke-width="1"/>';
    o += '<path d="M34,72V44c0,-14 6,-22 12,-24" fill="none" stroke="#fff" stroke-width="2.4" opacity=".4"/>';
    return o;
  };

  C.letter = function(p){
    var pap = p.c1 || '#EEE3C6', wax = p.c2 || '#8E2F28', o = '';
    o += '<path d="M16,30h68v46h-68Z" fill="'+pap+'" stroke="'+dk(pap,.3)+'" stroke-width=".7"/>';
    o += '<path d="M16,30L50,58L84,30" fill="none" stroke="'+dk(pap,.34)+'" stroke-width=".9"/>';
    o += '<path d="M16,76L40,54M84,76L60,54" fill="none" stroke="'+dk(pap,.22)+'" stroke-width=".7"/>';
    o += '<circle cx="50" cy="58" r="11" fill="'+wax+'" stroke="'+dk(wax,.3)+'" stroke-width=".6"/>';
    for (var i=0;i<12;i++){
      var a = i*30*Math.PI/180;
      o += '<circle cx="'+n(50+Math.cos(a)*10.6)+'" cy="'+n(58+Math.sin(a)*10.6)+'" r="2" fill="'+wax+'"/>';
    }
    o += '<path d="M46,54h8M46,58h8M46,62h5" stroke="'+dk(wax,.35)+'" stroke-width="1.2"/>';
    o += '<ellipse cx="46" cy="54" rx="3.4" ry="2" fill="#fff" opacity=".2"/>';
    return o;
  };

  C.teacup = function(p){
    var cup = p.c1 || '#F0EAD9', pat = p.c2 || '#6C7FA0', o = '';
    o += '<ellipse cx="50" cy="80" rx="24" ry="6" fill="'+dk(cup,.12)+'" stroke="'+dk(cup,.3)+'" stroke-width=".6"/>';
    o += '<path d="M70,48q12,2 10,12q-2,10 -12,8" fill="none" stroke="'+cup+'" stroke-width="5"/>';
    o += '<path d="M70,48q12,2 10,12q-2,10 -12,8" fill="none" stroke="'+dk(cup,.24)+'" stroke-width="1"/>';
    o += '<path d="M28,42h44l-5,28a8,8 0 0 1 -8,6h-18a8,8 0 0 1 -8,-6Z" fill="'+cup+'" stroke="'+dk(cup,.3)+'" stroke-width=".7"/>';
    o += '<ellipse cx="50" cy="42" rx="22" ry="6" fill="'+dk(cup,.06)+'" stroke="'+dk(cup,.3)+'" stroke-width=".7"/>';
    o += '<ellipse cx="50" cy="43" rx="18" ry="4.6" fill="'+(p.c3||'#8B6A3E')+'" opacity=".9"/>';
    o += '<path d="M31,54h38" stroke="'+pat+'" stroke-width="2.2" opacity=".85"/>';
    for (var i=0;i<5;i++){
      o += '<circle cx="'+n(34+i*8)+'" cy="62" r="2.2" fill="'+pat+'" opacity=".8"/>';
    }
    o += '<path d="M44,32q2,-8 6,-10M52,32q3,-7 7,-9" fill="none" stroke="#D8D0BE" stroke-width="1.6" opacity=".7" stroke-linecap="round"/>';
    return o;
  };

  C.thimble = function(p){
    var m = p.c1 || '#A8A29A', o = '', g = id();
    o = '<defs>'+sheen(g, m, .4)+'</defs>';
    o += '<path d="M32,78h36l-2,-26C64,32 58,22 50,22C42,22 36,32 34,52Z" fill="url(#'+g+')" stroke="'+dk(m,.4)+'" stroke-width=".7"/>';
    for (var r=0;r<6;r++){ for (var c2=0;c2<9;c2++){
      var xx = 36 + c2*3.4 + (r%2?1.6:0), yy = 30 + r*5;
      if (Math.abs(xx-50) > 15 - r) continue;
      o += '<circle cx="'+n(xx)+'" cy="'+n(yy)+'" r=".9" fill="'+dk(m,.3)+'" opacity=".7"/>';
    }}
    o += '<path d="M31,70h38v6h-38Z" fill="'+(p.c2||BRASS)+'" opacity=".9"/>';
    o += '<path d="M40,28q6,-6 12,-2" fill="none" stroke="#fff" stroke-width="2.4" opacity=".45" stroke-linecap="round"/>';
    return o;
  };

  C.medal = function(p){
    var m = p.c1 || BRASS, rib = p.c2 || '#7B3038', o = '', g = id();
    o = '<defs>'+sheen(g, m, .42)+'</defs>';
    o += '<path d="M34,10h12l6,26h-14ZM66,10h-12l-6,26h14Z" fill="'+rib+'" stroke="'+dk(rib,.3)+'" stroke-width=".5"/>';
    o += '<path d="M40,10h20v6h-20Z" fill="'+dk(rib,.2)+'"/>';
    o += '<circle cx="50" cy="58" r="26" fill="url(#'+g+')" stroke="'+BRASS_D+'" stroke-width="1"/>';
    o += '<circle cx="50" cy="58" r="20" fill="none" stroke="'+dk(m,.24)+'" stroke-width="1"/>';
    for (var i=0;i<24;i++){
      var a = i*15*Math.PI/180;
      o += '<path d="M'+n(50+Math.cos(a)*26)+','+n(58+Math.sin(a)*26)+'L'+n(50+Math.cos(a)*23)+','+n(58+Math.sin(a)*23)+'" stroke="'+dk(m,.3)+'" stroke-width=".7"/>';
    }
    o += '<path d="M50,44l4,9 10,1 -7,7 2,10 -9,-5 -9,5 2,-10 -7,-7 10,-1Z" fill="'+dk(m,.26)+'"/>';
    return o;
  };

  C.quill = function(p){
    var f = p.c1 || '#E8DFC8', o = '';
    o += '<g transform="rotate(18 50 50)">';
    for (var i=0;i<44;i++){
      var t2 = i/43, y = 10 + t2*58, w = Math.sin(Math.pow(t2,.55)*Math.PI)*15*(1-t2*.3);
      [-1,1].forEach(function(s){
        o += '<path d="M50,'+n(y)+'L'+n(50+s*w)+','+n(y-w*.4)+'" stroke="'+mix(f, dk(f,.3), t2)+'" stroke-width="1.4" stroke-linecap="round"/>';
      });
    }
    o += '<path d="M50,10C51,36 51,58 50,72" fill="none" stroke="'+dk(f,.35)+'" stroke-width="1.3"/>';
    o += '<path d="M50,72l-1,14q1,4 2,0Z" fill="'+(p.c2||'#3A2E22')+'"/>';
    o += '</g>';
    return o;
  };

  C.microscope = function(p){
    var m = p.c1 || '#4A4640', o = '';
    o += '<path d="M26,86h48q4,0 4,-4t-4,-4h-48q-4,0 -4,4t4,4Z" fill="'+m+'"/>';
    o += '<path d="M44,78q-6,-14 2,-22" fill="none" stroke="'+m+'" stroke-width="6" stroke-linecap="round"/>';
    o += '<path d="M32,58h34v5h-34Z" fill="'+(p.c2||BRASS)+'"/>';
    o += '<g transform="rotate(16 52 40)">';
    o += '<path d="M46,14h14v34h-14Z" fill="'+(p.c2||BRASS)+'" stroke="'+BRASS_D+'" stroke-width=".5"/>';
    o += '<path d="M48,48h10v8h-10Z" fill="'+dk(p.c2||BRASS,.24)+'"/>';
    o += '<path d="M44,10h18v6h-18Z" fill="'+dk(p.c2||BRASS,.1)+'"/>';
    o += '</g>';
    o += '<circle cx="38" cy="66" r="5" fill="'+(p.c2||BRASS)+'" stroke="'+BRASS_D+'" stroke-width=".5"/>';
    o += '<path d="M36,60h6" stroke="'+dk(m,.2)+'" stroke-width="1.4"/>';
    o += '<rect x="42" y="55" width="16" height="3" fill="#DCE9ED" opacity=".8"/>';
    return o;
  };

  C.coin = function(p){
    var m = p.c1 || '#B9A05E', o = '', g = id();
    o = '<defs>'+sheen(g, m, .42)+'</defs>';
    o += '<circle cx="50" cy="52" r="30" fill="url(#'+g+')" stroke="'+dk(m,.42)+'" stroke-width="1"/>';
    o += '<circle cx="50" cy="52" r="24" fill="none" stroke="'+dk(m,.3)+'" stroke-width=".8"/>';
    for (var i=0;i<40;i++){
      var a = i*9*Math.PI/180;
      o += '<path d="M'+n(50+Math.cos(a)*30)+','+n(52+Math.sin(a)*30)+'L'+n(50+Math.cos(a)*27.4)+','+n(52+Math.sin(a)*27.4)+'" stroke="'+dk(m,.34)+'" stroke-width=".8"/>';
    }
    /* a profile, in relief */
    o += '<path d="M42,66C40,54 42,42 52,38C62,34 66,44 62,52C60,58 58,64 58,66Z" fill="'+dk(m,.22)+'"/>';
    o += '<path d="M44,64C42,54 44,44 52,40C60,37 63,45 60,52C58,57 56,62 56,64Z" fill="'+lt(m,.2)+'"/>';
    o += '<circle cx="53" cy="46" r="1.4" fill="'+dk(m,.4)+'"/>';
    return o;
  };

  C.pendulum = function(p){
    var w = p.c1 || WOOD, o = '';
    o += '<path d="M34,10h32v72h-32Z" fill="'+w+'" stroke="'+dk(w,.4)+'" stroke-width=".7"/>';
    o += '<path d="M38,14h24v30h-24Z" fill="'+(p.c2||'#EEE4C8')+'"/>';
    o += '<circle cx="50" cy="29" r="12" fill="none" stroke="'+dk(w,.3)+'" stroke-width=".9"/>';
    o += '<path d="M50,29V20M50,29l7,4" stroke="'+dk(w,.5)+'" stroke-width="1.4" stroke-linecap="round"/>';
    o += '<path d="M38,48h24v30h-24Z" fill="#DCE7EA" opacity=".38" stroke="'+dk(w,.3)+'" stroke-width=".6"/>';
    o += '<path d="M50,48v20" stroke="'+BRASS+'" stroke-width="1.4"/>';
    o += '<circle cx="50" cy="72" r="7" fill="'+BRASS+'" stroke="'+BRASS_D+'" stroke-width=".7"/>';
    o += '<circle cx="48" cy="70" r="2.4" fill="'+lt(BRASS,.4)+'" opacity=".8"/>';
    o += '<path d="M30,82h40l3,6h-46Z" fill="'+dk(w,.2)+'"/>';
    o += '<path d="M32,10h36l-4,-6h-28Z" fill="'+dk(w,.12)+'"/>';
    return o;
  };

  C.specimenjar = function(p){
    var liq = p.c1 || '#C0B28A', o = '', g = id();
    o = '<defs>'+sheen(g, liq, .3)+'</defs>';
    o += '<path d="M32,26h36v52a8,8 0 0 1 -8,8h-20a8,8 0 0 1 -8,-8Z" fill="url(#'+g+')" opacity=".78" stroke="#B4C4C8" stroke-width="1"/>';
    if (p.inner === 'coil'){
      o += '<path d="M42,70q16,-6 12,-16q-4,-8 -12,-4q-8,4 -2,12" fill="none" stroke="'+(p.c2||'#8E7A5C')+'" stroke-width="4" stroke-linecap="round"/>';
    } else if (p.inner === 'sprig'){
      o += '<path d="M50,76V44" stroke="'+(p.c2||'#6E7A4E')+'" stroke-width="1.8"/>';
      for (var i=0;i<5;i++){
        o += '<path d="M50,'+n(48+i*6)+'q-9,-3 -11,-8M50,'+n(51+i*6)+'q9,-3 11,-8" fill="none" stroke="'+(p.c2||'#6E7A4E')+'" stroke-width="1.4"/>';
      }
    } else {
      o += '<ellipse cx="50" cy="62" rx="13" ry="10" fill="'+(p.c2||'#9A8468')+'" opacity=".9"/>';
      o += '<path d="M40,60q10,-8 20,0" fill="none" stroke="'+dk(p.c2||'#9A8468',.3)+'" stroke-width="1.2"/>';
    }
    o += '<path d="M30,20h40v8h-40Z" fill="'+(p.c3||'#7A5B3C')+'" stroke="'+dk(p.c3||'#7A5B3C',.35)+'" stroke-width=".6"/>';
    o += '<path d="M34,14h32v6h-32Z" fill="'+dk(p.c3||'#7A5B3C',.16)+'"/>';
    o += '<path d="M36,32v46" stroke="#fff" stroke-width="3" opacity=".28"/>';
    o += '<rect x="38" y="52" width="24" height="12" fill="#F3EAD2" opacity=".9" stroke="'+dk(liq,.4)+'" stroke-width=".4"/>';
    o += '<path d="M41,56h18M41,60h12" stroke="'+dk(liq,.55)+'" stroke-width=".9" opacity=".7"/>';
    return o;
  };

  C.sextant = function(p){
    var m = p.c1 || BRASS, o = '';
    o += '<path d="M20,74A46,46 0 0 1 66,28L66,74Z" fill="none" stroke="'+m+'" stroke-width="3.4"/>';
    o += '<path d="M24,74A42,42 0 0 1 62,34" fill="none" stroke="'+dk(m,.3)+'" stroke-width="6"/>';
    for (var i=0;i<14;i++){
      var a = (180 + i*6.4)*Math.PI/180;
      o += '<path d="M'+n(66+Math.cos(a)*42)+','+n(74+Math.sin(a)*42)+'L'+n(66+Math.cos(a)*37)+','+n(74+Math.sin(a)*37)+'" stroke="'+lt(m,.5)+'" stroke-width=".7"/>';
    }
    o += '<path d="M66,74L28,52" stroke="'+m+'" stroke-width="2.6"/>';
    o += '<path d="M66,74L66,30" stroke="'+m+'" stroke-width="2.6"/>';
    o += '<rect x="24" y="44" width="9" height="13" fill="#CFE0E4" opacity=".8" stroke="'+m+'" stroke-width="1.2"/>';
    o += '<rect x="58" y="36" width="8" height="12" fill="#CFE0E4" opacity=".8" stroke="'+m+'" stroke-width="1.2"/>';
    o += '<circle cx="66" cy="74" r="4" fill="'+m+'" stroke="'+BRASS_D+'" stroke-width=".6"/>';
    o += '<path d="M70,60h16v6h-16Z" fill="'+dk(m,.24)+'" transform="rotate(-14 70 60)"/>';
    return o;
  };

  C.locket = function(p){
    var m = p.c1 || BRASS, in2 = p.c2 || '#8E6E7E', o = '', g = id();
    o = '<defs>'+sheen(g, m, .44)+'</defs>';
    o += '<path d="M50,14C34,4 12,14 18,32" fill="none" stroke="'+dk(m,.24)+'" stroke-width="1.6"/>';
    o += '<path d="M50,14C66,4 88,14 82,32" fill="none" stroke="'+dk(m,.24)+'" stroke-width="1.6"/>';
    o += '<path d="M50,84C34,72 26,58 26,46C26,36 34,30 42,32C46,33 49,36 50,39C51,36 54,33 58,32C66,30 74,36 74,46C74,58 66,72 50,84Z" fill="url(#'+g+')" stroke="'+BRASS_D+'" stroke-width=".8"/>';
    o += '<path d="M50,76C38,66 32,56 32,47C32,40 37,36 42,37C46,38 49,42 50,45C51,42 54,38 58,37C63,36 68,40 68,47C68,56 62,66 50,76Z" fill="none" stroke="'+dk(m,.3)+'" stroke-width=".8"/>';
    o += '<circle cx="50" cy="50" r="9" fill="'+in2+'" opacity=".85"/>';
    o += '<path d="M46,52q4,-6 8,0q-4,5 -8,0Z" fill="'+lt(in2,.5)+'"/>';
    return o;
  };

  C.abacus = function(p){
    var w = p.c1 || WOOD, b = p.c2 || '#8E4A38', o = '';
    o += '<path d="M18,20h64v60h-64Z" fill="none" stroke="'+w+'" stroke-width="5"/>';
    o += '<path d="M50,20v60" stroke="'+w+'" stroke-width="3"/>';
    for (var r=0;r<5;r++){
      var y = 30 + r*11;
      o += '<path d="M20,'+y+'h60" stroke="'+dk(w,.24)+'" stroke-width="1.2"/>';
      for (var i2=0;i2<9;i2++){
        var bx = 24 + i2*6.4 + (i2>4?4:0);
        o += '<ellipse cx="'+n(bx)+'" cy="'+y+'" rx="2.8" ry="3.4" fill="'+(i2%2? b : dk(b,.2))+'"/>';
      }
    }
    return o;
  };

  C.taxonomycard = function(p){
    var pap = p.c1 || '#EFE5CA', o = '';
    o += '<path d="M14,24h72v54h-72Z" fill="'+pap+'" stroke="'+dk(pap,.34)+'" stroke-width=".8"/>';
    o += '<path d="M18,28h64v46h-64Z" fill="none" stroke="'+dk(pap,.24)+'" stroke-width=".6"/>';
    o += '<path d="M22,36h40" stroke="'+(p.c2||'#6B2F2A')+'" stroke-width="2.6"/>';
    o += '<path d="M22,44h50M22,50h44M22,56h50M22,62h30" stroke="'+dk(pap,.46)+'" stroke-width="1.2" opacity=".7"/>';
    o += '<circle cx="72" cy="62" r="8" fill="'+(p.c3||'#8E2F28')+'" opacity=".85"/>';
    o += '<path d="M68,60h8M68,64h8" stroke="'+dk(p.c3||'#8E2F28',.35)+'" stroke-width="1"/>';
    o += '<path d="M14,24l72,54" stroke="'+dk(pap,.1)+'" stroke-width=".4" opacity=".4"/>';
    return o;
  };

  C.pressflower = function(p){
    /* a herbarium sheet: paper + mounting tape + a sprig */
    var pap = p.c1 || '#F1E7CC', o = '';
    o += '<path d="M14,12h72v76h-72Z" fill="'+pap+'" stroke="'+dk(pap,.3)+'" stroke-width=".8"/>';
    o += '<path d="M50,80V34" stroke="'+(p.c2||'#7E7A4C')+'" stroke-width="1.6"/>';
    for (var i=0;i<4;i++){
      o += '<path d="M50,'+n(46+i*10)+'q-13,-5 -16,-12M50,'+n(50+i*10)+'q13,-5 16,-12" fill="none" stroke="'+(p.c2||'#7E7A4C')+'" stroke-width="1.2"/>';
    }
    o += '<circle cx="50" cy="30" r="7" fill="'+(p.c3||'#B08AA8')+'" opacity=".9"/>';
    o += '<circle cx="41" cy="36" r="5" fill="'+(p.c3||'#B08AA8')+'" opacity=".8"/>';
    o += '<circle cx="59" cy="36" r="5" fill="'+(p.c3||'#B08AA8')+'" opacity=".8"/>';
    ['20,20','66,20','20,72','66,72'].forEach(function(t2){
      var xy = t2.split(',');
      o += '<rect x="'+xy[0]+'" y="'+xy[1]+'" width="14" height="7" fill="#E4D9BD" opacity=".85" stroke="'+dk(pap,.2)+'" stroke-width=".4"/>';
    });
    o += '<rect x="52" y="72" width="30" height="12" fill="#FBF5E6" stroke="'+dk(pap,.3)+'" stroke-width=".5"/>';
    o += '<path d="M55,77h22M55,81h14" stroke="'+dk(pap,.5)+'" stroke-width=".9" opacity=".7"/>';
    return o;
  };

  C.marble = function(p){
    var c = p.c1 || '#5E7EA0', sw = p.c2 || '#EFE5CE', o = '', g = id();
    o = '<defs><radialGradient id="'+g+'" cx="34%" cy="28%" r="76%">' +
        '<stop offset="0%" stop-color="'+lt(c,.6)+'"/><stop offset="52%" stop-color="'+c+'"/><stop offset="100%" stop-color="'+dk(c,.42)+'"/></radialGradient>' +
        '<clipPath id="'+g+'c"><circle cx="50" cy="52" r="30"/></clipPath></defs>';
    o += '<circle cx="50" cy="52" r="30" fill="url(#'+g+')"/>';
    o += '<g clip-path="url(#'+g+'c)">';
    o += '<path d="M28,40q14,-14 28,2q14,16 4,30q-10,12 -22,2q-12,-10 -10,-34Z" fill="'+sw+'" opacity=".8"/>';
    o += '<path d="M34,46q10,-8 18,4q8,12 0,20" fill="none" stroke="'+(p.c3||dk(sw,.3))+'" stroke-width="3" opacity=".7"/>';
    o += '</g>';
    o += '<circle cx="50" cy="52" r="30" fill="none" stroke="'+dk(c,.4)+'" stroke-width=".7"/>';
    o += '<ellipse cx="40" cy="40" rx="8" ry="5" fill="#fff" opacity=".5" transform="rotate(-32 40 40)"/>';
    return o;
  };

  C.tuningfork = function(p){
    var m = p.c1 || '#A9A49A', o = '';
    o += '<path d="M46,72h8v18h-8Z" fill="'+m+'"/>';
    o += '<ellipse cx="50" cy="90" rx="8" ry="3" fill="'+dk(m,.2)+'"/>';
    o += '<path d="M40,72h20v6h-20Z" fill="'+dk(m,.1)+'"/>';
    o += '<path d="M38,72V22a5,5 0 0 1 10,0v50" fill="none" stroke="'+m+'" stroke-width="5" stroke-linecap="round"/>';
    o += '<path d="M52,72V22a5,5 0 0 1 10,0v50" fill="none" stroke="'+m+'" stroke-width="5" stroke-linecap="round"/>';
    o += '<path d="M40,66V24M54,66V24" stroke="'+lt(m,.42)+'" stroke-width="1.4" opacity=".7"/>';
    o += '<path d="M28,30q-4,-6 -2,-12M72,30q4,-6 2,-12" fill="none" stroke="'+dk(m,.1)+'" stroke-width="1.2" opacity=".55" stroke-linecap="round"/>';
    return o;
  };

  C.cameo = function(p){
    var bg = p.c1 || '#8B94A8', fig = p.c2 || '#F3EBDA', o = '';
    o += '<ellipse cx="50" cy="52" rx="28" ry="34" fill="'+(p.c3||BRASS)+'"/>';
    o += '<ellipse cx="50" cy="52" rx="24" ry="30" fill="'+bg+'"/>';
    o += '<path d="M40,74C36,58 40,40 52,36C64,32 68,46 62,56C58,62 56,68 56,74Z" fill="'+fig+'"/>';
    o += '<path d="M52,36c-8,2 -12,10 -10,18" fill="none" stroke="'+dk(fig,.18)+'" stroke-width="1.4"/>';
    o += '<circle cx="54" cy="46" r="1.6" fill="'+dk(fig,.3)+'"/>';
    o += '<path d="M58,40q6,-6 4,-10q-4,-4 -8,0" fill="'+fig+'" opacity=".9"/>';
    for (var i=0;i<20;i++){
      var a = i*18*Math.PI/180;
      o += '<circle cx="'+n(50+Math.cos(a)*26.5)+'" cy="'+n(52+Math.sin(a)*32.5)+'" r="1.5" fill="'+lt(p.c3||BRASS,.3)+'"/>';
    }
    return o;
  };

  C.mortar = function(p){
    var st = p.c1 || '#9E958A', o = '', g = id();
    o = '<defs>'+sheen(g, st, .3)+'</defs>';
    o += '<g transform="rotate(24 62 40)"><path d="M60,14h6v42h-6Z" fill="'+lt(st,.1)+'" stroke="'+dk(st,.34)+'" stroke-width=".5"/>' +
         '<ellipse cx="63" cy="58" rx="6" ry="5" fill="'+st+'" stroke="'+dk(st,.34)+'" stroke-width=".5"/></g>';
    o += '<path d="M28,50h44l-6,26a8,8 0 0 1 -8,6h-16a8,8 0 0 1 -8,-6Z" fill="url(#'+g+')" stroke="'+dk(st,.4)+'" stroke-width=".7"/>';
    o += '<ellipse cx="50" cy="50" rx="22" ry="7" fill="'+lt(st,.2)+'" stroke="'+dk(st,.36)+'" stroke-width=".6"/>';
    o += '<ellipse cx="50" cy="51" rx="17" ry="5" fill="'+dk(st,.3)+'" opacity=".7"/>';
    o += '<ellipse cx="50" cy="52" rx="10" ry="3" fill="'+(p.c2||'#8E7A4E')+'" opacity=".85"/>';
    return o;
  };

  C.pinbox = function(p){
    var w = p.c1 || '#5E4432', o = '';
    o += '<path d="M14,24h72v60h-72Z" fill="'+w+'" stroke="'+dk(w,.4)+'" stroke-width=".8"/>';
    o += '<path d="M20,30h60v48h-60Z" fill="'+(p.c2||'#7A5F52')+'"/>';
    var cols = ['#7E8C5A','#8E5F6E','#5E7A8C','#9A7A46','#6E5E86','#8E6A4A'];
    for (var r=0;r<3;r++){ for (var c2=0;c2<4;c2++){
      var cx = 27 + c2*15.4, cy = 40 + r*16;
      o += '<ellipse cx="'+n(cx)+'" cy="'+n(cy)+'" rx="5.4" ry="3.4" fill="'+cols[(r*4+c2)%6]+'" opacity=".9" transform="rotate('+n((r*4+c2)*23%60-30)+' '+n(cx)+' '+n(cy)+')"/>';
      o += '<circle cx="'+n(cx)+'" cy="'+n(cy)+'" r="1.5" fill="#D8CDB4"/>';
      o += '<circle cx="'+n(cx)+'" cy="'+n(cy)+'" r=".7" fill="#7B2D26"/>';
    }}
    o += '<path d="M14,24h72v6h-72Z" fill="'+lt(w,.14)+'"/>';
    o += '<circle cx="50" cy="27" r="1.8" fill="'+BRASS+'"/>';
    return o;
  };

  C.heartstone = function(p){
    var c = p.c1 || '#9C4756', o = '', g = id();
    o = '<defs>'+sheen(g, c, .48)+'</defs>';
    o += '<path d="M50,84C32,70 20,56 20,42C20,30 30,24 39,27C44,29 48,34 50,39C52,34 56,29 61,27C70,24 80,30 80,42C80,56 68,70 50,84Z" fill="url(#'+g+')" stroke="'+dk(c,.42)+'" stroke-width=".8"/>';
    o += '<path d="M50,84C40,74 30,62 27,50M50,39C52,34 56,29 61,27" fill="none" stroke="'+lt(c,.34)+'" stroke-width="1.2" opacity=".55"/>';
    o += '<path d="M36,36q8,-6 13,2q-6,10 -13,-2Z" fill="#fff" opacity=".34"/>';
    return o;
  };

  function curio(p, key){
    var fn = C[p.shape] || C.box;
    return wrap(fn(p, prng(seedOf(key || p.name || 'q'))));
  }

  /* ═══════════════════════════════════════════════════════════
     FURNITURE — icons, seals, backdrops
     ═══════════════════════════════════════════════════════════ */
  function gooseMark(c){
    c = c || '#E8D9B4';
    var v = hx2(c), lum = (v[0]*.299 + v[1]*.587 + v[2]*.114) / 255;
    var eye = lum > .5 ? '#241A12' : lt(c, .72);      /* the eye has to read either way */
    var wing = lum > .5 ? 'rgba(60,42,26,.35)' : 'rgba(255,244,224,.28)';
    return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<path d="M28,74C18,70 14,58 20,48C26,38 40,34 52,38C56,30 56,20 62,16C70,11 80,15 82,23C84,32 76,36 70,36C66,36 64,40 64,46C64,62 52,76 36,78C32,78 30,76 28,74Z" fill="'+c+'"/>' +
      '<path d="M80,20l10,3l-10,4Z" fill="#C9922E"/>' +
      '<circle cx="74" cy="22" r="2.4" fill="'+eye+'"/>' +
      '<path d="M30,66q14,6 26,-2" fill="none" stroke="'+wing+'" stroke-width="1.6"/>' +
      '<path d="M20,72q-8,4 -12,2q6,-1 10,-5Z" fill="'+c+'"/></svg>';
  }
  function sealMark(){
    return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<circle cx="50" cy="50" r="34" fill="#7B2D26"/>' +
      Array.from({length:16}).map(function(_,i){
        var a = i*22.5*Math.PI/180;
        return '<circle cx="'+n(50+Math.cos(a)*33)+'" cy="'+n(50+Math.sin(a)*33)+'" r="5.4" fill="#7B2D26"/>';
      }).join('') +
      '<circle cx="50" cy="50" r="26" fill="none" stroke="#5C1E19" stroke-width="1.4" opacity=".8"/>' +
      '<path d="M38,60C34,50 38,40 46,38C50,37 52,40 50,44C48,48 46,52 48,56C50,60 56,58 58,52C60,44 56,38 50,36" fill="none" stroke="#F0DCC4" stroke-width="2.4" stroke-linecap="round" opacity=".9"/>' +
      '<ellipse cx="40" cy="38" rx="9" ry="5" fill="#fff" opacity=".16" transform="rotate(-30 40 38)"/></svg>';
  }
  var ICONS = {
    register:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3h11l3 3v15H5z"/><path d="M8 9h8M8 13h8M8 17h5"/></svg>',
    cabinet :'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="3.5" width="17" height="17" rx="1"/><path d="M3.5 9h17M3.5 14.5h17M10 6.2h4M10 11.7h4M10 17.2h4"/></svg>',
    vitrine :'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 20V10a6 6 0 0 1 12 0v10z"/><path d="M4 20h16"/><circle cx="12" cy="13" r="2.2"/></svg>',
    ledger  :'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="4.5" width="17" height="16" rx="1"/><path d="M3.5 9h17M8.5 4.5v-2M15.5 4.5v-2M8 13h2M14 13h2M8 17h2M14 17h2"/></svg>',
    colophon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6.5C10 4.5 6.5 4 4 5v14c2.5-1 6-.5 8 1.5 2-2 5.5-2.5 8-1.5V5c-2.5-1-6-.5-8 1.5z"/><path d="M12 6.5v14"/></svg>',
    heart   :'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21C6 16.5 3 13 3 9.2 3 6.3 5.2 4.5 7.6 4.9 9.3 5.2 11 6.6 12 8.4c1-1.8 2.7-3.2 4.4-3.5C18.8 4.5 21 6.3 21 9.2 21 13 18 16.5 12 21z"/></svg>',
    tick    :'<svg viewBox="0 0 24 24"><path class="tick" d="M4 12.6l5.2 5.4L20 6.4"/></svg>'
  };

  var BACKDROPS = {
    felt:   function(){ return 'linear-gradient(168deg,#6A4038,#4A2C26 60%,#38201C)'; },
    velvet: function(){ return 'radial-gradient(ellipse at 30% 18%,#3E5060,#26333F 62%,#1A242C)'; },
    moss:   function(){ return 'linear-gradient(168deg,#5C6A48,#3E4A32 62%,#2C3524)'; },
    walnut: function(){ return 'repeating-linear-gradient(94deg,#4E382A 0 7px,#573F2F 7px 12px,#452F23 12px 19px)'; },
    ink:    function(){ return 'linear-gradient(168deg,#2E3140,#1E2029 60%,#14161C)'; },
    rose:   function(){ return 'linear-gradient(168deg,#7A5058,#573A40 60%,#3E282C)'; },
    parch:  function(){ return 'linear-gradient(168deg,#C9B590,#B39C74 60%,#9C8560)'; },
    bottle: function(){ return 'radial-gradient(ellipse at 34% 20%,#3E5A4A,#27392F 62%,#1A2721)'; }
  };

  return {
    flower:flower, lep:lep, fauna:fauna, mineral:mineral, curio:curio,
    goose:gooseMark, seal:sealMark, icon:function(k){ return ICONS[k]||''; },
    backdrop:function(k){ return (BACKDROPS[k]||BACKDROPS.felt)(); },
    backdrops:BACKDROPS,
    dk:dk, lt:lt, mix:mix, wrap:wrap
  };
})();
