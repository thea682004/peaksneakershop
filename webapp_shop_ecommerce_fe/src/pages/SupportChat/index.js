import React from 'react';
import { Result, Button } from 'antd';
import { MessageOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

function SupportChat() {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Result
                icon={<MessageOutlined className="text-orange-600" style={{ fontSize: '120px' }} />}
                title={<span className="text-3xl font-bold text-gray-800">Chat Hỗ Trợ</span>}
                subTitle={
                    <div className="text-lg text-gray-600 mt-4">
                        <p>Chức năng chat hỗ trợ đang được phát triển.</p>
                        <p className="mt-2">Vui lòng quay lại sau hoặc liên hệ qua các kênh khác.</p>
                    </div>
                }
                extra={[
                    <Link to="/" key="home">
                        <Button type="primary" size="large" className="bg-orange-600 hover:bg-orange-700 border-0">
                            Về Trang Chủ
                        </Button>
                    </Link>,
                    <Link to="/user/customer" key="customer">
                        <Button size="large" className="ml-3">
                            Quản Lý Khách Hàng
                        </Button>
                    </Link>,
                ]}
            />
        </div>
    );
}

export default SupportChat;
