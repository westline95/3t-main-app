async function fetchAllCust() {
    const allCustEndpoint = `http://localhost:5050/customers`;
    return new Promise((resolve, reject) => {
        fetch(allCustEndpoint, { 
            method: "GET" 
        }).then(resp => {
            if(!resp.ok){
                reject(new Error('get all customer rejected'));
            }
            return resp.json();
        })
        .then(data => {
            resolve(data);
        })
        .catch(error => {
            reject(error);
        })
    }) 
};

async function fetchInsertCust(body) {
    const addCustEndpoint = `https://threet-pos-exp.onrender.com/customer/write`;
    return new Promise((resolve, reject) => {
        fetch(addCustEndpoint, { 
            method: "POST",
            body: body,
            headers: {
                'Content-type': 'application/json; charset=UTF-8'
            },
        }).then(resp => {
            if(!resp.ok){
                reject(new Error('Add customer rejected'));
            }
            return resp.json();
        })
        .then(data => {
            resolve(data);
        })
        .catch(error => {
            reject(error);
        })
    }) 
}

async function fetchCustByID(id) {
    const custEndpoint = `https://threet-pos-exp.onrender.com/customers/member?id=${id}`;
    const resp = await fetch(custEndpoint);
    const data = await resp.json();
    return data;
}

async function fetchCustDel(id) {
    const custEndpoint = `https://threet-pos-exp.onrender.com/customers?id=${id}`;
    return new Promise((resolve, reject) => {
        fetch(custEndpoint, { 
            method: "DELETE" 
        }).then(resp => {
            if(!resp.ok){
                reject(new Error('delete customer rejected'));
            }
            return resp.json();
        })
        .then(data => {
            resolve(data);
        })
        .catch(error => {
            reject(error);
        })
    }) 
}

async function fetchUpdateCust(id, body) {
    const custEndpoint = `https://threet-pos-exp.onrender.com/customers?id=${id}`;

    return new Promise((resolve, reject) => {
        fetch(custEndpoint, { 
            method: "PUT",
            body: body,
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
        }).then((resp) => {
            if(!resp.ok){
                reject(new Error('update customer rejected'));
            }
            return resp.json();
        })
        .then(data => {
            resolve(data);
        })
        .catch(error => {
            reject(error);
        })
    })
}

async function fetchAllProds() {
    const AllProdEndpoint = `https://threet-pos-exp.onrender.com/products`;
    return new Promise((resolve, reject) => {
        fetch(AllProdEndpoint, { 
            method: "GET" 
        }).then(resp => {
            if(!resp.ok){
                reject(new Error('get all product rejected'));
            }
            return resp.json();
        })
        .then(data => {
            resolve(data);
        })
        .catch(error => {
            reject(error);
        })
    }) 
}

const fetchUpdateSales = async(salesID, body) => {
    const salesByIdEndpoint = `https://threet-pos-exp.onrender.com/sales?id=${salesID}`;
    return new Promise((resolve, reject) => {
        fetch(salesByIdEndpoint, { 
            method: "PUT",
            body: body,
            headers: {
                'Content-type': 'application/json; charset=UTF-8'
            },
        }).then(resp => {
            if(!resp.ok){
                reject(new Error('update sales is rejected'));
            }
            return resp.json();
        })
        .then(data => {
            resolve(data);
        })
        .catch(error => {
            reject(error);
        })
    }) 
};

const fetchAllSales = async() => {
   const resp =  await fetch(`https://threet-pos-exp.onrender.com/sales`);

    if(!resp.ok){
        const message = `An error has occured: ${resp.status}`;
        throw new Error(message);
    } 

    const data = await resp.json();
    return data;
    
};

async function fetchSalesByID(salesID) {
    const salesByIdEndpoint = `https://threet-pos-exp.onrender.com/sales?id=${salesID}`;
    return new Promise((resolve, reject) => {
        fetch(salesByIdEndpoint, { 
            method: "POST" 
        }).then(resp => {
            if(!resp.ok){
                reject(new Error('get sales by id rejected'));
            }
            return resp.json();
        })
        .then(data => {
            resolve(data);
        })
        .catch(error => {
            reject(error);
        })
    }) 
};

