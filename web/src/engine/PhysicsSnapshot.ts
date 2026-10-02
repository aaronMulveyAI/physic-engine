import { Vec2 } from "./Vec2";

export type SimulationState =
  | "ready"
  | "rolling"
  | "resting"
  | "sand"
  | "water"
  | "target"
  | "coasting"
  | "escaped"
  | "crashed";

export interface PhysicsSnapshot {
  time: number;
  dt: number;
  position: Vec2;
  height: number;
  velocity: Vec2;
  speed: number;
  slope: Vec2;
  gravityAcceleration: Vec2;
  frictionAcceleration: Vec2;
  acceleration: Vec2;
  kineticFriction: number;
  staticFriction: number;
  slopeMagnitude: number;
  kineticEnergy: number;
  potentialEnergy: number;
  mechanicalEnergy: number;
  state: SimulationState;
}
