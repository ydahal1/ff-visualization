import React, { useState, useMemo } from "react";
import { Tabs, Table, DatePicker, Space, Card, Statistic } from "antd";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import dayjs from "dayjs";
import { users } from "../../data/user-data.js";
import { games } from "../../data/game-data.js";
import "../../styles/common.css";
import styles from "./UserStatistics.module.css";

const { RangePicker } = DatePicker;

const UserStatistics = () => {
  const [dateRange, setDateRange] = useState(null);
  const [activeTab, setActiveTab] = useState("1");

  // Get user data with games count
  const getUserData = () => {
    // Calculate games count per user
    const gamesCountByUser = {};
    games.forEach((game) => {
      const creator = game.creatorLastName;
      gamesCountByUser[creator] = (gamesCountByUser[creator] || 0) + 1;
    });

    return users.map((user, index) => ({
      key: index + 1,
      id: index + 1,
      name: user.lName,
      createdAt: user.createdAt,
      createdDate: dayjs(user.createdAt).format("YYYY-MM-DD"),
      gamesCount: gamesCountByUser[user.lName] || 0,
    }));
  };

  const userData = getUserData();

  // Generate tab extra content based on active tab
  const getTabExtraContent = (activeTab) => {
    // Show date filter for Chart View tab
    if (activeTab === "2") {
      return (
        <div className={styles.tabExtraContent}>
          <RangePicker
            value={dateRange}
            onChange={setDateRange}
            format="YYYY-MM-DD"
            allowClear
            placeholder={["Start Date", "End Date"]}
            size="small"
          />
        </div>
      );
    }

    // Show statistics for Data Table tab
    return (
      <div className={styles.tabExtraContent}>
        <Space>
          <Statistic
            title="Total Users"
            value={users.length}
            valueStyle={{ color: "var(--success-color)", fontSize: "16px" }}
            style={{ textAlign: "right" }}
          />
        </Space>
      </div>
    );
  };

  // Process data for chart
  const chartData = useMemo(() => {
    let filteredData = userData;

    // Apply date filter if set
    if (dateRange && dateRange[0] && dateRange[1]) {
      const startDate = dateRange[0].startOf("day");
      const endDate = dateRange[1].endOf("day");

      filteredData = userData.filter((item) => {
        const itemDate = dayjs(item.createdAt);
        return itemDate.isAfter(startDate) && itemDate.isBefore(endDate);
      });
    }

    // Group by date and count
    const dateGroups = {};
    filteredData.forEach((item) => {
      const date = dayjs(item.createdAt).format("YYYY-MM-DD");
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
  }, [userData, dateRange]);

  // Table columns for users
  const userColumns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 60,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "Last Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Games Created",
      dataIndex: "gamesCount",
      key: "gamesCount",
      width: 120,
      sorter: (a, b) => a.gamesCount - b.gamesCount,
      render: (count) => (
        <span
          className={`${styles.gamesCountBadge} ${
            count > 0 ? styles.gamesCountActive : styles.gamesCountInactive
          } ${count > 10 ? styles.gamesCountHigh : ""}`}
        >
          {count}
        </span>
      ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: (a, b) =>
        dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf(),
    },
  ];

  // Tab items
  const tabItems = [
    {
      key: "1",
      label: <span>Data Table</span>,
      children: (
        <Card size="small" className={styles.cardContainer}>
          <Table
            columns={userColumns}
            dataSource={userData}
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
    {
      key: "2",
      label: <span>Chart View</span>,
      children: (
        <Card size="small" className={styles.cardContainer}>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
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
                    value: "Number of Users Created",
                    angle: -90,
                    position: "insideLeft",
                  }}
                  fontSize={11}
                />
                <Tooltip
                  labelFormatter={(label) => `Date: ${label}`}
                  formatter={(value) => [value, "Users Created"]}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="var(--primary-color)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="Users Created"
                />
              </LineChart>
            </ResponsiveContainer>

            {chartData.length === 0 && (
              <div className={styles.noDataMessage}>
                No data available for the selected date range
              </div>
            )}
          </div>
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
        tabBarExtraContent={getTabExtraContent(activeTab)}
      />
    </div>
  );
};

export default UserStatistics;
