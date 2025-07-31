import FetchApi from "./fetchApi.js";
import {nodeCron as cron}from "node-cron";
import nodemailer from 'nodemailer';

// const cron = require('node-cron');
// const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'https://threet-pos-exp.onrender.com',
  port: 587,
  service: 'gmail',
  secure: false, // use SSL
  auth: {
    user: 'sushibubbu@gmail.com',
    pass: 'qcybwfyhovcjxiqq',
  }
});

const getAllSalesUnpaid = () => {
    FetchApi.fetchSalesbyCustUnpaid()
    .then(data => {
        if(data.length > 0){
            let ordersID = [];
            let invoices = [];
            data.map(customer => {
                const subtotal = customer.orders.reduce((sum, order) => Number(sum) + Number(order.subtotal), 0);
                const grandtotal = customer.orders.reduce((sum, order) => Number(sum) + Number(order.grandtotal), 0);
                const total_discount = customer.orders.reduce((sum, order) => Number(sum) + Number(order.order_discount), 0);
                const ordersID = customer.orders.map(order => {return order.order_id});
                ordersID.push(customer.customer_id);
                let invModel = {
                    invoice_date: new Date(),
                    customer_id: customer.customer_id,
                    subtotal: subtotal,
                    amount_due: grandtotal,
                    total_discount: total_discount,
                    is_paid: false,
                    reamining_payment: 0,
                    payment_type: "unpaid",
                    order_id: JSON.stringify(ordersID)
                };
                invoices.push(invModel);
            });
            // console.log(JSON.stringify(invoices))
            createMultipleInv(invoices, ordersID);
        }
    })
    .catch(error => {
        console.log(error)
    })
}

transporter.verify(function(error, success) {
  if (error) {
        console.log(`Connection error:`, error);
  } else {
        console.log('Server is ready to take our messages');
  }
});

const createMultipleInv = (invoices, mailContent) => {
    let inv = JSON.stringify(invoices);
    FetchApi.fetchInsertMultipleInv(inv)
    .then(res => {
        transporter.sendMail(
        {
            from: "sushibubbu@gmail.com",
            to: "taengie.1991@gmail.com",
            subject: "Test nodemailer",
            text: `Yeayyyy, invoice with customer id '${mailContent}' successfully created!`,
        },
        (err, info) => {
            if (err) {
            console.error(err);
            return;
            }
            console.log(info.envelope);
            console.log(info.messageId);
        }
        );
    })
    .catch(err => {
         console.error(err)
    })
}



// cron.schedule('58 19 22 5 4', () => {
//       console.log('running a task in 22 may 19:17 thu');
//     getAllSalesUnpaid();
// });
    // getAllSalesUnpaid();
