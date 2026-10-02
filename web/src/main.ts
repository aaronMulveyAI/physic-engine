import "./style.css";

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import type { PhysicsSnapshot } from "./engine/PhysicsSnapshot";
import { Vec2 } from "./engine/Vec2";
import { GolfPhysicsEngine } from "./golf/GolfPhysicsEngine";
import { SpacePhysicsEngine } from "./space/SpacePhysicsEngine";

const canvas = requireElement<HTMLCanvasElement>("#scene");
const telemetry = requireElement<HTMLDListElement>("#telemetry");
const angleInput = requireElement<HTMLInputElement>("#angle");
const powerInput = requireElement<HTMLInputElement>("#power");
const angleValue = requireElement<HTMLOutputElement>("#angleValue");
const powerValue = requireElement<HTMLOutputElement>("#powerValue");
const hitButton = requireElement<HTMLButtonElement>("#hit");
const resetButton = requireElement<HTMLButtonElement>("#reset");
const stateText = requireElement<HTMLElement>("#state");
const strokesText = requireElement<HTMLElement>("#strokes");
const countLabel = requireElement<HTMLElement>("#countLabel");
const equations = requireElement<HTMLElement>("#equations");
const demoTitle = requireElement<HTMLElement>("#demoTitle");
const demoIntro = requireElement<HTMLElement>("#demoIntro");
const golfModeButton = requireElement<HTMLButtonElement>("#golfMode");
const spaceModeButton = requireElement<HTMLButtonElement>("#spaceMode");
const angleLabel = requireElement<HTMLElement>("#angleLabel");
const powerLabel = requireElement<HTMLElement>("#powerLabel");
const architectureList = requireElement<HTMLOListElement>("#architectureList");

const verticalScale = 2.2;
const terrainSize = 12;
const terrainSegments = 120;
const engine = new GolfPhysicsEngine();
const spaceEngine = new SpacePhysicsEngine();
type SimulationMode = "golf" | "space";
let activeMode: SimulationMode = "golf";

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.setClearColor(0xc9d6df);

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xc9d6df, 13, 26);

const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
camera.position.set(6.8, 7.2, 9.2);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(1, 0.3, 0.4);
controls.maxPolarAngle = Math.PI * 0.48;
controls.minDistance = 5;
controls.maxDistance = 18;

scene.add(new THREE.HemisphereLight(0xf5fbff, 0x475139, 2.3));

const sun = new THREE.DirectionalLight(0xffffff, 2.6);
sun.position.set(-5, 9, 4);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
scene.add(sun);

const terrain = createTerrain();
terrain.receiveShadow = true;
scene.add(terrain);

const water = createWater();
scene.add(water);

const sand = createSand();
scene.add(sand);

const target = createTarget();
scene.add(target);

const ball = createBall();
scene.add(ball);

const aimLine = createAimLine();
scene.add(aimLine);

const trajectoryLine = createTrajectoryLine();
scene.add(trajectoryLine);

const gravityArrow = createVectorArrow(0x4f7fd9);
const frictionArrow = createVectorArrow(0xd49b2f);
const accelerationArrow = createVectorArrow(0xd94f56);
scene.add(gravityArrow, frictionArrow, accelerationArrow);

const golfGroup = new THREE.Group();
golfGroup.add(terrain, water, sand, target, ball, aimLine, trajectoryLine, gravityArrow, frictionArrow, accelerationArrow);
scene.add(golfGroup);

