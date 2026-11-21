// STARTER composition. Claude: copy the scene pattern from src/examples/NvidiaDemo.tsx, replace S1.. with scenes for the NEW script.
// Inputs per video (made by the pipeline): public/words.json (word timings, for syncing visuals), public/mix.wav (voice+SFX).
import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, Easing, Audio, staticFile } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { Look } from "./style/puppet";
import { Rig, Person, Lights, seg, lerp, clamp } from "./style/kit";
import { Floor, WallDoor, Plant } from "./style/props";

export const FPS = 30, LEAD = 6, TAIL = 8;
export const WALK = 3.4; // walk-cycle phase per world unit => feet never slide
// arabstyle main character: pale skin, black bowl-cut mop, no ears, big ring eyes, plain black oversized tee.
export const hero: Look = { skin: "#fde3cf", body: "#1d1d21", outfit: "tee", hair: "bowl", hairColor: "#14100f", eyeScale: 1.7, shoe: "#0b0d1a" };
export type Ctx = { t: number; f: number };

export const Scene: React.FC<{ start: number; end: number; first?: boolean; trans?: "ghost" | "zoom" | "flash"; bg: string; children: (c: Ctx) => React.ReactNode }> = ({ start, end, first, trans = "ghost", bg, children }) => {
  const from = Math.round(start * FPS) - (first ? 0 : LEAD), dur = Math.round(end * FPS) - from + TAIL;
  return <Sequence from={from} durationInFrames={dur} layout="none"><Inner from={from} first={first} trans={trans} bg={bg} children={children} /></Sequence>;
};
const Inner: React.FC<{ from: number; first?: boolean; trans: string; bg: string; children: (c: Ctx) => React.ReactNode }> = ({ from, first, trans, bg, children }) => {
  const f = useCurrentFrame(), t = (f + from) / FPS;
  const k = first ? 1 : clamp(f / (LEAD + 2));
  const sc = !first && trans === "zoom" ? lerp(1.35, 1, Easing.out(Easing.cubic)(k)) : 1;
  return (
    <AbsoluteFill style={{ opacity: first ? 1 : trans === "flash" ? 1 : k, transform: `scale(${sc})`, background: bg, filter: "saturate(1.32) contrast(1.07) brightness(1.02)" }}>
      <ThreeCanvas width={720} height={1280} camera={{ fov: 64, position: [0, 2, 8], near: 0.1, far: 120 }} gl={{ antialias: true }}>
        <color attach="background" args={[bg]} />{children({ t, f })}
      </ThreeCanvas>
      {!first && trans === "flash" ? <AbsoluteFill style={{ background: "#fff", opacity: 1 - clamp(f / 7) }} /> : null}
    </AbsoluteFill>
  );
};

const Demo = ({ t, f }: Ctx) => (<>
  <Rig t={t} t0={0} t1={2} from={[1.5, 1.7, 7]} to={[0.4, 1.9, 5]} lookFrom={[0, 2, 0]} lookTo={[0, 2, 0]} />
  <Lights /><Floor kind="plank" a="#8a4a28" b="#7a3f22" unit={2} /><WallDoor z={-7} W={26} kind="wood" a="#b2713d" b="#a2662f" door={{ x: 4.6, w: 2.4, h: 4.2 }} base="#5a2e18" /><Plant p={[-3, 0, -4]} />
  <Person p={[0, 0, 0]} h={3.6} look={hero} f={f} pose={{ mood: "smile" }} />
</>);

export const Main: React.FC = () => {
  const f = useCurrentFrame(); void f; void seg;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {/* <Audio src={staticFile("mix.wav")} />  <- enable once public/mix.wav exists */}
      <Scene first start={0} end={2} bg="#925b32">{(c) => <Demo {...c} />}</Scene>
    </AbsoluteFill>
  );
};
void Audio; void staticFile;
