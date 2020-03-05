import React, { Component } from 'react';
import {Switch, Route, Redirect} from "react-router-dom";
import Enter from "./Enter";
import Game from "./Game";
import CubeDemo from "./CubeDemo";

export default class App extends Component {
	constructor() {
		super();
		this.state = {
			name: window.localStorage.getItem("name") || "",
			spectator: window.localStorage.getItem("spectator") == "true" || false
		}
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(e,form) {
		e.preventDefault();
		this.setState(form);

		window.localStorage.setItem("name", form.name);
		window.localStorage.setItem("spectator", form.spectator);

		this.props.history.push("/play")
	}

	render() {
		return (
			<Switch>
				<Route path="/enter" render={()=><Enter handleSubmit={this.handleSubmit}/>}/>
				<Route path="/play" render={()=><Game name={this.state.name} spectator={this.state.spectator} />}/>
				<Route path="/cube" component={CubeDemo}/>
				<Redirect path="/" exact to="/enter"/>
			</Switch>
		);
	}
}