const spaceGroup = new THREE.Group();
const starField = createStarField();
const planetA = createPlanet(spaceEngine.world.departure.color, spaceEngine.world.departure.radius);
const planetB = createPlanet(spaceEngine.world.destination.color, spaceEngine.world.destination.radius);
const arrivalRing = createArrivalRing();
const orbitRingA = createOrbitGuide(spaceEngine.world.departureOrbitRadius, 0x6bb8ff);
const orbitRingB = createOrbitGuide(spaceEngine.world.destinationOrbitRadius, 0xffb36b);
const rocket = createRocket();
const spaceAimLine = createAimLine(0x75d0ff);
const spaceTrajectoryLine = createTrajectoryLine(0xced8ff, 0.82);
const spaceGravityArrow = createVectorArrow(0x75d0ff);
const spaceAccelerationArrow = createVectorArrow(0xff6b6b);
spaceGroup.add(
  starField,
  orbitRingA,
  orbitRingB,
  planetA,
  planetB,
  arrivalRing,
  rocket,
  spaceAimLine,
  spaceTrajectoryLine,
  spaceGravityArrow,
  spaceAccelerationArrow,
);
scene.add(spaceGroup);
spaceGroup.visible = false;

const clock = new THREE.Clock();
let accumulator = 0;
let trajectoryPoints: THREE.Vector3[] = [];
let spaceTrajectoryPoints: THREE.Vector3[] = [];

hitButton.addEventListener("click", () => hitBall());
resetButton.addEventListener("click", () => resetDemo());
angleInput.addEventListener("input", () => updateControls());
powerInput.addEventListener("input", () => updateControls());
golfModeButton.addEventListener("click", () => setMode("golf"));
spaceModeButton.addEventListener("click", () => setMode("space"));

window.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    event.preventDefault();
    hitBall();
  }

  if (event.key.toLowerCase() === "r") {
    resetDemo();
  }
});

window.addEventListener("resize", resize);

setMode("golf");
resize();
renderer.setAnimationLoop(animate);

function animate(): void {
  const frameDt = Math.min(clock.getDelta(), 0.05);
  accumulator += frameDt;
  const dt = activeMode === "golf" ? engine.fixedTimeStep : spaceEngine.fixedTimeStep;

  while (accumulator >= dt) {
    if (activeMode === "golf" && engine.isMoving) {
      engine.step(dt);
      appendTrajectoryPoint(engine.snapshot);
    }
    if (activeMode === "space" && spaceEngine.isMoving) {
      spaceEngine.step(dt);
      appendSpaceTrajectoryPoint(spaceEngine.snapshot);
    }
    accumulator -= dt;
  }

  controls.update();
  if (activeMode === "golf") {
    updateGolfVisuals(engine.snapshot);
  } else {
    updateSpaceVisuals(spaceEngine.snapshot);
  }
  renderer.render(scene, camera);
}

function hitBall(): void {
  if (activeMode === "golf" && engine.isMoving) {
    return;
  }

  if (activeMode === "space" && spaceEngine.isMoving) {
    return;
  }

  if (activeMode === "golf") {
    engine.hit(Number(angleInput.value), Number(powerInput.value));
    trajectoryPoints = [toGolfWorld(engine.ball.position, engine.course.heightAt(engine.ball.position) + 0.08)];
    updateTrajectoryLine(trajectoryLine, trajectoryPoints);
  } else {
    spaceEngine.launch(Number(angleInput.value), Number(powerInput.value));
    spaceTrajectoryPoints = [toSpaceWorld(spaceEngine.rocket.position)];
    updateTrajectoryLine(spaceTrajectoryLine, spaceTrajectoryPoints);
  }
}

function resetDemo(): void {
  if (activeMode === "golf") {
    engine.reset();
    trajectoryPoints = [];
    updateTrajectoryLine(trajectoryLine, trajectoryPoints);
    updateGolfVisuals(engine.snapshot);
  } else {
    spaceEngine.reset();
    spaceTrajectoryPoints = [];
    updateTrajectoryLine(spaceTrajectoryLine, spaceTrajectoryPoints);
    updateSpaceVisuals(spaceEngine.snapshot);
  }
}

