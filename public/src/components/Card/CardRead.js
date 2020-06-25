import React, {useEffect, useState} from "react";
import AvatarGender from "../AvatarGender";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import {Box} from "@material-ui/core";
import {format} from "date-fns";
import {decodeId, getGenderString} from "../../utils";
import {getUser} from "../../rest";
import {makeStyles} from "@material-ui/core/styles";

export default function CardRead({userId}) {
    const classes = useStyles();
    const [user, setUser] = useState({
        birthDay: null,
        firstName: null,
        lastName: null,
        city: null,
        gender: null,
        interests: null,
    });

    useEffect(() => {
        async function fetchUser() {
            const user = await getUser(decodeId(userId)[0]);
            setUser({
                ...user,
                birthDay: new Date(user.birthDay)
            });
        }
        fetchUser().catch(error => console.error(error));
    }, [userId]);

    return (
        <React.Fragment>
            <AvatarGender gender={user.gender}/>
            <Typography component="h1" variant="h5" gutterBottom>
                {`${user.firstName} ${user.lastName}`}
            </Typography>
            <Typography color={"textSecondary"} variant="subtitle1" gutterBottom>
                {user.city ? user.city : '-'}
            </Typography>
            <Grid container className={classes.top} spacing={2}>
                <Grid item container
                      direction="row"
                      justify="space-between"
                      alignItems="center">
                    <Grid item xs={12} sm={6}>
                        {'Дата рождения:'}
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Box textAlign="right">
                            {user.birthDay ? format(user.birthDay, 'dd.MM.yyyy') : '-'}
                        </Box>
                    </Grid>
                </Grid>
                <Grid item container
                      direction="row"
                      justify="space-between"
                      alignItems="center">
                    <Grid item xs={12} sm={6}>
                        {'Пол:'}
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Box textAlign="right">
                            {user.gender ? getGenderString(user.gender) : '-'}
                        </Box>
                    </Grid>
                </Grid>
                <Grid item container
                      direction="row"
                      justify="space-between"
                      alignItems="center">
                    <Grid item xs={12} sm={6}>
                        {'Интересы:'}
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Box textAlign="right" className={classes.textWrap}>
                            {user.interests ? user.interests : '-'}
                        </Box>
                    </Grid>
                </Grid>
            </Grid>
        </React.Fragment>
    )
}

const useStyles = makeStyles((theme) => ({
    top: {
        marginTop: theme.spacing(2),
    },
    textWrap: {
        wordWrap: "break-word"
    }
}));