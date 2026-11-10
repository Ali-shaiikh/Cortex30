"use client";
/* eslint-disable react-hooks/immutability, react-hooks/refs -- three.js objects are mutated imperatively inside useFrame, the idiomatic r3f pattern. */

import { Billboard, Html, Line, OrbitControls, Sparkles } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { BrainData, BrainNode } from "@/lib/brainData";
import { CATEGORIES, CATEGORY_META, type Category } from "@/lib/types";
import { bridgeCurve, buildCloud, buildShell, corePosition, nodeLayout, REGION } from "./geometry";
import { clearCelebration, useCelebration, type Celebration } from "./store";

export type SceneOptions = {
  interactive: boolean;
  particles: number;
  bloom: boolean;
  dpr: [number, number];
  reducedMotion: boolean;
};

type Props = SceneOptions & {
  data: BrainData;
  filter?: Category | null;
  onHover?: (node: BrainNode | null) => void;
  onSelect?: (node: BrainNode) => void;
  onFilter?: (c: Category | null) => void;
};

const AMBER = new THREE.Color("#ffb020");
const ROTATION_SPEED = 0.05; // rad/s

export default function BrainScene(props: Props) {
  return (
    <Canvas
      dpr={props.dpr}
      camera={{ position: [0, 0.35, props.interactive ? 3.4 : 3.9], fov: 42, near: 0.1, far: 50 }}
      gl={{ antialias: !props.bloom, alpha: true, powerPreference: "high-performance" }}
      style={{ background: "transparent" }}
    >
      <Brain {...props} />
      {props.interactive && (
        <OrbitControlsWithIdle reducedMotion={props.reducedMotion} />
      )}
      {props.bloom && (
        <EffectComposer multisampling={0}>
          <Bloom mipmapBlur intensity={1.15} luminanceThreshold={0.12} luminanceSmoothing={0.3} radius={0.75} />
        </EffectComposer>
      )}
    </Canvas>
  );
}

// ---------------------------------------------------------------------------

function OrbitControlsWithIdle({ reducedMotion }: { reducedMotion: boolean }) {
  const ref = useRef<OrbitControlsImpl>(null);
  return (
    <OrbitControls
      ref={ref}
      enablePan={false}
      minDistance={2}
      maxDistance={9}
      enableDamping
      dampingFactor={0.08}
      onStart={() => {
        idle.last = performance.now();
        idle.active = false;
      }}
      onEnd={() => {
        idle.last = performance.now();
      }}
      onChange={() => {
        if (reducedMotion) return;
        idle.last = performance.now();
      }}
    />
  );
}

// Shared idle tracker: auto-rotation resumes after 3 s without interaction.
const idle = { last: 0, active: true };

