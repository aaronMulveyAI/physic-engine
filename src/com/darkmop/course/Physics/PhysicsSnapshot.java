package com.darkmop.course.Physics;

import com.darkmop.util.Vec2D;

public class PhysicsSnapshot {
	public final double time;
	public final double dt;
	public final Vec2D position;
	public final double height;
	public final Vec2D velocity;
	public final double speed;
	public final Vec2D slope;
	public final Vec2D gravityAcceleration;
	public final Vec2D frictionAcceleration;
	public final Vec2D acceleration;
	public final double kineticFriction;
	public final double staticFriction;
	public final String state;

	public PhysicsSnapshot(
			double time,
			double dt,
			Vec2D position,
			double height,
			Vec2D velocity,
			Vec2D slope,
			Vec2D gravityAcceleration,
			Vec2D frictionAcceleration,
			Vec2D acceleration,
			double kineticFriction,
			double staticFriction,
			String state
	) {
		this.time = time;
		this.dt = dt;
		this.position = position;
		this.height = height;
		this.velocity = velocity;
		this.speed = velocity.magnitude();
		this.slope = slope;
		this.gravityAcceleration = gravityAcceleration;
		this.frictionAcceleration = frictionAcceleration;
		this.acceleration = acceleration;
		this.kineticFriction = kineticFriction;
		this.staticFriction = staticFriction;
		this.state = state;
	}

	@Override
	public String toString() {
		return "PhysicsSnapshot{" +
				"time=" + time +
				", dt=" + dt +
				", position=" + position +
				", height=" + height +
				", velocity=" + velocity +
				", speed=" + speed +
				", slope=" + slope +
				", gravityAcceleration=" + gravityAcceleration +
				", frictionAcceleration=" + frictionAcceleration +
				", acceleration=" + acceleration +
				", kineticFriction=" + kineticFriction +
				", staticFriction=" + staticFriction +
				", state='" + state + '\'' +
				'}';
	}
}