function setMode(mode: SimulationMode): void {
  activeMode = mode;
  accumulator = 0;
  golfGroup.visible = mode === "golf";
  spaceGroup.visible = mode === "space";
  golfModeButton.classList.toggle("active", mode === "golf");
  golfModeButton.setAttribute("aria-pressed", String(mode === "golf"));
  spaceModeButton.classList.toggle("active", mode === "space");
  spaceModeButton.setAttribute("aria-pressed", String(mode === "space"));

  if (mode === "golf") {
    renderer.setClearColor(0xc9d6df);
    scene.fog = new THREE.Fog(0xc9d6df, 13, 26);
    camera.position.set(6.8, 7.2, 9.2);
    controls.target.set(1, 0.3, 0.4);
    controls.maxPolarAngle = Math.PI * 0.48;
    angleInput.value = "18";
    powerInput.min = "0.4";
    powerInput.max = "5";
    powerInput.step = "0.1";
    powerInput.value = "3.2";
    demoTitle.textContent = "Golf Physics Engine";
    demoIntro.textContent =
      "A small custom physics engine rendered as a playable 3D golf demo, with the live solver exposed frame by frame.";
    angleLabel.textContent = "Angle";
    powerLabel.textContent = "Power";
    hitButton.textContent = "Hit";
    countLabel.textContent = "STROKES";
    renderArchitecture([
      ["World", "height field, target, water and sand zones"],
      ["Body", "position, velocity, mass and speed cap"],
      ["Forces", "gravity from slope plus kinetic/static friction"],
      ["Integrator", engine.integratorName],
      ["Telemetry", "snapshot exported every frame for the UI"],
    ]);
    updateControls();
    updateGolfVisuals(engine.snapshot);
  } else {
    renderer.setClearColor(0x070b18);
    scene.fog = null;
    camera.position.set(0, 7.8, 8.4);
    controls.target.set(0, 0, 0.2);
    controls.maxPolarAngle = Math.PI * 0.52;
    angleInput.value = "24";
    powerInput.min = "0.4";
    powerInput.max = "7";
    powerInput.step = "0.1";
    powerInput.value = "3.1";
    demoTitle.textContent = "Space Transfer Engine";
    demoIntro.textContent =
      "The same engine shape now drives a rocket transfer between two planets with live gravity, energy and trajectory telemetry.";
    angleLabel.textContent = "Launch angle";
    powerLabel.textContent = "Launch speed";
    hitButton.textContent = "Launch";
    countLabel.textContent = "ATTEMPTS";
    renderArchitecture([
      ["World", "two fixed planets with mass, radius and arrival zone"],
      ["Body", "rocket position, velocity, mass and speed cap"],
      ["Forces", "summed inverse-square gravity from both planets"],
      ["Integrator", spaceEngine.integratorName],
      ["Telemetry", "trajectory and energy snapshot every frame"],
    ]);
    updateControls();
    updateSpaceVisuals(spaceEngine.snapshot);
  }
}

function renderArchitecture(rows: string[][]): void {
  architectureList.replaceChildren(
    ...rows.map(([label, value]) => {
      const item = document.createElement("li");
      const title = document.createElement("strong");
      const description = document.createElement("span");
      title.textContent = label;
      description.textContent = value;
      item.append(title, description);
      return item;
    }),
  );
}

function updateControls(): void {
  angleValue.value = `${Number(angleInput.value).toFixed(0)} deg`;
  powerValue.value = `${Number(powerInput.value).toFixed(1)} m/s`;
  if (activeMode === "golf") {
    updateGolfAimLine();
  } else {
    updateSpaceAimLine();
  }
}

function updateGolfVisuals(snapshot: PhysicsSnapshot): void {
  const ballPosition = toGolfWorld(snapshot.position, snapshot.height);
  ball.position.copy(ballPosition);
  target.position.copy(toGolfWorld(engine.course.target, engine.course.heightAt(engine.course.target) + 0.035));
  updateGolfAimLine();
  updateGolfVectorArrows(snapshot);
  renderGolfTelemetry(snapshot);
  renderGolfEquations(snapshot);
  stateText.textContent = snapshot.state;
  strokesText.textContent = String(engine.strokes);
  hitButton.disabled = engine.isMoving;
}

