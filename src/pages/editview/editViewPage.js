//React
import React, { useEffect, useState, useContext } from 'react';
//Firebase
import { ref, onValue, off, update } from "firebase/database";
//Contexts
import { NavigationContext } from '../../contexts/NavigationContext';
//Components
//Styles
import './editViewPage.css';
//Config
import '../../firebaseConfig';
import { AuthContext } from '../../contexts/AuthContext';
import { DBContext } from '../../contexts/DBContext';
import EditableText from '../../components/EditableText/EditableText';
import EditViewDisplaysList from '../../components/EditViewDisplaysList/EditViewDisplaysList';

const EditViewPage = (props) => {
    const { user } = useContext(AuthContext);
    const { database } = useContext(DBContext);
    const { goToPage, parameters } = useContext(NavigationContext);

    const [dbRef, setDbRef] = useState(undefined);

    const [view, setView] = useState({});

    const [viewKey] = useState(parameters.objectKey);
    useEffect(() => {
        if (!viewKey) goToPage("#home");
    }, [viewKey]);

    //Set db ref on user set
    useEffect(() => {
        if (user) {
            if (dbRef) {
                off(dbRef);
            }
            setDbRef(ref(database, `users/${user.uid}/views/${viewKey}`));
            setView([]);
        }
    }, [user]);

    //Retrieve cards on dbref change
    useEffect(() => {
        if (!dbRef) {
            return;
        }
        if (!user) {
            console.log("Can't load content - no user found.");
            return;
        }
        onValue(dbRef, (snapshot) => {
            const data = snapshot.val();
            if (data == null) {
                console.log("An error occurred.");
                setView([]);
                return;
            }
            setView(data);
        });
    }, [dbRef]);

    function changeValue(fieldName, value) {
        if (dbRef) {
            let updates = {};
            updates[fieldName] = value;

            update(dbRef, updates);
        }
    };

    if (view == "" || !view) {
        return (
            <div id="pageContent">
                <div id="pageContainer">
                </div>
            </div>
        );
    }
    let displays = [];
    if (view.displays) {
        displays = Object.keys(view.displays).map(key => {
            let display = view.displays[key];
            display.key = key;
            return display;
        });
    }

    return (
        <div id="pageContent">
            <div id="pageContainer">
                <p><b>Title</b></p>
                <EditableText value={view.name} fieldName="name" dbRef={dbRef} element={(content) => <h1>{content}</h1>} changeValue={changeValue} />
                <hr></hr>
                <p><b>Description</b></p>
                <EditableText value={view.description} fieldName="description" dbRef={dbRef} element={(content) => <p>{content}</p>} changeValue={changeValue} />
                <EditViewDisplaysList displays={displays} viewRef={`users/${user?.uid}/views/${viewKey}`} changeValue={changeValue} />
            </div>
        </div>
    );
};

export default EditViewPage;