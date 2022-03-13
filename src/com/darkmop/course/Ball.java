package com.darkmop.course;


public class Ball {
		
	
	private double VelocityX;
	private double positionX;
	private double VelocityY;
	private double positionY;
	
	//TODO: limit the max velocity???
		
	public Ball(double x, double y) { //INPUT FROM A FILE
		
		VelocityX = 0;
		VelocityY = 0;
		this.positionX = x;
		this.positionY = y;
	}
	
	public Ball() {					//TAKING X AND Y COORD AS 0
		
		VelocityX = 0;
		VelocityY = 0;
		this.positionX = 0;
		this.positionY = 0;
	}
	
	public void resetLocation(){
		positionX=0;
		positionY=0;
	}
	
	public void resetVelocity(){
		VelocityX = 0;
		VelocityY = 0;
	}
		
	public double PisagorVelocity() {
		
		double pisagorSum = Math.sqrt(VelocityX*VelocityX+VelocityY+VelocityY);
		return pisagorSum;
	}
	
	public void SetCoordinates(double X, double Y) {
		
		positionX=X;
		positionY=Y;
		
	}
	
	public void SetVelocities(double Vx, double Vy) {
		
		VelocityX = Vx;
		VelocityY = Vy;
		
	}
		
	//IS REST?
	public boolean isStop() {//TODO: group ile belirle -> 0.001f gibi bir kucukluk =<
		
		if(Math.sqrt(VelocityX*VelocityX+VelocityY+VelocityY)==0)
			return true;
		
		return false;
			
	}
	
	
	//TODO:
	public double slopeCalculator(double posX, double posY) {
		return 0;
	}
		
		
	//TODO: ACCELERATION METHODDDDD!!!! &&&&& gravity force &&& friction force	
	public double accelerationCalculator(double posXorY, double Vx, double Vy) {
		
		double a= 0;
		
		//a= -GravityForce -FrictionForce
		
		return a;//FOR X or Y
	}	
	
		
	
	
	//SECOND ORDER EULER METHOD
		public void movementOfball(double stepsizeH){
			
			//TODO: ALL CAN BE DONE IN AN ARRAY IF THATs PREFFERED
			
			//TODO:ACCELERATION YERININ DEGISMEMESI LAZIM OKAY AMA COORINATES VE VELOCITIES YER DEGISTIRSE SIRALAMADA FARK YOK GIBI?

	//FIRST STEP		
			
			//ACCELERATION:
			
			double aX= accelerationCalculator(getPositionX(), getVelocityX(), getVelocityY());
			double aY= accelerationCalculator(getPositionX(), getVelocityX(), getVelocityY());
									
			
			//NEW VELOCITES:
			
			double newVx = getVelocityX() + aX * stepsizeH;
			double newVy = getVelocityY() + aY * stepsizeH;
			
						
			//NEW COORDINATES:
			
			double newPosX = getPositionX() + getVelocityX()*stepsizeH;
			double newPosY = getPositionY() + getVelocityY()*stepsizeH;
			
			
	//SECOND STEP	
			
			//since we created new positions & velocities
			//we need to set them
			
			SetVelocities(newVx, newVy);
			SetCoordinates(newPosX, newPosY);		
			
		}
		
		
		
	public double[] unitVector(double Vx, double Vy) {
		
		double unit[] = {Vx/PisagorVelocity(),Vy/PisagorVelocity()};
		
		//thinking example:  5 -> 3 on x and 4 on y
		//its unit vector will be 3/5 on x and 4/5 on y
		//finally the vector itself will be 1 
		
		return unit;
	}	
	
	
	//GETTER & SETTER'S

	public double getVelocityX() {
		return VelocityX;
	}

	public void setVelocityX(double velocityX) {
		VelocityX = velocityX;
	}

	public double getPositionX() {
		return positionX;
	}

	public void setPositionX(double positionX) {
		this.positionX = positionX;
	}

	public double getVelocityY() {
		return VelocityY;
	}

	public void setVelocityY(double velocityY) {
		VelocityY = velocityY;
	}

	public double getPositionY() {
		return positionY;
	}

	public void setPositionY(double positionY) {
		this.positionY = positionY;
	} 
	

}