function Brain({ data, interactive, particles, reducedMotion, filter, onHover, onSelect, onFilter }: Props) {
  const group = useRef<THREE.Group>(null);
  const celebration = useCelebration();
  const camera = useThree((s) => s.camera);
  const anim = useRef({ targetRot: null as number | null, dolly: 0, ripple: -1, start: 0 });
  const rippleRef = useRef({ value: -1 });
  const layout = useMemo(() => nodeLayout(), []);
  const byKey = useMemo(() => new Map(data.nodes.map((n) => [`${n.category}-${n.day}`, n])), [data.nodes]);

  // Celebration choreography: rotate the node to face the camera, dolly in, ignite, ripple, return.
  useEffect(() => {
    if (!celebration) return;
    const node = layout.find((n) => n.category === celebration.category && n.day === celebration.day);
    if (node && group.current) {
      const angle = Math.atan2(node.position.x, node.position.z);
      const current = group.current.rotation.y;
      let target = -angle;
      // Shortest way round.
      target = current + ((((target - current) % (Math.PI * 2)) + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
      anim.current = { targetRot: target, dolly: 1, ripple: celebration.dayComplete ? 0 : -1, start: performance.now() };
    }
    const t = setTimeout(() => clearCelebration(celebration.id), 4200);
    return () => clearTimeout(t);
  }, [celebration, layout]);

  // Resting camera distance: pull back on tall/narrow screens so the whole brain fits.
  const aspect = useThree((s) => s.size.width / Math.max(1, s.size.height));
  // Half-width to keep in view (brain + halo ≈ 1.45) / tan(half the horizontal FOV).
  const baseZ = Math.max(interactive ? 3.4 : 3.9, 1.45 / (Math.tan(THREE.MathUtils.degToRad(21)) * aspect));
  useEffect(() => {
    if (interactive) camera.position.setLength(baseZ);
  }, [interactive, baseZ, camera]);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const a = anim.current;
    const sinceStart = (performance.now() - a.start) / 1000;
    const celebrating = a.targetRot !== null && sinceStart < 3.6;

    if (celebrating) {
      g.rotation.y = THREE.MathUtils.damp(g.rotation.y, a.targetRot!, 3, delta);
      if (!interactive) camera.position.z = THREE.MathUtils.damp(camera.position.z, baseZ - 0.9, 2.5, delta);
    } else {
      if (a.targetRot !== null) a.targetRot = null;
      if (!interactive) camera.position.z = THREE.MathUtils.damp(camera.position.z, baseZ, 1.5, delta);
      const idleFor = (performance.now() - idle.last) / 1000;
      if (!reducedMotion && (!interactive || idleFor > 3)) g.rotation.y += ROTATION_SPEED * delta;
    }
    if (!reducedMotion) g.scale.setScalar(1 + 0.012 * Math.sin(t * 0.9));
    if (a.ripple >= 0) {
      a.ripple += delta * 0.9;
      if (a.ripple > 2.2) a.ripple = -1;
    }
    rippleRef.current.value = a.ripple;
  });

  return (
    <group ref={group} rotation={[0.22, -0.95, 0]}>
      <PointCloud count={particles} mastery={data.mastery} finisher={data.flags.finisher} ripple={rippleRef.current} reducedMotion={reducedMotion} />
      <Shell hemi={-1} />
      <Shell hemi={1} />
      <RegionGlows mastery={data.mastery} finisher={data.flags.finisher} filter={filter} />
      <Cores lit={data.flags.firstSpark} interactive={interactive} filter={filter} onFilter={onFilter} />

      {layout.map((l) => {
        const node = byKey.get(`${l.category}-${l.day}`)!;
        const parent = l.parentDay ? byKey.get(`${l.category}-${l.parentDay}`) : null;
        const isCelebrating = celebration?.category === l.category && celebration.day === l.day;
        return (
          <MindNode
            key={`${l.category}-${l.day}`}
            node={node}
            position={l.position}
            parentPosition={l.parent}
            parentCompleted={parent ? parent.state === "completed" : true}
            celebration={isCelebrating ? celebration : null}
            dimmed={Boolean(filter && filter !== l.category)}
            interactive={interactive}
            reducedMotion={reducedMotion}
            onHover={onHover}
            onSelect={onSelect}
          />
        );
      })}

      {data.bridges.map((b, i) => (
        <BridgeArc key={`${b.reason}-${i}`} from={b.from} to={b.to} layout={layout} reducedMotion={reducedMotion} />
      ))}

      {data.satellites.map((s) => (
        <Satellite key={s.day} {...s} reducedMotion={reducedMotion} />
      ))}

      {data.flags.halo && <Halo reducedMotion={reducedMotion} />}
      {data.flags.sparkCritical && !reducedMotion && <Sparkles position={corePosition("critical")} count={40} scale={0.6} size={2.5} speed={0.4} color={REGION.critical.color} />}
      {data.flags.sparkCreative && !reducedMotion && <Sparkles position={corePosition("creative")} count={40} scale={0.6} size={2.5} speed={0.4} color={REGION.creative.color} />}
    </group>
  );
}

// ---------------------------------------------------------------------------
// Point cloud + shell
// ---------------------------------------------------------------------------

