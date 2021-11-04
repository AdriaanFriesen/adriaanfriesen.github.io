document.getElementById("quad-a").addEventListener("keyup", doQuadFormula);
document.getElementById("quad-b").addEventListener("keyup", doQuadFormula);
document.getElementById("quad-c").addEventListener("keyup", doQuadFormula);
document.getElementById("quad-approx").addEventListener("change", doQuadFormula);
document.getElementById("quad-approx-digits").addEventListener("keyup", doQuadFormula);

function doQuadFormula() {
    var a = document.getElementById("quad-a").value;
    var b = document.getElementById("quad-b").value;
    var c = document.getElementById("quad-c").value;
    var approxDigits = document.getElementById("quad-approx-digits").value;

    if (!Number(approxDigits)) {
        approxDigits = 2;
    }

    else {
        approxDigits = Number(approxDigits)
    }
    if (a.length) {
        var a = Number(a);
        var b = Number(b);
        var c = Number(c);
        var discrim = b ** 2 - 4 * a * c;
        if (document.getElementById("quad-approx").checked) { // User has requested approximate values
            if (discrim >= 0) { // Real solutions
                var sol1 = (-1 * b + ((b ** 2 - 4 * a * c) ** 0.5)) / ( 2 * a);
                var sol2 = (-1 * b - ((b ** 2 - 4 * a * c) ** 0.5)) / ( 2 * a);
                document.getElementById("sol-1").innerHTML = Number(sol1.toFixed(approxDigits));
                document.getElementById("sol-2").innerHTML = Number(sol2.toFixed(approxDigits));
            }
            else if (discrim < 0) { // Complex solutions
                var solReal = (-1 * b) / ( 2 * a);
                var solImag = ((-1 * (b ** 2 - 4 * a * c)) ** 0.5) / ( 2 * a);
                document.getElementById("sol-1").innerHTML = Number(solReal.toFixed(approxDigits)) + " + " + Number(solImag.toFixed(approxDigits)) + "<i>i</i>";
                document.getElementById("sol-2").innerHTML = Number(solReal.toFixed(approxDigits)) + " - " + Number(solImag.toFixed(approxDigits)) + "<i>i</i>";
            }
            document.getElementById("vertex-x").innerHTML = Number(((-1 * b) / (2 * a)).toFixed(approxDigits));
            document.getElementById("vertex-y").innerHTML = Number((a * ((-1 * b) / (2 * a)) ** 2 + b * ((-1 * b) / (2 * a)) + c).toFixed(approxDigits));
        }
        else { // Give exact square roots
            if (discrim >= 0 && discrim ** 0.5 % 1 == 0) { // Real perfect square solutions
                var sol1 = (-1 * b + ((b ** 2 - 4 * a * c) ** 0.5)) / ( 2 * a);
                var sol2 = (-1 * b - ((b ** 2 - 4 * a * c) ** 0.5)) / ( 2 * a);
                document.getElementById("sol-1").innerHTML = sol1;
                document.getElementById("sol-2").innerHTML = sol2;
            }
            else if (discrim < 0 && (-1 * discrim) ** 0.5 % 1 == 0) { // Complex perfect square solutions
                var solReal = (-1 * b)  / ( 2 * a);
                var solImag = ((-1 * discrim) ** 0.5) / (2 * a);
                document.getElementById("sol-1").innerHTML = solReal + " + " + solImag + "<i>i</i>";
                document.getElementById("sol-2").innerHTML = solReal + " - " + solImag + "<i>i</i>";
            }
            else if (discrim >= 0) { // Real solutions
                var sol = (-1 * b) / ( 2 * a);
                var bottom = 2 * a;
                if (SQGPSF(discrim) !== 1) {
                    var discrimCoef = SQGPSF(discrim);
                    discrim /= discrimCoef ** 2;
                    if (discrimCoef < bottom) {
                        bottom /= discrimCoef;
                        if (document.getElementById("quad-approx").checked) {
                            document.getElementById("sol-1").innerHTML = Number(sol.toFixed(approxDigits)) + " + " + "√<span class=\"overline\">" + discrim + "</span> / " + bottom;
                            document.getElementById("sol-2").innerHTML = Number(sol.toFixed(approxDigits)) + " - " + "√<span class=\"overline\">" + discrim + "</span> / " + bottom;
                        }
                        else {
                            document.getElementById("sol-1").innerHTML = sol + " + " + "√<span class=\"overline\">" + discrim + "</span> / " + bottom;
                            document.getElementById("sol-2").innerHTML = sol + " - " + "√<span class=\"overline\">" + discrim + "</span> / " + bottom;
                        }
                    }
                    else if (discrimCoef > bottom) {
                        discrimCoef /= bottom;
                        if (document.getElementById("quad-approx").checked) {
                            document.getElementById("sol-1").innerHTML = Number(sol.toFixed(approxDigits)) + " + " + "√<span class=\"overline\">" + discrim + "</span>";
                            document.getElementById("sol-2").innerHTML = Number(sol.toFixed(approxDigits)) + " - " + "√<span class=\"overline\">" + discrim + "</span>";
                        }
                        else {
                            document.getElementById("sol-1").innerHTML = sol + " + " + "√<span class=\"overline\">" + discrim + "</span>";
                            document.getElementById("sol-2").innerHTML = sol + " - " + "√<span class=\"overline\">" + discrim + "</span>";
                        }
                    }
                    else if (discrimCoef == bottom) {
                        if (document.getElementById("quad-approx").checked) {
                            document.getElementById("sol-1").innerHTML = Number(sol.toFixed(approxDigits)) + " + √<span class=\"overline\">" + discrim + "</span>";
                            document.getElementById("sol-2").innerHTML = Number(sol.toFixed(approxDigits)) + " - √<span class=\"overline\">" + discrim + "</span>";
                        }
                        else {
                            document.getElementById("sol-1").innerHTML = sol + " + √<span class=\"overline\">" + discrim + "</span>";
                            document.getElementById("sol-2").innerHTML = sol + " - √<span class=\"overline\">" + discrim + "</span>";
                        }
                    }
                }
                else {
                    if (document.getElementById("quad-approx").checked) {
                        document.getElementById("sol-1").innerHTML = Number(sol.toFixed(approxDigits)) + " + √<span class=\"overline\">" + discrim + "</span> / " + bottom;
                        document.getElementById("sol-2").innerHTML = Number(sol.toFixed(approxDigits)) + " - √<span class=\"overline\">" + discrim + "</span> / " + bottom;

                    }
                    else {
                        document.getElementById("sol-1").innerHTML = sol + " + √<span class=\"overline\">" + discrim + "</span> / " + bottom;
                        document.getElementById("sol-2").innerHTML = sol + " - √<span class=\"overline\">" + discrim + "</span> / " + bottom;
                    }
                }
            }
            else if (discrim < 0) { // Complex solutions
                var sol = (-1 * b) / ( 2 * a);
                var bottom = 2 * a;
                if (SQGPSF(discrim) !== 1) {
                    var discrimCoef = SQGPSF(-1 * discrim);
                    discrim /= discrimCoef ** 2;
                    if (discrimCoef < bottom) {
                        bottom /= discrimCoef;
                        document.getElementById("sol-1").innerHTML = sol + " + " + "<i>i</i>√<span class=\"overline\">" + -1 * discrim + "</span> / " + bottom;
                        document.getElementById("sol-2").innerHTML = sol + " - " + "<i>i</i>√<span class=\"overline\">" + -1 * discrim + "</span> / " + bottom;
                    }
                    else if (discrimCoef > bottom) {
                        discrimCoef /= bottom;
                        document.getElementById("sol-1").innerHTML = sol + " + " + "<i>i</i>√<span class=\"overline\">" + -1 * discrim + "</span>";
                        document.getElementById("sol-2").innerHTML = sol + " - " + "<i>i</i>√<span class=\"overline\">" + -1 * discrim + "</span>";
                    }
                    else if (discrimCoef == bottom) {
                        document.getElementById("sol-1").innerHTML = sol + " + <i>i</i>√<span class=\"overline\">" + -1 * discrim + "</span>";
                        document.getElementById("sol-2").innerHTML = sol + " - <i>i</i>√<span class=\"overline\">" + -1 * discrim + "</span>";
                    }
                }
                else {
                    document.getElementById("sol-1").innerHTML = sol + " + <i>i</i>√<span class=\"overline\">" + -1 * discrim + "</span> / " + bottom;
                    document.getElementById("sol-2").innerHTML = sol + " - <i>i</i>√<span class=\"overline\">" + -1 * discrim + "</span> / " + bottom;
                }
            }
            document.getElementById("vertex-x").innerHTML = ((-1 * b) / (2 * a));
            document.getElementById("vertex-y").innerHTML = (a * ((-1 * b) / (2 * a)) ** 2 + b * ((-1 * b) / (2 * a)) + c);
        }
    }
}

