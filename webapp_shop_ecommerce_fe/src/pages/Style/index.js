import React, { useState, useEffect } from 'react';
import { Button, Table, Input, Modal, Popconfirm, Form } from 'antd';
import axios from 'axios';
import { faPen, faShirt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { DeleteOutlined } from '@ant-design/icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);
function Style() {
    const [form] = Form.useForm();
    const [formUpdate] = Form.useForm();
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
    const [valueInputAdd, setValueInputAdd] = useState(null);
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/v1/style');
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
        axios.put('http://localhost:8080/api/v1/style/' + dataEntity.id, dataEntity)
            .then(response => {

                console.log('Update data:', dataEntity);
                toast.success("Cập Nhật Thành Công");
                fetchData();
                setOpen(false);
                formUpdate.resetFields();

            })
            .catch(err => {
                toast.error(err.response.data.message);
                console.error(err)
            });

    };

    const handleDelete = (id) => {
        axios.delete('http://localhost:8080/api/v1/style/' + dataEntity.id)
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
        formUpdate.setFieldsValue({ value: data?.name });

        setOpen(true);
    };
    const handleCancel = () => {
        setOpen(false);
        formUpdate.resetFields();

    };

    const handleSearch = (value) => {
        setSearchTerm(value);
    };

    const handleInputChange = (e) => {
        // Update the dataEntity state when input changes
        setDataEntity({
            ...dataEntity,
            name: e.target.value,
        });
    };


    const [isModalOpenAdd, setIsModalOpenAdd] = useState(false);
    const showModalAdd = () => {
        setIsModalOpenAdd(true);
    };
    const handleOkAdd = () => {

        axios.post('http://localhost:8080/api/v1/style', {
            name: valueInputAdd
        })
            .then(response => {
                console.log('Thêm Mới Thành Công');
                toast.success(response.data.message);
                setValueInputAdd(null)
                fetchData();
                setIsModalOpenAdd(false);
                form.resetFields();

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
        form.resetFields();

    };
    const filteredData = dataColum.filter(item => item && item.name && item.name.toLowerCase().includes(searchTerm.trim().toLowerCase()));

    return (
        <>
            <div className='p-4 shadow-lg' style={{ backgroundColor: '#fefce8', borderLeft: '4px solid #1e3a8a' }}>
                <h3 style={{ color: '#1e3a8a', marginBottom: 0 }}>
                    <FontAwesomeIcon icon={faShirt} style={{ marginRight: '12px' }} />
                    Quản lý phong cách
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
                        <Modal title="Thêm Mới" open={isModalOpenAdd} footer={null} onCancel={handleCancelAdd}>
                            <div>
                                <Form form={form} onFinish={handleOkAdd}>
                                    <Form.Item
                                        name={['value']}
                                        label="Tên"
                                        rules={[
                                            {
                                                required: true,
                                                message: 'Vui lòng nhập giá trị',
                                            },
                                        ]}
                                        labelCol={{ span: 24 }}
                                        wrapperCol={{ span: 24 }}
                                    >
                                        <Input
                                            type="text"
                                            name='value'
                                            placeholder='Nhập value'
                                            onChange={(e) => { setValueInputAdd(e.target.value) }}
                                        />
                                    </Form.Item>

                                    <div className='flex justify-end mt-10'>
                                        <Button onClick={handleCancelAdd}>
                                            Thoát
                                        </Button>
                                        <Button className='ml-4' type="primary" htmlType="submit">
                                            Lưu
                                        </Button>
                                    </div>

                                </Form>
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
                title="Sửa Phong Cách"
                onOk={handleUpDate}
                onCancel={handleCancel}
                footer={null}
            >

                <div>
                    <Form form={formUpdate} onFinish={handleUpDate}>
                        <Form.Item
                            name='value'
                            label="Tên"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập giá trị',
                                },
                            ]}
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}

                        >
                            <Input
                                // value={dataEntity?.name}

                                type="text"
                                placeholder='Nhập value'
                                onChange={handleInputChange}
                            />
                        </Form.Item>

                        <div className='flex justify-end mt-10'>

                            <Button key="ok" type="primary" htmlType="submit">
                                Cập Nhật
                            </Button>,
                            <Button key="cancel" className='ml-4' onClick={handleCancel}>
                                Thoát
                            </Button>,
                            <Popconfirm
                                title="Delete the task"
                                description="Bạn Có Chắc Muốn Xóa?"
                                onConfirm={() => handleDelete(dataEntity?.id)}
                                okText="Yes"
                                cancelText="No"
                            >
                                <Button danger className='ml-4'> <DeleteOutlined /> Xóa</Button>
                            </Popconfirm>
                        </div>

                    </Form>
                </div>

            </Modal>
            <ToastContainer />

        </>
    );
}

export default Style;
