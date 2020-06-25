import React, {useReducer} from 'react';
import {encodeId} from "../utils";

export const SET_CURRENT_USER = 'SET_CURRENT_USER';

const initialState = {
    currentUser: null
};

const reducer = (state, action) => {
    switch (action.type) {
        case SET_CURRENT_USER:
            return {
                ...state,
                currentUser: {...action.payload, id: encodeId(action.payload.id)},
            };
        default:
            throw new Error('Unrecognized action');
    }
};

export const AuthContext = React.createContext({});

export default function AuthProvider({children}) {
    const [state, dispatch] = useReducer(reducer, initialState);
    // const value = useMemo(() => [state, dispatch], [state]);
    return (
        <AuthContext.Provider value={[state, dispatch]}>
            { children }
        </AuthContext.Provider>
    );
}