async function fetchOrderItembySales(order_id) {
    const orderItemEndpoint  = `https://threet-pos-exp.onrender.com/order-item/order?id=${order_id}`;
    return new Promise((resolve, reject) => {
        fetch(orderItemEndpoint, { 
            method: "GET",
        }).then(resp => {
            if(!resp.ok){
                reject(new Error('get order item by order id is rejected'));
            }
            return resp.json();
        })
        .then(data => {
            resolve(data);
        })
        .catch(error => {
            reject(error);
        })
    }) 
}

async function fetchSalesByMultipleID(salesMultipleID) {
    const salesByIdEndpoint = `https://threet-pos-exp.onrender.com/sales?${salesMultipleID}`;
    return new Promise((resolve, reject) => {
        fetch(salesByIdEndpoint, { 
            method: "POST" 
        }).then(resp => {
            if(!resp.ok){
                reject(new Error('get sales by id rejected'));
            }
            return resp.json();
        })
        .then(data => {
            resolve(data);
        })
        .catch(error => {
            reject(error);
        })
    }) 
}

const fetchSalesByStatus = async(status) => {
   const resp =  await fetch(`https://threet-pos-exp.onrender.com/sales/status?status=${status}`, {
        method: 'GET',
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
        },
    })

    if(!resp.ok){
        const message = `An error has occured: ${resp.status}`;
        throw new Error(message);
    } else {
        const data = await resp.json();
        return data;
    }
    
};

const fetchInsertSales = async(body) => {
   const resp =  await fetch(`https://threet-pos-exp.onrender.com/sales/write`, {
        method: "POST",
            body: body,
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
        },
    })

    if(!resp.ok){
        const message = `An error has occured: ${resp.status}`;
        throw new Error(message);
    } else {
        const data = await resp.json();
        return data;
    }
    
};

const fetchProdByID = (prodID) => 
    fetch(`https://threet-pos-exp.onrender.com/product`, {
        method: 'POST',
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify({ id: prodID })
    })
    .then((response) => response.json())
    .then((product) => {
        return product
    .catch((err) => {
        return err;
    });
});    

async function fetchCustType() {
    const custTypeEndpoint = `http://localhost:5050/types`;
    return new Promise((resolve, reject) => {
        fetch(custTypeEndpoint, { 
            method: "GET" 
        }).then(resp => {
            if(!resp.ok){
                reject(new Error('get all customer type rejected'));
            }
            return resp.json();
        })
        .then(data => {
            resolve(data);
        })
        .catch(error => {
            reject(error);
        })
    }) 
}

async function fetchUpdateCustType(id, body) {
    const updCustTypeEndpoint = `https://threet-pos-exp.onrender.com/type?id=${id}`;
    return new Promise((resolve, reject) => {
        fetch(updCustTypeEndpoint, { 
            method: "PUT",
            body: body,
            headers: {
                'Content-type': 'application/json; charset=UTF-8'
            },
        }).then(resp => {
            if(!resp.ok){
                reject(new Error('Update customer type rejected'));
            }
            return resp.json();
        })
        .then(data => {
            resolve(data);
        })
        .catch(error => {
            reject(error);
        })
    }) 
}

async function fetchInsertCustType(body) {
    const addCustTypeEndpoint = `https://threet-pos-exp.onrender.com/type/write`;
    return new Promise((resolve, reject) => {
        fetch(addCustTypeEndpoint, { 
            method: "POST",
            body: body,
            headers: {
                'Content-type': 'application/json; charset=UTF-8'
            },
        }).then(resp => {
            if(!resp.ok){
                reject(new Error('Add customer type rejected'));
            }
            return resp.json();
        })
        .then(data => {
            resolve(data);
        })
        .catch(error => {
            reject(error);
        })
    }) 
}

