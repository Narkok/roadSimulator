var maxCarsCount = 20;
var maxBlocksCount = 20;
var roadLength = parseInt($(".road").css("width"));
var windowWidth = parseInt($("body").css("width"));
var windowHeight = parseInt($("body").css("height"));

var start = 0;
var tickTimer;
var trafficTimer;

var minSpeed = 20;
var maxSpeed = 60;
var minMinSpeed = 10;
var maxMaxSpeed = 120;
var traffic = 10;
var slowdown = 4;
var carsId = new Set();
var carsCount = 0;
var blocksId = new Set();
var blocksCount = 0;

$("#cleanButton").click(function() 
{
    var i = 0;
    while (i < road.roadToRight.cars.length)
    {
        if (road.roadToRight.cars[i].situation == "crashed")
            road.roadToRight.deleteCar(i);
        else i++;
    }
    i = 0;
    while (i < road.roadToLeft.cars.length)
    {
        if (road.roadToLeft.cars[i].situation == "crashed")
            road.roadToLeft.deleteCar(i);
        else i++;
    }
});

$("#redButton").click(function() 
{
    for (var i = 0; i < road.roadToRight.cars.length; i++) 
        road.roadToRight.cars[i].setSituation("crashed");
    for (var i = 0; i < road.roadToLeft.cars.length; i++) 
        road.roadToLeft.cars[i].setSituation("crashed");
});

$("#playButton").click(function() 
{
    if (start == 0)
    {
        start = 1;
        tickTimer = setInterval(update,100);
        trafficTimer = setInterval(newCar,60000/traffic);
        $("#playButton").html("pause");
    }
    else
    {
        start = 0;
        clearInterval(tickTimer);
        clearInterval(trafficTimer);
        $("#playButton").html("continue");
    }
});

$(".closeButton").click(function() {window.close();});
$(".restartButton").click(function() {location.reload();});

function minSpeedChange(newMinSpeed) 
{
    newMinSpeed = parseInt(newMinSpeed);
    if ((newMinSpeed >= minMinSpeed) && (newMinSpeed <= maxSpeed))
        minSpeed = newMinSpeed;
    else document.getElementById("minSpeedInput").value = minSpeed;
    return;
}

function maxSpeedChange(newMaxSpeed) 
{
    newMaxSpeed = parseInt(newMaxSpeed);
    if ((newMaxSpeed <= maxMaxSpeed) && (newMaxSpeed >= minSpeed)) 
        maxSpeed = newMaxSpeed;
    else document.getElementById("maxSpeedInput").value = maxSpeed;
    return;
}

function trafficChange(newTraffic) 
{
    newTraffic = parseInt(newTraffic);
    if ((newTraffic <= 120) && (newTraffic > 0)) 
    {
        traffic = newTraffic;
        clearInterval(trafficTimer);
        trafficTimer = setInterval(newCar,100000/traffic);
    }
    else document.getElementById("trafficInput").value = traffic;
    return;
}

function slowdownChange(newSlowdown) 
{
    newSlowdown = parseInt(newSlowdown);
    if (newSlowdown > 0)
        slowdown = newSlowdown;
    else document.getElementById("slowdownInput").value = slowdown;
    return;
}

function getRandomInt(min, max) 
{return Math.floor(Math.random() * (max - min)) + min;}

function htmlCarConstructor(car) 
{
    var htmlCarId = "car_" + car.carId;
    $(".road").append(" <div class=\"car\" id=" + htmlCarId + ">\
                            <img id=\"carImg\" src=\"src/car.png\">\
                            <img id=\"carLights\" src=\"src/lights.png\">\
                            <img id=\"lightLeft\" src=\"src/lightLeft.png\">\
                            <img id=\"lightRight\" src=\"src/lightRight.png\">\
                            <div id=\"carSpeed\">" + car.speed + "</div>\
                        </div>");

    var posY;
    if (car.flow == "toRight")
    {
        $("#" + htmlCarId).css("left","-70px");
        posY = "bottom";
    }
    else
    {
        $("#" + htmlCarId).css("right","-70px");
        posY = "top";  
        $("#" + htmlCarId + " img").css("transform","rotate(180deg)");      
    }

    if (car.line == 1)      
        $("#" + htmlCarId).css(posY,"14px");
    
    else if (car.line == 2) 
        $("#" + htmlCarId).css(posY,"85px");
    
    else                
        $("#" + htmlCarId).css(posY,"156px");
}

function blockClick(block)
{
    road.deleteBlock(block);
}

