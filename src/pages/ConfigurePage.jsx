import { useContext, useEffect, useState } from "react";
import { DBContext } from "../contexts/DBContext";
import { Card } from "./components/Card";
import { EditableInput } from "./components/EditableInput";
import { EditableSelect, optionsFromList } from "./components/EditableSelect";
import ScreensPage from "./ScreensPage";
import { EditableTextarea } from "./components/EditableTextarea";

const ConfigurePage = () => {
    return <>
        <TypesPage />
        <ScreensPage />
        <ImportExportPage />
    </>;
};

const TypesPage = () => {

    const { addDataListener, pushObject, ready } = useContext(DBContext);

    const [data, setData] = useState([]);
    const [input, setInput] = useState("");

    const pagePath = `types`;
    const pageTitle = `Types`;

    useEffect(() => {
        if (ready) {
            addDataListener(pagePath, setData, true);
        }
    }, [ready]);

    function addContent(event) {
        event.preventDefault();
        pushObject(pagePath, {
            'name': input
        });
        setInput("");
    }

    return (
        <div>
            <h1>{pageTitle}</h1>
            <form onSubmit={addContent} id="contentForm">
                <input autoFocus placeholder="Type Title" value={input} onChange={field => setInput(field.target.value)} type="text" className="content_field" />
                <button id="addContentButton" onClick={addContent}>Create</button>
            </form>
            {
                data && data.map(datum => <TypesCard card={datum} path={pagePath} key={pagePath} />)
            }
        </div>
    );
};

const TypesCard = (props) => {

    const { updateObject, pushObject, asKeyedList } = useContext(DBContext);

    const card = props.card;
    if (!card) return;
    const cardPath = `${props.path}/${card.key}`;
    const typeFields = asKeyedList(card.fields);

    const fieldsMap = {
        'fields/text': {
            'name': 'Text'
        },
        'fields/select': {
            'name': 'Select'
        },
        'fields/date': {
            'name': 'Date'
        }
    };
    const fieldsList = asKeyedList(fieldsMap);

    const defaultSelectorInput = "None";

    const [titleInput, setTitleInput] = useState(card.name);
    const [fieldSelectorInput, setFieldSelectorInput] = useState(defaultSelectorInput);

    function addSelected(path, value, keyName) {
        if (value === defaultSelectorInput) {
            return;
        }
        let obj = {};
        obj[keyName] = value;
        pushObject(path, obj);
    }

    function updateContent() {
        updateObject(cardPath, "name", titleInput || "");
    }

    function resetContent() {
        setTitleInput(card.name);
    }

    return (
        <Card card={card}
            cardPath={cardPath}
            updateContent={updateContent}
            resetContent={resetContent}
            viewComponent={
                <h3>{card.name}</h3>
            }
            editComponent={
                <>
                    <EditableInput label={"Name"} value={titleInput} setValue={setTitleInput} />
                    <label>Fields</label>
                    {
                        typeFields && typeFields.map(field => {
                            return (
                                <FieldCard card={field}
                                    path={cardPath} key={`${cardPath}/${field.key}`}
                                />
                            );
                        })
                    }
                    <EditableSelect label={""} value={fieldSelectorInput} setValue={setFieldSelectorInput}
                        options={fieldsList} defaultOption={defaultSelectorInput} />
                    <button onClick={() => { addSelected(`${cardPath}/fields`, fieldSelectorInput, "fieldKey"); }}>Add Field</button>
                </>
            }
        />
    );
};

const FieldCard = (props) => {
    const { updateObject, pushObject, removeObject, asKeyedList } = useContext(DBContext);

    const card = props.card;
    const cardPath = `${props.path}/fields/${card.key}`;

    const [optionInput, setOptionInput] = useState("");

    const options = asKeyedList(card.options);

    function addSelectOption() {
        pushObject(`${cardPath}/options`, {
            'name': optionInput
        });
        setOptionInput("");
    }

    return (
        <Card card={card}
            cardPath={cardPath}
            resetContent={() => setOptionInput("")}
            viewComponent={
                <>
                    <h3 key={`${cardPath}/${card.key}/name`}>{card.name}</h3>
                    <h4 key={`${cardPath}/${card.key}/fieldKey`}>{card.fieldKey}</h4>
                </>
            }
            editComponent={
                <>
                    <EditableInput label="Name" path={cardPath} dataname={'name'} key={`${cardPath}/nameInput`} />
                    {
                        card.fieldKey === "fields/select" &&
                        <>
                            <div key={`${cardPath}/nameInput`}>Select-field Options</div>
                            {
                                options && options.map(option => {
                                    return <OptionCard option={option} path={cardPath} key={`${cardPath}/optionCard/${option.key}`} />;
                                })
                            }
                            <EditableInput label={""} value={optionInput} setValue={setOptionInput} onSubmit={addSelectOption} key={`${cardPath}/optionInput`} />
                            <button onClick={() => addSelectOption()} key={`${cardPath}/addButton`}>Add</button>
                            <EditableSelect label={"Default Value"} path={cardPath} dataname={`defaultValue`} options={options} defaultOption="None" key={`${cardPath}/defaultInput`} />
                        </>
                    }
                    {
                        card.fieldKey === 'fields/text' &&
                        <EditableInput label={"Default Value"} path={cardPath} dataname={'defaultValue'} />
                    }
                </>
            }
        />
    );
};

