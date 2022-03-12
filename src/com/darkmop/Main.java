package com.darkmop;

import com.darkmop.course.GolfCourse;
import com.darkmop.util.Vec2D;

import static com.darkmop.course.GolfCourseCreator.createFromFile;
import static com.darkmop.util.PrintPixel.printPixel;

public class Main {
    public static void main(String[] args) {
        GolfCourse course = createFromFile("courses/example_inputfile.txt");
        System.out.println(course);

        double heightMap[][] = course.generateHeightMap(new Vec2D(-100, -100), new Vec2D(100, 100), 100, 100);
        double scale = 10 / 1;

        for(int i = 0; i < heightMap.length; i++) {
            for(int j = 0; j < heightMap[0].length; j++ ) {
                if(heightMap[i][j] > 0) printPixel(0, (int)(heightMap[i][j] * 255.0 / 10.0 * scale), 0);
                else printPixel(0, 0, 255);
            }
            System.out.println();
        }
    }
}
