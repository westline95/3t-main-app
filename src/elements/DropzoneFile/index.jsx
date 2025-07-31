import React, { useState, useRef, useEffect } from 'react';
import propTypes from 'prop-types';

export default function DropzoneFile({defaultValue, name, register, error, require, returnValue, style}) {
    const parentDropzone = useRef(null);
    const inputImg = useRef(null);
    const imgEl = useRef(null);
    const [ checkFiles, setCheckFile ] = useState(false);
    const [ imgFile, setFile ] = useState(null);

    useEffect(() => {
        console.log(defaultValue)
        if(defaultValue){
            setCheckFile(true);
            setFile(defaultValue);
        }
    },[defaultValue])

    const dropzoneFile = (e) => {
        if(e !== "remove") {
            const checkFile = e.target.files[0];
            setCheckFile(true);
            const imgObj = URL.createObjectURL(checkFile);
            setFile(imgObj);
        } else {
            setCheckFile(false);
            inputImg.value = "";
            setFile(null);
        }
    }


    return(
        <div className={`dropzone-file ${checkFiles  ? "active" : ""}`} ref={parentDropzone} style={style}>
            <span className="dropzone-btn" onClick={() => dropzoneFile("remove")}>
                <i className='bx bx-x'></i>
            </span>
            <div className="preview-area">
                <span className="add-img-btn">
                    <i className='bx bx-plus'></i>
                </span>
                <input type="file" ref={inputImg}
                    className="form-control custom-input-file"
                    name={name}
                    accept=".jpg, .jpeg, .png" 
                    id="prodImg"
                    // onChange={dropzoneFile} 
                    {...register != null ? {...register(name, { required: require, onChange: dropzoneFile })} : ""}
                />
                <p className="file-info">No Files Selected</p>
                {checkFiles && imgFile ?
                    (<img src={imgFile} alt="preview img" ref={imgEl} />)
                    :''
                }
            </div>
        </div>
    )
};

DropzoneFile.propTypes = {
    defaultValue: propTypes.string,
    name: propTypes.string
}

