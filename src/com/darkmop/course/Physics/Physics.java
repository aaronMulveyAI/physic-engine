package com.darkmop.course.Physics;

import com.darkmop.course.GolfCourse;
import com.darkmop.util.Vec2D;

import java.util.ArrayList;
import java.util.List;

public class Physics {
	private static final double GRAVITY = 9.80665;
	private static final double DEFAULT_TIME_STEP = 0.01;
	private static final int DEFAULT_MAX_STEPS = 20000;
	private static final double STOP_SPEED = 0.001;

	private final GolfCourse course;
	private final Ball ball;
	private double time = 0;
	private PhysicsSnapshot lastSnapshot;

	public boolean isMoving;

	public Physics(GolfCourse course, Ball ball) {
		this.course = course;
		this.ball = ball;
		this.lastSnapshot = createSnapshot(0, new Vec2D(0, 0), new Vec2D(0, 0), new Vec2D(0, 0), "ready");
	}

	public PhysicsSnapshot step(double dt) {
		Vec2D position = ball.getPosition();
		Vec2D velocity = ball.getVelocity();
		Vec2D slope = course.getSlope(position);
		Vec2D gravityAcceleration = slope.multiply(-GRAVITY);
		double kineticFriction = course.getKineticFriction(position);
		double staticFriction = course.getStaticFriction(position);

		if(shouldStayAtRest(velocity, slope, staticFriction)) {
			ball.resetVelocity();
			isMoving = false;
			lastSnapshot = createSnapshot(dt, slope, gravityAcceleration, new Vec2D(0, 0), stateAt(position));
			return lastSnapshot;
		}

		Vec2D frictionAcceleration = calculateFriction(velocity, gravityAcceleration, kineticFriction);
		Vec2D acceleration = gravityAcceleration.add(frictionAcceleration);
		Vec2D newVelocity = velocity.add(acceleration.multiply(dt));

		if(shouldStopFromFriction(velocity, newVelocity, gravityAcceleration, frictionAcceleration)) {
			newVelocity = new Vec2D(0, 0);
		}

		Vec2D newPosition = position.add(newVelocity.multiply(dt));
		ball.setVelocity(newVelocity);
		ball.setPosition(newPosition);
		time += dt;

		String state = stateAt(newPosition);
		if(state.equals("target") || state.equals("water")) {
			ball.resetVelocity();
			isMoving = false;
		} else {
			isMoving = ball.getSpeed() > STOP_SPEED || slopeOvercomesStaticFriction(course.getSlope(newPosition), course.getStaticFriction(newPosition));
		}

		lastSnapshot = createSnapshot(dt, slope, gravityAcceleration, frictionAcceleration, state);
		return lastSnapshot;
	}

	public List<PhysicsSnapshot> hitBall(Vec2D position, Vec2D velocities) {
		return hitBall(position, velocities, DEFAULT_TIME_STEP, DEFAULT_MAX_STEPS);
	}

	public List<PhysicsSnapshot> hitBall(Vec2D position, Vec2D velocities, double dt, int maxSteps) {
		ball.setPosition(position);
		ball.setVelocity(velocities);
		isMoving = true;

		List<PhysicsSnapshot> snapshots = new ArrayList<>();
		for(int i = 0; i < maxSteps && isMoving; i++) {
			snapshots.add(step(dt));
		}
		return snapshots;
	}

	public boolean hasLowVelocity() {
		if(ball.getSpeed() < STOP_SPEED) {
			ball.resetVelocity();
			isMoving = slopeOvercomesStaticFriction(course.getSlope(ball.getPosition()), course.getStaticFriction(ball.getPosition()));
			return true;
		}
		return false;
	}

	public boolean isInSlope() {
		return slopeOvercomesStaticFriction(course.getSlope(ball.getPosition()), course.getStaticFriction(ball.getPosition()));
	}

	public boolean isInTarget() {
		return course.onTarget(ball.getPosition());
	}

	public Vec2D distanceToTheTarget() {
		return new Vec2D(
				Math.abs(course.getTargetPos().getX() - ball.getPositionX()),
				Math.abs(course.getTargetPos().getY() - ball.getPositionY())
		);
	}

	public PhysicsSnapshot getLastSnapshot() {
		return lastSnapshot;
	}

	public Ball getBall() {
		return ball;
	}

	public void setMovement(boolean movement) {
		isMoving = movement;
	}

	private boolean shouldStayAtRest(Vec2D velocity, Vec2D slope, double staticFriction) {
		return velocity.magnitude() < STOP_SPEED && !slopeOvercomesStaticFriction(slope, staticFriction);
	}

	private boolean slopeOvercomesStaticFriction(Vec2D slope, double staticFriction) {
		return slope.magnitude() > staticFriction;
	}

	private Vec2D calculateFriction(Vec2D velocity, Vec2D gravityAcceleration, double kineticFriction) {
		Vec2D direction;
		if(velocity.magnitude() > STOP_SPEED) {
			direction = velocity.normalized().multiply(-1);
		} else if(gravityAcceleration.magnitude() > 0) {
			direction = gravityAcceleration.normalized().multiply(-1);
		} else {
			return new Vec2D(0, 0);
		}

		return direction.multiply(kineticFriction * GRAVITY);
	}

	private boolean shouldStopFromFriction(Vec2D velocity, Vec2D newVelocity, Vec2D gravityAcceleration, Vec2D frictionAcceleration) {
		if(velocity.magnitude() <= STOP_SPEED) {
			return false;
		}
		boolean reversedDirection = velocity.dot(newVelocity) <= 0;
		boolean frictionDominates = frictionAcceleration.magnitude() >= gravityAcceleration.magnitude();
		return reversedDirection && frictionDominates;
	}

	private String stateAt(Vec2D position) {
		if(course.onTarget(position)) {
			return "target";
		}
		if(course.inWater(position)) {
			return "water";
		}
		if(course.inSand(position)) {
			return "sand";
		}
		return ball.getSpeed() > STOP_SPEED ? "rolling" : "resting";
	}

	private PhysicsSnapshot createSnapshot(double dt, Vec2D slope, Vec2D gravityAcceleration, Vec2D frictionAcceleration, String state) {
		Vec2D acceleration = gravityAcceleration.add(frictionAcceleration);
		Vec2D position = ball.getPosition();
		return new PhysicsSnapshot(
				time,
				dt,
				position,
				course.getHeight(position),
				ball.getVelocity(),
				slope,
				gravityAcceleration,
				frictionAcceleration,
				acceleration,
				course.getKineticFriction(position),
				course.getStaticFriction(position),
				state
		);
	}
}
