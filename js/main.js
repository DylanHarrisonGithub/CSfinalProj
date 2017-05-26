function init() {

    var dataBundle = {
        "user": {"userName": "", "userId": -1, "ready": -1, "turn": -1},
        "knownVisitors": [],
        "opponentId": -1,
        "checkInInterval": null,
        "animationInterval": null,
        "state": 0,
        "myPlane": -1,
        "edges": [],
        "balls": [],
        "pockets": [],
        "animationFrames": [],
        "shootMode": -1,
        "log": []};
    
    setState(0, dataBundle);
    
}

function setState(stateNum, dataBundle) {
    $("#nonGameStateDiv").show();
    $(".stateDiv").hide();
    $("#state" + stateNum.toString()).show();
    dataBundle.state = stateNum;
    
    if (stateNum == 0) {
        clearInterval(dataBundle.checkInInterval);
        clearInterval(dataBundle.animationInterval);
        dataBundle = {
            "user": {"userName": "", "userId": -1, "ready": -1, "turn": -1},
            "knownVisitors": [],
            "opponentId": -1,
            "checkInInterval": null,
            "animationInterval": null,
            "state": 0,
            "myPlane": -1,
            "edges": [],
            "balls": [],
            "animationFrames": [],
            "log": []};
            
        $("#userNameSubmit").off().on("click", function () {
            var userName = $("#userNameInput").val();
            if (userName != "") {
                dataBundle.user.userName = userName;
                getUserId(dataBundle);            
                setState(1, dataBundle);
        }
        
    });
    } else if (stateNum == 1) {
        dataBundle.user.ready = -1;
        clearInterval(dataBundle.checkInInterval);
        dataBundle.checkInInterval = setInterval(function() {checkIn(dataBundle)}, 2000);
    } else if (stateNum == 2) {
        
        $("#planeDiv").empty();
        $("#nonGameStateDiv").hide();
        var mainCanvas = document.createElement('canvas');
        var centerDiv = document.getElementById("planeDiv");
        
        $("#planeDiv").append(mainCanvas);
        mainCanvas.id = "mainCanvas";
        mainCanvas.width = centerDiv.clientWidth;
        mainCanvas.height = centerDiv.clientHeight;
        dataBundle.myPlane = new Plane(mainCanvas);
        
        window.addEventListener("resize", function() {dataBundle.myPlane.defaultResizeListener()});
        
        dataBundle.animationInterval = setInterval(function() {animationEvent(dataBundle)}, 33);
        
        initializeGame(dataBundle);
        
        $("#shootPanButton").off().on("click", function () {
            if (dataBundle.shootMode == -1) {
                $("#shootPanButton").html("Pan Mode");
                dataBundle.shootMode = 1;
                var centerDiv = document.getElementById("planeDiv");
                $(centerDiv).off();
                $(centerDiv).on('DOMMouseScroll mousewheel', function(event) {dataBundle.myPlane.defaultMouseWheelListenerJQuery(event)});
                $(centerDiv).on("mousemove", function(event) {dataBundle.myPlane.defaultMouseMoveListener(event)});
                $(centerDiv).on("click", function(event) {
                    var centerDivRect = dataBundle.myPlane.delegateCanvas.parentNode.getBoundingClientRect();
                    var mouseScreen = {"x": event.clientX-centerDivRect.left, "y": event.clientY-centerDivRect.top};
                    var mouseWorld = dataBundle.myPlane.screenToWorldCoordinates(dataBundle.myPlane.mouseScreen);
                    var shot = {
                        "x": mouseWorld.x - dataBundle.balls[0].center.x,
                        "y": mouseWorld.y - dataBundle.balls[0].center.y,
                        "m": parseFloat($("#power").val())
                    };
                    
                    //shooting not allowed during animation
                    if (dataBundle.animationFrames.length == 0) {
                        $("#shootPanButton").html("Shoot Mode");
                        dataBundle.shootMode = -1;
                        $("#shootPanButton").prop('disabled', true);
                        $("#pleaseWait").html("Please Wait..");
                        shoot(shot, dataBundle);
                    }
                    
                });
            } else {
                $("#shootPanButton").html("Shoot Mode");
                dataBundle.shootMode = -1;
                var centerDiv = document.getElementById("planeDiv");
                $(centerDiv).off();
                $(centerDiv).on('DOMMouseScroll mousewheel', function(event) {dataBundle.myPlane.defaultMouseWheelListenerJQuery(event)});
                $(centerDiv).on("mousemove", function(event) {dataBundle.myPlane.defaultMouseMoveListener(event)});
                $(centerDiv).on("click", function(event) {dataBundle.myPlane.defaultMouseClickListener(event)});
            }
        });
        
    } else if (stateNum == 3) {
    }
}

