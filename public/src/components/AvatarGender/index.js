import React from "react";
import Avatar from "@material-ui/core/Avatar";
import AccountCircle from "@material-ui/icons/AccountCircle";
import {makeStyles} from "@material-ui/core/styles";
import {FEMALE} from "../../utils";

export default function AvatarGender({gender}) {
    const classes = useStyles();
    return (
        <Avatar className={
            gender === FEMALE ? classes.avatarFemale : classes.avatarMale
        }>
            <AccountCircle/>
        </Avatar>
    );
}

const useStyles = makeStyles((theme) => ({
    avatarMale: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.primary.main,
    },
    avatarFemale: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main,
    },
}));