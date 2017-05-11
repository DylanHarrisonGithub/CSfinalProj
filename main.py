#!/usr/bin/env python
#
# Copyright 2007 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
import os
import webapp2
import jinja2
import random
import json
import time
import logging
from Engine import *

users = []
user0RecievedAnimation = False
user1RecievedAnimation = False
engineIsThinking = False
myEngine = Engine()
myEngine.points = [
    Point(400.0, 170.0), Point(430.0, 200.0), Point(400.0, 230.0), Point(370.0, 200.0), 
    Point(21.3, 200.0), Point(21.3, 242.5), Point(-21.3, 242.5), Point(-21.3, 200.0),
    Point(-370.0, 200.0), Point(-400.0, 230.0), Point(-430.0, 200.0), Point(-400.0, 170.0),
    Point(-400.0, -170.0), Point(-430.0, -200.0), Point(-400.0, -230.0), Point(-370.0, -200.0),
    Point(-21.3, -200.0), Point(-21.3, -242.5), Point(21.3, -242.5), Point(21.3, -200.0),
    Point(370.0, -200.0), Point(400.0, -230.0), Point(430.0, -200.0), Point(400.0, -170.0),    
]
myEngine.edges = [
    Edge(myEngine.points[0], myEngine.points[1], "#000000"),
    Edge(myEngine.points[1], myEngine.points[2], "#000000"),
    Edge(myEngine.points[2], myEngine.points[3], "#000000"),
    Edge(myEngine.points[3], myEngine.points[4], "#000000"),
    Edge(myEngine.points[4], myEngine.points[5], "#000000"),
    Edge(myEngine.points[5], myEngine.points[6], "#000000"),
    Edge(myEngine.points[6], myEngine.points[7], "#000000"),
    Edge(myEngine.points[7], myEngine.points[8], "#000000"),
    Edge(myEngine.points[8], myEngine.points[9], "#000000"),
    Edge(myEngine.points[9], myEngine.points[10], "#000000"),    
    Edge(myEngine.points[10], myEngine.points[11], "#000000"),
    Edge(myEngine.points[11], myEngine.points[12], "#000000"),
    Edge(myEngine.points[12], myEngine.points[13], "#000000"),
    Edge(myEngine.points[13], myEngine.points[14], "#000000"),
    Edge(myEngine.points[14], myEngine.points[15], "#000000"),
    Edge(myEngine.points[15], myEngine.points[16], "#000000"),    
    Edge(myEngine.points[16], myEngine.points[17], "#000000"),
    Edge(myEngine.points[17], myEngine.points[18], "#000000"),
    Edge(myEngine.points[18], myEngine.points[19], "#000000"),
    Edge(myEngine.points[19], myEngine.points[20], "#000000"),
    Edge(myEngine.points[20], myEngine.points[21], "#000000"),
    Edge(myEngine.points[21], myEngine.points[22], "#000000"),    
    Edge(myEngine.points[22], myEngine.points[23], "#000000"),    
    Edge(myEngine.points[23], myEngine.points[0], "#000000")
]
myEngine.circles = [
    Circle(Point(200.0, 0.0), 10.0, '#ffffff'),    
    Circle(Point(-200.0, 0.0), 10.0, '#ff00ff'),    
    Circle(Point(-220.0, 11.0), 10.0, '#00ff00'),
    Circle(Point(-220.0, -11.0), 10.0, '#0000ff'),
    Circle(Point(-240.0, 21.0), 10.0, '#ff0000'),
    Circle(Point(-240.0, 0.0), 10.0, '#000000'),
    Circle(Point(-240.0, -21.0), 10.0, '#00ffff'),    
    Circle(Point(-260.0, 32.0), 10.0, '#ffff00'),
    Circle(Point(-260.0, 11.0), 10.0, '#88ff00'),
    Circle(Point(-260.0, -11.0), 10.0, '#0088ff'),    
    Circle(Point(-260.0, -32.0), 10.0, '#ff0088'),
]

JINJA_ENVIRONMENT = jinja2.Environment(
    loader = jinja2.FileSystemLoader(os.path.dirname(__file__)),
    extensions = ['jinja2.ext.autoescape'],
    autoescape = True)
    
class MainHandler(webapp2.RequestHandler):
    def get(self):
        global users
        
        t = time.time()
        for i in range(len(users)-1, -1, -1):
            if ((t-users[i]['time']) > 60):
                users.pop(i)
                
        if (len(users) < 4):
            template_values = {}
            template = JINJA_ENVIRONMENT.get_template('html/index.html')
            self.response.write(template.render(template_values))
        else:
            html = '''
            <!DOCTYPE html>
            <html>
                <head>
                </head>
                <body>
                    <p>Sorry The Server Is Busy! retry in 1 minute</p>
                </body>
            </html>
            '''
            self.response.write(html)

class GetUserId(webapp2.RequestHandler):
    def post(self):
        global users
        
        #associate username with unique id
        isUnique = False
        userName = json.loads(self.request.body)['userName']
        while not isUnique:
            n = random.randint(0, 100000)
            isUnique = True
            for u in users:
                if (u['userId'] == n):
                    isUnique = False
                    
        users.append({"userId": n, "userName": userName, "ready": -1, "turn": -1, "ttl": len(users)+5, "time": time.time()})
        self.response.write(json.dumps(n))            
        
