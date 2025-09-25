import React from 'react';
import { Modal } from 'react-bootstrap';

export default function ModalTextContent({show, onHide, data}){
    
    return(
        <Modal size='md' show={show} onHide={onHide} scrollable={true} centered={true}  id="invoiceDetailModal" >
            <Modal.Header closeButton>
                <Modal.Title>{data.title ? data.title : ""}</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{width: '100%', overflowY: 'auto', wordBreak: 'break-word'}}>
                <p className="view-note-text" style={{textTransform: 'capitalize'}}>
                    {data.textContent ? data.textContent : ""}
                </p>
            </Modal.Body>
            <Modal.Footer>
                <button type="button" className="btn btn-primary" onClick={onHide}>OK</button>
            </Modal.Footer>
        </Modal>
        // <div className="modal fade" id="viewDesc" tabindex="-1" aria-labelledby="viewDescModal" aria-hidden="true">
        //     <div className="modal-dialog modal-md modal-dialog-centered">
        //         <div className="modal-content">
        //             <div className="modal-header">
        //                 <h1 className="modal-title fs-5">loan description</h1>
        //                 <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        //             </div>
        //             <div className="modal-body">
        //                 <p className="view-note-text">
        //                     Pinjaman untuk di kampung
        //                 </p>
        //             </div>
        //             <div className="modal-footer">
        //                 <button type="button" className="btn btn-primary" data-bs-dismiss="modal">ok</button>
        //             </div>
        //         </div>
        //     </div>
        // </div>
    );
}