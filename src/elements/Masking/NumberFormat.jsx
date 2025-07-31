import React from 'react';
import propTypes from 'prop-types';

export default function NumberFormat(props) {

    const formatedNumber = new Intl.NumberFormat(props.intlConfig.locale, {
        style: props.intlConfig.style,
        currency: props.intlConfig.currency,
        minimumFractionDigits: 0,
    })
    return (
        <span className="currency">{formatedNumber.format(props.intlConfig.value)} {props.suffix ? props.suffix : ""}</span>
    )
}

NumberFormat.propTypes = {
    intlConfig: propTypes.object,
    suffix: propTypes.string
}