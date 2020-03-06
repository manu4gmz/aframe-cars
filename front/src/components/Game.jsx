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

		socket.on("tick", (cars)=>
			this.setState({cars})
		)

		if (this.props.spectator) return;

		socket.on("id", (id)=>{
			console.log(id)
			this.setState({id})
		})

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
			

				{
					Object.keys(this.state.cars).map(key => {
						const car = this.state.cars[key];
						return (
							<Entity rotation={car.orientation.rot} position={car.orientation.pos} key={key}>
								
								<Entity primitive="a-obj-model" src="assets/car.obj" mtl="assets/car.mtl" position="1 0 0" scale={{x:"0.01", y:"0.01", z:"0.01"}} />


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