function doState(dataBundle) {
    
    if (dataBundle.state == 0) {
        
    } else if (dataBundle.state == 1) {
        
        if ((dataBundle.knownVisitors.length > 1) 
            && ((dataBundle.knownVisitors[0].ready == 1) && (dataBundle.knownVisitors[1].ready == 1))
            && ((dataBundle.knownVisitors[0].userId == dataBundle.user.userId) || (dataBundle.knownVisitors[1].userId == dataBundle.user.userId))) {
            
            //get opponent id
            if (dataBundle.knownVisitors[0].userId == dataBundle.user.userId) {
                dataBundle.opponentId = dataBundle.knownVisitors[1].userId;
            } else {
                dataBundle.opponentId = dataBundle.knownVisitors[0].userId;
            }
            setState(2, dataBundle);
        
        } else {
        
            $("#waitPool").empty();
            for (var i = 0; i < dataBundle.knownVisitors.length; i++) {
                
                var listItem = document.createElement('li');
                listItem.className = "list-group-item list-group-item-success clearfix";
                listItem.style.height = "25%";
                listItem.appendChild(document.createTextNode(dataBundle.knownVisitors[i].userName));
                
                if (i < 2) {
                    
                    if (dataBundle.knownVisitors[i].userId == dataBundle.user.userId) {
                        
                        var prSpan = document.createElement('span');
                        prSpan.id = "readySpan";
                        prSpan.className = "pull-right";
                        
                        if (dataBundle.user.ready == -1) {
                            var readyButton = document.createElement('button');
                            //type = 'button' ???
                            readyButton.id = "readyButton";
                            readyButton.className = "btn btn-primary btn-sm";
                            readyButton.innerHTML = "Ready";
                            prSpan.appendChild(readyButton);
                            readyButton.onclick = function() {toggleReady(dataBundle); $("#readySpan").empty();};
                        } else {
                            prSpan.appendChild(document.createTextNode("ready"));
                        }
                                            
                        listItem.appendChild(prSpan);
                                        
                    } else {
                       
                       var prSpan = document.createElement('span');
                       prSpan.className = "pull-right";
                       
                       if (dataBundle.knownVisitors[i].ready == -1) {
                           prSpan.appendChild(document.createTextNode("pending"));
                       } else {
                           prSpan.appendChild(document.createTextNode("ready"));
                       }
                       
                       listItem.appendChild(prSpan);
                       
                    }                        
                }
                $("#waitPool").append(listItem);
            }
        }
        
    } else if (dataBundle.state == 2) {
        
        //make sure opponent is still there
        if ((dataBundle.knownVisitors.length > 1)
        && ((dataBundle.opponentId == dataBundle.knownVisitors[0].userId) || (dataBundle.opponentId == dataBundle.knownVisitors[1].userId))) {
        } else {
            //alert("opponent timed out");
            setState(1, dataBundle);
        }
        
        //update if turn changes
        if (dataBundle.user.turn == 1) {
            if ($("#playerTurnText").html() != "Your Turn") {
                
                $("#playerTurnText").html("Your Turn");
                var centerDiv = document.getElementById("planeDiv");
                $("#shootPanButton").html("Shoot Mode");
                dataBundle.shootMode = -1;
                $("#shootPanButton").prop('disabled', false);
                $(centerDiv).off();
                $(centerDiv).on('DOMMouseScroll mousewheel', function(event) {dataBundle.myPlane.defaultMouseWheelListenerJQuery(event)});
                $(centerDiv).on("mousemove", function(event) {dataBundle.myPlane.defaultMouseMoveListener(event)});
                $(centerDiv).on("click", function(event) {dataBundle.myPlane.defaultMouseClickListener(event)});
                
            }
        } else {
            if (($("#playerTurnText").html() == "Your Turn") || ($("#playerTurnText").html() == "unset")){
                
                $("#playerTurnText").html(dataBundle.knownVisitors[0].userName + "'s Turn");
                var centerDiv = document.getElementById("planeDiv");
                $("#shootPanButton").html("Shoot Mode");
                dataBundle.shootMode = -1;
                $("#shootPanButton").prop('disabled', true);
                $(centerDiv).off();
                $(centerDiv).on('DOMMouseScroll mousewheel', function(event) {dataBundle.myPlane.defaultMouseWheelListenerJQuery(event)});
                $(centerDiv).on("mousemove", function(event) {dataBundle.myPlane.defaultMouseMoveListener(event)});
                $(centerDiv).on("click", function(event) {dataBundle.myPlane.defaultMouseClickListener(event)});

            }
        }
        
    } else if (dataBundle.state == 3) {
    }        
}

