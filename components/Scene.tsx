"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, Sparkles, Text } from "@react-three/drei";
import * as THREE from "three";
import { MutableRefObject, useMemo, useRef } from "react";

type PR = MutableRefObject<number>;
const N = 6; // chapters
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ease = (t: number) => t * t * (3 - 2 * t);
const chap = (p: number, i: number) => clamp(p * N - i); // progress inside chapter i

// The journey: the camera rides this curve; every object is placed relative to it.
const curve = new THREE.CatmullRomCurve3(
  [[0, 0, 8], [1, 0.4, -2], [-1, -0.3, -12], [1.2, 0.5, -22], [-1, 0, -32], [1, 0.6, -42], [0, 0, -54]].map((v) => new THREE.Vector3(...v))
);
const at = (p: number) => curve.getPointAt(clamp(p));
const spot = (i: number, side: number) => at((i + 0.5) / N + 0.07).add(new THREE.Vector3(side * 1.9, 0, 0));
const SPOTS = [null, spot(1, -1), spot(2, 1), spot(3, -1), spot(4, 1), spot(5, -1)] as (THREE.Vector3 | null)[];

const gold = { color: "#d9a28f", metalness: 1, roughness: 0.18 } as const;
const rose = { color: "#e8a3a8", metalness: 0.2, roughness: 0.35 } as const;
const ink = { color: "#1b1114", metalness: 0.6, roughness: 0.3 } as const;

/* ---------- moving sky: gradient shifts through the story, follows the theme ---------- */
const LIGHT = [["#fbefea", "#f7dcd9"], ["#f9d9d2", "#f0b5b0"], ["#f3c6c6", "#d98f9a"], ["#f6d2c0", "#e8a98f"], ["#e9b6c4", "#b8707f"], ["#f7dcd9", "#fbefea"]];
const DARK = [["#1a0f13", "#2a1820"], ["#2a1520", "#4a2230"], ["#2f1624", "#6e3446"], ["#2a1a1a", "#5c3330"], ["#220f1c", "#4d2038"], ["#1a0f13", "#33202a"]];

function Sky({ P }: { P: PR }) {
  const mesh = useRef<THREE.Mesh>(null!);
  const tmp = useMemo(() => new THREE.Color(), []);
  const u = useMemo(() => ({ top: { value: new THREE.Color() }, bot: { value: new THREE.Color() } }), []);
  useFrame(({ camera }) => {
    const pal = document.documentElement.dataset.theme === "dark" ? DARK : LIGHT;
    const f = P.current * (N - 1), i = Math.min(N - 2, Math.floor(f)), t = f - i;
    u.top.value.set(pal[i][0]).lerp(tmp.set(pal[i + 1][0]), t);
    u.bot.value.set(pal[i][1]).lerp(tmp.set(pal[i + 1][1]), t);
    mesh.current.position.copy(camera.position);
  });
  return (
    <mesh ref={mesh} renderOrder={-1}>
      <sphereGeometry args={[150, 32, 16]} />
      <shaderMaterial side={THREE.BackSide} depthWrite={false} uniforms={u}
        vertexShader="varying float vY;void main(){vY=normalize(position).y;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}"
        fragmentShader="uniform vec3 top;uniform vec3 bot;varying float vY;void main(){vec3 c=mix(bot,top,smoothstep(-.5,.9,vY));gl_FragColor=vec4(c,1.);#include <colorspace_fragment>\n}" />
    </mesh>
  );
}

/* ---------- drifting petals along the whole path ---------- */
function Petals() {
  const ref = useRef<THREE.InstancedMesh>(null!);
  const n = 260, d = useMemo(() => new THREE.Object3D(), []);
  const seed = useMemo(() => Array.from({ length: n }, () => ({ u: Math.random(), x: (Math.random() - 0.5) * 14, y: Math.random() * 10, z: (Math.random() - 0.5) * 6, s: 0.6 + Math.random() * 1.2, r: Math.random() * 6, v: 0.25 + Math.random() * 0.5 })), []);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    seed.forEach((s, i) => {
      const b = at(s.u);
      d.position.set(b.x + s.x, b.y + ((((s.y - t * s.v) % 10) + 10) % 10) - 4, b.z + s.z);
      d.rotation.set(t * s.v + s.r, t * 0.5 * s.v + s.r, s.r);
      d.scale.set(s.s, s.s * 0.15, s.s * 0.6);
      d.updateMatrix(); ref.current.setMatrixAt(i, d.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, n]} frustumCulled={false}>
      <sphereGeometry args={[0.12, 10, 6]} /><meshStandardMaterial color="#f4a9b4" roughness={0.5} />
    </instancedMesh>
  );
}

