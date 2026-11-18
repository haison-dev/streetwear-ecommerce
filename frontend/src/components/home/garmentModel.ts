import * as THREE from 'three';

export type GarmentKind = 'tee' | 'hoodie' | 'cargo' | 'jacket';
type Point = [number, number];

const tee: Point[] = [
  [-0.27, -0.62], [-0.51, -0.63], [-0.9, -0.85], [-1.17, -1.34],
  [-0.76, -1.56], [-0.63, -1.31], [-0.65, -2.54], [-0.38, -2.61],
  [0.37, -2.62], [0.65, -2.55], [0.63, -1.31], [0.76, -1.56],
  [1.17, -1.34], [0.9, -0.85], [0.51, -0.63], [0.27, -0.62],
  [0.19, -0.79], [0, -0.86], [-0.19, -0.79],
];

const outerwear: Point[] = [
  [-0.3, -0.65], [-0.57, -0.67], [-0.91, -0.91], [-1.15, -2.22],
  [-0.85, -2.38], [-0.65, -1.58], [-0.65, -2.56], [-0.38, -2.63],
  [0.39, -2.63], [0.65, -2.56], [0.65, -1.58], [0.85, -2.38],
  [1.15, -2.22], [0.91, -0.91], [0.57, -0.67], [0.3, -0.65],
  [0.15, -0.76], [0, -0.79], [-0.15, -0.76],
];

const cargo: Point[] = [
  [-0.59, -0.69], [0.59, -0.69], [0.66, -1.27], [0.6, -2.12],
  [0.56, -2.92], [0.12, -2.95], [0.06, -2.15], [0, -1.65],
  [-0.06, -2.15], [-0.12, -2.95], [-0.56, -2.92], [-0.6, -2.12], [-0.66, -1.27],
];

const colors: Record<GarmentKind, [string, string]> = {
  tee: ['#dbcfb5', '#b3a589'],
  hoodie: ['#363837', '#272928'],
  cargo: ['#74795d', '#5b6047'],
  jacket: ['#9a583f', '#754332'],
};