function animationEvent(dataBundle) {
    
    //get 2d context
    //var c = dataBundle.myPlane.delegateCanvas;
    var c = document.getElementById("mainCanvas");
    var ctx=c.getContext("2d");
    
    //clear plane canvas
    dataBundle.myPlane.clear(ctx);
    
    //draw grid and coordinate axes
    dataBundle.myPlane.drawGrid(ctx);
    dataBundle.myPlane.drawAxes(ctx);
    
    
    //drawTable
    if (dataBundle.edges.length > 0) {
        ctx.fillStyle = '#557755';
        ctx.beginPath();
        var p = dataBundle.myPlane.worldToScreenCoordinates(dataBundle.edges[0].p0);
        ctx.moveTo(p.x, p.y);
        for (var i = 1; i < dataBundle.edges.length; i++) {
            p = dataBundle.myPlane.worldToScreenCoordinates(dataBundle.edges[i].p0);
            ctx.lineTo(p.x, p.y);
        }
        ctx.closePath();
        ctx.fill();
    }

    //draw any edges
    for (var i = 0; i < dataBundle.edges.length; i++) {
        dataBundle.myPlane.drawEdge(ctx, dataBundle.edges[i])
    }
    
    if (dataBundle.shootMode == 1) {
        dataBundle.myPlane.drawEdge(ctx, {"p0": dataBundle.balls[0].center,"pf": dataBundle.myPlane.mouseWorld}); 
    }
       
    //draw any cirlcles
    for (var i = 0; i < dataBundle.balls.length; i++) {
        dataBundle.myPlane.drawBall(ctx, dataBundle.balls[i], (i+1)%2);
    }

    //get next animation frame, if any
    if (dataBundle.animationFrames != null) {
        if (dataBundle.animationFrames.length > 0) {
            if (dataBundle.balls.length == dataBundle.animationFrames[0].length) {
                var newFrame = dataBundle.animationFrames.shift();
                if (dataBundle.animationFrames.length == 0) {
                    $("#pleaseWait").html("");
                }
                for (var i = 0; i < newFrame.length; i++) {
                    dataBundle.balls[i].center.x = newFrame[i].x;
                    dataBundle.balls[i].center.y = newFrame[i].y;
                }
            }
        }
    }
    
}

function initializeGame(dataBundle) {
    $.ajax({
        "url": "/initializeGame",
        "type": "POST",
        "data": JSON.stringify({"userId": dataBundle.user.userId}),
        "success": function(data) {
            d = JSON.parse(data);
            dataBundle.user.turn = d.turn;
            dataBundle.edges = d.edges;
            dataBundle.balls = d.balls;
            dataBundle.pockets = d.pockets;
        },
        "failure": function(data) {
            setState(0, dataBundle);
        }
    });
}

function getUserId(dataBundle) {
    $.ajax({
        "url": "/getUserId",
        "type": "POST",
        "data": JSON.stringify({"userName": dataBundle.user.userName}),
        "success": function(data) {
            dataBundle.user.userId = parseInt(data);
        },
        "failure": function(data) {
            setState(0, dataBundle);
        }
    });
}

function checkIn(dataBundle) {
    $.ajax({
        "url": "/checkIn",
        "type": "POST",
        "data": JSON.stringify({"userId": dataBundle.user.userId}),
        "success": function(data) {
            d = JSON.parse(data);
            if (d.accepted == 1) {
                
                dataBundle.knownVisitors = d.visitors;
                for (i = 0; i < dataBundle.knownVisitors.length; i++) {
                    if (dataBundle.knownVisitors[i].userId == dataBundle.user.userId) {
                        dataBundle.user.turn = dataBundle.knownVisitors[i].turn;
                    }                   
                }
                                
                //recieve new animation frames if there are none already
                if (dataBundle.animationFrames.length == 0) {
                    dataBundle.animationFrames = d.animationFrames;
                    if (dataBundle.animationFrames.length > 0) {
                        $("#pleaseWait").html("Please Wait..");
                    }
                }
                doState(dataBundle);
            } else {
                //alert("could not check in");
                //setState(0, dataBundle);
            }
        },
        "failure": function(data) {
            //setState(0, dataBundle);
        }
    });
}

function toggleReady(dataBundle) {
    $.ajax({
        "url": "/toggleReady",
        "type": "POST",
        "data": JSON.stringify({"userId": dataBundle.user.userId}),
        "success": function() {
            dataBundle.user.ready *= -1;
        },
        "failure": function(data) {
            setState(0, dataBundle);
        }
    });
}

function shoot(shot, dataBundle) {
    $.ajax({
        "url": "/shoot",
        "type": "POST",
        "data": JSON.stringify({"userId": dataBundle.user.userId, "shot": shot}),
        "success": function() {
            
        },
        "failure": function(data) {
            //setState(0, dataBundle);
        }
    });
}