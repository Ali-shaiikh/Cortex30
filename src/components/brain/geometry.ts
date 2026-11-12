// Procedural brain geometry: two folded hemispheres, region cores and skill-tree node layout.
// Everything is deterministic (seeded), so node positions stay put between renders and devices.
import * as THREE from "three";
import { CATEGORIES, type Category } from "@/lib/types";

// Hemispheres touch along the midline, separated only by a thin longitudinal fissure.
export const HEMI_OFFSET = 0.03;
// Real proportions (length 1): width ≈ 0.84, height ≈ 0.62. Each hemisphere is half the width.
const RADII = { x: 0.44, yTop: 0.66, yBottom: 0.36, zFront: 0.92, zBack: 1.0 };

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

/**
 * Gyri: domain-warped ridged noise. Warping bends the ridges into long winding "worms" like real
 * cortical folds; ridging makes sharp crests (gyri) and narrow valleys (sulci). Returns 0..1.
 */
function folds(x: number, y: number, z: number): number {
  const w = 0.55;
  const wx = x + w * valueNoise(x * 1.7 + 11, y * 1.7, z * 1.7);
  const wy = y + w * valueNoise(x * 1.7, y * 1.7 + 23, z * 1.7);
  const wz = z + w * valueNoise(x * 1.7, y * 1.7, z * 1.7 + 37);
  let sum = 0, amp = 0.7, freq = 4.2, norm = 0;
  for (let o = 0; o < 2; o++) {
    const n = 1 - Math.abs(valueNoise(wx * freq, wy * freq, wz * freq));
    sum += Math.pow(n, 3) * amp;
    norm += amp;
    amp *= 0.45;
    freq *= 2.2;
  }
  return sum / norm;
}

// ---------------------------------------------------------------------------
// Surface
// ---------------------------------------------------------------------------

/** Fold height (0 = deep sulcus, 1 = gyrus crest) at a hemisphere direction. */
export function foldAt(hemi: -1 | 1, d: THREE.Vector3): number {
  return folds(d.x * RADII.x + hemi * 3.7, d.y * RADII.yTop, d.z);
}

const smooth = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

/**
 * Point on the folded surface of a hemisphere (hemi = -1 left, +1 right) in direction dir.
 * Shapes a real cerebrum: flat medial wall, domed top, rounded frontal lobe, tapered occipital lobe,
 * flat orbital underside, a temporal lobe hanging below the deep lateral (Sylvian) fissure.
 */
export function surfacePoint(hemi: -1 | 1, dir: THREE.Vector3, lift = 0, out = new THREE.Vector3()): THREE.Vector3 {
  const d = dir;
  const lateral = d.x * hemi; // > 0 outer side, < 0 medial side
  // Medial wall is almost flat so the two hemispheres sit flush against each other.
  let rx = lateral < 0 ? RADII.x * 0.1 : RADII.x;
  let ry = d.y >= 0 ? RADII.yTop : RADII.yBottom;
  const rz = d.z >= 0 ? RADII.zFront : RADII.zBack;

  // Width is greatest towards the back (parietal), narrower at the frontal pole.
  rx *= 1 - 0.12 * smooth(0.3, 1, d.z) + 0.05 * smooth(-0.2, -0.7, d.z) * (1 - smooth(-0.8, -1, d.z));
  // Occipital pole tapers; top is flatter at the back.
  if (d.z < -0.6) ry *= 1 - 0.25 * smooth(-0.6, -1, d.z);
  // Frontal lobe: rounded front, flat orbital underside.
  if (d.z > 0.3 && d.y < 0) ry *= 1 - 0.35 * smooth(0.3, 0.9, d.z);
  // Temporal lobe: bulges down and out in the lower-lateral middle.
  const temporal = lateral > 0 ? smooth(-0.05, -0.55, d.y) * (1 - smooth(0.15, 0.65, Math.abs(d.z - 0.05))) : 0;
  ry *= 1 + 0.55 * temporal;
  rx *= 1 + 0.12 * temporal;

  out.set(d.x * rx, d.y * ry, d.z * rz);

  // Lateral (Sylvian) fissure: a deep groove running back and up along the side, above the temporal lobe.
  let groove = 0;
  if (lateral > 0.2 && d.z > -0.55 && d.z < 0.75) {
    const line = -0.12 + 0.3 * (0.3 - d.z); // fissure height as it climbs towards the back
    groove = Math.exp(-Math.pow((d.y - line) / 0.05, 2)) * smooth(0.2, 0.5, lateral);
  }
  // Longitudinal fissure: the top edge of the medial wall rolls inward.
  const crest = lateral < 0.15 && d.y > 0 ? smooth(0.15, -0.05, lateral) * 0.04 : 0;

  const f = folds(out.x + hemi * 3.7, out.y, out.z);
  const scale = 1 + 0.1 * (f - 0.32) - 0.09 * groove - crest + lift;
  out.multiplyScalar(scale);
  out.x += hemi * HEMI_OFFSET;
  return out;
}

