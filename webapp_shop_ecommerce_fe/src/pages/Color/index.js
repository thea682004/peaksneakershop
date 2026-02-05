import React, { useState, useEffect } from 'react';
import { Button, Table, Input, Modal, Popconfirm, ColorPicker } from 'antd';
import axios from 'axios';
import { faPen, faPalette } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { DeleteOutlined } from '@ant-design/icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import hexToColorName from "~/ultils/HexToColorName";
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);
function Color() {
    const columns = [
        {
            title: '#',
            dataIndex: 'index',
            key: 'index',
            render: (text, record, index) => (
                <React.Fragment key={index}>
                    <span>{index + 1}</span>
                </React.Fragment>
            ),
            align: 'center',
        },
        {
            title: 'Tên',
            dataIndex: 'name',
            key: 'name',
            width: 400,
            align: 'center',
            render: (text, record, index) => (
                <React.Fragment key={index}>
                    <div className='flex items-center ml-8'>
                        <div style={{ width: '25px', height: '25px', backgroundColor: record.name, border: '1px solid #ccc' }}>
                        </div>
                        <div className='ml-2'>
                            <span className='ml-2'>{record.name} - {hexToColorName(record.name)}</span>
                        </div>
                    </div>
                </React.Fragment>
            ),
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdDate',
            key: 'createdDate',
            align: 'center',
            render: (text, record, index) => (
                <React.Fragment key={index}>
                    <span> {dayjs(record.createdDate).format('DD/MM/YYYY')}</span>
                </React.Fragment>
            ),
        },
        {
            title: 'Hành động',
            dataIndex: 'action',
            key: 'action',
            align: 'center',
            render: (text, record, index) => (
                <React.Fragment key={index}>
                    <Button style={{ backgroundColor: '#1e3a8a', borderColor: '#1e3a8a' }} type="primary" onClick={() => showModal(record)}>
                        <FontAwesomeIcon icon={faPen} />
                    </Button>
                </React.Fragment>
            ),
        },
    ];


    const [dataColum, setDataColum] = useState([]);
    const [dataEntity, setDataEntity] = useState();
    const [valueInputAdd, setValueInputAdd] = useState('#1677ff');
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/v1/color');
            console.log(response.data);
            setDataColum(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []); // Empty dependency array ensures the effect runs once when the component mounts




    const handleUpDate = () => {
        axios.put('http://localhost:8080/api/v1/color/' + dataEntity.id, dataEntity)
            .then(response => {

                console.log('Update data:', dataEntity);
                toast.success("Cập Nhật Thành Công");
                fetchData();
                setOpen(false);

            })
            .catch(err => {
                toast.error(err.response.data.message);
                console.error(err)
            });

    };

    const handleDelete = (id) => {
        axios.delete('http://localhost:8080/api/v1/color/' + dataEntity.id)
            .then(response => {
                console.log('Update data:', dataEntity);
                toast.success("Xóa Thành Công");
                fetchData();
                console.log('Delete data with id:', id);
                setOpen(false);
            })
            .catch(err => {
                toast.error(err.response.data.message);
                console.error(err)
            });
    }
    const showModal = (data) => {
        console.log(data);
        setDataEntity(data)
        setOpen(true);
    };
    const handleCancel = () => {
        setOpen(false);
    };

    const handleSearch = (value) => {
        setSearchTerm(value);
    };

    const handleInputChange = (e) => {
        // Update the dataEntity state when input changes
        setDataEntity({
            ...dataEntity,
            name: e.toHexString(),
        });
    };


    const [isModalOpenAdd, setIsModalOpenAdd] = useState(false);
    const showModalAdd = () => {
        setIsModalOpenAdd(true);
    };
    const handleOkAdd = () => {

        axios.post('http://localhost:8080/api/v1/color', {
            name: valueInputAdd
        })
            .then(response => {
                console.log('Thêm Mới Thành Công');
                toast.success(response.data.message);
                setValueInputAdd(null)
                fetchData();
                setIsModalOpenAdd(false);

            })
            .catch(err => {
                toast.error(err.response.data.message);
                console.error(err)
            });
        console.log(valueInputAdd);
    };
    const handleCancelAdd = () => {
        setValueInputAdd(null)
        setIsModalOpenAdd(false);
    };
    const filteredData = dataColum.filter(item => item && item.name && item.name.toLowerCase().includes(searchTerm.trim().toLowerCase()));

    return (
        <>
            <div className='p-4 shadow-lg' style={{ backgroundColor: '#fefce8', borderLeft: '4px solid #1e3a8a' }}>
                <h3 style={{ color: '#1e3a8a', marginBottom: 0 }}>
                    <FontAwesomeIcon icon={faPalette} style={{ marginRight: '12px' }} />
                    Quản lý màu sắc
                </h3>
            </div>
            <div className='bg-white p-4 mt-4 mb-10 shadow-lg' style={{ backgroundColor: '#fefce8', borderLeft: '4px solid #1e3a8a' }}>
                <label className='font-semibold' style={{ color: '#1e3a8a' }}>Tìm kiếm</label>
                <Input className='mt-4 mb-4' type="text" placeholder='Nhập giá trị cần tìm' onChange={(e) => handleSearch(e.target.value)} />
            </div>

            <div className='bg-white p-4 mt-4 mb-10 shadow-lg' style={{ backgroundColor: '#fefce8', borderLeft: '4px solid #1e3a8a' }}>
                <div className='mb-4 flex justify-between	'>
                    <div className='text-base font-semibold' style={{ color: '#1e3a8a' }}>
                        Danh sách
                    </div>
                    <div >
                        <Button style={{ backgroundColor: '#ea580c', borderColor: '#ea580c' }} type="primary" onClick={showModalAdd}>
                            Thêm mới
                        </Button>
                        <Modal title="Thêm Mới" open={isModalOpenAdd} onOk={handleOkAdd} onCancel={handleCancelAdd}>
                            <div>
                                <div>
                                    <label>Màu Sắc</label>
                                    <br ></br>
                                    <div className='flex items-center'>
                                        <ColorPicker className='mt-4 mb-4' showText value={valueInputAdd}
                                            onChange={(e) => setValueInputAdd(e.toHexString())}
                                            onKeyDown={(e) => e.stopPropagation()}
                                        />
                                        <span className='ml-2'> - {hexToColorName(valueInputAdd)}</span>
                                    </div>

                                </div>
                            </div>
                        </Modal>
                    </div>
                </div>
                <Table pagination={{
                    pageSize: 5,
                }} dataSource={filteredData} columns={columns} />
            </div>

            <Modal
                open={open}
                title="Sửa Màu Sắc"
                onOk={handleUpDate}
                onCancel={handleCancel}
                footer={[
                    <Button key="ok" type="primary" onClick={handleUpDate}>
                        Cập Nhật
                    </Button>,
                    <Button key="cancel" onClick={handleCancel}>
                        Thoát
                    </Button>,
                    <Popconfirm
                        title="Delete the task"
                        description="Bạn Có Chắc Muốn Xóa?"
                        onConfirm={() => handleDelete(dataEntity?.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button danger> <DeleteOutlined /> Xóa</Button>
                    </Popconfirm>
                    ,
                ]}
            >
                <div>
                    <label>Màu Sắc</label>
                    <br></br>
                    <div className='flex items-center'>

                        <ColorPicker className='mt-4 mb-4' showText value={dataEntity?.name}
                            onChange={handleInputChange}
                            onKeyDown={(e) => e.stopPropagation()}
                        />
                        <span className='ml-2'> - {hexToColorName(dataEntity?.name)}</span>
                    </div>

                </div>
            </Modal>
            <ToastContainer />

        </>
    );
}

export default Color;