function updateSpaceVisuals(snapshot: PhysicsSnapshot): void {
  planetA.position.copy(toSpaceWorld(spaceEngine.world.departure.position));
  planetB.position.copy(toSpaceWorld(spaceEngine.world.destination.position));
  arrivalRing.position.copy(toSpaceWorld(spaceEngine.world.destination.position));
  orbitRingA.position.copy(toSpaceWorld(spaceEngine.world.departure.position));
  orbitRingB.position.copy(toSpaceWorld(spaceEngine.world.destination.position));
  rocket.position.copy(toSpaceWorld(snapshot.position));
  rocket.lookAt(toSpaceWorld(snapshot.position.add(snapshot.velocity.normalized())));
  updateSpaceAimLine();
  updateSpaceVectorArrows(snapshot);
  renderSpaceTelemetry(snapshot);
  renderSpaceEquations(snapshot);
  stateText.textContent = snapshot.state;
  strokesText.textContent = String(spaceEngine.attempts);
  hitButton.disabled = spaceEngine.isMoving;
}

function updateGolfAimLine(): void {
  const angle = (Number(angleInput.value) * Math.PI) / 180;
  const power = Number(powerInput.value);
  const start = toGolfWorld(engine.ball.position, engine.course.heightAt(engine.ball.position) + 0.08);
  const direction = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle)).normalize();
  const end = start.clone().add(direction.multiplyScalar(power * 0.75));

  const positions = aimLine.geometry.attributes.position;
  positions.setXYZ(0, start.x, start.y, start.z);
  positions.setXYZ(1, end.x, end.y, end.z);
  positions.needsUpdate = true;
}

function renderGolfTelemetry(snapshot: PhysicsSnapshot): void {
  const rows = [
    ["time", `${snapshot.time.toFixed(2)} s`],
    ["dt", `${snapshot.dt.toFixed(4)} s`],
    ["position", formatVec(snapshot.position)],
    ["height", `${snapshot.height.toFixed(4)} m`],
    ["velocity", formatVec(snapshot.velocity)],
    ["speed", `${snapshot.speed.toFixed(3)} m/s`],
    ["slope", formatVec(snapshot.slope)],
    ["gravity acc.", formatVec(snapshot.gravityAcceleration)],
    ["friction acc.", formatVec(snapshot.frictionAcceleration)],
    ["net acc.", formatVec(snapshot.acceleration)],
    ["mu kinetic", snapshot.kineticFriction.toFixed(3)],
    ["mu static", snapshot.staticFriction.toFixed(3)],
    ["kinetic energy", `${snapshot.kineticEnergy.toFixed(4)} J`],
    ["potential energy", `${snapshot.potentialEnergy.toFixed(4)} J`],
    ["total energy", `${snapshot.mechanicalEnergy.toFixed(4)} J`],
  ];

  telemetry.replaceChildren(
    ...rows.flatMap(([label, value]) => {
      const term = document.createElement("dt");
      const detail = document.createElement("dd");
      term.textContent = label;
      detail.textContent = value;
      return [term, detail];
    }),
  );
}

