package com.darkmop.course;

import com.darkmop.util.Vec2D;

// Hello World!

public class GolfCourse {
	MathExpression profile;

	Vec2D startPos;
	Vec2D targetPos;
	double targetRadius;

	Vec2D grassFriction; // x: kinetic, y: static
	Vec2D sandFriction; // x: kinetic, y: static

	boolean hasSandPit = false;
	Vec2D sandPitTopRight;
	Vec2D sandPitBottomLeft;

	final double H = 0.001;

	public GolfCourse(MathExpression profile, Vec2D startPos, Vec2D targetPos, double targetRadius, double kineticFriction, double staticFriction) {
		this.profile = profile;
		this.startPos = startPos;
		this.targetPos = targetPos;
		this.targetRadius = targetRadius;
		grassFriction = new Vec2D(kineticFriction, staticFriction);
	}

	public void addSandPit(Vec2D topRight, Vec2D bottomLeft, double kineticFriction, double staticFriction) {
		hasSandPit = true;
		sandPitTopRight = topRight;
		sandPitBottomLeft = bottomLeft;
		sandFriction = new Vec2D(kineticFriction, staticFriction);
	}

	public Vec2D getStartPos() {
		return startPos;
	}

	public Vec2D getTargetPos() {
		return targetPos;
	}

	public double getTargetRadius() {
		return targetRadius;
	}

	public double getHeight(Vec2D pos) {
		return profile.eval(pos);
	}

	public Vec2D getSlope(Vec2D pos) {
		double height = getHeight(pos);
		return new Vec2D(
				(getHeight(new Vec2D(pos.getX() + H, pos.getY())) - height) / H,
				(getHeight(new Vec2D(pos.getX(), pos.getY() + H)) - height) / H
		);
	}

	public boolean onTarget(Vec2D pos) {
		return pos.distance(targetPos) < targetRadius;
	}

	public boolean inWater(Vec2D pos) {
		return getHeight(pos) < 0;
	}

	public boolean inSand(Vec2D pos) {
		return pos.getX() > sandPitBottomLeft.getX() && pos.getX() < sandPitTopRight.getX() && pos.getY() > sandPitBottomLeft.getY() && pos.getY() < sandPitTopRight.getY();
	}

	public double getKineticFriction(Vec2D pos) {
		return inSand(pos) ? sandFriction.getX() : grassFriction.getX();
	}

	public double getStaticFriction(Vec2D pos) {
		return inSand(pos) ? sandFriction.getY() : grassFriction.getY();
	}

	@Override
	public String toString() {
		String ret =
				"GolfCourse{\n" +
				"  profile = " + profile + "\n" +
				"  startPos = " + startPos + "\n" +
				"  targetPos = " + targetPos + "\n" +
				"  targetRadius = " + targetRadius + "\n" +
				"  grassFriction = " + grassFriction + "\n";

		if(hasSandPit) {
			ret +=
				"  sandPitTopRight = " + sandPitTopRight + "\n" +
				"  sandPitBottomLeft = " + sandPitBottomLeft + "\n" +
				"  sandFriction = " + sandFriction + "\n";
		}

		return ret + "}";
	}
}
