package com.darkmop.course.Physics;

import com.darkmop.course.GolfCourse;
import com.darkmop.util.Vec2D;

public class Ball {

	public GolfCourse course;

	final double G = 9.80665;

	private Vec2D velocity;
	private Vec2D position;

	// TODO: limit the max velocity???

	public Ball(double x, double y) { // INPUT FROM A FILE
		this.velocity.setToZero();
		this.position.setXY(x, y);
	}

	public Ball() { // TAKING X AND Y COORD AS 0
		this.velocity.setToZero();
		this.position.setToZero();
	}

	public void resetPosition() {
		position.setToZero();
	}

	public void resetVelocity() {
		velocity.setToZero();
	}

	public double pithagorVelocity() {
		double pithagorSum = velocity.distance(velocity);
		return pithagorSum;
	}

	public void setPosition(double x, double y) {
		position.setXY(x, y);
	}

	public void setVelocities(double vX, double vY) {
		velocity.setXY(vX, vY);
	}

	// IS REST?
	public boolean isStop() {// TODO: group ile belirle -> 0.001f gibi bir kucukluk =<
		if (velocity.distance(velocity) == 0)
			return true;

		return false;
	}

	

	public Vec2D gravityForce(Vec2D position){

		double gravity = -getG();
		Vec2D slope =course.getSlope(position);
		
		return new Vec2D(
			
				gravity*slope.getX()
				,
				gravity*slope.getY()			
		);
	}




	// TODO: ACCELERATION METHODDDDD!!!! &&&&& gravity force &&& friction force
	public double accelerationCalculator(double posXorY, double Vx, double Vy) {
		double a = 0;

		// a= -GravityForce -FrictionForce

		return a;// FOR X or Y
	}

	// SECOND ORDER EULER METHOD
	public void movementOfball(double stepsizeH) {


		// FIRST STEP

		// ACCELERATION:

		double aX = accelerationCalculator(getPositionX(), getVelocityX(), getVelocityY());
		double aY = accelerationCalculator(getPositionX(), getVelocityX(), getVelocityY());

		// NEW VELOCITES:

		double newVx = getVelocityX() + aX * stepsizeH;
		double newVy = getVelocityY() + aY * stepsizeH;

		// NEW COORDINATES:

		double newPosX = getPositionX() + getVelocityX() * stepsizeH;
		double newPosY = getPositionY() + getVelocityY() * stepsizeH;

		// SECOND STEP

		// since we created new positions & velocities
		// we need to set them

		setVelocities(newVx, newVy);
		setPosition(newPosX, newPosY);

	}

	public double[] unitVector(double Vx, double Vy) {

		double unit[] = { Vx / pithagorVelocity(), Vy / pithagorVelocity() };

		// thinking example: 5 -> 3 on x and 4 on y
		// its unit vector will be 3/5 on x and 4/5 on y
		// finally the vector itself will be 1

		return unit;
	}

	// GETTERS

	public double getG(){
		return G;
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

	// SETTERS

	public void setVelocityX(double velocityX) {
		this.velocity.setX(velocityX);;
	}
	public void setVelocityY(double velocityY) {
		this.velocity.setY(velocityY);
	}
	public void setPositionX(double positionX) {
		this.position.setX(positionX);
	}
	public void setPositionY(double positionY) {
		this.position.setY(positionY);
	}

}
