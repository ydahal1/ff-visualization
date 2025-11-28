import React, { useState, useMemo } from "react";
import { Tabs, Table, Modal, Button, Card, Statistic, Space } from "antd";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import dayjs from "dayjs";
import { games } from "../../data/game-data.js";
import "../../styles/common.css";
import styles from "./ReturningUsers.module.css";

const ReturningUsers = () => {
  const [activeTab, setActiveTab] = useState("1");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Analyze returning users data on the fly
  const returningUsers = useMemo(() => {
    // Group games by user
    const userGames = {};
    games.forEach((game) => {
      if (!userGames[game.creatorId]) {
        userGames[game.creatorId] = {
          lastName: game.creatorLastName,
          games: [],
        };
      }
      userGames[game.creatorId].games.push(game);
    });

    // Find users who created games on multiple different dates
    const returningUsers = [];

    Object.keys(userGames).forEach((creatorId) => {
      const userGameList = userGames[creatorId].games;

      // Extract unique dates (without time)
      const uniqueDates = new Set(
        userGameList.map((game) => game.createdAt.split(",")[0])
      );

      if (uniqueDates.size > 1) {
        const userData = {
          creatorId: creatorId,
          lastName: userGames[creatorId].lastName,
          totalGames: userGameList.length,
          uniqueDates: Array.from(uniqueDates),
          games: userGameList,
        };
        
        returningUsers.push(userData);
      }
    });

    // Sort by total games created
    returningUsers.sort((a, b) => b.totalGames - a.totalGames);

    return returningUsers;
  }, []);

  // Prepare chart data for selected user
  const getUserChartData = (user) => {
    if (!user) return [];

    // Group games by date
    const dateGroups = {};
    user.games.forEach((game) => {
      const date = game.createdAt.split(",")[0];
      dateGroups[date] = (dateGroups[date] || 0) + 1;
    });

    // Convert to chart format and sort by date
    return Object.entries(dateGroups)
      .map(([date, count]) => ({
        date,
        count,
        formattedDate: dayjs(date).format("MMM DD, YYYY"),
      }))
      .sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf());
  };

  const handleGameCountClick = (user) => {
    setSelectedUser(user);
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedUser(null);
  };

  // Table columns for returning users
  const columns = [
    {
      title: "#",
      key: "index",
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Name",
      dataIndex: "lastName",
      key: "lastName",
      sorter: (a, b) => a.lastName.localeCompare(b.lastName),
    },
    {
      title: "Game Count",
      dataIndex: "totalGames",
      key: "totalGames",
      sorter: (a, b) => a.totalGames - b.totalGames,
      render: (count, record) => (
        <Button
          type="link"
          onClick={() => handleGameCountClick(record)}
          style={{ padding: 0, height: 'auto', color: '#1890ff' }}
        >
          {count}
        </Button>
      ),
    },
    {
      title: "Unique Days",
      dataIndex: "uniqueDates",
      key: "uniqueDays",
      sorter: (a, b) => a.uniqueDates.length - b.uniqueDates.length,
      render: (uniqueDates) => uniqueDates.length,
    },
  ];

  // Get tab extra content with statistics
  const getTabExtraContent = () => {
    return (
      <div className={styles.tabExtraContent}>
        <Space>
          <Statistic
            title="Returning Users"
            value={returningUsers.length}
            valueStyle={{ color: "var(--success-color)", fontSize: "16px" }}
            style={{ textAlign: "right", marginRight: 16 }}
          />
          <Statistic
            title="Total Games"
            value={returningUsers.reduce((sum, user) => sum + user.totalGames, 0)}
            valueStyle={{ color: "var(--primary-color)", fontSize: "16px" }}
            style={{ textAlign: "right" }}
          />
        </Space>
      </div>
    );
  };

  // Tab items
  const tabItems = [
    {
      key: "1",
      label: <span>Returning Users</span>,
      children: (
        <Card size="small" className={styles.cardContainer}>
          <Table
            columns={columns}
            dataSource={returningUsers.map((user, index) => ({
              ...user,
              key: index,
            }))}
            pagination={{
              pageSize: 10,
              showSizeChanger: false,
              showTotal: false,
            }}
            size="small"
            scroll={{ x: "max-content" }}
            className={styles.dataTable}
          />
        </Card>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <Tabs
        defaultActiveKey="1"
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        size="default"
        className={styles.tabs}
        tabBarExtraContent={getTabExtraContent()}
      />

      <Modal
        title={`Game Creation Timeline - ${selectedUser?.lastName}`}
        open={modalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={1000}
        className={styles.modal}
      >
        {selectedUser && (
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={getUserChartData(selectedUser)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="formattedDate"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={11}
                />
                <YAxis
                  label={{
                    value: "Games Created",
                    angle: -90,
                    position: "insideLeft",
                  }}
                  fontSize={11}
                />
                <Tooltip
                  labelFormatter={(label) => `Date: ${label}`}
                  formatter={(value) => [value, "Games"]}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#1890ff"
                  strokeWidth={3}
                  dot={{ r: 6, fill: "#1890ff" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ReturningUsers;