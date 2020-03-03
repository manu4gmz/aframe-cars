import React, { Component } from 'react';
import {Redirect} from "react-router-dom";
import io from 'socket.io-client';
import {Entity, Scene} from 'aframe-react';
import "aframe-particle-system-component";
export default class Game extends Component {
	constructor (props) {
		super(props)

		this.state = {
			socket: null,
			spectator: true,
			keys: {},
			cars: {},
			id: null,
			zoom: 1,
			touch: false
		}

		this.handleKey = this.handleKey.bind(this);
		this.handleZoom = this.handleZoom.bind(this);
		this.getCameraPos = this.getCameraPos.bind(this);
		this.getCameraRot = this.getCameraRot.bind(this);
		this.touchInput = this.touchInput.bind(this);
	}

	getCameraPos() {
		//console.log(this.state.cars[this.state.id])

		const car = this.state.cars[this.state.id]
		if (!car) return {x:0,y:4,z:0}

		if (this.state.keys[32]) return {
			x: car.orientation.pos.x - (Math.sin((car.orientation.rot.y+90)/180  * Math.PI) * 1.8), 
			y: 10+ 8*this.state.zoom, 
			z: car.orientation.pos.z- (Math.cos((car.orientation.rot.y+90)/180  * Math.PI) * 1.8)
		}

		let result = {
			//x: car.orientation.pos.x - (Math.sin(car.orientation.rot.y/180  * Math.PI) * 4  * this.state.zoom) - (Math.sin((car.orientation.rot.y+90)/180  * Math.PI) * 1),
			x: car.orientation.pos.x - (Math.sin(car.orientation.rot.y/180  * Math.PI) * 4  * this.state.zoom),
			y: 5*this.state.zoom,
			//z: car.orientation.pos.z - (Math.cos(car.orientation.rot.y/180  * Math.PI) * 5  * this.state.zoom) - (Math.cos((car.orientation.rot.y+90)/180  * Math.PI) * 1)
			z: car.orientation.pos.z - (Math.cos(car.orientation.rot.y/180  * Math.PI) * 5  * this.state.zoom)
		}
		return result
	}

