function Ball(center, radius) {
	
	this.center = center;
	this.radius = radius;
	this.color = '#00FF00';
	this.filled = true;
	this.velocity = new Edge(this.center, {"x":this.center.x,"y":this.center.y});
	this.mass = 1.0;
	
	this.move = function(dt) {
		
		var vx = this.velocity.pf.x - this.velocity.p0.x;
		var vy = this.velocity.pf.y - this.velocity.p0.y;
		
		this.center.x += vx*dt;
		this.center.y += vy*dt;
		this.velocity.pf.x = this.center.x + vx;
		this.velocity.pf.y = this.center.y + vy;		
		
	};
	
}