function renderSpaceTelemetry(snapshot: PhysicsSnapshot): void {
  const distanceToTarget = snapshot.position.distance(spaceEngine.world.destination.position);
  const distanceFromStart = snapshot.position.distance(spaceEngine.world.departure.position);
  const nearest = nearestPlanet(snapshot.position);
  const idealOrbitSpeed = spaceEngine.idealOrbitalSpeedAround(nearest.planet);
  const orbitSpeedError = snapshot.speed - idealOrbitSpeed;
  const rows = [
    ["time", `${snapshot.time.toFixed(2)} s`],
    ["dt", `${snapshot.dt.toFixed(4)} s`],
    ["position", formatVec(snapshot.position)],
    ["velocity", formatVec(snapshot.velocity)],
    ["speed", `${snapshot.speed.toFixed(3)} m/s`],
    ["gravity acc.", formatVec(snapshot.gravityAcceleration)],
    ["net acc.", formatVec(snapshot.acceleration)],
    ["distance to A", `${distanceFromStart.toFixed(3)} m`],
    ["distance to B", `${distanceToTarget.toFixed(3)} m`],
    ["nearest planet", nearest.label],
    ["ideal orbit speed", `${idealOrbitSpeed.toFixed(3)} m/s`],
    ["orbit speed error", `${orbitSpeedError.toFixed(3)} m/s`],
    ["arrival radius", `${spaceEngine.world.arrivalRadius.toFixed(3)} m`],
    ["kinetic energy", `${snapshot.kineticEnergy.toFixed(4)} J`],
    ["potential energy", `${snapshot.potentialEnergy.toFixed(4)} J`],
    ["total energy", `${snapshot.mechanicalEnergy.toFixed(4)} J`],
  ];

  renderDefinitionRows(rows);
}

function renderGolfEquations(snapshot: PhysicsSnapshot): void {
  const rows = [
    ["height", "z = 0.5 · (sin((x - y) / 7) + 0.9) - 0.25", `z = ${snapshot.height.toFixed(4)} m`],
    ["slope", "∇z = (dz/dx, dz/dy)", `|∇z| = ${snapshot.slopeMagnitude.toFixed(4)}`],
    ["gravity", "a_g = -g · ∇z", `a_g = ${formatVec(snapshot.gravityAcceleration)} m/s²`],
    ["friction", "a_f = -μk · g · normalize(v)", `a_f = ${formatVec(snapshot.frictionAcceleration)} m/s²`],
    ["net acceleration", "a = a_g + a_f", `a = ${formatVec(snapshot.acceleration)} m/s²`],
    ["integration", "v += a · dt, p += v · dt", `dt = ${snapshot.dt.toFixed(4)} s`],
    ["energy", "E = 1/2mv² + mgz", `E = ${snapshot.mechanicalEnergy.toFixed(4)} J`],
  ];

  renderEquationRows(rows);
}

function renderSpaceEquations(snapshot: PhysicsSnapshot): void {
  const nearest = nearestPlanet(snapshot.position);
  const radius = snapshot.position.distance(nearest.planet.position);
  const idealOrbitSpeed = spaceEngine.idealOrbitalSpeedAround(nearest.planet);
  const rows = [
    ["gravity", "a = Σ G · M · normalize(r) / |r|²", `a = ${formatVec(snapshot.gravityAcceleration)} m/s²`],
    ["planet A", "rA = planetA - rocket", `|rA| = ${snapshot.position.distance(spaceEngine.world.departure.position).toFixed(3)} m`],
    ["planet B", "rB = planetB - rocket", `|rB| = ${snapshot.position.distance(spaceEngine.world.destination.position).toFixed(3)} m`],
    ["orbit speed", "v_orbit = sqrt(G · M / r)", `${nearest.label}: sqrt(GM/${radius.toFixed(3)}) = ${idealOrbitSpeed.toFixed(3)} m/s`],
    ["integration", "v += a · dt, p += v · dt", `dt = ${snapshot.dt.toFixed(4)} s`],
    ["arrival", "distance(rocket, planetB) <= target radius", `${snapshot.position.distance(spaceEngine.world.destination.position).toFixed(3)} <= ${spaceEngine.world.arrivalRadius.toFixed(3)}`],
    ["energy", "E = 1/2mv² - Σ(GMm/r)", `E = ${snapshot.mechanicalEnergy.toFixed(4)} J`],
  ];

  renderEquationRows(rows);
}

