import React from "react";
import Button from "../elements/Button/index";
import Logo from "../../public/logo.svg";
import Logo2 from "../assets/images/kiwest.png";

export default function Brand() {
    return (
        <Button className="brand-icon" href="/" type="link">
            <img src={Logo2} alt="Logo" type="png" style={{width: '7.5rem'}}/>
        </Button>
    );
}
