import React from 'react';
import Container from "@material-ui/core/Container";
import Typography from '@material-ui/core/Typography';
import {makeStyles} from "@material-ui/styles";
import Button from '@material-ui/core/Button';
import {useHistory} from "react-router-dom";

export default function NotFound() {
    const classes = useStyles();
    const history = useHistory();

    function goBack() {
        history.goBack();
    }

    return (
        <Container component="main" className={classes.root}  maxWidth="xs">
            <Typography variant="h2" component="h1" align="center" gutterBottom>
                404
            </Typography>
            <Typography variant="h5" component="h2" align="center" gutterBottom>
                Whoops!
            </Typography>
            <Typography variant="body1" align="center" >
                It seems like we couldn't find the page you were looking for.
            </Typography>
                <Button
                    variant="outlined"
                    color="secondary"
                    className={classes.goBack}
                    disableElevation
                    onClick={goBack}>
                    Go back
                </Button>
        </Container>
    );
}
const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        marginTop: theme.spacing(8),
        marginBottom: theme.spacing(2),
    },
    goBack: {
        margin: theme.spacing(3, 0, 2),
    },
}));