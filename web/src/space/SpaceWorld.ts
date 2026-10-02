import { Vec2 } from "../engine/Vec2";

export interface Planet {
  name: string;
  position: Vec2;
  radius: number;
  mass: number;
  color: number;
}

export class SpaceWorld {
  readonly gravitationalConstant = 0.18;
  readonly departureOrbitRadius = 1.38;
  readonly destinationOrbitRadius = 1.52;
  readonly departure: Planet = {
    name: "Planet A",
    position: new Vec2(-3.1, -0.35),
    radius: 0.48,
    mass: 5.2,
    color: 0x4f8ed9,
  };

  readonly destination: Planet = {
    name: "Planet B",
    position: new Vec2(3.05, 1.1),
    radius: 0.56,
    mass: 7.4,
    color: 0xd9774f,
  };

  readonly start = new Vec2(this.departure.position.x + this.departure.radius + 0.28, this.departure.position.y);
  readonly arrivalRadius = this.destination.radius + 0.2;
  readonly escapeRadius = 8.5;

  gravityAt(position: Vec2): Vec2 {
    return this.gravityFromPlanet(this.departure, position).add(this.gravityFromPlanet(this.destination, position));
  }

  gravityFromPlanet(planet: Planet, position: Vec2): Vec2 {
    const offset = planet.position.subtract(position);
    const distance = Math.max(offset.magnitude(), planet.radius * 0.85);
    return offset.normalized().multiply((this.gravitationalConstant * planet.mass) / (distance * distance));
  }

  potentialAt(position: Vec2, bodyMass: number): number {
    return this.potentialFrom(this.departure, position, bodyMass) + this.potentialFrom(this.destination, position, bodyMass);
  }

  orbitalSpeed(planet: Planet, radius: number): number {
    return Math.sqrt((this.gravitationalConstant * planet.mass) / radius);
  }

  hasArrived(position: Vec2): boolean {
    return position.distance(this.destination.position) <= this.arrivalRadius;
  }

  hasCrashed(position: Vec2): boolean {
    const departureImpact = position.distance(this.departure.position) <= this.departure.radius;
    const destinationImpact = position.distance(this.destination.position) <= this.destination.radius * 0.72;
    return departureImpact || destinationImpact;
  }

  hasEscaped(position: Vec2): boolean {
    return position.magnitude() >= this.escapeRadius;
  }

  private potentialFrom(planet: Planet, position: Vec2, bodyMass: number): number {
    const distance = Math.max(position.distance(planet.position), planet.radius * 0.85);
    return -(this.gravitationalConstant * planet.mass * bodyMass) / distance;
  }
}
