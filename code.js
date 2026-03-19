// ===== VIDEO URLS =====
var FINGER_VIDEO_SRC       = ‘https://res.cloudinary.com/ddgaysorz/video/upload/finger-method_wpf128.mp4’;
var RICE_POT_VIDEO_SRC     = ‘’;
var BOILING_POT_VIDEO_SRC  = ‘https://res.cloudinary.com/ddgaysorz/video/upload/boiling-pot_n7a92u.mp4’;

// ===== STATE =====
const state = {
hunger: null,
rice: null,
method: null,
cooker: null,
water: null,
currentStep: 0,
timerInterval: null,
timerSeconds: 0,
timerRunning: false,
};

// ===== STEPS DATA =====
function getSteps() {
// Embedded videos

const isPot = state.method === ‘pot’;
const isBasmati = state.rice === ‘basmati’;

const hungerMap = { ‘just-me’: ‘1 katori’, ‘me-plus’: ‘1.5 katori’, ‘meal-prep’: ‘2.5 katori’ };
const riceAmt = hungerMap[state.hunger] || ‘1 katori’;

const waterRatioPot = isBasmati ? ‘2’ : ‘1.75’;
const waterRatioCooker = isBasmati ? ‘1.25’ : ‘1.5’;
const waterRatio = isPot ? waterRatioPot : waterRatioCooker;

const whistles = state.cooker === ‘small’ ? ‘2 whistles’ : ‘3 whistles’;

if (isPot) {
return [
{
title: ‘Wash & Add Rice’,
flame: null,
showPot: false,
desc: `Take ${riceAmt} of rice. Rinse ${isBasmati ? '2 times' : '3 times'} until water is clearer. Add to your pot.\n\nAdd water — ${riceAmt} rice → ${waterRatio} katori water.`,
warning: null,
timer: 0,
},
{
title: ‘High Flame — Bring to Boil’,
flame: ‘high’,
showPot: true,
desc: ‘Place pot on your front burner. Turn to HIGH flame. Wait until you see big bubbles forming at the surface.’,
warning: ‘Keep the lid OFF at this stage — you need to watch it!’,
timer: 8 * 60,
},
{
title: ‘Low Flame — Cover & Simmer’,
flame: ‘low’,
showPot: true,
desc: ‘The moment you see strong bubbling — reduce to LOWEST flame. Put the lid on. Walk away.’,
warning: ‘DO NOT lift the lid. DO NOT stir. The steam is cooking it now. 🙏’,
timer: 12 * 60,
},
{
title: ‘Flame Off — Rest’,
flame: null,
showPot: true,
desc: ‘Turn off the flame completely. Keep lid on. Let it rest for 5 minutes.’,
warning: ‘Skipping this = mushy top, dry bottom. 5 mins. You can do it.’,
timer: 5 * 60,
},
];
} else {
// Pressure cooker
return [
{
title: ‘Wash & Add Rice’,
flame: null,
showPot: false,
desc: `Take ${riceAmt} of rice. Rinse ${isBasmati ? '2 times' : '3 times'} until water is clearer. Add to your cooker.\n\nAdd water — ${riceAmt} rice → ${waterRatio} katori water. Less than open pot — that's correct!`,
warning: null,
timer: 0,
},
{
title: ‘High Flame — Seal Cooker’,
flame: ‘high’,
showPot: true,
desc: `Put the lid on the pressure cooker. Lock it properly. Place on front burner, HIGH flame.`,
warning: ‘Make sure the rubber gasket/ring is in place before closing!’,
timer: 0,
},
{
title: `Wait for ${whistles}`,
flame: ‘mid’,
showPot: true,
desc: `Keep on medium flame. Count ${whistles}. After the last whistle — turn flame OFF immediately.`,
warning: `${whistles} for your cooker size. Don't go by what mom said — her cooker might be different.`,
timer: (state.cooker === ‘small’ ? 6 : 8) * 60,
},
{
title: ‘Wait for Pressure to Drop’,
flame: null,
showPot: true,
desc: ‘Do NOT open the cooker yet. Let pressure drop naturally — you'll hear it click or the weight will drop. Takes about 5–8 minutes.’,
warning: ‘Never force open a pressure cooker. Let it release on its own.’,
timer: 6 * 60,
},
];
}
}

