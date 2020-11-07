# Overhaul.js 🔥 🔥 🔥
Complex state management just got Easy using react hooks interface. A sleek Redux alternative under 5 kb.

# What is State Management?
According to Wikipedia, State management refers to the management of the state of one or more user interface controls such as text fields, OK buttons, radio buttons, etc. in a graphical user interface. In this user interface programming technique, the state of one UI control depends on the state of other UI controls. For example, a state managed UI control such as a button will be in the enabled state when input fields have valid input values and the button will be in the disabled state when the input fields are empty or have invalid values. As applications grow, this can end up becoming one of the most complex problems in user interface development.

# How this solution fulfills the above requirement

Since we know react acts/updates to changes in data provided to app. It can be State or Props.
The rough idea is to create a hashmap of listeners and provide its stateValue and stateSetters to update data using a custom method in the interface known as *mutate*. The state setter will update rerender the App root to the subscribed listener.

# Introducing Mutators/Actions
### What are Mutators/Actions?
Mutators or Actions are simple functions which once executed promotes state change on different events. For example - if we have an async operation of getting data from api and setting that data on to state an action might come in handy.

### Why We need Mutators/Actions?
Major concerns and learnings from state management is it gets more complex as our app grows and is not the best idea to mutate global state directly from component.
Best Solution would be separating global state updaters from business logic. 
Actions will have access to the store object. For that reason, actions may read the state with store.state, write state through store.mutate() and even call other actions using state.actions.

- Basic Example for an action function 
```
export const getUserDetails = async (store) => {
  if (apiClient) {
    apiClient
      .get(endPoints.getUserInfo)
      .then((response) => {
        if (response && response.data) {
          store.mutate({userDetails:response.data})
        }
      })
      .catch((error) => {
      // Set Error on state
        store.mutate({userDetails:error})
      });
  }
};
```
# Global State/Store
- Global State holds the whole state tree for our application. Its not a class but only an object with state data and methods attached to it.
- Cache data
- Expose public getters to access data (never have public setters)
- Respond to specific actions
- Always emit a change when their data changes
- Only emit changes when called
- In a nutshell, a store is a single source of truth for our app data.

### Setup Global State/Store - 
To setup store we need to create a store.js file in out application src having react in scope.
Use globalState Method which expects 4 arguments namely ` React, initialState, actions, options`
A typical example for a store setup file is below : 
```
/** This file is a store setup example. Basically it depicts how you setup your globalState. */
import React from 'react';
import overhaul, { generateInitialState } from 'overhauljs';

import * as actions from './mutatorMap';

/*
    Set Initial State for all APIs
*/
const initialState = {
  userDetails: generateInitialState(),
  geography: generateInitialState(),
  themes: generateInitialState(),
  industries: generateInitialState(),
  topics: generateInitialState(),
  error: null,
};

/*
    Options for Store, Currently only have persist as an option , Experimental
*/
const options = {
  persist: false,
};

/*
    Configure Store with Initial state, actions and options with React in scope.
*/

const useOverhaul = overhaul(React, initialState, actions, options);

export default useOverhaul;

```

In the above example,
* ` import React from 'react'; ` 
    This imports React and put it into scope of globalState which uses it to bind store and state setters. Because under the hood its using React.useState and React.useEffect

* ` import overhaul, { generateInitialState } from 'overhauljs'; `
    This imports overhaul and generateInitialState functions from our overhauljs. 
    overhaul is the main function which helps us to set up store by receiving initialStates, actions and options.
   generateInitialState method can be used where we use asynchronous actions and have multiple states w.r.t to our event. It returns an object as `{loading:false, data:null, error:null}`
* ` import * as actions from './mutatorMap'; `
    This Imports all of the actions from a file known as mutatorMap, Basically its just a grouping of all individual actions to one using ` exports `. This is done in order to reduce the clutter caused by importing individual actions on to our store.
    Example of mutatorMap is as follows :
    ```
        import * as app from '../components/App/actions';
        export { app };
    ```
* ` const useOverhaul = overhaul(React, initialState, actions, options); `
    The `useOverhaul` is a constant using globalState method from library which in return provides a bound function which has its this keyword set to the provided value.
* `initialState` - An initialState is a empty or starting point for every global state variable.     for example if we have to set an error in globalState and we want its initial value to be        false, so there initial state comes in handy so as to initialize it. This initialState will      be bound to globalState later in order to make changes to state and avoid inconsisitencies on     various events.

# Usage

### Install
``` 
  npm install overhauljs
```

### In component
* Import useOverhaul hook from store.
* use as hook, 
    the first item gives out globalState object storing the application state data as object. 
    the second item gives out globalActions object in which actions are namespaced with components they are called in mutatorMap.
```
    import useOverhaul from '../../store/store';
    const [globalState, globalActions] = useOverhaul()
```

### Using data from overhaul globalState
```
const App = () =>{
    const [globalState, globalActions] = useOverhaul();
    
    return <div>
        {globalState.userDetails}
    </div>
}
export default App;
```

### Creating Action/Mutator
* Create a separate action.js file inside you app.
* Use `store.mutate` method inside action to trigger a state change.
    An Example would be - 
    ```
    export const getUserDetails = async (store) => {
          store.mutate({ userDetails:{id:4433} })
     };
    ```
### Using `stateSettler` for asynchronous actions
* We would be using `stateSettler` method from globalState to emit change to store.
    stateSettler method accepts 4 arguments, namely - 
    * store, - Its a store instance which is a default argument by action
    * key, - Actual string in which you want to store the data. Ex - here key can be 'userDetails'
    * state, - varied string which depicts current state for asychronous actions. for example - an async api call would have 3 states - loading, success, error.
    * data (optional) - if needed to set data into globalState, pass data as 4th param. for example this might come in use when api is success or failure.
    Please note it is not mandatory to use stateSettler to make changes to globalState. We've made globalState really flexible to use and project data.
```
export const getUserDetails = async (store) => {
  stateSettler(store, 'userDetails', 'loading');
  if (apiClient) {
    apiClient
      .get(endPoints.getUserInfo)
      .then((response) => {
        if (response && response.data) {
            stateSettler(store, 'userDetails', 'success', response.data),
        }
      })
      .catch((error) => {
        stateSettler(store, 'userDetails', 'failure', error);
      });
  }
};
```
So as per the above snippet, 
* when api is loading, globalState structure would be as - `{userDetails:{loading:true, data:null, error:null}}`
* when api is success, globalState structure would be as - `{userDetails:{loading:false, data:{id:xxx, name:'SAMPLE Name'}, error:null}}`
* when api is failed, globalState structure would be as - `{userDetails:{loading:false, data:null, error:'Err: API timeout'}}`

### Using Action from globalActions

```
const App = () =>{
    const [globalState, globalActions] = useOverhaul();
    useEffect(()=>{
       globalActions.app.getUserDetails(); 
    },[])
    return <div>
        {globalState.userDetails}
    </div>
}
export default App;
```