/* ---------- rose-gold arches the camera flies through ---------- */
function Arches() {
  const items = useMemo(() => Array.from({ length: 14 }, (_, i) => {
    const p = (i + 0.5) / 14;
    return { pos: at(p), q: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), curve.getTangentAt(p)), r: 4.2 + (i % 3) * 0.8 };
  }), []);
  return <>{items.map((a, i) => (
    <mesh key={i} position={a.pos} quaternion={a.q}>
      <torusGeometry args={[a.r, 0.035, 12, 96]} /><meshStandardMaterial {...gold} emissive="#e8a3a8" emissiveIntensity={0.35} />
    </mesh>
  ))}</>;
}

/* ---------- giant words hanging in the world behind each scene ---------- */
const WORDS = ["Begin", "Glow", "Soften", "Capture", "Keep"];
function Words() {
  return <>{WORDS.map((w, i) => {
    const p = at((i + 1.5) / N + 0.12);
    return <Text key={w} position={[p.x, p.y + 0.4, p.z - 3.5]} fontSize={3.4} letterSpacing={0.05} color="#ffffff" fillOpacity={0.22} anchorX="center">{w}</Text>;
  })}</>;
}

/* ---------- polaroids: the "memories" ---------- */
const TONES = [["#f2b8b0", "#c98686"], ["#f7dcd9", "#d9a0a0"], ["#e8b4b4", "#8f5560"], ["#f4c9c0", "#b4707a"], ["#fbe3df", "#c98686"], ["#eaa9a9", "#6e3b47"], ["#f1c6b6", "#a85d6b"], ["#f6d2d0", "#7a4050"]];
const CAPS = ["the first look", "before the vows", "golden hour", "her birthday", "new brand shoot", "date night", "good morning", "still glowing"];
function makeTex(i: number) {
  const c = document.createElement("canvas"); c.width = c.height = 256;
  const x = c.getContext("2d")!, g = x.createLinearGradient(0, 0, 256, 256);
  g.addColorStop(0, TONES[i][0]); g.addColorStop(1, TONES[i][1]); x.fillStyle = g; x.fillRect(0, 0, 256, 256);
  x.fillStyle = "rgba(255,255,255,.28)"; x.beginPath(); x.arc(150, 110, 70, 0, 7); x.fill();
  x.beginPath(); x.ellipse(110, 260, 110, 90, 0, 0, 7); x.fill();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function Polaroid({ i, ...rest }: any) {
  const tex = useMemo(() => makeTex(i), [i]);
  return (
    <group {...rest}>
      <mesh><boxGeometry args={[1.2, 1.45, 0.04]} /><meshStandardMaterial color="#fff7f3" roughness={0.8} /></mesh>
      <mesh position={[0, 0.12, 0.025]}><planeGeometry args={[1.02, 1.02]} /><meshBasicMaterial map={tex} toneMapped={false} /></mesh>
      <Text position={[0, -0.5, 0.03]} fontSize={0.09} color="#6b4f55" anchorX="center">{CAPS[i % 8]}</Text>
    </group>
  );
}

/* ---------- act 1: lipstick. Cap lifts away, the colour rises ---------- */
function Lipstick({ P }: { P: PR }) {
  const g = useRef<THREE.Group>(null!), cap = useRef<THREE.Group>(null!), bullet = useRef<THREE.Group>(null!);
  useFrame(() => {
    const t = chap(P.current, 1), e = ease(clamp(t * 2)), k = ease(clamp((t - 0.45) * 2));
    cap.current.position.y = 0.95 + e * 2.6; cap.current.rotation.z = e * 0.7;
    bullet.current.position.y = 0.2 + k * 0.75; g.current.rotation.y = t * Math.PI * 2;
  });
  return (
    <group ref={g} scale={1.3}>
      <mesh position={[0, -0.8, 0]}><cylinderGeometry args={[0.42, 0.46, 1.2, 48]} /><meshStandardMaterial {...gold} /></mesh>
      <mesh position={[0, -0.1, 0]}><cylinderGeometry args={[0.36, 0.36, 0.3, 48]} /><meshStandardMaterial {...ink} /></mesh>
      <group ref={bullet}>
        <mesh position={[0, 0.4, 0]}><cylinderGeometry args={[0.3, 0.3, 0.8, 48]} /><meshStandardMaterial {...rose} /></mesh>
        <mesh position={[0, 0.8, 0]} rotation={[0, 0, 0.5]} scale={[1, 0.9, 1]}><sphereGeometry args={[0.3, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial {...rose} /></mesh>
      </group>
      <group ref={cap}><mesh><cylinderGeometry args={[0.4, 0.4, 1.5, 48]} /><meshStandardMaterial {...gold} /></mesh></group>
    </group>
  );
}

/* ---------- act 2: brush paints a ribbon of colour as you scroll ---------- */
const swipe = new THREE.CatmullRomCurve3([[-1.6, -0.8, 0], [-0.6, 0.3, 0.2], [0.4, -0.6, 0.1], [1.6, 0.4, 0]].map((v) => new THREE.Vector3(...v)));
function Brush({ P }: { P: PR }) {
  const tube = useRef<THREE.Mesh>(null!), brush = useRef<THREE.Group>(null!);
  useFrame(() => {
    const t = ease(clamp(chap(P.current, 2) * 1.4)), pt = swipe.getPoint(t);
    tube.current.geometry.setDrawRange(0, Math.floor(t * 600) * 6);
    brush.current.position.copy(pt); brush.current.rotation.z = Math.PI + 0.5 + Math.sin(t * 9) * 0.12;
  });
  return (
    <group>
      <mesh ref={tube}><tubeGeometry args={[swipe, 60, 0.1, 10, false]} /><meshStandardMaterial {...rose} emissive="#e8a3a8" emissiveIntensity={0.25} /></mesh>
      <group ref={brush}><group position={[0, -1.08, 0]}>
        <mesh position={[0, -1.1, 0]}><cylinderGeometry args={[0.1, 0.2, 2.2, 32]} /><meshStandardMaterial {...gold} /></mesh>
        <mesh position={[0, 0.2, 0]}><cylinderGeometry args={[0.24, 0.2, 0.5, 32]} /><meshStandardMaterial color="#f1c6b6" metalness={1} roughness={0.12} /></mesh>
        <mesh position={[0, 0.78, 0]} scale={[1, 1.35, 1]}><sphereGeometry args={[0.3, 32, 32]} /><meshStandardMaterial color="#2a181c" roughness={0.9} /></mesh>
      </group></group>
    </group>
  );
}

/* ---------- act 3: compact opens to reveal mirror + powder ---------- */
function Compact({ P }: { P: PR }) {
  const lid = useRef<THREE.Group>(null!);
  useFrame(() => { lid.current.rotation.x = ease(clamp(chap(P.current, 3) * 1.6)) * 2.2; });
  return (
    <group rotation={[-0.3, 0.15, 0]} scale={1.1}>
      <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[1.3, 1.3, 0.3, 64]} /><meshStandardMaterial {...gold} /></mesh>
      <mesh position={[0, 0, 0.16]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[1.02, 1.02, 0.06, 64]} /><meshStandardMaterial color="#e69a9a" roughness={0.65} /></mesh>
      <group ref={lid} position={[0, 1.3, 0]}>
        <group position={[0, -1.3, 0.24]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[1.3, 1.3, 0.14, 64]} /><meshStandardMaterial {...gold} /></mesh>
          <mesh position={[0, 0, -0.075]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[1.05, 1.05, 0.02, 64]} /><meshStandardMaterial color="#fff2ee" metalness={1} roughness={0.02} /></mesh>
        </group>
      </group>
      <Sparkles count={50} scale={[2.6, 2.6, 1.4]} position={[0, 0.2, 0.9]} size={5} speed={0.6} color="#ffd9d4" />
    </group>
  );
}

/* ---------- act 4: camera flashes and prints polaroids ---------- */
function Cam({ P }: { P: PR }) {
  const light = useRef<THREE.PointLight>(null!), lens = useRef<THREE.MeshStandardMaterial>(null!), prints = useRef<THREE.Group>(null!);
  useFrame(() => {
    const t = chap(P.current, 4), flash = Math.max(0, 1 - Math.abs(t - 0.5) * 7), e = ease(clamp((t - 0.5) * 2.2));
    light.current.intensity = flash * 90; lens.current.emissiveIntensity = flash * 4;
    prints.current.children.forEach((c, i) => {
      c.position.set((i - 1.5) * 1.2 * e, (i % 2 ? 0.7 : -0.3) * e, 1.4 + e * 2.4);
      c.rotation.z = (i - 1.5) * 0.18 * e; c.scale.setScalar(e);
    });
  });
  return (
    <group rotation={[0, -0.5, 0]}>
      <mesh><boxGeometry args={[2.2, 1.4, 0.9]} /><meshStandardMaterial {...ink} /></mesh>
      <mesh position={[0, 0, 0.75]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.55, 0.62, 0.7, 48]} /><meshStandardMaterial {...gold} /></mesh>
      <mesh position={[0, 0, 1.12]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.4, 0.4, 0.05, 48]} /><meshStandardMaterial ref={lens} color="#f7dcd9" emissive="#ffffff" metalness={0.1} roughness={0} /></mesh>
      <mesh position={[-0.8, 0.85, 0]}><boxGeometry args={[0.5, 0.2, 0.4]} /><meshStandardMaterial {...gold} /></mesh>
      <pointLight ref={light} position={[0, 0.3, 2]} color="#fff0ea" distance={14} />
      <group ref={prints}>{[0, 1, 2, 3].map((i) => <Polaroid key={i} i={i} />)}</group>
    </group>
  );
}

