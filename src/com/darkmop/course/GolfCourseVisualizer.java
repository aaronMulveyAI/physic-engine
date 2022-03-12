package com.darkmop.course;

import com.darkmop.util.Vec2D;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;

public class GolfCourseVisualizer {
	BufferedImage image;
	GolfCourse course;

	final int MIN_RGB_VALUE = 35;

	public GolfCourseVisualizer(GolfCourse course, int outWidth, int outHeight) {
		image = new BufferedImage(outWidth, outHeight, BufferedImage.TYPE_INT_RGB);
		this.course = course;
	}

	public void visualiseRange(Vec2D bottomLeft, Vec2D topRight) {
		int width = image.getWidth();
		int height = image.getHeight();
		double[][] data = new double[height][width];
		Vec2D step = new Vec2D((topRight.getX() - bottomLeft.getX()) / width, (topRight.getY() - bottomLeft.getY()) / height);

		double maxHeight = 0;
		for(int i = 0; i < height; i++) {
			for(int j = 0; j < width; j++) {
				Vec2D pos = new Vec2D(bottomLeft.getX() + step.getX() * j, topRight.getY() - step.getY() * i);
				data[i][j] = course.getHeight(pos);
				if(data[i][j] > maxHeight) maxHeight = data[i][j];
			}
		}

		double scale =  (255.0 - MIN_RGB_VALUE) / maxHeight;

		for(int i = 0; i < height; i++) {
			for(int j = 0; j < width; j++) {
				Vec2D pos = new Vec2D(bottomLeft.getX() + step.getX() * j, topRight.getY() - step.getY() * i);
				if(course.inWater(pos)) {
					image.setRGB(j, i, toARGB(0, 0, 255));
				} else if(course.inSand(pos)) {
					image.setRGB(j, i, toARGB((int)(data[i][j] * scale) + MIN_RGB_VALUE,(int)(data[i][j] * scale) + MIN_RGB_VALUE, 0));
				} else {
					image.setRGB(j, i, toARGB(0, (int)(data[i][j] * scale) + MIN_RGB_VALUE, 0));
				}
			}
		}

		Graphics2D g = (Graphics2D) image.getGraphics();

		Vec2D startPos = new Vec2D(
				(course.getStartPos().getX() - bottomLeft.getX()) / step.getX(),
				(course.getStartPos().getY() - bottomLeft.getY()) / step.getY()
		);

		Vec2D targetPos = new Vec2D(
				(course.getTargetPos().getX() - bottomLeft.getX()) / step.getX(),
				(course.getTargetPos().getY() - bottomLeft.getY()) / step.getY()
		);

		Vec2D targetSize = new Vec2D(course.getTargetRadius() / step.getX() * 2, course.getTargetRadius() / step.getY() * 2);

		g.setColor(new Color(255, 0, 0));
		g.fillOval((int)targetPos.getX(), (int)targetPos.getY(), (int)targetSize.getX(), (int)targetSize.getY());

		g.setColor(new Color(255, 255, 255));
		g.fillOval((int)startPos.getX(), (int)startPos.getY(), (int)targetSize.getX(), (int)targetSize.getY());
	}

	public void output(String fileName) {
		File file = new File(fileName);
		try {
			ImageIO.write(image, "png", file);
		} catch (IOException e) {
			System.out.println("Could not output to " + fileName);
		}
	}

	static int toARGB(int r, int g, int b) {
		return 255<<24 | r<<16 | g<<8 | b;
	}
}
