package com.darkmop.course.Physics;

import java.util.Scanner;

import com.darkmop.course.GolfCourse;
import com.darkmop.course.MathExpression;
import com.darkmop.util.Vec2D;

public class Simulation {
    
    Scanner sc = new Scanner(System.in);

    public Simulation(Physics physics){

        while(!physics.isInTarget()){
            double Px = sc.nextDouble();
            double Py = sc.nextDouble();
            double Vx = sc.nextDouble();
            double Vy = sc.nextDouble();
            
	            physics.hitBall(new Vec2D(Px, Py), new Vec2D(Vx, Vy));
	            System.out.println(physics.getLastSnapshot());
        }
        System.out.println("Target reach");
    }

    public static void main(String[] args) {
        Vec2D startPos = new Vec2D(0, 0);
        Vec2D targetPos = new Vec2D(1, 4);
	        MathExpression z = new MathExpression("0");

        GolfCourse course = new GolfCourse(z, startPos, targetPos, 0.01, 0.1, 0.2);
        Ball ball = new Ball(0,0, course);
        Physics p = new Physics(course, ball);
        Simulation s = new Simulation(p);
    }
}
