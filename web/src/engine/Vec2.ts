export class Vec2 {
  constructor(
    public readonly x: number,
    public readonly y: number,
  ) {}

  add(other: Vec2): Vec2 {
    return new Vec2(this.x + other.x, this.y + other.y);
  }

  subtract(other: Vec2): Vec2 {
    return new Vec2(this.x - other.x, this.y - other.y);
  }

  multiply(scalar: number): Vec2 {
    return new Vec2(this.x * scalar, this.y * scalar);
  }

  dot(other: Vec2): number {
    return this.x * other.x + this.y * other.y;
  }

  magnitude(): number {
    return Math.hypot(this.x, this.y);
  }

  normalized(): Vec2 {
    const magnitude = this.magnitude();
    return magnitude === 0 ? new Vec2(0, 0) : new Vec2(this.x / magnitude, this.y / magnitude);
  }

  distance(other: Vec2): number {
    return this.subtract(other).magnitude();
  }
}
