import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
import {RGBELoader} from 'three/examples/jsm/loaders/RGBELoader.js'
import { GroundProjectedSkybox } from 'three/addons/objects/GroundProjectedSkybox.js';
/**
 * Base
 */
// Debug

const params = {}
params.envMapIntensity = 1.5


const gui = new dat.GUI()

gui.add(params,'envMapIntensity',0,10,0.001).onChange(
    ()=>{
        updateAllMaterials() 
    })
                
/**
 * Loaders
 */

const gltfLoader = new GLTFLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()
const rgbeLoader = new RGBELoader()
const textureLoader = new THREE.TextureLoader()
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()


//update all materials


const updateAllMaterials = () =>{

    scene.traverse((child)=>{
        
        if(child.isMesh && child.material.isMeshStandardMaterial){
            child.material.envMapIntensity = params.envMapIntensity 
        }
    })
 

}

//Environment map

//LDR texture

// const envMap = cubeTextureLoader.load([
//     '/environmentMaps/0/px.png',
//     '/environmentMaps/0/nx.png',
//     '/environmentMaps/0/py.png',
//     '/environmentMaps/0/ny.png',
//     '/environmentMaps/0/pz.png',
//     '/environmentMaps/0/nz.png'
// ])

// scene.environment = envMap
// scene.background= envMap

//rgbe loader

// rgbeLoader.load('/environmentMaps/0/2k.hdr',
//     (emap) => {
//         //load
//         emap.mapping = THREE.EquirectangularReflectionMapping
//         scene.environment = emap
//         scene.background= emap
//     }
// )

// LDR  skybox loader

// const envMap = textureLoader.load('environmentMaps/blockadesLabsSkybox/mau-env.jpg')
// envMap.mapping = THREE.EquirectangularReflectionMapping 
// scene.environment = envMap
// //scene.background= envMap

// envMap.colorSpace= THREE.SRGBColorSpace

// scene.backgroundBlurriness= 0
// scene.backgroundIntensity=0.9

// const skybox = new GroundProjectedSkybox(envMap)

// skybox.radius=120
// skybox.height=11

// skybox.scale.setScalar(50)
// scene.add(skybox)


// dynamic

const envMap = textureLoader.load('environmentMaps/blockadesLabsSkybox/mau-env.jpg')
envMap.mapping = THREE.EquirectangularReflectionMapping 
envMap.colorSpace= THREE.SRGBColorSpace




scene.background = envMap


// holy donut
const hdonut = new THREE.Mesh(
    new THREE.TorusGeometry(8,.5),
    new THREE.MeshBasicMaterial({color: new THREE.Color(10,1,10)})
)
hdonut.position.y=2
hdonut.layers.enable(1)
scene.add(hdonut)


const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256,
    {
        type: THREE.HalfFloatType
    })    

scene.environment = cubeRenderTarget.texture


const cubeCamera = new THREE.CubeCamera(0.1,100,cubeRenderTarget)
cubeCamera.layers.set(1)



//merge together

// const skybox = new GroundProjectedSkybox(envMap)

// skybox.radius=120
// skybox.height=11

// skybox.scale.setScalar(50)
// scene.add(skybox)


gui.add(scene, 'backgroundBlurriness',0,1,0.001)
gui.add(scene, 'backgroundIntensity',0,10,0.001)


console.log(scene.environment)
/**
 * Torus Knot
 */
const torusKnot = new THREE.Mesh(
    new THREE.TorusKnotGeometry(1, 0.4, 100, 16),
    new THREE.MeshStandardMaterial({
        roughness:.05,
        metalness:1,
        color:0xaaaaaa
    })
)
torusKnot.position.y = 4
torusKnot.position.x = -5
// torusKnot.material.envMap = envMap
scene.add(torusKnot)
gui.add(torusKnot.position,'y',0,10,0.001)

/**
 * Models
 */

gltfLoader.load(
    'models/FlightHelmet/glTF/FlightHelmet.gltf',
    (gltf) => {
        gltf.scene.scale.set(10,10,10)
        scene.add(gltf.scene)
        updateAllMaterials()
    }
)

// fox loader
let mixer

gltfLoader.load(
    // '/models/FlightHelmet/glTF/FlightHelmet.gltf',
    '/models/Fox/glTF/Fox.gltf',
    (gltf)=>{
        
          // note adding childrem from one scene to another removes from the previous parent
        // while(gltf.scene.children.length){
        //     scene.add(gltf.scene.children[0])
        // }
        

        //better way is to take a deep copy with spread instead of a potential hang with while loop
        // const children = [...gltf.scene.children]
        // scene.add(...children)

        mixer = new THREE.AnimationMixer(gltf.scene)
        const action = mixer.clipAction(gltf.animations[0])

        action.play()

        gltf.scene.scale.set(.155,.155,.155)
        gltf.scene.rotation.y= Math.PI/1.24
        gltf.scene.position.z=80
        
        gltf.scene.traverse( (child)=>{

            child.layers.enable( 1 )
        
        } )

        scene.add(gltf.scene)
       
        console.log('success')
    },
    ()=>{console.log('progress')},
    ()=>{console.log('error')}
    
)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})


/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 150)
camera.position.set(0, 10, 25)
scene.add(camera)

/**
 * Light
 */

const plight = new THREE.PointLight(0xffffff)
plight.position.set(3,3,3)
scene.add(plight)

const alight = new THREE.AmbientLight(0xffffff)
scene.add(alight)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.y = 3.5
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


let previousTime = 0
/**
 * Animate
 */
const clock = new THREE.Clock()
const tick = () =>
{
    // Time
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime


    //reale time env map
    if (hdonut){
        hdonut.rotation.x = Math.sin(elapsedTime) *2
        cubeCamera.update(renderer,scene)
    }


    // update animation mixer
    if(mixer)
    mixer.update(deltaTime)

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()