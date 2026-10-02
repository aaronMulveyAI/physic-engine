import { Body } from "../engine/Body";
import type { PhysicsSnapshot, SimulationState } from "../engine/PhysicsSnapshot";
import { Vec2 } from "../engine/Vec2";
import type { Planet } from "./SpaceWorld";
import { SpaceWorld } from "./SpaceWorld";

export class SpacePhysicsEngine {
  readonly fixedTimeStep = 1 / 180;
  readonly integratorName = "Semi-implicit Euler";
  readonly world = new SpaceWorld();
  readonly rocket = new Body(this.world.start, 0.02, 7);

  private time = 0;

  isMoving = false;
  attempts = 0;
  snapshot: PhysicsSnapshot;

  constructor() {
    this.snapshot = this.createSnapshot(0, new Vec2(0, 0), "ready");
  }

  reset(): void {
    this.time = 0;
    this.attempts = 0;
    this.isMoving = false;
    this.rocket.reset(this.world.start);
    this.snapshot = this.createSnapshot(0, new Vec2(0, 0), "ready");
  }

  launch(angleDegrees: number, power: number): void {
    if (this.snapshot.state === "target" || this.snapshot.state === "escaped" || this.snapshot.state === "crashed") {
      this.rocket.reset(this.world.start);
      this.time = 0;
    }

    const radians = (angleDegrees * Math.PI) / 180;
    this.rocket.setVelocity(new Vec2(Math.cos(radians) * power, Math.sin(radians) * power));
    this.isMoving = true;
    this.attempts += 1;
  }

  step(dt: number): PhysicsSnapshot {
    const gravityAcceleration = this.world.gravityAt(this.rocket.position);
    const newVelocity = this.rocket.velocity.add(gravityAcceleration.multiply(dt));
    const newPosition = this.rocket.position.add(newVelocity.multiply(dt));

    this.rocket.setVelocity(newVelocity);
    this.rocket.position = newPosition;
    this.time += dt;

    const state = this.stateAt(this.rocket.position);
    if (state === "target" || state === "escaped" || state === "crashed") {
      this.isMoving = false;
    }

    this.snapshot = this.createSnapshot(dt, gravityAcceleration, state);
    return this.snapshot;
  }

  private stateAt(position: Vec2): SimulationState {
    if (this.world.hasArrived(position)) {
      return "target";
    }
    if (this.world.hasCrashed(position)) {
      return "crashed";
    }
    if (this.world.hasEscaped(position)) {
      return "escaped";
    }
    return this.rocket.velocity.magnitude() > 0 ? "coasting" : "ready";
  }

  idealOrbitalSpeedAround(planet: Planet): number {
    return this.world.orbitalSpeed(planet, this.rocket.position.distance(planet.position));
  }

  private createSnapshot(dt: number, gravityAcceleration: Vec2, state: SimulationState): PhysicsSnapshot {
    const speed = this.rocket.velocity.magnitude();
    const kineticEnergy = 0.5 * this.rocket.mass * speed * speed;
    const potentialEnergy = this.world.potentialAt(this.rocket.position, this.rocket.mass);

    return {
      time: this.time,
      dt,
      position: this.rocket.position,
      height: 0,
      velocity: this.rocket.velocity,
      speed,
      slope: new Vec2(0, 0),
      gravityAcceleration,
      frictionAcceleration: new Vec2(0, 0),
      acceleration: gravityAcceleration,
      kineticFriction: 0,
      staticFriction: 0,
      slopeMagnitude: 0,
      kineticEnergy,
      potentialEnergy,
      mechanicalEnergy: kineticEnergy + potentialEnergy,
      state,
    };
  }
}
