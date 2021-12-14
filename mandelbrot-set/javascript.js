var mouse_pos_start = [null, null];
var mouse_pos_new = [null, null];
var render_offset = [0, 0];
var dragging = null;

canvas.addEventListener('mousedown', function(evt) {
    dragging = true;
    mouse_pos_start = [evt.offsetX, evt.offsetY];
}, false)

canvas.addEventListener('mousemove', function(evt) {
    mouse_pos_new = [evt.offsetX, evt.offsetY];
    if (dragging) {
        render_offset = [mouse_pos_new[0] - mouse_pos_start[0], mouse_pos_new[1] - mouse_pos_start[1]];
        mouse_pos_start = [evt.offsetX, evt.offsetY];
        render_set();
    }
}, false);

canvas.addEventListener('mouseup', function(evt) {
    dragging = false;
}, false)


window.addEventListener('resize', function() { 
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    render_set(); 
}, 
false);

function complex_absolute(comp) {
    return ( ( comp[0] ** 2 ) + ( comp[1] ** 2 ) ) ** 0.5;
}

function complex_squaring(comp) {
    return [( comp[0] ** 2 ) + ( comp[1] ** 2 * -1 ), comp[0] * comp[1] * 2];
}

function complex_addition(comp1, comp2) {
    return [comp1[0] + comp2[0], comp1[1] + comp2[1]]
}

function set_check(c, x, y) {
    let z = [0, 0];
    let max_i = 100;
    let i = max_i;
    if (Math.abs(c[0]) < 0.01 && Math.abs(c[1]) < 0.01)
    console.log(c);
    while (complex_absolute(z) < 2 && i >= 0) {
        // console.log(z[0], z[1]);
        z = complex_addition(complex_squaring(z), c)
        // console.log(z[0], z[1]);
        i--;
    }
    if (complex_absolute(z) < 2) {
        drawPixel(gl, x, y)
        console.log("pixel")
    }
    if (complex_absolute(z) < 2.1) {
        console.log(x, y);
    }
    // console.log(z[0], z[1]);
}   

function render_set() {

    console.log("render");

    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);


    var highest_dim = Math.max(canvas.width, canvas.height);
    
    
    for (var y = render_offset[1]; y <= canvas.height; y += 1 + render_offset[1]) {
        for (var x = render_offset[0]; x <= canvas.width; x += 1 + render_offset[0]) {
            set_check([ ( ( ( x / highest_dim ) * 1 ) - ( ( canvas.width / highest_dim ) * 2 ) ), ( ( ( y / highest_dim ) * 1 ) - ( ( canvas.height / highest_dim ) * 2 ) ) ], x, y);
            // console.log(x, y)
        }
    }
}

render_set();