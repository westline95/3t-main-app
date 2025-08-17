const paymentTypeList = [
    {
        id: 1, 
        type: "Lunas"
    }, 
    {
        id: 2, 
        type:"Belum Lunas"
    }, 
    {
        id: 3, 
        type: "Partial"
    }
];

const orderTypeList = [
    {
        id: 1, 
        type: "walk-in"
    }, 
    {
        id: 2, 
        type:"delivery"
    }, 
];


const statusInvList = [
    {
        id: 1, 
        type: "active"
    }, 
    {
        id: 2, 
        type:"publish"
    }, 
    // {
    //     id: 3, 
    //     type:"canceled"
    // },
];

const orderStatusList = [
    {
        id: 1, 
        type: "pending"
    }, 
    {
        id: 2, 
        type:"in-delivery"
    }, 
    {
        id: 3, 
        type:"completed"
    },
    {
        id: 4, 
        type:"canceled"
    },
];

const delivStatusList = [
    {
        id: 1, 
        type: "pending"
    }, 
    {
        id: 2, 
        type:"on-load"
    }, 
    {
        id: 3, 
        type:"in-delivery"
    },
    {
        id: 4, 
        type:"delivered"
    },
    {
        id: 5, 
        type:"canceled"
    },
];


const returnReasonList = [
    {
        id: 1, 
        type: "barang rusak saat diterima"
    }, 
    {
        id: 2, 
        type:"jumlah item tidak sesuai pesanan"
    }, 
    {
        id: 3, 
        type:"produk salah warna/ukuran/model"
    },
    {
        id: 4, 
        type:"double order"
    },
    {
        id: 5, 
        type:"tidak jadi beli"
    },
    {
        id: 6, 
        type:"salah beli tipe/fitur"
    }, 
    {
        id: 7, 
        type:"keterlambatan pengiriman dan pelanggan menolak menerima"
    },
    // {
    //     id: 8, 
    //     type:"lainnya"
    // },
];

const returnMethodWPaidStatus = [
    {
        id: 1, 
        type: 'pengembalian dana metode pembayaran asli'
    }, 
    {
        id: 2, 
        type: 'potong tagihan'
    },
    {
        id: 3, 
        type: 'tambahkan ke order berikutnya'
    }
];

const returnMethod = [ 
    {
        id: 2, 
        type: 'potong tagihan'
    },
    {
        id: 3, 
        type: 'tambahkan ke order berikutnya'
    }
];

const unitOfProduct = [
    {id: 1, type: "papan"},
    {id: 2, type: "pcs"},
    {id: 3, type: "kg"},
    {id: 4, type: "gr"},
];

const orderStatus = ['pending', 'completed', 'in-delivery' , 'canceled'];
const roStatus = ['pengecekan', 'disetujui', 'ditolak'];

const invPayMethod = [
    {
        id: 1, 
        type: 'cash'
    }, 
    {
        id: 2, 
        type: 'transfer'
    }
];

const returnOrderStatus = [
    {
        id: 1, 
        type: 'tunda',
        theme: 'secondary'
    }, 
    {
        id: 2, 
        type: 'dikonfirmasi',
        theme: 'success'
    },
    {
        id: 4, 
        type: 'batal',
        theme: 'danger'
    }
];

const orderPayMethod = [
    {
        id: 1, 
        type: "lunas"
    },
    {
        id: 2, 
        type: "belum bayar"
    },
    {
        id: 3, 
        type: "sebagian"
    }
];

const invStatus = [
    {id: 1, type: "paid"},{id: 2, type: "in-progress"},{id: 3, type: "due"}
];

export default {
    paymentTypeList,
    orderTypeList,
    orderStatusList,
    orderStatus,
    statusInvList,
    unitOfProduct,
    delivStatusList,
    returnReasonList,
    invPayMethod,
    orderPayMethod,
    returnMethodWPaidStatus,
    returnMethod,
    returnOrderStatus,
    roStatus,
    invStatus
};