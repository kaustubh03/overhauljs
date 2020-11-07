const persistorKey = '__OVERHAUL_MEMORIZE__';
/*
  Update store with updated state which eventually updates auditor
*/
function mutate(newState) {
  this.state = { ...this.state, ...newState };
  /*
      Auditor is a listener map which adds every state into a object
    */
  this.auditor.forEach((listener) => {
    listener(this.state);
  });

  if (this.options.persist) {
    this.state[`${persistorKey}_currentTimestamp`] = Date.now();
    localStorage.setItem(persistorKey, JSON.stringify(this.state));
  }
}

/*
    Custom Hook To add listener to auditor map
*/
function useOverhaul(React) {
  /*
    Dispatch Action using second element of useState
  */
  const newListener = React.useState()[1];
  React.useEffect(() => {
    this.auditor.push(newListener);
    return () => {
      this.auditor = this.auditor.filter((auditor) => auditor !== newListener);
    };
  }, [newListener]);
  return [this.state, this.actions];
}

/*
    Track actions and add them to store, return a function
*/
export function mapActions(store, actions) {
  const mappedActions = {};
  Object.keys(actions).forEach((key) => {
    if (typeof actions[key] === 'function') {
      mappedActions[key] = actions[key].bind(null, store);
    }
    if (typeof actions[key] === 'object') {
      mappedActions[key] = mapActions(store, actions[key]);
    }
  });
  return mappedActions;
}

/*
    Responsible for Binding State into Global State Hook
*/
const overhaul = (React, initialState, actions, options = {}) => {
  const store = { state: initialState, auditor: [] };
  store.options = { ...options };
  store.mutate = mutate.bind(store);
  store.actions = mapActions(store, actions);
  return useOverhaul.bind(store, React);
};

export function checkTimestampDiff(recordedTimeStamp) {
  const now = Date.now();

  const oneDay = 24 * 60 * 60 * 1000;

  return now - recordedTimeStamp > oneDay;
}

/*
  Flush Persisted Data
*/
function flushPersistedData() {
  localStorage.removeItem(`${persistorKey}_currentTimestamp`);
}

/*
  Initial State Generator,
  Would Extend this method to ideally go through every action and generate initialState Automatically
*/
export function generateInitialState() {
  return { loading: false, data: null, error: null };
}

/*
  Persistor, will add initial state before hitting any endpoint to show absolute no loader
*/
export function persistor(initialState) {
  const getPersistedData = JSON.parse(localStorage.getItem(persistorKey));
  // eslint-disable-next-line no-underscore-dangle
  const _timedifference =
    getPersistedData &&
    checkTimestampDiff(getPersistedData[`${persistorKey}_currentTimestamp`]);
  if (_timedifference) {
    flushPersistedData();
  }
  let persistedInitialState = { ...initialState };
  if (getPersistedData && !_timedifference) {
    persistedInitialState = { ...initialState, ...getPersistedData };
  }
  return persistedInitialState;
}
/*
  Will Set data in globalState according to different states in asynchronous app
  This method is only required if we are using InitialState Generator (generateInitialState)
  @params => store : Current store instance, 
             key : identifier for an action
             state: Identifies which state you are setting data for. example - loading, success, failure
*/
export const stateSettler = (
  store,
  key,
  state,
  data = null,
  testMode = false,
) => {
  const nextStateObject = {};
  switch (state) {
    case 'loading':
      if (testMode) {
        return { loading: true };
      }
      nextStateObject[key] = { ...store.state[key], loading: true };
      return store.mutate({ ...nextStateObject });
    case 'success':
      if (testMode) {
        return { loading: false, data };
      }
      nextStateObject[key] = { ...store.state[key], loading: false, data };

      return store.mutate({ ...nextStateObject });
    case 'failure':
      nextStateObject[key] = {
        ...store.state[key],
        loading: false,
        error: data,
      };
      if (testMode) {
        return nextStateObject;
      }
      return store.mutate({ ...nextStateObject });
    default:
      return false;
  }
};

export default overhaul;
