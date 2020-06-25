import React, {useEffect, useState} from "react";
import {makeStyles} from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Divider from '@material-ui/core/Divider';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import SearchIcon from "@material-ui/icons/Search";
import {decodeId, encodeId, ERROR, SUCCESS} from "../../utils";
import {useHistory} from "react-router-dom";
import {Box} from "@material-ui/core";
import Typography from '@material-ui/core/Typography';
import {addFriend, getFriends, getUnknownUsers, removeFriend} from "../../rest";
import AddUser from "../AddUser";
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import DeleteIcon from '@material-ui/icons/Delete';
import IconButton from '@material-ui/core/IconButton';
import {useSnackbar} from "notistack";

export default function Friends({userId}) {
    const {enqueueSnackbar} = useSnackbar();
    const classes = useStyles();
    const history = useHistory();
    const [search, setSearch] = useState("");
    const [friends, setFriends] = useState(null);
    const [unknown, setUnknown] = useState(null);
    const [openAddUser, setOpenAddUser] = useState(false);
    const [selectedAddUser, setSelectedAddUser] = useState(null);

    async function fetchFriends() {
        const friends = await getFriends(decodeId(userId)[0], search);
        setFriends(friends);
    }

    async function fetchUnknownUsers() {
        if (friends && search !== "") {
            if (friends.length < 3) {
                const unknownUsers = await getUnknownUsers(decodeId(userId)[0], search);
                setUnknown(unknownUsers);
                return;
            }
        }
        setUnknown(null);
    }

    useEffect(() => {
        fetchFriends().catch(error => console.error(error));
    }, [userId, search]);

    useEffect(() => {
        fetchUnknownUsers().catch(error => console.error(error));
    }, [search]);

    function onAgreeAddUser() {
        addFriend(decodeId(userId)[0], selectedAddUser.id)
            .then(async (response) => {
                showMessage('Friend added successfully.', SUCCESS);
                const {data} = response;
                const newUnknownList = unknown.filter(user => user.id !== data.friendId);
                setUnknown(newUnknownList.length > 0 ? newUnknownList : null);
                await fetchFriends();
            })
            .catch(() =>
                showMessage('Friend not added due to a system error.', ERROR)
            );

        setOpenAddUser(false);
    }

    function onCloseAddUser() {
        setOpenAddUser(false);
    }

    function clickItem(friend) {
        if (friend.isNew) {
            setSelectedAddUser(friend);
            setOpenAddUser(true);
        } else {
            history.push(`/${encodeId(friend.id)}`);
        }
    }

    function deleteItem(friendId) {
        removeFriend(decodeId(userId)[0], friendId)
            .then(async () => {
                showMessage('Friend removed successfully.', SUCCESS);
                await fetchFriends();
                await fetchUnknownUsers();
            })
            .catch(() =>
                showMessage('Friend not removed due to a system error.', ERROR)
            );
    }

    function onSearch(e) {
        setSearch(e.target.value);
    }

    function showMessage(message, variant) {
        enqueueSnackbar(message, {variant});
    }

    function createList(friends) {
        if (friends === null) {
            return <p>Ничего не найдено</p>;
        }
        return friends.map((friend, i) => {
            const {id, firstName, lastName, city} = friend;
            const fio = `${firstName} ${lastName}`;
            return (
                <ListItem key={id} button
                          alignItems="flex-start"
                          onClick={() => clickItem(friend)}
                          disableGutters>
                    <ListItemAvatar>
                        <Avatar alt={fio}>{fio.charAt(0).toUpperCase()}</Avatar>
                    </ListItemAvatar>
                    <ListItemText
                        primary={fio}
                        secondary={
                            <React.Fragment>
                                {city}
                            </React.Fragment>
                        }
                    />
                    {!friend.isNew && <ListItemSecondaryAction onClick={() => deleteItem(id)}>
                        <IconButton edge="end" aria-label="delete">
                            <DeleteIcon/>
                        </IconButton>
                    </ListItemSecondaryAction>}
                    {i !== friends.length - 1 &&
                    <Divider variant="inset" component="li"/>}
                </ListItem>
            );
        })
    }

    return (
        <React.Fragment>
            <Grid container className={classes.top} spacing={3}>
                <Grid item xs={12}>
                    <TextField id="outlined-search"
                               label="Search"
                               type="search"
                               variant="outlined"
                               fullWidth
                               value={search}
                               onChange={e => onSearch(e)}
                               InputProps={{
                                   endAdornment: (
                                       <InputAdornment position="start">
                                           <SearchIcon/>
                                       </InputAdornment>
                                   ),
                               }}
                    />
                </Grid>
                <Grid container item xs={12} justify="center">
                    <List className={classes.root}>
                        {friends && createList(friends)}
                    </List>

                    {unknown && <Box width={1}>
                        <Typography color="primary" variant={"overline"}>
                            New users:
                        </Typography>
                        <Divider className={classes.divider}/>
                    </Box>}
                    <List className={classes.root}>
                        {unknown && createList(unknown)}
                    </List>
                </Grid>
            </Grid>
            <AddUser open={openAddUser}
                     friend={selectedAddUser}
                     onAgree={onAgreeAddUser}
                     onClose={onCloseAddUser}/>
        </React.Fragment>
    );
}

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
        maxWidth: '36ch',
    },
    inline: {
        display: 'inline',
    },
    top: {
        marginTop: theme.spacing(2),
    },
    divider: {
        backgroundColor: theme.palette.primary.main,
    },
}));