import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { Link } from 'react-router-dom';
import {
    ShoppingOutlined,
    UserOutlined,
    TeamOutlined,
    InboxOutlined,
    BarChartOutlined,
    AppstoreOutlined,
} from '@ant-design/icons';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import axios from 'axios';
import { baseUrl, numberToPrice } from '../../lib/functional';
import dayjs from 'dayjs';

function Dashboard() {
    const [stats, setStats] = useState({
        todayOrders: 0,
        todayProducts: 0,
        newCustomers: 0,
        totalStaff: 6,
        totalCategories: 5,
    });

    const [revenueData, setRevenueData] = useState([]);

    useEffect(() => {
        // Fetch revenue data for the last 7 days
        const endDate = dayjs();
        const startDate = dayjs().add(-6, 'day');

        axios.get(`${baseUrl}/statistical/revenue?startdate=${startDate.add(1, 'day').toISOString()}&enddate=${endDate.add(1, 'day').toISOString()}`)
            .then(res => {
                setRevenueData(res.data.map(r => ({
                    ...r,
                    revenue: r.revenue || 0
                })));
            })
            .catch(e => console.log(e));

        // Fetch today's statistics
        axios.get(`${baseUrl}/statistical/lastweek`)
            .then(res => {
                if (res.data && res.data[0]) {
                    setStats(prev => ({
                        ...prev,
                        todayOrders: res.data[0].completedOrders || 0,
                    }));
                }
            })
            .catch(e => console.log(e));
    }, []);

    const maxRevenue = revenueData.length > 0 ? Math.max(...revenueData.map(r => r.revenue)) : 0;
    const revenueTicks = [];
    const tickStep = 500000;
    for (let i = 0; i <= maxRevenue + tickStep; i += tickStep) {
        revenueTicks.push(i);
        if (i >= maxRevenue) break;
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Welcome Banner with Mini Chart */}
            <div className="rounded-2xl shadow-xl p-8 text-white relative overflow-hidden" style={{ background: 'linear-gradient(90deg, #f97316 0%, #ea580c 100%)' }}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    {/* Left Side - Text Content */}
                    <div className="z-10">
                        <h1 className="text-5xl font-bold mb-4">Dashboard Tổng Quan</h1>
                        <p className="text-lg opacity-90 mb-6">Chào mừng trở lại! Đây là tổng quan về hệ thống của bạn</p>
                        <div className="flex gap-4">
                            <Link to="/statistics">
                                <button className="bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-all shadow-md flex items-center gap-2 border-none">
                                    <BarChartOutlined />
                                    Xem thống kê chi tiết
                                </button>
                            </Link>
                        </div>
                    </div>

                    {/* Right Side - Mini Chart */}
                    <div className="z-10 hidden lg:block">
                        <ResponsiveContainer width="100%" height={180}>
                            <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenueBanner" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ffffff" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#ffffff" stopOpacity={0.05} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="time"
                                    stroke="#ffffff"
                                    strokeOpacity={0.8}
                                    tick={{ fill: '#ffffff', fontSize: 11, fontWeight: 500 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    stroke="#ffffff"
                                    strokeOpacity={0.8}
                                    tick={{ fill: '#ffffff', fontSize: 11, fontWeight: 500 }}
                                    axisLine={false}
                                    tickLine={false}
                                    ticks={revenueTicks}
                                    domain={[0, 'max']}
                                    tickFormatter={(value) => {
                                        if (value === 0) return '0';
                                        return `${(value / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
                                    }}
                                />
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" strokeOpacity={0.2} />
                                <Tooltip
                                    content={data => {
                                        if (!data.payload || !data.payload[0]) return null;
                                        return (
                                            <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                                                <p className="font-semibold text-gray-700">
                                                    Doanh thu: {numberToPrice(data.payload[0].value)}
                                                </p>
                                            </div>
                                        );
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#ffffff"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorRevenueBanner)"
                                    dot={{ fill: '#ffffff', strokeWidth: 2, r: 5, stroke: '#f97316' }}
                                    activeDot={{ r: 7, fill: '#ffffff', stroke: '#f97316', strokeWidth: 3 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>



            {/* System Overview */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Tổng quan hệ thống</h2>

                <Row gutter={[24, 24]}>
                    <Col xs={24} sm={12} lg={8}>
                        <Card className="text-center shadow-md hover:shadow-xl transition-all border-0 bg-orange-50">
                            <div className="flex items-center justify-center mb-3">
                                <div className="bg-orange-600 p-4 rounded-full">
                                    <InboxOutlined className="text-3xl text-white" />
                                </div>
                            </div>
                            <Statistic
                                title={<span className="text-lg font-semibold text-gray-700">ĐƠN HÀNG HÔM NAY</span>}
                                value={stats.todayOrders}
                                valueStyle={{ color: '#ea580c', fontSize: '32px', fontWeight: 'bold' }}
                            />
                            <p className="text-sm text-gray-500 mt-2">Đang hoạt động</p>
                        </Card>
                    </Col>



                    <Col xs={24} sm={12} lg={8}>
                        <Card className="text-center shadow-md hover:shadow-xl transition-all border-0 bg-orange-50">
                            <div className="flex items-center justify-center mb-3">
                                <div className="bg-orange-600 p-4 rounded-full">
                                    <TeamOutlined className="text-3xl text-white" />
                                </div>
                            </div>
                            <Statistic
                                title={<span className="text-lg font-semibold text-gray-700">NHÂN VIÊN</span>}
                                value={stats.totalStaff}
                                valueStyle={{ color: '#ea580c', fontSize: '32px', fontWeight: 'bold' }}
                            />
                            <p className="text-sm text-gray-500 mt-2">Đang hoạt động</p>
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} lg={8}>
                        <Card className="text-center shadow-md hover:shadow-xl transition-all border-0 bg-orange-50">
                            <div className="flex items-center justify-center mb-3">
                                <div className="bg-orange-600 p-4 rounded-full">
                                    <AppstoreOutlined className="text-3xl text-white" />
                                </div>
                            </div>
                            <Statistic
                                title={<span className="text-lg font-semibold text-gray-700">DANH MỤC</span>}
                                value={stats.totalCategories}
                                valueStyle={{ color: '#ea580c', fontSize: '32px', fontWeight: 'bold' }}
                            />
                            <p className="text-sm text-gray-500 mt-2">Đang hoạt động</p>
                        </Card>
                    </Col>
                </Row>
            </div>
        </div>
    );
}

export default Dashboard;
