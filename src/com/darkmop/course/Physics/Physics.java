package com.darkmop.course.Physics;

import java.util.Vector;

import com.darkmop.course.GolfCourse;
import com.darkmop.util.Vec2D;

public class Physics {
    
    private GolfCourse course;
    private Ball ball;
    private final float VELOCITY_ERROR = 0.0001f;
    private final float GRAVITY_ACELERATION = -9.81f;
    private final Vec2D FRICCTION_GRASS = new Vec2D(0.05, 0.1); //1- Static fricction  || 2- Kinetic Friction
    private final Vec2D FRICCTION_SAND = new Vec2D(0.05, 0.1); //1- Static fricction  || 2- Kinetic Friction
    private final float TARGET_RADIUS = 0.05f;
    private final float MS = 0.01f;
    public boolean isMoving;

    public Physics(GolfCourse course, Ball ball){
        this.course = course;
        this.ball = ball;
    }

    /**
     * This method calculates if the ball has a very low velocity
     * assuming a small velocity error. if the velocity is smaller
     * than the error it set ball belocity to 0.
     * @return
     */
    public boolean hasLowVelocity(){

        if(ball.getVelocityX() < VELOCITY_ERROR && ball.getVelocityY() < VELOCITY_ERROR){
            ball.setVelocityX(0);
            ball.setVelocityY(0);
            isInSlope();
            return true;
        }else{
            return false;
        }
    }

    /**
     * This  method calculates if the ball is in slope and if the 
     * slope is bigger enougth for continue with the movement.
     * @return
     */
    public boolean isInSlope(){

        Vec2D slope = course.getSlope(new Vec2D(ball.getPositionX(), ball.getPositionY()));
        double x = slope.getX();
        double y = slope.getY();

        if(x == 0 && y == 0){
            return false;
        }else if(x != 0 || y != 0){

            if(MS > Math.sqrt((Math.pow(x, 2) + Math.pow(y, 2)))){
                isMoving = true;
            }else{
                isMoving = false;
            }
        }

        return true;
    }

    public Vec2D calculateGravityForce(){
        Vec2D slope  = course.getSlope(ball.getPosition());
        double slopeX = slope.getX();
        double slopeY = slope.getY();

        return new Vec2D(
            ball.getBallMass()*GRAVITY_ACELERATION*slopeX,
            ball.getBallMass()*GRAVITY_ACELERATION*slopeY);
    }

    /**
     * This method get the ball position(X,Y) and target position(X,Y)
     * and calculate the euclidean distance, if the distance is smaller
     * to the target position it returns true, if not it returns false.
     * @return 
     */
    public boolean isInTarget(){
        double ballPositionX = ball.getPositionX();
        double ballPositionY = ball.getPositionY();
        double targetPositionX = course.getTargetPos().getX();
        double targetPositionY = course.getTargetPos().getY();
        return TARGET_RADIUS > Math.sqrt((Math.pow((ballPositionX - targetPositionX), 2) + Math.pow((ballPositionY - targetPositionY), 2)));
    }

    /**
     * This method get the ball position(X,Y) and target position(X,Y)
     * and calculate the absolute distance  
     * @return A vector 2D with distance of X & Y
     */
    public Vec2D distanceToTheTarget(){
        
        double ballPositionX = ball.getPositionX();
        double ballPositionY = ball.getPositionY();
        double targetPositionX = course.getTargetPos().getX();
        double targetPositionY = course.getTargetPos().getY();
        return new Vec2D(
            Math.abs(targetPositionX-ballPositionX),
            Math.abs(targetPositionY-ballPositionY)
            );
    }

    public double hitBall(){
        return 2.0;
    }
    public void setMovement(boolean movement){
        isMoving = movement;
    }


}
