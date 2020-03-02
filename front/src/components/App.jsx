import React, { Component } from 'react';
import {Switch, Route, Redirect} from "react-router-dom";
import Enter from "./Enter"
import Game from "./Game"
export default class App extends Component {
	constructor() {
		super();
		this.state = {
			name: "",
			spectator: false
		}
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(e,form) {
		e.preventDefault();
		this.setState(form)

		this.props.history.push("/play")
	}

	render() {
		return (
			<Switch>
				<Route path="/enter" render={()=><Enter handleSubmit={this.handleSubmit}/>}/>
				<Route path="/play" render={()=><Game name={this.state.name} spectator={this.state.spectator} />}/>
			</Switch>
		);
	}
}
