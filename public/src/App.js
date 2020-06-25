import React, {useContext, useEffect} from 'react';
import './App.css';
import {Redirect, Route, Switch} from "react-router-dom";
import CssBaseline from "@material-ui/core/CssBaseline";
import SingIn from "./pages/SingIn";
import NotFound from "./pages/NotFound";
import SignUp from "./pages/SingUp";
import User from "./pages/User";
import PrivateRoute from "./components/PrivateRoute";
import {AuthContext, SET_CURRENT_USER} from "./providers/AuthProvider";
import {getCurrentUser, hasToken} from "./rest";
import Forbidden from "./pages/Forbidden";

export default function App() {
    const [auth, dispatch] = useContext(AuthContext);

    async function fetchCurrentUser() {
        if (hasToken()) {
            const currentUser = await getCurrentUser();
            dispatch({type: SET_CURRENT_USER, payload: currentUser});
        }
    }

    useEffect(() => {
        fetchCurrentUser()
            .catch(error => console.error(error));
    }, []);

    return (
        <React.Fragment>
            <CssBaseline/>
            <Switch>
                <Route exact path="/login">
                    <SingIn/>
                </Route>
                <Route exact path="/register">
                    <SignUp/>
                </Route>
                <Route exact path="/forbidden">
                    <Forbidden/>
                </Route>
                <PrivateRoute exact path="/">
                    <Redirect exact from="/" to={`/${auth.currentUser ? auth.currentUser.id : ''}`}/>
                </PrivateRoute>
                <PrivateRoute exact path="/:userId">
                    <User/>
                </PrivateRoute>
                <Route path="*">
                    <NotFound/>
                </Route>
            </Switch>
        </React.Fragment>
    );
}