import React, { Component } from 'react';
import {Entity, Scene} from 'aframe-react';
import "aframe-particle-system-component";

export default class CubeDemo extends Component {
	constructor () {
	super()

	this.state = { x: 0.5, y: 0, z: 0.0 }

	window.manage = (x,y,z)=>this.setState({x,y,z})
}

	componentDidMount() {

	window.pos = { x: 0.5, y: 0, z: 0.0 }
	console.log
}

	render() {
		const divLeft = {
			width: "60%",
			height: "100vh",
			display: "inline-block",
			float:"left"
		}

		const divRight = {
			width: "40%",
			height: "100vh",
			display: "inline-block",
			float:"left"
		}

		return (
		<React.Fragment>
			<div style={divLeft}>
			<Scene embedded style={divLeft}>

	        <Entity primitive="a-camera" look-controls={{enabled:true}} orbit-controls={{
					minDistance: "0.5",
					maxDistance: "180",
					initialPosition: "0 5 0",
					target: "0 0 0",
				}}/>
				<Entity primitive="a-obj-model" src="assets/Iphone 8.obj" mtl="assets/Iphone_8.mtl" position="0 -3 2" scale={{x:"0.01", y:"0.01", z:"0.01"}} />

				<Entity primitive="a-light" type="point" color="white" intensity="1.0" position="5 -5 5"  />
				<Entity primitive="a-light" type="point" color="white" intensity="1.0" position="5 5 5"  />
				<Entity primitive="a-light" type="ambient" color="white" intensity="1.0" />

				<Entity primitive="a-text" value="IPhone 8" rotation="0 180 0" position="-2.6 0 0" height="4" width="10"/>

				<Entity primitive="a-text" value="Camara re" rotation="0 340 0" position="0.2 2.2 0.2" height="4" width="9"/>
				<Entity primitive="a-text" value="fachera" rotation="0 340 0" position="0.2 1.8 0.2" height="4" width="9"/>
				<Entity primitive="a-text" value=" 420 Mpx" rotation="0 340 0" position="0.2 1.4 0.2" height="2" width="5"/>
				<Entity primitive="a-text" value=" 10 Km Zoom" rotation="0 340 0" position="0.2 1 0.2" height="2" width="5"/>

				<Entity primitive="a-text" value="6 Kg de RAM" rotation="0 200 0" position="2.1 -1.2 -0.6" height="4" width="7"/>
				<Entity primitive="a-text" value="+12 Kg de ROM" rotation="0 200 0" position="2.1 -1.6 -0.6" height="4" width="5"/>

				<Entity primitive="a-text" value="Precios modicos" rotation="0 20 0" position="-4.8 -1.4 1" height="4" width="7"/>
				<Entity primitive="a-text" value="de 9999U$D" rotation="0 20 0" position="-3.8 -1.6 0.7" height="4" width="3"/>

				<Entity primitive="a-text" value="Vidrio re duro" rotation="0 170 0" position="2 3 1" height="4" width="8"/>
				<Entity primitive="a-text" value="(resiste una caida" rotation="0 170 0" position="2 2.7 1" height="4" width="4" />
				<Entity primitive="a-text" value="del aulta de arriba" rotation="0 170 0" position="2 2.4 1" height="4" width="4" />
				<Entity primitive="a-text" value="de P5 a traves del" rotation="0 170 0" position="2 2.1 1" height="4" width="4" />
				<Entity primitive="a-text" value="huequito del vidrio)" rotation="0 170 0" position="2 1.8 1" height="4" width="4" />


				<Entity primitive="a-text" value="Cargador" rotation="0 0 0" position="-1 -2 1" height="4" width="8"/>
				<Entity primitive="a-text" value="super especifico" rotation="0 0 0" position="-1 -2.4 1" height="4" width="5"/>
				<Entity primitive="a-text" value="y super molesto" rotation="0 0 0" position="-1 -2.7 1" height="4" width="5"/>


				<Entity primitive="a-sky" color="#222"/>
			</Scene>
			</div>
			<div style={divRight}>
				<div style={{marginTop: "200px"}}/>
				<h1 style={{fontSize: "6rem"}}>IPhone 8</h1>
				<h2 style={{fontSize: "3rem", color: "#555"}}>Just the right amount of everything.</h2>
			</div>
		</React.Fragment>

		);
	}
}
