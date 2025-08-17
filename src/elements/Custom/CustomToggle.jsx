import React from 'react'

const CustomToggle = React.forwardRef(({ onClick }, ref) => (
    
  <span className='table-btn' ref={ref} onClick={(e) => {
      e.stopPropagation();
      onClick(e);
    }}>
    <i className='bx bx-dots-vertical-rounded' ></i>
  </span>

  ));

  export default CustomToggle;
  