	getCameraRot() {
		const car = this.state.cars[this.state.id]
		if (!car) return {x:270,y:200,z:270}

		if (this.state.keys[32]) return {x: 270, y: car.orientation.rot.y-180, z: 0}

		let result = {
			x: 340 - 5*this.state.zoom,
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

	handleZoom(e) {
	    const newZoom = this.state.zoom - e.wheelDelta/2000;
	    if (newZoom < 0.34) return;
	    if (newZoom > 3) return;
	    this.setState({zoom: newZoom})
	}

	componentDidMount() {

		if (!this.props.name) return;
		console.log(this.props.spectator)
		const socket = io(window.location.origin, { query: `name=${this.props.name}&spectator=${this.props.spectator}` });

		this.setState({
			socket
		})

		socket.on("tick", (cars)=>this.setState({cars}))

		if (this.props.spectator) return;

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

		document.addEventListener('mousewheel', this.handleZoom, false);

		document.addEventListener("touchstart", (ev)=> {
			this.setState({touch: true}) 
			this.touchInput(ev)
		})
		document.addEventListener("touchmove", this.touchInput);
		document.addEventListener("touchmove", this.touchInput);
		document.addEventListener("touchend", (ev)=> {
			this.setState({touch: false, keys: {}})
			this.touchInput(ev)

		})
	}

	touchInput(event) {
		if (!this.state.touch) {

			return this.state.socket.emit("input", this.state.keys)
		} 
		const { clientX, clientY } = event.targetTouches[0];
		const { x, y } = { x: clientX / window.innerWidth, y: clientY / window.innerHeight };
		console.log(x, y, this.state.touch);
		this.setState({ keys: { 
			87: (y < 0.5),
			83: (y > 0.75),
			65: (x < 0.33),
			68: (x > 0.66),
			32: event.targetTouches.length > 2
		} })

		this.state.socket.emit("input", this.state.keys)

	}

/*
		W = key[87],
        A = key[65],
        S = key[83],
        D = key[68],
        */
	componentWillUnmount(){
	    document.removeEventListener("keydown", this.handleKey, false);
	    document.removeEventListener("keyup", this.handleKey, false);
	    document.removeEventListener("mousewheel", this.handleZoom, false);
	}

	render() {
		if (!this.props.name) return <Redirect to="/enter"/>
		return (
			<div>
				<h1></h1>
				<table style={{
					zIndex: 1,
					backgroundColor: "rgba(100, 100, 100, 0.2)",
					position: "absolute",
					color: "white",
					display: "inline-block",
				}}>
				<tbody>
				{
					Object.keys(this.state.cars).map((key,i) => {
						const car = this.state.cars[key];

						return <tr key={key} style={{backgroundColor: (i%2) ? "#00000010" : "none", 
						padding: "0px 5px",
						display: "block",
					}}>
						    <td width="100">{car.name}</td>
						    <td>{car.knockouts}</td>
						  </tr>
					})
				}
				</tbody>
				</table>
			<Scene
			environment={{
	          preset: 'starry',
	          seed: 2,
	          lightPosition: { x: 0.0, y: 0.5, z: 0.0 },
	          fog: 0.2,
	          ground: 'hills',
	          groundYScale: 3.31,
	          groundColor: '#36b357',
	          flatShading: true,
	          grid: 'none',
	          dressing: "trees",
	          dressingColor: "#16692b",


	        }}
        	>
		{/*
		          preset: 'starry',
	          seed: 2,
	          lightPosition: { x: 0.0, y: 0.5, z: 0.0 },
	          fog: 0.2,
	          ground: 'hills',
	          groundYScale: 6.31,
	          groundColor: '#36b357',
	          grid: 'none',
	          dressing: "trees",
	          playArea: 100,
	          dressingColor: "#16692b"
	      */}
			


        	{
        		this.props.spectator ? 
        		<Entity primitive="a-camera" look-controls={{enabled:true}} orbit-controls={{
					minDistance: "0.5",
					maxDistance: "180",
					initialPosition: "0 5 15"
				}}/>
        		:
				<Entity position={this.getCameraPos()} rotation={this.getCameraRot()}>
					<Entity primitive="a-camera" wasd-controls={{enabled:false}} look-controls={{enabled:false}} />
				</Entity>
        	}
			
			


			{/*

				<Entity primitive="a-camera" look-controls={{enabled:true}} orbit-controls={{
					target: this.getCameraPos(),
					minDistance: "0.5",
					maxDistance: "180",
					initialPosition: "0 20 100"
				}}/>

			*/}

				

				{
					Object.keys(this.state.cars).map(key => {
						const car = this.state.cars[key];
						return (
							<Entity rotation={car.orientation.rot} position={car.orientation.pos} key={key}>
								{/*
									  z
									  ^
									  |
								x <---o

								*/}
								{/*<Entity geometry={{primitive:"box"}} material={{color: 'white', opacity: 0.1}} position="-0.2 0 -0.45" scale="1.6 2.2 3.1"/>*/}
								<Entity primitive="a-obj-model" src="assets/car.obj" mtl="assets/car.mtl" position="1 0 0" scale={{x:"0.01", y:"0.01", z:"0.01"}} />
								{/*<Entity primitive="a-obj-model" src="assets/car1.obj" mtl="assets/car1.mtl" position="1 0 0" scale={{x:"0.01", y:"0.01", z:"0.01"}} />*/}
								
								{/*
								<Entity geometry={{primitive:"box"}} material={{color: 'red', opacity: 0.2}} position="0 0 0.8" scale="1 1 1"/>
								<Entity geometry={{primitive:"box"}} material={{color: 'blue', opacity: 0.2}} position="0 0 -1.4" scale="1 1 1"/>
								<Entity light={{
									type: "point",
									color: car.inmortal ? "white" : car.color,
									intensity: 0.4,
									distance: 0
								}} position="0 1 0"></Entity>
								*/}

								<Entity primitive="a-text" value={car.name} position="-0.2 2.3 -0.4" align="center"/>
								<Entity primitive="a-text" value={car.name} position="-0.2 2.3 -0.4" align="center" rotation="0 180 0"/>
							</Entity>

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

//Kd 0.05200000107288 0.06480000168085 0.10000000149012
