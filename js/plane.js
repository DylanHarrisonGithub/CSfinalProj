function Plane(myCanvas) {

	this.delegateCanvas = myCanvas;
	this.resolution = {"x":myCanvas.width, "y": myCanvas.height};
	this.halfResolution = {"x":myCanvas.width/2.0, "y": myCanvas.height/2.0};
	this.origin = {"x":0.0, "y":0.0};
	this.mouseWorld = {"x": -1.0, "y": -1.0};
	this.mouseScreen = {"x": -1.0, "y": -1.0};
	this.zoom = 1.0;
	this.zoomInverse = 1.0/this.zoom;
	this.backgroundColor = '#4510ff';
	this.gridColor = '#C8C8FF'; //'#C8C8DC';
	this.axesColor = '#000000';
	
	this.screenToWorldCoordinates = function(screenCoordinate) {
		var wc = new Object();
		wc.x = (screenCoordinate.x - this.halfResolution.x)*this.zoomInverse + this.origin.x;
		wc.y = -(screenCoordinate.y - this.halfResolution.y)*this.zoomInverse + this.origin.y;
		return wc;
	};
	
	this.worldToScreenCoordinates = function(worldCoordinate) {
		var sc = new Object();
		sc.x = (worldCoordinate.x - this.origin.x)*this.zoom + this.halfResolution.x;
		sc.y = -(worldCoordinate.y - this.origin.y)*this.zoom + this.halfResolution.y;
		return sc;
	};
	
	this.clear = function(canvas2dContext) {
		//canvas2dContext.clearRect(0,0, this.width, this.height);
		canvas2dContext.fillStyle = this.backgroundColor;
		canvas2dContext.fillRect(0,0, this.resolution.x, this.resolution.y);
	};
	
	this.drawAxes = function(canvas2dContext) {

		var northWest = {"x":0, "y":0};
		var southEast = {"x": this.resolution.x, "y": this.resolution.y};
		
		northWest = this.screenToWorldCoordinates(northWest);
		southEast = this.screenToWorldCoordinates(southEast);

		if ((northWest.x <= 0) && (southEast.x >= 0)) {
			
			var topCoord = {"x":0, "y":northWest.y};
			var bottomCoord = {"x":0,"y":southEast.y};
			
			topCoord = this.worldToScreenCoordinates(topCoord);
			bottomCoord = this.worldToScreenCoordinates(bottomCoord);

			canvas2dContext.strokeStyle = this.axesColor;
			canvas2dContext.beginPath();
			canvas2dContext.moveTo(topCoord.x, topCoord.y);
			canvas2dContext.lineTo(bottomCoord.x, bottomCoord.y);
			canvas2dContext.stroke();
			
		}
		if ((northWest.y >= 0) && (southEast.y <= 0)) {
			
			var leftCoord = {"x":northWest.x, "y":0};
			var rightCoord = {"x":southEast.x, "y":0};

			leftCoord = this.worldToScreenCoordinates(leftCoord);
			rightCoord = this.worldToScreenCoordinates(rightCoord);

			canvas2dContext.strokeStyle = this.axesColor;
			canvas2dContext.beginPath();
			canvas2dContext.moveTo(leftCoord.x, leftCoord.y);
			canvas2dContext.lineTo(rightCoord.x, rightCoord.y);
			canvas2dContext.stroke();
			
		}		
	};
		
	this.drawGrid = function(canvas2dContext) {
				
		var northWest = {"x":0, "y":0};
		var southEast = {"x": this.resolution.x, "y": this.resolution.y};
		
		northWest = this.screenToWorldCoordinates(northWest);
		southEast = this.screenToWorldCoordinates(southEast);
		
		var width = southEast.x - northWest.x;
		var height = northWest.y - southEast.y;
		
		var wMagnitude = Math.floor(Math.log10(width));
		var hMagnitude = Math.floor(Math.log10(height));
		
		if (wMagnitude < hMagnitude) {	
			var m = wMagnitude;
			var p1 = Math.pow(10,m-1);
			var p0 = Math.pow(10,m);
			var ones = Math.floor(width/p1);
			var tens = Math.floor(width/p0);			
		} else {			
			var m = hMagnitude;
			var p1 = Math.pow(10,m-1);
			var p0 = Math.pow(10,m);
			var ones = Math.floor(height/p1);
			var tens = Math.floor(height/p0);
		}

		canvas2dContext.strokeStyle = this.gridColor;
		canvas2dContext.globalAlpha=(1.0-(ones/99.0));
		var leftmostOne = Math.floor(northWest.x/p1)*p1;
		var topCoord = new Object();
		var bottomCoord = new Object();
		while (leftmostOne < southEast.x) {
			topCoord.x = leftmostOne;
			topCoord.y = northWest.y;			
			bottomCoord.x = leftmostOne;
			bottomCoord.y = southEast.y;
			topCoord = this.worldToScreenCoordinates(topCoord);
			bottomCoord = this.worldToScreenCoordinates(bottomCoord);
			canvas2dContext.beginPath();
			canvas2dContext.moveTo(topCoord.x, topCoord.y);
			canvas2dContext.lineTo(bottomCoord.x, bottomCoord.y);
			canvas2dContext.stroke();
			leftmostOne = leftmostOne + p1;						
		}
		
		var bottommostOne = Math.floor(southEast.y/p1)*p1;
		var leftCoord = new Object();
		var rightCoord = new Object();
		while (bottommostOne < northWest.y) {
			leftCoord.x = northWest.x;
			leftCoord.y = bottommostOne;			
			rightCoord.x = southEast.x;
			rightCoord.y = bottommostOne;
			leftCoord = this.worldToScreenCoordinates(leftCoord);
			rightCoord = this.worldToScreenCoordinates(rightCoord);
			canvas2dContext.beginPath();
			canvas2dContext.moveTo(leftCoord.x, leftCoord.y);
			canvas2dContext.lineTo(rightCoord.x, rightCoord.y);
			canvas2dContext.stroke();
			bottommostOne = bottommostOne + p1;						
		}
		
		canvas2dContext.globalAlpha=1.0;
		var leftmostOne = Math.floor(northWest.x/p0)*p0;
		var topCoord = new Object();
		var bottomCoord = new Object();
		while (leftmostOne < southEast.x) {
			topCoord.x = leftmostOne;
			topCoord.y = northWest.y;			
			bottomCoord.x = leftmostOne;
			bottomCoord.y = southEast.y;
			topCoord = this.worldToScreenCoordinates(topCoord);
			bottomCoord = this.worldToScreenCoordinates(bottomCoord);
			canvas2dContext.beginPath();
			canvas2dContext.moveTo(topCoord.x, topCoord.y);
			canvas2dContext.lineTo(bottomCoord.x, bottomCoord.y);
			canvas2dContext.stroke();
			leftmostOne = leftmostOne + p0;						
		}
		
		var bottommostOne = Math.floor(southEast.y/p0)*p0;
		var leftCoord = new Object();
		var rightCoord = new Object();
		while (bottommostOne < northWest.y) {
			leftCoord.x = northWest.x;
			leftCoord.y = bottommostOne;			
			rightCoord.x = southEast.x;
			rightCoord.y = bottommostOne;
			leftCoord = this.worldToScreenCoordinates(leftCoord);
			rightCoord = this.worldToScreenCoordinates(rightCoord);
			canvas2dContext.beginPath();
			canvas2dContext.moveTo(leftCoord.x, leftCoord.y);
			canvas2dContext.lineTo(rightCoord.x, rightCoord.y);
			canvas2dContext.stroke();
			bottommostOne = bottommostOne + p0;						
		}
	};
	
	this.drawEdge = function(canvas2dContext, e) {
		
		var startPoint = this.worldToScreenCoordinates(e.p0);
		var endPoint = this.worldToScreenCoordinates(e.pf);
		
		canvas2dContext.strokeStyle = e.color;
		canvas2dContext.beginPath();
		canvas2dContext.moveTo(startPoint.x, startPoint.y);
		canvas2dContext.lineTo(endPoint.x, endPoint.y);
		canvas2dContext.stroke();
		
	};
	
	this.drawBall = function(canvas2dContext, b, isStriped) {

		var startPoint = this.worldToScreenCoordinates(b.center);
		var radius = b.radius*this.zoom;
		

		canvas2dContext.fillStyle = b.color;
        canvas2dContext.beginPath();
        canvas2dContext.arc(startPoint.x,startPoint.y,radius,0,2*Math.PI);
        canvas2dContext.fill();
        
        if (isStriped == 1) {
            canvas2dContext.fillStyle = '#ffffff';
            canvas2dContext.beginPath();
            canvas2dContext.arc(startPoint.x,startPoint.y,radius*(3.0/5.0),0,2*Math.PI);
            canvas2dContext.fill();
        }

        canvas2dContext.strokeStyle = '#000000';
        canvas2dContext.beginPath();
        canvas2dContext.arc(startPoint.x,startPoint.y,radius,0,2*Math.PI);
        canvas2dContext.stroke();


	};	
	
	this.defaultResizeListener = function() {
		this.delegateCanvas.width = this.delegateCanvas.parentNode.clientWidth;
		this.delegateCanvas.height = this.delegateCanvas.parentNode.clientHeight;
		this.resolution.x = this.delegateCanvas.width;
		this.resolution.y = this.delegateCanvas.height;
		this.halfResolution.x = this.delegateCanvas.width/2.0;
		this.halfResolution.y = this.delegateCanvas.height/2.0;					
	};
	
	this.defaultMouseMoveListener = function(event) {
		
		var centerDivRect = this.delegateCanvas.parentNode.getBoundingClientRect();
		this.mouseScreen = {"x": event.clientX-centerDivRect.left, "y": event.clientY-centerDivRect.top};
		this.mouseWorld = this.screenToWorldCoordinates(this.mouseScreen);
		
	};
	
	this.defaultMouseWheelListener = function(event) {
		if (event.deltaY < 0) {
			this.zoom = this.zoom*(1.05);
			this.zoomInverse = 1.0/this.zoom;
		} else {
			this.zoom = this.zoom*(0.95);
			this.zoomInverse = 1.0/this.zoom;			
		}
	};
    
    this.defaultMouseWheelListenerJQuery = function(event) {
        // usage $(myElement).on('DOMMouseScroll mousewheel', myPlane.defaultMouseWheelListenerJQuery); 
		if ( event.originalEvent.detail > 0 || event.originalEvent.wheelDelta < 0 ) {
			this.zoom = this.zoom*(0.95);
			this.zoomInverse = 1.0/this.zoom;			
		} else {
            this.zoom = this.zoom*(1.05);
			this.zoomInverse = 1.0/this.zoom;            
		}
	};
	
	this.defaultMouseClickListener = function(event) {
		
		var centerDivRect = this.delegateCanvas.parentNode.getBoundingClientRect();
		this.mouseScreen = {"x": event.clientX-centerDivRect.left, "y": event.clientY-centerDivRect.top};
		this.mouseWorld = this.screenToWorldCoordinates(this.mouseScreen);

		this.origin.x = this.mouseWorld.x;
		this.origin.y = this.mouseWorld.y;
		
		this.mouseScreen = {"x": this.halfResolution.x, "y": this.halfResolution.y};
		this.mouseWorld = {"x": 0, "y": 0};

	};
}	