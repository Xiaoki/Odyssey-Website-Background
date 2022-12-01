
/*

Project: Odyssey Explorer
Company: Odyssey B.V
Website: https://odyssey.org/
Author:  Frank Bloemendal

*/

import gsap, { normalize } from "gsap";
import * as THREE from "three";
import { CameraHelper, CompressedPixelFormat, CurvePath, FrontSide, GeometryUtils, Group, LineCurve, MeshBasicMaterial, MeshStandardMaterial, Object3D, Raycaster, SphereGeometry, TetrahedronGeometry, TextureLoader, Triangle, Vector3, _SRGBAFormat } from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as dat from 'dat.gui';



/**
 * For Dev Only
 */

let AmountOfGalaxyToGenereate = 20;
let maxOdysseyConnectionLineHeight = 8;
let MaxOrbitCameraDistance = 15;
let planetAreSpawnedHorizontal = true;
let planetsMaxVerticalSpawnHeight = 10;
let distanceBetweenSpawnedPlanetRings = 5;

class Odyssey extends THREE.Mesh {

    constructor(geometry, material, number, wallet, name, url){

        super(geometry, material)

        this.material = material;
        this.geometry = geometry;
        this.number = number;
        this.wallet = wallet;
        this.name = name;
        this.url = url;
        this.isOdyssey = true;

    }

    connectedOdysseys = []


    /**
     * Generating random Connection for vizualisation of connections.
     * DELETE THIS LATER.
     */
    randomConnection = (maxAmount) => {
        let amountToGenerate = Math.random() * 3;
        for (let i = 0; i < amountToGenerate; i++ ){
            let object = {
                id: Math.floor(Math.random() * maxAmount),
            }
            this.connectedOdysseys.push(object);
        }
    }
    

    log = () => {
        console.log("ID:" + this.number + " Wallet:" + this.wallet + " Webaddress:" + this.url + " Connected: " + this.connectedOdysseys) ;
    }


}

const createNewOdyssey = (id, wallet, name, url) => {

    const standardTextures = [
        "./images/baseAtmos.png", 
        "./images/temptations.png", 
        "./images/showTime.png", 
        "./images/honey01.png",
        "./images/iceland01.png", 
    ];   

    const randNum = Math.floor(Math.random() * (standardTextures.length));
    const texture = standardTextures[randNum]

    const geometry = new SphereGeometry(1, 16,16);
    const material = new MeshStandardMaterial({
        map: new THREE.TextureLoader().load(texture)
    });

    const odyssey = new Odyssey(geometry, material, id, wallet, name, url);

    return odyssey;
}


let scene, canvas, renderer, controls;

const gui = new dat.GUI();
gui.hide();

let meshArray = [];
  
// Scene setup
canvas = document.querySelector(".webgl");
scene = new THREE.Scene();

// Camera Setup
const aspect = window.innerWidth / window.innerHeight;
const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 10000);
camera.position.set(15,20,2);
camera.lookAt(0,0,0);
scene.add(camera);

// Light Setup
const ambient = new THREE.AmbientLight(0x404040, 5);
scene.add(ambient);


// Renderer Setup
renderer = new THREE.WebGLRenderer({canvas, antialias: true});
renderer.setClearColor(0x222222);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);


// Orbit Controls setup
controls = new OrbitControls(camera, renderer.domElement);
controls.autoRotate = true;
controls.autoRotateSpeed = 0.3;
controls.maxDistance = MaxOrbitCameraDistance;
controls.enableZoom = false;
controls.enablePan = false;
controls.enableRotate = false;



/**
 * Happyship skybox
 */
const backgroundImage = new THREE.TextureLoader().load('./images/BasicSkyboxHD.png');
backgroundImage.mapping = THREE.EquirectangularReflectionMapping;
scene.background = backgroundImage;

/**
 * Build Galaxy
 */
const parameters = {};
parameters.count = 100000;
parameters.size = 0.001;
parameters.radius = 20;
parameters.branches = 3;
parameters.spin = 1.3;
parameters.randomnes = 0.2;
parameters.randomnesPower = 6;
parameters.YHeight= 5;

let pointsGeometry = null;
let pointsMaterial = null;
let points = null;

