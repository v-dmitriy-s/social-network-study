import React, {useContext, useEffect, useState} from "react";
import {makeStyles} from "@material-ui/styles";
import IconButton from '@material-ui/core/IconButton';
import AccountCircle from '@material-ui/icons/AccountCircle';
import Container from '@material-ui/core/Container';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Typography from '@material-ui/core/Typography';
import ExitToApp from '@material-ui/icons/ExitToApp';
import Edit from '@material-ui/icons/Edit';
import Delete from '@material-ui/icons/Delete';
import Home from '@material-ui/icons/Home';
import {clearToken} from "../../rest";
import {useHistory} from "react-router-dom";
import {AuthContext} from "../../providers/AuthProvider";

export default function Header({onHome, onEdit, onDelete}) {
    const history = useHistory();
    const {from} = {from: {pathname: "/login"}};
    const classes = useStyles();
    const [anchorEl, setAnchorEl] = useState(null);
    const [auth,] = useContext(AuthContext);
    const [currentUserId, setCurrentUserId] = useState(null);

    useEffect(() => {
        if (auth.currentUser) {
            setCurrentUserId(auth.currentUser.id);
        }
    }, [auth.currentUser])

    const handleAccountMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleAccountMenuClose = () => {
        setAnchorEl(null);
    };

    const handleAccountMenuLogout = () => {
        clearToken();
        setAnchorEl(null);
        history.replace(from);
    };

    const handleAccountMenuEdit = () => {
        setAnchorEl(null);
        onEdit();
        history.push(`/${currentUserId}`);
    };

    const handleAccountMenuDelete = () => {
        onDelete();
        setAnchorEl(null);
    };

    const handleAccountHomeEdit = () => {
        setAnchorEl(null);
        onHome();
        history.push(`/${currentUserId}`);
    };

    const menuId = 'header-account-menu';
    const renderMenu = (
        <Menu
            anchorEl={anchorEl}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            id={menuId}
            keepMounted
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            open={Boolean(anchorEl)}
            onClose={handleAccountMenuClose}
        >
            <MenuItem onClick={handleAccountHomeEdit}>
                <ListItemIcon>
                    <Home fontSize="small" />
                </ListItemIcon>
                <Typography variant="inherit">Home</Typography>
            </MenuItem>
            <MenuItem onClick={handleAccountMenuEdit}>
                <ListItemIcon>
                    <Edit fontSize="small" />
                </ListItemIcon>
                <Typography variant="inherit">Edit</Typography>
            </MenuItem>
            <MenuItem onClick={handleAccountMenuDelete}>
                <ListItemIcon>
                    <Delete fontSize="small" />
                </ListItemIcon>
                <Typography variant="inherit">Delete account</Typography>
            </MenuItem>
            <MenuItem onClick={handleAccountMenuLogout}>
                <ListItemIcon>
                    <ExitToApp fontSize="small" />
                </ListItemIcon>
                <Typography variant="inherit">Logout</Typography>
            </MenuItem>
        </Menu>
    );

    return (
        <Container component="header" className={classes.root}>
            <Typography variant={"overline"}  className={classes.login}>
                {currentUserId && auth.currentUser.firstName}
            </Typography>
            <IconButton
                edge="start"
                aria-label="account of current user"
                aria-haspopup="true"
                color="inherit"
                aria-controls={menuId}
                onClick={handleAccountMenuClick}
            >
                <AccountCircle />
            </IconButton>
            {renderMenu}
        </Container>
    );
}

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginBottom: theme.spacing(2),
    },
    login: {
        marginRight: theme.spacing(1),
    }
}));