async function fetchDeleteCustType(id) {
    const delCustTypeEndpoint = `https://threet-pos-exp.onrender.com/type?id=${id}`;
    return new Promise((resolve, reject) => {
        fetch(delCustTypeEndpoint, { 
            method: "DELETE",
        }).then(resp => {
            if(!resp.ok){
                reject(new Error('Delete customer type rejected'));
            }
            return resp.json();
        })
        .then(data => {
            resolve(data);
        })
        .catch(error => {
            reject(error);
        })
    }) 
}

async function fetchGetCustType(id) {
    const getCustTypeEndpoint = `https://threet-pos-exp.onrender.com/type/by?id=${id}`;
    return new Promise((resolve, reject) => {
        fetch(getCustTypeEndpoint, { 
            method: "GET",
        }).then(resp => {
            if(!resp.ok){
                reject(new Error('Get customer type by ID is rejected'));
            }
            return resp.json();
        })
        .then(data => {
            resolve(data);
        })
        .catch(error => {
            reject(error);
        })
    }) 
}

async function fetchStatus() {
    const statusEndpoint = `https://threet-pos-exp.onrender.com/status`;
    return new Promise((resolve, reject) => {
        fetch(statusEndpoint, { 
            method: "GET" 
        }).then(resp => {
            if(!resp.ok){
                reject(new Error('get all status rejected'));
            }
            return resp.json();
        })
        .then(data => {
            resolve(data);
        })
        .catch(error => {
            reject(error);
        })
    }) 
}

async function fetchStatusById(id) {
    const statusByIdEndpoint = `https://threet-pos-exp.onrender.com/status/by?id=${id}`;
    return new Promise((resolve, reject) => {
        fetch(statusByIdEndpoint, { 
            method: "POST" 
        }).then(resp => {
            if(!resp.ok){
                reject(new Error('get status by id is rejected'));
            }
            return resp.json();
        })
        .then(data => {
            resolve(data);
        })
        .catch(error => {
            reject(error);
        })
    }) 
}

async function fetchInsertInvoice(body) {
    const addInvEndpoint = `https://threet-pos-exp.onrender.com/inv/write`;
    return new Promise((resolve, reject) => {
        fetch(addInvEndpoint, { 
            method: "POST",
            body: body,
            headers: {
                'Content-type': 'application/json; charset=UTF-8'
            },
        }).then(resp => {
            if(!resp.ok){
                reject(new Error('Add invoice is rejected'));
            }
            return resp.json();
        })
        .then(data => {
            resolve(data);
        })
        .catch(error => {
            reject(error);
        })
    }) 
};

async function fetchUpdateInv(id, body) {
    const updInvEndpoint = `https://threet-pos-exp.onrender.com/inv?id=${id}`;
    return new Promise((resolve, reject) => {
        fetch(updInvEndpoint, { 
            method: "PUT",
            body: body,
            headers: {
                'Content-type': 'application/json; charset=UTF-8'
            },
        }).then(resp => {
            if(!resp.ok){
                reject(new Error('Update invoice is rejected'));
            }
            return resp.json();
        })
        .then(data => {
            resolve(data);
        })
        .catch(error => {
            reject(error);
        })
    }) 
}

async function fetchInsertPayment(body) {
    const addPaymentEndpoint = `https://threet-pos-exp.onrender.com/payment/write`;
    return new Promise((resolve, reject) => {
        fetch(addPaymentEndpoint, { 
            method: "POST",
            body: body,
            headers: {
                'Content-type': 'application/json; charset=UTF-8'
            },
        }).then(resp => {
            if(!resp.ok){
                reject(new Error('Add payment is rejected'));
            }
            return resp.json();
        })
        .then(data => {
            resolve(data);
        })
        .catch(error => {
            reject(error);
        })
    }) 
};

