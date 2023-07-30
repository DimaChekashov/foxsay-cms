import React, { useEffect, useState } from "react";


const EditorMeta = ({virtualDom}) => {
    const [isVisibleBlock, setIsVisibleBlock] = useState(false);
    const [title, setTitle] = useState("");
    const [keywords, setKeywords] = useState("");
    const [description, setDescription] = useState("");

    useEffect(() => {
        getMeta(virtualDom);
    }, [virtualDom]);

    const getMeta = (virtualDom) => {
        let title = virtualDom.head.querySelector("title") || virtualDom.head.appendChild(virtualDom.createElement("title"));
        
        let keywords = virtualDom.head.querySelector("meta[name='keywords']");
        if(!keywords) {
            keywords = virtualDom.head.appendChild(virtualDom.createElement("meta"));
            keywords.setAttribute("name", "keywords");
        }

        let description = virtualDom.head.querySelector("meta[name='description']");
        if(!description) {
            description = virtualDom.head.appendChild(virtualDom.createElement("meta"));
            description.setAttribute("name", "description");
        }
        
        setTitle(title.innerHTML);
        setKeywords(keywords.getAttribute("content") || "");
        setDescription(description.getAttribute("content") || "");
    }

    const applyMeta = (e) => {
        e.preventDefault();
        virtualDom.head.querySelector("title").innerHTML = title;
        virtualDom.head.querySelector("meta[name='keywords']").setAttribute("content", keywords);
        virtualDom.head.querySelector("meta[name='description']").setAttribute("content", description);
    }

    return (
        <div className="edittor-meta">
            <button className="edittor-meta__btn" onClick={() => setIsVisibleBlock(!isVisibleBlock)}>Edit Meta Tags</button>
            <form className={`edittor-meta__block${isVisibleBlock ? " active" : ""}`}>
                <label htmlFor="">Title</label>
                <input type="text" name="title" value={title} onChange={(e) => setTitle(e.target.value)} />
                <label htmlFor="">Keywords</label>
                <input type="text" name="keywords" value={keywords} onChange={(e) => setKeywords(e.target.value)} />
                <label htmlFor="">Description</label>
                <input type="text" name="description" value={description} onChange={(e) => setDescription(e.target.value)} />
                <button onClick={(e) => applyMeta(e)}>Apply</button>
            </form>
        </div>
    );
}

export default EditorMeta;