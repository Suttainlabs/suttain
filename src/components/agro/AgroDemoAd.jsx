import React from 'react';

const AD_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Suttain Farm — 30s Ad</title>
<script src="https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.js"><\/script>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;600;700&family=JetBrains+Mono:wght@400;600&display=swap');

  :root{
    --sky-top:#FFD98A; --sky-bot:#FFF3DC;
    --soil-dark:#4A2F18; --soil:#6B4423;
    --crop-dark:#3E5E33; --crop:#57843E; --crop-light:#7FA65C;
    --rust:#B5502E; --paper:#F6EFDD; --amber:#E0A526;
    --danger:#D64545; --ok:#5FD37A; --scarf:#4C6E9C; --scarf-dark:#3A5478;
  }
  html,body{ margin:0;padding:0;width:100%;height:100%;background:#12140F;overflow:hidden;font-family:'Inter',sans-serif; }
  .stage{ position:relative;width:100vw;height:100vh;background:#12140F; }
  svg{ width:100%;height:100%;display:block; }

  #camera{ transform-origin:600px 560px; transition: transform 1.4s ease-in-out; transform:scale(1) translate(0,0); }
  #camera.zoom-farmer{ transform:scale(2.3) translate(-4px,-6px); }
  #camera.zoom-phone{ transform:scale(4.2) translate(-2px,-4px); }
  #camera.zoom-out{ transform:scale(1) translate(0,0); }

  .scene{ opacity:0; transition:opacity .7s ease; pointer-events:none; }
  .scene.active{ opacity:1; }

  #sunGlow{ animation:glow 5s ease-in-out infinite; transform-origin:1350px 150px; }
  @keyframes glow{ 0%,100%{opacity:.55;transform:scale(1);} 50%{opacity:.85;transform:scale(1.12);} }

  .crop-tuft{ animation:sway 3.4s ease-in-out infinite; transform-box:fill-box; transform-origin:bottom center; }
  .crop-tuft:nth-child(odd){ animation-duration:3.9s; }
  @keyframes sway{ 0%,100%{transform:rotate(-2deg);} 50%{transform:rotate(2deg);} }

  #warnRing{ animation:warnPulse 1.1s ease-in-out infinite; transform-box:fill-box; transform-origin:center; }
  @keyframes warnPulse{ 0%,100%{opacity:.35;transform:scale(1);} 50%{opacity:.9;transform:scale(1.25);} }

  #flash{ opacity:0; }
  #flash.hit{ animation:flashPop .5s ease-out; }
  @keyframes flashPop{ 0%{opacity:0;} 15%{opacity:.95;} 100%{opacity:0;} }

  #scanLine{ opacity:0; }
  #scanLine.run{ animation:scanRun 1.6s linear; }
  @keyframes scanRun{ 0%{opacity:.9;transform:translateY(0);} 100%{opacity:0;transform:translateY(74px);} }

  .bar{ transform-box:fill-box; transform-origin:bottom; }
  .scene5 .bar{ animation:barGrow 2.2s ease-in-out infinite; }
  .scene5 .bar:nth-child(1){animation-delay:0s;} .scene5 .bar:nth-child(2){animation-delay:.2s;}
  .scene5 .bar:nth-child(3){animation-delay:.4s;} .scene5 .bar:nth-child(4){animation-delay:.6s;}
  @keyframes barGrow{ 0%,100%{transform:scaleY(.5);} 50%{transform:scaleY(1);} }

  .sprout{ animation:sproutGrow 2.6s ease-in-out infinite; transform-box:fill-box; transform-origin:bottom center; }
  @keyframes sproutGrow{ 0%,100%{transform:scale(.9);} 50%{transform:scale(1.05);} }

  .cal-day{ opacity:.35; }
  .scene5 .cal-day.lit{ opacity:1; }

  .chatline{ transition:opacity .25s ease; }

  #playOverlay{
    position:absolute; inset:0; display:flex; align-items:center; justify-content:center;
    flex-direction:column; gap:14px; background:rgba(10,12,8,0.72); z-index:20; cursor:pointer;
  }
  #playOverlay .btn{
    font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:20px; color:#12140F;
    background:var(--amber); padding:16px 34px; border-radius:40px; box-shadow:0 6px 18px rgba(0,0,0,.4);
  }
  #playOverlay .hint{ color:#EDE6D2; font-family:'Inter',sans-serif; font-size:13px; opacity:.75; max-width:360px; text-align:center; }

  #replayBtn{
    position:absolute; bottom:26px; right:26px; z-index:20;
    font-family:'Inter',sans-serif; font-weight:700; font-size:14px; color:#12140F;
    background:var(--paper); border:none; padding:10px 18px; border-radius:24px; cursor:pointer;
    opacity:0; pointer-events:none; transition:opacity .4s ease;
  }
  #replayBtn.show{ opacity:1; pointer-events:auto; }

  @media (prefers-reduced-motion: reduce){ *{ animation:none !important; transition:none !important; } }