const generateGalaxy = () => {

    /**
     * Clean previous renders of galaxy.
     */
    if(points !== null){
        pointsGeometry.dispose();
        pointsMaterial.dispose();
        scene.remove(points);
    };

    /**
     * Geometry
     */
    pointsGeometry = new THREE.BufferGeometry();
    const position = new Float32Array(parameters.count * 3);

    for(let i = 0; i < parameters.count; i++ ){

        const i3 = i * 3;

        const radius = Math.random() * parameters.radius;
        const spinAngle = radius * parameters.spin;
        const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2;

        const randomX = Math.pow(Math.random(), parameters.randomnesPower) * (Math.random() < 0.5 ? 1 : -1);
        const randomY = Math.pow(Math.random(), parameters.randomnesPower) * (Math.random() < 0.5 ? parameters.YHeight : -parameters.YHeight);
        const randomZ = Math.pow(Math.random(), parameters.randomnesPower) * (Math.random() < 0.5 ? 1 : -1);


        position[i3 + 0] = Math.cos(branchAngle + spinAngle) * radius + randomX; 
        position[i3 + 1] = randomY;
        position[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;
    }

    pointsGeometry.setAttribute(
        'position',
        new THREE.BufferAttribute(position, 3)
    );

    /**
     * Material
     */
    pointsMaterial = new THREE.PointsMaterial({
        size: parameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        color: 0xFF5588,
        transparent: true,
        opacity: 0.5,
    });

    /**
     * Create stars in the universe.
     */
    points = new THREE.Points(pointsGeometry, pointsMaterial);
    scene.add(points);


};

//const axesHelper = new THREE.AxesHelper( 5 );
//scene.add( axesHelper );

generateGalaxy();

gui.add(parameters, "count").min(100).max(1000000).step(100).onFinishChange(generateGalaxy);
gui.add(parameters, "size").min(0.001).max(0.1).step(0.001).onFinishChange(generateGalaxy);
gui.add(parameters, "radius").min(1).max(500).step(1).onFinishChange(generateGalaxy);
gui.add(parameters, "branches").min(2).max(10).step(1).onFinishChange(generateGalaxy);
gui.add(parameters, "spin").min(-3).max(3).step(0.1).onFinishChange(generateGalaxy);
gui.add(parameters, "randomnes").min(0).max(2).step(0.001).onFinishChange(generateGalaxy);
gui.add(parameters, "randomnesPower").min(1).max(10).step(0.001).onFinishChange(generateGalaxy);
gui.add(parameters, "YHeight").min(1).max(150).step(1).onFinishChange(generateGalaxy);



const centerOdyssey = createNewOdyssey(122, "Wallet Address", "Frenkie world", "test.com");
scene.add(centerOdyssey);



/**
* Create test array for odyssey
*/

 let listOfOddyseys = []
 let referenceListOfOdysseys = []

 const ProcessOdyssey = () => {
     
     const numberOfPlanets = AmountOfGalaxyToGenereate;

     //Build an odyssey for all given entries.
     for(let i = 0; i < numberOfPlanets; i++){
        const odyssey = createNewOdyssey(i, "Wallet Address", "Frenkie world", "test.com");
        listOfOddyseys.push(odyssey);
     }

     referenceListOfOdysseys = [...listOfOddyseys];
 }

 ProcessOdyssey();


 /**
  * Create Circular Universe of Odysseys
  */

const buildUniverse = () => {
    
    let radius = 7;
    const radiusIncreaseValue = distanceBetweenSpawnedPlanetRings;
    let AmountOfOdysseyInNextRing = 10;
    let ringCount = 1;
    let odysseyGroups = [];

    // Build circles in groups.
    function createRing(){

        // if amount to be spawned bigger than available odyssey
        if(listOfOddyseys.length < AmountOfOdysseyInNextRing){
            AmountOfOdysseyInNextRing = listOfOddyseys.length;
        }

        let degreeBetweenOdyssey = 360 /AmountOfOdysseyInNextRing;
        let offset = 0;
        let currentOdyssey

        const odysseyCircle = new THREE.Group();
        odysseyCircle.name = "circle" + ringCount;


        // Fill circle with odysseys.
        for(let i = 0; i < AmountOfOdysseyInNextRing; i++){
            currentOdyssey = listOfOddyseys[i];
            const radian = offset * ( Math.PI / 180);
            offset += degreeBetweenOdyssey;

            const newX = Math.cos(radian) * radius;
            let newY
            if (planetAreSpawnedHorizontal){
                newY = 0;
            }else{
                newY =  (Math.random() * planetsMaxVerticalSpawnHeight) - (planetsMaxVerticalSpawnHeight /2);
            }
            const newZ = Math.sin(radian) * radius;

            currentOdyssey.position.set(newX, newY, newZ);
        
            currentOdyssey.randomConnection(AmountOfGalaxyToGenereate); // TEMP: Generate Random Connection in Class.

            odysseyCircle.add(currentOdyssey);
            
       } 

       listOfOddyseys.splice(0, AmountOfOdysseyInNextRing);
       
       radius += radiusIncreaseValue;
       AmountOfOdysseyInNextRing = AmountOfOdysseyInNextRing * 1.5;
       ringCount++;
       
       // Add newly created ring of odysseys to the array.
       odysseyGroups.push(odysseyCircle);
       

    }

    /** Trigger While loop posting all odyssey. */
    while(listOfOddyseys.length > 0){
        createRing();
    }

    // Add all odyssey rings to the scene.
    odysseyGroups.forEach( circle => {
        scene.add(circle);
    })

    /**
     * Draw lines between staked Odysseys.
     */

    // setup reusable variables and material
    let vectorsForLine = []
    const lineMat = new THREE.LineBasicMaterial({color: 0xFFFFFF, transparent: true, opacity: 0.15});

    referenceListOfOdysseys.forEach( odyssey => {
        
        odyssey.connectedOdysseys.forEach( obj => {
            
            vectorsForLine = [] //clean for next line.

            // Get positions from connected odyssey and draw line.
            const foundOdyssey = referenceListOfOdysseys.filter( planet => planet.number === obj.id)[0];

            if(foundOdyssey){
                const randomLineHeight = (Math.random() * maxOdysseyConnectionLineHeight ) * (Math.random() > 0.5 ? 1 : -1 );
                let middlePosition = new Vector3((odyssey.position.x + foundOdyssey.position.x) /2, randomLineHeight, (odyssey.position.z + foundOdyssey.position.z) /2);

                
                const curve = new THREE.QuadraticBezierCurve3(
                    odyssey.position,
                    middlePosition,
                    foundOdyssey.position,
                )
                
                const curvePoints = curve.getSpacedPoints(20);
                const curveGeometry = new THREE.BufferGeometry().setFromPoints(curvePoints);;
                const curveMesh = new THREE.Line(curveGeometry, lineMat);
                scene.add(curveMesh);

            }
        });


    
    })


 }



 buildUniverse();




// Animation
function animate(){

    // Render the scene
    renderer.render(scene, camera);

    // Update controls for auto-rotate.
    controls.update();

    // Re-call Animation
    window.requestAnimationFrame(animate);

};



// On window resize:
function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight);
}

// EventListeners.
window.addEventListener('resize', onWindowResize, false); 

animate();