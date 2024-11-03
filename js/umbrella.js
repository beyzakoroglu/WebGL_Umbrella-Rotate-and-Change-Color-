let rotationAngle = 0.0;  // starting angle
let isRotating = false;  // to control animation mode
const defaultFabricColor = [0.9, 0.65, 0.9, 1.0]; // lilac color
let rotationSpeed = 0.0;

let isColorChanging = false;
let startTime = 0;

const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl2');


gl.viewport(0, 0, canvas.width, canvas.height);
gl.clearColor(1.0, 1.0, 1.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);

// create the shader program
const program = createShaderProgram(gl, vertexShaderSource, fragmentShaderSource);

if (!program) {
    console.error('Shader program failed to initialize.');
}

console.log('Shader program initialized successfully.');

const uRotation = gl.getUniformLocation(program, 'u_rotation');
const uTime = gl.getUniformLocation(program, 'u_time');
const uColor = gl.getUniformLocation(program, 'u_color');


// for listening the mouse movements
canvas.addEventListener('mousemove', (event) => {
    // center of the canvas
    const centerX = canvas.width / 2;

    // mouse x position
    const mouseX = event.clientX;
    const distanceFromCenterX = mouseX - centerX;

    // calculate the speed
    rotationSpeed = distanceFromCenterX * 0.0005;
});


document.addEventListener('keydown', (event) => {
    if (event.key === 'r') {
        rotationAngle = 0.0;
        rotationSpeed = 0.0;
        isColorChanging = false;
        isRotating = false;
        gl.uniform4fv(uColor, defaultFabricColor);
    } else if (event.key === 'm') {
        isRotating = true;
    } else if (event.key === 'c') {
        isRotating = true;
        isColorChanging = true;
        if (isColorChanging) {
            startTime = performance.now();
        }
    }
});

gl.useProgram(program);

function drawUmbrella() {
    if (isRotating) {
        rotationAngle += rotationSpeed;
    }

    // send the rotation angle to the shader
    gl.uniform1f(uRotation, rotationAngle);

    if (isColorChanging) {
        const currentTime = (performance.now() - startTime) / 25.0;
        gl.uniform1f(uTime, currentTime);
    } else {
        gl.uniform1f(uTime, 0.0);
    }

    // draw umbrella components
    drawHandle();
    drawFabric();

    requestAnimationFrame(drawUmbrella);

}

drawUmbrella();

// draw and triangulate the handle
function drawHandle() {
    const uIsFabric = gl.getUniformLocation(program, 'u_isFabric');
    gl.uniform1i(uIsFabric, 0);

    const upperBodyCurve = calculateBezierCurve(
        { x: -0.04, y: 0.7 }, { x: 0.0, y: 0.75 }, { x: 0.04, y: 0.7 }
    );

    const handleCurve = calculateBezierCurve(
        {x: 0.04, y: -0.50001}, { x: -0.13, y: -0.8 }, { x: -0.3, y: -0.5 }
    );

    const handleInnerCurve = calculateBezierCurve(
        {x: -0.23, y: -0.5}, { x: -0.13, y: -0.65 }, { x: -0.042, y: -0.5 }
    );

    const handleVertices = [];
    handleVertices.push(...upperBodyCurve, ...handleCurve, ...handleInnerCurve);

    // perform polygon triangulation
    const result = triangulate(handleVertices);
    if (!result || !result.success) {
        console.error(result?.errorMessage || 'Triangulation failed.');
        return;
    }
    const triangles = result.triangles;

    // flatten the triangulated handleVertices for WebGL
    const positions = new Float32Array(triangles.length * 2);
    let posIndex = 0;
    for (const index of triangles) {
        positions[posIndex++] = handleVertices[index].x;
        positions[posIndex++] = handleVertices[index].y;
    }

    // initialize the buffer with triangle data
    const positionBuffer = initBuffer(gl, positions);
    // bind the buffer to the attribute
    const aPosition = gl.getAttribLocation(program, 'a_position');
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPosition);

    // set the color for the triangles
    if (uColor === -1) {
        console.error('Failed to get the uniform location of u_color.');
        return;
    }
    // dark purple color
    gl.uniform4f(uColor, 0.3, 0.2, 0.6, 1.0);

    // draw the triangles
    gl.drawArrays(gl.TRIANGLES, 0, positions.length / 2);
}

// draw and triangulate the handle
function drawFabric() {
    const uIsFabric = gl.getUniformLocation(program, 'u_isFabric');
    gl.uniform1i(uIsFabric, 1);

    const fabricVertices = [];

    const fabricUpperCurve = calculateBezierCurve(
        {x: -0.7, y: 0.3}, { x: 0.0, y: 1 }, { x: 0.7, y: 0.3 }
    );

    const fabricInnerCurve1 = calculateBezierCurve(
        {x: 0.7, y: 0.299}, { x: 0.468, y: 0.45 }, { x: 0.237, y: 0.3 }
    );

    const fabricInnerCurve2 = calculateBezierCurve(
        {x: 0.238, y: 0.301}, { x: -0.005, y: 0.45 }, { x: -0.227, y: 0.3 }
    );

    const fabricInnerCurve3 = calculateBezierCurve(
        {x: -0.228, y: 0.301}, { x: -0.458, y: 0.45 }, { x: -0.69, y: 0.3 }
    );

    fabricVertices.push(...fabricUpperCurve, ...fabricInnerCurve1, ...fabricInnerCurve2, ...fabricInnerCurve3);

    // perform polygon triangulation
    const result = triangulate(fabricVertices);
    if (!result || !result.success) {
        console.error(result?.errorMessage || 'Triangulation failed.');
        return;
    }
    const triangles = result.triangles;

    // flatten the triangulated fabricVertices for WebGL
    const positions = new Float32Array(triangles.length * 2);
    let posIndex = 0;
    for (const index of triangles) {
        positions[posIndex++] = fabricVertices[index].x;
        positions[posIndex++] = fabricVertices[index].y;
    }

    // initialize the buffer with triangle data
    const positionBuffer2 = initBuffer(gl, positions);
    // bind the buffer to the attribute
    const aPosition = gl.getAttribLocation(program, 'a_position');
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer2);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPosition);

    // set the color for the triangles
    if (uColor === -1) {
        console.error('Failed to get the uniform location of u_color.');
        return;
    }
    // lilac color
    gl.uniform4fv(uColor, defaultFabricColor);

    // draw the triangles
    gl.drawArrays(gl.TRIANGLES, 0, positions.length / 2);
}

// Bézier Curve calculation
function calculateBezierCurve(p0, p1, p2, numPoints = 30) {
    const vertices = [];
    for (let i = 0; i <= numPoints; i++) {
        const t = i / numPoints;
        const x = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x;
        const y = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y;
        vertices.push({ x, y });
    }
    return vertices;
}