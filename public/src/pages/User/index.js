import React, {useContext, useEffect, useState} from "react";
import Container from "@material-ui/core/Container";
import {useParams} from "react-router-dom";
import Card from "../../components/Card";
import Header from "../../components/Header";
import {AuthContext, SET_CURRENT_USER} from "../../providers/AuthProvider";
import Grid from "@material-ui/core/Grid";
import {decodeId} from "../../utils";
import Friends from "../../components/Friends";
import {clearToken, deleteUser} from "../../rest";

export default function User() {
    const [auth, dispatch] = useContext(AuthContext);
    const [editing, setEditing] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);
    const {userId} = useParams();

    useEffect(() => {
        if (auth.currentUser) {
            setCurrentUserId(auth.currentUser.id);
        }
    }, [auth.currentUser])

    function onEdit() {
        setEditing(!editing);
    }

    function onHome() {
        setEditing(false);
    }

    function onSave(user) {
        dispatch({type: SET_CURRENT_USER, payload: user});
        setEditing(false);
    }

    async function onDelete() {
        await deleteUser(decodeId(currentUserId)[0]);
        await clearToken();
        window.location.replace('/login');
    }

    return (
        <React.Fragment>
            <Header onHome={onHome} onEdit={onEdit} onDelete={onDelete}/>
            <Container component="main" maxWidth="xs">
                <Grid container direction={"column"} alignItems={"center"}>
                    <Card userId={userId}
                          editing={editing && currentUserId === userId}
                          onSave={onSave}/>
                    {currentUserId === userId && !editing
                    && <Friends userId={currentUserId}/>}
                </Grid>
            </Container>
        </React.Fragment>
    );
}