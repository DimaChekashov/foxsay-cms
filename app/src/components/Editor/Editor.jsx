import React, { useEffect, useState } from "react";
import axios from "axios";

const Editor = () => {
    const [pageList, setPageList] = useState([]);
    const [newPageName, setNewPageName] = useState("");

    useEffect(() => {
        loadPageList();
    }, []);

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

    return(
        <>
            <input type="text" value={newPageName} onChange={(e) => setNewPageName(e.target.value)} />
            <button onClick={createNewPage}>Create Page</button>

            {pageList.map((page, i) => <h1 key={i}>{page}</h1>)}
        </>
    )
}

export default Editor;