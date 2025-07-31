import React from 'react'
import { useAccordionButton } from 'react-bootstrap';

export default function CustomToggle({eventKey, children, boxIcon}){
    const decoratedOnClick = useAccordionButton(eventKey, () =>
        console.log('totally custom!'),
    );

    return (
        <button className="accordion-button" type="button" onClick={decoratedOnClick} >
            <i className={`bx bx-${boxIcon}`}></i>
            {children}
        </button>
    );
}