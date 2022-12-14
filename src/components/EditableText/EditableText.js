//React
import { update } from 'firebase/database';
import React, { useEffect, useState } from 'react';
const EditableText = (props) => {
    const fieldName = props.fieldName;
    const dbRef = props.dbRef;
    const element = props.element;
    const changeValue = props.changeValue;
    const [value, setValue] = useState(props.value || "");
    const [editValue, setEditingValue] = useState(props.value || "");
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        setValue(props.value || "");
    }, [props.value]);

    useEffect(() => {
        setIsEditing(false);
        setEditingValue(value);
        changeValue(fieldName, value);
    }, [value]);

    const saveEdit = () => {
        setValue(editValue);
        setIsEditing(false);
    };

    if (isEditing || !value) {
        return (
            <>
                <input value={editValue} onChange={field => setEditingValue(field.target.value)}></input>
                <button onClick={() => saveEdit()}>Save</button>
            </>
        );
    }

    return (
        <div className={"clickable"} onClick={() => setIsEditing(true)} >
            {element(value)}
        </div >
    );

};

export default EditableText;