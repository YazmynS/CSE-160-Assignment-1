// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =`
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    gl_PointSize = u_Size;
  }`

// Fragment shader program
var FSHADER_SOURCE =`
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

  // Global Variables
  let canvas;
  let gl;
  let a_Position;
  let u_FragColor;
  let u_Size;

  function setUpGL(){
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    gl = canvas.getContext("webgl", {preserveDrawingBuffer: true});
    if (!gl) {
      console.log('Failed to get the rendering context for WebGL');
      return;
    }
  }

  function connectVariablesToGLSL(){
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
      console.log('Failed to intialize shaders.');
      return;
    }

    // // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
      console.log('Failed to get the storage location of a_Position');
      return;
    }

    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
      console.log('Failed to get the storage location of u_FragColor');
      return;
    }

    // Get the storage location of u_Size
    u_Size = gl.getUniformLocation(gl.program, 'u_Size');
    if (!u_Size) {
      console.log('Failed to get the storage location of u_Size');
      return;
    }
  }

  //Constraints
  const POINT = 0;
  const TRIANGLE = 1;
  const CIRCLE = 2;
  //Global Variables related to UI Elements
  let g_selectedColor = [1.0, 1.0, 1.0, 1.0]; // Default Color White
  let g_selectedSize = 5;
  let g_selectedType = POINT;
  let g_selectedSegment = 10;
  
  // Set up actions for HTML UI elements
  function addActionsForHtmlUI(){
    // Button Events (Shape Type)
    document.getElementById('green').onclick = function() {g_selectedColor = [0.0, 1.0, 0.0, 1.0]; };
    document.getElementById('red').onclick = function() {g_selectedColor = [1.0, 0.0, 0.0, 1.0]; };
    document.getElementById('clearButton').onclick = function() {g_shapesList = []; gl.clear(gl.COLOR_BUFFER_BIT); isDrawing = false; };

    //Switch Between Shapes
    document.getElementById('pointButton').onclick = function() {g_selectedType=POINT};
    document.getElementById('triangleButton').onclick = function() {g_selectedType=TRIANGLE};
    document.getElementById('circleButton').onclick = function() {g_selectedType=CIRCLE};
    document.getElementById('pictureButton').onclick = function() {drawPicture(); isDrawing = true;};
    
    //Slider Events
    document.getElementById('redSlide').addEventListener('mouseup', function() { g_selectedColor[0] = this.value/100; });
    document.getElementById('greenSlide').addEventListener('mouseup', function() { g_selectedColor[1] = this.value/100; });
    document.getElementById('blueSlide').addEventListener('mouseup', function() { g_selectedColor[2] = this.value/100; });
    document.getElementById('segmentSlide').addEventListener('mouseup', function() { g_selectedSegment = this.value; });

    //Size Slider Events
    document.getElementById('sizeSlide').addEventListener('mouseup', function() { g_selectedSize = this.value; });
  }

function main() {  
  // Set up canvas and gl varaibles 
  setUpGL();

  // Set up GLSL shader program and connect GLSL variables
  connectVariablesToGLSL();
  
  // Set up actions for the HTML UI elements
  addActionsForHtmlUI();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev) } };

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}

