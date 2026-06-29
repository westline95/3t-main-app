import React, { useEffect, useState } from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'; 
import ConvertDate from '../assets/js/ConvertDate.js';

import Logo from "../assets/images/Logo_WA-removebg-preview.png";
import NumberFormat from '../elements/Masking/NumberFormat.jsx';
import dataStatic from '../assets/js/dataStatic.js';

const colorAccent = "#081f5c";

const invoiceStyle = StyleSheet.create({
    page: {
        backgroundColor: '#ffffff',
        paddingTop: 32,
        paddingRight: 32,
        paddingBottom: 32,
        paddingLeft: 32,
        // padding: '25 32 30 32',
        height: 'auto'
    },
    header: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        justifyContent:'space-between',
        borderBottom: '2.25px',
        borderStyle: 'solid',
        borderColor: '#d8d8d8'
    },
    headerDetail: {
        // width: '76%',
        display: 'flex',
        flexDirection: 'column',
    }, 
    headerTitle: {
        maxWidth: '55%',
        fontSize: '82px',
        fontWeight: 700,
        textTransform: 'uppercase',
        marginBottom: '80px',
    },
    headerInfo: {
        marginBottom: '18px',
        display: 'flex',
        flexDirection: 'column',
    },
    infoLabel:{
        color: '#929292',
        fontWeight: 500,
        fontSize: '40px',
        marginBottom: '14px',
        textTransform: 'capitalize',
    },
    infoText:{
        color: '#344050',
        fontWeight: 600,
        fontSize: '40px',
        textTransform: 'capitalize',
        marginBottom: '47px'
    },
    headerCompany: {
        display: 'flex',
        flexDirection: 'row',
        alignContent: 'center',
        alignSelf: 'center',
        position: 'absolute',
        gap: 12,
        marginTop:-32,
        right:-32,
        // backgroundColor: '#29a7fc',
        // backgroundColor: '#022B3A',
        backgroundColor: colorAccent,
        width:'890px',
        height: '350px',
        paddingVertical: 16,
        paddingHorizontal: 16,
        // borderRadius: 12
        borderBottomLeftRadius:12,
        borderTopLeftRadius:12,
    },
    companyImg: {
        width: '230px',
        height: '230px',
        // marginTop: -10,
        // marginBottom: '20px',
        alignSelf: 'center',
        marginLeft: '12px',
    },
    logoImg: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    companyProfile:{
        display: 'flex',
        flexDirection: 'column',
        alignSelf: 'center',
        marginRight:32
    },
    profileText1: {
        color: '#ffffff',
        fontWeight: 800,
        fontSize: '40px',
        textTransform: 'capitalize',
    },
    profileText2: {
        color: '#ffffff',
        fontWeight: 500,
        fontSize: '40px',
        textTransform: 'capitalize',
    },
    invoiceContent: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent:'space-between',
        paddingVertical: '70px',
        alignItems: 'center',
    },
    InvAmount: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent:'space-between',
        gap: '27px',
        width:'100%',
        marginBottom: 22
    },
    cardAmount: {
        // minWidth: '490px',
        width:'32%',
        height: '300px',
        backgroundColor: '#F5F6F9',
        textAlign: 'center',
        paddingVertical: '100px',
        paddingHorizontal: '62px',
    },
    cardAmountHighlight: {
        width: '33%',
        height: '300px',
        // backgroundColor: '#29a7fc',
        // backgroundColor: '#022B3A',
        backgroundColor: colorAccent,
        textAlign: 'center',
        paddingVertical: '100px',
        paddingHorizontal: '40px',
    },
    infoGroup: {
        textAlign: 'center',
        textTransform: 'capitalize',
        display: 'flex',
        flexDirection:'column',
        // gap: '15px'
    },
    cardInfoLabel: {
        color: '#929292',
        fontWeight: 700,
        fontSize: '40px',
        alignSelf:'center',
        marginBottom: '37px',
    },
    cardInfoHighlightLabel: {
        color: '#ffffff',
        fontWeight: 700,
        fontSize: '40px',
        alignSelf:'center',
        marginBottom: '37px',
    },
    cardInfoHighlightText: {
        color: '#ffffff',
        fontWeight: 700,
        fontSize: '50px',
        alignSelf:'center',
    },
    cardInfoText: {
        color: '#344050',
        fontWeight: 700,
        fontSize: '50px',
        alignSelf:'center'
    },
    badgeSuccess: {
        color: '#009a6e',
        backgroundColor: '#d4ffedd6',
        border: '.5px',
        borderStyle: 'solid',
        borderColor: '#d4ffedd6',
        paddingHorizontal: '24px',
        paddingVertical: '16px',
        width:'150px',
        borderRadius: '15px'
    }, badgeDanger: {
        color: '#f05d53',
        backgroundColor: '#ffeae9',
        border: '.5px',
        borderStyle: 'solid',
        borderColor: '#ffeae9',
        paddingHorizontal: '24px',
        paddingVertical: '16px',
        width:'300px',
        borderRadius: '15px'
    },
     badgeWarning: {
        color: '#f6945f',
        backgroundColor: '#fff2eb',
        border: '.5px',
        borderStyle: 'solid',
        borderColor: '#fff2eb',
        paddingHorizontal: '24px',
        paddingVertical: '16px',
        width:'150px',
        borderRadius: '15px'
    },
    badgeInfo: {
        color: '#008fee',
        backgroundColor: '#e8f6ff',
        border: '.5px',
        borderStyle: 'solid',
        borderColor: '#e8f6ff',
        paddingHorizontal: '24px',
        paddingVertical: '16px',
        width:'150px',
        borderRadius: '15px'
    },
    badgeText: {
        textTransform:'capitalize',
        fontSize: '35px',
        fontWeight: 600
    },
    invTransaction:{
        width: '100%',
    },
    invTableTitle:{
        fontWeight: 600,
        fontSize: '40px',
        textTransform: 'capitalize',
        marginBottom: '38px',
        color: '#344050',
    },
    table: {
       
        fontSize: '40px',
        height:'auto',
        // display: 'flex',
        // flexDirection: 'column',
        width: '100%',
        textTransform: 'capitalize',

    },
    thead: {
        width:'100%',
        backgroundColor: '#F5F6F9',
        paddingVertical: '42px',
        paddingHorizontal: '65px',
        
        // height: '100px',
    },
    orderNumberTab:{
        // backgroundColor: '#29a7fc',
        // backgroundColor: '#022B3A',
        backgroundColor: colorAccent,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        // width: '38%',
        minWidth: '30%',
        paddingVertical: '35px',
        paddingHorizontal: '65px',
    },
    orderNumberTabText: {
        color: '#ffffff',
        fontWeight: 600,
    },
    rowHead:{
        width:'100%',
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignContent: 'center',
        // width:'100%',
        // display: 'flex',
        // flexDirection: 'row',
        // alignItems: 'center',
        // flexBasis: 'auto',
        // flexGrow: 1,
        // flexShrink: 2,
        // flexBasis: '200px',
        // padding: '32px',
    },  
    rowBody: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        // paddingVertical: '52px',
        // height: '100%'
        
    },
    trBorder:{
        borderBottom: '2.25px',
        borderStyle: 'solid',
        borderColor: '#EBF1F6',
    },
    th :{
        // width:'100%',
        // padding: '32px',
        // paddingVertical: '32px',
        // paddingHorizontal: '75px',
        // flexGrow: 1,
        // flex: 1,
        // flexShrink: 2,
        color: '#344050',
        fontWeight: 600,
        verticalAlign: 'middle'
        // flexShrink:1,
        // flexBasis: 'auto'
    },
    td: {
        // width:'100%',
        display: 'flex', 
        flexDirection: 'row',
        flexWrap: 'wrap',
        backgroundColor: '#ffffff',
        color: '#344050',
        fontWeight: 500,
        paddingVertical: 10
        // paddingVertical: '36px',
        // flexBasis: 'auto'
    },
    tbody: {
        width: '100%',
        height: 'auto'
    },
    tdHighlight1: {
        fontWeight: 500,
        fontSize: '40px',
        width:'100%',
        paddingVertical: '36px',
        paddingHorizontal: '90px',
    },
    tdHighlight2: {
        fontWeight: 500,
        fontSize: '40px',
        width:'100%',
        paddingVertical: '36px',
        paddingHorizontal: '90px',
    },
    trHighlight:{
        width:'100%',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    }, 
    tdHighlight3: {
        fontWeight: 600,
        fontSize: '53px',
        width:'100%',
        paddingVertical: '36px',
        paddingHorizontal: '90px',
        backgroundColor: '#F5F6F9'
    },
    returnHeader: {
        backgroundColor: '#F5F6F9',
        width: '100%',
        color: '#344050',
        fontWeight: 500,
        textTransform:'capitalize'
    },
    returnHeaderInline: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent:'space-between',
    },
    returnHeaderText:{
        display: 'flex',
        flexDirection: 'row',
        gap: 4,
        fontSize: '40px',
        paddingVertical: '36px',
        paddingHorizontal: '40px',
    },
    tableEndNote1: {
        display: 'flex', 
        flexDirection: 'row', 
        width: '100%', 
        justifyContent: 'flex-end',
        paddingVertical: '36px',
        borderBottom: '2.25px',
        borderStyle: 'solid',
        borderColor: '#EBF1F6',
        color: '#344050',
    },
     tableEndNote2: {
        display: 'flex', 
        flexDirection: 'row', 
        width: '100%', 
        justifyContent: 'flex-end',
        height: 'auto',
        paddingVertical: 10,
        // paddingTop: '36px',
        // paddingBottom: '36px',
        backgroundColor: '#F5F6F9',
        color: '#344050',
    },
    footer: {
        width: '90%',
        paddingVertical: '28px',
        paddingHorizontal: '75px',
        // backgroundColor: '#29a7fc',
        // backgroundColor: '#022B3A',
        backgroundColor: colorAccent,
        color: '#ffffff',
        fontSize: '38px',
        fontWeight: 600,
        position:'absolute',
        bottom: 22,
        left: 32,
        right: 32,
    },
    tableDesc: {
        fontStyle: 'italic'
    }

    
})

