chunkSize = 128;
maxHeight = 50;
chunksDistance = 3;
levelMax = 10;

function init(){
	DEV = true;
	ccl = new coCoLog();

	if (!Detector.webgl)
		alert(Detector.addGetWebGLMessage());
	if (!window.Worker)
		alert('WEBWORKER NOT SUPPORTED');

	initThreeJs( 'threeContainer' );
	fillscene();
	initGUI();
	update();
}

var renderer, scene, camera, clock;


INTERSECTED = null;

function initThreeJs( containerId )
{
	/* --------- BASICS ----------*/

	container = document.getElementById( containerId );

	clock = new THREE.Clock();
	scene = new THREE.Scene();
	scene.background = new THREE.Color(0xcc8888);

	camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 1, 2000000 );
	camera.position.x = 0;
	camera.position.y = 300;
	camera.position.z = -300;
	camera.lookAt( new THREE.Vector3( 0, 0, 0 ) );

	renderer = new THREE.WebGLRenderer( { antialias: true, alpha: false } );
	renderer.setClearColor( 0x000000 );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild( renderer.domElement );

	window.addEventListener( 'resize', () => {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize( window.innerWidth, window.innerHeight );
	}, false );

	window.addEventListener( 'mousemove', (event) => {
		mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
	}


		, true )

/* -------- DEV TOOLS --------*/

	//ORBIT CONTROL
	controls = new THREE.OrbitControls( camera );
	controls.target.set( 0, 0, 0 );

//		scene.fog = new THREE.Fog( 0xadc3f3, 100, 1500 )

	if(DEV){

		//STATS
		stats = new Stats();
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.top = '0px';
		container.appendChild( stats.domElement );


		//GRID HELPER
		//	var gridHelper = new THREE.GridHelper( 1000, 2 );
		//	scene.add( gridHelper );

		//AXIS HELPER
		var axisHelper = new THREE.AxesHelper( 500 );
		scene.add( axisHelper );

		circleGridHelper(chunkSize * (chunksDistance + 1/2), 4, chunksDistance + 1);
	}

keyboard = new KeyboardState();
raycaster = new THREE.Raycaster();
mouse = new THREE.Vector2();

//	var geometry = new THREE.BoxGeometry( 1, 200, 1 );
//	var material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
//	var cube = new THREE.Mesh( geometry, material );
//	cube.position.y = 100;
//	cube.position.x = 100;
//	scene.add( cube );
//	
	tinnyHouse = MODELS["tinnyHouse"].clone();
	scene.add(tinnyHouse);
//	tinnyHouse.position.y = 115;
//	tinnyHouse.position.x = 100;
//	tinnyHouse.position.y = 196;

var dir = new THREE.Vector3( 1, 0, 0 );

//normalize the direction vector (convert to vector of length 1)
dir.normalize();

}

/* ------ ANIMATION LOOP ------*/

function update(){
	window.requestAnimationFrame( update );

	if ( DEV ) stats.update();
	keyboardState();


	world.update();
	raycaster.setFromCamera( mouse, camera );

	// calculate objects intersecting the picking ray
	var intersects = raycaster.intersectObjects( world.group.children );
	if (intersects.length > 0)
		console.log(intersects[0]);
	for ( var i = 0; i < intersects.length; i++ ) {
//		intersects[ i ].object.material.color.set( 0xff0000 );
	}

	renderer.render(scene, camera);



}

/* ------ INIT OBJ HERE ------*/

