// Procedural brain geometry: two folded hemispheres, region cores and skill-tree node layout.
// Everything is deterministic (seeded), so node positions stay put between renders and devices.
import * as THREE from "three";
import { CATEGORIES, type Category } from "@/lib/types";

export const HEMI_OFFSET = 0.56; // centre of each hemisphere on the x axis (the gap sits between them)
const RADII = { x: 0.55, y: 0.74, z: 1.0 };

// ---------------------------------------------------------------------------
// Seeded randomness + value noise
// ---------------------------------------------------------------------------

export function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash3(x: number, y: number, z: number): number {
  let h = (x * 374761393 + y * 668265263 + z * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function valueNoise(x: number, y: number, z: number): number {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = fade(x - xi), yf = fade(y - yi), zf = fade(z - zi);
  const c = (dx: number, dy: number, dz: number) => hash3(xi + dx, yi + dy, zi + dz);
  return (
    lerp(
      lerp(lerp(c(0, 0, 0), c(1, 0, 0), xf), lerp(c(0, 1, 0), c(1, 1, 0), xf), yf),
      lerp(lerp(c(0, 0, 1), c(1, 0, 1), xf), lerp(c(0, 1, 1), c(1, 1, 1), xf), yf),
      zf,
    ) * 2 - 1
  );
}

/** Ridged multi-octave noise: sharp crests read as gyri, valleys as sulci. */
function folds(x: number, y: number, z: number): number {
  let sum = 0, amp = 0.6, freq = 3.1, norm = 0;
  for (let o = 0; o < 3; o++) {
    const n = 1 - Math.abs(valueNoise(x * freq, y * freq, z * freq));
    sum += n * n * amp;
    norm += amp;
    amp *= 0.5;
    freq *= 2.1;
  }
  return sum / norm; // 0..1
}

// ---------------------------------------------------------------------------
// Surface
// ---------------------------------------------------------------------------

/** Point on the folded surface of a hemisphere (hemi = -1 left, +1 right) in direction dir. */
export function surfacePoint(hemi: -1 | 1, dir: THREE.Vector3, lift = 0, out = new THREE.Vector3()): THREE.Vector3 {
  const d = dir;
  const inward = d.x * hemi < 0;
  let rx = RADII.x * (inward ? 0.88 : 1);
  let ry = RADII.y * (d.y < 0 ? 0.72 : 1);
  let rz = RADII.z * (d.z > 0 ? 0.96 : 1.02);
  // Temporal lobe: bulge outward and down at the lower sides.
  const temporal = Math.max(0, 1 - Math.abs(d.y + 0.35) * 3) * Math.max(0, 1 - Math.abs(d.z - 0.1) * 1.6) * (inward ? 0 : 1);
  rx *= 1 + 0.12 * temporal;
  ry *= 1 + 0.06 * temporal;
  // Frontal lobe a touch narrower and lower.
  if (d.z > 0.5) {
    rx *= 1 - 0.08 * (d.z - 0.5);
    ry *= 1 - 0.1 * (d.z - 0.5);
  }
  out.set(d.x * rx, d.y * ry, d.z * rz);
  const f = folds(out.x + hemi * 3.7, out.y, out.z);
  const scale = 1 + 0.07 * (f - 0.5) + lift;
  out.multiplyScalar(scale);
  out.x += hemi * HEMI_OFFSET;
  return out;
}

function randomDir(rand: () => number, out = new THREE.Vector3()): THREE.Vector3 {
  const u = rand() * 2 - 1;
  const t = rand() * Math.PI * 2;
  const s = Math.sqrt(1 - u * u);
  return out.set(s * Math.cos(t), u, s * Math.sin(t));
}

// ---------------------------------------------------------------------------
// Regions
// ---------------------------------------------------------------------------

export const REGION: Record<Category, { hemi: -1 | 1; dir: THREE.Vector3; color: string }> = {
  logic: { hemi: -1, dir: new THREE.Vector3(-0.5, 0.55, 0.66).normalize(), color: "#5b9cff" },
  analytical: { hemi: -1, dir: new THREE.Vector3(-0.78, 0.05, -0.62).normalize(), color: "#2ec4a0" },
  critical: { hemi: 1, dir: new THREE.Vector3(0.5, 0.55, 0.66).normalize(), color: "#ff8a4c" },
  creative: { hemi: 1, dir: new THREE.Vector3(0.78, 0.05, -0.62).normalize(), color: "#c77dff" },
};

export const corePosition = (c: Category) => surfacePoint(REGION[c].hemi, REGION[c].dir, 0.035);

// ---------------------------------------------------------------------------
// Point cloud
// ---------------------------------------------------------------------------

export type CloudData = {
  positions: Float32Array;
  sizes: Float32Array;
  rands: Float32Array;
  tints: Float32Array; // rgb of the nearest region colour, scaled by proximity
  masks: Float32Array; // vec4 one-hot (logic, analytical, critical, creative) * proximity
};

export function buildCloud(count: number): CloudData {
  const rand = mulberry32(1337);
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const rands = new Float32Array(count);
  const tints = new Float32Array(count * 3);
  const masks = new Float32Array(count * 4);
  const dir = new THREE.Vector3();
  const p = new THREE.Vector3();
  const colors = CATEGORIES.map((c) => new THREE.Color(REGION[c].color));

  const cerebellum = Math.floor(count * 0.06);
  for (let i = 0; i < count; i++) {
    randomDir(rand, dir);
    if (i < cerebellum) {
      // Small cerebellum tucked under the back of the brain.
      p.set(dir.x * 0.5, dir.y * 0.26 - 0.5, dir.z * 0.32 - 0.68);
      const ridge = 1 + 0.05 * Math.sin(dir.y * 40);
      p.multiplyScalar(ridge);
    } else {
      const hemi: -1 | 1 = rand() < 0.5 ? -1 : 1;
      dir.x = Math.abs(dir.x) * hemi * (rand() < 0.88 ? 1 : -1);
      surfacePoint(hemi, dir, -rand() * 0.05, p);
      // Mark proximity to the hemisphere's two regions.
      CATEGORIES.forEach((c, ci) => {
        if (REGION[c].hemi !== hemi) return;
        const prox = Math.max(0, (dir.dot(REGION[c].dir) - 0.55) / 0.45);
        if (prox > masks[i * 4 + ci]) {
          masks[i * 4 + ci] = prox;
          tints[i * 3] = colors[ci].r * prox;
          tints[i * 3 + 1] = colors[ci].g * prox;
          tints[i * 3 + 2] = colors[ci].b * prox;
        }
      });
    }
    positions.set([p.x, p.y, p.z], i * 3);
    sizes[i] = 0.6 + rand() * 1.1;
    rands[i] = rand();
  }
  return { positions, sizes, rands, tints, masks };
}

/** Displaced sphere geometry for the faint translucent shell of one hemisphere. */
export function buildShell(hemi: -1 | 1, detail = 64): THREE.BufferGeometry {
  const geo = new THREE.SphereGeometry(1, detail * 1.5, detail);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const dir = new THREE.Vector3();
  const p = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    dir.fromBufferAttribute(pos, i).normalize();
    surfacePoint(hemi, dir, 0.01, p);
    pos.setXYZ(i, p.x, p.y, p.z);
  }
  geo.computeVertexNormals();
  return geo;
}

// ---------------------------------------------------------------------------
// Skill-tree layout: 30 nodes per region on three branches growing out from the core
// ---------------------------------------------------------------------------

export type NodeLayout = { category: Category; day: number; position: THREE.Vector3; parent: THREE.Vector3; parentDay: number | null };

export function nodeLayout(): NodeLayout[] {
  const out: NodeLayout[] = [];
  const up = new THREE.Vector3(0, 1, 0);
  CATEGORIES.forEach((category, ci) => {
    const { hemi, dir: core } = REGION[category];
    const t1 = new THREE.Vector3().crossVectors(core, up).normalize();
    const t2 = new THREE.Vector3().crossVectors(t1, core).normalize();
    const corePos = corePosition(category);
    const positions: THREE.Vector3[] = [];
    for (let day = 1; day <= 30; day++) {
      const branch = (day - 1) % 3;
      const depth = Math.floor((day - 1) / 3);
      const theta = branch * ((Math.PI * 2) / 3) + ci * 0.7 + 0.32 * Math.sin(depth * 1.25 + branch * 2.1);
      const s = 0.07 + 0.058 * depth;
      const d = core
        .clone()
        .addScaledVector(t1, Math.cos(theta) * s)
        .addScaledVector(t2, Math.sin(theta) * s)
        .normalize();
      if (d.x * hemi < 0.06) {
        d.x = hemi * 0.06;
        d.normalize();
      }
      const position = surfacePoint(hemi, d, 0.03);
      positions.push(position);
      const parentDay = day <= 3 ? null : day - 3;
      out.push({ category, day, position, parent: parentDay ? positions[parentDay - 1] : corePos, parentDay });
    }
  });
  return out;
}

/** Arc between two points that lifts over the brain (used for cross-skill bridges). */
export function bridgeCurve(a: THREE.Vector3, b: THREE.Vector3): THREE.QuadraticBezierCurve3 {
  const mid = a.clone().add(b).multiplyScalar(0.5);
  const lift = 0.45 + a.distanceTo(b) * 0.35;
  const control = mid.clone().add(mid.clone().normalize().multiplyScalar(lift)).add(new THREE.Vector3(0, lift * 0.6, 0));
  return new THREE.QuadraticBezierCurve3(a.clone(), control, b.clone());
}