function htmlBlockConstructor(block) 
{
    var htmlBlockId = "block_" + block.blockId;
    $(".road").append(" <div class=\"block\" flow=" + block.flow + "\
                            id=" + htmlBlockId + "\
                            onClick=\"blockClick(this)\">\
                            <img src=\"src/block.png\"></div>");

    var posY;
    var posX;

    if (block.flow == "toRight")
    {
        posY = "bottom";
        posX = "left";
    }
    else
    {
        posY = "top"; 
        posX = "right";   
    }

    posPX = block.position + "px";
    $("#" + htmlBlockId).css(posX, posPX);

    if (block.line == 1)      
        $("#" + htmlBlockId).css(posY, "8px");
    else if (block.line == 2) 
        $("#" + htmlBlockId).css(posY, "78px");
    else                
        $("#" + htmlBlockId).css(posY, "148px");
}

function htmlCarUpdate(car) 
{
    var htmlCarId = "car_" + car.carId;
    var posX; 

    if (car.flow == "toRight") 
        posX = "left";
    else 
        posX = "right";
    $("#" + htmlCarId).css(posX, car.position + "px");
    $("#" + htmlCarId + " #carSpeed").html(car.speed);

    if (car.status == "speedDown")
        $("#" + htmlCarId + " #carLights").css("opacity","1");
    else
        $("#" + htmlCarId + " #carLights").css("opacity","0");
}

function htmlCarLineChanging(car)
{
    var htmlCarId = "car_" + car.carId;
    var linesPos = [0,14,85,156];

    var lcc0 = Math.abs(car.lineChangingCounter[0]);
    var lcc1 = car.lineChangingCounter[1];

    if (car.flow == "toRight")
        var posY = "bottom";
    else
        var posY = "top"; 

    var posPX = linesPos[car.line];
    if (lcc1 != 0) posPX = posPX - 71*lcc1/lcc0;

    $("#" + htmlCarId).css(posY, posPX + "px");

    lcc1 = Math.abs(lcc1);
    var rotateMax = 30 + 3*(lcc0-10);
    var rotate = 2 * Math.abs(lcc0/2 - (Math.abs(lcc1 - lcc0/2))) / lcc0;
    var rotateDeg = rotateMax * rotate;

    if (car.lineChangingCounter[0] > 0)
    {
        rotateDeg = -rotateDeg;
        $("#" + htmlCarId + " #lightLeft").css("opacity","1");
    }
    else 
        $("#" + htmlCarId + " #lightRight").css("opacity","1");

    if (Math.abs(car.lineChangingCounter[1]) <= 1)
    {
        $("#" + htmlCarId + " #lightLeft").css("opacity","0");
        $("#" + htmlCarId + " #lightRight").css("opacity","0");
    }
    $("#" + htmlCarId).css("transform", "rotate(" + rotateDeg + "deg)");
}

function htmlCarCrash(car)
{ 
    var htmlCarId = "car_" + car.carId;

    if (car.speed > 0)
    {
        if (car.flow == "toRight") posX = "left";
        else posX = "right";
        $("#" + htmlCarId).css(posX, car.position + 2 + "px");
    } 

    $("#" + htmlCarId + " #carSpeed").remove();
    $("#" + htmlCarId + " #carImg").remove();
    $("#" + htmlCarId).append("<img class=\"burningCar\" src=\"src/crashedCar.png\">");
    $("#" + htmlCarId).append("<img class=\"fire\"\
                                style=\"width:60px;\
                                    display: block;\
                                    width: 70px;\
                                    height: 70px;\
                                    position: absolute;\
                                    left:-5px;\
                                    right:auto;\
                                    bottom: 5px;\
                                    top: auto;\
                                    z-index: 4;\"\
                                 src=\"src/fire.gif\">");

    if (car.flow == "toLeft")
    {
        $("#" + htmlCarId + " .fire").css("right","-5px");
        $("#" + htmlCarId + " .fire").css("left","auto");
        $("#" + htmlCarId + " .burningCar").css("transform","rotate(180deg)");
    }
}

function htmlCarRemove(carId)
{
    var htmlCarId = "car_" + carId;
    $("#" + htmlCarId).remove();
}

function htmlBlockRemove(blockId)
{
    var htmlBlockId = "block_" + blockId;
    $("#" + htmlBlockId).remove();
}

function inicialBlockProcessing(position, flow, line)
{
    road.newBlock(position, flow, line);
}

