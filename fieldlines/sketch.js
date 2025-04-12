const TWELFTH_PI = Math.PI / 12;

class eInput {
    static instances = [];
    
    static TOP_LEFT = 0;
    static TOP_RIGHT = 1;
    static BOTTOM_RIGHT = 2;
    static BOTTOM_LEFT = 3;

    static BUTTON = 0;
    static LABEL = 1;
    static TEXT_INPUT = 2;

    constructor(type, id, calcLabel, calcX, calcY, align, calcFontSize, clickEvent, calcVisible = () => {return true;}) {
        this.type = type;
        this.id = id;
        this.calcLabel = calcLabel;
        this.calcFontSize = calcFontSize;
        switch (align) {
            case eInput.TOP_LEFT:
                this.calcX = calcX;
                this.calcY = calcY;
                break;
            case eInput.TOP_RIGHT:
                this.calcX = () => {return calcX() - this.w;};
                this.calcY = calcY;
                break;
            case eInput.BOTTOM_RIGHT:
                this.calcX = () => {return calcX() - this.w;};
                this.calcY = () => {return calcY() - this.h;};
                break;
            case eInput.BOTTOM_LEFT:
                this.calcX = calcX;
                this.calcY = () => {return calcY() - this.h;};
                break;
        }
        this.clickEvent = clickEvent;
        this.calcVisible = calcVisible;
        eInput.instances.push(this);
    }

    get label() {
        return this.calcLabel();
    }

    get x() {
        return this.calcX();
    }

    get y() {
        return this.calcY();
    }

    calcW() {
        textSize(this.fontSize);
        return textWidth(this.label) + this.fontSize * 0.7;
    }

    get w() {
        return this.calcW();
    }
    
    calcH() {
        return this.fontSize + this.fontSize * 0.5;
    }

    get h() {
        return this.calcH();
    }

    get fontSize() {
        return this.calcFontSize();
    }

    get visible() {
        return this.calcVisible();
    }
    
    draw() {
        if (this.visible) {
            stroke(0);
            strokeWeight(2);
            fill(255);
            rectMode(CORNER);
            rect(this.x, this.y, this.w, this.h, this.fontSize * 0.6);
            textAlign(CENTER, CENTER);
            stroke(0, 0)
            fill(0);
            text(this.label, this.x + this.w / 2, this.y + this.h / 2);
        }
    }
    
    static drawAll() {
        for (let eB of eInput.instances) {
            eB.draw();
        }
    }

    static sendClickEvents(e) {
        for (let instance of eInput.instances) {
            if (instance.visible && instance.type == eInput.BUTTON) {
                if (e.clientX >= instance.x && e.clientX <= instance.x + instance.w && e.clientY >= instance.y && e.clientY <= instance.y + instance.h) {
                    instance.clickEvent(e);
                }
            }
        }
    }
}

class pointCharge {
    static instances = [];
    static selected = undefined;

    static PRESS = 0;
    static RELEASE = 1;

    constructor(x, y, charge) {
        this.x = x;
        this.y = y;
        this.charge = charge;
        this.selected = false;
        this.dragging = false;
        this.dragOffsetX;
        this.dragOffsetY;
        for (let instance of pointCharge.instances) {
            instance.selected = false;
        }
        this.selected = true;
        pointCharge.selected = this;
        pointCharge.instances.push(this);
    }

    field(p) {
        // pos = toMathSpace(this.x, this.y);
        return createVector((this.charge * (p.x - this.x)) / pow(pow(p.x - this.x, 2) + pow(p.y - this.y, 2), 1.5), (this.charge * (p.y - this.y)) / pow(pow(p.x - this.x, 2) + pow(p.y - this.y, 2), 1.5));
    }

    static totalField(p) {
        let sum = createVector(0, 0);
        for (let instance of pointCharge.instances) {
            let partialField = instance.field(p);
            sum.x += partialField.x;
            sum.y += partialField.y;
        }
        return sum;
    }

