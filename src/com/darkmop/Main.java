package com.darkmop;

import com.darkmop.course.GolfCourse;
import com.darkmop.course.GolfCourseVisualizer;
import com.darkmop.util.Vec2D;

import static com.darkmop.course.GolfCourseCreator.createFromFile;

public class Main {
    public static void main(String[] args) {
        GolfCourse course = createFromFile("courses/example_input.txt");
        System.out.println(course);

        GolfCourseVisualizer visualizer = new GolfCourseVisualizer(course, 400, 400);
//        visualizer.visualiseHeightRange(new Vec2D(-50, -50), new Vec2D(50, 50));
        visualizer.visualiseSlopeRange(new Vec2D(-50, -50), new Vec2D(50, 50));
        visualizer.output("courses/example_input.png");
    }
}
