import * as THREE from 'three';
export class Scene
{
	readonly scene = new THREE.Scene()
	readonly canvas = document.querySelector('canvas.webgl') as HTMLCanvasElement
	readonly renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true, antialias: true }) // transparent background with antialiasing
	width = this.canvas.clientWidth
	height = this.canvas.clientHeight
	fov = 75
	near = 0.1
	far = 1000
	camera = new THREE.PerspectiveCamera(this.fov, this.width / this.height, this.near, this.far);
	lastTime = performance.now()
	currentTime = performance.now()
	deltaTime = 0
	mouseX = 0
	mouseY = 0
	
	constructor()
	{
		this.scene.add(this.camera)
		this.camera.updateProjectionMatrix()
		this.renderer.setSize(this.width, this.height, false);
		window.addEventListener('mousemove', (event) => this.mouse(event))
		window.addEventListener('resize', () =>
		{
			this.width = this.canvas.clientWidth
			this.height = this.canvas.clientHeight
			this.camera.aspect = this.width / this.height
			this.camera.updateProjectionMatrix()
			this.renderer.setSize(this.width, this.height, false)
			this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
			this.canvas.style.width = ''
			this.canvas.style.height = ''
		})
	}

	mouse(event: MouseEvent)
	{
		this.mouseX = (event.clientX / window.innerWidth) * 2 - 1
		this.mouseY = -(event.clientY / window.innerHeight) * 2 + 1
	}

	clock()
	{
		this.currentTime = performance.now()
		this.deltaTime = (this.currentTime - this.lastTime) / 1000
		this.lastTime = this.currentTime
	}

	render()
	{
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
		this.renderer.render(this.scene, this.camera)
	}
}
