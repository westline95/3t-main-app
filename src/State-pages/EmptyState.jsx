import React from 'react';
import PropTypes from 'prop-types';
import EmptyStateImg from '../../public/empty-state-transparent-bg.png';

export default function EmptyState({title, description}) {
    return(
    <div style={
        {
            width: '100%', 
            height:'57vh', 
            // position: 'absolute', 
            display:'flex',
            flexDirection:'column',
            padding: '1rem 0', 
            backgroundColor: 'transparent',
            justifyContent:'center',
            alignItems:'center'
            }
        }>
        <img src={EmptyStateImg} style={{width: '200px', height: '200px', marginBottom: '.5rem'}}  />
        <p style={{marginBottom: ".3rem", textTransform: 'capitalize', fontWeight: 600, color: '#344050'}}>{title}</p>
        <p style={{marginBottom: ".3rem", color: '#344050'}}>{description}</p>
    </div>
    )
};

EmptyState.PropTypes = {
    title: PropTypes.string,
    description: PropTypes.string
}


