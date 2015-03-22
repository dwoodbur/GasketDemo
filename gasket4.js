
var canvas;
var gl;

var points = [];
var colors = [];

var ppoints = [];
var pcolors = [];

var NumTimesToSubdivide = 5;

var mouse_mode = true;

var posX=0, posY=0;
var numVerts = 0;
var numPlaneVerts = 0;
var eye;
var start=true;
var projectionMatrix, modelViewMatrix, modelViewMatrixPlane;

var trans1=0, trans2=0;

var eye, at, up;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    var vertices = [
        vec3(  0.0000,  0.0000, -1.0000 ),
        vec3(  0.0000,  0.9428,  0.3333 ),
        vec3( -0.8165, -0.4714,  0.3333 ),
        vec3(  0.8165, -0.4714,  0.3333 )
    ];
    
    // Draw tetra.
    divideTetra( vertices[0], vertices[1], vertices[2], vertices[3],
                 NumTimesToSubdivide);
	numVerts = points.length;
	
	// Draw plane.
	drawPlane();
	numPlaneVerts = points.length - numVerts;
	
	

    // Configure webgl and load shaders.
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    gl.enable(gl.DEPTH_TEST);
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // Create and initialize buffers.
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );
    
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    
    

	// Set up perspectives.
	
	modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
	
	var left = -2.0;
	var right = 2.0;
	var ytop = 2.0;
	var bottom = -2.0;
	var near = -10;
	var far = 10;
	var r = 4.0, theta=0.0, phi=0.0;
	var fov = 75.0;
	at = vec3(0.0,0.0,0.0);
	up = vec3(0.0,1.0,0.0);
	eye = vec3(r*Math.sin(theta)*Math.cos(phi),
    	r*Math.sin(theta)*Math.sin(phi), r*Math.cos(theta));
    	
    	//eye[2] -= .5;
    	
	modelViewMatrix = lookAt(eye, at, up);
	modelViewMatrixPlane = lookAt(eye, at, up);
	
	projectionMatrix = perspective(75, 1, 0.1, 1000);


	// SUBDIVISIONS BUTTON


	document.getElementById("subdivisions").onchange = function(event) {
		
		NumTimesToSubdivide = event.srcElement.value;
        points = [];
        colors = [];
        divideTetra( vertices[0], vertices[1], vertices[2], vertices[3],
                 NumTimesToSubdivide);
        numVerts = points.length;
        drawPlane();
        numPlaneVerts = points.length - numVerts;
        gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
        
	};
	
	
	// ROTATION BUTTONS
	
		
	document.getElementById("rotateX").onclick = function(event) {
		var phi=.2;
		rotate = mat4( 1.0,  0.0,  0.0,  0.0,
                      	0.0,  Math.cos(phi),  -1*Math.sin(phi), 0.0,
                      	0.0,  Math.sin(phi),  Math.cos(phi), 0.0,
                      	0.0,  0.0,  0.0, 1.0 );
				
		modelViewMatrix = mult(modelViewMatrix, rotate);
	};
	
	
	
	document.getElementById("rotateY").onclick = function(event) {
		var phi=.2;
		rotate = mat4( Math.cos(phi),  -1*Math.sin(phi),  0.0,  0.0,
                      	Math.sin(phi),  Math.cos(phi),  0.0, 0.0,
                      	0.0,  0.0,  1.0, 0.0,
                      	0.0,  0.0,  0.0, 1.0 );
				
		modelViewMatrix = mult(modelViewMatrix, rotate);
	};
	
	document.getElementById("rotateZ").onclick = function(event) {
		var phi=.2;
		rotate = mat4( Math.cos(phi),  0.0,  Math.sin(phi),  0.0,
                      	0.0,  1.0,  0.0, 0.0,
                      	-1*Math.sin(phi),   0.0,  Math.cos(phi), 0.0,
                      	0.0,  0.0,  0.0, 1.0 );
				
		modelViewMatrix = mult(modelViewMatrix, rotate);		
	};
	
	
	// FOV BUTTONS
	
	
	document.getElementById("increase").onclick = function(event) {
		fov += 5;
		
		projectionMatrix = perspective(fov, 1, 0.1, 1000);
	};
	
	document.getElementById("decrease").onclick = function(event) {
		fov -= 5;
		
		projectionMatrix = perspective(fov, 1, 0.1, 1000);
	};
	
	
	// TRANSLATE/ROTATE MOUSE SWITCH
	
	
	document.getElementById("mouseMode").onclick = function(event) {
	
		if(mouse_mode) {
			mouse_mode = false;
			document.getElementById("mouseMode").innerHTML = "Rotate Mode";
		}
		else {
			mouse_mode = true;
			document.getElementById("mouseMode").innerHTML = "Translate Mode";
		}
	};
	
	
	// KEY EVENTS
	
	
	window.onkeydown = function( event ) {
		
		// Adjust tetrahedron based on key.
		
        var key = String.fromCharCode(event.keyCode);
        switch( key ) {
        	case 'A':
        		at[0] -= .05;
        		break;
        	case 'D':
        		at[0] += .05;
        		break;
        	
        	case 'W':
        		eye[2] -= .05;
        		break;
        	case 'S':
        		eye[2] += .05;
        		break;	
        	case 'R':
        		eye[1] += .05;
        		break;
        	case 'F':
        		eye[1] -= .05;
        		break;
        }
        
        //modelViewMatrix = mult(modelViewMatrix, lookAt(eye, at, up));
        //modelViewMatrixPlane = mult(modelViewMatrixPlane, lookAt(eye, at, up));
        modelViewMatrix = lookAt(eye, at, up);
        modelViewMatrixPlane = lookAt(eye, at, up);
    };

	canvas.onmousemove = function (event) {
		
		if(mouse_mode) {
			
			if(posX == 0 && posY == 0) {
				posX = event.clientX;
				posY = event.clientY;
			}
			
			// ROTATE MODE
			
			else {
				var posXUpdate = event.clientX;
				var posYUpdate = event.clientY;
				
				// Left
				if(posXUpdate < posX) {
					var phi=.05;
					rotate = mat4( Math.cos(phi),  0.0,  -1*Math.sin(phi),  0.0,
                    				0.0,  1.0,  0.0, 0.0,
                    				Math.sin(phi),   0.0,  Math.cos(phi), 0.0,
                   					0.0,  0.0,  0.0, 1.0 );
				
					modelViewMatrix = mult(modelViewMatrix, rotate);
				}
				
				// Right
				else if(posXUpdate > posX) {
					var phi=.05;
					var rotate = mat4( Math.cos(phi),  0.0,  Math.sin(phi),  0.0,
                  					0.0,  1.0,  0.0, 0.0,
                   					-1*Math.sin(phi),   0.0,  Math.cos(phi), 0.0,
                					0.0,  0.0,  0.0, 1.0 );
				
					modelViewMatrix = mult(modelViewMatrix, rotate);
				}
				// Down
				if(posYUpdate < posY) {
					var phi=.05;
					var rotate = mat4( 1.0,  0.0,  0.0,  0.0,
                  					0.0,  Math.cos(phi),  Math.sin(phi), 0.0,
                   					0.0,   -1*Math.sin(phi),  Math.cos(phi), 0.0,
                					0.0,  0.0,  0.0, 1.0 );
				
					modelViewMatrix = mult(modelViewMatrix, rotate);
				}
				// Up
				else if(posYUpdate > posY) {
					var phi=.05;
					var rotate = mat4( 1.0,  0.0,  0.0,  0.0,
                  					0.0,  Math.cos(phi),  -1*Math.sin(phi), 0.0,
                   					0.0,   Math.sin(phi),  Math.cos(phi), 0.0,
                					0.0,  0.0,  0.0, 1.0 );
				
					modelViewMatrix = mult(modelViewMatrix, rotate);
				}
				
				
				posX = posXUpdate;
				posY = posYUpdate;
			}
			
		}
		
		// TRANSLATE MODE
		
		else {
			
			if(posX == 0 && posY == 0) {
				posX = event.clientX;
				posY = event.clientY;
			}
			
			else {
				
				var posXUpdate = event.clientX;
				var posYUpdate = event.clientY;
				
				// Left
				if(posXUpdate < posX) {
					translate = mat4( 1.0,  0.0,  0.0, -0.05,
                      				  0.0,  1.0,  0.0, 0.0,
                      				  0.0,  0.0,  1.0, 0.0,
                      				  0.0,  0.0,  0.0, 1.0 );
					modelViewMatrix = mult(modelViewMatrix, translate);
				}
				// Right
				else if(posXUpdate > posX) {
					translate = mat4( 1.0,  0.0,  0.0, 0.05,
                      				  0.0,  1.0,  0.0, 0.0,
                      				  0.0,  0.0,  1.0, 0.0,
                      				  0.0,  0.0,  0.0, 1.0 );
					modelViewMatrix = mult(modelViewMatrix, translate);
				}
				// Down
				if(posYUpdate < posY) {
					translate = mat4( 1.0,  0.0,  0.0, 0.0,
                      				  0.0,  1.0,  0.0, 0.05,
                      				  0.0,  0.0,  1.0, 0.0,
                      				  0.0,  0.0,  0.0, 1.0 );
					modelViewMatrix = mult(modelViewMatrix, translate);
				}
				// Up
				else if(posYUpdate > posY) {
					translate = mat4( 1.0,  0.0,  0.0, 0.0,
                      				  0.0,  1.0,  0.0, -0.05,
                      				  0.0,  0.0,  1.0, 0.0,
                      				  0.0,  0.0,  0.0, 1.0 );
					modelViewMatrix = mult(modelViewMatrix, translate);
				}
				posX = posXUpdate;
				posY = posYUpdate;
			}
		}
	}
	
    update();
};


