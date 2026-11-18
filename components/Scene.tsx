"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { MutableRefObject, useRef } from "react";

const gold = { color: "#d9a28f", metalness: 1, roughness: 0.18 } as const;
const rose = { color: "#e8a3a8", metalness: 0.2, roughness: 0.35 } as const;
const black = { color: "#1b1114", metalness: 0.6, roughness: 0.3 } as const;

function Lipstick() {
  return (
    <group>
      <mesh position={[0, -0.6, 0]}><cylinderGeometry args={[0.42, 0.46, 1.1, 48]} /><meshStandardMaterial {...gold} /></mesh>
      <mesh position={[0, 0.2, 0]}><cylinderGeometry args={[0.36, 0.36, 0.6, 48]} /><meshStandardMaterial {...black} /></mesh>
      <mesh position={[0, 0.85, 0]}><cylinderGeometry args={[0.3, 0.3, 0.8, 48]} /><meshStandardMaterial {...rose} /></mesh>
      <mesh position={[0, 1.28, 0]} rotation={[0, 0, 0.5]} scale={[1, 0.9, 1]}><sphereGeometry args={[0.3, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial {...rose} /></mesh>
    </group>
  );
}

function Brush() {
  return (
    <group rotation={[0, 0, 0.35]}>
      <mesh position={[0, -1.1, 0]}><cylinderGeometry args={[0.1, 0.2, 2.2, 32]} /><meshStandardMaterial {...gold} /></mesh>
      <mesh position={[0, 0.2, 0]}><cylinderGeometry args={[0.24, 0.2, 0.5, 32]} /><meshStandardMaterial color="#f1c6b6" metalness={1} roughness={0.12} /></mesh>
      <mesh position={[0, 0.78, 0]} scale={[1, 1.35, 1]}><sphereGeometry args={[0.3, 32, 32]} /><meshStandardMaterial color="#2a181c" roughness={0.9} /></mesh>
    </group>
  );
}

function Compact() {
  return (
    <group rotation={[1.0, 0.3, 0]}>
      <mesh><cylinderGeometry args={[1.3, 1.3, 0.28, 64]} /><meshStandardMaterial {...gold} /></mesh>
      <mesh position={[0, 0.15, 0]}><cylinderGeometry args={[1.05, 1.05, 0.1, 64]} /><meshStandardMaterial color="#e69a9a" roughness={0.6} /></mesh>
      <mesh position={[0, 0.21, 0]}><torusGeometry args={[1.05, 0.05, 16, 64]} /><meshStandardMaterial {...gold} /></mesh>
    </group>
  );
}

function CameraObj() {
  return (
    <group rotation={[0, -0.5, 0]}>
      <mesh><boxGeometry args={[2.2, 1.4, 0.9]} /><meshStandardMaterial {...black} /></mesh>
      <mesh position={[0, 0, 0.75]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.55, 0.62, 0.7, 48]} /><meshStandardMaterial {...gold} /></mesh>
      <mesh position={[0, 0, 1.12]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.4, 0.4, 0.05, 48]} /><meshPhysicalMaterial color="#f7dcd9" metalness={0.1} roughness={0} transmission={0.6} /></mesh>
      <mesh position={[-0.8, 0.85, 0]}><boxGeometry args={[0.5, 0.2, 0.4]} /><meshStandardMaterial {...gold} /></mesh>
    </group>
  );
}

const STOPS: [number, number, number][] = [[1.6, 0, 0], [-1.8, 0, -11], [1.8, 0, -22], [-1.6, 0, -33]];

function Rig({ progress }: { progress: MutableRefObject<number> }) {
  const look = useRef(new THREE.Vector3());
  useFrame(({ camera, pointer }, dt) => {
    const p = progress.current;
    const z = 7 - p * 38;
    camera.position.z += (z - camera.position.z) * Math.min(1, dt * 4);
    camera.position.x += (pointer.x * 0.6 - camera.position.x) * Math.min(1, dt * 2);
    camera.position.y += (pointer.y * 0.3 - camera.position.y) * Math.min(1, dt * 2);
    look.current.set(0, 0, camera.position.z - 6);
    camera.lookAt(look.current);
  });
  return null;
}

export default function Scene({ progress }: { progress: MutableRefObject<number> }) {
  return (
    <Canvas dpr={[1, 1.75]} camera={{ position: [0, 0, 7], fov: 45 }} gl={{ alpha: true, antialias: true }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 6, 5]} intensity={2} color="#ffe3da" />
      <Environment preset="studio" />
      <Rig progress={progress} />
      {[<Lipstick key="l" />, <Brush key="b" />, <Compact key="c" />, <CameraObj key="k" />].map((obj, i) => (
        <Float key={i} speed={1.4} rotationIntensity={0.6} floatIntensity={0.8} position={STOPS[i]}>
          <group scale={i === 2 ? 1.1 : 1.25}>{obj}</group>
        </Float>
      ))}
      <Sparkles count={160} scale={[16, 8, 50]} position={[0, 0, -15]} size={3} speed={0.3} color="#f7c9c4" />
    </Canvas>
  );
}