// ===== STOVE + POT VISUALIZER (real photos) =====
function renderStove(flame, showLid) {
const el = document.getElementById(‘pot-visual’);
const isPressure = state.method === ‘cooker’;
const hasFlame = !!flame;

// Real photo URLs
const PC_IMG       = ‘https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Pressure_cooker_-*Hawkins%2C_Contura_Model*-*3_litres*-*4.jpg/480px-Pressure_cooker*-*Hawkins%2C_Contura_Model*-*3_litres*-_4.jpg’;
const POT_LID_IMG  = ‘https://images.unsplash.com/photo-1547592166-23ac45744acd?w=560&auto=format&fit=crop&q=80’;

// Flame border colour
var borderColor = ‘#E5E7EB’;
var glowColor   = ‘transparent’;
if (flame === ‘high’) { borderColor = ‘#EF4444’; glowColor = ‘rgba(239,68,68,0.18)’; }
if (flame === ‘mid’)  { borderColor = ‘#F97316’; glowColor = ‘rgba(249,115,22,0.15)’; }
if (flame === ‘low’)  { borderColor = ‘#3B82F6’; glowColor = ‘rgba(59,130,246,0.12)’; }

// Steam CSS
var steamCSS = ‘’;
if (hasFlame) {
steamCSS = ‘@keyframes steamRise{0%{opacity:0;transform:translateY(0) scaleX(1)}40%{opacity:0.7}100%{opacity:0;transform:translateY(-28px) scaleX(1.3)}}’ +
‘.steam-wisp{animation:steamRise 2.2s ease-in-out infinite}’ +
‘.steam-wisp:nth-child(2){animation-delay:0.7s}’ +
‘.steam-wisp:nth-child(3){animation-delay:1.4s}’;
}

// Steam overlay HTML
var steamHTML = ‘’;
if (hasFlame) {
steamHTML = ‘<div style="position:absolute;top:10px;left:50%;transform:translateX(-50%);pointer-events:none;">’ +
‘<svg width="80" height="40" viewBox="0 0 80 40" style="overflow:visible;">’ +
‘<ellipse class="steam-wisp" cx="20" cy="30" rx="8" ry="5" fill="#CBD5E1" opacity="0"/>’ +
‘<ellipse class="steam-wisp" cx="40" cy="28" rx="10" ry="6" fill="#E2E8F0" opacity="0"/>’ +
‘<ellipse class="steam-wisp" cx="60" cy="32" rx="7" ry="4" fill="#CBD5E1" opacity="0"/>’ +
‘</svg></div>’;
}

// Build media element
var mediaHTML = ‘’;
var isVideo = false;
var caption = ‘’;

if (isPressure) {
caption = hasFlame ? ‘Pressure cooker on gas stove’ : ‘Pressure cooker — lid locked’;
mediaHTML = ‘<img src=”’ + PC_IMG + ‘” referrerpolicy=“no-referrer”’ +
’ alt=”’ + caption + ‘”’ +
’ onerror=“this.style.display='none'”’ +
’ style=“width:280px;height:200px;object-fit:cover;display:block;”/>’;
} else if (showLid) {
caption = ‘Lid on — simmering on low flame’;
mediaHTML = ‘<img src=”’ + POT_LID_IMG + ‘” referrerpolicy=“no-referrer”’ +
’ alt=”’ + caption + ‘”’ +
’ onerror=“this.style.display='none'”’ +
’ style=“width:280px;height:200px;object-fit:cover;display:block;”/>’;
} else {
caption = ‘High flame — watch for bubbles’;
isVideo = true;
mediaHTML = ‘<iframe src=“https://player.cloudinary.com/embed/?cloud_name=ddgaysorz&public_id=boiling-pot_n7a92u&autoplay=true&loop=true&muted=true&controls=false”’ +
’ style=“width:280px;height:200px;border:none;display:block;”’ +
’ allow=“autoplay; fullscreen” allowfullscreen></iframe>’;
isVideo = false; // iframe handles itself, no need to call .load()
}

// Caption bar
var captionHTML = ‘<div style="position:absolute;bottom:0;left:0;right:0;' +
'background:linear-gradient(transparent,rgba(0,0,0,0.65));' +
'padding:18px 12px 10px;font-family:Nunito,sans-serif;font-size:12px;' +
'font-weight:700;color:white;text-align:left;">’ + caption + ‘</div>’;

// Assemble
el.innerHTML = ‘<style>’ + steamCSS + ‘</style>’ +
‘<div style="position:relative;display:inline-block;border-radius:20px;overflow:hidden;' +
'border:3px solid ' + borderColor + ';' +
'box-shadow:0 0 24px ' + glowColor + ',0 4px 16px rgba(0,0,0,0.12);' +
'transition:border-color 0.4s,box-shadow 0.4s;width:280px;">’ +
mediaHTML + steamHTML + captionHTML + ‘</div>’;

// For injected video elements — set src and trigger play
if (isVideo) {
var vid = el.querySelector(’#stove-vid’);
if (vid) {
vid.src = BOILING_POT_VIDEO_SRC;
vid.load();
vid.play().catch(function(){});
}
}
}

// ===== FLAME BADGE (label only — visual is in renderStove) =====
function getFallbackStove(type, flame, lidOn) {
// Clean CSS fallback if images fail to load
const isPressure = type === ‘cooker’;
const flameEmoji = flame === ‘high’ ? ‘🔥🔥🔥’ : flame === ‘mid’ ? ‘🔥🔥’ : flame === ‘low’ ? ‘🔥’ : ‘’;
const potEmoji = isPressure ? ‘🥘’ : (lidOn === ‘true’ ? ‘🫕’ : ‘🍲’);
return `<div style="width:280px;height:200px;background:linear-gradient(135deg,#1a1a1a,#2d2d2d);
border-radius:17px;display:flex;flex-direction:column;align-items:center;
justify-content:center;gap:8px;">
<div style="font-size:72px;line-height:1;">${potEmoji}</div>
<div style="font-size:24px;">${flameEmoji}</div>
<div style="font-family:Nunito,sans-serif;font-size:12px;color:#94A3B8;font-weight:700;">
${isPressure ? ‘Pressure Cooker’ : ‘Open Pot’}
</div>

  </div>`;
}

function renderFlame(level) {
const badge = document.getElementById(‘flame-badge’);
if (!level) { badge.innerHTML = ‘’; return; }
const map = {
low:  { cls: ‘flame-low’,  label: ‘🔵 LOW FLAME’ },
mid:  { cls: ‘flame-mid’,  label: ‘🟠 MEDIUM FLAME’ },
high: { cls: ‘flame-high’, label: ‘🔴 HIGH FLAME’ },
};
const m = map[level];
badge.innerHTML = `<span class="flame-label ${m.cls}" style="display:inline-block;padding:6px 20px;border-radius:20px;font-family:'Fredoka One',cursive;font-size:18px;letter-spacing:1px;">${m.label}</span>`;
}

// ===== STEP RENDERING =====
function renderStep() {
const steps = getSteps();
const step = steps[state.currentStep];
const total = steps.length;

document.getElementById(‘step-number’).textContent = `STEP ${state.currentStep + 1} OF ${total}`;
document.getElementById(‘step-title’).textContent = step.title;
document.getElementById(‘step-desc’).textContent = step.desc;

const warn = document.getElementById(‘step-warning’);
if (step.warning) {
warn.style.display = ‘flex’;
document.getElementById(‘step-warning-text’).textContent = step.warning;
} else {
warn.style.display = ‘none’;
}

// Flame
renderFlame(step.flame);

// Pot + stove
const potEl = document.getElementById(‘pot-visual’);
if (step.showPot) {
potEl.style.display = ‘block’;
// Lid is ON for low flame / rest steps (simmering), OFF for high flame (boiling)
const lidOn = step.flame === ‘low’ || (!step.flame && state.currentStep > 0);
renderStove(step.flame, lidOn);
} else {
potEl.style.display = ‘none’;
}

// Timer
const timerCard = document.getElementById(‘timer-card’);
if (step.timer > 0) {
timerCard.style.display = ‘block’;
state.timerSeconds = step.timer;
state.timerRunning = false;
if (state.timerInterval) { clearInterval(state.timerInterval); state.timerInterval = null; }
updateTimerDisplay();
document.getElementById(‘timer-toggle’).textContent = ‘▶ Start’;
} else {
timerCard.style.display = ‘none’;
}

// Next button
const nextBtn = document.getElementById(‘next-step-btn’);
if (state.currentStep === total - 1) {
nextBtn.textContent = ‘🍚 Rice is Ready!’;
} else {
nextBtn.textContent = ‘Next Step →’;
}

// Update progress
updateProgress(4);

// Trigger ambient sounds for this step
handleStepSounds(step);
}

function nextStep() {
const steps = getSteps();
if (state.currentStep < steps.length - 1) {
state.currentStep++;
if (state.timerInterval) { clearInterval(state.timerInterval); state.timerInterval = null; }
state.timerRunning = false;
renderStep();
} else {
goTo(5);
}
}

// ===== TIMER =====
function toggleTimer() {
if (state.timerRunning) {
clearInterval(state.timerInterval);
state.timerRunning = false;
document.getElementById(‘timer-toggle’).textContent = ‘▶ Resume’;
} else {
state.timerRunning = true;
document.getElementById(‘timer-toggle’).textContent = ‘⏸ Pause’;
state.timerInterval = setInterval(() => {
state.timerSeconds–;
updateTimerDisplay();
if (state.timerSeconds <= 0) {
clearInterval(state.timerInterval);
state.timerRunning = false;
stopAmbientSounds();
document.getElementById(‘timer-toggle’).textContent = ‘✓ Done!’;
document.getElementById(‘timer-display’).style.color = ‘var(–green)’;
document.getElementById(‘timer-display’).textContent = ‘00:00’;
// Play whistle for pressure cooker whistle step, else beep
const steps = getSteps();
const step = steps[state.currentStep];
if (state.method === ‘cooker’ && step.title && step.title.includes(‘whistle’)) {
const count = state.cooker === ‘small’ ? 2 : 3;
playWhistle(count);
} else {
playTimerBeep();
}
}
}, 1000);
}
}

function resetTimer() {
const steps = getSteps();
const step = steps[state.currentStep];
clearInterval(state.timerInterval);
state.timerInterval = null;
state.timerRunning = false;
state.timerSeconds = step.timer;
updateTimerDisplay();
document.getElementById(‘timer-toggle’).textContent = ‘▶ Start’;
document.getElementById(‘timer-display’).style.color = ‘var(–orange)’;
}

function updateTimerDisplay() {
const m = Math.floor(state.timerSeconds / 60).toString().padStart(2, ‘0’);
const s = (state.timerSeconds % 60).toString().padStart(2, ‘0’);
document.getElementById(‘timer-display’).textContent = `${m}:${s}`;
}

// ===== WATER METHOD =====
function selectWater(method) {
state.water = method;
document.getElementById(‘water-finger’).classList.toggle(‘selected’, method === ‘finger’);
document.getElementById(‘water-katori’).classList.toggle(‘selected’, method === ‘katori’);

// Embedded videos

const isPot = state.method === ‘pot’;
const isBasmati = state.rice === ‘basmati’;
const waterRatioPot = isBasmati ? ‘2’ : ‘1.75’;
const waterRatioCooker = isBasmati ? ‘1.25’ : ‘1.5’;
const ratio = isPot ? waterRatioPot : waterRatioCooker;

const instEl = document.getElementById(‘water-instruction’);
const titleEl = document.getElementById(‘water-inst-title’);
const bodyEl = document.getElementById(‘water-inst-body’);
const whyEl = document.getElementById(‘water-inst-why’);
instEl.style.display = ‘block’;

if (method === ‘finger’) {
titleEl.textContent = ‘👆 Finger Method’;
bodyEl.textContent = `Place your finger on top of the levelled rice. Fill water until it reaches your first knuckle joint — roughly 1 inch above the rice. ${isPot ? '' : 'For pressure cooker: go just below the knuckle — slightly less water.'}`;
whyEl.textContent = `Why it sometimes doesn't work: Mom's pot is narrower than yours. In wider pots, 1 knuckle = more water than needed. If your pot is wide, add just a splash less.`;
} else {
titleEl.textContent = ‘🥛 Katori Method’;
bodyEl.textContent = `Whatever katori/glass you used for rice — use that SAME katori for water. Rice : Water = 1 : ${ratio}. So if you took 1 katori rice, add ${ratio} katori water.`;
whyEl.textContent = `This works because it's unit-agnostic — doesn't matter if you used a big or small katori, as long as it's the same one for both.`;
}

// Rinse tip
const rinseEl = document.getElementById(‘rinse-tip’);
const rinseBody = document.getElementById(‘rinse-body’);
rinseEl.style.display = ‘block’;
if (isBasmati) {
rinseBody.innerHTML = `Rinse 2 times until water is clearer. Skipping = stickier rice. <span class="rinse-badge rinse-skip">Optional but recommended</span>`;
} else {
rinseBody.innerHTML = `Rinse 3 times — Sona Masoori gets starchy fast. <span class="rinse-badge rinse-yes">Don't skip this one</span>`;
}

document.getElementById(‘next3’).disabled = false;

// Show the right video, hide the other
const fingerWrap = document.getElementById(‘finger-video-wrap’);
const katoriWrap = document.getElementById(‘katori-video-wrap’);
const fingerVid  = document.getElementById(‘finger-video’);
const katoriVid  = document.getElementById(‘katori-video’);

if (method === ‘finger’) {
fingerWrap.style.display = ‘block’;
katoriWrap.style.display = ‘none’;
} else {
katoriWrap.style.display = ‘block’;
fingerWrap.style.display = ‘none’;
}
}

// ===== SOUND ENGINE =====
let audioCtx = null;
let isMuted = false;
let sizzleSource = null;
let bubbleSource = null;
let sizzleGain = null;
let bubbleGain = null;

function getAudioCtx() {
if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
return audioCtx;
}

function toggleMute() {
isMuted = !isMuted;
document.getElementById(‘mute-btn’).textContent = isMuted ? ‘🔇’ : ‘🔊’;
document.getElementById(‘mute-btn’).style.borderColor = isMuted ? ‘#EF4444’ : ‘var(–border)’;
if (isMuted) stopAmbientSounds();
}

// — Pressure cooker whistle —
function playWhistle(count) {
if (isMuted) return;
const ctx = getAudioCtx();
let delay = 0;
for (let i = 0; i < count; i++) {
(function(d) {
setTimeout(() => {
const osc1 = ctx.createOscillator();
const osc2 = ctx.createOscillator();
const gainNode = ctx.createGain();
const distortion = ctx.createWaveShaper();
const curve = new Float32Array(256);
for (let j = 0; j < 256; j++) {
const x = (j * 2) / 256 - 1;
curve[j] = (Math.PI + 200) * x / (Math.PI + 200 * Math.abs(x));
}
distortion.curve = curve;
osc1.type = ‘sawtooth’;
osc1.frequency.setValueAtTime(880, ctx.currentTime);
osc1.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05);
osc1.frequency.exponentialRampToValueAtTime(950, ctx.currentTime + 0.4);
osc1.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.8);
osc2.type = ‘sine’;
osc2.frequency.setValueAtTime(1760, ctx.currentTime);
osc2.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.8);
gainNode.gain.setValueAtTime(0, ctx.currentTime);
gainNode.gain.linearRampToValueAtTime(0.55, ctx.currentTime + 0.03);
gainNode.gain.setValueAtTime(0.45, ctx.currentTime + 0.5);
gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);
osc1.connect(distortion); osc2.connect(distortion);
distortion.connect(gainNode); gainNode.connect(ctx.destination);
osc1.start(ctx.currentTime); osc2.start(ctx.currentTime);
osc1.stop(ctx.currentTime + 0.95); osc2.stop(ctx.currentTime + 0.95);
}, d);
})(delay);
delay += 1300;
}
}

