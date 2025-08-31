import React, { useEffect, useState } from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'; 
import ConvertDate from '../assets/js/ConvertDate.js';
import Logo from "../assets/images/Logo_WA-removebg-preview.png";
import NumberFormat from '../elements/Masking/NumberFormat.jsx';


const receiptStyle = StyleSheet.create({
    page: {
        backgroundColor: '#ffffff',
        padding: 32,
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
        marginBottom: '56px'
    },
    headerCompany: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
    },
    companyImg: {
        width: '230px',
        height: '230px',
        marginTop: -10,
        marginBottom: '20px',
        alignSelf: 'flex-start',
        marginLeft: '12px',
    },
    logoImg: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    companyProfile:{
        display: 'flex',
        flexDirection: 'column'
    },
    profileText: {
        color: '#929292',
        fontWeight: 500,
        fontSize: '40px',
        textTransform: 'capitalize',
    },
    invoiceContent: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent:'space-between',
        paddingVertical: '98px',
        width: '100%',
        marginBottom: '24px'
    },
    InvAmount: {
        display: 'flex',
        flexDirection: 'row',
        gap: '20px',
        flexWrap :'wrap'
    },
    custInfo: {
        width:'30%',
        alignSelf: 'flex-start'
    },  
    cardAmount :{
        // minWidth: '490px',
        width: 33.3,
        height: '300px',
        backgroundColor: '#F5F6F9',
        textAlign: 'center',
        paddingVertical: '100px',
        paddingHorizontal: '50px',
    },
    cardAmountHighlight: {
        minWidth: '490px',
        height: '300px',
        backgroundColor: '#42C0FB',
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
        marginBottom: '15px',
    },
    cardInfoHighlightLabel: {
        color: '#ffffff',
        fontWeight: 700,
        fontSize: '40px',
        alignSelf:'center',
        marginBottom: '16px',
    },
    cardInfoHighlightText: {
        color: '#ffffff',
        fontWeight: 700,
        fontSize: '40px',
        alignSelf:'center',
    },
    cardInfoText: {
        color: '#344050',
        fontWeight: 700,
        fontSize: '40px',
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
        height: 'auto'
        
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
        paddingVertical: '36px',
        // flexBasis: 'auto'
    },
    tbody: {
        width: '100%',
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
        paddingVertical: '36px',
        backgroundColor: '#F5F6F9',
        color: '#344050',
    },
    footer: {
        width: '90%',
        paddingVertical: '28px',
        paddingHorizontal: '75px',
        backgroundColor: '#42C0FB',
        color: '#ffffff',
        fontSize: '38px',
        fontWeight: 600,
        position:'absolute',
        bottom: 22,
        left: 32,
        right: 32,
    }

    
})
const invoiceStyle = StyleSheet.create({
    page: {
        backgroundColor: '#ffffff',
        padding: 32,
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
        backgroundColor: '#42c0fb',
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
        marginBottom: 24
    },
    custInfo:{
        width: '30%',
        textAlign:'left',
        marginTop: -24,
        flexWrap:'wrap'
    },  
    cardAmount :{
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
        backgroundColor: '#42C0FB',
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
        backgroundColor: '#42C0FB',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        width: '38%',
        paddingVertical: '45px',
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
        height: 'auto'
        
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
        paddingVertical: '36px',
        // flexBasis: 'auto'
    },
    tbody: {
        width: '100%',
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
        paddingVertical: '36px',
        backgroundColor: '#F5F6F9',
        color: '#344050',
    },
    footer: {
        width: '90%',
        paddingVertical: '28px',
        paddingHorizontal: '75px',
        backgroundColor: '#42C0FB',
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

export default function ReceiptDoc({data, ref}) {
    console.log(data)
    const [ orderData, setOrderData ] = useState(data ? data.order : []);
    const [ paymentData, setPaymentData ] = useState(data ? data.payment : []);
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
        // <Document ref={ref}>
        //     <Page 
        //         size="A4" 
        //         style={receiptStyle.page}
        //         wrap={true}
        //         dpi={300}
        //         // orientation='potrait'
        //     >
        //         <View style={receiptStyle.header}>
        //             <View style={receiptStyle.headerDetail}>
        //                 <Text style={receiptStyle.headerTitle}>tanda terima</Text>
        //                 <View style={receiptStyle.headerInfo}>
        //                     <Text style={receiptStyle.infoLabel}>Nomor invoice</Text>
        //                     <Text style={{...receiptStyle.infoText, textTransform: 'uppercase'}}>{`#${data.invoice.invoice_number}`}</Text>
        //                 </View>
        //                 <View style={{display: 'flex', flexDirection:'row', gap:'64px'}}>
        //                     <View style={receiptStyle.headerInfo}>
        //                         <Text style={receiptStyle.infoLabel}>Tanggal</Text>
        //                         <Text style={receiptStyle.infoText}>{ConvertDate.convertToBeautyDate(data.invoice.invoice_date)}</Text>
        //                     </View>
        //                     <View style={receiptStyle.headerInfo}>
        //                         <Text style={receiptStyle.infoLabel}>Jatuh Tempo</Text>
        //                         <Text style={receiptStyle.infoText}>{ConvertDate.convertToBeautyDate(data.invoice.invoice_due)}</Text>
        //                     </View>
        //                 </View>
        //             </View>
        //             <View style={receiptStyle.headerCompany}>
        //                 <View style={receiptStyle.companyImg}>
        //                     <Image source={imageUrl} style={receiptStyle.logoImg} />
        //                 </View>
        //                 <View style={receiptStyle.companyProfile}>
        //                     <Text style={receiptStyle.profileText}>tahu tempe tauge</Text>
        //                     <Text style={receiptStyle.profileText}>+628123456789</Text>
        //                     <Text style={receiptStyle.profileText}>pangururan, samosir</Text>
        //                 </View>
        //             </View>
        //         </View>
        //         <View style={receiptStyle.invoiceContent}>
        //             <View style={receiptStyle.custInfo}>
        //                 <View style={receiptStyle.infoGroup}>
        //                     <Text style={receiptStyle.infoLabel}>Nama pelanggan</Text>
        //                     <Text style={receiptStyle.infoText}>Bang Paska Aritonang</Text>
        //                 </View>
        //                 <View style={{...receiptStyle.infoGroup, width: 'auto'}}>
        //                     <Text style={receiptStyle.infoLabel}>status</Text>
        //                     {
        //                         data.invoice.is_paid ?
        //                         (
        //                             <View style={receiptStyle.badgeSuccess}>
        //                                 <Text style={receiptStyle.badgeText}>lunas</Text>
        //                             </View>
        //                         ) :
        //                         (
        //                             <View style={receiptStyle.badgeDanger}>
        //                                 <Text style={receiptStyle.badgeText}>belum lunas</Text>
        //                             </View>
        //                         )
        //                     }
        //                     {/* <View className={`badge badge-${data.invoice.is_paid ? 'success' : 'danger'} light`}>{data.invoice.is_paid ? 'lunas' : 'belum lunas'}</View> */}
        //                 </View>
        //             </View>
        //             <View style={receiptStyle.InvAmount}>
        //                 <View style={receiptStyle.cardAmount}>
        //                     <View style={receiptStyle.infoGroup}>
        //                         <Text style={receiptStyle.cardInfoLabel}>Total transaksi</Text>
        //                         <Text style={receiptStyle.cardInfoText}>{formatedNumber.format(data.invoice.amount_due)}</Text>
        //                     </View>
        //                 </View>
        //                 <View style={receiptStyle.cardAmount}>
        //                     <View style={receiptStyle.infoGroup}>
        //                         <Text style={receiptStyle.cardInfoLabel}>Total Bayar</Text>
        //                         <Text style={receiptStyle.cardInfoText}>{formatedNumber.format(totalPaid)}</Text>
        //                     </View>
        //                 </View>
        //                 <View style={receiptStyle.cardAmountHighlight}>
        //                     <View style={receiptStyle.infoGroup}>
        //                         <Text style={receiptStyle.cardInfoHighlightLabel}>jumlah yang harus dibayar</Text>
        //                         <Text style={receiptStyle.cardInfoHighlightText}>{
        //                             totalPaid == 0 ? formatedNumber.format(data.invoice.amount_due) 
        //                             : ((totalPaid - data.invoice.amount_due) > 0 ? formatedNumber.format(0) 
        //                             :formatedNumber.format((data.invoice.amount_due - totalPaid)))
        //                         }</Text>
        //                     </View>
        //                 </View>
        //             </View>
        //         </View>
        //         <View style={receiptStyle.invTransaction}>
        //             <View style={{ marginBottom: '132px',}}>
        //                <Text style={receiptStyle.invTableTitle}>detail transaksi</Text>
        //                 {data.order ? (data.order.map((sales, idx) => {
        //                     return(
        //                     <View style={receiptStyle.table} key={`transaction-table-${idx}`}>
        //                         <View style={receiptStyle.thead}>
        //                             <View style={receiptStyle.rowHead}>
        //                                 <View style={{...receiptStyle.th, width: '13.4%'}}><Text>tanggal</Text></View>
        //                                 <View style={{...receiptStyle.th, width: '27.7%' }}><Text>item</Text></View>
        //                                 <View style={{...receiptStyle.th, width: '9.3%'}}><Text>qty</Text></View>
        //                                 <View style={{...receiptStyle.th, width: '14.8%'}}><Text>satuan</Text></View>
        //                                 <View style={{...receiptStyle.th, width: '19.1%'}}><Text>diskon/item</Text></View>
        //                                 <View style={{...receiptStyle.th, width: '15.3%'}}><Text>jumlah</Text></View>
        //                             </View>
        //                         </View>
        //                         <View style={{...receiptStyle.tbody}}>
        //                             <View style={{...receiptStyle.rowBody, width: '100%', }}>
        //                                 <View style={{height: '100%', paddingLeft:'75px', width: '12.6%', ...receiptStyle.trBorder, justifyContent: 'center'}}>
        //                                     <Text style={{ color: '#344050',fontWeight: 600}}>{ConvertDate.convertToFullDate(sales.order_date,"/")}</Text>
        //                                 </View>
        //                                 <View style={{width: '87.4%',...receiptStyle.trBorder, paddingLeft:'75px'}}>
        //                                 {sales.order_items.length > 0 && sales.order_items.map((orderItem, index) => {
        //                                     return( 
        //                                         <>
        //                                         <View style={{...receiptStyle.td, paddingRight:'75px', 
        //                                             borderBottom: index == sales.order_items.length - 1 ?  0 : '2.25px', 
        //                                             borderStyle: index == sales.order_items.length - 1 ? 'none': 'solid' ,  
        //                                             borderColor: index == sales.order_items.length - 1 ? 'none' : '#EBF1F6'}}
        //                                         >
        //                                             <View style={{...receiptStyle.tr,  width: '33%'}}>
        //                                                 <Text>{`${orderItem.product.product_name} ${orderItem.product.variant}`}</Text>
        //                                             </View>
        //                                             <View style={{...receiptStyle.tr, width: '9.8%'}}>
        //                                                 <Text>{Number(orderItem.quantity)}</Text>
        //                                             </View>
        //                                             <View style={{...receiptStyle.tr, width: '17.1%'}}>
        //                                                 <Text>{formatedNumber.format(orderItem.sell_price)}</Text>
        //                                             </View>
        //                                             <View style={{...receiptStyle.tr, width: '22%'}}>
        //                                                 <View style={{display: 'flex', flexDirection: 'row', gap: '12px'}}>
        //                                                     {orderItem.discount_prod_rec == 0 ? 
        //                                                     (
        //                                                         <Text>{formatedNumber.format(orderItem.discount_prod_rec)}</Text>
        //                                                     ):(
        //                                                         <>
        //                                                         <Text>{formatedNumber.format(orderItem.discount_prod_rec)}</Text>
        //                                                         <Text style={{textTransform: 'lowercase'}}>{`(x${Number(orderItem.quantity)})`}</Text>
        //                                                         </>

        //                                                     )}
        //                                                 </View>
        //                                             </View>
        //                                             <View style={{...receiptStyle.tr, width: '14.9%',}}>
        //                                                 <Text>{formatedNumber.format((Number(orderItem.quantity) * Number(orderItem.sell_price) - (Number(orderItem.quantity)*orderItem.discount_prod_rec)))}</Text>
        //                                             </View>
        //                                         </View>
        //                                         </>
        //                                     )
        //                                 })}
        //                                 </View>
        //                             </View>
        //                             <View style={{...receiptStyle.tableEndNote1}}>
        //                                 <View style={{textAlign: 'right', minWidth: '17.9%'}}><Text>diskon order</Text></View>
        //                                 <View style={{width: '18%'}}><Text>{formatedNumber.format(sales.order_discount)}</Text></View>
        //                             </View>
        //                                 <View style={{...receiptStyle.tableEndNote1}}>
        //                                 <View style={{textAlign: 'right', minWidth: '17.9%', fontWeight: 600}}><Text>total order</Text></View>
        //                                 <View style={{width: '18%', fontWeight: 600}}><Text>{formatedNumber.format(sales.grandtotal)}</Text></View>
        //                             </View>
        //                             {idx == data.order.length-1 ? 
        //                                 (
        //                                 <View style={{...receiptStyle.tableEndNote2}}>
        //                                     <View style={{textAlign: 'right', minWidth: '17.9%', fontWeight: 600}}><Text>total transaksi</Text></View>
        //                                     <View style={{width: '18%', fontWeight: 600}}><Text>{formatedNumber.format(data.invoice.amount_due)}</Text></View>
        //                                 </View>
        //                                 )
        //                             :""} 
                                    
        //                         </View>
        //                     </View>
        //                     )
        //                 })):""}
        //             </View>
        //             {data.payment.length > 0 ? 
        //                 (
        //                 <View style={{ marginBottom: '50px',}}>
        //                     <Text style={receiptStyle.invTableTitle}>detail pembayaran</Text>
        //                     {data.payment ? (data.payment.map((pay, idx) => {
        //                         return(
        //                         <View style={receiptStyle.table} key={`payment-table-${idx}`}>
        //                             <View style={receiptStyle.thead}>
        //                                 <View style={receiptStyle.rowHead}>
        //                                     <View style={{...receiptStyle.th, width: '17%'}}><Text>tanggal</Text></View>
        //                                     <View style={{...receiptStyle.th, width: '48.2%' }}><Text>catatan</Text></View>
        //                                     <View style={{...receiptStyle.th, width: '19.2%'}}><Text>metode</Text></View>
        //                                     <View style={{...receiptStyle.th, width: '15.6%'}}><Text>jumlah</Text></View>
        //                                 </View>
        //                             </View>
        //                             <View style={{...receiptStyle.tbody}}>
        //                                 <View style={{...receiptStyle.rowBody, width: '100%', }}>
        //                                     <View style={{width: '100%',...receiptStyle.trBorder, paddingLeft:'75px'}}>
        //                                         <View style={{...receiptStyle.td, paddingRight:'75px'}}>
        //                                             <View style={{...receiptStyle.tr,  width: '17%'}}>
        //                                                 <Text style={{ color: '#344050',fontWeight: 600}}>{ConvertDate.convertToFullDate(pay.payment_date,"/")}</Text>
        //                                             </View>
        //                                             <View style={{...receiptStyle.tr,  width: '48.2%'}}>
        //                                                 <Text>{pay.note == '' || pay.note == null ? '-' : pay.note}</Text>
        //                                             </View>
        //                                             <View style={{...receiptStyle.tr, width: '19.2%'}}>
        //                                                 <Text>{pay.payment_method}</Text>
        //                                             </View>
        //                                             <View style={{...receiptStyle.tr, width: '15.6%', alignSelf:'flex-end'}}>
        //                                                 <Text>{formatedNumber.format(pay.amount_paid)}</Text>
        //                                             </View>
        //                                         </View>
        //                                     </View>
        //                                 </View>
                                            
        //                                 {idx == data.payment.length-1 ? 
        //                                     (
        //                                         <View style={{...receiptStyle.tableEndNote2}}>
        //                                             <View style={{textAlign: 'right', minWidth: '17.9%', fontWeight: 600}}><Text>total bayar</Text></View>
        //                                             <View style={{width: '18%', fontWeight: 600}}><Text>{formatedNumber.format(totalPaid)}</Text></View>
        //                                         </View>
        //                                     )
        //                                 :""} 
                                        
        //                             </View>
        //                         </View>
        //                         )
        //                     })):""}

        //                 </View>
        //                 )
        //                 :''
        //             }
        //         </View>


        //         {/* FOOTER */}
        //         <View style={receiptStyle.footer}>
        //             <Text>Thank you for your business!</Text>
        //         </View>
        //     </Page>
        // </Document>
        <Document ref={ref}>
            <Page 
                size="A4" 
                style={invoiceStyle.page}
                wrap={true}
                dpi={300}
                // orientation='potrait'
            >
                <View style={invoiceStyle.header}>
                    <View style={receiptStyle.headerDetail}>
                    <Text style={receiptStyle.headerTitle}>tanda terima</Text>
                    <View style={receiptStyle.headerInfo}>
                        <Text style={receiptStyle.infoLabel}>Tanggal</Text>
                        <Text style={receiptStyle.infoText}>{ConvertDate.convertToBeautyDate(data.invoice?.invoice_date)}</Text>
                    </View>
                    <View style={{display: 'flex', flexDirection:'row', gap:'64px'}}>
                        <View style={receiptStyle.headerInfo}>
                            <Text style={receiptStyle.infoLabel}>Nomor receipt</Text>
                            <Text style={receiptStyle.infoText}>{data.receipt.receipt_id}</Text>
                        </View>
                        <View style={receiptStyle.headerInfo}>
                            <Text style={receiptStyle.infoLabel}>Nomor invoice</Text>
                            <Text style={{...receiptStyle.infoText, textTransform: 'uppercase'}}>{`#${data.invoice?.invoice_number}`}</Text>
                        </View>
                    </View>
                </View>
                    <View style={invoiceStyle.headerCompany}>
                        <View style={invoiceStyle.companyImg}>
                            <Image source={imageUrl} style={invoiceStyle.logoImg} />
                        </View>
                        <View style={invoiceStyle.companyProfile}>
                            <Text style={invoiceStyle.profileText1}>tahu tempe tauge</Text>
                            <Text style={invoiceStyle.profileText2}>+628123456789</Text>
                            <Text style={invoiceStyle.profileText2}>pangururan, samosir</Text>
                        </View>
                    </View>
                </View>
                <View style={invoiceStyle.invoiceContent}>
                    <View style={{...invoiceStyle.custInfo}}>
                        <View style={{...invoiceStyle.infoGroup, textAlign:'left'}}>
                            <Text style={invoiceStyle.infoLabel}>Nama pelanggan</Text>
                            <Text style={invoiceStyle.infoText}>Bang Paska Aritonang</Text>
                        </View>
                        <View style={{...invoiceStyle.infoGroup, textAlign:'left'}}>
                            <Text style={invoiceStyle.infoLabel}>status</Text>
                                <View style={invoiceStyle.badgeSuccess}>
                                    <Text style={invoiceStyle.badgeText}>lunas</Text>
                                </View>
                        </View>
                    </View>
                    <View style={invoiceStyle.InvAmount}>
                        <View style={invoiceStyle.cardAmount}>
                            <View style={invoiceStyle.infoGroup}>
                                <Text style={invoiceStyle.cardInfoLabel}>Total transaksi</Text>
                                <Text style={invoiceStyle.cardInfoText}>{formatedNumber.format(Number(data.invoice.amount_due))}</Text>
                            </View>
                        </View>
                        <View style={invoiceStyle.cardAmount}>
                            <View style={invoiceStyle.infoGroup}>
                                <Text style={invoiceStyle.cardInfoLabel}>Total Bayar</Text>
                                <Text style={invoiceStyle.cardInfoText}>{formatedNumber.format(totalPaid)}</Text>
                            </View>
                        </View>
                        <View style={invoiceStyle.cardAmountHighlight}>
                            <View style={invoiceStyle.infoGroup}>
                                <Text style={invoiceStyle.cardInfoHighlightLabel}>kembali</Text>
                                <Text style={invoiceStyle.cardInfoHighlightText}>
                                    {formatedNumber.format(Number(data.receipt.change))}
                                </Text>
                            </View>
                        </View>
                    </View>
                    
                </View>
                <View style={invoiceStyle.invTransaction}>
                    <View style={{ marginBottom: '132px',}}>
                        <Text style={invoiceStyle.invTableTitle}>detail transaksi</Text>
                        {data.order ? (data.order.map((sales, idx) => {
                            return(
                            <View style={invoiceStyle.table} key={`transaction-table-${idx}`}>
                                <View style={invoiceStyle.orderNumberTab}>
                                    <View style={{...invoiceStyle.orderNumberTabText}}><Text>order ID: {sales.order_id}</Text></View>
                                </View>
                                <View style={invoiceStyle.thead}>
                                    <View style={invoiceStyle.rowHead}>
                                        <View style={{...invoiceStyle.th, width: '13.2%'}}><Text>tanggal</Text></View>
                                        <View style={{...invoiceStyle.th, width: '30%' }}><Text>item</Text></View>
                                        <View style={{...invoiceStyle.th, width: '9.5%'}}><Text>qty</Text></View>
                                        <View style={{...invoiceStyle.th, width: '15%'}}><Text>satuan</Text></View>
                                        <View style={{...invoiceStyle.th, width: '17%'}}><Text>diskon/item</Text></View>
                                        <View style={{...invoiceStyle.th, width: '15.3%'}}><Text>jumlah</Text></View>
                                    </View>
                                </View>
                                <View style={{...invoiceStyle.tbody}}>
                                    <View style={{...invoiceStyle.rowBody, width: '100%', }}>
                                        <View style={{height: '100%', paddingLeft:'75px', width: '12%', ...invoiceStyle.trBorder, justifyContent: 'center'}}>
                                            <Text style={{ color: '#344050',fontWeight: 600}}>{ConvertDate.convertToFullDate(sales.order_date,"/")}</Text>
                                        </View>
                                        <View style={{width: '88%',...invoiceStyle.trBorder, paddingLeft:'75px'}}>
                                        {sales.order_items.length > 0 && sales.order_items.map((orderItem, index) => {
                                            return( 
                                                <>
                                                <View style={{...invoiceStyle.td, paddingRight:'67px', 
                                                    borderBottom: index == sales.order_items.length - 1 ?  0 : '2.25px', 
                                                    borderStyle: index == sales.order_items.length - 1 ? 'none': 'solid' ,  
                                                    borderColor: index == sales.order_items.length - 1 ? 'none' : '#EBF1F6'}}
                                                >
                                                    <View style={{...invoiceStyle.tr,  width: '34.8%'}}>
                                                        <Text>{`${orderItem.product.product_name} ${orderItem.product.variant}`}</Text>
                                                    </View>
                                                    <View style={{...invoiceStyle.tr, width: '11%'}}>
                                                        <Text>{orderItem.return_order_item ? 
                                                            `${Number(orderItem.quantity)} (-${Number(orderItem.return_order_item.quantity)})`
                                                            : `${Number(orderItem.quantity)}`
                                                            }
                                                        </Text>
                                                    </View>
                                                    <View style={{...invoiceStyle.tr, width: '17.5%'}}>
                                                        <Text>{formatedNumber.format(orderItem.sell_price)}</Text>
                                                    </View>
                                                    <View style={{...invoiceStyle.tr, width: '19%'}}>
                                                        <View style={{display: 'flex', flexDirection: 'row', gap: '12px'}}>
                                                            {orderItem.discount_prod_rec == 0 ? 
                                                            (
                                                                <Text>{formatedNumber.format(orderItem.discount_prod_rec)}</Text>
                                                            ):(
                                                                <>
                                                                <Text>{formatedNumber.format(orderItem.discount_prod_rec)}</Text>
                                                                <Text style={{textTransform: 'lowercase'}}>{`(x${Number(orderItem.quantity)})`}</Text>
                                                                </>

                                                            )}
                                                        </View>
                                                    </View>
                                                    <View style={{...invoiceStyle.tr, width: '14.9%',}}>
                                                        <Text>{orderItem.return_order_item ? 
                                                            (formatedNumber.format(((Number(orderItem.quantity) - Number(orderItem.return_order_item.quantity)) * Number(orderItem.sell_price)) - ((Number(orderItem.quantity) - Number(orderItem.return_order_item.quantity))*orderItem.discount_prod_rec))) 
                                                            : formatedNumber.format((((Number(orderItem.quantity) * Number(orderItem.sell_price)) - (Number(orderItem.quantity)*orderItem.discount_prod_rec))))}
                                                        </Text>
                                                    </View>
                                                </View>
                                                </>
                                            )
                                        })}
                                        {sales.orders_credit && sales.orders_credit.return_order.return_order_items.map((roItem, roItemIdx) => { 
                                            return( 
                                                <>
                                                <View style={{...invoiceStyle.td, paddingRight:'67px', 
                                                    borderBottom: roItemIdx == sales.order_items.length - 1 ?  0 : '2.25px', 
                                                    borderStyle: roItemIdx == sales.order_items.length - 1 ? 'none': 'solid' ,  
                                                    borderColor: roItemIdx == sales.order_items.length - 1 ? 'none' : '#EBF1F6'}}
                                                >
                                                    <View style={{...invoiceStyle.tr,  width: '34.8%'}}>
                                                        <Text>{`+${roItem.order_item.product.product_name}  ${roItem.order_item.product.variant}`}</Text>
                                                    </View>
                                                    <View style={{...invoiceStyle.tr, width: '11%'}}>
                                                        <Text>{Number(roItem.quantity)}</Text>
                                                    </View>
                                                    <View style={{...invoiceStyle.tr, width: '17.5%'}}>
                                                        <Text>{formatedNumber.format(roItem.order_item.sell_price)}</Text>
                                                    </View>
                                                    <View style={{...invoiceStyle.tr, width: '19%'}}>
                                                        <View style={{display: 'flex', flexDirection: 'row', gap: '12px'}}>
                                                            <Text>{formatedNumber.format(roItem.order_item.discount_prod_rec)}</Text>
                                                            {/* <Text style={{textTransform: 'lowercase'}}>{`(x${Number(orderItem.quantity)})`}</Text> */}
                                                        </View>
                                                    </View>
                                                    <View style={{...invoiceStyle.tr, width: '14.9%',}}>
                                                        <Text>{formatedNumber.format(roItem.return_value)}</Text>
                                                    </View>
                                                </View>
                                                </>
                                            )
                                        })}
                                        </View>
                                    </View>
                                    {Number(sales.order_discount) !== 0 ? 
                                    (
                                    <View style={{...invoiceStyle.tableEndNote1}}>
                                        <View style={{textAlign: 'right', minWidth: '17.9%'}}><Text>diskon order</Text></View>
                                        <View style={{width: '18%'}}><Text>{formatedNumber.format(sales.order_discount)}</Text></View>
                                    </View>

                                    ):''}
                                    <View style={{...invoiceStyle.tableEndNote1}}>
                                        <View style={{textAlign: 'right', marginRight:24, fontWeight: 600}}><Text>total order</Text></View>
                                        <View style={{width: '17.8%', fontWeight: 600}}>
                                            <Text>{formatedNumber.format(Number(sales.grandtotal) + (sales.orders_credit ? (Number(sales.orders_credit.return_order.refund_total)):0) - (sales.return_order ? (Number(sales.return_order.refund_total)):0))}
                                            </Text>
                                        </View>
                                    </View>
                                    {idx == data.order.length-1 ? 
                                        (
                                        <View style={{...invoiceStyle.tableEndNote2}}>
                                            <View style={{textAlign: 'right', fontWeight: 600, marginRight:24}}><Text>total seluruh transaksi</Text></View>
                                            <View style={{width: '17.8%', fontWeight: 600}}><Text>{formatedNumber.format(Number(data.invoice.amount_due))}</Text></View>
                                        </View>
                                        )
                                    :""} 
                                    
                                </View>
                            </View>
                            )
                        })):""}
                    </View>
                    {data.payment?.length > 0 ? 
                        (
                        <View style={{ marginBottom: '132px',}}>
                            <Text style={invoiceStyle.invTableTitle}>detail pembayaran</Text>
                            {data.payment ? (data.payment.map((pay, idx) => {
                                return(
                                <View style={invoiceStyle.table} key={`payment-table-${idx}`}>
                                    <View style={invoiceStyle.thead}>
                                        <View style={invoiceStyle.rowHead}>
                                            <View style={{...invoiceStyle.th, width: '17%'}}><Text>tanggal</Text></View>
                                            <View style={{...invoiceStyle.th, width: '48.2%' }}><Text>catatan</Text></View>
                                            <View style={{...invoiceStyle.th, width: '19.2%'}}><Text>metode</Text></View>
                                            <View style={{...invoiceStyle.th, width: '15.6%'}}><Text>jumlah</Text></View>
                                        </View>
                                    </View>
                                    <View style={{...invoiceStyle.tbody}}>
                                        <View style={{...invoiceStyle.rowBody, width: '100%', }}>
                                            <View style={{width: '100%',...invoiceStyle.trBorder, paddingLeft:'75px'}}>
                                                <View style={{...invoiceStyle.td, paddingRight:'75px'}}>
                                                    <View style={{...invoiceStyle.tr,  width: '17%'}}>
                                                        <Text style={{ color: '#344050',fontWeight: 600}}>{ConvertDate.convertToFullDate(pay.payment_date,"/")}</Text>
                                                    </View>
                                                    <View style={{...invoiceStyle.tr,  width: '48.2%'}}>
                                                        <Text>{pay.note == '' || pay.note == null ? '-' : pay.note}</Text>
                                                    </View>
                                                    <View style={{...invoiceStyle.tr, width: '19.2%'}}>
                                                        <Text>{pay.payment_method}</Text>
                                                    </View>
                                                    <View style={{...invoiceStyle.tr, width: '15.6%', alignSelf:'flex-end'}}>
                                                        <Text>{formatedNumber.format(pay.amount_paid)}</Text>
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                            
                                        {idx == data.payment.length-1 ? 
                                            (
                                                <View style={{...invoiceStyle.tableEndNote2}}>
                                                    <View style={{textAlign: 'right', minWidth: '17.9%', fontWeight: 600}}><Text>total bayar</Text></View>
                                                    <View style={{width: '18%', fontWeight: 600}}><Text>{formatedNumber.format(totalPaid)}</Text></View>
                                                </View>
                                            )
                                        :""} 
                                        
                                    </View>
                                </View>
                                )
                            })):""}

                        </View>
                        )
                        :''
                    }
                </View>
                {data.ro && data.ro.length > 0 ? 
                    (
                    <View style={invoiceStyle.invTransaction} break={true}>
                        <Text style={invoiceStyle.invTableTitle}>detail pengembalian</Text>
                        <Text style={{...invoiceStyle.tableDesc, ...invoiceStyle.infoText, fontWeight:500, textTransform:'none'}}>Detail pengembalian ini hanya untuk transparansi data. Seluruh data transaksi sudah mencakup data pengembalian yang ada.</Text>
                        {/* <div style={{width: '100%'}}> */}
                            {data.ro.map((ro, idx) => {
                                return(
                                    <>
                                    <View key={`return-table-${idx}`} >
                                        <View style={invoiceStyle.returnHeader}>
                                            <View style={invoiceStyle.returnHeaderInline}>
                                                <View style={invoiceStyle.returnHeaderText}>
                                                    <Text style={{fontWeight:600}}>order ID:</Text>
                                                    <Text>{ro.order.order_id}</Text>
                                                </View>    
                                                <View style={invoiceStyle.returnHeaderText}>
                                                    <Text style={{fontWeight:600}}>tanggal order:</Text>
                                                    <Text>{ConvertDate.convertToFullDate(ro.order.order_date,"/")}</Text>
                                                </View>    
                                                <View style={invoiceStyle.returnHeaderText}>
                                                    <Text style={{fontWeight:600}}>tanggal pengembalian:</Text>
                                                    <Text>{ConvertDate.convertToFullDate(ro.return_date,"/")}</Text>
                                                </View>
                                            </View>
                                            <View style={invoiceStyle.returnHeaderText}>
                                                <Text style={{fontWeight:600}}>Metode pengembalian:</Text>
                                                <Text>{ro.return_method}</Text>
                                            </View>
                                        </View>
                                        <View style={invoiceStyle.table} >
                                            <View style={invoiceStyle.thead}>
                                                <View style={invoiceStyle.rowHead}>
                                                    <View style={{...invoiceStyle.th, width: '4%'}}><Text>#</Text></View>
                                                    <View style={{...invoiceStyle.th, width: '27%' }}><Text>item</Text></View>
                                                    <View style={{...invoiceStyle.th, width: '4%'}}><Text>qty</Text></View>
                                                    <View style={{...invoiceStyle.th, width: '5%'}}><Text></Text></View>
                                                    <View style={{...invoiceStyle.th, width: '17%'}}><Text>pengembalian</Text></View>
                                                    <View style={{...invoiceStyle.th, width: '29%'}}><Text>Alasan pengembalian</Text></View>
                                                    <View style={{...invoiceStyle.th, width: '13%'}}><Text>jumlah</Text></View>
                                                </View>
                                            </View>
                                            <View style={{...invoiceStyle.tbody}}>
                                                {ro.return_order_items?.map((roItem, index) => {
                                                    return (
                                                        // <View style={{...invoiceStyle.rowBody, width: '100%', }}>
                                                        <>
                                                        <View style={{...invoiceStyle.td, paddingHorizontal:'65px', 
                                                            borderBottom: '2.25px', 
                                                            borderStyle: 'solid' ,  
                                                            borderColor: '#EBF1F6'}}
                                                        >
                                                            <View style={{...invoiceStyle.tr,  width: '4%'}}>
                                                                <Text>{index+1}</Text>
                                                            </View>
                                                            <View style={{...invoiceStyle.tr, width: '27.5%'}}>
                                                                <Text>{`${roItem.order_item.product.product_name}  ${roItem.order_item.product.variant}`}</Text>
                                                            </View>
                                                            <View style={{...invoiceStyle.tr, width: '4%'}}>
                                                                <Text>{ Number(roItem.order_item.quantity)}</Text>
                                                            </View>
                                                            <View style={{...invoiceStyle.tr, width: '5%', textAlign:'center'}}>
                                                                <Text>{'>'}</Text>
                                                            </View>
                                                            <View style={{...invoiceStyle.tr, width: '16.5%'}}>
                                                                <Text>{Number(roItem.quantity)}</Text>
                                                            </View>
                                                            <View style={{...invoiceStyle.tr, width: '29%',}}>
                                                                <Text>{roItem.reason}</Text>
                                                            </View>
                                                            <View style={{...invoiceStyle.tr, width: '13%',}}>
                                                                <Text>{formatedNumber.format(roItem.return_value)}</Text>
                                                            </View>
                                                        </View>
                                                        
                                                        {index == ro.return_order_items.length-1 ?
                                                            (
                                                            <View style={{...invoiceStyle.tableEndNote1}}>
                                                                <View style={{textAlign: 'right',marginRight:22, fontWeight: 600,}}><Text>total</Text></View>
                                                                <View style={{width: '16.1%', fontWeight: 600}}><Text>{formatedNumber.format(ro.refund_total)}</Text></View>
                                                            </View>
                                                            ):''
                                                        }
                                                        </>
                                                    )
                                                })}
                                                {idx == data.ro.length-1 ? 
                                                    (
                                                    <View style={{...invoiceStyle.tableEndNote2}}>
                                                        <View style={{textAlign: 'right', fontWeight: 600, marginRight:22}}><Text>total pengembalian</Text></View>
                                                        <View style={{width: '16.1%', fontWeight: 600}}><Text>{formatedNumber.format(ro.refund_total)}</Text></View>
                                                    </View>
                                                    )
                                                :""}
                                                {/* </View> */}
                                            </View>
                                            
                                        </View>
                                    </View>
                                </>
                                )
                            })}
                        {/* </div> */}
                    </View>
                    )
                    :''
                }

                


                {/* FOOTER */}
                <View style={invoiceStyle.footer}>
                    <Text>Thank you for your business!</Text>
                </View>
            </Page>
        </Document>
    )
}