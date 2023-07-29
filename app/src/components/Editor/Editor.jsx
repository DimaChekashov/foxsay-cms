import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

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
        setCurrentPage(`./${page}`);
        iframeRef.current.onload = () => {
            console.log(currentPage);
        };
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