import * as THREE from 'three';
import GUI from 'lil-gui';
import { Scene } from "../Scene.ts";
import { Blocs } from "./Blocs.ts";

const scene = new Scene()
let gap = 1

const bloc = new Blocs('white')
const blocs1 = new Blocs('#FF50A5')
const blocs2 = new Blocs('#50FF93')
const blocs3 = new Blocs('#FFEE50')
const blocs4 = new Blocs('#FF6B50')
const allBlocs = [blocs1, blocs2, blocs3, blocs4]
scene.camera.position.set(0, 0, ((bloc.blocMax - bloc.blocMin) + gap) * 2)

blocs1.setOriginCorner('bottom-right')
blocs2.setOriginCorner('bottom-left')
blocs3.setOriginCorner('top-right')
blocs4.setOriginCorner('top-left')

blocs1.group.position.set(-gap, gap, 0)
blocs2.group.position.set(gap, gap, 0)
blocs3.group.position.set(-gap, -gap, 0)
blocs4.group.position.set(gap, -gap, 0)

const blocs = new THREE.Group().add(blocs1.group, blocs2.group, blocs3.group, blocs4.group)
scene.scene.add(blocs)
scene.camera.lookAt(blocs.position)

document.addEventListener('mousemove', (event) => {
	scene.mouse(event)
})

function main() {
	scene.clock()
	scene.render()
	blocs
	blocs.rotation.x = -scene.mouseY * Math.PI / 3
	blocs.rotation.y = scene.mouseX * Math.PI / 3
	window.requestAnimationFrame(main)
}

function debug() {
	// const gui = new GUI();
	console.log((Blocs.prototype.blocMax - Blocs.prototype.blocMin * 2))
}

function randomBlocs()
{
	const target = allBlocs[Math.floor(Math.random() * allBlocs.length)]
	const shouldAdd = Math.random() > 0.5

	if (shouldAdd) {
		if (typeof (target as any).addBloc === 'function') {
			;(target as any).addBloc()
		}
		return
	}

	if (typeof (target as any).removeBloc === 'function') {
		;(target as any).removeBloc()
	}
}

debug()
window.setInterval(randomBlocs, 1000)
main()