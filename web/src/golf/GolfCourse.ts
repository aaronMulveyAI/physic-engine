import { Vec2 } from "../engine/Vec2";

export class GolfCourse {
  readonly start = new Vec2(0, 0);
  readonly target = new Vec2(4, 1);
  readonly targetRadius = 0.18;
  readonly grassFriction = new Vec2(0.1, 0.2);
  readonly sandFriction = new Vec2(0.25, 0.3);
  readonly sandBottomLeft = new Vec2(-1, 1);
  readonly sandTopRight = new Vec2(1, 2);
  readonly sampleStep = 0.001;

  heightAt(position: Vec2): number {
    return 0.5 * (Math.sin((position.x - position.y) / 7) + 0.9) - 0.25;
  }

  slopeAt(position: Vec2): Vec2 {
    const height = this.heightAt(position);
    return new Vec2(
      (this.heightAt(new Vec2(position.x + this.sampleStep, position.y)) - height) / this.sampleStep,
      (this.heightAt(new Vec2(position.x, position.y + this.sampleStep)) - height) / this.sampleStep,
    );
  }

  isTarget(position: Vec2): boolean {
    return position.distance(this.target) < this.targetRadius;
  }

  isWater(position: Vec2): boolean {
    return this.heightAt(position) < 0;
  }

  isSand(position: Vec2): boolean {
    return (
      position.x > this.sandBottomLeft.x &&
      position.x < this.sandTopRight.x &&
      position.y > this.sandBottomLeft.y &&
      position.y < this.sandTopRight.y
    );
  }

  kineticFrictionAt(position: Vec2): number {
    return this.isSand(position) ? this.sandFriction.x : this.grassFriction.x;
  }

  staticFrictionAt(position: Vec2): number {
    return this.isSand(position) ? this.sandFriction.y : this.grassFriction.y;
  }
}
