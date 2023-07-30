import React from "react";

const Spinner = ({active}) => {
    return (
        <div className={active ? "spinner active" : "spinner"}>
            <div className="spinner-round"></div>
        </div>
    )
}

export default Spinner;