    get drawSize() {
        return clamp(abs(this.charge), 1, Number.MAX_VALUE) * 20;
    }

    draw() {
        if (this.dragging) {
            this.x = clamp(mouseX + this.dragOffsetX, 0, windowWidth);
            this.y = clamp(mouseY + this.dragOffsetY, 0, windowHeight);
            if (this.charge == 0)
                console.log(pointCharge.totalField(this.x, this.y));
        }
        if (this.charge > 0) {
            fill(240, 8, 0);
            if (this.selected)
                stroke(252, 130, 126);
            else
                stroke(191, 6, 0);
        }
        else if (this.charge == 0) {
            fill(153);
            if (this.selected)
                stroke(191);
            else
                stroke(122);
        }
        else if (this.charge < 0) {
            fill (94, 176, 236);
            if (this.selected)
                stroke(143, 207, 252);
            else
                stroke(75, 141, 188);
        }
        strokeWeight(3);
        circle(this.x, this.y, this.drawSize);
    }

    static drawAll() {
        for (let i = pointCharge.instances.length - 1; i >= 0; i--) {
            pointCharge.instances[i].draw();
        }
    }

    static checkClickEvents(type, e) {
        // make sure were not clicking a button instead
        for (let instance of eInput.instances) {
            if (instance.visible && instance.type == eInput.BUTTON) {
                if (e.clientX >= instance.x && e.clientX <= instance.x + instance.w && e.clientY >= instance.y && e.clientY <= instance.y + instance.h) {
                    return;
                }
            }
        }

        let foundTarget = false;
        for (let instance of pointCharge.instances) {
            if (sqrt(pow(e.clientX - instance.x, 2) + pow(e.clientY - instance.y, 2)) <= instance.drawSize / 2) {
                switch (type) {
                    case pointCharge.PRESS:
                        if (!foundTarget) {
                            instance.selected = true;
                            pointCharge.selected = instance;
                            instance.dragging = true;
                            instance.dragOffsetX = instance.x - e.clientX;
                            instance.dragOffsetY = instance.y - e.clientY;
                            foundTarget = true;
                        }
                        else {
                            instance.selected = false;
                        }
                        break;
                    case pointCharge.RELEASE:
                        instance.dragging = false;
                        break;
                }
            }
            else
                instance.selected = false;
        }
        if (type == pointCharge.PRESS && foundTarget == false)
            pointCharge.selected = undefined;
    }
}

function drawFieldLines() {
    let badLines = []
    for (let instance of pointCharge.instances) {
        // if (instance.charge > 0) {
            for (let i = 0; i < 24; i++) {
                let [points, cleanFinish] = calculateFieldLine(createVector(instance.drawSize / 2, 0).rotate(i * TWELFTH_PI).add(createVector(instance.x, instance.y)), Math.sign(instance.charge));
                drawPolyCurve(points);
                if (!cleanFinish)
                    badLines.push(i);
            }
        // }
    }
}

function calculateFieldLine(startP, scale) {
    let p = startP
    let points = [p.copy()];
    let finished = true;
    let cleanFinish = false;
    let i = 0;
    while (finished) {
        i++;
        if (i > 1000)
            finished = false;
        p = rk4Step(pointCharge.totalField, p, 2, scale);
        points.push(p.copy());
        if (p.x < 0 || p. y < 0 || p.x > windowWidth || p.y > windowHeight)
            finished = false;
        for (let instance of pointCharge.instances) {
            if (p.dist(createVector(instance.x, instance.y)) < instance.drawSize / 2)
                finished = false;
                cleanFinish = false
        }
    }
    return [points, cleanFinish];
}