// — Timer done beep —
function playTimerBeep() {
if (isMuted) return;
const ctx = getAudioCtx();
[0, 180, 360, 700].forEach((offset, i) => {
setTimeout(() => {
const osc = ctx.createOscillator();
const gain = ctx.createGain();
osc.type = ‘sine’;
osc.frequency.value = i === 3 ? 880 : 660;
gain.gain.setValueAtTime(0, ctx.currentTime);
gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.01);
gain.gain.setValueAtTime(0.35, ctx.currentTime + 0.08);
gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
osc.connect(gain); gain.connect(ctx.destination);
osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.2);
}, offset);
});
}

// — Sizzle (high-freq noise loop for high flame) —
function startSizzle() {
if (isMuted) return;
stopSizzle();
const ctx = getAudioCtx();
const bufferSize = ctx.sampleRate * 3;
const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
const data = buffer.getChannelData(0);
for (let i = 0; i < bufferSize; i++) {
data[i] = (Math.random() * 2 - 1) * (i % 3 === 0 ? 1 : 0.3);
}
sizzleSource = ctx.createBufferSource();
sizzleSource.buffer = buffer;
sizzleSource.loop = true;
const hp = ctx.createBiquadFilter(); hp.type = ‘highpass’; hp.frequency.value = 3000;
const lp = ctx.createBiquadFilter(); lp.type = ‘lowpass’; lp.frequency.value = 8000;
sizzleGain = ctx.createGain();
sizzleGain.gain.setValueAtTime(0, ctx.currentTime);
sizzleGain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 1.2);
sizzleSource.connect(hp); hp.connect(lp); lp.connect(sizzleGain); sizzleGain.connect(ctx.destination);
sizzleSource.start();
}

