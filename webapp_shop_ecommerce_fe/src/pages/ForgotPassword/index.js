import { Input, Button } from "antd";
import { MailOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { baseUrl } from "../../lib/functional";

export default function ForgotPasswordPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = () => {
        if (!email.trim()) {
            toast.warning('Vui lòng nhập email');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.warning('Email không hợp lệ');
            return;
        }

        setLoading(true);
        axios.post(`${baseUrl}/auth/forgot-password`, { email })
            .then(res => {
                toast.success('Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư của bạn');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            })
            .catch(err => {
                toast.error(err.response?.data?.message || 'Không tìm thấy email này trong hệ thống');
            })
            .finally(() => {
                setLoading(false);
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

            {/* Right Side - Forgot Password Form */}
            <div className="w-full lg:w-1/2 flex justify-center items-center bg-white p-8 sm:p-20">
                <div className="w-full max-w-[450px] flex flex-col gap-8">

                    {/* Header: Logo & Title */}
                    <div className="text-center flex flex-col items-center gap-4">
                        <img src="/logo.jpg" alt="Peak Sneaker Logo" className="w-20 h-20 object-contain rounded-full shadow-sm" />
                        <div>
                            <h1 className="text-3xl font-bold text-orange-600 uppercase tracking-wide">Quên mật khẩu</h1>
                            <p className="text-slate-500 mt-2 text-sm font-medium">Nhập email để nhận link đặt lại mật khẩu</p>
                        </div>
                    </div>

                    {/* Form Input */}
                    <div className="flex flex-col gap-5 mt-4">
                        <Input
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            size="large"
                            placeholder="Email của bạn"
                            prefix={<MailOutlined className="text-slate-400" />}
                            className="rounded-lg py-3 hover:border-orange-400 focus:border-orange-500"
                            onPressEnter={handleSubmit}
                        />

                        {/* Submit Button */}
                        <Button
                            type="primary"
                            size="large"
                            onClick={handleSubmit}
                            loading={loading}
                            className="w-full bg-orange-500 hover:!bg-orange-600 border-none shadow-lg shadow-orange-500/30 h-12 text-lg font-semibold rounded-lg mt-2 tracking-wide"
                        >
                            Gửi email đặt lại mật khẩu
                        </Button>

                        {/* Back to Login */}
                        <div className="text-center mt-2">
                            <a href="/login" className="text-sm text-slate-500 hover:text-orange-600 hover:underline">
                                ← Quay lại đăng nhập
                            </a>
                        </div>
                    </div>

                    {/* Footer / Copyright */}
                    <div className="text-center mt-8">
                        <p className="text-xs text-slate-400">© 2026 Peak Sneaker. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