</style>
</head>
<body>
<div class="stage">

<svg viewBox="0 0 1600 900" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="var(--sky-top)"/><stop offset="100%" stop-color="var(--sky-bot)"/>
    </linearGradient>
    <radialGradient id="sunGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FFF3C4"/><stop offset="100%" stop-color="#FFC94A" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect x="0" y="0" width="1600" height="520" fill="url(#skyGrad)"/>
  <g id="sunGlow"><circle cx="1350" cy="150" r="110" fill="url(#sunGrad)"/><circle cx="1350" cy="150" r="46" fill="#FFE9A8"/></g>
  <path d="M0,480 Q400,430 800,470 T1600,455 L1600,520 L0,520 Z" fill="#D9C48A" opacity="0.6"/>

  <g id="camera">
    <g id="rows">
      <polygon points="800,470 760,900 0,900 0,600" fill="var(--soil-dark)"/>
      <polygon points="800,470 900,470 1090,900 400,900" fill="var(--soil)"/>
      <polygon points="900,470 960,470 1290,900 1090,900" fill="var(--crop-dark)"/>
      <polygon points="960,470 1020,470 1450,900 1290,900" fill="var(--soil)"/>
      <polygon points="1020,470 1080,470 1600,760 1600,900 1450,900" fill="var(--crop)"/>
      <polygon points="740,470 800,470 760,900 400,900" fill="var(--crop)"/>
      <polygon points="680,470 740,470 400,900 60,900" fill="var(--soil-dark)"/>
      <g fill="var(--crop-light)">
        <g class="crop-tuft"><ellipse cx="1150" cy="620" rx="10" ry="5"/></g>
        <g class="crop-tuft"><ellipse cx="1230" cy="700" rx="13" ry="6"/></g>
        <g class="crop-tuft"><ellipse cx="1320" cy="790" rx="16" ry="7"/></g>
        <g class="crop-tuft"><ellipse cx="640" cy="610" rx="9" ry="4.5"/></g>
        <g class="crop-tuft"><ellipse cx="590" cy="700" rx="12" ry="6"/></g>
        <g class="crop-tuft"><ellipse cx="520" cy="800" rx="15" ry="7"/></g>
        <g class="crop-tuft"><ellipse cx="1490" cy="820" rx="16" ry="7"/></g>
      </g>
    </g>

    <g id="farmer" transform="translate(470,410)">
      <ellipse cx="95" cy="220" rx="65" ry="10" fill="#000" opacity="0.15"/>
      <rect x="74" y="168" width="15" height="58" rx="7" fill="#8C6B4A"/>
      <rect x="104" y="168" width="15" height="58" rx="7" fill="#8C6B4A"/>
      <path d="M58,95 Q50,150 76,178 L118,178 Q130,135 118,90 Z" fill="#EDE4D2"/>
      <path d="M58,95 Q50,150 76,178 L96,178 L86,90 Z" fill="#E3D7BF"/>
      <path d="M66,105 Q34,90 22,62" stroke="#C98F63" stroke-width="15" stroke-linecap="round" fill="none"/>
      <path d="M110,100 Q128,128 120,160" stroke="#C98F63" stroke-width="14" stroke-linecap="round" fill="none"/>
      <rect x="80" y="60" width="16" height="16" fill="#D69B72"/>
      <ellipse cx="88" cy="48" rx="26" ry="27" fill="#D69B72"/>
      <path d="M62,52 Q60,72 70,80 L64,58 Z" fill="#5B4230"/>
      <path d="M114,52 Q116,70 108,78 L112,58 Z" fill="#5B4230"/>
      <path d="M70,40 Q78,35 86,39" stroke="#4A3626" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      <path d="M92,39 Q100,35 108,40" stroke="#4A3626" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      <ellipse cx="78" cy="47" rx="6.5" ry="7.5" fill="#FFFFFF"/>
      <ellipse cx="98" cy="47" rx="6.5" ry="7.5" fill="#FFFFFF"/>
      <circle cx="78.5" cy="50" r="4" fill="#5C3A20"/>
      <circle cx="98.5" cy="50" r="4" fill="#5C3A20"/>
      <circle cx="77" cy="48.5" r="1.1" fill="#fff"/>
      <circle cx="97" cy="48.5" r="1.1" fill="#fff"/>
      <path d="M88,50 Q90,56 87,58" stroke="#C08260" stroke-width="1.6" fill="none" stroke-linecap="round"/>
      <path d="M78,64 Q88,70 98,64" stroke="#8A4B36" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <ellipse cx="70" cy="58" rx="6" ry="4" fill="#E7A98A" opacity="0.55"/>
      <ellipse cx="106" cy="58" rx="6" ry="4" fill="#E7A98A" opacity="0.55"/>
      <path d="M56,20 Q88,-14 122,20 Q128,42 118,56 Q108,30 88,26 Q68,30 58,56 Q48,42 56,20 Z" fill="var(--scarf)"/>
      <path d="M56,20 Q88,-14 122,20 Q124,28 120,34 Q94,4 60,32 Q54,26 56,20 Z" fill="var(--scarf-dark)"/>
      <path d="M116,52 Q132,70 122,96 Q112,80 108,60 Z" fill="var(--scarf)"/>

      <g id="phoneGroup" transform="translate(-2,30) rotate(-10)" opacity="0">
        <rect x="0" y="0" width="46" height="82" rx="8" fill="#1F2420" stroke="#0B0C09" stroke-width="2"/>
        <rect x="4" y="6" width="38" height="70" rx="3" fill="#0F1A12"/>
        <g transform="translate(10,16)">
          <path d="M13,0 C22,4 26,16 13,34 C0,16 4,4 13,0 Z" fill="var(--crop-light)"/>
          <path d="M17,10 C22,14 21,20 15,24 C13,17 14,12 17,10 Z" fill="var(--rust)"/>
        </g>
        <rect id="flash" x="4" y="6" width="38" height="70" rx="3" fill="#FFFFFF"/>
        <rect id="scanLine" x="4" y="6" width="38" height="3" fill="#8BE07A"/>
      </g>

      <g transform="translate(-30,60)" id="plantGroup">
        <path d="M20,60 Q10,30 22,0" stroke="var(--crop-dark)" stroke-width="4" fill="none"/>
        <path d="M22,0 C34,6 40,26 22,46 C6,26 12,6 22,0 Z" fill="var(--crop)"/>
        <path d="M27,12 C33,16 31,24 24,30 C21,22 22,15 27,12 Z" fill="var(--rust)"/>
        <path d="M8,40 C-2,34 -4,20 6,10 C16,18 16,30 8,40 Z" fill="var(--crop-light)"/>
        <circle id="warnRing" cx="27" cy="20" r="16" fill="none" stroke="var(--danger)" stroke-width="3" opacity="0"/>
      </g>
    </g>
  </g>

  <foreignObject class="scene scene4" id="scene4" x="520" y="300" width="260" height="150">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:'JetBrains Mono',monospace;background:rgba(15,20,15,0.94);border:1px solid #4C6B3E;border-radius:8px;padding:10px 12px;color:#F6EFDD;width:236px;box-sizing:border-box;">
      <div style="font-size:9px;color:#E0A526;letter-spacing:0.5px;">AI agronomist</div>
      <div style="font-size:11px;font-weight:600;margin-top:4px;">Early blight detected</div>
      <div style="font-size:8.5px;color:#B9C9AE;margin-top:2px;">Apply copper fungicide</div>
      <div id="chatline" class="chatline" style="font-size:10px;color:#8BE07A;margin-top:8px;height:14px;">Apply copper fungicide</div>
    </div>
  </foreignObject>

  <g class="scene scene5" id="scene5" transform="translate(560,300)">
    <rect x="0" y="0" width="480" height="300" rx="16" fill="#16221A" opacity="0.94"/>
    <text x="24" y="34" font-family="Space Grotesk" font-size="20" fill="var(--paper)">Harvest tracker</text>
    <g class="sprout" transform="translate(40,60)">
      <path d="M0,60 Q-14,30 0,0" stroke="var(--crop)" stroke-width="5" fill="none"/>
      <path d="M0,0 C14,4 20,20 0,36 C-14,20 -10,4 0,0 Z" fill="var(--crop-light)"/>
    </g>
    <g transform="translate(120,70)" fill="var(--crop-light)">
      <rect class="bar" x="0" y="60" width="18" height="40"/>
      <rect class="bar" x="26" y="40" width="18" height="60"/>
      <rect class="bar" x="52" y="20" width="18" height="80"/>
      <rect class="bar" x="78" y="4"  width="18" height="96"/>
    </g>
    <g transform="translate(250,70)">
      <text x="0" y="0" font-family="Inter" font-size="13" fill="#B9C9AE">Day by day</text>
      <g transform="translate(0,14)">
        <rect class="cal-day lit" x="0"   y="0" width="24" height="24" rx="4" fill="var(--ok)"/>
        <rect class="cal-day lit" x="30"  y="0" width="24" height="24" rx="4" fill="var(--ok)"/>
        <rect class="cal-day lit" x="60"  y="0" width="24" height="24" rx="4" fill="var(--ok)"/>
        <rect class="cal-day"     x="90"  y="0" width="24" height="24" rx="4" fill="#3B4A38"/>
        <rect class="cal-day"     x="120" y="0" width="24" height="24" rx="4" fill="#3B4A38"/>
        <rect class="cal-day"     x="150" y="0" width="24" height="24" rx="4" fill="#3B4A38"/>
        <rect class="cal-day"     x="180" y="0" width="24" height="24" rx="4" fill="#3B4A38"/>
      </g>
    </g>
  </g>

  <g class="scene scene6" id="scene6">
    <text x="800" y="660" text-anchor="middle" font-family="Space Grotesk" font-size="50" fill="#F6EFDD">Suttain Farm</text>
    <text x="800" y="700" text-anchor="middle" font-family="Inter" font-size="18" fill="#D9C48A">Smart farming in your pocket</text>
  </g>
