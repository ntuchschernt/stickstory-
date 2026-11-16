#!/usr/bin/env bash
# Erzeugt dezente Soundeffekte per ffmpeg → public/sfx/*.mp3 (48 kHz, leise Spitzen ~ -14 dBFS).
# Nutzung: npm run sfx
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p public/sfx
R=48000
mk() { # name, dauer, ausdruck, zusatzfilter
  ffmpeg -y -loglevel error -f lavfi -i "aevalsrc='$3':s=$R:d=$2" -af "$4,alimiter=limit=0.2,aformat=channel_layouts=stereo" -ar $R -codec:a libmp3lame -b:a 160k "public/sfx/$1.mp3"
  echo "OK: public/sfx/$1.mp3"
}
# tick – kurzer, weicher Klick (Treppenstufe, Zähler)
mk tick 0.15 "0.5*sin(2*PI*1500*t)*exp(-t*70)+0.3*sin(2*PI*2400*t)*exp(-t*110)" "highpass=f=400,afade=t=out:st=0.1:d=0.05"
# pop – runder "Plopp" (etwas erscheint)
mk pop 0.3 "0.6*sin(2*PI*(380+500*exp(-t*35))*t)*exp(-t*18)" "lowpass=f=3000,afade=t=out:st=0.22:d=0.08"
# rise – sanfter Ton, der langsam steigt (Wachstum)
mk rise 3.4 "0.35*sin(2*PI*(220*t+440*t*t/6.8))+0.12*sin(2*PI*(440*t+880*t*t/6.8))" "afade=t=in:d=1.2,afade=t=out:st=2.2:d=1.2,aecho=0.8:0.6:180:0.3,lowpass=f=2500"
# fall – sanfter Ton, der langsam sinkt (Verfall)
mk fall 3.0 "0.35*sin(2*PI*(520*t-300*t*t/6))+0.1*sin(2*PI*(260*t-150*t*t/6))" "afade=t=in:d=0.8,afade=t=out:st=1.8:d=1.2,aecho=0.8:0.6:180:0.3,lowpass=f=2200"
# chime – kurze, warme Glocke (Erkenntnis)
mk chime 2.5 "0.4*sin(2*PI*880*t)*exp(-t*2.2)+0.2*sin(2*PI*1318.5*t)*exp(-t*3)+0.1*sin(2*PI*1760*t)*exp(-t*4.5)" "afade=t=in:d=0.005,aecho=0.8:0.5:240:0.25"
# whoosh – leises Luftrauschen (Übergang)
ffmpeg -y -loglevel error -f lavfi -i "anoisesrc=c=pink:r=$R:d=0.9:a=0.5" -af "bandpass=f=1100:width_type=h:w=900,afade=t=in:d=0.45:curve=qsin,afade=t=out:st=0.45:d=0.45:curve=qsin,volume=0.6,alimiter=limit=0.2,aformat=channel_layouts=stereo" -ar $R -codec:a libmp3lame -b:a 160k public/sfx/whoosh.mp3
echo "OK: public/sfx/whoosh.mp3"