const cloudVertex = /* glsl */ `
  attribute float aSize;
  attribute float aRand;
  attribute float aFold;
  attribute vec3 aTint;
  attribute vec4 aMask;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform vec4 uMastery;
  uniform float uRipple;
  uniform float uFinisher;
  uniform float uMotion;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    float crest = smoothstep(0.35, 0.95, aFold);
    gl_PointSize = aSize * (0.75 + 0.7 * crest) * uPixelRatio * (12.0 / -mv.z);

    vec3 centre = vec3(sign(position.x) * 0.45, 0.0, 0.0);
    vec3 n = normalize(normalMatrix * normalize(position - centre));
    float fresnel = pow(1.0 - abs(dot(n, normalize(-mv.xyz))), 2.2);

    vec3 navy = vec3(0.07, 0.12, 0.32);
    vec3 cyan = vec3(0.35, 0.85, 1.0);
    vec3 col = mix(navy, cyan, fresnel * 0.85) * (0.45 + 0.9 * crest);
    float m = dot(aMask, uMastery);
    col += aTint * (0.12 + 0.95 * m);
    col = mix(col, col * 1.6 + vec3(0.1, 0.12, 0.2), uFinisher);

    if (uRipple >= 0.0) {
      float ring = exp(-pow((length(position) - uRipple) * 7.0, 2.0));
      col += vec3(0.7, 0.95, 1.0) * ring * 1.8;
    }
    vColor = col;
    vAlpha = 0.55 + 0.35 * sin(uTime * 1.4 * uMotion + aRand * 6.2831);
  }
`;

const cloudFragment = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.0, d) * vAlpha;
    gl_FragColor = vec4(vColor, a);
  }
`;

function PointCloud({ count, mastery, finisher, ripple, reducedMotion }: { count: number; mastery: BrainData["mastery"]; finisher: boolean; ripple: { value: number }; reducedMotion: boolean }) {
  const cloud = useMemo(() => buildCloud(count), [count]);
  const dpr = useThree((s) => s.viewport.dpr);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: cloudVertex,
        fragmentShader: cloudFragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uPixelRatio: { value: 1 },
          uMastery: { value: new THREE.Vector4() },
          uRipple: { value: -1 },
          uFinisher: { value: 0 },
          uMotion: { value: 1 },
        },
      }),
    [],
  );
  useEffect(() => () => material.dispose(), [material]);

  useFrame((state) => {
    const u = material.uniforms;
    u.uTime.value = state.clock.elapsedTime;
    u.uPixelRatio.value = dpr;
    u.uMotion.value = reducedMotion ? 0 : 1;
    (u.uMastery.value as THREE.Vector4).set(mastery.logic, mastery.analytical, mastery.critical, mastery.creative);
    u.uFinisher.value = THREE.MathUtils.damp(u.uFinisher.value, finisher ? 1 : 0, 1, 0.016);
    u.uRipple.value = ripple.value;
  });

  return (
    <points material={material} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[cloud.positions, 3]} />
        <bufferAttribute attach="attributes-aSize" args={[cloud.sizes, 1]} />
        <bufferAttribute attach="attributes-aRand" args={[cloud.rands, 1]} />
        <bufferAttribute attach="attributes-aFold" args={[cloud.folds, 1]} />
        <bufferAttribute attach="attributes-aTint" args={[cloud.tints, 3]} />
        <bufferAttribute attach="attributes-aMask" args={[cloud.masks, 4]} />
      </bufferGeometry>
    </points>
  );
}

const shellVertex = /* glsl */ `
  varying float vFresnel;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vec3 n = normalize(normalMatrix * normal);
    vFresnel = pow(1.0 - abs(dot(n, normalize(-mv.xyz))), 2.6);
    gl_Position = projectionMatrix * mv;
  }
`;
const shellFragment = /* glsl */ `
  varying float vFresnel;
  void main() {
    vec3 col = mix(vec3(0.03, 0.06, 0.16), vec3(0.4, 0.88, 1.0), vFresnel);
    gl_FragColor = vec4(col, 0.03 + vFresnel * 0.22);
  }