function triangle( a, b, c, color )
{

    // add colors and vertices for one triangle

    var baseColors = [
        vec3(1.0, 0.0, 0.0),
        vec3(0.0, 1.0, 0.0),
        vec3(0.0, 0.0, 1.0),
        vec3(0.0, 0.0, 0.0)
    ];

    colors.push( baseColors[color] );
    points.push( a );
    colors.push( baseColors[color] );
    points.push( b );
    colors.push( baseColors[color] );
    points.push( c );
}

function tetra( a, b, c, d )
{
    // tetrahedron with each side using
    // a different color
    
    triangle( a, c, b, 0 );
    triangle( a, c, d, 1 );
    triangle( a, b, d, 2 );
    triangle( b, c, d, 3 );
}

function divideTetra( a, b, c, d, count )
{
    // check for end of recursion
    
    if ( count === 0 ) {
        tetra( a, b, c, d );
    }
    
    // find midpoints of sides
    // divide four smaller tetrahedra
    
    else {
        var ab = mix( a, b, 0.5 );
        var ac = mix( a, c, 0.5 );
        var ad = mix( a, d, 0.5 );
        var bc = mix( b, c, 0.5 );
        var bd = mix( b, d, 0.5 );
        var cd = mix( c, d, 0.5 );

        --count;
        
        divideTetra(  a, ab, ac, ad, count );
        divideTetra( ab,  b, bc, bd, count );
        divideTetra( ac, bc,  c, cd, count );
        divideTetra( ad, bd, cd,  d, count );
    }
}