document.getElementById("foiler-a").addEventListener("keyup", doFOIL);
document.getElementById("foiler-b").addEventListener("keyup", doFOIL);
document.getElementById("foiler-c").addEventListener("keyup", doFOIL);
document.getElementById("foiler-d").addEventListener("keyup", doFOIL);

function doFOIL() {
    document.getElementById("foiled-poly").innerHTML = (Number(document.getElementById("foiler-a").value) * Number(document.getElementById("foiler-c").value)) + "x<sup>2</sup> + " + ((Number(document.getElementById("foiler-b").value) + Number(document.getElementById("foiler-d").value))) + "x + " + (Number(document.getElementById("foiler-b").value) * Number(document.getElementById("foiler-d").value));
}

document.getElementById("points-x1").addEventListener("keyup", doPointOps);
document.getElementById("points-y1").addEventListener("keyup", doPointOps);
document.getElementById("points-x2").addEventListener("keyup", doPointOps);
document.getElementById("points-y2").addEventListener("keyup", doPointOps);
document.getElementById("point-approx").addEventListener("change", doPointOps);
document.getElementById("point-approx-digits").addEventListener("keyup", doPointOps);

function doPointOps() {
    var x1 = document.getElementById("points-x1").value;
    var y1 = document.getElementById("points-y1").value;
    var x2 = document.getElementById("points-x2").value;
    var y2 = document.getElementById("points-y2").value;
    var approxDigits = document.getElementById("point-approx-digits").value;

    if (!Number(approxDigits)) {
        approxDigits = 2;
    }
    else {
        approxDigits = Number(approxDigits)
    }

    if (x1.length > 0 && y1.length > 0 && x2.length > 0 && y2.length > 0) {
        var x1 = Number(x1);
        var y1 = Number(y1);
        var x2 = Number(x2);
        var y2 = Number(y2);
        var unRootedLength = (x1 - x2) ** 2 + (y1 - y2) ** 2;
        var length = unRootedLength ** 0.5;
        if (length % 1 == 0) { // Length is a whole number
                document.getElementById("length").innerHTML = length;
        }

        else { // Length is an uneven square root
            if (document.getElementById("point-approx").checked) { // User has requested approximate values
                document.getElementById("length").innerHTML = Number(length.toFixed(approxDigits));

            }
            else { // Give exact square roots
                if (SQGPSF(unRootedLength) !== 1) {
                    lengthCoef = SQGPSF(unRootedLength);
                    unRootedLength /= lengthCoef ** 2;
                    document.getElementById("length").innerHTML = lengthCoef + "√<span class=\"overline\">" + unRootedLength + "</span>";
                }
                else {
                    document.getElementById("length").innerHTML = "√<span class=\"overline\">" + unRootedLength + "</span>";
                }
            }
        }
        var midpointX = (x1 + x2) / 2;
        var midpointY = (y1 + y2) / 2;
        document.getElementById("midpoint-x").innerHTML = midpointX;
        document.getElementById("midpoint-y").innerHTML = midpointY;
    }
}