async function fetchInsertReceipt(body) {
    const addReceiptEndpoint = `https://threet-pos-exp.onrender.com/receipt/write`;
    return new Promise((resolve, reject) => {
        fetch(addReceiptEndpoint, { 
            method: "POST",
            body: body,
            headers: {
                'Content-type': 'application/json; charset=UTF-8'
            },
        }).then(resp => {
            if(!resp.ok){
                reject(new Error('Add receipt is rejected'));
            }
            return resp.json();
        })
        .then(data => {
            resolve(data);
        })
        .catch(error => {
            reject(error);
        })
    }) 
};

async function fetchInsertMultipleOrderItem(body) {
    const addOrderItemsEndpoint = `https://threet-pos-exp.onrender.com/order-item/writes`;
    return new Promise((resolve, reject) => {
        fetch(addOrderItemsEndpoint, { 
            method: "POST",
            body: body,
            headers: {
                'Content-type': 'application/json; charset=UTF-8'
            },
        }).then(resp => {
            if(!resp.ok){
                reject(new Error('Add receipt is rejected'));
            }
            return resp.json();
        })
        .then(data => {
            resolve(data);
        })
        .catch(error => {
            reject(error);
        })
    }) 
};

async function fetchGetOrderItemByOrderID(order_id) {
    const orderItemsEndpoint = `https://threet-pos-exp.onrender.com/order-item/order?id=${order_id}`;
    return new Promise((resolve, reject) => {
        fetch(orderItemsEndpoint, { 
            method: "GET",
        }).then(resp => {
            if(!resp.ok){
                reject(new Error('Get all order item by order id is rejected'));
            }
            return resp.json();
        })
        .then(data => {
            resolve(data);
        })
        .catch(error => {
            reject(error);
        })
    }) 
};

async function fetchAllPayment() {
    const allPaymentEndpoint = `https://threet-pos-exp.onrender.com/payment/all`;
    return new Promise((resolve, reject) => {
        fetch(allPaymentEndpoint, { 
            method: "GET",
        }).then(resp => {
            if(!resp.ok){
                reject(new Error('all payment is rejected'));
            }
            return resp.json();
        })
        .then(data => {
            resolve(data);
        })
        .catch(error => {
            reject(error);
        })
    }) 
};

async function fetchPaymentByInv(invoice_id) {
    const paymentEndpoint = `https://threet-pos-exp.onrender.com/payment/inv?invid=${invoice_id}`;
    return new Promise((resolve, reject) => {
        fetch(paymentEndpoint, { 
            method: "GET",
        }).then(resp => {
            if(!resp.ok){
                reject(new Error('all payment by inv id is rejected'));
            }
            return resp.json();
        })
        .then(data => {
            resolve(data);
        })
        .catch(error => {
            reject(error);
        })
    }) 
};

async function fetchAllReceipt() {
    const allReceiptEndpoint = `https://threet-pos-exp.onrender.com/receipt/all`;
    return new Promise((resolve, reject) => {
        fetch(allReceiptEndpoint, { 
            method: "GET",
        }).then(resp => {
            if(!resp.ok){
                reject(new Error('all receipt is rejected'));
            }
            return resp.json();
        })
        .then(data => {
            resolve(data);
        })
        .catch(error => {
            reject(error);
        })
    }) 
};

async function fetchAllInv() {
    const allInvEndpoint = `https://threet-pos-exp.onrender.com/inv`;
    return new Promise((resolve, reject) => {
        fetch(allInvEndpoint, { 
            method: "GET",
        }).then(resp => {
            if(!resp.ok){
                reject(new Error('all invoice is rejected'));
            }
            return resp.json();
        })
        .then(data => {
            resolve(data);
        })
        .catch(error => {
            reject(error);
        })
    }) 
};

async function fetchInvByID(invID) {
    const invIdEndpoint  = `https://threet-pos-exp.onrender.com/inv?id=${invID}`;
    return new Promise((resolve, reject) => {
        fetch(invIdEndpoint, { 
            method: "GET",
        }).then(resp => {
            if(!resp.ok){
                reject(new Error('all invoice by id is rejected'));
            }
            return resp.json();
        })
        .then(data => {
            resolve(data);
        })
        .catch(error => {
            reject(error);
        })
    }) 
}

