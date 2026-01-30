import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import React, { useContext, useState, useEffect, useRef } from 'react';
import { Form, Input, InputNumber, Radio, Table, Typography, Button, Descriptions, Tag, Slider, Select, Tooltip, Space, Modal } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { ToastContainer, toast } from 'react-toastify';
import hexToColorName from "~/ultils/HexToColorName";
import { useDebounce } from '~/hooks';
import { AiOutlineCloseCircle } from "react-icons/ai";

import { fixMoney } from '~/ultils/fixMoney';
import { Timeline, TimelineEvent } from '@mailtop/horizontal-timeline';
import { FaBug, FaCheckCircle, FaRegFileAlt } from 'react-icons/fa';
import { LoadingOutlined } from '@ant-design/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoneyBill1, faCreditCard, faFileInvoice, faFilePdf, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import BillAddress from '~/components/BillAddress';
import BillPaymentHistory from '~/components/BillPaymentHistory';
import BillProducts from '~/components/BillProducts';
import BillProductsBack from '~/components/BillProductsBack';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useOrderData } from '~/provider/OrderDataProvider';
dayjs.extend(customParseFormat);
function BillDetail() {
    const { id } = useParams();
    const [bill, setBill] = useState(null);
    const [lstBillDetails, setLstBillDetails] = useState([]);
    const [lstBillDetailsReturn, setLstBillDetailsReturn] = useState([]);
    const { setDataLoadingContent } = useOrderData();

    const TrangThaiBill = {
        TAT_CA: '',
        TAO_DON_HANG: "-1",
        CHO_XAC_NHAN: "0",
        DA_XAC_NHAN: "1",
        CHO_GIA0: "2",
        DANG_GIAO: "3",
        HOAN_THANH: "4",
        DA_THANH_TOAN: "5",
        HUY: "6",
        TRA_HANG: "10",
        DANG_BAN: "7",
        CHO_THANH_TOAN: "8",
        HOAN_TIEN: "9",
        NEW: "New",
    }
    const BillType = {
        ONLINE: "0",
        OFFLINE: "1",
        DELIVERY: "2",
    }
    const fetchDataBill = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/v1/bill/show/' + id);
            setBill(response.data);
            console.log(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchDataBill();
    }, [id]);

    useEffect(() => {
        const billId = bill?.id;
        if (billId != null) {
            axios.get(`http://localhost:8080/api/v1/bill/show/${billId}/billdetails/products`)
                .then((res) => {
                    const data = res.data;
                    setLstBillDetails(data);
                })
                .catch((error) => {
                    console.error(error);
                });


        }
    }, [bill])

    useEffect(() => {
        const billId = bill?.id;
        if (billId != null) {
            axios.get(`http://localhost:8080/api/v1/bill/show/${billId}/billdetails/products/returns`)
                .then((res) => {
                    const data = res.data;
                    setLstBillDetailsReturn(data);
                })
                .catch((error) => {
                    console.error(error);
                });


        }
    }, [bill])

    const [isModalOpenAddress, setIsModalOpenAddress] = useState(false);
    const [isModalOpenConfirmRollback, setIsModalOpenConfirmRollback] = useState(false);
    const [isModalOpenConfirmAcceptOrder, setIsModalOpenConfirmAcceptOrder] = useState(false);
    const [isModalOpenConfirmWaitDelivery, setIsModalOpenConfirmWaitDelivery] = useState(false);
    const [isModalOpenConfirmDelivery, setIsModalOpenConfirmDelivery] = useState(false);
    const [isModalOpenConfirmCompletion, setIsModalOpenConfirmCompletion] = useState(false);
    const [isModalOpenTimelineDetails, setIsModalOpenTimelineDetails] = useState(false);
    const [isModalOpenCancelling, setIsModalOpenCancelling] = useState(false);
    const [confirmAcceptOrderDes, setConfirmAcceptOrderDes] = useState("")


    const [loadingConfirmRollback, setLoadingConfirmRollback] = useState(false);
    const [loadingConfirmAcceptOrder, setLoadingConfirmAcceptOrder] = useState(false);
    const [loadingConfirmWaitDelivery, setLoadingConfirmWaitDelivery] = useState(false);
    const [loadingConfirmDelivery, setLoadingConfirmDelivery] = useState(false);
    const [loadingConfirmCompletion, setLoadingConfirmCompletion] = useState(false);
    const [loadingCancelling, setLoadingCancelling] = useState(false);

    const showModalAddress = () => {
        setIsModalOpenAddress(true);
    };
    const handleCancelAddress = () => {
        setIsModalOpenAddress(false);
    };

    const handlePrintView = async () => {
        setDataLoadingContent(true)
        try {
            // Gọi API để lấy dữ liệu hóa đơn
            const response = await axios.get(`http://localhost:8080/api/v3/print/${bill?.codeBill}`, {
                responseType: 'arraybuffer', // Yêu cầu dữ liệu trả về dưới dạng mảng byte
            });

            // Tạo một Blob từ dữ liệu PDF
            const pdfBlob = new Blob([response.data], { type: 'application/pdf' });

            // Tạo một URL tạm thời từ Blob
            const pdfUrl = URL.createObjectURL(pdfBlob);

            // Tạo một iframe ẩn để hiển thị PDF và chuẩn bị cho việc in
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = pdfUrl;
            document.getElementById("printx").appendChild(iframe);

            // Đợi cho PDF load xong trước khi gọi hộp thoại in
            iframe.onload = function () {
                iframe.contentWindow.print();
                // Sau khi in, loại bỏ iframe khỏi DOM
                // setTimeout(() => {
                //     document.getElementById("printx").removeChild(iframe);
                //     URL.revokeObjectURL(pdfUrl);
                // }, 200);
            };

            // Tắt loading sau khi tạo iframe thành công
            setTimeout(() => {
                setDataLoadingContent(false)
            }, 1000);
        } catch (error) {
            console.error('Error:', error);
            // Đảm bảo tắt loading khi có lỗi
            setDataLoadingContent(false);
        }
    };



    // const handlePrintView = async () => {
    //     try {
    //         // Gọi API để lấy dữ liệu hóa đơn
    //         const response = await axios.get(`http://localhost:8080/api/v3/print/${bill?.codeBill}`, {
    //             responseType: 'arraybuffer', // Yêu cầu dữ liệu trả về dưới dạng mảng byte
    //         });
    //         // Đặt tên tệp Blob dựa trên bill.codeBill
    //         const pdfBlobName = `${bill?.codeBill}.pdf`;

    //         // Tạo một File từ dữ liệu PDF với tên là bill.codeBill
    //         const pdfFile = new File([response.data], `${bill?.codeBill}.pdf`, { type: 'application/pdf' });

    //         // Tạo URL tạm thời từ File
    //         const pdfUrl = URL.createObjectURL(pdfFile);
    //         // Mở chế độ xem in
    //         const printWindow = window.open(pdfUrl, '_blank');
    //         printWindow.addEventListener('unload', function () {
    //             window.focus();
    //         });
    //         printWindow.onload = function () {
    //             printWindow.print();
    //         };
    //     } catch (error) {
    //         console.error('Error:', error);
    //     }
    // };
    return (
        <>
            <div className='max-w-full'>
                <div>
                    <h3 style={{ color: '#1e3a8a' }}>
                        <FontAwesomeIcon icon={faFileInvoice} className='mr-2' />
                        <Link to="/bill" style={{ color: '#1e3a8a', textDecoration: 'none' }}>
                            <span style={{ cursor: 'pointer', borderBottom: '1px solid transparent', transition: 'border-bottom 0.2s' }}
                                onMouseEnter={(e) => e.target.style.borderBottom = '1px solid #1e3a8a'}
                                onMouseLeave={(e) => e.target.style.borderBottom = '1px solid transparent'}>
                                Quản lý hóa đơn
                            </span>
                        </Link>
                        {' / '}
                        <span style={{ fontSize: '14px', color: '#808080' }}>{bill?.codeBill}</span>
                    </h3>
                </div>
                <div className='px-4 pt-6 pb-5 mt-6 mb-10 shadow-lg h-fit' style={{ backgroundColor: '#fefce8', borderLeft: '4px solid #1e3a8a' }}>
                    <div className='mb-4'>
                        <h4 style={{ color: '#1e3a8a' }}>Lịch sử đơn hàng</h4>
                    </div>
                    <div className='max-w-[calc(100vw-300px)] w-fit'>
                        <Timeline minEvents={5} height="230">
                            <div className='w-[calc(100vw-280px)] overflow-x-auto flex'>
                                {bill?.lstHistoryBill.sort((a, b) => new Date(a.createdDate) - new Date(b.createdDate)).map((historyBill, index) => {
                                    return (
                                        <TimelineEvent
                                            key={index}
                                            color={historyBill?.type == TrangThaiBill.HOAN_THANH ? "#00c11d" : historyBill?.type == TrangThaiBill.HUY ? "#dc2020" : "#1e3a8a"}
                                            icon={historyBill?.type == TrangThaiBill.HOAN_THANH ? FaCheckCircle : historyBill?.type == TrangThaiBill.HUY ? AiOutlineCloseCircle : FaRegFileAlt}
                                            title=<h4 className='text-2xl	'>{historyBill?.type == "-1" ? "Tạo đơn hàng" :
                                                historyBill?.type == TrangThaiBill.CHO_THANH_TOAN ? "Chờ thanh toán" :
                                                    historyBill?.type == TrangThaiBill.CHO_XAC_NHAN ? "Chờ xác nhận" :
                                                        historyBill?.type == TrangThaiBill.DA_XAC_NHAN ? "Đã xác nhận" :
                                                            historyBill?.type == TrangThaiBill.CHO_GIA0 ? "Chờ giao" :
                                                                historyBill?.type == TrangThaiBill.DANG_GIAO ? "Đang giao" :
                                                                    historyBill?.type == TrangThaiBill.DA_THANH_TOAN ? "Đã thanh toán" :
                                                                        historyBill?.type == TrangThaiBill.HOAN_THANH ? "Hoàn thành" :
                                                                            historyBill?.type == TrangThaiBill.HUY ? "Hủy" :
                                                                                historyBill?.type == TrangThaiBill.HOAN_TIEN ? "Hoàn tiền" :
                                                                                    historyBill?.type == TrangThaiBill.TRA_HANG ? "Trả hàng" : "Khác"
                                            }</h4>

                                            subtitle=<span className='text-xl font-medium	'>
                                                {dayjs(historyBill?.createdDate).format('HH:mm DD/MM/YYYY')}
                                            </span>
                                        />
                                    );
                                })}
                            </div>

                        </Timeline>
                    </div>
                    <div className='flex justify-end mt-2'>
                        <Modal title="Quay lại trạng thái đơn hàng" width={500} open={isModalOpenConfirmRollback} footer={null} onCancel={() => { setIsModalOpenConfirmRollback(false) }} >
                            <label>Nội dung</label>
                            <Input.TextArea rows={5} minLength={50} placeholder='Ghi chú' value={confirmAcceptOrderDes} onChange={e => setConfirmAcceptOrderDes(e.target.value)} />
                            <div className='flex justify-end mt-4 gap-3'>
                                <Button type='primary' onClick={() => {
                                    setLoadingConfirmRollback(true);
                                    axios.post(`http://localhost:8080/api/v1/bill/${bill.id}/historyBill`, {
                                        type: Number.parseInt(bill.status) - 1,
                                        description: confirmAcceptOrderDes
                                    }).then(res => {
                                        setConfirmAcceptOrderDes("")
                                        fetchDataBill();
                                        setIsModalOpenConfirmRollback(false)
                                        toast.success(res.data.message);
                                    }).catch(err => {
                                        toast.error(err.response.data.message);
                                    })
                                        .finally(() => {
                                            setTimeout(() => {
                                                setLoadingConfirmRollback(false);
                                            }, 500)
                                        })
                                }}>Xác nhận</Button>
                                <Button type='default' onClick={() => { setIsModalOpenConfirmRollback(false) }}>Hủy</Button>
                            </div>
                            {loadingConfirmRollback && (
                                <div className='absolute top-0 left-0 right-0 bottom-0 bottom-0 flex items-center justify-center' style={{
                                    backgroundColor: 'rgba(146, 146, 146, 0.16)',
                                }}>
                                    <LoadingOutlined className='text-6xl text-rose-500	' />
                                </div>
                            )}
                        </Modal>
                        {bill && (bill.status == TrangThaiBill.DA_XAC_NHAN || bill.status == TrangThaiBill.CHO_GIA0 || bill.status == TrangThaiBill.DANG_GIAO) && bill?.billFormat == BillType.DELIVERY && <Button type='primary' style={{ backgroundColor: '#1e3a8a', borderColor: '#1e3a8a' }} onClick={() => { setIsModalOpenConfirmRollback(true) }}>Quay lại trạng thái trước</Button>}
                    </div>

                </div>


                <div className='bg-white p-4 mt-6 mb-10 pt-6 pb-6 shadow-lg '>
                    <div className='flex justify-between	'>
                        <div className='flex'>

                            <div>
                                <Modal title="Xác nhận đơn hàng" width={500} open={isModalOpenConfirmAcceptOrder} footer={null} onCancel={() => { setIsModalOpenConfirmAcceptOrder(false) }} >
                                    <label>Ghi chú</label>
                                    <Input.TextArea placeholder='Ghi chú' className='mt-2' rows={5} value={confirmAcceptOrderDes} onChange={e => setConfirmAcceptOrderDes(e.target.value)} />
                                    <div className='flex justify-end mt-4 gap-3'>
                                        <Button type='primary' onClick={() => {
                                            setLoadingConfirmAcceptOrder(true);
                                            axios.post(`http://localhost:8080/api/v1/bill/${bill.id}/historyBill`, {
                                                type: TrangThaiBill.DA_XAC_NHAN,
                                                description: confirmAcceptOrderDes
                                            }).then(response => {
                                                setConfirmAcceptOrderDes("")
                                                fetchDataBill();
                                                toast.success(response.data.message);
                                                setIsModalOpenConfirmAcceptOrder(false)
                                            }).catch(err => {
                                                toast.error(err.response.data.message);
                                            })
                                                .finally(() => {
                                                    setTimeout(() => {
                                                        setLoadingConfirmAcceptOrder(false);
                                                    }, 500)
                                                })
                                        }}>Xác nhận</Button>
                                        <Button type='default' onClick={() => { setIsModalOpenConfirmAcceptOrder(false) }}>Hủy</Button>
                                    </div>
                                    {loadingConfirmAcceptOrder && (
                                        <div className='absolute top-0 left-0 right-0 bottom-0 bottom-0 flex items-center justify-center' style={{
                                            backgroundColor: 'rgba(146, 146, 146, 0.16)',
                                        }}>
                                            <LoadingOutlined className='text-6xl text-rose-500	' />
                                        </div>
                                    )}
                                </Modal>
                                {
                                    bill && (bill.status == TrangThaiBill.CHO_XAC_NHAN || bill.status == TrangThaiBill.CHO_THANH_TOAN) && <Button style={{ backgroundColor: '#ea580c', borderColor: '#ea580c', color: 'white' }} onClick={() => {
                                        setIsModalOpenConfirmAcceptOrder(true);
                                    }}  >Xác nhận</Button>
                                }
                            </div>

                            <div>
                                <Modal title="Xác nhận chờ giao" width={500} open={isModalOpenConfirmWaitDelivery} footer={null}
                                    onCancel={() => { setIsModalOpenConfirmWaitDelivery(false) }} >
                                    <label>Ghi chú</label>
                                    <Input.TextArea placeholder='Ghi chú' className='mt-2' rows={5} value={confirmAcceptOrderDes} onChange={e => setConfirmAcceptOrderDes(e.target.value)} />
                                    <div className='flex justify-end mt-4 gap-3'>
                                        <Button type='primary' onClick={() => {
                                            setLoadingConfirmWaitDelivery(true);
                                            axios.post(`http://localhost:8080/api/v1/bill/${bill.id}/historyBill`, {
                                                type: TrangThaiBill.CHO_GIA0,
                                                description: confirmAcceptOrderDes
                                            }).then(res => {
                                                setConfirmAcceptOrderDes("")
                                                fetchDataBill();
                                                toast.success(res.data.message);
                                                setIsModalOpenConfirmWaitDelivery(false)
                                            }).catch(err => {
                                                toast.error(err.response.data.message);
                                            })
                                                .finally(() => {
                                                    setTimeout(() => {
                                                        setLoadingConfirmWaitDelivery(false);
                                                    }, 500)
                                                })
                                        }}>Xác nhận</Button>
                                        <Button type='default' onClick={() => { setIsModalOpenConfirmWaitDelivery(false) }}>Hủy</Button>
                                    </div>
                                    {loadingConfirmWaitDelivery && (
                                        <div className='absolute top-0 left-0 right-0 bottom-0 bottom-0 flex items-center justify-center' style={{
                                            backgroundColor: 'rgba(146, 146, 146, 0.16)',
                                        }}>
                                            <LoadingOutlined className='text-6xl text-rose-500	' />
                                        </div>
                                    )}
                                </Modal>

                                {
                                    bill && bill.status == TrangThaiBill.DA_XAC_NHAN && <Button style={{ backgroundColor: '#ea580c', borderColor: '#ea580c', color: 'white' }} onClick={() => {
                                        setIsModalOpenConfirmWaitDelivery(true)
                                    }}  >Chờ giao</Button>
                                }
                            </div>

                            <div>
                                <Modal title="Xác nhận giao hàng" width={500} open={isModalOpenConfirmDelivery} footer={null} onCancel={() => { setIsModalOpenConfirmDelivery(false) }} >
                                    <label>Ghi chú</label>
                                    <Input.TextArea placeholder='Ghi chú' className='mt-2' rows={5} value={confirmAcceptOrderDes} onChange={e => setConfirmAcceptOrderDes(e.target.value)} />
                                    <div className='flex justify-end mt-4 gap-3'>
                                        <Button type='primary' onClick={() => {
                                            setLoadingConfirmDelivery(true);
                                            axios.post(`http://localhost:8080/api/v1/bill/${bill.id}/historyBill`, {
                                                type: TrangThaiBill.DANG_GIAO,
                                                description: confirmAcceptOrderDes
                                            }).then(res => {
                                                setConfirmAcceptOrderDes("")
                                                fetchDataBill();
                                                toast.success(res.data.message);
                                                setIsModalOpenConfirmDelivery(false)
                                            }).catch(err => {
                                                toast.error(err.response.data.message);
                                            })
                                                .finally(() => {
                                                    setTimeout(() => {
                                                        setLoadingConfirmDelivery(false);
                                                    }, 500)
                                                })
                                        }}>Xác nhận</Button>
                                        <Button type='default' onClick={() => { setIsModalOpenConfirmDelivery(false) }}>Hủy</Button>
                                    </div>

                                    {loadingConfirmDelivery && (
                                        <div className='absolute top-0 left-0 right-0 bottom-0 bottom-0 flex items-center justify-center' style={{
                                            backgroundColor: 'rgba(146, 146, 146, 0.16)',
                                        }}>
                                            <LoadingOutlined className='text-6xl text-rose-500	' />
                                        </div>
                                    )}
                                </Modal>

                                {
                                    bill && bill.status == TrangThaiBill.CHO_GIA0 && <Button style={{ backgroundColor: '#ea580c', borderColor: '#ea580c', color: 'white' }} onClick={() => {
                                        setIsModalOpenConfirmDelivery(true)
                                    }}  >Giao hàng</Button>
                                }
                            </div>

                            <div>
                                <Modal title="Xác nhận hoàn thành" width={500} open={isModalOpenConfirmCompletion} footer={null} onCancel={() => { setIsModalOpenConfirmCompletion(false) }} >
                                    <label>Ghi chú</label>
                                    <Input.TextArea placeholder='Ghi chú' className='mt-2' rows={5} value={confirmAcceptOrderDes} onChange={e => setConfirmAcceptOrderDes(e.target.value)} />
                                    <div className='flex justify-end mt-4 gap-3'>
                                        <Button type='primary' onClick={() => {
                                            const filterPayment = bill?.lstPaymentHistory?.filter(data => data?.type == "0");
                                            const filterPaymentReturn = bill?.lstPaymentHistory?.filter(data => data?.type == "1") || [];

                                            var totalPayment = filterPayment?.reduce(function (acc, cur) {
                                                return acc + cur.paymentAmount;
                                            }, 0);


                                            var totalPaymentReturn = filterPaymentReturn?.reduce(function (acc, cur) {
                                                return acc + cur.paymentAmount;
                                            }, 0);

                                            if (bill?.intoMoney != (totalPayment - totalPaymentReturn)) {
                                                toast.error("Không Thể Hoàn Thành Khi Chưa Thanh Toán Đủ!");
                                                setIsModalOpenConfirmCompletion(false)
                                                return;
                                            }
                                            setLoadingConfirmCompletion(true);
                                            axios.post(`http://localhost:8080/api/v1/bill/${bill.id}/historyBill`, {
                                                type: TrangThaiBill.HOAN_THANH,
                                                description: confirmAcceptOrderDes
                                            }).then(res => {
                                                setConfirmAcceptOrderDes("")
                                                fetchDataBill();
                                                toast.success(res.data.message);
                                                setIsModalOpenConfirmCompletion(false)
                                            }).catch(err => {
                                                toast.error(err.response.data.message);
                                            }).finally(() => {
                                                setTimeout(() => {
                                                    setLoadingConfirmCompletion(false);
                                                }, 500)
                                            })
                                        }}>Xác nhận</Button>
                                        <Button type='default' onClick={() => { setIsModalOpenConfirmCompletion(false) }}>Hủy</Button>
                                    </div>
                                    {loadingConfirmCompletion && (
                                        <div className='absolute top-0 left-0 right-0 bottom-0 bottom-0 flex items-center justify-center' style={{
                                            backgroundColor: 'rgba(146, 146, 146, 0.16)',
                                        }}>
                                            <LoadingOutlined className='text-6xl text-rose-500	' />
                                        </div>
                                    )}
                                </Modal>

                                {
                                    bill && bill.status == TrangThaiBill.DANG_GIAO && <Button style={{ backgroundColor: '#ea580c', borderColor: '#ea580c', color: 'white' }} onClick={() => {
                                        setIsModalOpenConfirmCompletion(true)
                                    }}  >Hoàn thành</Button>
                                }
                            </div>

                            <div>
                                <Modal title="Xác nhận hủy" width={500} open={isModalOpenCancelling} footer={null} onCancel={() => { setIsModalOpenCancelling(false) }} >
                                    <label>Bạn có chắc muốn hủy hóa đơn này?</label>
                                    <Input.TextArea placeholder='Ghi chú' className='mt-2' rows={5} value={confirmAcceptOrderDes} onChange={e => setConfirmAcceptOrderDes(e.target.value)} />
                                    <div className='flex justify-end mt-4 gap-3'>
                                        <Button type='primary' onClick={() => {
                                            setLoadingCancelling(true);
                                            axios.put(`http://localhost:8080/api/v1/bill/${bill?.id}/cancelling`, {
                                                description: confirmAcceptOrderDes
                                            })
                                                .then(res => {
                                                    fetchDataBill();
                                                    toast.success(res.data.message);
                                                    setConfirmAcceptOrderDes("")
                                                    setIsModalOpenCancelling(false)
                                                }).catch(err => {
                                                    toast.error(err.response.data.message);
                                                }).finally(() => {
                                                    setTimeout(() => {
                                                        setLoadingCancelling(false);
                                                    }, 500)
                                                })
                                        }}>Xác nhận</Button>
                                        <Button type='default' onClick={() => { setIsModalOpenCancelling(false) }}>Hủy</Button>
                                    </div>
                                    {loadingCancelling && (
                                        <div className='absolute top-0 left-0 right-0 bottom-0 bottom-0 flex items-center justify-center' style={{
                                            backgroundColor: 'rgba(146, 146, 146, 0.16)',
                                        }}>
                                            <LoadingOutlined className='text-6xl text-rose-500	' />
                                        </div>
                                    )}
                                </Modal>

                                {
                                    bill && (bill?.status == TrangThaiBill.DA_XAC_NHAN || bill?.status == TrangThaiBill.CHO_XAC_NHAN || bill?.status == TrangThaiBill.CHO_THANH_TOAN || bill?.status == TrangThaiBill.CHO_GIA0) && <Button onClick={() => {
                                        setIsModalOpenCancelling(true)
                                    }} type="primary" danger className='ml-4'>
                                        Hủy đơn
                                    </Button>
                                }
                            </div>

                            <div>
                                {
                                    bill && (bill.status == TrangThaiBill.HOAN_THANH) && <Button
                                        onClick={() => {
                                            handlePrintView()
                                        }}
                                        style={{
                                            backgroundColor: '#dc2626',
                                            borderColor: '#dc2626',
                                            color: 'white',
                                            fontWeight: '500',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}
                                        icon={<FontAwesomeIcon icon={faFilePdf} />}
                                        className='ml-4'
                                    >
                                        In hóa đơn
                                    </Button>
                                }
                            </div>


                        </div>

                        <div>
                            <Modal title="Chi tiết lịch sử đơn hàng" width={800} open={isModalOpenTimelineDetails} footer={null} onCancel={() => { setIsModalOpenTimelineDetails(false) }} >
                                <Table
                                    pagination={{
                                        pageSize: 5,
                                    }}
                                    scroll={{
                                        y: 500,
                                    }}
                                    dataSource={
                                        bill?.lstHistoryBill.sort((a, b) => new Date(a.createdDate) - new Date(b.createdDate)).map(history => {
                                            return {
                                                key: history.id,
                                                type: history?.type,
                                                createdDate: dayjs(history?.createdDate).format('HH:mm DD/MM/YYYY'),
                                                createdBy: history.createdBy,
                                                description: history.description
                                            }
                                        })
                                    } columns={[
                                        {
                                            title: 'Trạng thái',
                                            dataIndex: 'type',
                                            key: 'type',
                                            render: (type) => {
                                                if (type == TrangThaiBill.TAO_DON_HANG) return <Tag color="#1e3a8a">Tạo đơn hàng</Tag>;
                                                if (type == TrangThaiBill.CHO_THANH_TOAN) return <Tag color="#1e3a8a">Chờ thanh toán</Tag>;
                                                if (type == TrangThaiBill.CHO_XAC_NHAN) return <Tag color="#1e3a8a">Chờ xác nhận</Tag>;
                                                if (type == TrangThaiBill.DA_XAC_NHAN) return <Tag color="#1e3a8a">Đã xác nhận</Tag>;
                                                if (type == TrangThaiBill.CHO_GIA0) return <Tag color="#1e3a8a">Chờ giao</Tag>;
                                                if (type == TrangThaiBill.DANG_GIAO) return <Tag color="#1e3a8a">Đang giao</Tag>;
                                                if (type == TrangThaiBill.DA_THANH_TOAN) return <Tag color="#1e3a8a">Đã thanh toán</Tag>;
                                                if (type == TrangThaiBill.HOAN_THANH) return <Tag color="#00c11d">Hoàn thành</Tag>;
                                                if (type == TrangThaiBill.HUY) return <Tag color="#dc2020">Hủy</Tag>;
                                                if (type == TrangThaiBill.HOAN_TIEN) return <Tag color="#ea580c">Hoàn tiền</Tag>;
                                                if (type == TrangThaiBill.TRA_HANG) return <Tag color="#ea580c">Trả hàng</Tag>;
                                                return "Khác";
                                            }
                                        },
                                        {
                                            title: 'Thời gian',
                                            dataIndex: 'createdDate',
                                            key: 'createdDate',
                                        },
                                        {
                                            title: 'Người chỉnh sửa',
                                            dataIndex: 'createdBy',
                                            key: 'createdBy',
                                            render: () => 'Vũ Thế Anh'
                                        },
                                        {
                                            title: 'Mô tả',
                                            dataIndex: 'description',
                                            key: 'description',
                                            render: (text) => {
                                                // Nếu text chứa code (có dấu ? hoặc ==), return empty
                                                if (text && (text.includes('?') || text.includes('==') || text.includes('TrangThaiBill'))) {
                                                    return '-';
                                                }
                                                return text || '-';
                                            }
                                        },
                                    ]} />
                            </Modal>
                            <Button
                                style={{
                                    backgroundColor: '#1e3a8a',
                                    borderColor: '#1e3a8a',
                                    color: 'white',
                                    fontWeight: '500',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                                icon={<FontAwesomeIcon icon={faInfoCircle} />}
                                onClick={() => {
                                    setIsModalOpenTimelineDetails(true)
                                }}
                            >
                                Chi tiết
                            </Button>
                        </div>
                    </div>
                </div>


                <div className='p-4 mt-6 mb-10 shadow-lg' style={{ backgroundColor: '#fefce8', borderLeft: '4px solid #1e3a8a' }}>
                    <div className='flex justify-between pb-4' style={{ borderBottom: '1px solid #cccccc' }}>
                        <div>
                            <h4 style={{ color: '#1e3a8a' }}>Thông tin đơn hàng - <span>{bill?.codeBill}</span></h4>
                        </div>
                        <div>
                            {
                                (bill?.status == TrangThaiBill.CHO_XAC_NHAN || bill?.status == TrangThaiBill.DA_XAC_NHAN) &&
                                <Button style={{ backgroundColor: '#ea580c', borderColor: '#ea580c', color: 'white' }} onClick={showModalAddress}>Cập nhật</Button>
                            }
                            <Modal title="Cập nhật thông tin" width={800} open={isModalOpenAddress} footer={null} onCancel={handleCancelAddress} >
                                <div className='mt-6'>
                                    <BillAddress bill={bill} handleCancelAddress={handleCancelAddress} fetchDataBill={fetchDataBill} lstBillDetails={lstBillDetails}></BillAddress>
                                </div>
                            </Modal>
                        </div>
                    </div>

                    <div className='pt-4'>
                        <Descriptions>
                            <Descriptions.Item label={<span className='font-medium text-black'>Tên khách hàng</span>}>{bill?.customer ? bill?.customer?.fullName : "Khách lẻ"}</Descriptions.Item>
                            <Descriptions.Item label={<span className='font-medium text-black'>Tên người nhận</span>}>{bill?.receiverName}</Descriptions.Item>
                            <Descriptions.Item label={<span className='font-medium text-black'>Số điện thoại</span>}>{bill?.receiverPhone}</Descriptions.Item>
                            <Descriptions.Item label={<span className='font-medium text-black'>Loại</span>}> {bill?.billFormat == "0" ? <Tag color="#87d068">Online</Tag> : bill?.billFormat == "1" ? <Tag color="#108ee9">Offline</Tag> : bill?.billFormat == "2" ? <Tag color="#2db7f5">Giao hàng</Tag> : "Khác"} </Descriptions.Item>
                            <Descriptions.Item label={<span className='font-medium text-black'>Trạng thái</span>}>

                                {
                                    bill?.status == TrangThaiBill.TAO_DON_HANG ? <Tag color="#1e3a8a">Tạo đơn hàng</Tag> :
                                        bill?.status == TrangThaiBill.CHO_THANH_TOAN ? <Tag color="#1e3a8a">Chờ thanh toán</Tag> :
                                            bill?.status == TrangThaiBill.CHO_XAC_NHAN ? <Tag color="#1e3a8a">Chờ xác nhận</Tag> :
                                                bill?.status == TrangThaiBill.DA_XAC_NHAN ? <Tag color="#1e3a8a">Đã xác nhận</Tag> :
                                                    bill?.status == TrangThaiBill.CHO_GIA0 ? <Tag color="#1e3a8a">Chờ giao</Tag> :
                                                        bill?.status == TrangThaiBill.DANG_GIAO ? <Tag color="#1e3a8a">Đang giao</Tag> :
                                                            bill?.status == TrangThaiBill.HOAN_THANH ? <Tag color="#00c11d">Hoàn thành</Tag> :
                                                                bill?.status == TrangThaiBill.HUY ? <Tag color="#dc2020">Hủy</Tag> :
                                                                    bill?.status == TrangThaiBill.TRA_HANG ? <Tag color="#ea580c">Trả hàng</Tag> : "Khác"
                                }
                            </Descriptions.Item>
                            <Descriptions.Item label={<span className='font-medium text-black'>Địa chỉ</span>}>{bill?.receiverDetails} {bill?.receiverCommune} {bill?.receiverDistrict} {bill?.receiverProvince}</Descriptions.Item>
                            <Descriptions.Item label={<span className='font-medium text-black'>Ghi chú</span>}>{bill?.description}</Descriptions.Item>

                        </Descriptions>
                    </div>
                </div>


                <div className='bg-white p-4 mt-6 mb-10 shadow-lg '>
                    <div>
                        <BillPaymentHistory bill={bill} fetchDataBill={fetchDataBill} lstPaymentHistory={bill?.lstPaymentHistory} ></BillPaymentHistory>
                    </div>
                </div>

                <div className='bg-white p-4 mt-6 mb-10 shadow-lg '>

                    <div>
                        <BillProducts bill={bill} fetchDataBill={fetchDataBill} lstBillDetails={lstBillDetails}></BillProducts>
                    </div>
                </div>
                {lstBillDetailsReturn.length > 0 &&
                    <div className='bg-white p-4 mt-6 mb-10 shadow-lg '>

                        <div>
                            <BillProductsBack bill={bill} fetchDataBill={fetchDataBill} lstBillDetailsReturn={lstBillDetailsReturn}></BillProductsBack>
                        </div>
                    </div>
                }


                <div className='bg-white p-4 mt-6 mb-20 shadow-lg '>
                    <div className='flex justify-between'>
                        <div className='text-2xl leading-loose w-1/4'>
                            <div className='flex '>
                                <div className='w-[200px]'>

                                    <div>Mã giảm giá:</div>
                                    <div>Phiếu giảm giá:</div>

                                </div>
                                <div className='font-medium text-end w-full'>
                                    <div>{bill?.lstVoucherDetails[0]?.voucher?.code}</div>
                                    <div>{bill?.lstVoucherDetails[0]?.voucher?.name}</div>
                                </div>
                            </div>
                        </div>

                        <div className='text-2xl leading-loose w-1/4'>
                            <div className='flex justify-between'>
                                <div>
                                    <div>Tiền hàng:</div>
                                    <div>Giảm giá:</div>
                                    <div>Phí vận chuyển:</div>
                                    <div>Tổng tiền:</div>
                                </div>
                                <div className='font-medium text-end'>
                                    <div>{fixMoney(bill?.totalMoney)}</div>
                                    <div>- {fixMoney(bill?.voucherMoney)}</div>
                                    <div>{fixMoney(bill?.shipMoney)}</div>
                                    <div className='text-rose-600	'>{fixMoney(bill?.intoMoney)}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
                <div className='-z-50' id='printx'>

                </div>
            </div>
            <ToastContainer />

        </>
    );
}

export default BillDetail;