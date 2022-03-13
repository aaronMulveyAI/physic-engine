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
