import { Link, useNavigate } from "react-router-dom";
import {
  HomeOutlined,
  ShoppingCartOutlined,
  ShoppingOutlined,
  UserOutlined,
  TeamOutlined,
  FileTextOutlined,
  InboxOutlined,
  TagsOutlined,
  GiftOutlined,
  PercentageOutlined,
  BarChartOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import { Menu } from 'antd';

function getItem(label, key, icon, children, type) {
  return {
    key,
    icon,
    children,
    label,
    type,
  };
}

const items = [
  getItem(<Link to="/">Trang chủ</Link>, '1', <HomeOutlined />),

  // QUẢN LÝ BÁN HÀNG - Group Divider
  getItem('QUẢN LÝ BÁN HÀNG', 'sales-group', null, null, 'group'),
  getItem(<Link to="/order">Bán hàng</Link>, 'sales-order', <ShoppingCartOutlined />),
  getItem(<Link to="/product">Sản phẩm</Link>, 'sales-product', <ShoppingOutlined />),
  getItem(<Link to="/user/customer">Khách hàng</Link>, 'sales-customer', <UserOutlined />),
  getItem(<Link to="/bill">Đơn hàng</Link>, 'sales-bills', <InboxOutlined />),
  getItem(<Link to="/bill">Hoá đơn</Link>, 'sales-invoice', <FileTextOutlined />),
  getItem('Thuộc tính', 'sales-attributes', <TagsOutlined />, [
    getItem(<Link to="/product/category">Loại</Link>, 'attr-category'),
    getItem(<Link to="/product/color">Màu sắc</Link>, 'attr-color'),
    getItem(<Link to="/product/size">Kích cỡ</Link>, 'attr-size'),
    getItem(<Link to="/product/material">Chất liệu</Link>, 'attr-material'),
    getItem(<Link to="/product/style">Phong cách</Link>, 'attr-style'),
    getItem(<Link to="/product/brand">Thương hiệu</Link>, 'attr-brand'),
  ]),

  // QUẢN LÝ GIẢM GIÁ - Group Divider
  getItem('QUẢN LÝ GIẢM GIÁ', 'discount-group', null, null, 'group'),
  getItem(<Link to="/discount/voucher">Phiếu giảm giá</Link>, 'discount-voucher', <PercentageOutlined />),
  getItem(<Link to="/discount/promotion">Đợt giảm giá</Link>, 'discount-promotion', <GiftOutlined />),

  // QUẢN LÝ HỆ THỐNG - Group Divider
  getItem('QUẢN LÝ HỆ THỐNG', 'system-group', null, null, 'group'),
  getItem(<Link to="/user/staff">Nhân viên</Link>, 'system-staff', <TeamOutlined />),
  getItem(<Link to="/support-chat">Chat hỗ trợ</Link>, 'system-chat', <MessageOutlined />),

  // BÁO CÁO PHÂN TÍCH - Group Divider
  getItem('BÁO CÁO PHÂN TÍCH', 'analytics-group', null, null, 'group'),
  getItem(<Link to="/statistics">Thống kê</Link>, 'analytics-stats', <BarChartOutlined />),
];

function MenuCustomer() {
  const navigate = useNavigate();

  const onClickMenu = (e) => {
    if (e.key === 'logout') {
      localStorage.removeItem('token');
      navigate('/login');
    }
  }

  return (
    <Menu
      defaultSelectedKeys={['1']}
      defaultOpenKeys={['sales-attributes']}
      theme="light"
      mode="inline"
      items={items}
      onClick={onClickMenu}
      style={{
        borderRight: 0,
      }}
    />
  );
}

export default MenuCustomer;