function renderDefinitionRows(rows: string[][]): void {
  telemetry.replaceChildren(
    ...rows.flatMap(([label, value]) => {
      const term = document.createElement("dt");
      const detail = document.createElement("dd");
      term.textContent = label;
      detail.textContent = value;
      return [term, detail];
    }),
  );
}

function renderEquationRows(rows: string[][]): void {
  equations.replaceChildren(
    ...rows.map(([label, equation, value]) => {
      const row = document.createElement("article");
      const labelElement = document.createElement("span");
      const equationElement = document.createElement("code");
      const valueElement = document.createElement("strong");
      labelElement.textContent = label;
      equationElement.textContent = equation;
      valueElement.textContent = value;
      row.append(labelElement, equationElement, valueElement);
      return row;
    }),
  );
}

function appendTrajectoryPoint(snapshot: PhysicsSnapshot): void {
  const last = trajectoryPoints.at(-1);
  const next = toGolfWorld(snapshot.position, snapshot.height + 0.08);
  if (!last || last.distanceTo(next) > 0.035) {
    trajectoryPoints.push(next);
    if (trajectoryPoints.length > 900) {
      trajectoryPoints = trajectoryPoints.slice(-900);
    }
    updateTrajectoryLine(trajectoryLine, trajectoryPoints);
  }
}

function appendSpaceTrajectoryPoint(snapshot: PhysicsSnapshot): void {
  const last = spaceTrajectoryPoints.at(-1);
  const next = toSpaceWorld(snapshot.position);
  if (!last || last.distanceTo(next) > 0.025) {
    spaceTrajectoryPoints.push(next);
    if (spaceTrajectoryPoints.length > 1400) {
      spaceTrajectoryPoints = spaceTrajectoryPoints.slice(-1400);
    }
    updateTrajectoryLine(spaceTrajectoryLine, spaceTrajectoryPoints);
  }
}

function updateTrajectoryLine(line: THREE.Line, points: THREE.Vector3[]): void {
  line.geometry.dispose();
  line.geometry = new THREE.BufferGeometry().setFromPoints(
    points.length > 1 ? points : [new THREE.Vector3(), new THREE.Vector3()],
  );
}

function updateGolfVectorArrows(snapshot: PhysicsSnapshot): void {
  const origin = toGolfWorld(snapshot.position, snapshot.height + 0.32);
  updateArrow(gravityArrow, origin, snapshot.gravityAcceleration, 0.75);
  updateArrow(frictionArrow, origin.clone().add(new THREE.Vector3(0, 0.1, 0)), snapshot.frictionAcceleration, 0.75);
  updateArrow(accelerationArrow, origin.clone().add(new THREE.Vector3(0, 0.2, 0)), snapshot.acceleration, 0.9);
}

function updateSpaceAimLine(): void {
  const angle = (Number(angleInput.value) * Math.PI) / 180;
  const power = Number(powerInput.value);
  const start = toSpaceWorld(spaceEngine.rocket.position);
  const direction = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle)).normalize();
  const end = start.clone().add(direction.multiplyScalar(power * 0.38));

  const positions = spaceAimLine.geometry.attributes.position;
  positions.setXYZ(0, start.x, start.y, start.z);
  positions.setXYZ(1, end.x, end.y, end.z);
  positions.needsUpdate = true;
}

function updateSpaceVectorArrows(snapshot: PhysicsSnapshot): void {
  const origin = toSpaceWorld(snapshot.position).add(new THREE.Vector3(0, 0.2, 0));
  updateArrow(spaceGravityArrow, origin, snapshot.gravityAcceleration, 0.24);
  updateArrow(spaceAccelerationArrow, origin.clone().add(new THREE.Vector3(0, 0.18, 0)), snapshot.acceleration, 0.28);
}