document.getElementById("trig-a").addEventListener("keyup", doTrig);
document.getElementById("trig-b").addEventListener("keyup", doTrig);
document.getElementById("trig-c").addEventListener("keyup", doTrig);
document.getElementById("trig-A").addEventListener("keyup", doTrig);
document.getElementById("trig-B").addEventListener("keyup", doTrig);
document.getElementById("trig-C").addEventListener("keyup", doTrig);
document.getElementById("trig-approx").addEventListener("change", doTrig);
document.getElementById("trig-approx-digits").addEventListener("keyup", doTrig);

function doTrig() {
    var a = document.getElementById("trig-a").value;
    var b = document.getElementById("trig-b").value;
    var c = document.getElementById("trig-c").value;
    var A = document.getElementById("trig-A").value;
    var B = document.getElementById("trig-B").value;
    var C = document.getElementById("trig-C").value;
    var approxDigits = document.getElementById("trig-approx-digits").value;

    if (!Number(approxDigits) && approxDigits !== "0") {
        approxDigits = 2;
    }
    else {
        approxDigits = Number(approxDigits)
    }

    var sides = 0;
    var angles = 0;
    
    if (a) sides += 1;
    if (b) sides += 1;
    if (c) sides += 1;
    if (A) angles += 1;
    if (B) angles += 1;
    if (C) angles += 1;

    a = Number(a);
    b = Number(b);
    c = Number(c);
    A = Number(A);
    B = Number(B);
    C = Number(C);

    if (angles + sides == 3) {
        document.getElementById("trig-sol").style.display = "flex";
        document.getElementById("trig-no-sol").style.display = "none";

        if (sides == 3 && angles == 3) {}

        else if (sides >= 1 && angles >= 2) {
            if (angles != 3) {
                if (A && B) {
                    C = 180 - (A + B);
                }
                else if (B && C) {
                    A = 180 - (B + C);
                }
                else if (C && A) {
                    B = 180 - (C + A);
                }
            }
            if (a) {
                c = (a / Math.sin(radians(A))) * Math.sin(radians(C));
                b = (c / Math.sin(radians(C))) * Math.sin(radians(B));
            }
            else if (b) {
                a = (b / Math.sin(radians(B))) * Math.sin(radians(A));
                c = (a / Math.sin(radians(A))) * Math.sin(radians(C));
            }
            else if (c) {
                b = (c / Math.sin(radians(c))) * Math.sin(radians(B));
                a = (b / Math.sin(radians(B))) * Math.sin(radians(A));
            }
        }
        else if (sides == 3) {
            A = degrees(Math.acos((a ** 2 - b ** 2 - c ** 2) / (-2 * c * b)));
            B = degrees(Math.acos((b ** 2 - a ** 2 - c ** 2) / (-2 * a * c)));
            C = degrees(Math.acos((a ** 2 - a ** 2 - b ** 2) / (-2 * a * b)));
        }
        else if (a && b && C || b && c && A || c && a && B) {
            if (!a) {
                a = (b ** 2 + c ** 2 - 2 * b * c * Math.cos(radians(A)));
                B = degrees(Math.acos((b ** 2 - a ** 2 - c ** 2) / (-2 * a * c)));
                C = degrees(Math.acos((a ** 2 - a ** 2 - b ** 2) / (-2 * a * b)));
            }
            if (!b) {
                b = (a ** 2 + c ** 2 - 2 * a * c * Math.cos(radians(B)));
                A = degrees(Math.acos((a ** 2 - b ** 2 - c ** 2) / (-2 * c * b)));
                C = degrees(Math.acos((a ** 2 - a ** 2 - b ** 2) / (-2 * a * b)));
            }
            if (!c) {
                c = (a ** 2 + b ** 2 - 2 * a * b * Math.cos(radians(C))) ** 0.5;
                A = degrees(Math.acos((a ** 2 - b ** 2 - c ** 2) / (-2 * c * b)));
                B = degrees(Math.acos((b ** 2 - a ** 2 - c ** 2) / (-2 * a * c)));
            }
        }
        else {
            document.getElementById("trig-no-sol").innerHTML = "Unsolvable (ASS) triangle";
            document.getElementById("trig-no-sol").style.display = "unset";
            document.getElementById("trig-sol").style.display = "none";
        }
        document.getElementById("trig-output-b").innerHTML = Number(b.toFixed(approxDigits));
        document.getElementById("trig-output-c").innerHTML = Number(c.toFixed(approxDigits));
        document.getElementById("trig-output-a").innerHTML = Number(a.toFixed(approxDigits));
        document.getElementById("trig-output-A").innerHTML = Number(A.toFixed(approxDigits)) + "°";
        document.getElementById("trig-output-B").innerHTML = Number(B.toFixed(approxDigits)) + "°";
        document.getElementById("trig-output-C").innerHTML = Number(C.toFixed(approxDigits)) + "°";
    }
    else {
        if (angles + sides > 3) {
            document.getElementById("trig-no-sol").innerHTML="Too many inputs";
        }
        else {
            document.getElementById("trig-no-sol").innerHTML="Not enough inputs";
        }
        document.getElementById("trig-no-sol").style.display = "unset";
        document.getElementById("trig-sol").style.display = "none";
    }
}