async function fetchInvByStatusCustID(ispaid,custID, type) {
    const invStatusCustIdEndpoint  = `https://threet-pos-exp.onrender.com/inv/check?custid=${custID}&ispaid=${ispaid}&type=${type}`;
    return new Promise((resolve, reject) => {
        fetch(invStatusCustIdEndpoint, { 
            method: "GET",
        }).then(resp => {
            if(!resp.ok){
                reject(new Error('all invoice by ispaid, cust id, and type is rejected'));
            }
            return resp.json();
        })
        .then(data => {
            resolve(data);
        })
        .catch(error => {
            reject(error);
        })
    }) 
};

async function fetchDelOrderItem(id) {
    const orderItemEndpoint = `https://threet-pos-exp.onrender.com/order-item/order?id=${id}`;
    return new Promise((resolve, reject) => {
        fetch(orderItemEndpoint, { 
            method: "DELETE" 
        }).then(resp => {
            if(!resp.ok){
                reject(new Error('delete order item is rejected'));
            }
            return resp.json();
        })
        .then(data => {
            resolve(data);
        })
        .catch(error => {
            reject(error);
        })
    }) 
};

async function fetchDelOrder(id) {
    const orderEndpoint = `https://threet-pos-exp.onrender.com/sales?id=${id}`;
    return new Promise((resolve, reject) => {
        fetch(orderEndpoint, { 
            method: "DELETE" 
        }).then(resp => {
            if(!resp.ok){
                reject(new Error('delete order is rejected'));
            }
            return resp.json();
        })
        .then(data => {
            resolve(data);
        })
        .catch(error => {
            reject(error);
        })
    }) 
};

async function fetchSalesbyCustUnpaid() {
    const salesEndpoint  = `https://threet-pos-exp.onrender.com/sales/group/unpaid`;
    return new Promise((resolve, reject) => {
        fetch(salesEndpoint, { 
            method: "GET",
        }).then(resp => {
            if(!resp.ok){
                reject(new Error('all order by cust and unpaid is rejected'));
            }
            return resp.json();
        })
        .then(data => {
            resolve(data);
        })
        .catch(error => {
            reject(error);
        })
    }) 
}

async function fetchSalesbyOneCustUnpaid(cust_id) {
    const salesEndpoint  = `https://threet-pos-exp.onrender.com/sales/cust/unpaid?custid=${cust_id}`;
    return new Promise((resolve, reject) => {
        fetch(salesEndpoint, { 
            method: "GET",
        }).then(resp => {
            if(!resp.ok){
                reject(resp.status);
            }
            return resp.json();
        })
        .then(data => {
            resolve(data);
        })
        .catch(error => {
            reject(error);
        })
    }) 
}


async function fetchSalesWOrderItems(order_id) {
    const salesEndpoint  = `https://threet-pos-exp.onrender.com/sales/order-items?id=${order_id}`;
    return new Promise((resolve, reject) => {
        fetch(salesEndpoint, { 
            method: "GET",
        }).then(resp => {
            if(!resp.ok){
                reject(new Error('all order with order items is rejected'));
            }
            return resp.json();
        })
        .then(data => {
            resolve(data);
        })
        .catch(error => {
            reject(error);
        })
    }) 
}

async function fetchInsertMultipleInv(body) {
    const addInvEndpoint = `https://threet-pos-exp.onrender.com/inv/writes`;
    return new Promise((resolve, reject) => {
        fetch(addInvEndpoint, { 
            method: "POST",
            body: body,
            headers: {
                'Content-type': 'application/json; charset=UTF-8'
            },
        }).then(resp => {
            if(!resp.ok){
                reject(new Error('create multiple invoice is rejected'));
            }
            return resp.json();
        })
        .then(data => {
            resolve(data);
        })
        .catch(error => {
            reject(error);
        })
    }) 
};

