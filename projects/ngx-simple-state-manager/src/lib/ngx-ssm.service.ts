//@ts-nocheck
import { Component, Injectable } from "@angular/core";
import { updatedDiff }           from "deep-object-diff";
import { deepmerge }             from "deepmerge-ts";
import { Observable, Subject }   from "rxjs";

type DeepPartial<T> = {
	[P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

interface IComponentOptions {
	makeObserver: true,
	componentIdentifier: string,
	globalFiring: boolean
}

interface IComponentStateInstance<T> {
	id: string,
	name: string,
	state: T,
	comp: any
}

@Injectable()
export class NgxSSM {
	appState       = {}
	stateObserver$ = new Subject()
	
	componentObservers: Array<any> = []
	componentIdentifierList        = []
	
	registerComponent<T>( instance: any, initialState: T, options?: IComponentOptions ): IComponentStateInstance<any> {
		const name          = this.getName( instance );
		const uuid          = self.crypto.randomUUID();
		instance.__ssm_uuid = uuid;
		let id              = uuid
		this.appState[id]   = {
			id:    id,
			name:  name,
			state: initialState,
			comp:  instance
		}
		
		if ( options?.makeObserver ) {
			this.attachComponentObserver<T>( instance, initialState, options, id );
		}
		
		return this.appState[id];
	}
	
	attachComponentObserver<T>( instance, initialState: T, options: IComponentOptions, id: string ) {
		const componentStateObserver = new Subject()
		if ( this.componentObservers[options.componentIdentifier] ) {
			throw new Error( `Error, cannot create component state observer with id: ${ options.componentIdentifier }. Already exists` );
		}
		this.componentObservers[options.componentIdentifier] = {
			obs:     componentStateObserver,
			id:      id,
			options: options
		}
	}
	
	setState<T>( instance, newState: DeepPartial<T> ) {
		const id                = this.getId( instance );
		const name              = this.getName( instance );
		const before            = Object.assign( {}, this.appState[id].state );
		const result            = deepmerge( this.appState[id].state as T, newState as T )
		this.appState[id].state = result;
		const diff              = updatedDiff( before, result );
		
		const compObs         = Object.keys( this.componentObservers );
		let componentObserver = null;
		for ( let i = 0 ; i < compObs.length ; i++ ) {
			const currentCompObs = this.componentObservers[compObs[i]]
			if ( compObs[i] == name && currentCompObs.id === id ) {
				componentObserver = currentCompObs;
				break;
			}
		}
		
		let fireGlobal = true;
		if ( !componentObserver.options.globalFiring ) {
			fireGlobal = false;
			componentObserver.obs.next( {
				component: instance,
				name:      name,
				id:        id,
				oldState:  before,
				newState:  result,
				diff:      diff
			} )
		}
		
		if ( fireGlobal ) {
			this.stateObserver$.next( {
				component: instance,
				name:      name,
				id:        id,
				oldState:  before,
				newState:  result,
				diff:      diff
			} )
		}
		
	}
	
	getState( instance: object ) {
		const name = instance.__ssm_uuid;
		return this.appState[name].state;
	}
	
	getAppState() {
		return this.appState
	}
	
	getComponentStateByName( name: string ): Component | null {
		let ret    = null;
		const keys = Object.keys( this.appState );
		for ( let i = 0 ; i < keys.length ; i++ ) {
			if ( this.appState[keys[i]].name === name ) {
				ret = this.appState[keys[i]];
				break;
			}
		}
		return ret;
	}
	
	getComponentObserverByName( name: string ) {
		let ret = null
		if ( this.componentObservers[name] ) {
			console.log(this.componentObservers[name]);
			ret = this.componentObservers[name].obs
		}
		return ret;
		
	}
	
	getComponentBySSM_UUID( ssm_uuid ): IComponentStateInstance<any> | null {
		let ret = null
		if ( this.appState[ssm_uuid] ) {
			ret = this.appState[ssm_uuid];
		}
		return ret
	}
	
	private getId( comp ) {
		return comp.__ssm_uuid
	}
	
	private getName( comp ) {
		return comp.name;
	}
	
	
}