</svg>

<div id="playOverlay">
  <div class="btn">▶ Play with sound</div>
  <div class="hint">Narrated with your browser's built-in voice (set to a female voice where available) plus generated music &amp; sound effects — needs a click to start.</div>
</div>
<button id="replayBtn">↻ Replay</button>
</div>

<script>
const scenes = ['scene1','scene2','scene3','scene4','scene5','scene6'];
const camera = document.getElementById('camera');
const phoneGroup = document.getElementById('phoneGroup');
const warnRing = document.getElementById('warnRing');
const flash = document.getElementById('flash');
const scanLine = document.getElementById('scanLine');
const chatline = document.getElementById('chatline');
const playOverlay = document.getElementById('playOverlay');
const replayBtn = document.getElementById('replayBtn');

const voLines = [
  "Managing a large farm comes with massive challenges.",
  "But the right answers shouldn't be miles away.",
  "Meet Suttain Farm. An AI agronomist right in your pocket.",
  "Snap a photo of any diseased leaf, and chat instantly with AI in your own language to get expert solutions.",
  "Track your harvest growth, day by day, right from the field.",
  "Download Suttain Farm today, and grow smarter."
];

const languageCycle = ["Apply copper fungicide","Aplicar fungicida de cobre","तांबे का कवकनाशी लगाएं","Appliquer un fongicide au cuivre","Aplicar fungicida de cobre","Apply copper fungicide"];