$("#toRightLine1").click(function(event)
{inicialBlockProcessing(event.pageX - $(this).offset().left, "toRight", 1);});

$("#toRightLine2").click(function(event)
{inicialBlockProcessing(event.pageX - $(this).offset().left, "toRight", 2);});

$("#toRightLine3").click(function(event)
{inicialBlockProcessing(event.pageX - $(this).offset().left, "toRight", 3);});

$("#toLeftLine1").click(function(event)
{inicialBlockProcessing(event.pageX - $(this).offset().left, "toLeft", 1);});

$("#toLeftLine2").click(function(event) 
{inicialBlockProcessing(event.pageX - $(this).offset().left, "toLeft", 2);});

$("#toLeftLine3").click(function(event) 
{inicialBlockProcessing(event.pageX - $(this).offset().left, "toLeft", 3);});

// --------------------------------------

function inPoly(coord, rectCoords)
{
    var j = rectCoords.length - 1;
    var r = 0;
    var x = coord[0];
    var y = coord[1];
    for (i = 0; i < rectCoords.length;i++)
    {
        if (((rectCoords[i][1]<=y) && (y<rectCoords[j][1])) || ((rectCoords[j][1]<=y) && (y<rectCoords[i][1]))) 
            if (x > (rectCoords[j][0] - rectCoords[i][0]) * (y - rectCoords[i][1]) / (rectCoords[j][1] - rectCoords[i][1]) + rectCoords[i][0])
                r = !r
        j = i;
    }
    return r;
}

function checkCollision(rect1,rect2)
{
    var r = 0;
    for (var i = 0; i < rect1.length; i++) 
        if ((inPoly(rect1[i],rect2)) || (inPoly(rect2[i],rect1)))
            r = 1;
    return r;
}

class Road 
{
    constructor(flow)
    {
        this.cars = [];
        this.blocks = [];
        this.flow = flow;
    }

    findFreeLine(from, to, exclude)
    {
        var freeLines = new Set();
        freeLines.add(1);
        freeLines.add(2);
        freeLines.add(3);
        freeLines.delete(exclude);
        if (exclude == 1) freeLines.delete(3);
        else if (exclude == 3) freeLines.delete(1);

        for (var i = 0; i < this.cars.length; i++)
        {
            var carPosition = this.cars[i].getLinesPosition();
            for (var line = 1; line <= 3; line++)
                if ((carPosition[line] < to) && (carPosition[line] > from))
                    freeLines.delete(line);
        }

        for (var i = 0; i < this.blocks.length; i++) 
        {
            var blockPosition = this.blocks[i].getPosition();
            if ((blockPosition < to) && (blockPosition >= from + 60))
            {
                var line = this.blocks[i].getLine();
                freeLines.delete(line);
            }
        }

        let freeLinesArray = Array.from(freeLines);
        if (freeLinesArray.length == 0) return 0;
        var randomFreeLine = getRandomInt(0,freeLinesArray.length);
        return(freeLinesArray[randomFreeLine]);
    }

    checkDistance()
    {
        for (var i = 0; i < this.cars.length; i++) 
        {
            var distance = 500;
            var line = this.cars[i].getLine();
            var position = this.cars[i].getLinesPosition();

            for (var j = 0; j < this.cars.length; j++) 
                if (i != j)
                {
                    var jPos = this.cars[j].getLinesPosition();
                    if ((jPos[line] > position[line]) && (jPos[line] - position[line] < distance))
                        distance = jPos[line] - position[line];
                }

            for (var j = 0; j < this.blocks.length; j++) 
            {
                var blockPosition = this.blocks[j].getPosition();
                var blockLine = this.blocks[j].getLine();
                if (blockLine == line)
                    if (blockPosition > position[line])
                        if (blockPosition - position[line] < distance)
                            distance = blockPosition - position[line];
            }
            this.cars[i].setDistance(distance - 70);
        }
    }

    getFrontSpeed(carNum, desSpeed)
    {
        var distance = 500;
        var line = this.cars[carNum].getLine();
        var position = this.cars[carNum].getLinesPosition();

        for (var j = 0; j < this.cars.length; j++) 
            if (carNum != j)
            {
                var jPos = this.cars[j].getLinesPosition();
                if ((jPos[line] > position[line]) && (jPos[line] - position[line] < distance))
                {
                    distance = jPos[line] - position[line];
                    if (this.cars[j].getDesSpeed() < desSpeed)
                        desSpeed = this.cars[j].getDesSpeed();
                }
            }

        for (var j = 0; j < this.blocks.length; j++) 
        {
            var blockPosition = this.blocks[j].getPosition();
            var blockLine = this.blocks[j].getLine();
            if (blockLine == line)
                if (blockPosition > position[line])
                    if (blockPosition - position[line] < distance)
                    {
                        distance = blockPosition - position[line];
                        desSpeed = 0;
                    }
        }
        return desSpeed;
    }

