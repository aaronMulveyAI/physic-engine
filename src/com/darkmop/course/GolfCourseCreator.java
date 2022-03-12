package com.darkmop.course;

import com.darkmop.util.Vec2D;

import java.io.File;
import java.io.FileNotFoundException;
import java.util.Scanner;

public class GolfCourseCreator {
	public static GolfCourse createFromFile(String fileName) {
		File file = new File(fileName);

		Scanner scanner;
		try {
			scanner = new Scanner(file);
		} catch (FileNotFoundException e) {
			System.out.println("file " + fileName + " not found");
			return null;
		}

		double x0 =  Double.parseDouble(scanner.nextLine().replace("x0 = ", ""));
		double y0 =  Double.parseDouble(scanner.nextLine().replace("y0 = ", ""));
		double xt =  Double.parseDouble(scanner.nextLine().replace("xt = ", ""));
		double yt =  Double.parseDouble(scanner.nextLine().replace("yt = ", ""));
		double r =  Double.parseDouble(scanner.nextLine().replace("r = ", ""));
		double kFrictionGrass =  Double.parseDouble(scanner.nextLine().replace("muk = ", ""));
		double sFrictionGrass =  Double.parseDouble(scanner.nextLine().replace("mus = ", ""));
		MathExpression profile =  new MathExpression(scanner.nextLine().replace("heightProfile = ", ""));

		GolfCourse course = new GolfCourse(profile, new Vec2D(x0, y0), new Vec2D(xt, yt), r, kFrictionGrass, sFrictionGrass);

		if(scanner.hasNextLine()) {
			String rangeX = scanner.nextLine().replace("sandPitX = ", "");
			String rangeY = scanner.nextLine().replace("sandPitY = ", "");
			double kFrictionSand = Double.parseDouble(scanner.nextLine().replace("muks = ", ""));
			double sFrictionSand = Double.parseDouble(scanner.nextLine().replace("muss = ", ""));

			Vec2D sandTopRightCorner = new Vec2D(
					Double.parseDouble(rangeX.split("<")[2]),
					Double.parseDouble(rangeY.split("<")[2])
			);

			Vec2D sandBottomLeftCorner = new Vec2D(
					Double.parseDouble(rangeX.split("<")[0]),
					Double.parseDouble(rangeY.split("<")[0])
			);

			course.addSandPit(sandTopRightCorner, sandBottomLeftCorner, kFrictionSand, sFrictionSand);
		}

		scanner.close();

		return course;
	}
}