document.getElementById("circle-radius").addEventListener("keyup", doCircle);
document.getElementById("circle-diameter").addEventListener("keyup", doCircle);
document.getElementById("circle-circumference").addEventListener("keyup", doCircle);
document.getElementById("circle-area").addEventListener("keyup", doCircle);
document.getElementById("circle-approx").addEventListener("change", doCircle);
document.getElementById("circle-approx-digits").addEventListener("keyup", doCircle);

function doCircle() {
    var radius = document.getElementById("circle-radius").value;
    var diameter = document.getElementById("circle-diameter").value;
    var circumference = document.getElementById("circle-circumference").value;
    var area = document.getElementById("circle-area").value;
    var approxDigits = document.getElementById("circle-approx-digits").value;

    if (!Number(approxDigits)) {
        approxDigits = 2;
    }
    else {
        approxDigits = Number(approxDigits)
    }

    var inputs = 0;
    if (radius) inputs += 1;
    if (diameter) inputs += 1;
    if (circumference) inputs += 1;
    if (area) inputs += 1;

    radius = Number(radius);
    diameter = Number(diameter);
    circumference = Number(circumference);
    area = Number(area);

    if (inputs == 1) {
        if (document.getElementById("circle-approx").checked) {
            if (radius) {
                diameter = 2 * radius
                circumference = Math.PI * diameter;
                area = Math.PI * radius ** 2;
            }
            else if (diameter) {
                radius = diameter / 2;
                circumference = Math.PI * diameter;
                area = Math.PI * radius ** 2;
            }
            else if (circumference) {
                diameter = circumference / Math.PI;
                radius = diameter / 2;
                area = Math.PI * radius ** 2;
            }
            else if (area) {
                radius = (area / Math.PI) ** 0.5;
                diameter = 2 * radius;
                circumference = Math.PI * diameter;
            }
            radius = Number(radius.toFixed(approxDigits));
            diameter = Number(diameter.toFixed(approxDigits));
            circumference = Number(circumference.toFixed(approxDigits));
            area = Number(area.toFixed(approxDigits));
        }
        else {
            if (radius) {
                diameter = 2 * radius;
                circumference = diameter + "π"
                area = radius ** 2 + "π"
            }
            else if (diameter) {
                circumference = diameter + "π"
                area = radius ** 2 + "π"
            }
            else if (circumference) {
                radius = circumference + " / 2π";
                diameter = circumference + " / π";
                area = circumference ** 2 + " / 4π";
            }
            else if (area) {
                radius = "√<span class=\"overline\">" + area + " / π</span>"
                diameter = "√<span class=\"overline\">" + 4 * area + " / π</span>"
                circumference = "2√<span class=\"overline\">" + area + "π</span>"
                area = area;
            }
        }
        document.getElementById("circle-sol").style.display = "flex";
        document.getElementById("circle-no-sol").style.display = "none";
        
        document.getElementById("circle-output-radius").innerHTML = radius;
        document.getElementById("circle-output-diameter").innerHTML = diameter;
        document.getElementById("circle-output-circumference").innerHTML = circumference;
        document.getElementById("circle-output-area").innerHTML = area;
    }
    else {
        if (inputs > 1) {
            document.getElementById("circle-no-sol").innerHTML = "Too many inputs"
        }
        else {
            document.getElementById("circle-no-sol").innerHTML = "Not enough inputs"
        }
        document.getElementById("circle-no-sol").style.display = "unset";
        document.getElementById("circle-sol").style.display = "none";
    }
}

function SQGPSF(n) {
    // Return the square root of the greatest perfect sqaure factor of n
    for (var i = n - 1; i > 0; i--) {
        if (n % i == 0 && i ** 0.5 % 1 == 0) {
            return i ** 0.5;
        }
    }
}

function radians(degrees) {
    return degrees * (Math.PI / 180);
}

function degrees(radians) {
    return radians * (180 / Math.PI);
}

doQuadFormula();
doFOIL();
doPointOps();
doTrig();
doCircle();