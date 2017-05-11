class Point():

    def __init__(self, x, y):
        self.x = x
        self.y = y
        
    def toJSON(self):
        return({"x": self.x, "y": self.y})
        
    def fromJSON(self, jsonPoint):
        self.x = jsonPoint.x
        self.y = jsonPoint.y