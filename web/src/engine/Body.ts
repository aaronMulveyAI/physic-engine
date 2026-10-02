import { Vec2 } from "./Vec2";

export class Body {
  velocity = new Vec2(0, 0);

  constructor(
    public position: Vec2,
    public readonly mass: number,
    public readonly maxVelocity: number,
  ) {}

  reset(position: Vec2): void {
    this.position = position;
    this.velocity = new Vec2(0, 0);
  }

  setVelocity(velocity: Vec2): void {
    const speed = velocity.magnitude();
    this.velocity = speed > this.maxVelocity ? velocity.normalized().multiply(this.maxVelocity) : velocity;
  }
}