function createTerrain(): THREE.Mesh {
  const geometry = new THREE.PlaneGeometry(terrainSize, terrainSize, terrainSegments, terrainSegments);
  geometry.rotateX(-Math.PI / 2);

  const positions = geometry.attributes.position;
  const colors: number[] = [];
  const color = new THREE.Color();

  for (let i = 0; i < positions.count; i += 1) {
    const x = positions.getX(i);
    const z = positions.getZ(i);
    const point = new Vec2(x, z);
    const height = engine.course.heightAt(point);
    positions.setY(i, height * verticalScale);

    if (height < 0) {
      color.set(0x507fa6);
    } else if (engine.course.isSand(point)) {
      color.set(0xd8bd71);
    } else {
      const green = THREE.MathUtils.clamp(0.38 + height * 0.7, 0.22, 0.72);
      color.setRGB(0.18, green, 0.2);
    }
    colors.push(color.r, color.g, color.b);
  }

  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.computeVertexNormals();

  return new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.86,
      metalness: 0,
    }),
  );
}

function createWater(): THREE.Mesh {
  const geometry = new THREE.PlaneGeometry(terrainSize, terrainSize);
  geometry.rotateX(-Math.PI / 2);
  const material = new THREE.MeshPhysicalMaterial({
    color: 0x3f91bd,
    transparent: true,
    opacity: 0.32,
    roughness: 0.25,
    metalness: 0,
    transmission: 0.12,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.y = 0;
  return mesh;
}

function createSand(): THREE.Mesh {
  const width = engine.course.sandTopRight.x - engine.course.sandBottomLeft.x;
  const depth = engine.course.sandTopRight.y - engine.course.sandBottomLeft.y;
  const geometry = new THREE.PlaneGeometry(width, depth);
  geometry.rotateX(-Math.PI / 2);
  const material = new THREE.MeshStandardMaterial({
    color: 0xe2ca83,
    roughness: 0.95,
    transparent: true,
    opacity: 0.78,
  });
  const mesh = new THREE.Mesh(geometry, material);
  const center = engine.course.sandBottomLeft.add(new Vec2(width / 2, depth / 2));
  mesh.position.copy(toGolfWorld(center, engine.course.heightAt(center) + 0.006));
  return mesh;
}

function createTarget(): THREE.Group {
  const group = new THREE.Group();
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(engine.course.targetRadius, 0.018, 12, 48),
    new THREE.MeshStandardMaterial({ color: 0xf05a4f, roughness: 0.55 }),
  );
  ring.rotation.x = Math.PI / 2;
  ring.castShadow = true;
  group.add(ring);

  const flag = new THREE.Mesh(
    new THREE.CylinderGeometry(0.012, 0.012, 0.9, 8),
    new THREE.MeshStandardMaterial({ color: 0xf4f1ea, roughness: 0.4 }),
  );
  flag.position.y = 0.45;
  group.add(flag);

  const flagTop = new THREE.Mesh(
    new THREE.ConeGeometry(0.13, 0.28, 3),
    new THREE.MeshStandardMaterial({ color: 0xf05a4f, roughness: 0.48 }),
  );
  flagTop.position.set(0.1, 0.72, 0);
  flagTop.rotation.z = -Math.PI / 2;
  group.add(flagTop);
  return group;
}

function createBall(): THREE.Mesh {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 32, 24),
    new THREE.MeshStandardMaterial({ color: 0xf8faf7, roughness: 0.28, metalness: 0.02 }),
  );
  mesh.castShadow = true;
  return mesh;
}

function createAimLine(color = 0xf4c84a): THREE.Line {
  const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
  const material = new THREE.LineBasicMaterial({ color, linewidth: 2 });
  return new THREE.Line(geometry, material);
}

function createTrajectoryLine(color = 0x22312a, opacity = 0.72): THREE.Line {
  const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
  const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity });
  return new THREE.Line(geometry, material);
}

