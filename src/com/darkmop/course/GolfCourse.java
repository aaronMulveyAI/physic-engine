package com.darkmop.course;

import com.darkmop.util.Vec2D;

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

	public double getHeight(Vec2D pos) {
		return profile.eval(pos);
	}

	//TODO: getSlope()

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

	public double[][] generateHeightMap(Vec2D bottomLeft, Vec2D topRight, int width, int height) {
		double data[][] = new double[height][width];
		Vec2D step = new Vec2D((topRight.getX() - bottomLeft.getX()) / width, (topRight.getY() - bottomLeft.getY()) / height);

		for(int i = 0; i < height; i++) {
			for(int j = 0; j < width; j++) {
				Vec2D pos = new Vec2D(bottomLeft.getX() + step.getX() * j, topRight.getY() - step.getY() * i);
				data[i][j] = getHeight(pos);
			}
		}

		return data;
	}

	@Override
	public String toString() {
		String ret = "GolfCourse{\n" +
				"  profile = " + profile + "\n" +
				"  startPos = " + startPos + "\n" +
				"  targetPos = " + targetPos + "\n" +
				"  targetRadius = " + targetRadius + "\n" +
				"  grassFriction = " + grassFriction + "\n";

		if(hasSandPit) {
			ret += "  sandPitTopLeft = " + sandPitTopRight + "\n" +
					"  sandPitBottomRight = " + sandPitBottomLeft + "\n" +
					"  sandFriction = " + sandFriction + "\n";
		}

		return ret + "}";
	}
}
