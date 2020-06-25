import React from "react";
import CardEdit from "./CardEdit";
import CardRead from "./CardRead";

export default function Card({userId, editing, onSave}) {
    if (editing) {
        return (
            <CardEdit userId={userId} onSave={onSave}/>
        );
    }
    return (
        <CardRead userId={userId}/>
    );
}