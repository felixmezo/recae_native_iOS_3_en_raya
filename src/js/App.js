
import React, {Component} from 'react';
import { Text, StyleSheet, View, Navigator, ListView, AsyncStorage } from 'react-native'

import IndexScene from '../../inicio';
import PartidaScene from '../../partida';

const JUGADORX = "jugador 1 - las X";
const JUGADOR0 = "jugador 2 - los 0";
const VALORES = [['-', '-', '-'], ['-', '-', '-'], ['-', '-', '-']];

const JUGANDO  = 0;
const GANANX   = 1;
const GANAN0   = 2;
const EMPATE   = 3;
var npulsaciones = 0;

const HISTORIAL = ['Jugador de las X pulsó la casilla: ',
				 'Jugador de los 0 pulsó la casilla: ',
				 'Jugador de las X pulsó la casilla: ',
				 'Jugador de los 0 pulsó la casilla: ',
				 'Jugador de las X pulsó la casilla: ',
				 'Jugador de los 0 pulsó la casilla: ',
				 'Jugador de las X pulsó la casilla: ',
				 'Jugador de los 0 pulsó la casilla: ',
				 'Jugador de las X pulsó la casilla: ' ];

var App = React.createClass({
	_saveState:async function(){
		try{
			let stateToSave = JSON.stringify(this.state);
			await AsyncStorage.setItem('@TresEnRaya:state', stateToSave);
		} catch (error){
			//Error saving state
		}
	},
	_loadState:async function(){
		try{
			let stateToLoad = await AsyncStorage.getItem('@TresEnRaya:state');
			if (stateToLoad !==null) {
				let state = JSON.parse(stateToLoad);
				this.setState(state);
			}	
		}catch (error){
			//error retrieving state
		}
	},
	getInitialState: function () {
		this._loadState();
		return {
			turno: JUGADORX,
			valores: VALORES,
			partida: JUGANDO,
			turnos0: 0,
			turnosX: 0,
			ultimaPulsacionX: "No ha empezado",
			ultimaPulsacion0: "No ha empezado",
			historial: HISTORIAL
		};
	},
	appclick: function(numeroFila, numeroColumna) {
		npulsaciones++;

		var historial = this.state.historial;
		let ultimaPulsacion0 = this.state.ultimaPulsacion0;
		let ultimaPulsacionX = this.state.ultimaPulsacionX;

		if (this.state.turno === JUGADORX) {
			ultimaPulsacionX = "( "+ (numeroFila+1)	+ ", " + (numeroColumna+1) +" )";
			historial[npulsaciones-1]=historial[npulsaciones-1]+ultimaPulsacionX;
		}else{
			ultimaPulsacion0 = "( "+ (numeroFila+1)	+ ", " + (numeroColumna+1) +" )";
			historial[npulsaciones-1]=historial[npulsaciones-1]+ultimaPulsacion0;
		}

		let turnosX = this.state.turnosX;
		let turnos0 = this.state.turnos0;
		let valores = this.state.valores;
		let nuevoValor = this.state.turno === JUGADORX ? 'X':'0';
		valores[numeroFila][numeroColumna]=nuevoValor;
		if (this.state.turno === JUGADORX){
			turnosX=turnosX+1;
		}else{
			turnos0=turnos0+1;
		}
		this.setState({
			turno: this.state.turno === JUGADORX ? JUGADOR0 : JUGADORX,
			partida: this.ganador(this.state.valores, this.state.turno),
			valores: this.state.valores, 
			turnos0: turnos0,
			turnosX: turnosX,
			ultimaPulsacionX: ultimaPulsacionX,
			ultimaPulsacion0: ultimaPulsacion0,
			historial: historial
		});
	},
	resetClick: function(){
		npulsaciones = 0;
		this.setState({
			turno: JUGADORX,
			valores: [['-', '-', '-'], ['-', '-', '-'], ['-', '-', '-']],
			partida: JUGANDO,
			turnos0: 0,
			turnosX: 0,
			ultimaPulsacionX: "No ha empezado",
			ultimaPulsacion0: "No ha empezado",
			historial: ['Jugador de las X pulsó la casilla: ',
				 'Jugador de los 0 pulsó la casilla: ',
				 'Jugador de las X pulsó la casilla: ',
				 'Jugador de los 0 pulsó la casilla: ',
				 'Jugador de las X pulsó la casilla: ',
				 'Jugador de los 0 pulsó la casilla: ',
				 'Jugador de las X pulsó la casilla: ',
				 'Jugador de los 0 pulsó la casilla: ',
				 'Jugador de las X pulsó la casilla: ' ]
		});
	},	
	ganador: function(valores,turno){
		for (var i=0; i<valores.length; i++){
			if ( (valores[i][0] !== '-' && valores[i][0]===valores[i][1] && valores[i][1]===valores[i][2]) || //comprobaciones horizontales
				(valores [0][i] !== '-' && valores[0][i]===valores[1][i] && valores[1][i]===valores[2][i])) {  //comprobaciones verticales
					setTimeout(function(){alert("Gana el"+ turno)},100)
					return valores[i][0]==='0' ? GANAN0 : GANANX;
			}
		}
		if ((valores[0][0]!=='-' && valores[0][0]===valores[1][1] && valores[1][1]===valores[2][2]) || //comprobacion de diagonales
			(valores[0][2]!=='-' && valores[0][2]===valores[1][1] && valores[1][1]===valores[2][0])) { 
			setTimeout(function(){alert("GANA el "+turno)},100)
			return valores[1][1]==='0' ? GANAN0 : GANANX;
		}
		//comprobacion de empate
		for (var i=0; i<valores.length; i++){
			for (var j=0; j<valores.length; j++){
				if (valores[i][j]==='-'){
					return JUGANDO;
				}
			}
		}
		setTimeout(function(){alert("EMPATE")},100)
		return EMPATE;		
	},
	//no funciona con reinicio
	render: function () {

		var movimientos = ['Movimientos de las X:  ', 'Movimientos de los 0:  '];
		movimientos[0]=movimientos[0]+this.state.turnosX;
		movimientos[1]=movimientos[1]+this.state.turnos0;
		var ds = new ListView.DataSource({rowHasChanged: function(r1, r2){return r1 !== r2 }});
		movimientos = ds.cloneWithRows(movimientos);

		var ds2 = new ListView.DataSource({rowHasChanged: function(r1, r2){return r1 !== r2 }});
		var historial = ds2.cloneWithRows(this.state.historial);

		const routes = [
			{title: 'Index', index: 0},
			{title: 'Partida', index: 1}, ];

		return (
			<View style={{marginTop: 20, flex:1}}>
				<Navigator
					initialRoute={routes[0]} 
					initialRouteStack={routes} 
					renderScene={(route, navigator) => {
						var onForward = function(){
							const nextIndex = route.index + 1; 
							if(typeof routes[nextIndex] == "object"){
								navigator.push(routes[nextIndex]) 
							}
						}
						var onBack = function(){
							if (route.index > 0){
								navigator.pop();
							} 
						}
						switch(route.index){ 
							case 0:
								return <IndexScene onForward={onForward} onBack={onBack} /> 
							case 1:
								return <PartidaScene onForward={onForward} 
													 onBack={onBack} 
													 valores={this.state.valores} 
													 turno={this.state.turno}
													 turnosX = {this.state.turnosX}
													 turnos0={this.state.turnos0}
													 manejadorClick={this.appclick}
													 movimientos={movimientos}
													 partida={this.state.partida}
													 resetClick={this.resetClick}
													 historial={historial}	
													 saveState={this._saveState}
													 loadState={this._loadState}/> 
							}
						}} 
				/>			    
			</View>
		)
	}
});

module.exports = App;