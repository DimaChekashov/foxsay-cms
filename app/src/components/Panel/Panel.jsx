import React from "react";
import EditorMeta from "../EditorMeta/EditorMeta.jsx";

const Panel = ({pageList, backupsList, save, init, restoreBackup, virtualDom}) => {

    return (
        <div className="panel">
            <ul className="panel-list restore">
                {backupsList.length ? backupsList.map(item => (
                    <li key={item.file}>
                        <a href="#" onClick={(e) => restoreBackup(e, item.file)}>Backup of {item.time}</a>
                    </li>
                )) : "Backups is empty"}
            </ul>
            <ul className="panel-list">
                {pageList.map(item => (
                    <li key={item}>
                        <a href="#" onClick={(e) => init(e, item)}>{item}</a>
                    </li>
                ))}
            </ul>
            {virtualDom ? <EditorMeta virtualDom={virtualDom}/> : undefined}
            <button>Open</button>
            <button>Restore</button>
            <button onClick={save}>Deploy</button>
        </div>
    );
}

export default Panel;