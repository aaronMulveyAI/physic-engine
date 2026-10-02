import { Body } from "../engine/Body";
import type { PhysicsSnapshot, SimulationState } from "../engine/PhysicsSnapshot";
import { Vec2 } from "../engine/Vec2";
import { GolfCourse } from "./GolfCourse";

export class GolfPhysicsEngine {
  readonly gravity = 9.80665;
  readonly fixedTimeStep = 1 / 120;
  readonly integratorName = "Semi-implicit Euler";
  readonly course = new GolfCourse();
  readonly ball = new Body(this.course.start, 0.0459, 5);

  private readonly stopSpeed = 0.001;
  private time = 0;

  isMoving = false;
  strokes = 0;
  snapshot: PhysicsSnapshot;

  constructor() {
    this.snapshot = this.createSnapshot(0, new Vec2(0, 0), new Vec2(0, 0), new Vec2(0, 0), "ready");
  }

  reset(): void {
    this.time = 0;
    this.strokes = 0;
    this.isMoving = false;
    this.ball.reset(this.course.start);
    this.snapshot = this.createSnapshot(0, new Vec2(0, 0), new Vec2(0, 0), new Vec2(0, 0), "ready");
  }

  hit(angleDegrees: number, power: number): void {
    if (this.snapshot.state === "water" || this.snapshot.state === "target") {
      this.ball.reset(this.course.start);
    }

    const radians = (angleDegrees * Math.PI) / 180;
    this.ball.setVelocity(new Vec2(Math.cos(radians) * power, Math.sin(radians) * power));
    this.isMoving = true;
    this.strokes += 1;
  }

  step(dt: number): PhysicsSnapshot {
    const position = this.ball.position;
    const velocity = this.ball.velocity;
    const slope = this.course.slopeAt(position);
    const gravityAcceleration = slope.multiply(-this.gravity);
    const kineticFriction = this.course.kineticFrictionAt(position);
    const staticFriction = this.course.staticFrictionAt(position);

    if (this.shouldStayAtRest(velocity, slope, staticFriction)) {
      this.ball.setVelocity(new Vec2(0, 0));
      this.isMoving = false;
      this.snapshot = this.createSnapshot(dt, slope, gravityAcceleration, new Vec2(0, 0), this.stateAt(position));
      return this.snapshot;
    }

    const frictionAcceleration = this.calculateFriction(velocity, gravityAcceleration, kineticFriction);
    const acceleration = gravityAcceleration.add(frictionAcceleration);
    let newVelocity = velocity.add(acceleration.multiply(dt));

    if (this.shouldStopFromFriction(velocity, newVelocity, gravityAcceleration, frictionAcceleration)) {
      newVelocity = new Vec2(0, 0);
    }

    const newPosition = position.add(newVelocity.multiply(dt));
    this.ball.setVelocity(newVelocity);
    this.ball.position = newPosition;
    this.time += dt;

    const state = this.stateAt(newPosition);
    if (state === "water" || state === "target") {
      this.ball.setVelocity(new Vec2(0, 0));
      this.isMoving = false;
    } else {
      this.isMoving =
        this.ball.velocity.magnitude() > this.stopSpeed ||
        this.slopeOvercomesStaticFriction(this.course.slopeAt(newPosition), this.course.staticFrictionAt(newPosition));
    }

    this.snapshot = this.createSnapshot(dt, slope, gravityAcceleration, frictionAcceleration, state);
    return this.snapshot;
  }

  private shouldStayAtRest(velocity: Vec2, slope: Vec2, staticFriction: number): boolean {
    return velocity.magnitude() < this.stopSpeed && !this.slopeOvercomesStaticFriction(slope, staticFriction);
  }

  private slopeOvercomesStaticFriction(slope: Vec2, staticFriction: number): boolean {
    return slope.magnitude() > staticFriction;
  }

  private calculateFriction(velocity: Vec2, gravityAcceleration: Vec2, kineticFriction: number): Vec2 {
    if (velocity.magnitude() > this.stopSpeed) {
      return velocity.normalized().multiply(-kineticFriction * this.gravity);
    }

    if (gravityAcceleration.magnitude() > 0) {
      return gravityAcceleration.normalized().multiply(-kineticFriction * this.gravity);
    }

    return new Vec2(0, 0);
  }

  private shouldStopFromFriction(
    velocity: Vec2,
    newVelocity: Vec2,
    gravityAcceleration: Vec2,
    frictionAcceleration: Vec2,
  ): boolean {
    if (velocity.magnitude() <= this.stopSpeed) {
      return false;
    }

    return velocity.dot(newVelocity) <= 0 && frictionAcceleration.magnitude() >= gravityAcceleration.magnitude();
  }

  private stateAt(position: Vec2): SimulationState {
    if (this.course.isTarget(position)) {
      return "target";
    }

    if (this.course.isWater(position)) {
      return "water";
    }

    if (this.course.isSand(position)) {
      return "sand";
    }

    return this.ball.velocity.magnitude() > this.stopSpeed ? "rolling" : "resting";
  }

  private createSnapshot(
    dt: number,
    slope: Vec2,
    gravityAcceleration: Vec2,
    frictionAcceleration: Vec2,
    state: SimulationState,
  ): PhysicsSnapshot {
    const acceleration = gravityAcceleration.add(frictionAcceleration);
    const speed = this.ball.velocity.magnitude();
    const height = this.course.heightAt(this.ball.position);
    const kineticEnergy = 0.5 * this.ball.mass * speed * speed;
    const potentialEnergy = this.ball.mass * this.gravity * height;

    return {
      time: this.time,
      dt,
      position: this.ball.position,
      height,
      velocity: this.ball.velocity,
      speed,
      slope,
      gravityAcceleration,
      frictionAcceleration,
      acceleration,
      kineticFriction: this.course.kineticFrictionAt(this.ball.position),
      staticFriction: this.course.staticFrictionAt(this.ball.position),
      slopeMagnitude: slope.magnitude(),
      kineticEnergy,
      potentialEnergy,
      mechanicalEnergy: kineticEnergy + potentialEnergy,
      state,
    };
  }
}
