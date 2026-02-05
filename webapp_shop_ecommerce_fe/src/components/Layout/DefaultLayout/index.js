import { Layout, theme, Button, Badge, Avatar, Dropdown, Modal, Input } from 'antd';
import Menu from '~/components/Menu';
import React, { useState, useContext, useEffect } from 'react';
import { LoadingOutlined, DownOutlined, UserOutlined, LockOutlined, LogoutOutlined } from '@ant-design/icons';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UploadOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { faBell } from '@fortawesome/free-regular-svg-icons';
import { useOrderData } from '~/provider/OrderDataProvider';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { baseUrl } from '~/lib/functional';
import { getToken, removeToken } from '~/lib/auth';

const { Header, Content, Footer, Sider } = Layout;
const headerStyle = {
  color: 'black',
  backgroundColor: 'white',
  position: 'sticky',
  top: 0,
  zIndex: 2,
  width: '100%',


};

const siderStyle = {

  color: '#000000',
  backgroundColor: 'white',
  height: '100vh',
  position: 'fixed',
  left: 0,
  top: 0,
  bottom: 0,
  zIndex: '3',
};
const contentStyle = {
  marginTop: '84px',
  margin: '24px 16px 0',
  position: 'relative',
  minHeight: '80vh',
  maxWidth: 'calc(100vw-220px)'
}
const footerStyle = {
  textAlign: 'center',
  color: 'black',
  backgroundColor: 'white',
};
const layoutStyle = {
  // overflow: 'hidden',
  position: 'relative',
  width: 'calc(100%)',
  marginLeft: 220,
  maxWidth: 'calc(100%)',
  height: 'calc(100%)'
};
function DefaultLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const { loadingContent, setDataLoadingContent } = useOrderData();

  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Since PrivateRoute already checks for token, we can just set a default user
    // We don't need to fetch profile from backend
    const token = getToken();
    if (token) {
      setUser({ name: 'Admin', avatar: null });
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = () => {
    // This function is no longer needed but keeping it for potential future use
  };

  const handleLogout = () => {
    removeToken();
    navigate('/login', { replace: true });
  };

  const handleChangePassword = () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.warning('Vui lòng điền đầy đủ thông tin');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.warning('Mật khẩu mới không khớp');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.warning('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    axios.put(`${baseUrl}/user/change-password`, {
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    }, {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    })
      .then(res => {
        toast.success('Đổi mật khẩu thành công');
        setIsChangePasswordModalOpen(false);
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      })
      .catch(err => {
        toast.error(err.response?.data?.message || 'Đổi mật khẩu thất bại');
      });
  };

  const menuItems = [
    {
      key: 'changePassword',
      icon: <LockOutlined />,
      label: 'Đổi mật khẩu',
      onClick: () => setIsChangePasswordModalOpen(true)
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      onClick: handleLogout,
      danger: true
    }
  ];

  // Show loading while checking authentication
  if (loading) {
    return (
      <div style={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f1f5f9'
      }}>
        <LoadingOutlined style={{ fontSize: '48px', color: '#ea580c' }} />
      </div>
    );
  }

  return (
    <div >
      <Layout hasSider >
        <Sider style={siderStyle} className="hover-scrollbar">
          <div className='flex justify-center content-center'>
            <img style={{
              width: '160px',
              objectFit: 'contain'
            }} src='/logo.jpg' alt="Logo"></img>
          </div>
          <Menu style={{ width: '100%' }}></Menu>
        </Sider>
        <Layout style={layoutStyle}>

          <Header style={headerStyle} className='p-0 shadow-lg'>

            <div className='flex items-center	justify-end	mr-6'>
              <div className="mr-8 text-right hidden md:block">
                <div className="text-xl font-bold text-gray-700">
                  {currentTime.toLocaleTimeString('vi-VN')}
                </div>
                <div className="text-sm text-gray-500">
                  {currentTime.toLocaleDateString('vi-VN', {
                    weekday: 'short',
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                  })}
                </div>
              </div>
              <div>
                <Badge count={0} showZero>
                  <FontAwesomeIcon className='text-3xl	' icon={faBell}></FontAwesomeIcon>
                </Badge>
              </div>

              <div className='ml-6 flex items-center'>
                <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
                  <div className='flex items-center cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors'>
                    <div>
                      <h4 className='mb-0'>{user?.name || 'Loading...'}</h4>
                    </div>
                    <Avatar className='ml-4' size="large" icon={
                      <>
                        <img src={user?.avatar || "https://cdn-media.sforum.vn/storage/app/media/anh-dep-15.jpg"} />
                      </>
                    } />
                    <DownOutlined className='ml-2 text-gray-400' style={{ fontSize: '12px' }} />
                  </div>
                </Dropdown>
              </div>
            </div>
          </Header>
          <Content style={contentStyle}>
            {children}
            <div >
              {loadingContent && (
                <div
                  style={{
                    position: 'fixed',
                    top: '0',
                    left: '0',
                    bottom: '0',
                    right: '0',
                    backgroundColor: 'rgba(146, 146, 146, 0.33)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1,
                  }}
                >
                  <div className='ml-[220px]'>
                    <LoadingOutlined className='text-6xl text-rose-500	' />
                  </div>

                </div>
              )}
            </div>
          </Content>
          <Footer style={footerStyle}>
            <div className='font-medium	'>
              Peak Sneaker <span>{new Date().getFullYear()}</span> V0.1
            </div>
          </Footer>
        </Layout>
      </Layout>

      {/* Change Password Modal */}
      <Modal
        title="Đổi mật khẩu"
        open={isChangePasswordModalOpen}
        onOk={handleChangePassword}
        onCancel={() => {
          setIsChangePasswordModalOpen(false);
          setPasswordForm({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          });
        }}
        okText="Xác nhận"
        cancelText="Hủy"
      >
        <div className='flex flex-col gap-4 mt-4'>
          <Input.Password
            placeholder="Mật khẩu hiện tại"
            prefix={<LockOutlined />}
            value={passwordForm.currentPassword}
            onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
          />
          <Input.Password
            placeholder="Mật khẩu mới"
            prefix={<LockOutlined />}
            value={passwordForm.newPassword}
            onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
          />
          <Input.Password
            placeholder="Xác nhận mật khẩu mới"
            prefix={<LockOutlined />}
            value={passwordForm.confirmPassword}
            onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
          />
        </div>
      </Modal>
    </div>
  );
}

export default DefaultLayout;