function stopSizzle() {
if (sizzleSource) {
try {
if (sizzleGain) {
const ctx = getAudioCtx();
sizzleGain.gain.setValueAtTime(sizzleGain.gain.value, ctx.currentTime);
sizzleGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
}
setTimeout(() => { try { sizzleSource.stop(); } catch(e){} sizzleSource = null; }, 600);
} catch(e) { sizzleSource = null; }
}
}

// — Bubble sound (procedural plops for boiling) —
function startBubbles() {
if (isMuted) return;
stopBubbles();
const ctx = getAudioCtx();
bubbleGain = ctx.createGain();
bubbleGain.gain.setValueAtTime(0, ctx.currentTime);
bubbleGain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 1.5);
bubbleGain.connect(ctx.destination);

function scheduleBubble() {
if (!bubbleGain) return;
try {
const now = ctx.currentTime;
const osc = ctx.createOscillator();
const g = ctx.createGain();
const freq = 100 + Math.random() * 220;
osc.frequency.setValueAtTime(freq, now);
osc.frequency.exponentialRampToValueAtTime(freq * 2.0, now + 0.03);
osc.frequency.exponentialRampToValueAtTime(freq * 0.4, now + 0.12);
osc.type = ‘sine’;
g.gain.setValueAtTime(0, now);
g.gain.linearRampToValueAtTime(0.5 + Math.random() * 0.35, now + 0.012);
g.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
osc.connect(g); g.connect(bubbleGain);
osc.start(now); osc.stop(now + 0.15);
} catch(e) {}
const next = 80 + Math.random() * 260;
bubbleSource = setTimeout(scheduleBubble, next);
}
bubbleSource = setTimeout(scheduleBubble, 500);
}

