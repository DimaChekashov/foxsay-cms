import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import DOMHelper from "../../helpers/dom-helper";
import Spinner from "../Spinner/Spinner.jsx";
import Panel from "../Panel/Panel.jsx";

let virtualDom;

const Editor = () => {
    const [pageList, setPageList] = useState([]);
    const [backupsList, setBackupsList] = useState([]);
    const [newPageName, setNewPageName] = useState("");
    const [currentPage, setCurrentPage] = useState("index.html");
    const [loading, setLoading] = useState(true);
    
    const iframeRef = useRef(null);

    useEffect(() => {
        init(null, currentPage);
    }, []);

    const init = (e, page) => {
        if(e) {
            e.preventDefault();
        }
        isLoading();
        open(page, isLoaded);
        loadPageList();
        loadBackupsList();
    }

    const open = (page, callback) => {
        setCurrentPage(page);

        axios.get(`./site/${page}?rnd=${Math.random()}`)
            .then(res => DOMHelper.parseStrToDOM(res.data))
            .then(DOMHelper.wrapTextNodes)
            .then(dom => {
                virtualDom = dom;
                return dom;
            })
            .then(DOMHelper.serializeDOMToString)
            .then(html => axios.post("./api/saveTempPage.php", {html}))
            .then(() => iframeRef.current.src = "./site/dont-use-that-page-01010.html")
            .then(() => {
                iframeRef.current.onload = () => {
                    axios.post("./api/deleteTempPage.php");
                    enableEditing();
                    injectStyles();
                }
            })
            .then(callback);

            loadBackupsList();
    }

    const save = async () => {
        if(!confirm("Are you sure to deploy changes?")) return;

        isLoading();

        const newDom = virtualDom.cloneNode(virtualDom);

        DOMHelper.unwrapTextNodes(newDom);

        const html = DOMHelper.serializeDOMToString(newDom);
        
        await axios.post("./api/savePage.php", {
            pageName: currentPage, 
            html: html
        })
        .then(() => alert("Deploy success!"))
        .catch(() => alert("Something went wrong!"))
        .finally(isLoaded);

        loadBackupsList();
    }

    const enableEditing = () => {
        iframeRef.current.contentDocument.body.querySelectorAll("text-editor").forEach(element => {
            element.addEventListener("click", () => {
                element.contentEditable = "true";
                element.focus();
            });
            element.addEventListener("blur", () => {
                element.removeAttribute("contenteditable");
            });
            element.addEventListener("keypress", (e) => {
                if(e.keyCode === 13) {
                    element.removeAttribute("contenteditable");
                }
            });
            element.addEventListener("input", () => {
                onTextEdit(element);
            });
            if(element.parentNode.nodeName === "A" || element.parentNode.nodeName === "BUTTON") {
                element.addEventListener("contextmenu", (e) => {
                    e.preventDefault();
                    element.contentEditable = "true";
                    element.focus();
                })
            }
        });
    }

    const injectStyles = () => {
        const style = iframeRef.current.contentDocument.createElement("style");
        style.innerHTML = `
            text-editor:hover {
                outline: 3px solid orange;
                outline-offset: 8px;
            }
            text-editor:focus {
                outline: 3px solid red;
                outline-offset: 8px;
            }
        `;
        
        iframeRef.current.contentDocument.head.appendChild(style);
    }

    const onTextEdit = (element) => {
        const id = element.getAttribute("nodeid");
        virtualDom.body.querySelector(`[nodeid="${id}"]`).innerHTML = element.innerHTML;
    }

    const loadPageList = () => {
        axios.get("./api/pageList.php")
            .then(res => {
                setPageList(res.data);
            });
    }

    const loadBackupsList = () => {
        axios.get("./backups/backups.json")
            .then(res => setBackupsList(res.data.filter(backup => {
                return backup.page === currentPage;
            })));
    }

    const restoreBackup = async (e, backup) => {
        if(e) e.preventDefault();

        if(confirm("Are you sure want restore this file?")) {
            isLoading();
            await axios.post("./api/restoreBackup.php", {"page": currentPage, "file": backup});
            open(currentPage, isLoaded);
        }
    }

    const isLoading = () => {
        setLoading(true);
    }

    const isLoaded = () => {
        setLoading(false);
    }

    return(
        <>
            <Spinner active={loading} />
            <iframe src="" frameBorder="0" ref={iframeRef}></iframe>
            <Panel save={save} pageList={pageList} backupsList={backupsList} restoreBackup={restoreBackup} init={init} />
        </>
    )
}

export default Editor;