function createStarField(): THREE.Points {
  const geometry = new THREE.BufferGeometry();
  const positions: number[] = [];
  for (let i = 0; i < 450; i += 1) {
    const radius = 10 + Math.random() * 10;
    const angle = Math.random() * Math.PI * 2;
    positions.push(Math.cos(angle) * radius, -1.5 + Math.random() * 6, Math.sin(angle) * radius);
  }
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  return new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      color: 0xeaf2ff,
      size: 0.035,
      transparent: true,
      opacity: 0.86,
    }),
  );
}

function createPlanet(color: number, radius: number): THREE.Mesh {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 48, 32),
    new THREE.MeshStandardMaterial({ color, roughness: 0.62, metalness: 0.02 }),
  );
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function createArrivalRing(): THREE.Mesh {
  const mesh = new THREE.Mesh(
    new THREE.TorusGeometry(spaceEngine.world.arrivalRadius, 0.018, 12, 72),
    new THREE.MeshBasicMaterial({ color: 0x9cf2c3, transparent: true, opacity: 0.86 }),
  );
  mesh.rotation.x = Math.PI / 2;
  return mesh;
}

function createOrbitGuide(radius: number, color: number): THREE.Mesh {
  const mesh = new THREE.Mesh(
    new THREE.TorusGeometry(radius, 0.008, 8, 112),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.35 }),
  );
  mesh.rotation.x = Math.PI / 2;
  return mesh;
}

function createRocket(): THREE.Group {
  const group = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.ConeGeometry(0.11, 0.38, 18),
    new THREE.MeshStandardMaterial({ color: 0xf2f0e7, roughness: 0.38, metalness: 0.08 }),
  );
  body.rotation.z = -Math.PI / 2;
  group.add(body);

  const flame = new THREE.Mesh(
    new THREE.ConeGeometry(0.06, 0.22, 12),
    new THREE.MeshBasicMaterial({ color: 0xffb84d, transparent: true, opacity: 0.78 }),
  );
  flame.position.x = -0.24;
  flame.rotation.z = Math.PI / 2;
  group.add(flame);
  return group;
}

function createVectorArrow(color: number): THREE.ArrowHelper {
  const arrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), 0.001, color, 0.16, 0.08);
  arrow.visible = false;
  return arrow;
}

function resize(): void {
  const rect = canvas.parentElement?.getBoundingClientRect();
  const width = Math.max(1, rect?.width ?? window.innerWidth);
  const height = Math.max(1, rect?.height ?? window.innerHeight);
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

function toGolfWorld(position: Vec2, height: number): THREE.Vector3 {
  return new THREE.Vector3(position.x, height * verticalScale + 0.14, position.y);
}

function toSpaceWorld(position: Vec2): THREE.Vector3 {
  return new THREE.Vector3(position.x, 0.18, position.y);
}

function formatVec(vector: Vec2): string {
  return `(${vector.x.toFixed(3)}, ${vector.y.toFixed(3)})`;
}

function nearestPlanet(position: Vec2) {
  const distanceToA = position.distance(spaceEngine.world.departure.position);
  const distanceToB = position.distance(spaceEngine.world.destination.position);
  if (distanceToA <= distanceToB) {
    return { label: "Planet A", planet: spaceEngine.world.departure, distance: distanceToA };
  }
  return { label: "Planet B", planet: spaceEngine.world.destination, distance: distanceToB };
}

function vectorToWorldDirection(vector: Vec2): THREE.Vector3 {
  return new THREE.Vector3(vector.x, 0, vector.y);
}

function updateArrow(arrow: THREE.ArrowHelper, origin: THREE.Vector3, vector: Vec2, scale: number): void {
  const direction = vectorToWorldDirection(vector);
  const magnitude = direction.length();
  arrow.position.copy(origin);

  if (magnitude < 0.0001) {
    arrow.visible = false;
    return;
  }

  arrow.visible = true;
  arrow.setDirection(direction.normalize());
  arrow.setLength(Math.min(1.6, magnitude * scale), 0.16, 0.08);
}

function requireElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) {
    throw new Error(`Missing UI element: ${selector}`);
  }
  return element;
}
