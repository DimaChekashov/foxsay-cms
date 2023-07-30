import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import DOMHelper from "../../helpers/dom-helper";

let virtualDom;

const Editor = () => {
    const [pageList, setPageList] = useState([]);
    const [newPageName, setNewPageName] = useState("");
    const [currentPage, setCurrentPage] = useState("site/index.html");
    
    const iframeRef = useRef(null);

    useEffect(() => {
        init(currentPage);
    }, []);

    const init = (page) => {
        open(page);
        loadPageList();
    }

    const open = (page) => {
        setCurrentPage(page);

        axios.get(`./${page}?rnd=${Math.random()}`)
            .then(res => DOMHelper.parseStrToDOM(res.data))
            .then(DOMHelper.wrapTextNodes)
            .then(dom => {
                virtualDom = dom;
                return dom;
            })
            .then(DOMHelper.serializeDOMToString)
            .then(html => axios.post("./api/saveTempPage.php", {html}))
            .then(() => iframeRef.current.src = "./site/temp.html")
            .then(() => {
                iframeRef.current.onload = () => {
                    enableEditing();
                }
            });
    }

    const save = () => {
        const newDom = virtualDom.cloneNode(virtualDom);

        DOMHelper.unwrapTextNodes(newDom);

        const html = DOMHelper.serializeDOMToString(newDom);
        
        axios.post("./api/savePage.php", {
            pageName: currentPage, 
            html: html
        })
    }

    const enableEditing = () => {
        iframeRef.current.contentDocument.body.querySelectorAll("text-editor").forEach(element => {
            element.contentEditable = "true";
            element.addEventListener("input", () => {
                onTextEdit(element);
            })
        });
    }

    const onTextEdit = (element) => {
        const id = element.getAttribute("nodeid");
        virtualDom.body.querySelector(`[nodeid="${id}"]`).innerHTML = element.innerHTML;
    }

    const loadPageList = () => {
        axios.get("./api")
            .then(res => {
                setPageList(res.data);
            });
    }

    const createNewPage = () => {
        axios.post("./api/createNewPage.php", {"name": newPageName})
            .then((res) => console.log(res))
            .catch(() => {
                alert("Page already exist!");
            });
        setNewPageName("");
        loadPageList();
    }

    const deletePage = (page) => {
        axios.post("./api/deletePage.php", {"name": page})
            .then((res) => console.log(res))
            .catch(() => {
                alert("Page is not found!");
            });

        loadPageList();
    }

    return(
        <>
            <button onClick={save}>Click</button>
            <iframe src={currentPage} frameBorder="0" ref={iframeRef}></iframe>
            {/* <input type="text" value={newPageName} onChange={(e) => setNewPageName(e.target.value)} />
            <button onClick={createNewPage}>Create Page</button>

            {pageList.map((page, i) => (
                <h1 key={i}>
                    {page}
                    <a 
                        href="#"
                        onClick={() => deletePage(page)}
                    >(x)</a>
                </h1>)
            )} */}
        </>
    )
}

export default Editor;