const OptionCard = (props) => {
    const { updateObject, pushObject, removeObject, asKeyedList } = useContext(DBContext);

    const option = props.option;
    const path = `${props.path}/options/${option.key}`;

    const [input, setInput] = useState(option.name);

    function updateContent() {
        updateObject(path, "name", input || "");
    }

    function resetContent() {
        setInput(option.name);
    }

    return (
        <Card card={option}
            cardPath={path}
            updateContent={updateContent}
            resetContent={resetContent}
            viewComponent={
                <>
                    {option.name && <h3>{option.name}</h3>}
                </>
            }
            editComponent={
                <EditableInput label="Name" value={input} setValue={setInput} />
            }
        />
    );
};

const ImportExportPage = () => {
    const { addDataListener, asKeyedList, ready } = useContext(DBContext);
    const States = {
        waitingForInput: 0,
        selectingTargetType: 1,
        mapping: 2
    };
    const [state, setState] = useState(States.waitingForInput);
    const [jsonInput, setJsonInput] = useState("");
    const [parsedJson, setParsedJson] = useState({});
    const [targetTypeKey, setTargetTypeKey] = useState(undefined);
    const [targetType, setTargetType] = useState(undefined);
    const [types, setTypes] = useState(undefined);
    const [nonCommonFields, setNonCommonFields] = useState({});
    const [commonFields, setCommonFields] = useState({});
    const [fieldMappings, setFieldsMappings] = useState({});

    function setFieldMapping(name, value) {
        let mappings = fieldMappings;
        mappings[name] = value;
        setFieldsMappings(mappings);
    }

    useEffect(() => {
        console.log("mappings changed");
    }, [fieldMappings]);

    useEffect(() => {
        if (ready) {
            addDataListener(`types`, setTypes, true);
        }
    }, [ready]);

    useEffect(() => {
        if (targetTypeKey && types) {
            setTargetType(Object.values(types).find(type => type.key === targetTypeKey));
        }
    }, [targetTypeKey]);

    function toggleJsonField() {
        if (state === States.waitingForInput) {
            let parsedJsonInput = JSON.parse(jsonInput);
            let seenFields = new Set([]);
            let commonFields = new Set([]);
            Object.values(parsedJsonInput).forEach(object => {
                let keys = Object.keys(object);
                if (seenFields.size == 0 && commonFields.size == 0) {
                    keys.forEach(key => commonFields.add(key));
                }
                keys.forEach(key => seenFields.add(key));
                commonFields = Array.from(commonFields).filter(field => keys.includes(field));
            });
            let differentFields = Array.from(seenFields).filter(field => !commonFields.includes(field));
            setCommonFields(commonFields);
            setNonCommonFields(differentFields);
            setParsedJson(parsedJsonInput);
            setState(States.selectingTargetType);
        } else {
            setState(States.waitingForInput);
        }
    }

    return (
        <>
            <h1>Import/Export</h1>
            <EditableTextarea label={"JSON"} value={jsonInput} setValue={setJsonInput} disabled={state === States.waitingForInput ? false : true} />
            <button className="displayBlock" onClick={toggleJsonField}>{state === States.waitingForInput ? "Parse JSON" : "Edit JSON"}</button>
            {state > States.waitingForInput &&
                <>
                    <h2>Data</h2>
                    <ul>
                        <ExpandableField isRoot object={parsedJson} />
                    </ul>
                    <h2>Mapping</h2>
                    {
                        types ? <EditableSelect label={"Target type"} value={targetTypeKey} setValue={setTargetTypeKey} options={types} defaultOption={"None"} />
                            : <p>No types found.</p>
                    }
                    <p>{JSON.stringify(targetType)}</p>
                    <h3>Common Fields</h3>
                    <table>
                        <thead>

                            <tr>
                                <th>Source Name</th>
                                <th>Target Name</th>
                            </tr>
                        </thead>
                        <tbody>

                            {commonFields.map(field =>
                                <tr>
                                    <td>{field}</td>
                                    <td><EditableSelect
                                        value={fieldMappings && Array.from(fieldMappings).includes(field) && fieldMappings[field]}
                                        setValue={(value) => setFieldMapping(field, value)}
                                        options={asKeyedList(targetType?.fields)}
                                        defaultOption={"None"} /></td>
                                </tr>)}
                        </tbody>
                    </table>
                    <h3>Noncommon Fields</h3>
                    <ul>
                        {nonCommonFields.map(field => <li>{field}</li>)}
                    </ul>
                </>
            }
        </>
    );
};

const ExpandableField = (props) => {
    const isRoot = props.isRoot;
    const objectkey = props.objectkey;
    const object = props.object;
    const [isExpanded, setExpanded] = useState(false);
    function toggleExpanded(e) {
        e.stopPropagation();
        setExpanded(!isExpanded);
    }
    function expandObject() {
        if (isExpanded || isRoot) {
            return Object.keys(object).map(field => {
                let objectKey = field;
                let objectField = object[field];
                if (typeof objectField !== 'object' && !Array.isArray(objectField)) {
                    return <li>{objectKey}: {objectField}</li>;
                } else {
                    return <ExpandableField objectkey={objectKey} object={objectField} />;
                }
            }
            );
        }
    }
    if (isRoot) {
        return (
            <>{expandObject()}</>
        );
    } else {
        return (
            <li onClick={e => toggleExpanded(e)}>
                {objectkey}
                {isExpanded &&
                    <ul>
                        {expandObject()}
                    </ul>
                }
            </li>
        );
    }
};

export default ConfigurePage;