function stopBubbles() {
if (bubbleSource) { clearTimeout(bubbleSource); bubbleSource = null; }
if (bubbleGain) {
try {
const ctx = getAudioCtx();
bubbleGain.gain.setValueAtTime(bubbleGain.gain.value, ctx.currentTime);
bubbleGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
setTimeout(() => { bubbleGain = null; }, 900);
} catch(e) { bubbleGain = null; }
}
}

function stopAmbientSounds() { stopSizzle(); stopBubbles(); }

function handleStepSounds(step) {
stopAmbientSounds();
if (isMuted) return;
if (step.flame === ‘high’) setTimeout(() => startSizzle(), 400);
if (step.flame === ‘high’ && step.showPot) setTimeout(() => startBubbles(), 5000);
if (step.flame === ‘low’ && step.showPot) setTimeout(() => startBubbles(), 600);
}

// ===== OPTION SELECTION =====
function selectOption(type, value, el) {
state[type] = value;

// Deselect siblings
const parent = el.parentElement;
parent.querySelectorAll(’.option-btn, .option-card, .rice-card’).forEach(b => b.classList.remove(‘selected’));
el.classList.add(‘selected’);

// Show cooker size if pressure cooker
if (type === ‘method’) {
document.getElementById(‘cooker-size-wrap’).style.display = value === ‘cooker’ ? ‘block’ : ‘none’;
if (value === ‘pot’) {
state.cooker = ‘medium’;
document.getElementById(‘next2’).disabled = false;
} else {
document.getElementById(‘next2’).disabled = true;
}
}

if (type === ‘cooker’) {
document.getElementById(‘next2’).disabled = false;
}

if (type === ‘hunger’) document.getElementById(‘next0’).disabled = false;
if (type === ‘rice’) document.getElementById(‘next1’).disabled = false;
}