    newCar()
    {
        if (carsCount >= maxCarsCount) return;

        var line = this.findFreeLine(-70,100,0);
        if (line == 0) return;

        var i = 0;
        while (carsId.has(i)) i++;

        carsId.add(i);
        carsCount++;
        let car = new Car(i, this.flow, line);
        this.cars.push(car);
    }

    deleteCar(carNum)
    {
        var carId = this.cars[carNum].getId();
        this.cars.splice(carNum,1);
        carsCount--;
        carsId.delete(carId);   

        htmlCarRemove(carId);     
    }

    deleteBlock(blockId)
    {
        var blockNum = 0;
        while (this.blocks[blockNum].getId() != blockId) 
            blockNum++;

        blocksId.delete(blockId);
        blocksCount--;
        this.blocks.splice(blockNum,1);

        htmlBlockRemove(blockId);
    }

    checkAccident()
    {
        var carsCorners = [];
        for (var i = 0; i < this.cars.length; i++) 
            carsCorners.push(this.cars[i].getCornerPosition());

        var blocksCorners = [];
        for (var i = 0; i < this.blocks.length; i++) 
            blocksCorners.push(this.blocks[i].getCornerPosition());

        for (var i = 0; i < this.cars.length; i++) 
        {
            var position = this.cars[i].getPosition();
            for (var j = 0; j < this.blocks.length; j++) 
                if ((Math.abs(position + 30 - parseInt(this.blocks[j].getPosition()))) < 100)
                    if (checkCollision(carsCorners[i],blocksCorners[j]) == 1)
                        this.cars[i].setSituation("crashed");

            for (var j = i+1; j < this.cars.length; j++) 
                    if ((Math.abs(position - parseInt(this.cars[j].getPosition()))) < 100)
                        if (checkCollision(carsCorners[i],carsCorners[j]) == 1)
                        {
                            this.cars[i].setSituation("crashed");
                            this.cars[j].setSituation("crashed");
                        }
        }
    }

    update()
    {
        this.checkDistance();
        this.checkAccident();

        for (var i = 0; i < this.cars.length; i++) 
        {
            this.cars[i].update();

            if (this.cars[i].getSituation() == "checkSituation")
            {
                if (this.cars[i].getDistance() > 2 * this.cars[i].getSelfMaxSpeed())
                {
                    this.cars[i].setDesSpeed(this.cars[i].getSelfMaxSpeed());
                    this.cars[i].setSituation("normal");
                    this.cars[i].setStatus("speedUp");
                }
                else if (this.cars[i].checkReaction(0) == 0)
                {
                    var position = this.cars[i].getPosition();
                    var desSpeed = this.cars[i].getDesSpeed();
                    var line = this.cars[i].getLine();
                    var freeLine = this.findFreeLine(position-100, position+150+desSpeed*2, line);

                    if (freeLine == 0) 
                    {
                        this.cars[i].setSituation("slowed");
                        this.cars[i].setDesSpeed(this.getFrontSpeed(i, this.cars[i].getDesSpeed()));
                    }
                    else 
                    {
                        var c = Math.floor(20-(desSpeed-minMinSpeed)*10/(maxMaxSpeed-minMinSpeed));
                        var lineChangingCounter = [(freeLine - line) * c, (freeLine - line) * c];
                        this.cars[i].setLineChangingCounter(lineChangingCounter);
                        this.cars[i].setSituation("changingLine");
                    }
                }
            }

            if (this.cars[i].getStatus() == "arrived")
                this.deleteCar(i);
        }        
    }

    newBlock(position, line)
    {
        if (blocksCount >= maxBlocksCount) return;
        for (var i = 0; i < this.blocks.length; i++) 
            if (this.blocks[i].getLine() == line)
            {
                var blockPos = this.blocks[i].getPosition();
                if( Math.abs(blockPos - position) < 57) return;
            }

        var i = 0;
        while (blocksId.has(i)) i++;

        blocksId.add(i);
        blocksCount++;
        let block = new Block(i, this.flow, position, line);
        this.blocks.push(block);
    }
}