async function fetchInvSett() {
    const invSettEndpoint = `https://threet-pos-exp.onrender.com/inv-sett`;
    return new Promise((resolve, reject) => {
        fetch(invSettEndpoint, { 
            method: "GET",
        }).then(resp => {
            if(!resp.ok){
                reject(new Error('get invoice setting is rejected'));
            }
            return resp.json();
        })
        .then(data => {
            resolve(data);
        })
        .catch(error => {
            reject(error);
        })
    }) 
};


async function fetchUpdateInvSett(id, body) {
    const invSettEndpoint = `https://threet-pos-exp.onrender.com/updt/inv-sett?id=${id}`;
    return new Promise((resolve, reject) => {
        fetch(invSettEndpoint, { 
            method: "PUT",
            body: body,
            headers: {
                'Content-type': 'application/json; charset=UTF-8'
            },
        }).then(resp => {
            if(!resp.ok){
                reject(new Error('get invoice setting is rejected'));
            }
            return resp.json();
        })
        .then(data => {
            resolve(data);
        })
        .catch(error => {
            reject(error);
        })
    }) 
};

async function fetchMailerSett() {
    const mailerSettEndpoint = `https://threet-pos-exp.onrender.com/mailer-sett`;
    return new Promise((resolve, reject) => {
        fetch(mailerSettEndpoint, { 
            method: "GET",
        }).then(resp => {
            if(!resp.ok){
                reject(new Error('get mailer setting is rejected'));
            }
            return resp.json();
        })
        .then(data => {
            resolve(data);
        })
        .catch(error => {
            reject(error);
        })
    }) 
};


async function fetchUpdateMailerSett(id, body) {
    const mailerSettEndpoint = `https://threet-pos-exp.onrender.com/updt/mailer-sett?id=${id}`;
    return new Promise((resolve, reject) => {
        fetch(mailerSettEndpoint, { 
            method: "PUT",
            body: body,
            headers: {
                'Content-type': 'application/json; charset=UTF-8'
            },
        }).then(resp => {
            if(!resp.ok){
                reject(new Error('get mailer setting is rejected'));
            }
            return resp.json();
        })
        .then(data => {
            resolve(data);
        })
        .catch(error => {
            reject(error);
        })
    }) 
};

async function fetchOrderSummary(id, pay_type) {
    const orderEndpoint = `https://threet-pos-exp.onrender.com/sales/summary?id=${id}&paytype=${pay_type}`;
    return new Promise((resolve, reject) => {
        fetch(orderEndpoint, { 
            method: "GET"
        }).then(resp => {
            if(!resp.ok){
                reject(new Error('get summary order is rejected'));
            }
            return resp.json();
        })
        .then(data => {
            resolve(data);
        })
        .catch(error => {
            reject(error);
        })
    }) 
};

export default {
    fetchAllCust,
    fetchInsertCust,
    fetchCustByID,
    fetchCustDel,
    fetchUpdateCust,
    fetchAllProds,
    fetchUpdateSales,
    fetchAllSales,
    fetchSalesByID,
    fetchSalesByMultipleID,
    fetchInsertSales,
    fetchSalesByStatus,
    fetchProdByID,
    fetchCustType,
    fetchUpdateCustType,
    fetchInsertCustType,
    fetchDeleteCustType,
    fetchGetCustType,
    fetchStatus,
    fetchStatusById,
    fetchInsertInvoice,
    fetchInsertPayment,
    fetchInvByID,
    fetchAllPayment,
    fetchPaymentByInv,
    fetchInsertReceipt,
    fetchInsertMultipleOrderItem,
    fetchGetOrderItemByOrderID,
    fetchOrderItembySales,
    fetchAllInv,
    fetchAllReceipt,
    fetchInvByStatusCustID,
    fetchUpdateInv,
    fetchDelOrderItem,
    fetchDelOrder,
    fetchSalesbyCustUnpaid,
    fetchSalesbyOneCustUnpaid,
    fetchInsertMultipleInv,
    fetchInvSett,
    fetchUpdateInvSett,
    fetchMailerSett,
    fetchUpdateMailerSett,
    fetchSalesWOrderItems,
    fetchOrderSummary
}