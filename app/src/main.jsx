import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Editor from "./components/Editor/Editor.jsx";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
    <StrictMode>
        <Editor />
    </StrictMode>
);