function drawPolyCurve(points) {
    for (let i = 0; i < points.length - 1; i++) {
        stroke(0, 255);
        strokeWeight(2);
        line(points[i].x, points[i].y, points[i+1].x, points[i+1].y);
        // curve(points[clamp(i-1, 0, Number.MAX_VALUE)].x, points[clamp(i-1, 0, Number.MAX_VALUE)].y, points[i].x, points[i].y, points[i+1].x, points[i+1].y, points[clamp(i+2, 0, points.length - 1)].x, points[clamp(i+2, 0, points.length - 1)].y)
    }
}

function rk4Step(f, p, h, scale) {
    let k1 = fNorm(f, p).mult(scale);
    let k2 = fNorm(f, p.add(k1.mult(h / 2))).mult(scale);
    let k3 = fNorm(f, p.add(k2.mult(h / 2))).mult(scale);
    let k4 = fNorm(f, p.add(k3.mult(h))).mult(scale);
    return p.add(k1.add(k2.mult(2)).add(k3.mult(2)).add(k4).mult(h / 6));
}

function fNorm(f, p) {
    return f(p).normalize();
}

function clamp(value, min, max) {
    if (value > max) return max;
    else if (value < min) return min;
    else return value;
}

// function

function setup() {
    createCanvas(windowWidth, windowHeight);
    frameRate(165);

    let addCharge = new eInput(eInput.BUTTON, "addCharge", () => {return "Add charge";}, () => {return 20;}, () => {return windowHeight - 20;}, eInput.BOTTOM_LEFT, () => {return 20;}, () => {
        new pointCharge(windowWidth * 0.5, windowHeight * 0.5, 2);
    });

    let removeCharge = new eInput(eInput.BUTTON, "removeCharge", () => {return "Remove charge";}, () => {return 20 + addCharge.w + 10;}, () => {return windowHeight - 20;}, eInput.BOTTOM_LEFT, () => {return 20;}, () => {
        let removeIndex = pointCharge.instances.indexOf(pointCharge.selected);
        pointCharge.instances.splice(removeIndex, 1);
        pointCharge.selected = undefined;
    }, () => {return pointCharge.selected !== undefined;});

    let chargeDisplay = new eInput(eInput.LABEL, "chargeDisplay", () => {return "Charge: " + pointCharge.selected.charge.toString() + " C";}, () => {return 20 + addCharge.w + 10 + removeCharge.w + 40;}, () => {return windowHeight - 20;}, eInput.BOTTOM_LEFT, () => {return 20;}, undefined, () => {return pointCharge.selected !== undefined;});

    let incCharge = new eInput(eInput.BUTTON, "incCharge", () => {return "+";}, () => {return 20 + addCharge.w + 10 + removeCharge.w + 40 + chargeDisplay.w + 10;}, () => {return windowHeight - 20;}, eInput.BOTTOM_LEFT, () => {return 20;}, () => {
        pointCharge.selected.charge += 1;
    }, () => {return pointCharge.selected !== undefined;});
    incCharge.calcW = incCharge.calcH;
    
    let decCharge = new eInput(eInput.BUTTON, "decCharge", () => {return "-";}, () => {return 20 + addCharge.w + 10 + removeCharge.w + 40 + chargeDisplay.w + 10 + incCharge.w + 10;}, () => {return windowHeight - 20;}, eInput.BOTTOM_LEFT, () => {return 20;}, () => {
        pointCharge.selected.charge += -1;
    }, () => {return pointCharge.selected !== undefined;});
    decCharge.calcW = decCharge.calcH;

    new pointCharge(windowWidth * 0.25, windowHeight * 0.5, 2);
    new pointCharge(windowWidth * 0.75, windowHeight * 0.5, -2);

}

function draw() {
    background(220);
    drawFieldLines();
    pointCharge.drawAll();
    eInput.drawAll();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function mouseClicked(e) {
    eInput.sendClickEvents(e)
}

function mousePressed(e) {
    pointCharge.checkClickEvents(pointCharge.PRESS, e);
}

function mouseReleased(e) {
    pointCharge.checkClickEvents(pointCharge.RELEASE, e);
}