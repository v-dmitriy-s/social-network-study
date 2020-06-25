import React, {useEffect, useState} from "react";
import {makeStyles} from "@material-ui/core/styles";
import AvatarGender from "../AvatarGender";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import {KeyboardDatePicker} from "@material-ui/pickers";
import {decodeId, ERROR, FEMALE, getGenderString, MALE, SUCCESS} from "../../utils";
import MenuItem from "@material-ui/core/MenuItem";
import Fab from "@material-ui/core/Fab";
import SaveIcon from "@material-ui/icons/Save";
import {useSnackbar} from "notistack";
import {getUser, saveUser} from "../../rest";
import {format} from "date-fns";

export default function CardEdit({userId, onSave}) {
    const {enqueueSnackbar} = useSnackbar();
    const classes = useStyles();
    const [birthDay, setBirthDay] = useState(null);
    const [birthDayError, setBirthDayError] = useState(false);
    const [login, setLogin] = useState('');
    const [loginError, setLoginError] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [firstNameError, setFirstNameError] = useState(false);
    const [lastName, setLastName] = useState('');
    const [lastNameError, setLastNameError] = useState(false);
    const [city, setCity] = useState('');
    const [interests, setInterests] = useState('');
    const [gender, setGender] = useState('');
    const [saveButtonDisabled, setSaveButtonDisabled] = useState(false);

    useEffect(() => {
        async function fetchUser() {
            const {login, firstName, lastName, city, gender, birthDay, interests} =
                await getUser(decodeId(userId)[0]);
            setGender(gender);
            setLogin(login);
            setFirstName(firstName);
            setLastName(lastName);
            setCity(city);
            setBirthDay(new Date(birthDay));
            setInterests(interests);
        }
        fetchUser().catch(error => console.error(error));
    }, [userId]);

    useEffect(() => {
        if (loginError || firstNameError || lastNameError || birthDayError) {
            setSaveButtonDisabled(true);
        } else {
            setSaveButtonDisabled(false);
        }
    }, [loginError, firstNameError, lastNameError, birthDayError]);

    const handleGenderChange = (event) => {
        setGender(event.target.value);
    };

    const handleLoginChange = (event) => {
        const value = event.target.value;
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

    const handleCityChange = (event) => {
        setCity(event.target.value);
    };

    const handleInterestsChange = (event) => {
        setInterests(event.target.value);
    };

    const handleBirthDayChange = (value) => {
        setBirthDayError(!value || value === '')
        setBirthDay(value);
    };

    function handleSaveUser() {
        if (!saveButtonDisabled) {
            saveUser({
                login,
                firstName,
                lastName,
                birthDay: format(birthDay, 'yyyy-MM-dd'),
                gender,
                city,
                interests,
                id: decodeId(userId)[0]
            }).then((response) => {
                showMessage('User updated successfully.', SUCCESS);
                onSave(response.data);
            }).catch(() =>
                showMessage('User not updated due to a system error.', ERROR)
            );
        }
    }

    function errorText(error) {
        return error ? 'Field is required' : null;
    }

    function showMessage(message, variant) {
        enqueueSnackbar(message, {variant});
    }

    return (
        <React.Fragment>
            <AvatarGender gender={gender}/>
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
                            error={loginError}
                            helperText={errorText(loginError)}
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
                        <TextField
                            variant="outlined"
                            fullWidth
                            id="city"
                            label="City"
                            name="city"
                            autoComplete="city"
                            value={city}
                            onChange={handleCityChange}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <KeyboardDatePicker
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
                    <Grid item xs={12} sm={6}>
                        <TextField
                            id="standard-select-currency"
                            select
                            name="gender"
                            label="Gender"
                            autoComplete="gender"
                            onChange={handleGenderChange}
                            fullWidth
                            variant="outlined"
                            value={gender}
                        >
                            {[MALE, FEMALE].map(value =>
                                <MenuItem key={value} value={value}>
                                    {getGenderString(value)}
                                </MenuItem>
                            )}
                        </TextField>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            variant="outlined"
                            fullWidth
                            name="interests"
                            label="Interests"
                            type="interests"
                            id="interests"
                            autoComplete="interests"
                            multiline
                            rowsMax={4}
                            value={interests}
                            onChange={handleInterestsChange}
                        />
                    </Grid>
                    <Grid item container xs={12} justify={'center'}>
                        <Fab color="secondary"
                             aria-label="Save"
                             className={classes.fab}
                             onClick={handleSaveUser}
                             disabled={saveButtonDisabled}>
                            <SaveIcon/>
                        </Fab>
                    </Grid>
                </Grid>
            </div>
        </React.Fragment>
    );
}

const useStyles = makeStyles((theme) => ({
    form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing(3),
    },
    fab: {
        marginTop: theme.spacing(3),
    },
}));