`;

function Shell({ hemi }: { hemi: -1 | 1 }) {
  const geometry = useMemo(() => buildShell(hemi, 48), [hemi]);
  const material = useMemo(
    () => new THREE.ShaderMaterial({ vertexShader: shellVertex, fragmentShader: shellFragment, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }),
    [],
  );
  useEffect(() => () => {
    geometry.dispose();
    material.dispose();
  }, [geometry, material]);
  return <mesh geometry={geometry} material={material} />;
}

// ---------------------------------------------------------------------------
// Regions
// ---------------------------------------------------------------------------

let glowTexture: THREE.Texture | null = null;
function getGlowTexture() {
  if (glowTexture) return glowTexture;
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.35, "rgba(255,255,255,0.35)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  glowTexture = new THREE.CanvasTexture(c);
  return glowTexture;
}

function RegionGlows({ mastery, finisher, filter }: { mastery: BrainData["mastery"]; finisher: boolean; filter?: Category | null }) {
  const texture = useMemo(() => getGlowTexture(), []);
  return (
    <>
      {CATEGORIES.map((c) => {
        const level = finisher ? 1 : mastery[c];
        const dim = filter && filter !== c ? 0.25 : 1;
        return (
          <sprite key={c} position={corePosition(c).multiplyScalar(0.92)} scale={0.9 + level * 0.6}>
            <spriteMaterial map={texture} color={REGION[c].color} transparent opacity={(0.06 + level * 0.32) * dim} depthWrite={false} blending={THREE.AdditiveBlending} />
          </sprite>
        );
      })}
    </>
  );
}

function Cores({ lit, interactive, filter, onFilter }: { lit: boolean; interactive: boolean; filter?: Category | null; onFilter?: (c: Category | null) => void }) {
  return (
    <>
      {CATEGORIES.map((c) => {
        const color = new THREE.Color(REGION[c].color).multiplyScalar(lit ? 3 : 1.2);
        return (
          <group key={c} position={corePosition(c)}>
            <mesh>
              <sphereGeometry args={[lit ? 0.032 : 0.022, 16, 16]} />
              <meshBasicMaterial color={color} toneMapped={false} />
            </mesh>
            {interactive && (
              <Html center position={[0, 0.14, 0]} zIndexRange={[10, 0]}>
                <button
                  onClick={() => onFilter?.(filter === c ? null : c)}
                  className={`whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-semibold backdrop-blur transition ${filter === c ? "bg-white/20" : "bg-black/40 hover:bg-white/10"}`}
                  style={{ borderColor: `${REGION[c].color}88`, color: REGION[c].color }}
                >
                  {CATEGORY_META[c].label}
                </button>
              </Html>
            )}
          </group>
        );
      })}
    </>
  );
}

// ---------------------------------------------------------------------------
// Nodes + synapses
// ---------------------------------------------------------------------------

type NodeProps = {
  node: BrainNode;
  position: THREE.Vector3;
  parentPosition: THREE.Vector3;
  parentCompleted: boolean;
  celebration: Celebration | null;
  dimmed: boolean;
  interactive: boolean;
  reducedMotion: boolean;
  onHover?: (n: BrainNode | null) => void;
  onSelect?: (n: BrainNode) => void;
};

function nodeLook(node: BrainNode, override?: Celebration | null) {
  const score = override ? override.score : node.score ?? 0;
  const verdict = override ? override.verdict : node.verdict;
  const bad = verdict === "incorrect" || verdict === "weak";
  const base = bad ? AMBER.clone() : new THREE.Color(REGION[node.category].color);
  const tier = score >= 8 ? 2 : score >= 5 ? 1 : 0;
  const intensity = [0.9, 1.8, 3.2][tier];
  return { color: base.multiplyScalar(intensity), radius: 0.013 + score * 0.0022, sparkle: tier === 2 && !bad };
}

function MindNode({ node, position, parentPosition, parentCompleted, celebration, dimmed, interactive, reducedMotion, onHover, onSelect }: NodeProps) {
  const ring = useRef<THREE.Mesh>(null);
  const core = useRef<THREE.Mesh>(null);
  const lineRef = useRef<{ material: THREE.Material & { opacity: number } } | null>(null);
  const pulse = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const completed = node.state === "completed" || Boolean(celebration);
  const look = useMemo(() => (completed ? nodeLook(node, celebration) : null), [completed, node, celebration]);
  const ignite = useRef(0);
  const firing = useRef(-1);
  const seed = useMemo(() => (node.day * 13 + node.category.length * 7) % 10, [node]);

  useEffect(() => {
    if (celebration) {
      ignite.current = 1;
      firing.current = 0;
    }
  }, [celebration]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (ring.current) {
      const s = reducedMotion ? 1 : 1 + 0.35 * (0.5 + 0.5 * Math.sin(t * 3 + seed));
      ring.current.scale.setScalar(s);
      (ring.current.material as THREE.MeshBasicMaterial).opacity = (reducedMotion ? 0.9 : 0.55 + 0.45 * Math.sin(t * 3 + seed)) * (dimmed ? 0.25 : 1);
    }
    if (core.current && look) {
      // Ignition: a burst that settles to the resting size.
      if (ignite.current > 0) ignite.current = Math.max(0, ignite.current - delta * 0.5);
      const burst = 1 + ignite.current * 2.2 * Math.abs(Math.sin(ignite.current * 6));
      const hover = hovered ? 1.6 : 1;
      core.current.scale.setScalar(burst * hover);
    }
    if (lineRef.current && completed && parentCompleted) {
      lineRef.current.material.opacity = (reducedMotion ? 0.55 : 0.4 + 0.25 * Math.sin(t * 0.8 + seed)) * (dimmed ? 0.2 : 1);
    }
    if (pulse.current) {
      if (firing.current >= 0 && firing.current <= 1) {
        firing.current += delta * 0.9;
        pulse.current.visible = true;
        pulse.current.position.lerpVectors(parentPosition, position, Math.min(1, firing.current));
      } else {
        pulse.current.visible = false;
      }
    }
  });

  const color = REGION[node.category].color;
  const handlers = interactive
    ? {
        onPointerOver: (e: { stopPropagation: () => void }) => {
          e.stopPropagation();
          setHovered(true);
          onHover?.(node);
          document.body.style.cursor = node.state === "locked" ? "default" : "pointer";
        },
        onPointerOut: () => {
          setHovered(false);
          onHover?.(null);
          document.body.style.cursor = "";
        },
        onClick: (e: { stopPropagation: () => void }) => {
          e.stopPropagation();
          if (node.state !== "locked") onSelect?.(node);
        },
      }
    : {};

  return (
    <>
      {/* Synapse from the previous node in this branch (or the core) */}
      {(completed || node.state === "available") && (
        <Line
          ref={lineRef as never}
          points={[parentPosition, position]}
          color={completed && parentCompleted ? color : "#3a4766"}
          lineWidth={completed ? 1.6 : 0.8}
          transparent
          opacity={completed ? 0.5 : 0.25}
          toneMapped={false}
          dashed={!completed}
          dashSize={0.02}
          gapSize={0.015}
        />
      )}
      <mesh ref={pulse} visible={false}>
        <sphereGeometry args={[0.02, 12, 12]} />
        <meshBasicMaterial color={new THREE.Color(color).multiplyScalar(5)} toneMapped={false} />
      </mesh>

      <group position={position}>
        {node.state === "locked" && !celebration && (
          <mesh {...handlers}>
            <sphereGeometry args={[0.008, 8, 8]} />
            <meshBasicMaterial color="#5b6478" transparent opacity={dimmed ? 0.15 : 0.45} />
          </mesh>
        )}
        {node.state === "available" && !celebration && (
          <>
            <Billboard>
              <mesh ref={ring}>
                <ringGeometry args={[0.022, 0.03, 32]} />
                <meshBasicMaterial color={new THREE.Color(color).multiplyScalar(2.2)} transparent toneMapped={false} side={THREE.DoubleSide} />
              </mesh>
            </Billboard>
            <mesh {...handlers}>
              <sphereGeometry args={[0.03, 12, 12]} />
              <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>
            <mesh>
              <sphereGeometry args={[0.008, 8, 8]} />
              <meshBasicMaterial color={color} />
            </mesh>
          </>
        )}
        {look && (
          <>
            <mesh ref={core} {...handlers}>
              <sphereGeometry args={[look.radius, 16, 16]} />
              <meshBasicMaterial color={look.color} toneMapped={false} transparent opacity={dimmed ? 0.25 : 1} />
            </mesh>
            {look.sparkle && !reducedMotion && !dimmed && <Sparkles count={6} scale={0.12} size={1.6} speed={0.6} color={color} />}
          </>
        )}
        {hovered && interactive && <NodeTooltip node={node} />}
      </group>
    </>
  );
}

function NodeTooltip({ node }: { node: BrainNode }) {
  const color = CATEGORY_META[node.category].color;
  return (
    <Html center position={[0, 0.09, 0]} zIndexRange={[20, 10]} style={{ pointerEvents: "none" }}>
      <div className="glass-strong w-52 px-3 py-2 text-xs">
        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider" style={{ color }}>
          <span>{CATEGORY_META[node.category].label}</span>
          <span>Day {node.day}</span>
        </div>
        <div className="mt-1 font-semibold text-white">{node.title}</div>
        <div className="text-white/55">{node.concept}</div>
        {node.state === "completed" ? (
          <div className="mt-1 font-mono text-white/80">
            {node.score}/10 · {node.verdict?.replace("_", " ")}
          </div>
        ) : (
          <div className="mt-1 text-white/50">{node.state === "available" ? "Ready to train" : "Locked"}</div>
        )}
      </div>
    </Html>
  );
}

// ---------------------------------------------------------------------------
// Achievements: bridges, satellites, halo
// ---------------------------------------------------------------------------

function BridgeArc({ from, to, layout, reducedMotion }: { from: { category: Category; day?: number }; to: { category: Category; day?: number }; layout: ReturnType<typeof nodeLayout>; reducedMotion: boolean }) {
  const pos = (e: { category: Category; day?: number }) =>
    e.day ? layout.find((l) => l.category === e.category && l.day === e.day)!.position : corePosition(e.category);
  const curve = useMemo(() => bridgeCurve(pos(from), pos(to)), [from, to]); // eslint-disable-line react-hooks/exhaustive-deps
  const tube = useMemo(() => new THREE.TubeGeometry(curve, 48, 0.006, 6, false), [curve]);
  const particles = useRef<THREE.Group>(null);
  const colorA = new THREE.Color(REGION[from.category].color);
  const colorB = new THREE.Color(REGION[to.category].color);
  const mid = colorA.clone().lerp(colorB, 0.5).multiplyScalar(2.6);

  useEffect(() => () => tube.dispose(), [tube]);
  useFrame((state) => {
    if (!particles.current) return;
    const t = state.clock.elapsedTime;
    particles.current.children.forEach((child, i) => {
      const u = reducedMotion ? (i + 0.5) / 4 : (t * 0.22 + i / 4) % 1;
      child.position.copy(curve.getPoint(u));
    });
  });

  return (
    <>
      <mesh geometry={tube}>
        <meshBasicMaterial color={mid} toneMapped={false} transparent opacity={0.75} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <group ref={particles}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i}>
            <sphereGeometry args={[0.016, 10, 10]} />
            <meshBasicMaterial color={(i % 2 ? colorA : colorB).clone().multiplyScalar(4)} toneMapped={false} />
          </mesh>
        ))}
      </group>
    </>
  );
}

function Satellite({ category, day, completed, score, reducedMotion }: { category: Category; day: number; completed: boolean; score: number | null; reducedMotion: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  const centre = useMemo(() => corePosition(category), [category]);
  const radius = 0.16 + (day % 5) * 0.025;
  const phase = day * 1.7;
  useFrame((state) => {
    if (!ref.current) return;
    const t = reducedMotion ? 0 : state.clock.elapsedTime * 0.6;
    const dir = centre.clone().normalize();
    const a = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 1, 0)).normalize();
    const b = new THREE.Vector3().crossVectors(a, dir).normalize();
    ref.current.position
      .copy(centre)
      .addScaledVector(dir, 0.08)
      .addScaledVector(a, Math.cos(t + phase) * radius)
      .addScaledVector(b, Math.sin(t + phase) * radius);
  });
  const color = new THREE.Color(REGION[category].color).multiplyScalar(completed ? 1.5 + (score ?? 0) * 0.15 : 0.8);
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[completed ? 0.016 : 0.011, 12, 12]} />
      <meshBasicMaterial color={color} toneMapped={false} transparent opacity={completed ? 1 : 0.6} />
    </mesh>
  );
}

function Halo({ reducedMotion }: { reducedMotion: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current && !reducedMotion) ref.current.rotation.z += delta * 0.15;
  });
  return (
    <mesh ref={ref} rotation={[Math.PI / 2 - 0.55, 0.25, 0]}>
      <torusGeometry args={[1.35, 0.004, 8, 160]} />
      <meshBasicMaterial color={new THREE.Color("#6fe7ff").multiplyScalar(2.2)} toneMapped={false} transparent opacity={0.7} />
    </mesh>
  );
}
