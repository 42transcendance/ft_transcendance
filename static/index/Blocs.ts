import * as THREE from 'three'

export class Blocs {
	blocNumbers = 0
	blocMin = 20
	blocMax = 30
	meshes: THREE.Mesh[] = []
	group: THREE.Group
	color: string
	material: THREE.MeshBasicMaterial
	edgeMaterial: THREE.MeshBasicMaterial
	width = 0
	height = 0

	private darkenColor(color: string, percent: number): string
	{
		const num = parseInt(color.replace("#", ""), 16)
		const r = Math.floor((num >> 16) * (1 - percent / 100))
		const g = Math.floor(((num >> 8) & 0x00FF) * (1 - percent / 100))
		const b = Math.floor((num & 0x0000FF) * (1 - percent / 100))
		return "#" + (0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1)
	}

	constructor(color?: string)
	{
		const blocNumbers = Math.floor(Math.random() * (this.blocMax - this.blocMin + 1)) + this.blocMin
		this.color = color || 'white'
		this.material = new THREE.MeshBasicMaterial({ color: this.color })
		const darkenedColor = this.darkenColor(this.color, 80)
		this.edgeMaterial = new THREE.MeshBasicMaterial({ color: darkenedColor })
		this.group = new THREE.Group()
		for (let i = 0; i < blocNumbers; i++) {
			this.addBloc()
		}
	}

	private isOccupied(x: number, y: number, z: number): boolean
	{
		return this.meshes.some(mesh => 
			mesh.position.x === x && mesh.position.y === y &&  mesh.position.z === z
		)
	}

	private centerGroup()
	{
		let centerX = 0
		let centerY = 0
		for (const mesh of this.meshes) {
			centerX += mesh.position.x
			centerY += mesh.position.y
		}
		centerX /= this.meshes.length
		centerY /= this.meshes.length
		for (const mesh of this.meshes) {
			mesh.position.x -= centerX
			mesh.position.y -= centerY
		}
	}

	private createEdges(mesh: THREE.Mesh)
	{
		const geometry = mesh.geometry as THREE.BoxGeometry
		const edges = new THREE.EdgesGeometry(geometry)
		const wireframe = new THREE.LineSegments(edges, this.edgeMaterial)
		mesh.add(wireframe)
	}

	addBloc()
	{
		const geometry = new THREE.BoxGeometry(1, 1, 1)
		const mesh = new THREE.Mesh(geometry, this.material)
		
		// Ajouter les arêtes visibles avec des tubes
		this.createEdges(mesh)
		
		if (this.meshes.length === 0) {
			mesh.position.set(0, 0, 0)
		}
		else {
			const randomIndex = Math.floor(Math.random() * this.meshes.length)
			const randomMesh = this.meshes[randomIndex]
			const axis = Math.random() > 0.5 ? 'x' : 'y'
			const direction = Math.random() > 0.5 ? 1 : -1
			
			let x = randomMesh.position.x
			let y = randomMesh.position.y
			let z = 0
			
			if (axis === 'x') {
				x += direction
				while (this.isOccupied(x, y, z)) {
					x += direction
				}
			}
			else {
				y += direction
				while (this.isOccupied(x, y, z)) {
					y += direction
				}
			}
			mesh.position.set(x, y, z)
			axis === 'x' ? this.width++ : this.height++
		}
		this.group.add(mesh)
		this.meshes.push(mesh)
		this.blocNumbers++
	}

	removeBloc(index?: number)
	{
		if (index === undefined) {
			const mesh = this.meshes.pop()
			if (mesh) this.group.remove(mesh)
		} 
		else if (index >= 0 && index < this.meshes.length) {
			const mesh = this.meshes.splice(index, 1)[0]
			this.group.remove(mesh)
		}
		// if (this.meshes.length > 0) {
		// 	this.centerGroup()
		// }
	}

	setOriginCorner(corner: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center')
	{
		if (corner === 'center') {
			this.centerGroup()
			return
		}

		let maxX = -Infinity
		let minX = Infinity
		let maxY = -Infinity
		let minY = Infinity
		
		for (const mesh of this.meshes) {
			maxX = Math.max(maxX, mesh.position.x)
			minX = Math.min(minX, mesh.position.x)
			maxY = Math.max(maxY, mesh.position.y)
			minY = Math.min(minY, mesh.position.y)
		}
		
		let pivotX = 0
		let pivotY = 0
		
		if (corner === 'bottom-right') {
			pivotX = maxX
			pivotY = minY
		} else if (corner === 'bottom-left') {
			pivotX = minX
			pivotY = minY
		} else if (corner === 'top-right') {
			pivotX = maxX
			pivotY = maxY
		} else if (corner === 'top-left') {
			pivotX = minX
			pivotY = maxY
		}
		
		for (const mesh of this.meshes) {
			mesh.position.x -= pivotX
			mesh.position.y -= pivotY
			mesh.position.z = 0
		}
	}
}