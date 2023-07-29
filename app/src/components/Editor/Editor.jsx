import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

const Editor = () => {
    const [pageList, setPageList] = useState([]);
    const [newPageName, setNewPageName] = useState("");
    const [currentPage, setCurrentPage] = useState("site/index.html");
    const [virtualDom, setVirtualDom] = useState();
    const iframeRef = useRef(null);

    useEffect(() => {
        init(currentPage);
    }, []);

    const init = (page) => {
        open(page);
        loadPageList();
    }

    const open = (page) => {
        setCurrentPage(`./${page}?rnd=${Math.random()}`);

        axios.get(`./${page}`)
            .then(res => parseStrToDOM(res.data))
            .then(wrapTextNodes)
            .then(dom => {
                setVirtualDom(dom);
                return dom;
            })
            .then(serializeDOMToString)
            .then(html => axios.post("./api/saveTempPage.php", {html}))
            .then(() => iframeRef.current.src = "./site/temp.html")
            .then(() => {
                iframeRef.current.onload = () => {
                    enableEditing()
                }
            });
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

        this.virtualDom.body.querySelector(`[nodeid="${id}"]`).innerHTML = element.innerHTML;
    }

    const parseStrToDOM = (str) => {
        const parser = new DOMParser();
        return parser.parseFromString(str, "text/html");
    }

    const wrapTextNodes = (dom) => {
        const body = dom.body;
        let textNodes = [];

        function recursionNode(element) {
            element.childNodes.forEach(node => {
                if(node.nodeName === "#text" && node.nodeValue.replace(/\s+/g, "").length > 0) {
                    textNodes.push(node);
                } else {
                    recursionNode(node);
                }
            });
        }

        recursionNode(body);

        textNodes.forEach((node, i) => {
            const wrapper = dom.createElement('text-editor');
            node.parentNode.replaceChild(wrapper, node);
            wrapper.appendChild(node);
            wrapper.setAttribute("nodeid", i);
        })

        return dom;
    }

    const serializeDOMToString = (dom) => {
        const serializer = new XMLSerializer();
        return serializer.serializeToString(dom);
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