function square( a, b, c, d, color) {
	
	var someColors = [
		vec3(.5, .5, .5),
		vec3(1.0, 1.0, 0)
	]
	
	for(var k=0; k < 6; k++)
		floorColors.push(someColors[color]);
	
	floorPoints.push(a, b, d);
	floorPoints.push(a, c, d);
	
}

function drawPlane() {
	// Make plane
	
	var pColors = [
		vec3(1.0, 1.0, 1.0),
		vec3(0.0, 0.0, 0.0)
	]
	
	var j=0;
	var alts = [];
	for (var z = 100.0; z > -100.0; z -= 5.0) {
        for (var x = -100.0; x < 100.0; x += 5.0) {
    
    		alts.push((data[j]/255)*-1);
        	
        }
    }
    
    for(var mm=0; mm < alts.length; mm++) {
    	console.log(alts[mm]);
    }
    
    for(var n=500; n < 2000; n++) {
    	alts.push((data[n]/255)*-1);
    }
    
	
	var i = 0; if(NumTimesToSubdivide < 5) i++;
	j=1000;
    for (var z = 100.0; z > -100.0; z -= 5.0) {
        for (var x = -100.0; x < 100.0; x += 5.0) {
            if (i % 2) {
        // Add 6 colors to current square.
            colors.push( pColors[0]);
            colors.push( pColors[0]);
            colors.push( pColors[0]);
            colors.push( pColors[0]);
            colors.push( pColors[0]);
            colors.push( pColors[0]);
        }
        else {
        // Add 6 different colors to current square.
            colors.push( pColors[1]);
            colors.push( pColors[1]);
            colors.push( pColors[1]);
            colors.push( pColors[1]);
            colors.push( pColors[1]);
            colors.push( pColors[1]);
        }
        // Add 6 points that make the square. Each point
            /*points.push(vec3(x, alts[j], z));//y=-.9
            points.push(vec3(x-5, alts[j+40], z));
            points.push(vec3(x, alts[j+2], z-5));
            points.push(vec3(x, alts[j+2], z-5));
            points.push(vec3(x-5, alts[j+3], z-5));
            points.push(vec3(x-5, alts[j+40], z));*/

			points.push(vec3(x, -.9, z));//y=-.9
            points.push(vec3(x-5, -.9, z));
            points.push(vec3(x, -.9, z-5));
            points.push(vec3(x, -.9, z-5));
            points.push(vec3(x-5, -.9, z-5));
            points.push(vec3(x-5, -.9, z));


            ++i;
            ++j;
        }
        ++i;
    }
    
	
	
}

function update() {
	requestAnimationFrame(update);
	render();
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
    
    gl.drawArrays( gl.TRIANGLES, 0, numVerts );
    
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrixPlane));
    
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
    
    gl.drawArrays( gl.TRIANGLES, numVerts, numPlaneVerts);
}
