//@ts-nocheck
import { Injectable }  from "@angular/core";
import { updatedDiff } from "deep-object-diff";
import { deepmerge }   from "deepmerge-ts";
import { Subject }     from "rxjs";

type DeepPartial<T> = {
	[P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

@Injectable()
export class NgxESM {
	appState       = {}
	stateObserver$ = new Subject()
	
	registerComponent<T>( instance: any, initialState: T ): void {
		const name          = this.getName( instance );
		const uuid          = self.crypto.randomUUID();
		instance.__esm_uuid = uuid;
		let id              = uuid
		if ( this.appState[id] && this.appState[id].comp === instance ) {
			throw Error( 'already registered' )
		}
		this.appState[id] =
			{
				id:    id,
				name:  name,
				state: initialState,
				comp:  instance
			}
	}
	
	setState<T>( instance, newState: DeepPartial<T> ) {
		const id           = this.getId( instance );
		const name         = this.getName( instance );
		const currentEntry = this.appState[id];
		if ( !currentEntry && currentEntry.comp !== instance ) {
			throw Error( 'no instance' )
		}
		const before            = Object.assign( {}, this.appState[id].state );
		const result            = deepmerge( this.appState[id].state as T, newState as T )
		this.appState[id].state = result;
		const diff              = updatedDiff( before, result );
		this.stateObserver$.next( {
			component: instance,
			name:      name,
			id:        id,
			oldState:  before,
			newState:  result,
			diff:      diff
		} )
		
	}
	
	getState( instance: object ) {
		const name = instance.__esm_uuid;
		return this.appState[name].state;
	}
	
	getAppState() {
		return this.appState
	}
	
	private getId( comp ) {
		return comp.__esm_uuid
	}
	
	private getName( comp ) {
		return comp.name;
	}
	
	
}