/* ---------- act 5: a heart of rose gold circled by every memory ---------- */
function Finale({ P }: { P: PR }) {
  const ring = useRef<THREE.Group>(null!), heart = useRef<THREE.Mesh>(null!);
  const geo = useMemo(() => {
    const s = new THREE.Shape(); s.moveTo(0, -1);
    s.bezierCurveTo(-1.6, 0.1, -0.9, 1.5, 0, 0.7); s.bezierCurveTo(0.9, 1.5, 1.6, 0.1, 0, -1);
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.35, bevelEnabled: true, bevelSize: 0.12, bevelThickness: 0.12, bevelSegments: 6, curveSegments: 32 });
    g.center(); return g;
  }, []);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime, k = ease(clamp(chap(P.current, 5) * 2));
    ring.current.rotation.y = t * 0.25 + k * 2; ring.current.scale.setScalar(0.3 + k * 0.7);
    heart.current.rotation.y = t * 0.6; heart.current.scale.setScalar((0.4 + k * 0.6) * (1 + Math.sin(t * 3) * 0.04));
  });
  return (
    <group>
      <mesh ref={heart} geometry={geo}><meshStandardMaterial {...gold} emissive="#e8a3a8" emissiveIntensity={0.25} /></mesh>
      <group ref={ring}>{Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return <Polaroid key={i} i={i} position={[Math.sin(a) * 3.4, Math.sin(i * 1.7) * 0.6, Math.cos(a) * 3.4]} rotation={[0, a, 0]} />;
      })}</group>
    </group>
  );
}

