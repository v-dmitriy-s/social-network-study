import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import {BrowserRouter as Router} from "react-router-dom";
import {createMuiTheme, responsiveFontSizes, ThemeProvider} from '@material-ui/core/styles';
import AuthProvider from "./providers/AuthProvider";
import {ApolloProvider} from '@apollo/react-hooks';
import ApolloClient from 'apollo-boost';
import {getToken} from "./rest";
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import ruLocale from "date-fns/locale/ru";
import enLocale from "date-fns/locale/en-US";
import { SnackbarProvider } from 'notistack';

let theme = createMuiTheme();
theme = responsiveFontSizes(theme);

const localeMap = {
    en: enLocale,
    ru: ruLocale,
};


const client = new ApolloClient({
    uri: `${process.env.REACT_APP_BACKEND_API_BASE_URL}/graphql`,
    request: (operation) => {
        const token = getToken();
        operation.setContext({
            headers: {
                Authorization: token ? `${token}` : ''
            }
        })
    }
});

ReactDOM.render(
    <React.StrictMode>
        <Router>
            <ApolloProvider client={client}>
                <ThemeProvider theme={theme}>
                    <MuiPickersUtilsProvider utils={DateFnsUtils} locale={localeMap["ru"]}>
                        <SnackbarProvider maxSnack={3}>
                            <AuthProvider>
                                <App/>
                            </AuthProvider>
                        </SnackbarProvider>
                    </MuiPickersUtilsProvider>
                </ThemeProvider>
            </ApolloProvider>
        </Router>
    </React.StrictMode>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