class Car 
{
    getId(){return this.carId;}
    getLine(){return this.line;}
    getStatus(){return this.status;}
    getPosition(){return this.position;}
    getDistance(){return this.distance;}
    getDesSpeed(){return this.desSpeed;}
    getSituation(){return this.situation;}
    getSelfMaxSpeed(){return this.selfMaxSpeed;}

    setStatus(status) {this.status = status;}
    setDesSpeed(desSpeed) {this.desSpeed = desSpeed;}
    setDistance(distance) {this.distance = distance;}
    setSituation(situation) {this.situation = situation;}
    setLineChangingCounter(count) {this.lineChangingCounter = count;}

    checkReaction(time)
    {
        if (time > 0) this.reactionTime = time;
        else if (this.reactionTime == 0) return 0;
        else
        {
            this.reactionTime = this.reactionTime - 1;
            return this.reactionTime + 1;
        }
    }

    constructor(carId, flow, line)
    {
        this.position = -70;
        this.selfMaxSpeed = getRandomInt(minSpeed, maxSpeed+1);
        this.desSpeed = this.selfMaxSpeed;
        this.speed = Math.floor(this.desSpeed / 2);
        this.line = line;
        this.reactionTime = 0;
        this.status = "speedUp";
        this.situation = "normal";
        this.lineChangingCounter = [0,0];
        this.carId = carId;
        this.flow = flow;
        this.distance = -1;

        htmlCarConstructor(this);
    }

    update()
    {
        if (this.situation == "changingLine")
        {
            if (this.lineChangingCounter[1] != 0)
                if (this.lineChangingCounter[1] == this.lineChangingCounter[0])
                {
                    if (this.lineChangingCounter[0] > 0)
                        this.line = this.line + 1;
                    else
                        this.line = this.line - 1;
                }

            if (this.lineChangingCounter[1] < 0)
                this.lineChangingCounter[1] = this.lineChangingCounter[1] + 1;
            else
                this.lineChangingCounter[1] = this.lineChangingCounter[1] - 1;

            this.position = this.position + (this.speed/10); 
            htmlCarUpdate(this);
            htmlCarLineChanging(this);

            if (this.lineChangingCounter[1] == 0) 
            {
                this.lineChangingCounter[0] = 0;
                this.situation = "checkSituation";
                this.status = "normal";
            }
            return;
        }

        if (this.situation == "checkSituation")
        {
            if (this.status == "speedDown")
            {
                this.speed = this.speed - slowdown;
                if (this.speed <= this.desSpeed)
                {
                    this.speed = this.desSpeed;
                    this.status = "normal";
                }
            }

            this.position = this.position + (this.speed/10); 
            if (this.position > parseInt(roadLength))
                this.status = "arrived"; 
            htmlCarUpdate(this);
            return;
        }

        if (this.situation == "crashed")
        {
            if (this.status != "crashed")
            {
                this.status = "crashed";
                this.desSpeed = 0;
                htmlCarCrash(this);
            }
            return;
        }

        if (this.situation == "normal")
        {
            if (this.status == "speedUp")
            {
                if (this.speed < this.desSpeed)
                    this.speed = this.speed + 2;

                if (this.speed >= this.desSpeed)
                {
                    this.speed = this.desSpeed;
                    this.status = "normal";
                }
            }

            if (this.distance < this.desSpeed * 2 + 40)
            {
                this.checkReaction(1);
                this.situation = "checkSituation";
            }
        }

        if (this.situation == "slowed")
        {
            if (this.speed > this.desSpeed)
                this.status = "speedDown";

            if (this.status == "speedDown")
            {
                this.speed = this.speed - slowdown;
                if (this.speed <= this.desSpeed)
                {
                    this.speed = this.desSpeed;
                    this.status = "normal";
                }
            }

            this.checkReaction(8);
            this.situation = "checkSituation";
        }

        this.position = this.position + (this.speed/10); 

        if (this.position > roadLength)
            this.status = "arrived"; 

        htmlCarUpdate(this);
    }

