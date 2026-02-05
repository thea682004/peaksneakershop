import { Input, Button } from "antd";
import { UserOutlined, LockOutlined, EyeInvisibleOutlined, EyeTwoTone, PhoneOutlined, MailOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { baseUrl } from "../../lib/functional";

export default function RegisterPage() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const validateForm = () => {
        if (!formData.name.trim()) {
            toast.warning('Vui lòng nhập họ tên');
            return false;
        }
        if (!formData.email.trim()) {
            toast.warning('Vui lòng nhập email');
            return false;
        }
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            toast.warning('Email không hợp lệ');
            return false;
        }
        if (!formData.phone.trim()) {
            toast.warning('Vui lòng nhập số điện thoại');
            return false;
        }
        // Phone validation (10-11 digits)
        const phoneRegex = /^[0-9]{10,11}$/;
        if (!phoneRegex.test(formData.phone.trim())) {
            toast.warning('Số điện thoại không hợp lệ');
            return false;
        }
        if (!formData.password) {
            toast.warning('Vui lòng nhập mật khẩu');
            return false;
        }
        if (formData.password.length < 6) {
            toast.warning('Mật khẩu phải có ít nhất 6 ký tự');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            toast.warning('Mật khẩu xác nhận không khớp');
            return false;
        }
        return true;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;

        const data = {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            password: formData.password
        };

        axios.post(`${baseUrl}/register`, data)
            .then(res => {
                toast.success('Đăng ký thành công! Vui lòng đăng nhập');
                setTimeout(() => {
                    navigate('/login');
                }, 1500);
            })
            .catch(err => {
                toast.error(err.response?.data?.message || 'Đăng ký thất bại');
            });
    };

    return (
        <div className="h-screen w-screen flex overflow-hidden bg-gray-50">
            <ToastContainer />

            {/* Left Side - Illustration */}
            <div className="hidden lg:flex w-1/2 bg-blue-50 justify-center items-center relative">
                <div className="absolute inset-0 bg-blue-100/50 backdrop-blur-sm z-0"></div>
                <div className="z-10 text-center">
                    <img src="/logo.jpg" alt="Illustration" className="w-[300px] h-auto object-contain mx-auto mix-blend-multiply opacity-80" />
                </div>
                {/* Decorative circles */}
                <div className="absolute top-20 left-20 w-16 h-16 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                <div className="absolute top-40 right-20 w-16 h-16 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-40 w-16 h-16 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
            </div>

            {/* Right Side - Registration Form */}
            <div className="w-full lg:w-1/2 flex justify-center items-center bg-white p-8 sm:p-20 overflow-y-auto">
                <div className="w-full max-w-[450px] flex flex-col gap-6">

                    {/* Header: Logo & Title */}
                    <div className="text-center flex flex-col items-center gap-3">
                        <img src="/logo.jpg" alt="Peak Sneaker Logo" className="w-20 h-20 object-contain rounded-full shadow-sm" />
                        <div>
                            <h1 className="text-3xl font-bold text-orange-600 uppercase tracking-wide">Đăng ký tài khoản</h1>
                            <p className="text-slate-500 mt-2 text-sm font-medium">Tạo tài khoản Peak Sneaker mới</p>
                        </div>
                    </div>

                    {/* Form Inputs */}
                    <div className="flex flex-col gap-4">
                        <Input
                            value={formData.name}
                            onChange={e => handleChange('name', e.target.value)}
                            size="large"
                            placeholder="Họ và tên"
                            prefix={<UserOutlined className="text-slate-400" />}
                            className="rounded-lg py-3 hover:border-orange-400 focus:border-orange-500"
                        />

                        <Input
                            value={formData.email}
                            onChange={e => handleChange('email', e.target.value)}
                            size="large"
                            placeholder="Email"
                            prefix={<MailOutlined className="text-slate-400" />}
                            className="rounded-lg py-3 hover:border-orange-400 focus:border-orange-500"
                        />

                        <Input
                            value={formData.phone}
                            onChange={e => handleChange('phone', e.target.value)}
                            size="large"
                            placeholder="Số điện thoại"
                            prefix={<PhoneOutlined className="text-slate-400" />}
                            className="rounded-lg py-3 hover:border-orange-400 focus:border-orange-500"
                        />

                        <Input.Password
                            value={formData.password}
                            onChange={e => handleChange('password', e.target.value)}
                            size="large"
                            placeholder="Mật khẩu"
                            prefix={<LockOutlined className="text-slate-400" />}
                            iconRender={(visible) => (visible ? <EyeTwoTone twoToneColor="#ea580c" /> : <EyeInvisibleOutlined />)}
                            className="rounded-lg py-3 hover:border-orange-400 focus:border-orange-500"
                        />

                        <Input.Password
                            value={formData.confirmPassword}
                            onChange={e => handleChange('confirmPassword', e.target.value)}
                            size="large"
                            placeholder="Xác nhận mật khẩu"
                            prefix={<LockOutlined className="text-slate-400" />}
                            iconRender={(visible) => (visible ? <EyeTwoTone twoToneColor="#ea580c" /> : <EyeInvisibleOutlined />)}
                            className="rounded-lg py-3 hover:border-orange-400 focus:border-orange-500"
                            onPressEnter={handleSubmit}
                        />

                        {/* Register Button */}
                        <Button
                            type="primary"
                            size="large"
                            onClick={handleSubmit}
                            className="w-full bg-orange-500 hover:!bg-orange-600 border-none shadow-lg shadow-orange-500/30 h-12 text-lg font-semibold rounded-lg mt-2 tracking-wide"
                        >
                            Đăng ký
                        </Button>

                        {/* Link to Login */}
                        <div className="text-center mt-2">
                            <span className="text-sm text-slate-500">Đã có tài khoản? </span>
                            <a href="/login" className="text-sm text-orange-600 hover:text-orange-700 hover:underline font-semibold">
                                Đăng nhập ngay
                            </a>
                        </div>
                    </div>

                    {/* Footer / Copyright */}
                    <div className="text-center mt-4">
                        <p className="text-xs text-slate-400">© 2026 Peak Sneaker. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
