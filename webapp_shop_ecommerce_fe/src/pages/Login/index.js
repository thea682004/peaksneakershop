import { Input, Button, Checkbox } from "antd";
import { UserOutlined, LockOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons'
import { useState } from 'react'
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { baseUrl } from "../../lib/functional";
import { setToken } from "../../lib/auth";

export default function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = () => {
        if (username.trim().length == 0) {
            toast.warning('Vui lòng nhập tên đăng nhập');
            return;
        }
        if (password.trim().length == 0) {
            toast.warning('Vui lòng nhập mật khẩu');
            return;
        }

        setLoading(true);
        const data = {
            email: username,
            password: password
        }

        axios.post(`${baseUrl}/login`, data)
            .then(res => {
                console.log('✅ Login response:', res.data);

                // Handle response structure: {status, message, count, data: {token, authenticated}}
                if (res.data && res.data.data && res.data.data.token) {
                    setToken(res.data.data.token);
                    toast.success('Đăng nhập thành công');

                    // Redirect to the page they tried to access, or home
                    const from = location.state?.from?.pathname || '/';
                    setTimeout(() => {
                        navigate(from, { replace: true });
                    }, 1000);
                } else {
                    console.error('❌ Invalid response structure:', res.data);
                    toast.error('Đăng nhập thất bại - Không nhận được token');
                    setLoading(false);
                }
            })
            .catch(err => {
                console.error('❌ Login error:', err.response?.data || err.message);
                setLoading(false);
                const errorMessage = err.response?.data?.message || 'Đăng nhập thất bại';
                toast.error(errorMessage);
            });
    }

    // Standard inline styles (User accepted this layout over the split-screen)
    const containerStyle = {
        height: '100vh',
        width: '100vw',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f1f5f9'
    };

    const cardStyle = {
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        width: '400px'
    };

    return (
        <div style={containerStyle}>
            <ToastContainer />
            <div style={cardStyle}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#ea580c', textTransform: 'uppercase', marginBottom: '8px' }}>Peak Sneaker</h1>
                    <p style={{ color: '#64748b' }}>Đăng nhập hệ thống</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <Input
                        value={username}
                        onChange={e => { setUsername(e.target.value) }}
                        size="large"
                        placeholder="Email hoặc số điện thoại"
                        prefix={<UserOutlined style={{ color: '#94a3b8' }} />}
                    />

                    <Input.Password
                        value={password}
                        onChange={e => { setPassword(e.target.value) }}
                        size="large"
                        placeholder="Mật khẩu"
                        prefix={<LockOutlined style={{ color: '#94a3b8' }} />}
                        iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                        onPressEnter={handleSubmit}
                    />

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                        <a href="/forgot-password" style={{ color: '#ea580c' }}>Quên mật khẩu?</a>
                        <a href="/register" style={{ color: '#ea580c' }}>Đăng ký mới</a>
                    </div>

                    <Button
                        type="primary"
                        size="large"
                        onClick={handleSubmit}
                        loading={loading}
                        style={{ backgroundColor: '#ea580c', borderColor: '#ea580c', marginTop: '8px' }}
                    >
                        Đăng nhập
                    </Button>
                </div>
            </div>
        </div>
    )
}