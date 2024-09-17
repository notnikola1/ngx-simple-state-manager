# Simple state manager for Angular applications

### Purpose

Component-bound simple to handle state managment that is accessible application wide with type support and an observer to handle any reactive state changes if and when needed.

## Installation

``npm install --save ngx-simple-state-manager``

## How to use

### Import NgxSsmModule into app.module or into any of your modules.
```


// MyModule.module.ts

[...]
imports: [
    [...],
    NgxSsmModule <-
]
[...]
```
### Define the shape of the component state object and import the NgxEsm service into your component.
```


interface IComponentState {
	foo: {
		bar: string,
		baz: string
	},
	bar: string
}

@Component({...})
export class MyComponent {
    
    constructor(
    private ssm: NgSSM
    ) {
        this.ssm.registerComponent<IComponentState>( this, {
			foo: {
				bar:   'hello bar inner!',
				baz:   'hello baz'
			},
			bar: "hello bar"
		})}
    }
```

### NOTE ** Since the shape is not always known - IComponentState supports "any" type **

### Setting new state

- Partial state updates are supported

```
@Component({...})
[...]
someMethod(){
    this.ssm.setState<ComponentState>( this, {
	    foo: { bar: "asd" }
    } )
}
[...]

```

### Get current component state

```
@Component({...})
[...]
someMethod(){
    this.ssm.getState( this )
}
[...]
```

### Observe state changes

- ALL state changes will be propagated through this (yes that means other component updates too, use this with some care).

```
[...]
    this.ssm.stateObserver$.subscribe( value => {
			console.log( value );
		} )
[...]
```

### Get full APPLICATION state

```
@Component({...})
[...]
someMethod(){
    this.ssm.getAppState()
}
[...]
```

------

## API docs

`` Glossary -> T = IComponentState``

`` registerComponent<T>(this, initialStateObject<T>) : void  ``

`` setState<T>(this, newState<Partial<T>>) : void <- as seen above, you can update only a part``

`` getState(this) : <T> ``

`` getApplicationState() <- entire application state, shape depends on your components ``

```
 stateObserver$ value :
    {
    component: instance, <- "this"
    name:      name, <- component name, if any (instance.name)
    id:        id, <- generated on registration, instance.__ssm_uuid, different for every instance and component
    oldState:  before,
    newState:  result,
    diff:      diff
    }
 ```

## FAQ

- Q : Are there Actions/Reducers like in redux?
- A : No. This is a *SIMPLE* state management library - its meant to be actually useful.
- ---
- Q : Can I use this along with redux?
- A : Probably.
- ---
- Q : I dont know the exact interface that my state will have!
- A : Use "any" as initialState type and build it from there
- ---
- Q : Does this support standalone components?
- A : Dont know, dont care - I dont think standalone components are a net positive and I do not support them.
- ---
- Q : There are other state management libs? Why this?
- A : I found them to be too heavy handed in their approach and too complex to use for what they are supposed to be used.
- ---
- Q : I think that <insert lib here\> is better!
- A : Great! Go, use it, with my blessing, more power to you!
- ----
- Q : Will there be something like this for React?
- A : No.
- ---
- Q : Will there be support for component specific state change observers?
- A : Possibly, at a later date.
- ---
- Q : How do I know whats my component __ssm_uuid?
- A : After calling the "register" method, that specific component instance will have "__ssm_uuid" bound to it, just call "this.__ssm_uuid" to get it.
- ---
- Q : I want to do a specific thing in my component only when something changes in another specific component, how do i?
- A : Use __ssm_uuid to filter what you need.

## License

MIT

## Funding

Donate to a cancer research charity or something, I'm good.

## PR's

Sure, go wild.
