import { Input, Button } from "antd";
import { LockOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons'
import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { baseUrl } from "../../lib/functional";

export default function ResetPasswordPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [token, setToken] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const tokenParam = searchParams.get('token');
        if (!tokenParam) {
            toast.error('Link không hợp lệ');
            setTimeout(() => navigate('/login'), 2000);
        } else {
            setToken(tokenParam);
        }
    }, [searchParams, navigate]);

    const handleSubmit = () => {
        if (!password) {
            toast.warning('Vui lòng nhập mật khẩu mới');
            return;
        }
        if (password.length < 6) {
            toast.warning('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }
        if (password !== confirmPassword) {
            toast.warning('Mật khẩu xác nhận không khớp');
            return;
        }

        setLoading(true);
        axios.post(`${baseUrl}/auth/reset-password`, {
            token,
            newPassword: password
        })
            .then(res => {
                toast.success('Đặt lại mật khẩu thành công! Vui lòng đăng nhập');
                setTimeout(() => {
                    navigate('/login');
                }, 1500);
            })
            .catch(err => {
                toast.error(err.response?.data?.message || 'Link đã hết hạn hoặc không hợp lệ');
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

            {/* Right Side - Reset Password Form */}
            <div className="w-full lg:w-1/2 flex justify-center items-center bg-white p-8 sm:p-20">
                <div className="w-full max-w-[450px] flex flex-col gap-8">

                    {/* Header: Logo & Title */}
                    <div className="text-center flex flex-col items-center gap-4">
                        <img src="/logo.jpg" alt="Peak Sneaker Logo" className="w-20 h-20 object-contain rounded-full shadow-sm" />
                        <div>
                            <h1 className="text-3xl font-bold text-orange-600 uppercase tracking-wide">Đặt lại mật khẩu</h1>
                            <p className="text-slate-500 mt-2 text-sm font-medium">Nhập mật khẩu mới của bạn</p>
                        </div>
                    </div>

                    {/* Form Inputs */}
                    <div className="flex flex-col gap-5 mt-4">
                        <Input.Password
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            size="large"
                            placeholder="Mật khẩu mới"
                            prefix={<LockOutlined className="text-slate-400" />}
                            iconRender={(visible) => (visible ? <EyeTwoTone twoToneColor="#ea580c" /> : <EyeInvisibleOutlined />)}
                            className="rounded-lg py-3 hover:border-orange-400 focus:border-orange-500"
                        />

                        <Input.Password
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            size="large"
                            placeholder="Xác nhận mật khẩu mới"
                            prefix={<LockOutlined className="text-slate-400" />}
                            iconRender={(visible) => (visible ? <EyeTwoTone twoToneColor="#ea580c" /> : <EyeInvisibleOutlined />)}
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
                            Đặt lại mật khẩu
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
