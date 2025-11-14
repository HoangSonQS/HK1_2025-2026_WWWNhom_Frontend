import React from 'react';
import { Layout, Typography } from 'antd';
import '../styles/home.css';

const { Content } = Layout;
const { Title } = Typography;

const Home = () => {
    return (
        <Layout className="home-layout">
            <Content className="home-content">
                <div className="home-container">
                    <Title level={1}>Chào mừng đến với SEBook</Title>
                    <Title level={3} type="secondary">
                        Trang chủ đang được phát triển...
                    </Title>
                </div>
            </Content>
        </Layout>
    );
};

export default Home;

