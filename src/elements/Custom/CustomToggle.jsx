import React from 'react'

const CustomToggle1 = React.forwardRef(({ onClick }, ref) => (
    
  <span className='table-btn' ref={ref} onClick={(e) => {
      e.stopPropagation();
      onClick(e);
    }}>
      <i className='bx bx-dots-vertical-rounded'></i>
  </span>

));

const CustomToggle2 = React.forwardRef(({ onClick }, ref) => (
    
  <span className='table-btn' ref={ref} onClick={(e) => {
      e.stopPropagation();
      onClick(e);
    }}>
      <i className='bx bx-dots-horizontal-rounded'></i>
  </span>

));

  export default {
    CustomToggle1,
    CustomToggle2
  };
  