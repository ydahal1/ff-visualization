import React, { useState } from "react";
import { Layout, Menu, Typography } from "antd";
import { UserOutlined, PlayCircleOutlined } from "@ant-design/icons";
import UserStatistics from "./pages/UserStatistics/UserStatistics";
import GameStatistics from "./pages/GameStatistics/GameStatistics";
import "./styles/common.css";
import styles from "./App.module.css";

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const App = () => {
  const [selectedMenu, setSelectedMenu] = useState("users");

  // Menu items for sidebar
  const menuItems = [
    {
      key: "users",
      icon: <UserOutlined />,
      label: "User Statistics",
    },
    {
      key: "games",
      icon: <PlayCircleOutlined />,
      label: "Game Statistics",
    },
  ];

  const handleMenuClick = ({ key }) => {
    setSelectedMenu(key);
  };

  // Render the current page based on selected menu
  const renderCurrentPage = () => {
    switch (selectedMenu) {
      case "users":
        return <UserStatistics />;
      case "games":
        return <GameStatistics />;
      default:
        return <UserStatistics />;
    }
  };

  // Get page title based on selected menu
  const getPageTitle = () => {
    switch (selectedMenu) {
      case "users":
        return "User Statistics";
      case "games":
        return "Game Statistics";
      default:
        return "User Statistics";
    }
  };

  return (
    <Layout className={styles.layout}>
      <Sider width={200} className={styles.sider}>
        <div style={{ padding: "16px", textAlign: "center" }}>
          <Title level={4} style={{ color: "#1890ff", margin: 0 }}>
            Dashboard
          </Title>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedMenu]}
          onClick={handleMenuClick}
          items={menuItems}
          className={styles.menu}
        />
      </Sider>
      <Layout>
        <Header className={styles.header}>
          <Title level={2} className={styles.pageTitle}>
            {getPageTitle()}
          </Title>
        </Header>
        <Content className={styles.content}>
          <div className={styles.contentContainer}>{renderCurrentPage()}</div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;
