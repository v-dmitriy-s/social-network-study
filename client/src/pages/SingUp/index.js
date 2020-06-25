import React, {useState} from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import {makeStyles} from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import {useSnackbar} from "notistack";
import {checkLogin, register, setToken} from "../../rest";
import {format} from "date-fns";
import {ERROR, SUCCESS} from "../../utils";
import {KeyboardDatePicker} from "@material-ui/pickers";

export default function SignUp() {
    const classes = useStyles();
    const {enqueueSnackbar} = useSnackbar();
    const [birthDay, setBirthDay] = useState(null);
    const [birthDayError, setBirthDayError] = useState(false);
    const [login, setLogin] = useState('');
    const [loginError, setLoginError] = useState(false);
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [firstNameError, setFirstNameError] = useState(false);
    const [lastName, setLastName] = useState('');
    const [lastNameError, setLastNameError] = useState(false);
    const [existLogin, setExistLogin] = useState(false);

    const handlePasswordChange = (event) => {
        const value = event.target.value;
        setPasswordError(value === '');
        setPassword(event.target.value);
    };

    const handleLoginChange = async (event) => {
        const value = event.target.value;
        if (value !== '') {
            const checked = await checkLogin(value);
            setExistLogin(checked);
        }
        setLoginError(value === '');
        setLogin(value);
    };

    const handleFirstNameChange = (event) => {
        const value = event.target.value;
        setFirstNameError(value === '');
        setFirstName(value);
    };

    const handleLastNameChange = (event) => {
        const value = event.target.value;
        setLastNameError(value === '');
        setLastName(value);
    };

    const handleBirthDayChange = (value) => {
        setBirthDayError(!value || value === '');
        setBirthDay(value);
    };

    function handleSaveUser() {
        checkRequiredFields();
        if (login !== '' &&
            password !== '' &&
            firstName !== '' &&
            lastName !== '' &&
            birthDay && birthDay !== '' &&
            !existLogin) {
            register({
                login,
                password,
                firstName,
                lastName,
                birthDay: format(birthDay, 'yyyy-MM-dd')
            }).then(async (response) => {
                showMessage('User created successfully.', SUCCESS);
                const {authorization} = response.headers;
                if (authorization) {
                    await setToken(authorization);
                    window.location.replace('/');
                }
            }).catch(() =>
                showMessage('User not created due to a system error.', ERROR)
            );
        }
    }

    function checkRequiredFields() {
        setLoginError(login === '');
        setPasswordError(password === '');
        setFirstNameError(firstName === '');
        setLastNameError(lastName === '');
        setBirthDayError(!birthDay || birthDay === '');
    }

    function errorText(error) {
        return error ? 'Field is required' : null;
    }

    function showMessage(message, variant) {
        enqueueSnackbar(message, {variant});
    }

    return (
        <Container component="main" maxWidth="xs">
            <div className={classes.paper}>
                <Avatar className={classes.avatar}>
                    <LockOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                    Sign up
                </Typography>
                <div className={classes.form}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                autoComplete="login"
                                name="login"
                                variant="outlined"
                                required
                                fullWidth
                                id="login"
                                label="Login"
                                value={login}
                                onChange={handleLoginChange}
                                autoFocus
                                error={loginError || existLogin}
                                helperText={existLogin ? 'Login already exists.' : errorText(loginError)}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                type="password"
                                id="password"
                                autoComplete="current-password"
                                value={password}
                                onChange={handlePasswordChange}
                                error={passwordError}
                                helperText={errorText(passwordError)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                autoComplete="fname"
                                name="firstName"
                                variant="outlined"
                                required
                                fullWidth
                                id="firstName"
                                label="First Name"
                                value={firstName}
                                onChange={handleFirstNameChange}
                                error={firstNameError}
                                helperText={errorText(firstNameError)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                variant="outlined"
                                required
                                fullWidth
                                id="lastName"
                                label="Last Name"
                                name="lastName"
                                value={lastName}
                                onChange={handleLastNameChange}
                                autoComplete="lname"
                                error={lastNameError}
                                helperText={errorText(lastNameError)}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <KeyboardDatePicker
                                fullWidth
                                disableToolbar
                                required
                                variant="inline"
                                format="dd.MM.yyyy"
                                id="date-picker-inline"
                                label="Birthday"
                                value={birthDay}
                                onChange={handleBirthDayChange}
                                KeyboardButtonProps={{
                                    'aria-label': 'change date',
                                }}
                                error={birthDayError}
                                helperText={errorText(birthDayError)}
                            />
                        </Grid>
                    </Grid>
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        className={classes.submit}
                        onClick={handleSaveUser}
                    >
                        Sign Up
                    </Button>
                    <Grid container justify="flex-end">
                        <Grid item>
                            <Link href={"login"} variant="body2">
                                Already have an account? Sign in
                            </Link>
                        </Grid>
                    </Grid>
                </div>
            </div>
        </Container>
    );
}

const useStyles = makeStyles((theme) => ({
    paper: {
        marginTop: theme.spacing(8),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main,
    },
    form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing(3),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
}));