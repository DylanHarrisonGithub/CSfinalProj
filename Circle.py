from Edge import *
import math

def generateHTMLColor(r,g,b):
    rString = hex(r)[2:]
    gString = hex(g)[2:]
    bString = hex(b)[2:]
    return '#'+rString + gString + bString
    
class Circle():

    def __init__(self, center, radius, color):
        self.center = center
        self.radius = radius
        self.color = color
        self.filled = True
        self.velocity = Edge(self.center, Point(self.center.x, self.center.y), '#00ff00')
        self.mass = 1.0
    
    def move(self, dt):
        dx = self.velocity.x()
        dy = self.velocity.y()
        self.center.x += dx*dt
        self.center.y += dy*dt
        self.velocity.pf.x += dx*dt
        self.velocity.pf.y += dy*dt
    
    def timeToCollideWithEdge(self, e):
    
        c = Edge(e.p0, self.center, generateHTMLColor(255,0,0))
        cDetE = c.det(e)
        eDetV = e.det(self.velocity)
        cReM = self.radius*e.m()
        
        t1 = 99999
        t2 = 99999
        
        if (self.couldCollideWithEdge(e)):
            if (eDetV != 0):
                t1 = (cDetE + cReM)/eDetV
                t2 = (cDetE - cReM)/eDetV

        if (t1 < 0):
            t1 = 99999
        if (t2 < 0):
            t2 = 9999
            
        return [t1, t2]
        
    def timeToCollideWithPoint(self, p):

        dx = self.center.x - p.x
        dy = self.center.y - p.y        
        dvx = self.velocity.x()
        dvy = self.velocity.y()
        r = self.radius
        
        A = dvx*dvx + dvy*dvy
        B = 2*(dx*dvx + dy*dvy)
        C = dx*dx + dy*dy - r*r

        t1 = 99999
        t2 = 99999

        if ((A != 0) and ((B*B - 4*A*C) >= 0)):
            t1 = (-B + math.sqrt(B*B - 4*A*C))/(2*A)
            t2 = (-B - math.sqrt(B*B - 4*A*C))/(2*A)
            
        if (t1 < 0):
            t1 = 99999
        if (t2 < 0):
            t2 = 9999
        
        return [t1, t2]    
                   
    def timeToCollideWithCircle(self, c):
    
        dx = self.center.x - c.center.x
        dy = self.center.y - c.center.y        
        dvx = self.velocity.x() - c.velocity.x()
        dvy = self.velocity.y() - c.velocity.y()
        r = self.radius + c.radius
        
        A = dvx*dvx + dvy*dvy
        B = 2*(dx*dvx + dy*dvy)
        C = dx*dx + dy*dy - r*r

        t1 = 99999
        t2 = 99999

        if ((A != 0) and ((B*B - 4*A*C) >= 0)):
            t1 = (-B + math.sqrt(B*B - 4*A*C))/(2*A)
            t2 = (-B - math.sqrt(B*B - 4*A*C))/(2*A)
            
        if (t1 < 0):
            t1 = 99999
        if (t2 < 0):
            t2 = 9999
        
        return [t1, t2]
        
    def couldCollideWithEdge(self, e):
        
        eQuadrance = e.q()
        b = Edge(e.p0, self.center, "#000000")
        bDetE = b.det(e)
        
        zComponent = Point(
            e.y()*bDetE/eQuadrance,
            -e.x()*bDetE/eQuadrance
        )
        
        z = Edge(self.center, Point(0,0), "#000000")
        z.setComponent(zComponent)
        zM = z.m()
        
        xComponent = Point(
            (-e.y()*bDetE*self.radius)/(eQuadrance*zM),
            (e.x()*bDetE*self.radius)/(eQuadrance*zM)            
        )
        
        x = Edge(self.center, Point(0,0), "#000000")
        x.setComponent(xComponent)
        
        v = Edge(
            Point(self.center.x, self.center.y),
            Point(self.velocity.pf.x, self.velocity.pf.y),
            "#000000"
        )
        
        v.setOrigin(x.pf)
        
        ts = v.getParametricIntersection(e)
        
        if (((0 <= ts[0]) and (ts[0] <= 1)) and ((0 <= ts[1]) and (ts[1] <= 1))):
            return True
        else:
            return False
        
    def deflectFromEdge(self, e):
        mSquared = e.x()*e.x() + e.y()*e.y()
        p0 = Point(0,0)
        pf = Point((-2*e.y()*self.velocity.det(e))/mSquared, 2*e.x()*self.velocity.det(e)/mSquared)
        x = Edge(p0, pf, generateHTMLColor(255,255,0))
        self.velocity.add(x)
        
    def deflectFromPoint(self, p):
    
        axis = Edge(self.center, p, "#000000")
        quadrance = axis.q()
        vDetA = self.velocity.det(axis)
        vDotA = self.velocity.dot(axis)
        
        vf = Point(
            (axis.y()*vDetA - axis.x()*vDotA)/quadrance,
            (-axis.x()*vDetA - axis.y()*vDotA)/quadrance
        )
        
        self.velocity.setComponent(vf)
        
    def collideWithCircle(self, b):
    
        axis = Edge(self.center, b.center, "#000000")
        axis2 = Edge(self.center, b.center, "#000000")
        
        aPerp = self.velocity.getPerpVec(axis)
        bPerp = b.velocity.getPerpVec(axis)
        
        aVi = self.velocity.projOnto(axis)
        bVi = b.velocity.projOnto(axis)
        
        aVf = (2.0*b.mass*bVi + aVi*(self.mass - b.mass))/(self.mass + b.mass)
        bVf = (2.0*self.mass*aVi + bVi*(b.mass - self.mass))/(self.mass + b.mass)
        
        axis.setM(aVf)       
        aPerp.add(axis)
        aPerp.setOrigin(self.center)
        self.velocity = aPerp
        self.center = self.velocity.p0
        
        axis2.setM(bVf)
        bPerp.add(axis2)
        bPerp.setOrigin(b.center)
        b.velocity = bPerp
        b.center = b.velocity.p0
                   
    def toJSON(self):
        return({
            "center": self.center.toJSON(),
            "radius": self.radius,
            "color": self.color,
            "filled": self.filled,
            "velocity": self.velocity.toJSON(),
            "mass": self.mass
        })