import React, { Component } from 'react';

export default class Enter extends Component {
	constructor(){
		super();

		this.state = {
			name: "",
			spectator: false
		}

		this.handleChange = this.handleChange.bind(this);
	}


	handleChange({target}){
		this.setState({[target.name]: target.type == "checkbox" ? target.checked : target.value})
	}

	render() {
		return (
			<div>
				<form onSubmit={(e)=>this.props.handleSubmit(e,this.state)}>
					<input placeholder="Nombre" name="name" value={this.state.name} onChange={this.handleChange} />
					<label className="container">Entrar como espectador
						<input type="checkbox" name="spectator" onChange={this.handleChange} checked={this.state.spectator}/>
						<span className="checkmark" />
					</label>
					<input type="submit" />
				</form>
			</div>
		);
	}
}
