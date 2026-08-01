/* ═══════════════════════════════════════════════════════════
   ACHIEVEMENTS — the plates
   Each is tested against a snapshot of the register. Grants may
   be a specific specimen, and may also unlock furniture for the
   Vitrine (backdrops, papers, inks).
   ═══════════════════════════════════════════════════════════ */
window.AN = window.AN || {};

AN.ACHIEVEMENTS = [

/* ── opening ─────────────────────────────────────────────── */
{id:'first-mark',name:'The First Mark',
 note:'A single tick in an empty register. Every collection in the world started exactly here.',
 test:function(s){ return s.totalChecks >= 1; }, grants:{curio:'cu20'}},

{id:'first-day',name:'The First Complete Day',
 note:'Six of six. The book is open and something has been written in it.',
 test:function(s){ return s.totalComplete >= 1; }, grants:{curio:'cu25'}},

{id:'lovebug',name:'The Lovebug',
 note:'Three whole days looked after. Somebody wanted you to have this one early, so that it would be here waiting before you had to work for anything.',
 tail:'Pinned here by your lovebug, who loves you very very very very very much.',
 test:function(s){ return s.totalComplete >= 3; }, grants:{fauna:'fa01'}, sound:'heart'},

{id:'the-keeper',name:'The Keeper of the Herbarium',
 note:'Twelve pressed specimens. That is a proper collection now, not an accident.',
 test:function(s){ return s.have.flora >= 12; }, grants:{curio:'cu39'}},

/* ── sequence ────────────────────────────────────────────── */
{id:'streak-3',name:'Three in Sequence',
 note:'Three consecutive days is the hardest stretch there is. After this the thing starts carrying some of its own weight.',
 test:function(s){ return s.streak >= 3; }, grants:{curio:'cu09'}},

{id:'streak-7',name:'A Full Week Observed',
 note:'Seven days without a gap. Long enough that it is no longer a good mood — it is a practice.',
 test:function(s){ return s.streak >= 7; }, grants:{curio:'cu03'}, unlock:{backdrop:'velvet'}},

{id:'streak-14',name:'A Fortnight',
 note:'Two weeks. The word comes from "fourteen nights" — the old measure was counted in darkness, not daylight.',
 test:function(s){ return s.streak >= 14; }, grants:{curio:'cu01'}, unlock:{paper:'vellum'}},

{id:'streak-21',name:'Three Weeks Kept',
 note:'The interval people quote for a habit forming. The real figure varies enormously, but three weeks of anything is worth a shelf.',
 test:function(s){ return s.streak >= 21; }, grants:{curio:'cu26'}},

{id:'streak-30',name:'A Month Unbroken',
 note:'Thirty days in sequence. There is no trick left to explain this one away.',
 test:function(s){ return s.streak >= 30; }, grants:{curio:'cu10'}, unlock:{paper:'foxed'}},

{id:'streak-60',name:'Two Months',
 note:'Sixty consecutive days. Whatever this was at the start, it is now simply how you live.',
 test:function(s){ return s.streak >= 60; }, grants:{curio:'cu06'}, unlock:{backdrop:'ink'}},

{id:'streak-100',name:'The Hundred',
 note:'One hundred days, one after another. Museums are built out of exactly this and nothing else.',
 test:function(s){ return s.streak >= 100; }, grants:{curio:'cu40'}, unlock:{paper:'night'}, sound:'fanfare'},

/* ── accumulation ────────────────────────────────────────── */
{id:'total-5',name:'Five Good Days',
 note:'They do not have to be consecutive to count. Five is five.',
 test:function(s){ return s.totalComplete >= 5; }, grants:{curio:'cu22'}},

{id:'total-10',name:'Ten Days Recorded',
 note:'Ten complete days on the register. The collection has outgrown its first drawer.',
 test:function(s){ return s.totalComplete >= 10; }, grants:{curio:'cu16'}, unlock:{accent:'sage'}},

{id:'total-25',name:'Five and Twenty',
 note:'Twenty-five days of looking after yourself, in whatever order they arrived.',
 test:function(s){ return s.totalComplete >= 25; }, grants:{curio:'cu13'}, unlock:{backdrop:'moss',paper:'slate'}},

{id:'total-50',name:'The Half Hundred',
 note:'Fifty. At this point the cabinet has more in it than most people manage in a lifetime of meaning to.',
 test:function(s){ return s.totalComplete >= 50; }, grants:{curio:'cu02'}, unlock:{paper:'marine',accent:'slate'}},

{id:'total-75',name:'Seventy-five Days',
 note:'Enough to navigate by. You now have a record long enough to tell you things about yourself.',
 test:function(s){ return s.totalComplete >= 75; }, grants:{curio:'cu04'}},

{id:'total-100',name:'One Hundred Days',
 note:'A hundred complete days. Not consecutive, not perfect — a hundred separate decisions to bother.',
 test:function(s){ return s.totalComplete >= 100; }, grants:{curio:'cu05'}, unlock:{backdrop:'bottle'}, sound:'fanfare'},

{id:'total-150',name:'The Long Series',
 note:'A hundred and fifty. Long enough that the early entries look like somebody else wrote them.',
 test:function(s){ return s.totalComplete >= 150; }, grants:{curio:'cu33'}, unlock:{accent:'violet'}},

{id:'total-200',name:'Two Hundred',
 note:'There is no word for this many days of quiet maintenance, which is a gap in the language rather than a gap in the achievement.',
 test:function(s){ return s.totalComplete >= 200; }, grants:{curio:'cu14'}, unlock:{backdrop:'rose'}},

{id:'total-365',name:'A Year of Observation',
 note:'Three hundred and sixty-five complete days. One full orbit, spent well.',
 test:function(s){ return s.totalComplete >= 365; }, grants:{curio:'cu08'}, unlock:{paper:'blush',accent:'ochre'}, sound:'fanfare'},

/* ── the six, individually ───────────────────────────────── */
{id:'water-25',name:'Two Litres, Twenty-five Times',
 note:'The body is about sixty per cent water and complains loudly about small deficits. You have answered it twenty-five times.',
 test:function(s){ return s.task.water >= 25; }, grants:{curio:'cu31'}},
{id:'water-75',name:'The Reservoir',
 note:'Seventy-five days properly watered. Every cell you have has been kept in solution on purpose.',
 test:function(s){ return s.task.water >= 75; }, grants:{curio:'cu17'}},

{id:'meal-25',name:'Twenty-five Meals Kept',
 note:'Eating is the least negotiable of the six and the first one to go when things are hard. Twenty-five times you did not let it.',
 test:function(s){ return s.task.meal >= 25; }, grants:{curio:'cu21'}},
{id:'meal-60',name:'The Standing Order',
 note:'Sixty days fed. Not a diet, not a plan — just the reliable delivery of fuel to a body that needs it.',
 test:function(s){ return s.task.meal >= 60; }, grants:{curio:'cu29'}},

{id:'walk-25',name:'Twenty-five Departures',
 note:'Twenty-five times you got out of the bed and put the day in motion. The first ten steps are the whole of it.',
 test:function(s){ return s.task.walk >= 25; }, grants:{curio:'cu42'}},
{id:'walk-60',name:'The Circuit',
 note:'Sixty walks. Roughly ten hours of moving through the world under your own power, in ten-minute instalments.',
 test:function(s){ return s.task.walk >= 60; }, grants:{curio:'cu30'}},

{id:'talk-25',name:'Twenty-five Correspondences',
 note:'Two people, twenty-five times. Reaching out is expensive when it is hard and it does not get cheaper by being avoided.',
 test:function(s){ return s.task.talk >= 25; }, grants:{curio:'cu24'}},
{id:'talk-60',name:'The Society',
 note:'Sixty days of speaking to somebody. Loneliness measurably shortens lives; you have been doing something about it.',
 test:function(s){ return s.task.talk >= 60; }, grants:{curio:'cu37'}},

{id:'sleep-25',name:'Twenty-five Nights',
 note:'Six hours is a floor, not a target. Twenty-five times you cleared it.',
 test:function(s){ return s.task.sleep >= 25; }, grants:{curio:'cu15'}},
{id:'sleep-60',name:'The Long Rest',
 note:'Sixty nights of real sleep. The brain washes itself out during deep sleep and cannot do it at any other time.',
 test:function(s){ return s.task.sleep >= 60; }, grants:{curio:'cu38'}},

{id:'kind-25',name:'Twenty-five Kindnesses',
 note:'Twenty-five things done for no reason except that you wanted them. This is the one people skip. You did not.',
 test:function(s){ return s.task.kind >= 25; }, grants:{curio:'cu44'}},
{id:'kind-60',name:'The Standing Indulgence',
 note:'Sixty days on which you were treated as somebody worth spending an afternoon on — by you.',
 test:function(s){ return s.task.kind >= 60; }, grants:{curio:'cu35'}},

/* ── the collection itself ───────────────────────────────── */
{id:'coll-25',name:'Twenty-five Specimens',
 note:'A cabinet stops being a shelf at about this point and starts being a collection.',
 test:function(s){ return s.have.total >= 25; }, grants:{curio:'cu19'}},
{id:'coll-50',name:'Fifty Specimens',
 note:'Fifty catalogued and labelled. The drawers are beginning to have their own character.',
 test:function(s){ return s.have.total >= 50; }, grants:{curio:'cu12'}, unlock:{backdrop:'walnut'}},
{id:'coll-100',name:'One Hundred Specimens',
 note:'A hundred things in the cabinet, each of which required a day of you looking after yourself to get here.',
 test:function(s){ return s.have.total >= 100; }, grants:{curio:'cu34'}, unlock:{backdrop:'parch'}, sound:'fanfare'},
{id:'min-20',name:'Twenty Stones',
 note:'Twenty minerals, every one of them earned on a day that did not go perfectly. These are the specimens that prove partial credit is credit.',
 test:function(s){ return s.have.min >= 20; }, grants:{curio:'cu18'}},

{id:'goose',name:'Anser',
 note:'A goose has entered the cabinet, which is what it was built for. There are six in total and they are all somewhere in here.',
 test:function(s){ return s.geese >= 1; }, grants:{curio:'cu23'}, unlock:{accent:'brass'}, sound:'goose'},
{id:'all-geese',name:'The Whole Skein',
 note:'All six geese. A group of them on the ground is a gaggle; in the air it is a skein, a wedge, or — best of the lot — a plump.',
 test:function(s){ return s.geese >= 6; }, grants:{curio:'cu11'}, sound:'goose'},

/* ── behaviour ───────────────────────────────────────────── */
{id:'perfect-week',name:'A Clean Week',
 note:'Seven complete days inside one calendar week, Monday to Sunday, with nothing left ticking over.',
 test:function(s){ return s.flags.perfectWeek; }, grants:{curio:'cu36'}},

{id:'dawn',name:'The Early Observation',
 note:'Something recorded before seven in the morning. Cortisol peaks about half an hour after waking, which is genuinely the easiest window of the day to start in.',
 test:function(s){ return s.flags.dawn; }, grants:{curio:'cu27'}},

{id:'night-owl',name:'The Late Observation',
 note:'Something recorded after midnight. Roughly one person in three is genuinely wired to run late, and it is not a character flaw.',
 test:function(s){ return s.flags.night; }, grants:{curio:'cu07'}},

{id:'rest',name:'Sabbath',
 note:'A rest seal spent deliberately. Choosing to stop is a different act from failing to continue, and the register records it differently too.',
 test:function(s){ return s.restUsed >= 1; }, grants:{curio:'cu28'}},

{id:'return',name:'The Return',
 note:'Back after time away, with nothing lost. Nobody is keeping score against you here — the drawers were simply waiting.',
 tail:'Every worn coin in every collection got that way by being used and put down and picked up again.',
 test:function(s){ return s.flags.returned; }, grants:{curio:'cu41'}},

{id:'mend',name:'The Mend',
 note:'A complete day immediately after a missed one. This is the single most useful thing in the whole book — not the streak, the recovery.',
 test:function(s){ return s.flags.mended; }, grants:{curio:'cu32'}},

{id:'noted',name:'The Commonplace',
 note:'Ten days on which you wrote down what you did for yourself. The writing down is what turns it from a moment into a record.',
 test:function(s){ return s.notes >= 10; }, grants:{curio:'cu43'}}
];
