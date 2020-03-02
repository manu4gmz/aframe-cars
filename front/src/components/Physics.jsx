import React, { Component } from 'react';
import io from 'socket.io-client';
import {Entity, Scene} from 'aframe-react';
import "aframe-particle-system-component";

export default class Physics extends Component {
	render() {
		return (
			<Scene physics="debug: true">

			 
			  <Entity primitive="a-camera" look-controls={{enabled:true}} orbit-controls={{
					minDistance: "0.5",
					maxDistance: "180",
					initialPosition: "0 5 15"
				}}/>

			</Scene>
		);
	}
}