let startTime = Date.now();
let isDrawing = true;
function drawPicture(){
  if (!isDrawing) return; 
  let SineMode = true;
  let CosMode = false;
  let tanMode = false;

  let elapsedTime = (Date.now() - startTime) / 1000; // Get Time

  // TSwitch Modes every 3 seconds
  if (elapsedTime <= 3) {
    SineMode = true;
    CosineMode = true;
    TanMode = false;
  } else if (elapsedTime > 3 && elapsedTime <= 6) {
    SineMode = false;
    CosMode = true;
    TanMode = false;
  } else if (elapsedTime > 6 && elapsedTime <= 9) {
    TanMode = true;
    SineMode = false;
    cosinemode = false;
    
  } else {
    startTime = Date.now(); // Reset  time
  }

  // Calculate colors based on current mode
  let r, g, b;
  if (SineMode) {
    r = Math.abs(Math.sin(elapsedTime * 2 * Math.PI));
    g = Math.abs(Math.sin(elapsedTime * 6 * Math.PI));
    b = Math.abs(Math.sin(elapsedTime * Math.PI));
  } if (CosMode) {
    r = Math.abs(Math.cos(elapsedTime * 7 *  Math.PI));
    g = Math.abs(Math.cos(elapsedTime * 2 * Math.PI));
    b = Math.abs(Math.cos(elapsedTime * 4 * Math.PI));
  }
  else if (TanMode) {
    r = Math.abs(Math.tan(elapsedTime * -3 * Math.PI));
    g = Math.abs(Math.tan(elapsedTime * 5 * Math.PI));
    b = Math.abs(Math.tan(elapsedTime * 8 * Math.PI));
  }
  //drawPicture
  //p1x,p1y,p2x,p2y,p3x,p3y
  
  //Outter Wings
  //Top Wings
  gl.uniform4f(u_FragColor, r, g, b, 1.0); // Blue
  drawTriangle( [-0.8, 0.7, -0.8, 0.1, 0.0, 0.0] );
  drawTriangle( [0.8, 0.7, 0.8, 0.1, 0.0, 0.0] );
 
  //Bottom Wings
  drawTriangle( [-0.8, -0.7, -0.8, -0.1, 0.0, 0.0] );
  drawTriangle( [0.8, -0.7, 0.8, -0.1, 0.0, 0.0] );

  //Inner Wings
  //Top Wings
  gl.uniform4f(u_FragColor, 0.5, 0.5, 0.5, 1.0); // Gray
  drawTriangle( [-0.7, 0.5, -0.7, 0.2, 0.0, 0.0] );
  drawTriangle( [0.7, 0.5, 0.7, 0.2, 0.0, 0.0] );

  //Bottom Wings
  drawTriangle( [-0.7, -0.5, -0.7, -0.2, 0.0, 0.0] );
  drawTriangle( [0.7, -0.5, 0.7, -0.2, 0.0, 0.0] );

  // Body
  drawTriangle([-0.2, 0.3, 0.2, 0.3, 0.0, 0.4] );
  drawTriangle( [-0.2, 0.3, 0.2, 0.3, 0.0, 0.0] );  
  drawTriangle([-0.2, -0.3, 0.2, -0.3, 0.0, -0.4] );
  drawTriangle( [-0.2, -0.3, 0.2, -0.3, 0.0, 0.0] );

  //Antennas
  drawTriangle([-0.3, 0.5, 0.2, 0.3, 0.0, 0.4] );
  drawTriangle([0.3, 0.5, -0.2, 0.3, 0.0, 0.4] );

  //Legs
  drawTriangle([-0.2, -0.3, -0.5, -0.7, -0.4, -0.8] );
  drawTriangle([0.2, -0.3, 0.5, -0.7, 0.4, -0.8] );

  //Spots
  gl.uniform4f(u_FragColor, r, g, b, 1.0); // Blue

  drawTriangle( [-0.64, -0.4, -0.64, -0.25, -0.25, -0.12] );
  drawTriangle( [0.64, -0.4, 0.64, -0.25, 0.25, -0.12] );
  drawTriangle( [-0.64, 0.4, -0.64, 0.25, -0.25, 0.12] );
  drawTriangle( [0.64, 0.4, 0.64, 0.25, 0.25, 0.12] );
  
  requestAnimationFrame(drawPicture);
}

var g_shapesList = [];

function click(ev) {
  //Extract the event click and return it in WebGL coordinates
  let [x,y] = convertCoordinatesEventTOGL(ev);

  //Create and store the new point
  let point;
  if (g_selectedType == POINT){
    point = new Point();
  } else if(g_selectedType == TRIANGLE){
    point = new Triangle();
  } else{
    point = new Circle();
  }

  point.position = [x,y];
  point.color = g_selectedColor.slice();
  point.size = g_selectedSize;
  g_shapesList.push(point);

  // Draw every shape that is supposed to be in the canvas
  renderAllShapes();
}

function convertCoordinatesEventTOGL(ev){
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return ([x,y]);
}

function renderAllShapes(){
  
  //Draw all shapes in the list
  var len = g_shapesList.length;
  for(var i = 0; i < len; i++){
    g_shapesList[i].render();

  // Clear <canvas>
  //gl.clear(gl.COLOR_BUFFER_BIT);
  }
}