let timers = [];
let femaleVoice = null;

function loadVoices(){
  const voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
  const preferredNames = ['female','zira','samantha','victoria','susan','karen','moira','tessa','fiona','allison','ava','serena','joanna','salli','google us english','google uk english female'];
  femaleVoice = voices.find(v => preferredNames.some(n => v.name.toLowerCase().includes(n)))
             || voices.find(v => v.lang && v.lang.startsWith('en'))
             || voices[0] || null;
}
if('speechSynthesis' in window){
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

function clearTimers(){ timers.forEach(t=>clearTimeout(t)); timers=[]; }

function speak(text){
  if(!('speechSynthesis' in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.98; u.pitch = 1.05;
  if(femaleVoice) u.voice = femaleVoice;
  window.speechSynthesis.speak(u);
}

function showScene(name){
  scenes.forEach(s=>{
    document.querySelectorAll('.'+s).forEach(el=>el.classList.toggle('active', s===name));
  });
}

let synth, pad, clickSynth, swishNoise;
function initAudio(){
  synth = new Tone.PluckSynth().toDestination();
  synth.volume.value = -8;
  pad = new Tone.PolySynth(Tone.Synth, { oscillator:{type:'sine'}, envelope:{attack:1.2, decay:0.4, sustain:0.6, release:2}}).toDestination();
  pad.volume.value = -18;
  clickSynth = new Tone.MembraneSynth().toDestination();
  clickSynth.volume.value = -6;
  swishNoise = new Tone.NoiseSynth({ noise:{type:'white'}, envelope:{attack:0.01, decay:0.25, sustain:0} }).toDestination();
  swishNoise.volume.value = -14;
}
function playChord(notes){ pad.triggerAttackRelease(notes, "2n"); }
function pluck(note){ synth.triggerAttackRelease(note, "8n"); }
function shutterClick(){ clickSynth.triggerAttackRelease("C2","16n"); }
function swish(){ swishNoise.triggerAttackRelease("8n"); }

function schedule(fn, ms){ timers.push(setTimeout(fn, ms)); }

function runSequence(){
  clearTimers();
  showScene('scene1'); camera.className='';
  phoneGroup.setAttribute('opacity','0');
  warnRing.setAttribute('opacity','0');
  chatline.textContent = languageCycle[0];

  playChord(["C4","E4","G4"]);
  schedule(()=>playChord(["A3","C4","E4"]), 8000);
  schedule(()=>playChord(["F3","A3","C4"]), 16000);
  schedule(()=>playChord(["G3","C4","E4"]), 24000);

  schedule(()=>speak(voLines[0]), 300);
  schedule(()=>pluck("C5"), 500);

  schedule(()=>{
    showScene('scene2');
    camera.className='zoom-farmer';
    swish();
    speak(voLines[1]);
    schedule(()=>warnRing.setAttribute('opacity','1'), 700);
  }, 5000);

  schedule(()=>{
    showScene('scene3');
    warnRing.setAttribute('opacity','0');
    phoneGroup.setAttribute('opacity','1');
    speak(voLines[2]);
    schedule(()=>{ flash.classList.add('hit'); shutterClick(); }, 1200);
    schedule(()=>{ scanLine.classList.add('run'); }, 1800);
  }, 9000);

  schedule(()=>{
    showScene('scene4');
    camera.className='zoom-phone';
    swish();
    speak(voLines[3]);
    let i=0;
    const cycle=setInterval(()=>{
      i++;
      if(i>=languageCycle.length){ clearInterval(cycle); return; }
      chatline.style.opacity=0;
      setTimeout(()=>{ chatline.textContent=languageCycle[i]; chatline.style.opacity=1; }, 150);
    }, 700);
  }, 14000);

  schedule(()=>{
    showScene('scene5');
    camera.className='zoom-farmer';
    swish();
    speak(voLines[4]);
    pluck("E5");
  }, 20000);

  schedule(()=>{
    showScene('scene6');
    camera.className='zoom-out';
    swish();
    speak(voLines[5]);
    playChord(["C4","E4","G4","C5"]);
  }, 25000);

  schedule(()=>{ replayBtn.classList.add('show'); }, 30500);
}

playOverlay.addEventListener('click', async ()=>{
  await Tone.start();
  initAudio();
  loadVoices();
  playOverlay.style.display='none';
  replayBtn.classList.remove('show');
  runSequence();
});

replayBtn.addEventListener('click', ()=>{
  window.speechSynthesis.cancel();
  replayBtn.classList.remove('show');
  runSequence();
});
<\/script>
</body>
</html>`;

export default function AgroDemoAd() {
  return (
    <div className="relative w-full bg-[#F9F5EF] rounded-2xl overflow-hidden">
      <iframe
        srcDoc={AD_HTML}
        title="Suttain Farm Demo"
        className="w-full aspect-video border-0 block"
        allow="autoplay; clipboard-write; encrypted-media"
        style={{ minHeight: '300px' }}
      />
    </div>
  );
}