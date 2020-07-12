import { Map, List } from "immutable";
import { createStore } from "redux";


let _initialState = Map({
    showClasses: List([
        "Downtown Core",
        "Arterial",
        "Secondary Arterial"
    ]),
    activeStreets: List([])
});

const TOGGLE_CLASS = "TOGGLE_CLASS";
const TOGGLE_STREET = "TOGGLE_STREET";

function _actionFactory (type, payload) {
    return {
        type,
        payload
    };
};

// show parameter is a boolean: whether to show or hide.
function toggleClass (className) {
    return _actionFactory(TOGGLE_CLASS,
                          { className });
}

// activate param is boolean: whether to activate or deactivate
function toggleStreet (streetName, activate) {
    return _actionFactory(ACTIVATE_STREET,
                          { streetName,
                            activate });
}

function _toggleClassReducer (state, action) {
    let clickedClass = action.payload.className;
    if (state.get("showClasses").indexOf(clickedClass) < 0) {
        return state.update("showClasses", function (col) {
            return col.push(clickedClass);
        });
    } else {
        return state.update("showClasses", function (col) {
            let classIdx = col.indexOf(clickedClass);
            return col.delete(classIdx);
        });
    }
}

function _rootReducer (state = _initialState, action) {
    switch (action.type) {
    case TOGGLE_CLASS:
        return _toggleClassReducer(state, action);
    default:
        return state;
    }
}

let store = createStore(_rootReducer);

export {
    toggleClass,
    toggleStreet,
    store
};
