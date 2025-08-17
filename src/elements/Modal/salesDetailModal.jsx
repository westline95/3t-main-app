import React, { useEffect, useState } from 'react';
import { Modal, Toast, ToastContainer } from 'react-bootstrap';
import User from "../../assets/images/Avatar 1.jpg";
import ConvertDate from '../../assets/js/ConvertDate';
import NumberFormat from '../Masking/NumberFormat';
import InputWLabel from '../Input/InputWLabel';
import { CustomSelect } from '../CustomSelect';
import FetchApi from '../../assets/js/fetchApi';
import { useForm } from 'react-hook-form';


export default function SalesDetailModal({show, onHide, data}) {
    const [ countItem, setCountItem ] = useState(0);
    const [ dataPoint, setDataPoint ] = useState(null);
    const [ orderItems, setOrderItems ] = useState(null);
    const [ showToast, setShowToast ] = useState(false);
    const [ toastContent, setToastContent ] = useState({variant: "", msg: "", title: ""});
    const [ isLoading, setIsLoading ] = useState(true);

    const fetchSalesByID = () => {
        FetchApi.fetchSalesByID(data.id)
            .then(result => {
                let salesDuplicate = [...result];
                // let salesData = salesDuplicate[0].salesData ? JSON.parse(salesDuplicate[0].salesData) : [];
                // let qty = 0;

                // let modifiedData = {
                //     sales: salesDuplicate[0],
                //     items: salesData,
                // }
                setDataPoint(result);
            })
            .catch(error => {
                setToastContent({variant:"danger", msg: "Error when get sales data!"});
                setShowToast(true);
            }
        )
    };
    
    const fetchOrderItemBySales = () => {
        FetchApi.fetchOrderItemBySales(data.id)
            .then(result => {
                setOrderItems(result);
            })
            .catch(error => {
                setToastContent({variant:"danger", msg: "Error when get order item data!"});
                setShowToast(true);
            }
        )
    };

    useEffect(() => {
        if(data){
            fetchSalesByID();
            fetchOrderItemBySales();
        }
    },[data]); 
    
    useEffect(() => {
        if(dataPoint && orderItems){
            setIsLoading(false);
        }
    },[dataPoint, orderItems]);

    if(isLoading){
        return;
    }
    

    return(
        <>
        <Modal size='xl' show={show} onHide={onHide} scrollable={true} centered={true}>
            <Modal.Header closeButton>
                <Modal.Title>sales detail {data !== "" ? `: ${data.origin}` : ""}</Modal.Title>
                <span style={{textTransform: 'capitalize'}} className={`badge badge-${
                    !dataPoint.is_complete ? 'danger'
                    : dataPoint.is_complete ? "primary"
                    : ""} light mx-2`}
                >
                    {
                        !dataPoint.is_complete ? 'belum bayar'
                        : 'lunas'
                    }                                                                                
                </span>
            </Modal.Header>
            {dataPoint && dataPoint !== "" ?
                (<Modal.Body>
                    <div className="row gy-3">
                        <div className="col-lg-6 col-sm-12 col-md-12 col-12">
                            <InputWLabel 
                                label="Customer Name" 
                                type="text"
                                name="salesCustName" 
                                disabled={true}
                                value={dataPoint.customer.name}
                                textStyle={"capitalize"}
                            />
                        </div>
                        <div className="col-lg-4 col-sm-6 col-md-6 col-6">
                            <InputWLabel 
                                label="Date" 
                                type="text"
                                name="salesDate" 
                                disabled={true}
                                value={ConvertDate.convertToFullDate(dataPoint.order_date, "/")}
                            />
                        </div>
                        <div className="col-lg-2 col-sm-6 col-md-6 col-6">
                            <InputWLabel 
                                label="status" 
                                type="text"
                                name="salesStatus" 
                                disabled={true}
                                value={dataPoint.ordeR_status}
                                textStyle={"capitalize"}
                            />
                        </div>
                        <div className="col-lg-4 col-sm-6 col-md-6 col-6">
                            <InputWLabel 
                                label="note" 
                                type="text"
                                name="salesNote" 
                                disabled={true}
                                value={dataPoint.note}
                            />
                        </div>
                    </div>

                    <p className="card-title mb-3 mt-5">Sales list</p>
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>product</th>
                                    <th>qty</th>
                                    <th>price</th>
                                    <th>total</th>
                                </tr>
                            </thead>
                            <tbody>
                            {orderItems !== null ? 
                                    orderItems.map((e, idx) => {
                                        return(
                                            <tr key={`sales-data-${idx}`}>
                                                <td className="data-img" style={{textTransform: 'capitalize'}}>
                                                    <span className="product-img">
                                                        <img src={e.img} alt={e.roduct.product_name} />
                                                    </span> 
                                                    {`${e.product.product_name} ${e.variant}`}
                                                </td>
                                                <td>{e.quantity}</td>
                                                <td>
                                                    <NumberFormat intlConfig={{
                                                        value: e.sell_price, 
                                                        locale: "id-ID",
                                                        style: "currency", 
                                                        currency: "IDR",
                                                    }} />
                                                </td>
                                                <td>
                                                    <NumberFormat intlConfig={{
                                                        value: Number(e.sell_price)*e.quantity, 
                                                        locale: "id-ID",
                                                        style: "currency", 
                                                        currency: "IDR",
                                                    }} />
                                                </td>
                                            </tr>   
                                        )
                                    }) 
                                : ""}
                                {/* endnote */}
                                <tr className="endnote-row">
                                    <td className="endnote-row-title">items</td>
                                    <td colSpan="3">{Number(dataPoint.sales.totalQty)}</td>
                                </tr>
                                <tr className="endnote-row">
                                    <td colSpan="3" className="endnote-row-title">subtotal</td>
                                    <td style={{fontWeight: 500}}>
                                        <NumberFormat intlConfig={{
                                            value: dataPoint.subtotal, 
                                            locale: "id-ID",
                                            style: "currency", 
                                            currency: "IDR",
                                        }} 
                                    />
                                    </td>
                                </tr>
                                <tr className="endnote-row">
                                    <td colSpan="3" className="endnote-row-title">discount</td>
                                    <td style={{fontWeight: 500}}>
                                        <NumberFormat intlConfig={{
                                            value: dataPoint.sales.discount, 
                                            locale: "id-ID",
                                            style: "currency", 
                                            currency: "IDR",
                                        }} 
                                        />
                                    </td>
                                </tr>
                                <tr className="endnote-row">
                                    <td colSpan="3" className="endnote-row-title">total sales</td>
                                    <td>
                                        <NumberFormat intlConfig={{
                                            value: dataPoint.sales.grandTotal, 
                                            locale: "id-ID",
                                            style: "currency", 
                                            currency: "IDR",
                                        }} />
                                    </td>
                                </tr>
                                <tr className="endnote-row">
                                    <td colSpan="3" className="endnote-row-title">total paid</td>
                                    <td>
                                        <NumberFormat intlConfig={{
                                            value: dataPoint.sales.totalPayment, 
                                            locale: "id-ID",
                                            style: "currency", 
                                            currency: "IDR",
                                        }} />
                                    </td>
                                </tr>
                                <tr className="endnote-row">
                                    <td colSpan="3" className="endnote-row-title">remaining</td>
                                    <td>
                                        <NumberFormat intlConfig={{
                                            value: dataPoint.sales.remainingPayment, 
                                            locale: "id-ID",
                                            style: "currency", 
                                            currency: "IDR",
                                        }} />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </Modal.Body>
                ):""
            }
                
            <Modal.Footer>
                <button type="button" className="btn btn-primary" onClick={onHide}>OK</button>
            </Modal.Footer>
        </Modal>
        
        {/* toast area */}
        <ToastContainer className="p-3 custom-toast">
            <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide bg={toastContent.variant}>
                <Toast.Body>{toastContent.msg}</Toast.Body>
            </Toast>
        </ToastContainer>
        </>
    )
}