class CheckIn(webapp2.RequestHandler):
    def post(self):
        global users, myEngine, user0RecievedAnimation, user1RecievedAnimation, engineIsThinking
        checkInDataBundle = json.loads(self.request.body)
        myId = checkInDataBundle['userId']
        
        #eventually boot users that dont check in
        userExists = False
        for i in range(len(users)-1, -1, -1):
            if (myId == users[i]['userId']):
                users[i]['ttl'] = len(users)+5
                users[i]['time'] = time.time()
                userExists = True
            else:
                users[i]['ttl'] -= 1
                if (users[i]['ttl'] == 0):
                    users.pop(i)
        
        #assemble user list
        userList = []
        for i in range(0, len(users)):
            userList.append({"userId": users[i]['userId'], "userName": users[i]['userName'], "ready": users[i]['ready'], "turn": users[i]['turn']})
        
        #transmit animation frames when available
        animation = []
        if ((engineIsThinking == False) and (len(myEngine.animationList) > 0) and (len(users) > 1)):
            #only to in-game players
            
            #getting unpredictable index out of bounds errors when deployed???
            try:
                if (myId == users[0]['userId']) and (user0RecievedAnimation == False):
                    user0RecievedAnimation = True
                    animation = myEngine.animationList
                elif (myId == users[1]['userId']) and (user1RecievedAnimation == False):
                    user1RecievedAnimation = True
                    animation = myEngine.animationList
            except:
                user1RecievedAnimation = False
                animation = []
                
        if (userExists):
            self.response.write(json.dumps({"accepted": 1, "visitors": userList, "animationFrames": animation}))
        else:
            self.response.write(json.dumps({"accepted": -1, "visitors": userList, "animationFrames": []}))

class ToggleReady(webapp2.RequestHandler):
    def post(self):
        global users
        id = json.loads(self.request.body)['userId']
        for i in range(0, len(users)):
            if (users[i]['userId'] == id):                
                users[i]['ready'] = 1

class InitializeGame(webapp2.RequestHandler):
    def post(self):
        global users, myEngine
        id = json.loads(self.request.body)['userId']
        turn = -1
        if (len(users) > 0):
            if (users[0]['userId'] == id):
                turn = 1
                users[0]['turn'] = 1
        
        edgeList = []
        for e in myEngine.edges:
            edgeList.append(e.toJSON())

        ballList = []
        for b in myEngine.circles:
            ballList.append(b.toJSON())            
        
        #todo pockets
        
        self.response.write(json.dumps({"turn": turn, "edges": edgeList, "balls": ballList, "pockets": []}))

class Shoot(webapp2.RequestHandler):
    def post(self):
        global users, myEngine, user0RecievedAnimation, user1RecievedAnimation, engineIsThinking
        
        shootDataBundle = json.loads(self.request.body)
        myId = shootDataBundle['userId']
        
        if (len(users) > 1):
            if (myId == users[0]['userId']):
                users[0]['turn'] = -1
                users[1]['turn'] = 1
            else:
                users[0]['turn'] = 1
                users[1]['turn'] = -1

            #prevent transmission while thinking
            engineIsThinking = True
            
            shot = shootDataBundle['shot']
            myEngine.circles[0].velocity.setComponent(Point(shot['x'], shot['y']))
            myEngine.circles[0].velocity.setM(shot['m'])
            logging.info( myEngine.circles[0].velocity.m() );
            myEngine.animationList = []
            myEngine.inMotion = True
            dt = 0.033
            while (myEngine.inMotion == True):
                myEngine.updateStateWithDeltaTime(dt)
                myEngine.animationList.append(myEngine.getJSONCircleCenterList())
                myEngine.reduceVelocities()
            
            logging.info( len(myEngine.animationList) );
            
            #allow transmission after thinking
            engineIsThinking = False
            user0RecievedAnimation = False
            user1RecievedAnimation = False
            
        #else:
            #reset
            #users = []
            
class GetServerTime(webapp2.RequestHandler):
    def get(self):
        self.response.write(json.dumps(time.time()))
        
class Reset(webapp2.RequestHandler):
    def get(self):
        global users
        
        html = '''
        <!DOCTYPE html>
        <html>
            <head>
            </head>
            <body>
                <ul>'''
                
        for u in users:
            html += '''<li>userName: ''' + u['userName'] + ''', userId: ''' + str(u['userId']) + '''</li>'''
            
        html += '''
                </ul>
            </body>
        </html>'''
        
        users = []
        myEngine.circles = [
            Circle(Point(200.0, 0.0), 10.0, '#ffffff'),    
            Circle(Point(-200.0, 0.0), 10.0, '#ff00ff'),    
            Circle(Point(-220.0, 11.0), 10.0, '#00ff00'),
            Circle(Point(-220.0, -11.0), 10.0, '#0000ff'),
            Circle(Point(-240.0, 21.0), 10.0, '#ff0000'),
            Circle(Point(-240.0, 0.0), 10.0, '#000000'),
            Circle(Point(-240.0, -21.0), 10.0, '#00ffff'),    
            Circle(Point(-260.0, 32.0), 10.0, '#ffff00'),
            Circle(Point(-260.0, 11.0), 10.0, '#88ff00'),
            Circle(Point(-260.0, -11.0), 10.0, '#0088ff'),    
            Circle(Point(-260.0, -32.0), 10.0, '#ff0088'),
        ]
        self.response.write(html)
        
        
app = webapp2.WSGIApplication([
    ('/', MainHandler),
    ('/getUserId', GetUserId),
    ('/checkIn', CheckIn),
    ('/getServerTime', GetServerTime),
    ('/toggleReady', ToggleReady),
    ('/initializeGame', InitializeGame),
    ('/shoot', Shoot),
    ('/reset', Reset)
], debug=True)
