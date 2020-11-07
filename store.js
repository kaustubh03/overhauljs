/** This file is a store setup example. Basically it depicts how you setup your store. */
import React from "react";
import overhaul, { generateInitialState } from "./overhaul";

import * as actions from "./actions";

/*
    Set Initial State
*/
const initialState = {
  questions: generateInitialState("questions"),
};

/*
    Options for Store, Currently only have persist as an option, Experimental - In Development
    Do not use in production.
*/
const options = {
  persist: false,
};

/*
    Configure Store with Initial state, actions and options with React in scope.
*/
const useOverhaul = overhaul(React, initialState, actions, options);

export default useOverhaul;
