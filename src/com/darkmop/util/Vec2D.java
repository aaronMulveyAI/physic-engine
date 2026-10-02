package com.darkmop.util;

public class Vec2D {
	double x;
	double y;

	public Vec2D(double x, double y) {
		this.x = x;
		this.y = y;
	}

	public double getX() {
		return x;
	}

	public double getY() {
		return y;
	}

	public void setX(double x) {
		this.x = x;
	}
	
	public void setY(double y) {
		this.y = y;
	}
	
	public void setXY(double x, double y){
		this.x = x; 
		this.y = y;
	}

	public void setToZero(){
		this.x = 0;
		this.y = 0;
	}

	public Vec2D add(Vec2D other) {
		return new Vec2D(x + other.x, y + other.y);
	}

	public Vec2D subtract(Vec2D other) {
		return new Vec2D(x - other.x, y - other.y);
	}

	public Vec2D multiply(double scalar) {
		return new Vec2D(x * scalar, y * scalar);
	}

	public double dot(Vec2D other) {
		return x * other.x + y * other.y;
	}

	public double magnitude() {
		return Math.sqrt(x * x + y * y);
	}

	public Vec2D normalized() {
		double magnitude = magnitude();
		if(magnitude == 0) {
			return new Vec2D(0, 0);
		}
		return new Vec2D(x / magnitude, y / magnitude);
	}

	public double distance(Vec2D other) {
		double dx = x - other.x;
		double dy = y - other.y;
		return Math.sqrt(dx * dx + dy * dy);
	}

	@Override
	public String toString() {
		return "(" + x + ", " + y + ")";
	}
}