function voronoi(){
	chunksDistance = 7;
	w = chunkSize * (chunksDistance * 2 - 1);
	h = chunkSize * (chunksDistance * 2 - 1);

	group = new THREE.Group();
	group.position.x = - w / 2;
	group.position.z = - h / 2;
	points = [];

	v = new Voronoi();


	for (let x = 0; x < chunksDistance * 2 - 1; x++)
		for (let y = 0; y < chunksDistance * 2 - 1; y++)
			points.push(
				new Point(
					(Math.random() * chunkSize) + x * chunkSize,
					(Math.random() * chunkSize) + y * chunkSize
				)
			)

	var material = new THREE.LineBasicMaterial( { color: 0xffff00 } );
	var geometry = new THREE.Geometry();
	geometry.vertices.push(new THREE.Vector3( 0, 0, 0));
	geometry.vertices.push(new THREE.Vector3( 0, 0, h));
	geometry.vertices.push(new THREE.Vector3( w, 0, h));
	geometry.vertices.push(new THREE.Vector3( w, 0, 0));
	geometry.vertices.push(new THREE.Vector3( 0, 0, 0));

	var cadre_line = new THREE.Line( geometry, material );
	group.add( cadre_line );

	v.Compute(points, w, h);

	edges = v.GetEdges();
	cells = v.GetCells();

	var material = new THREE.LineBasicMaterial( { color: 0x00ff00 } );

	for (let i = 0; i < edges.length; i++)
	{
		let e = edges[i];
		var geometry = new THREE.Geometry();
		geometry.vertices.push(new THREE.Vector3( e.start.x, 0, e.start.y) );
		geometry.vertices.push(new THREE.Vector3( e.end.x, 0, e.end.y) );
		var voronoi_line = new THREE.Line( geometry, material );
		group.add( voronoi_line );
	}

	var material = new THREE.LineBasicMaterial( { color: 0x995599 } );
	for (let i = 0; i < edges.length; i++)
	{
		let e = edges[i];
		var geometry = new THREE.Geometry();
		geometry.vertices.push(new THREE.Vector3( e.left.x, 0, e.left.y) );
		geometry.vertices.push(new THREE.Vector3( e.right.x, 0, e.right.y) );
		var delaunay_line = new THREE.Line( geometry, material );
		group.add( delaunay_line );
	}

	var geometry1 = new THREE.IcosahedronBufferGeometry( 2, 1 );
	var material = new THREE.LineBasicMaterial( { color: 0xff0000 } );
	for (let i = 0; i < points.length; i++)
	{
		var mesh = new THREE.Mesh( geometry1, material );
		mesh.position.x = points[i].x;
		mesh.position.z = points[i].y;
		group.add( mesh );
	}
	scene.add(group);
}

function fillscene(){

	world = new World(chunkSize, maxHeight, chunksDistance, levelMax);
	world.init();
	world.requestChunks();

	sky = new Sky();
	//	voronoi();
	initLight();
//	bufferGeom();
}

function bufferGeom()
{
	var triangles = 10000;

	var geometry = new THREE.BufferGeometry();

	var positions = [];
	var normals = [];
	var colors = [];

	var color = new THREE.Color();

	var n = 800, n2 = n / 2;	// triangles spread in the cube
	var d = 12, d2 = d / 2;	// individual triangle size

	var pA = new THREE.Vector3();
	var pB = new THREE.Vector3();
	var pC = new THREE.Vector3();

	var cb = new THREE.Vector3();
	var ab = new THREE.Vector3();

	for ( var i = 0; i < triangles; i ++ ) {

		// positions

		var x = Math.random() * n - n2;
		var y = Math.random() * n - n2;
		var z = Math.random() * n - n2;

		var ax = x + Math.random() * d - d2;
		var ay = y + Math.random() * d - d2;
		var az = z + Math.random() * d - d2;

		var bx = x + Math.random() * d - d2;
		var by = y + Math.random() * d - d2;
		var bz = z + Math.random() * d - d2;

		var cx = x + Math.random() * d - d2;
		var cy = y + Math.random() * d - d2;
		var cz = z + Math.random() * d - d2;

		positions.push( ax, ay, az );
		positions.push( bx, by, bz );
		positions.push( cx, cy, cz );

		// flat face normals

		pA.set( ax, ay, az );
		pB.set( bx, by, bz );
		pC.set( cx, cy, cz );

		cb.subVectors( pC, pB );
		ab.subVectors( pA, pB );
		cb.cross( ab );

		cb.normalize();

		var nx = cb.x;
		var ny = cb.y;
		var nz = cb.z;

		normals.push( nx, ny, nz );
		normals.push( nx, ny, nz );
		normals.push( nx, ny, nz );

		// colors

		var vx = ( x / n ) + 0.5;
		var vy = ( y / n ) + 0.5;
		var vz = ( z / n ) + 0.5;

		color.setRGB(Math.random(), Math.random(), Math.random());
		colors.push( color.r, color.g, color.b );
		color.setRGB(Math.random(), Math.random(), Math.random());
		colors.push( color.r, color.g, color.b );
		color.setRGB(Math.random(), Math.random(), Math.random());
		colors.push( color.r, color.g, color.b );

	}

	function disposeArray() {

		this.array = null;

	}

	geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ).onUpload( disposeArray ) );
	geometry.addAttribute( 'normal', new THREE.Float32BufferAttribute( normals, 3 ).onUpload( disposeArray ) );
	geometry.addAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ).onUpload( disposeArray ) );

	//				geometry.computeBoundingSphere();

	var material = new THREE.MeshPhongMaterial( {
		color: 0xaaaaaa, specular: 0xffffff, shininess: 250,
		side: THREE.DoubleSide, vertexColors: THREE.VertexColors
	} );

	mesh = new THREE.Mesh( geometry, material );
	scene.add( mesh );

}

function initLight()
{

	var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
	directionalLight.position.set( 0, 1000, 0 );
	scene.add( directionalLight );


	var light = new THREE.AmbientLight( 0x333333 ); // soft white light
	scene.add( light );
}