    getLinesPosition()
    {
        var position = [0,-100,-100,-100];
        if (this.situation == "changingLine")
        {
            if (Math.abs(this.lineChangingCounter[1]) < Math.abs(this.lineChangingCounter[0] / 2))
                position[this.line] = this.position;
            else
            {
                if (this.lineChangingCounter[0] > 0)
                    position[this.line - 1] = this.position - 50;
                else
                    position[this.line + 1] = this.position - 50;        
                position[this.line] = this.position - 50;   
            }
            return position;
        }

        if (this.situation == "crashed")
        {
            if (this.lineChangingCounter[1] == 0)
            {
                position[this.line] = this.position;  
                return position; 
            }

            var y = Math.abs(this.lineChangingCounter[0]);
            var x = Math.abs(this.lineChangingCounter[1]);

            var z = 1;
            if (this.lineChangingCounter[0] > 0) z = -1;

            if (x > 2*y/3)
            {
                position[this.line + z] = this.position;
            }
            else if (x > y/3)
            {
                position[this.line + z] = this.position;
                position[this.line] = this.position;                
            }
            else 
            {
                position[this.line] = this.position;
            }    
            return position;    
        }
        
        position[this.line] = this.position;
        return position;
    }

    getCornerPosition()
    {
        var id = "car_" + this.carId;
        var elem = document.getElementById(id);
        var rect = elem.getBoundingClientRect();

        var left = rect.left;
        var right = rect.right;
        var bottom = rect.bottom;
        var top = rect.top;

        if (this.lineChangingCounter[0] == 0)
            return [[left,top],[right,top],[right,bottom],[left,bottom]];

        var lcc0 = Math.abs(this.lineChangingCounter[0]);
        var lcc1 = this.lineChangingCounter[1];

        lcc1 = Math.abs(lcc1);
        var rotateMax = 30 + 3*(lcc0-10);
        var rotate = 2 * Math.abs(lcc0/2 - (Math.abs(lcc1 - lcc0/2))) / lcc0;
        var rotateDeg = rotateMax * rotate;

        if (this.lineChangingCounter[0] > 0)
            rotateDeg = -rotateDeg;

        rotateDeg = rotateDeg + 90;

        var centerTop = top / 2 + bottom / 2;
        var centerLeft = left / 2 + right / 2;
        var vecLength = 40.31;

        var LTrotateDeg = (180 - 29.74 - rotateDeg) / 180 * Math.PI;
        var RTrotateDeg = (29.74 - rotateDeg) / 180 * Math.PI;
        var RBrotateDeg = (- 29.74 - rotateDeg) / 180 * Math.PI;
        var LBrotateDeg = (180 + 29.74 - rotateDeg) / 180 * Math.PI;

        var lt = [centerLeft + vecLength*Math.sin(LTrotateDeg),centerTop + vecLength*Math.cos(LTrotateDeg)];
        var rt = [centerLeft + vecLength*Math.sin(RTrotateDeg),centerTop + vecLength*Math.cos(RTrotateDeg)];
        var rb = [centerLeft + vecLength*Math.sin(RBrotateDeg),centerTop + vecLength*Math.cos(RBrotateDeg)];
        var lb = [centerLeft + vecLength*Math.sin(LBrotateDeg),centerTop + vecLength*Math.cos(LBrotateDeg)];
        return [lt,rt,rb,lb];
    }
}

class Block 
{
    getId() {return this.blockId;}
    getLine() {return this.line;}
    getPosition() {return this.position;}

    constructor(blockId, flow, position, line)
    {
        this.line = line;
        this.blockId = blockId;
        this.position = position;
        this.flow = flow;

        htmlBlockConstructor(this);
    }

    getCornerPosition()
    {
        var id = "block_" + this.blockId;
        var elem = document.getElementById(id);
        var rect = elem.getBoundingClientRect();
        var l = rect.left;
        var r = rect.right;
        var b = rect.bottom;
        var t = rect.top;
        return [[l,t],[r,t],[r,b],[l,b]];
    }
}

class Model
{
    constructor()
    {
        this.roadToRight = new Road("toRight");
        this.roadToLeft = new Road("toLeft");        
    }
    update()
    {
        this.roadToRight.update();
        this.roadToLeft.update();        
    }
    newCar()
    {
        this.roadToRight.newCar();
        this.roadToLeft.newCar();
    }
    newBlock(position, flow, line)
    {
        if (flow == "toRight")
            road.roadToRight.newBlock(position - 17, line);
        else
        {
            var width = parseInt($("#road").css("width"));
            position = width - position;
            road.roadToLeft.newBlock(position - 17, line);
        }
    }

    deleteBlock(block)
    {
        var flow = block.getAttribute("flow");
        var blockId = block.getAttribute("id");
        blockId = parseInt(blockId.substring(6,blockId.length));
        if (flow == "toRight")
            road.roadToRight.deleteBlock(blockId);
        else
            road.roadToLeft.deleteBlock(blockId);
    }
}

function update()
{
    road.update();
}

function newCar()
{
    road.newCar();
}

let road = new Model();
