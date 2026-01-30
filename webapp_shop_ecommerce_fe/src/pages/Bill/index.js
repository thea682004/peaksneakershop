import React, { useContext, useState, useEffect, useRef } from 'react';
import { Button, Tabs, Table, DatePicker, Radio, Input, Tag, Badge } from 'antd';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { SearchOutlined } from '@ant-design/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileInvoice, faClipboardList, faRedo } from '@fortawesome/free-solid-svg-icons';
import { faEye } from '@fortawesome/free-regular-svg-icons';
import { useDebounce } from '~/hooks';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { fixMoney } from '~/ultils/fixMoney';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);
const { RangePicker } = DatePicker;
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



const columnsTable = [
  {
    title: '#',
    dataIndex: 'index',
    key: 'index',
    width: 50,
    render: (text, record, index) => (
      <React.Fragment key={index}>
        <span>{index + 1}</span>
      </React.Fragment>
    ),
  },
  {
    title: 'Mã hoá đơn',
    dataIndex: 'codeBill',
    key: 'codeBill',
  },
  {
    title: 'Khách hàng',
    dataIndex: 'customer',
    key: 'customer',
  },
  {
    title: 'Số điện thoại',
    dataIndex: 'receiverPhone',
    key: 'receiverPhone',
  },

  {
    title: 'Tổng tiền',
    dataIndex: 'intoMoney',
    key: 'intoMoney',
  },

  {
    title: 'Loại đơn hàng',
    dataIndex: 'billType',
    key: 'billType',
  },

  {
    title: 'Trạng thái',
    dataIndex: 'status',
    key: 'status',
  },

  {
    title: 'Ngày tạo',
    dataIndex: 'createdDate',
    key: 'createdDate',
    render: (date) => {
      // Nếu không có ngày thì để trống, có thì format
      return <span>{date ? dayjs(date).format("HH:mm DD/MM/YYYY") : ''}</span>;
    },
  },

  {
    title: 'Hành động',
    dataIndex: 'action',
    key: 'action',
  },
];
function Bill() {

  const [lstBill, setLstBill] = useState([]);

  const [dataColumBill, setDataColumBill] = useState([]);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [billType, setBillType] = useState('');
  const [startDate, setStartDate] = useState('-1');
  const [endDate, setEndDate] = useState('-1');
  const [dateRange, setDateRange] = useState(null); // Thêm state để lưu giá trị RangePicker

  const debounceSearch = useDebounce(search.trim(), 500)
  const tabItems = [
    {
      key: '-1',
      label: <Badge count={lstBill?.length} style={{ marginTop: '-4px', marginRight: '-4px' }}>
        <span>Tất cả</span>
      </Badge>,
    },
    {
      key: TrangThaiBill.CHO_XAC_NHAN,
      label: <Badge count={lstBill?.filter(bill => bill?.status == TrangThaiBill.CHO_XAC_NHAN).length} style={{ marginTop: '-4px', marginRight: '-4px' }}>
        <span>Chờ xác nhận</span>
      </Badge>,
    },
    {
      key: TrangThaiBill.DA_XAC_NHAN,
      label: <Badge count={lstBill?.filter(bill => bill?.status == TrangThaiBill.DA_XAC_NHAN).length} style={{ marginTop: '-4px', marginRight: '-4px' }}>
        <span>Đã xác nhận</span>
      </Badge>,
    },
    {
      key: TrangThaiBill.CHO_GIA0,
      label: <Badge count={lstBill?.filter(bill => bill?.status == TrangThaiBill.CHO_GIA0).length} style={{ marginTop: '-4px', marginRight: '-4px' }}>
        <span>Chờ giao</span>
      </Badge>,
    },
    {
      key: TrangThaiBill.DANG_GIAO,
      label: <Badge count={lstBill?.filter(bill => bill?.status == TrangThaiBill.DANG_GIAO).length} style={{ marginTop: '-4px', marginRight: '-4px' }}>
        <span>Đang giao</span>
      </Badge>,
    },
    // {
    //   key: '3',
    //   label: 'Đã Thanh Toán',
    // },
    {
      key: TrangThaiBill.HOAN_THANH,
      label: <Badge count={lstBill?.filter(bill => bill?.status == TrangThaiBill.HOAN_THANH).length} style={{ marginTop: '-4px', marginRight: '-4px' }}>
        <span>Hoàn thành</span>
      </Badge>,
    },
    {
      key: TrangThaiBill.HUY,
      label: <Badge count={lstBill?.filter(bill => bill?.status == TrangThaiBill.HUY).length} style={{ marginTop: '-4px', marginRight: '-4px' }}>
        <span>Hủy</span>
      </Badge>,
    },
    {
      key: TrangThaiBill.CHO_THANH_TOAN,
      label: <Badge count={lstBill?.filter(bill => bill?.status == TrangThaiBill.CHO_THANH_TOAN).length} style={{ marginTop: '-4px', marginRight: '-4px' }}>
        <span>Chờ thanh toán</span>
      </Badge>,
    },


  ];


  const fetchDataBill = async () => {

    try {
      const response = await axios.get('http://localhost:8080/api/v1/bill'
        // , {
        //   params: {
        //     status: '',
        //     search: search,
        //     billType: billType,
        //     startDate: startDate,
        //     endDate: endDate,
        //   }
        // }
      );
      console.log(response.data);
      setLstBill(response.data);
    } catch (error) {
      console.error(error);
    }
  }
  useEffect(() => {
    const intervalId = setInterval(() => {
      console.log("goi api bill");
      fetchDataBill();
    }, 30000); // 60000 milliseconds = 1 phút

    // Cleanup để tránh leak memory khi component bị unmount
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    fetchDataBill();
  }, [status, billType, startDate, endDate, debounceSearch])

  useEffect(() => {
    const dataTable = lstBill?.filter(bill => {
      // Lọc theo tên ,phone
      if (debounceSearch &&
        !(bill?.codeBill?.toLowerCase().includes(debounceSearch.toLowerCase()) ||
          bill?.receiverPhone?.toLowerCase().includes(debounceSearch.toLowerCase()) ||
          bill?.customer?.fullName?.toLowerCase().includes(debounceSearch.toLowerCase())
        )) {
        return false;
      }

      if (status &&
        !(bill?.status?.toLowerCase().includes(status.toLowerCase()))) {
        return false;
      }

      if (billType &&
        !(bill?.billType?.toLowerCase().includes(billType.toLowerCase()))) {
        return false;
      }

      if (startDate != '-1' && endDate != '-1') {
        const billDate = new Date(bill?.createdDate); // Đảm bảo rằng thuộc tính 'createdDate' của bill là kiểu Date hoặc có thể chuyển đổi thành kiểu Date
        if (!(billDate >= startDate && billDate <= endDate)) {
          return false;
        }
      }

      return true;
    })

    fillDataColumBill(dataTable);
  }, [lstBill]);
  const fillDataColumBill = (data) => {
    const dataTable = data.map((data, index) => {
      return {
        key: index,
        codeBill: data.codeBill,
        customer: data.customer == null ? "Khách Lẻ" : data.customer.fullName,
        receiverPhone: data.receiverPhone || (data.customer?.phoneNumber) || "Không có",
        intoMoney: fixMoney(data.intoMoney),
        billType: <>
          {data.billType == "0" ? <Tag color="#2db7f5">Online</Tag> : <Tag color="#108ee9">Offline</Tag>}
        </>,
        status: <>
          {data.status == TrangThaiBill.TAO_DON_HANG ? <Tag color="#1e3a8a">Tạo đơn hàng</Tag> :
            data.status == TrangThaiBill.CHO_THANH_TOAN ? <Tag color="#1e3a8a">Chờ thanh toán</Tag> :
              data.status == TrangThaiBill.CHO_XAC_NHAN ? <Tag color="#1e3a8a">Chờ xác nhận</Tag> :
                data.status == TrangThaiBill.DA_XAC_NHAN ? <Tag color="#1e3a8a">Đã xác nhận</Tag> :
                  data.status == TrangThaiBill.CHO_GIA0 ? <Tag color="#1e3a8a">Chờ giao</Tag> :
                    data.status == TrangThaiBill.DANG_GIAO ? <Tag color="#1e3a8a">Đang giao</Tag> :
                      data.status == TrangThaiBill.HOAN_THANH ? <Tag color="#00c11d">Hoàn thành</Tag> :
                        data.status == TrangThaiBill.HUY ? <Tag color="#dc2020">Hủy</Tag> :
                          data.status == TrangThaiBill.TRA_HANG ? <Tag color="#ea580c">Trả hàng</Tag> : "Khác"}
        </>,
        createdDate: dayjs(data.createdDate).format('YYYY-MM-DD HH:mm:ss'),
        action: <Link to={`/bill/bill-detail/${data.id}`}>
          <FontAwesomeIcon
            icon={faEye}
            style={{
              fontSize: '20px',
              color: '#1e3a8a',
              cursor: 'pointer',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.color = '#ea580c'}
            onMouseLeave={(e) => e.target.style.color = '#1e3a8a'}
          />
        </Link>,
      }
    });
    // console.log(data);
    setDataColumBill(dataTable)
  }

  const onChange = (key) => {
    if (key == -1) {
      setStatus('')
    } else {
      setStatus(key);
    }
  };


  const rangePresets = [
    {
      label: 'Last 7 Days',
      value: [dayjs().add(-7, 'd'), dayjs()],
    },
    {
      label: 'Last 14 Days',
      value: [dayjs().add(-14, 'd'), dayjs()],
    },
    {
      label: 'Last 30 Days',
      value: [dayjs().add(-30, 'd'), dayjs()],
    },
    {
      label: 'Last 90 Days',
      value: [dayjs().add(-90, 'd'), dayjs()],
    },
  ];

  const onRangeChange = (dates, dateStrings) => {
    if (dates) {
      setDateRange(dates); // Lưu giá trị dates vào state
      const startOfDay = dayjs(dates[0]).startOf('day');
      const endOfDay = dayjs(dates[1]).endOf('day');
      setStartDate(startOfDay.toDate());
      setEndDate(endOfDay.toDate());
      console.log('From: ', startOfDay.format('YYYY-MM-DD HH:mm:ss'), ', to: ', endOfDay.format('YYYY-MM-DD HH:mm:ss'));
      console.log('From: ', dateStrings[0], ', to: ', dateStrings[1]);
    } else {
      setDateRange(null); // Reset dateRange
      setStartDate("-1")
      setEndDate("-1")
      console.log('Clear');
    }
  };

  const handleRadioChange = (e) => {
    console.log(e.target.value);
    setBillType(e.target.value);
  }

  const handleInputSearch = (e) => {
    console.log(e.target.value);
    setSearch(e.target.value);
  }



  const handelClear = () => {
    setSearch("");
    setStatus("");
    setBillType("");
    setStartDate("-1");
    setEndDate("-1");
    setDateRange(null); // Reset RangePicker
  }

  return (
    <>
      <style>
        {`
          .ant-radio-checked .ant-radio-inner {
            border-color: #1e3a8a !important;
            background-color: #1e3a8a !important;
          }
          .ant-radio:hover .ant-radio-inner {
            border-color: #1e3a8a !important;
          }
          .ant-radio-wrapper:hover .ant-radio-inner {
            border-color: #1e3a8a !important;
          }
        `}
      </style>
      <div >
        <div className='p-4 shadow-lg' style={{ backgroundColor: '#fefce8', borderLeft: '4px solid #1e3a8a' }}>
          <h3 style={{ color: '#1e3a8a' }}>
            <FontAwesomeIcon icon={faFileInvoice} className='text-gray-700 mr-2' />
            Quản lý hóa đơn
          </h3>
        </div>
        <div className='bg-white p-4 mt-6 mb-10 shadow-lg pb-10'>
          <div className='mb-2'>
            <h4>
              Bộ Lọc
            </h4>
          </div>
          <div className='flex'>
            <div className='w-1/2 pl-10 pr-10 '>
              <div className='flex flex-col mt-4'>
                <Input allowClear placeholder="Nhập mã hóa đơn hoặc số điện thoại" prefix={<SearchOutlined />} value={search} onChange={handleInputSearch} />
              </div>

              <div className='flex flex-col mt-4'>
                <label className='font-semibold mb-1'>Ngày tạo</label>
                <RangePicker
                  className='w-full'
                  value={dateRange}
                  presets={[
                    { label: 'Hôm nay', value: [dayjs().startOf('day'), dayjs().endOf('day')] },
                    { label: '7 ngày qua', value: [dayjs().add(-7, 'd'), dayjs()] },
                    { label: 'Tháng này', value: [dayjs().startOf('month'), dayjs().endOf('month')] },
                  ]}
                  onChange={onRangeChange}

                  placeholder={['Từ ngày', 'Đến ngày']}
                  format="DD/MM/YYYY" />
              </div>


            </div>
            <div className='w-1/2 pl-10 pr-10 grid grid-cols-1 content-between'>
              <div className='mt-4 flex justify-end'>
                <Button
                  onClick={handelClear}
                  style={{
                    backgroundColor: '#ea580c',
                    borderColor: '#ea580c',
                    color: 'white',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  icon={<FontAwesomeIcon icon={faRedo} />}
                >
                  Làm mới
                </Button>
              </div>
              <div className='mt-4 ml-4'>
                <label className='font-semibold' style={{ color: '#1e3a8a' }}>Loại đơn</label>
                <div className='mt-2 border rounded-lg p-3' style={{ backgroundColor: 'white', borderColor: '#1e3a8a' }}>
                  <Radio.Group value={billType} onChange={handleRadioChange} className='flex gap-4'>
                    <Radio value={""} className='font-medium'>Tất Cả</Radio>
                    <Radio value={"0"} className='font-medium'>Online</Radio>
                    <Radio value={"1"} className='font-medium'>Offline</Radio>
                  </Radio.Group>
                </div>
              </div>
            </div>
          </div>
          <div>

          </div>
        </div>

        <div className='mt-6 p-4 shadow-lg' style={{ backgroundColor: '#fefce8', borderLeft: '4px solid #1e3a8a' }}>
          <div className='mb-2'>
            <h4 style={{ color: '#1e3a8a' }}>
              <FontAwesomeIcon icon={faClipboardList} className='text-gray-700 mr-2' />
              Danh sách hóa đơn
            </h4>
          </div>
          <div>
            <Tabs defaultActiveKey="-1" items={tabItems} onChange={onChange} />
          </div>
          <div>
            <Table dataSource={dataColumBill} columns={columnsTable} />
          </div>
        </div>

        <ToastContainer />
      </div>

    </>
  );
}

export default Bill;