export function createGarment(kind: GarmentKind) {
  const group = new THREE.Group();
  const [base, trim] = colors[kind];
  const cloth = new THREE.MeshStandardMaterial({ color: base, roughness: 0.94 });
  const seam = new THREE.MeshStandardMaterial({ color: trim, roughness: 0.95 });
  const metal = new THREE.MeshStandardMaterial({ color: '#424643', metalness: 0.52, roughness: 0.42 });
  const label = new THREE.MeshStandardMaterial({ color: '#ded6c4', roughness: 1 });

  function panel(points: Point[], material: THREE.Material, depth: number, bevel: number, z = 0) {
    const shape = new THREE.Shape(points.map(([x, y]) => new THREE.Vector2(x, y)));
    shape.closePath();
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth,
      steps: 1,
      bevelSize: bevel,
      bevelThickness: bevel,
      bevelSegments: 4,
    });
    geometry.translate(0, 0, z);
    group.add(new THREE.Mesh(geometry, material));
  }

  function line(points: [number, number, number][], material: THREE.Material, radius = 0.014) {
    const curve = new THREE.CatmullRomCurve3(points.map(([x, y, z]) => new THREE.Vector3(x, y, z)));
    group.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 24, radius, 6, false), material));
  }

  line([[-0.13, -0.12, 0], [-0.11, -0.01, 0], [0.04, 0, 0], [0.11, -0.13, 0], [0.01, -0.27, 0], [0, -0.36, 0]], metal, 0.024);
  if (kind === 'cargo') {
    line([[0, -0.36, 0], [0, -0.5, 0], [-0.63, -0.5, 0]], metal, 0.023);
    line([[0, -0.5, 0], [0.63, -0.5, 0]], metal, 0.023);
    for (const side of [-1, 1]) {
      panel([[side * 0.4, -0.5], [side * 0.54, -0.5], [side * 0.54, -0.79], [side * 0.4, -0.79]], metal, 0.07, 0.018);
    }
    panel(cargo, cloth, 0.19, 0.05);
    panel([[-0.57, -0.71], [0.57, -0.71], [0.59, -0.86], [-0.59, -0.86]], seam, 0.035, 0.018, 0.19);
    for (const side of [-1, 1]) {
      panel([[side * 0.29, -1.43], [side * 0.59, -1.43], [side * 0.56, -1.93], [side * 0.27, -1.93]], seam, 0.047, 0.024, 0.19);
      line([[side * 0.29, -1.53, 0.27], [side * 0.45, -1.55, 0.27], [side * 0.59, -1.53, 0.27]], cloth);
      line([[side * 0.5, -2.04, 0.225], [side * 0.48, -2.47, 0.225], [side * 0.45, -2.87, 0.225]], seam, 0.011);
    }
  } else {
    line([[0, -0.34, -0.03], [-0.33, -0.54, -0.03], [-0.7, -0.7, -0.03], [-0.51, -0.78, -0.03], [0.51, -0.78, -0.03], [0.7, -0.7, -0.03], [0.33, -0.54, -0.03], [0, -0.34, -0.03]], metal, 0.024);
    panel(kind === 'tee' ? tee : outerwear, cloth, 0.2, 0.075);
    if (kind === 'tee') {
      line([[-0.28, -0.64, 0.211], [-0.19, -0.83, 0.239], [0, -0.89, 0.25], [0.19, -0.83, 0.239], [0.28, -0.64, 0.211]], seam, 0.026);
      panel([[0.19, -1.13], [0.5, -1.13], [0.5, -1.16], [0.19, -1.16]], seam, 0.02, 0.005, 0.2);
    } else if (kind === 'hoodie') {
      panel([[-0.36, -0.79], [-0.39, -0.53], [-0.29, -0.32], [0, -0.26], [0.28, -0.32], [0.39, -0.55], [0.36, -0.8], [0, -0.98]], seam, 0.13, 0.07, 0.04);
      panel([[-0.27, -0.62], [-0.15, -0.45], [0.16, -0.45], [0.28, -0.62], [0.15, -0.79], [0, -0.84], [-0.15, -0.79]], cloth, 0.026, 0.046, 0.2);
      panel([[-0.26, -1.83], [0.26, -1.83], [0.42, -2.04], [0.39, -2.27], [-0.39, -2.27], [-0.42, -2.04]], seam, 0.035, 0.027, 0.2);
      for (const side of [-1, 1]) {
        line([[side * 0.17, -0.8, 0.26], [side * 0.19, -1.01, 0.28], [side * 0.16, -1.2, 0.27]], label, 0.011);
      }
    } else {
      panel([[-0.36, -0.62], [-0.22, -0.53], [0, -0.75], [-0.22, -0.96]], seam, 0.04, 0.027, 0.195);
      panel([[0.36, -0.62], [0.22, -0.53], [0, -0.75], [0.22, -0.96]], seam, 0.04, 0.027, 0.195);
      line([[0, -0.83, 0.225], [0, -1.55, 0.225], [0, -2.55, 0.225]], seam, 0.024);
      for (const side of [-1, 1]) {
        panel([[side * 0.21, -1.2], [side * 0.49, -1.2], [side * 0.48, -1.53], [side * 0.22, -1.53]], seam, 0.024, 0.019, 0.2);
      }
      for (const y of [-1.02, -1.46, -1.9, -2.34]) {
        const button = new THREE.Mesh(new THREE.SphereGeometry(0.025, 10, 8), metal);
        button.position.set(0, y, 0.255);
        group.add(button);
      }
    }
    line([[-0.58, -2.53, 0.22], [-0.32, -2.57, 0.23], [0.34, -2.57, 0.23], [0.58, -2.53, 0.22]], seam);
  }

  // Keep unused detail materials in the same cleanup path as the meshes.
  return { group, materials: [cloth, seam, metal, label] };
}