// ===== NAVIGATION =====
function goTo(screen) {
document.querySelectorAll(’.screen’).forEach(s => s.classList.remove(‘active’));
document.getElementById(`screen${screen}`).classList.add(‘active’);

if (screen === 4) {
state.currentStep = 0;
buildSummaryBar();
renderStep();
}

if (screen === 5) {
stopAmbientSounds();
renderSuccess();
}

updateProgress(screen);
window.scrollTo(0, 0);
}

function updateProgress(current) {
for (let i = 0; i < 6; i++) {
const dot = document.getElementById(`dot${i}`);
dot.className = ‘progress-dot’;
if (i < current) dot.classList.add(‘done’);
else if (i === current) dot.classList.add(‘active’);
}
}

function buildSummaryBar() {
const hungerEmoji = { ‘just-me’: ‘🍚’, ‘me-plus’: ‘🍚🍚’, ‘meal-prep’: ‘🍚🍚🍚’ };
const riceLabel = state.rice === ‘basmati’ ? ‘Basmati’ : ‘Sona Masoori’;
const methodLabel = state.method === ‘pot’ ? ‘Open Pot’ : ‘Pressure Cooker’;

document.getElementById(‘summary-bar’).innerHTML = `<div class="summary-item"><span>${hungerEmoji[state.hunger]}</span><span>${state.hunger === 'just-me' ? '1 katori' : state.hunger === 'me-plus' ? '1.5 katori' : '2.5 katori'}</span></div> <div class="summary-item"><span>🌾</span><span>${riceLabel}</span></div> <div class="summary-item"><span>${state.method === 'pot' ? '🫕' : '🥘'}</span><span>${methodLabel}</span></div>`;
}

