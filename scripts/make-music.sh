#!/usr/bin/env bash
# Erzeugt einen ruhigen Ambient-Drone-Teppich → public/audio/music.mp3
# Nutzung: npm run music -- <sekunden>     (Standard: 75)
set -euo pipefail
cd "$(dirname "$0")/.."
DUR="${1:-75}"
mkdir -p public/audio
FO=$(awk "BEGIN{print $DUR-4}")
# A-Moll-Fläche (A2, E3, A3, C4, E4) mit langsam atmenden Lautstärken, rechts leicht verstimmt für Breite.
L="0.30*sin(2*PI*110*t)*(0.7+0.3*sin(2*PI*0.05*t))+0.22*sin(2*PI*164.81*t)*(0.6+0.4*sin(2*PI*0.07*t+1))+0.16*sin(2*PI*220*t)*(0.6+0.4*sin(2*PI*0.031*t+2))+0.08*sin(2*PI*261.63*t)*(0.5+0.5*sin(2*PI*0.043*t+0.5))+0.06*sin(2*PI*329.63*t)*(0.5+0.5*sin(2*PI*0.023*t+3))"
R="0.30*sin(2*PI*110.15*t)*(0.7+0.3*sin(2*PI*0.045*t+0.7))+0.22*sin(2*PI*165.0*t)*(0.6+0.4*sin(2*PI*0.06*t+2))+0.16*sin(2*PI*220.3*t)*(0.6+0.4*sin(2*PI*0.037*t+1))+0.08*sin(2*PI*261.9*t)*(0.5+0.5*sin(2*PI*0.039*t+2.5))+0.06*sin(2*PI*329.2*t)*(0.5+0.5*sin(2*PI*0.027*t+1))"
ffmpeg -y -loglevel error \
  -f lavfi -i "aevalsrc='$L|$R':s=48000:d=$DUR" \
  -f lavfi -i "anoisesrc=c=brown:r=48000:d=$DUR:a=0.02" \
  -filter_complex "[1]lowpass=f=600,aformat=channel_layouts=stereo[n];[0][n]amix=inputs=2:weights='1 0.6':normalize=0,lowpass=f=1400,aecho=0.8:0.7:400|700:0.25|0.18,afade=t=in:d=3,afade=t=out:st=$FO:d=4,loudnorm=I=-22:TP=-3:LRA=7" \
  -ar 48000 -codec:a libmp3lame -b:a 192k public/audio/music.mp3
echo "OK: public/audio/music.mp3 (${DUR}s)"
