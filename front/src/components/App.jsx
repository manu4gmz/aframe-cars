import React, { Component } from 'react';
import io from 'socket.io-client';
import {Entity, Scene} from 'aframe-react';
import "aframe-particle-system-component";
export default class App extends Component {
	constructor (props) {
		super(props)

		this.state = {
			socket: null,
			spectator: true,
			keys: {},
			cars: {},
			id: null
		}

		this.handleKey = this.handleKey.bind(this);
		this.getCameraPos = this.getCameraPos.bind(this);
		this.getCameraRot = this.getCameraRot.bind(this);
	}

	getCameraPos() {
		//console.log(this.state.cars[this.state.id])

		const car = this.state.cars[this.state.id]
		if (!car) return {x:0,y:4,z:0}

		if (this.state.keys[32]) return {
			x: car.orientation.pos.x - (Math.sin((car.orientation.rot.y+90)/180  * Math.PI) * 1.8), 
			y: 20, 
			z: car.orientation.pos.z- (Math.cos((car.orientation.rot.y+90)/180  * Math.PI) * 1.8)
		}

		let result = {
			x: car.orientation.pos.x - (Math.sin(car.orientation.rot.y/180  * Math.PI) * 6) - (Math.sin((car.orientation.rot.y+90)/180  * Math.PI) * 1),
			y: 5,
			z: car.orientation.pos.z - (Math.cos(car.orientation.rot.y/180  * Math.PI) * 8) - (Math.cos((car.orientation.rot.y+90)/180  * Math.PI) * 1)
		}
		return result
	}

	getCameraRot() {
		const car = this.state.cars[this.state.id]
		if (!car) return {x:270,y:200,z:270}

		if (this.state.keys[32]) return {x: 270, y: car.orientation.rot.y-180, z: 0}

		let result = {
			x: 330,
			y: car.orientation.rot.y-180, 
			z: 0
		}
		return result
	}

	handleKey(event){
		const key = event.keyCode;

		this.setState({
			keys: {
				...this.state.keys,
				[key]: event.type == 'keydown'
			}
		})

		this.state.socket.emit("input", this.state.keys)

	}

	componentDidMount() {
		const socket = io();

		this.setState({
			socket
		})

		socket.on("tick", (cars)=>this.setState({cars}))
		socket.on("id", (id)=>{
			console.log(id)
			this.setState({id})
		})
		//console.log(socket, socket.);

		/*setTimeout(()=>{
			console.log(socket.id)
			this.setState({id: socket.id})
		}, 200)
/*
		socket.emit("identification");
		socket.on("identification", (id)=>{

			this.setState({id: socket.id})
		})*/

		document.addEventListener("keydown", this.handleKey, false);
		document.addEventListener("keyup", this.handleKey, false);
	}

	componentWillUnmount(){
	    document.removeEventListener("keydown", this.handleKey, false);
	}

	render() {
		return (
			<div>
			<h1></h1>	
			<Scene
			environment={{
	          preset: 'starry',
	          seed: 2,
	          lightPosition: { x: 0.0, y: 0.5, z: 0.0 },
	          fog: 0.2,
	          ground: 'hills',
	          groundYScale: 6.31,
	          groundTexture: 'none',
	          groundColor: '#36b357',
	          grid: 'none'
	        }}
        	>
	
			<Entity position={this.getCameraPos()} rotation={this.getCameraRot()}>
				<Entity primitive="a-camera" wasd-controls={{enabled:false}} look-controls={{enabled:false}} />
			</Entity>
			



			{/*
				<Entity primitive="a-camera" look-controls={{enabled:true}} orbit-controls={{
					target: this.getCameraPos(),
					minDistance: "0.5",
					maxDistance: "180",
					initialPosition: "0 20 100"
				}}/>
			*/}


			{/*
				<Entity primitive="a-camera" look-controls={{enabled:true}} orbit-controls={{
					minDistance: "0.5",
					maxDistance: "180",
					initialPosition: "0 5 15"
				}}/>
			*/}

				{
					Object.keys(this.state.cars).map(key => {
						const car = this.state.cars[key];
						return (
							<Entity primitive="a-obj-model" src="assets/car.obj" mtl="assets/car.mtl" scale={{x:"0.01", y:"0.01", z:"0.01"}} rotation={car.orientation.rot} position={car.orientation.pos}/>

						)
					})
				}

			</Scene>
			</div>

		);
	}
}

/*
				<Entity geometry={{primitive:"box"}} material={{color: 'red'}} position={{x: 0, y: 0, z: -5}}/>

<a-obj-model src="crate.obj" mtl="crate.mtl"></a-obj-model>

	<a-assets>
    <a-asset-item id="cityModel" src="https://cdn.aframe.io/test-models/models/glTF-2.0/virtualcity/VC.gltf"></a-asset-item>
  </a-assets>

  <a-entity gltf-model="#cityModel" modify-materials></a-entity>

*/

// 0.10920000076294 0.13607999682426 0.20999999344349

// 1.00000000000000 0.00000000000000 0.00000000000000