function renderSuccess() {
const tips = {
basmati: ‘Soak basmati for 20 mins before cooking next time — the grains will be even longer and fluffier.’,
sona: ‘Try adding a tiny pinch of salt to the water next time. Makes Sona Masoori taste noticeably better.’,
};
document.getElementById(‘tip-text’).textContent = tips[state.rice] || tips.sona;
}

function restart() {
state.hunger = null; state.rice = null; state.method = null;
state.cooker = null; state.water = null; state.currentStep = 0;
if (state.timerInterval) clearInterval(state.timerInterval);
state.timerInterval = null; state.timerRunning = false;
stopAmbientSounds();

document.querySelectorAll(’.option-btn, .option-card, .rice-card, .water-method-card’).forEach(b => b.classList.remove(‘selected’));
document.getElementById(‘next0’).disabled = true;
document.getElementById(‘next1’).disabled = true;
document.getElementById(‘next2’).disabled = true;
document.getElementById(‘next3’).disabled = true;
document.getElementById(‘water-instruction’).style.display = ‘none’;
document.getElementById(‘finger-video-wrap’).style.display = ‘none’;
document.getElementById(‘katori-video-wrap’).style.display = ‘none’;
const fv = document.getElementById(‘finger-video’);
const kv = document.getElementById(‘katori-video’);
fv.src = ‘’; delete fv.dataset.loaded;
kv.src = ‘’; delete kv.dataset.loaded;
document.getElementById(‘rinse-tip’).style.display = ‘none’;
document.getElementById(‘cooker-size-wrap’).style.display = ‘none’;

goTo(0);
}
