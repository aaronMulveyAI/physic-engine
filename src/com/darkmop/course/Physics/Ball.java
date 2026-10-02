package com.darkmop.course.Physics;

import com.darkmop.course.GolfCourse;
import com.darkmop.util.Vec2D;

public class Ball {
	public static final double DEFAULT_MASS = 0.0459;
	public static final double DEFAULT_MAX_VELOCITY = 5.0;

	public GolfCourse course;

	private final double mass;
	private final double maxVelocity;
	private Vec2D velocity;
	private Vec2D position;

	public Ball(double x, double y, GolfCourse course) {
		this(x, y, course, DEFAULT_MASS, DEFAULT_MAX_VELOCITY);
	}

	public Ball(double x, double y, GolfCourse course, double mass, double maxVelocity) {
		this.velocity = new Vec2D(0, 0);
		this.position = new Vec2D(x, y);
		this.course = course;
		this.mass = mass;
		this.maxVelocity = maxVelocity;
	}

	public void resetPosition() {
		position.setToZero();
	}

	public void resetVelocity() {
		velocity.setToZero();
	}

	public double pithagorVelocity(Vec2D velocities) {
		return velocities.magnitude();
	}

	public void setPosition(double x, double y) {
		position.setXY(x, y);
	}

	public void setPosition(Vec2D position) {
		this.position = new Vec2D(position.getX(), position.getY());
	}

	public void setVelocities(double vX, double vY) {
		setVelocity(new Vec2D(vX, vY));
	}

	public void setVelocity(Vec2D velocity) {
		this.velocity = limitTheVelocity(velocity);
	}

	public Vec2D limitTheVelocity(Vec2D velocities) {
		double speed = velocities.magnitude();
		if(speed > maxVelocity) {
			return velocities.normalized().multiply(maxVelocity);
		}
		return new Vec2D(velocities.getX(), velocities.getY());
	}

	public void integrate(Vec2D acceleration, double dt) {
		Vec2D newVelocity = limitTheVelocity(velocity.add(acceleration.multiply(dt)));
		Vec2D newPosition = position.add(newVelocity.multiply(dt));
		velocity = newVelocity;
		position = newPosition;
	}

	// Kept for compatibility with the original code path.
	public void movementOfball(double stepsizeH) {
		Physics physics = new Physics(course, this);
		physics.step(stepsizeH);
	}

	public double[] unitVector(double Vx, double Vy) {
		Vec2D unit = new Vec2D(Vx, Vy).normalized();
		return new double[] { unit.getX(), unit.getY() };
	}

	public double getMass() {
		return mass;
	}

	public Vec2D getPosition() {
		return new Vec2D(position.getX(), position.getY());
	}

	public Vec2D getVelocity() {
		return new Vec2D(velocity.getX(), velocity.getY());
	}

	public double getSpeed() {
		return velocity.magnitude();
	}

	public double getVelocityX() {
		return velocity.getX();
	}

	public double getVelocityY() {
		return velocity.getY();
	}

	public double getPositionX() {
		return position.getX();
	}

	public double getPositionY() {
		return position.getY();
	}

	public void setVelocityX(double velocityX) {
		setVelocities(velocityX, velocity.getY());
	}

	public void setVelocityY(double velocityY) {
		setVelocities(velocity.getX(), velocityY);
	}

	public void setPositionX(double positionX) {
		position.setX(positionX);
	}

	public void setPositionY(double positionY) {
		position.setY(positionY);
	}
}