export default function DGReportDoc({data, ref}) {
    const [ orderData, setOrderData ] = useState(data ? data.order : []);
    const [ paymentData, setPaymentData ] = useState(data ? data.payment : []);
    // const [ paymentData, setPaymentData ] = useState(data ? data.payment : []);
    const [ totalPaid, setTotalPaid] = useState(0);
    const imageUrl = "https://res.cloudinary.com/du3qbxrmb/image/upload/v1748248130/Logo_WA-removebg-preview_qnf7tu.png";
     const formatedNumber = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    })

    useEffect(() => {
        if(data.payment){
            let totalPaid = data.payment.reduce((sum, payment) => Number(sum) + Number(payment.amount_paid), 0);
            setTotalPaid(totalPaid);
        }
    },[])

    return(
        <Document ref={ref}>
            <Page 
                size="A4" 
                style={invoiceStyle.page}
                wrap={true}
                dpi={300}
                // orientation='potrait'
            >
                <View style={invoiceStyle.header}>
                    <View style={invoiceStyle.headerDetail}>
                        <Text style={invoiceStyle.headerTitle}>laporan pengantaran grup harian</Text>
                        <View style={invoiceStyle.headerInfo}>
                            <Text style={invoiceStyle.infoLabel}>ID pengantaran</Text>
                            <Text style={{...invoiceStyle.infoText, textTransform: 'uppercase'}}>{`#${data.delivery_group_id}`}</Text>
                        </View>
                        <View style={{display: 'flex', flexDirection:'row', gap:'64px'}}>
                            <View style={invoiceStyle.headerInfo}>
                                <Text style={invoiceStyle.infoLabel}>Tanggal</Text>
                                <Text style={invoiceStyle.infoText}>{ConvertDate.convertToBeautyDate(data.delivery_group_date)}</Text>
                            </View>
                            <View style={invoiceStyle.headerInfo}>
                                <Text style={invoiceStyle.infoLabel}>dibuat tanggal</Text>
                                <Text style={invoiceStyle.infoText}>{ConvertDate.convertToBeautyDate(data.delivery_group_report.createdAt)}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={invoiceStyle.headerCompany}>
                        <View style={invoiceStyle.companyImg}>
                            <Image source={imageUrl} style={invoiceStyle.logoImg} />
                        </View>
                        <View style={invoiceStyle.companyProfile}>
                            <Text style={invoiceStyle.profileText1}>tahu tempe tauge</Text>
                            <Text style={invoiceStyle.profileText2}>+6282229990644</Text>
                            <Text style={invoiceStyle.profileText2}>pangururan, samosir</Text>
                        </View>
                    </View>
                </View>
                <View style={invoiceStyle.invoiceContent}>
                    <View style={invoiceStyle.custInfo}>
                        <View style={invoiceStyle.infoGroup}>
                            <Text style={invoiceStyle.infoLabel}>Nama karyawan</Text>
                            <Text style={invoiceStyle.infoText}>{data.employee ? data.employee.name : "???"}</Text>
                        </View>
                        <View style={invoiceStyle.infoGroup}>
                            <Text style={invoiceStyle.infoLabel}>ID karyawan</Text>
                            <Text style={invoiceStyle.infoText}>{data.employee_id}</Text>
                        </View>
                    </View>
                    <View style={{width: 'auto',alignSelf: 'flex-start'}}>
                        <View style={{...invoiceStyle.infoGroup, textAlign:'left'}}>
                            <Text style={invoiceStyle.infoLabel}>status laporan</Text>
                            {data.delivery_group_report?.report_status == 1 ?
                            (
                                <View style={{...invoiceStyle.badgeWarning, width: 'auto'}}>
                                    <Text style={invoiceStyle.badgeText}>{dataStatic.deliveryGroupReportStatus[1-1].type}</Text>
                                </View>
                            ) : data.delivery_group_report?.report_status == 2 ?
                            (
                                <View style={invoiceStyle.badgeInfo}>
                                    <Text style={invoiceStyle.badgeText}>{dataStatic.deliveryGroupReportStatus[2-1].type}</Text>
                                </View>
                            ) :
                            (
                                <View style={invoiceStyle.badgeDanger}>
                                    <Text style={invoiceStyle.badgeText}>{dataStatic.deliveryGroupReportStatus[3-1].type}</Text>
                                </View>
                            )
                            }
                        </View>
                    </View>
                </View>
                
                <View style={invoiceStyle.invTransaction}>
                    <View style={{ marginBottom: '132px'}}>
                       <Text style={invoiceStyle.invTableTitle}>rangkuman pengantaran</Text>
                            <View style={{...invoiceStyle.table}}>
                                <View style={invoiceStyle.thead} wrap={false}>
                                    <View style={invoiceStyle.rowHead} wrap={false}>
                                        <View style={{...invoiceStyle.th, width: '7%'}}><Text>#</Text></View>
                                        <View style={{...invoiceStyle.th, width: '40%'}}><Text>item</Text></View>
                                        <View style={{...invoiceStyle.th, width: '17.6%'}}><Text>qty awal</Text></View>
                                        <View style={{...invoiceStyle.th, width: '17.6%'}}><Text>qty keluar</Text></View>
                                        <View style={{...invoiceStyle.th, width: '17.6%'}}><Text>qty kembali</Text></View>
                                    </View>
                                </View>
                                <View style={{...invoiceStyle.tbody}}>
                                {data?.DeliveryGroupItemsProduct && data.DeliveryGroupItemsProduct.map((item, index) => {  
                                    let findIdx = data?.DeliveryGroupItemsProductOut.findIndex(({product_id}) => item.product_id == product_id);
                                    return(
                                    <>
                                    <View style={{...invoiceStyle.rowBody, width: '100%', ...invoiceStyle.trBorder}}>
                                        <View  style={{height: '100%',...invoiceStyle.td,paddingHorizontal:"32.5px", paddingVertical: 10, justifyContent: 'flex-start'}}>
                                            <View style={{...invoiceStyle.tr, width: '7%', paddingHorizontal:"32.5px"}}>
                                                <Text style={{ color: '#344050',fontWeight: 600}}>{index+1}</Text>
                                            </View>
                                            <View style={{...invoiceStyle.tr,  width: '40%', paddingHorizontal:"32.5px"}}>
                                                <Text>{`${item.product?.product_name} ${item.product?.variant}`}</Text>
                                            </View>
                                            <View style={{...invoiceStyle.tr, width: '17.6%', paddingHorizontal:"32.5px"}}>
                                                <Text>{Number(item.total_item)}</Text>
                                            </View>
                                            <View style={{...invoiceStyle.tr, width: '17.6%', paddingHorizontal:"32.5px"}}>
                                                <Text>{findIdx >= 0  ? Number(data.DeliveryGroupItemsProductOut[findIdx]?.total_item) : 0}</Text>
                                            </View>
                                            <View style={{...invoiceStyle.tr, width: '17.6%', paddingHorizontal:"32.5px"}}>
                                                <Text>{findIdx >= 0 ? (Number(item?.total_item) - Number(data.DeliveryGroupItemsProductOut[findIdx]?.total_item)) : Number(item?.total_item)}</Text>
                                            </View>
                                        </View>
                                    </View>
                                    {index == data?.DeliveryGroupItemsProduct.length-1 && 
                                    (
                                    <View style={{...invoiceStyle.tableEndNote1}}>
                                        <View style={{width: '47%',textAlign: 'right', marginRight:12, fontWeight: 600}}><Text>total</Text></View>
                                        <View style={{width: '17.6%', fontWeight: 600}}>
                                            <Text>{data.totalQtyConfirmed}</Text>
                                        </View>
                                        <View style={{width: '17.6%', fontWeight: 600}}>
                                            <Text>{data.totalQtyOutConfirmed}</Text>
                                        </View>
                                        <View style={{width: '17.6%', fontWeight: 600}}>
                                            <Text>{(Number(data.totalQtyConfirmed) - Number(data.totalQtyOutConfirmed))}</Text>
                                        </View>
                                    </View>
                                    )}
                                    </>
                                    )
                                })}
                            </View>
                        </View>
                    </View>
                </View>
               
                <View style={invoiceStyle.invTransaction}>
                    <View style={{ marginBottom: '132px',}}>
                        <Text style={invoiceStyle.invTableTitle}>detail laporan pengantaran</Text>
                        {data?.delivery_group_report && data.delivery_group_report?.delivery_group_report_orders?.map((order, idx) => {
                            return(
                            <View style={{...invoiceStyle.table}} key={`transaction-table-${idx}`}>
                                <View style={invoiceStyle.orderNumberTab} wrap={false}>
                                    <View style={{...invoiceStyle.orderNumberTabText}}><Text>pelanggan: {order.customer ? order.customer.name : `${order.guest_name} (tamu)`}</Text></View>
                                </View>
                                <View style={invoiceStyle.thead} wrap={false}>
                                    <View style={invoiceStyle.rowHead} wrap={false}>
                                        {/* <View style={{...invoiceStyle.th, width: '12.5%'}}><Text>pelanggan</Text></View> */}
                                        <View style={{...invoiceStyle.th, width: '30%' }}><Text>item</Text></View>
                                        <View style={{...invoiceStyle.th, width: '23.3%'}}><Text>qty</Text></View>
                                        <View style={{...invoiceStyle.th, width: '23.3%'}}><Text>satuan</Text></View>
                                        <View style={{...invoiceStyle.th, width: '23.3%'}}><Text>jumlah</Text></View>
                                        {/* <View style={{...invoiceStyle.th, width: '14.5%'}}><Text>total</Text></View>
                                        <View style={{...invoiceStyle.th, width: '14%'}}><Text>bayar</Text></View>
                                        <View style={{...invoiceStyle.th, width: '14%'}}><Text>sisa</Text></View> */}
                                    </View>
                                </View>
                                <View style={{...invoiceStyle.tbody}}>
                                    <View style={{...invoiceStyle.rowBody, width: '100%'}}>
                                        {/* <View  style={{height: '100%',paddingLeft:'75px', paddingVertical: 10, width: '11.5%', ...invoiceStyle.trBorder, justifyContent: 'flex-start'}}>
                                            <Text style={{ color: '#344050',fontWeight: 600}}>{order.customer ? order.customer.name : order.guest_name}</Text>
                                        </View> */}
                                        <View style={{width: '100%', height: '100%',...invoiceStyle.trBorder, paddingLeft:'75px'}}>
                                            {order?.delivery_group_report_lists?.length > 0 && order?.delivery_group_report_lists?.map((orderItem, index) => {
                                                return( 
                                                <>
                                                <View style={{...invoiceStyle.td, paddingRight:'67px', 
                                                    borderBottom: index == order?.delivery_group_report_lists?.length - 1 ? 0 : '2.25px', 
                                                    borderStyle: index == order?.delivery_group_report_lists?.length - 1 ? 'none' : 'solid',  
                                                    borderColor: index == order?.delivery_group_report_lists?.length - 1 ? 'none' : '#EBF1F6'}}
                                                >
                                                    <View style={{...invoiceStyle.tr,  width: '30%'}}>
                                                        <Text>{`${orderItem.product.product_name} ${orderItem.product.variant}`}</Text>
                                                    </View>
                                                    <View style={{...invoiceStyle.tr, width: '23.3%'}}>
                                                        <Text>{Number(orderItem.quantity)}</Text>
                                                    </View>
                                                    <View style={{...invoiceStyle.tr, width: '23.3%'}}>
                                                        <Text>{formatedNumber.format(orderItem.sell_price)}</Text>
                                                    </View>
                                                    <View style={{...invoiceStyle.tr, width: '23.3%'}}>
                                                        <Text>{formatedNumber.format((Number(orderItem.quantity) * Number(orderItem.sell_price)))}</Text>
                                                    </View>
                                                    {/* {index == 0 ? 
                                                    (
                                                        <View style={{...invoiceStyle.tr, width: '14.7%'}}>
                                                            <Text>{formatedNumber.format(Number(order.grandtotal))}</Text>
                                                        </View>
                                                    ):""}
                                                    {index == 0 ? 
                                                    (
                                                        <View style={{...invoiceStyle.tr, width: '14.2%'}}>
                                                            <Text>{order.dg_report_order_payments ? 
                                                            formatedNumber.format(Number(order.dg_report_order_payments[0].amount_paid))
                                                            : formatedNumber.format(0)}</Text>
                                                        </View>
                                                    ):""}
                                                    {index == 0 ? 
                                                    (
                                                        <View style={{...invoiceStyle.tr, width: '14%'}}>
                                                            <Text>{formatedNumber.format((Number(order.grandtotal) - Number(order.dg_report_order_payments[0].amount_paid)))}</Text>
                                                        </View>
                                                    ):""} */}
                                                </View>
                                                </>
                                                )
                                            })}
                                        </View>
                                    </View>
                                    <View style={{...invoiceStyle.tableEndNote1, justifyContent:'flex-start', paddingHorizontal: '75px'}}>
                                        <View style={{width: '77%', textAlign: 'left', fontWeight: 600}}><Text>total order</Text></View>
                                        <View style={{width: '23%', fontWeight: 600}}>
                                            <Text>{formatedNumber.format(Number(order.grandtotal))}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={{...invoiceStyle.tableEndNote1, justifyContent:'flex-start', paddingHorizontal: '75px'}}>
                                        <View style={{width: '77%', textAlign: 'left', fontWeight: 600}}><Text>total bayar</Text></View>
                                        <View style={{width: '23%', fontWeight: 600}}>
                                            <Text>{order.dg_report_order_payments ? 
                                                            formatedNumber.format(Number(order.dg_report_order_payments[0].amount_paid))
                                                            : formatedNumber.format(0)}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={{...invoiceStyle.tableEndNote1, justifyContent:'flex-start', paddingHorizontal: '75px'}}>
                                        <View style={{width: '77%', textAlign: 'left', fontWeight: 600}}><Text>sisa pembayaran</Text></View>
                                        <View style={{width: '23%', fontWeight: 600}}>
                                            <Text>{formatedNumber.format((Number(order.grandtotal) - Number(order.dg_report_order_payments[0].amount_paid)))}
                                            </Text>
                                        </View>
                                    </View>
                                {idx == data?.delivery_group_report?.delivery_group_report_orders?.length-1 ? 
                                    (
                                        <>
                                        <View style={{...invoiceStyle.tableEndNote2, paddingHorizontal: '75px'}}>
                                            <View style={{width: '77%',textAlign: 'left', fontWeight: 600}}><Text>total seluruh pengantaran</Text></View>
                                            <View style={{width: '23%', fontWeight: 600}}>
                                                <Text>{formatedNumber.format(data?.totalValueOutConfirmed)}</Text>
                                            </View>
                                        </View>
                                        <View style={{...invoiceStyle.tableEndNote2, paddingHorizontal: '75px'}}>
                                            <View style={{width: '77%',textAlign: 'left',fontWeight: 600}}><Text>total sudah melakukan pembayaran</Text></View>
                                            <View style={{width: '23%', fontWeight: 600}}>
                                                <Text>{formatedNumber.format(data?.reportTotalPaid)}</Text>
                                            </View>
                                        </View>
                                        <View style={{...invoiceStyle.tableEndNote2, paddingHorizontal: '75px'}}>
                                            <View style={{width: '77%',textAlign: 'left', fontWeight: 600}}><Text>total belum melakukan pembayaran</Text></View>
                                            <View style={{width: '23%', fontWeight: 600}}>
                                                <Text>{formatedNumber.format((Number(data?.totalValueOutConfirmed) - Number(data?.reportTotalPaid)))}</Text>
                                            </View>
                                        </View>
                                        
                                        </>
                                    )
                                    :""} 
                                    
                                </View>
                            </View>
                            )
                        })}
                    </View>
                </View>

                {/* FOOTER */}
                <View style={invoiceStyle.footer}>
                    {/* <Text>Thank you for your business!</Text> */}
                </View>
            </Page>
        </Document>
    )
}