/* ---------- camera rig: rides the curve, eased, with a little pointer parallax ---------- */
function Rig({ P, progress }: { P: PR; progress: PR }) {
  useFrame(({ camera, pointer }, dt) => {
    P.current += (progress.current - P.current) * Math.min(1, dt * 2.5);
    const p = clamp(P.current), pos = at(p), tan = curve.getTangentAt(p);
    camera.position.set(pos.x + pointer.x * 0.5, pos.y + pointer.y * 0.3, pos.z);
    camera.lookAt(pos.clone().addScaledVector(tan, 6));
  });
  return null;
}

export default function Scene({ progress }: { progress: PR }) {
  const P = useRef(0);
  const wrap = (i: number, node: JSX.Element) => <group position={SPOTS[i]!}><Float speed={1.5} floatIntensity={0.6} rotationIntensity={0.25}>{node}</Float></group>;
  return (
    <Canvas dpr={[1, 1.75]} camera={{ position: [0, 0, 8], fov: 50, near: 0.1, far: 300 }} gl={{ antialias: true }}>
      <Sky P={P} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 6, 5]} intensity={2} color="#ffe3da" />
      <Environment preset="sunset" />
      <Rig P={P} progress={progress} />
      <Arches /><Petals /><Words />
      <Sparkles count={200} scale={[16, 8, 60]} position={[0, 0, -24]} size={3} speed={0.3} color="#f7c9c4" />
      {wrap(1, <Lipstick P={P} />)}{wrap(2, <Brush P={P} />)}{wrap(3, <Compact P={P} />)}{wrap(4, <Cam P={P} />)}{wrap(5, <Finale P={P} />)}
    </Canvas>
  );
}