/** Cerebellum: a wide ridged dome tucked under the occipital lobe, with a shallow midline notch. */
export function cerebellumPoint(d: THREE.Vector3, out = new THREE.Vector3()): THREE.Vector3 {
  const notch = 1 - 0.18 * Math.exp(-Math.pow(d.x / 0.18, 2)) * (d.z < 0 ? 1 : 0.3);
  const ridges = 1 + 0.035 * Math.sin(d.y * 46 + d.z * 6); // fine horizontal folia
  out.set(d.x * 0.56 * notch, d.y * 0.29, d.z * 0.34).multiplyScalar(ridges);
  out.y -= 0.3;
  out.z -= 0.6;
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
  folds: Float32Array; // 0 = sulcus, 1 = gyrus crest
  tints: Float32Array; // rgb of the nearest region colour, scaled by proximity
  masks: Float32Array; // vec4 one-hot (logic, analytical, critical, creative) * proximity
};

export function buildCloud(count: number): CloudData {
  const rand = mulberry32(1337);
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const rands = new Float32Array(count);
  const foldValues = new Float32Array(count).fill(0.5);
  const tints = new Float32Array(count * 3);
  const masks = new Float32Array(count * 4);
  const dir = new THREE.Vector3();
  const p = new THREE.Vector3();
  const colors = CATEGORIES.map((c) => new THREE.Color(REGION[c].color));

  const cerebellum = Math.floor(count * 0.11);
  const stem = Math.floor(count * 0.025);
  for (let i = 0; i < count; i++) {
    randomDir(rand, dir);
    if (i < cerebellum) {
      cerebellumPoint(dir, p);
      foldValues[i] = 0.5 + 0.5 * Math.sin(dir.y * 46 + dir.z * 6);
    } else if (i < cerebellum + stem) {
      // Brainstem: a short tapered column dropping from under the centre.
      const t = rand();
      const a = rand() * Math.PI * 2;
      const r = 0.11 - 0.03 * t;
      p.set(Math.cos(a) * r, -0.18 - t * 0.55, -0.22 - t * 0.12 + Math.sin(a) * r * 0.9);
      foldValues[i] = 0.35;
    } else {
      const hemi: -1 | 1 = rand() < 0.5 ? -1 : 1;
      // Rejection-sample towards gyrus crests so the folds read as glowing ridges.
      for (let tries = 0; tries < 6; tries++) {
        randomDir(rand, dir);
        dir.x = Math.abs(dir.x) * hemi * (rand() < 0.88 ? 1 : -1);
        foldValues[i] = foldAt(hemi, dir);
        if (rand() < Math.min(1, (foldValues[i] - 0.12) * 2)) break; // median fold ≈ 0.31
      }
      surfacePoint(hemi, dir, -rand() * 0.03, p);
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
  return { positions, sizes, rands, folds: foldValues, tints, masks };
}

/** Displaced sphere geometry for the cerebellum's translucent shell. */
export function buildCerebellumShell(detail = 32): THREE.BufferGeometry {
  const geo = new THREE.SphereGeometry(1, detail * 1.5, detail);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const dir = new THREE.Vector3();
  const p = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    dir.fromBufferAttribute(pos, i).normalize();
    cerebellumPoint(dir, p);
    pos.setXYZ(i, p.x, p.y, p.z);
  }
  geo.computeVertexNormals();
  return geo;
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
