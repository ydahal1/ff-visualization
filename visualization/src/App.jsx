import React, { useState, useMemo } from "react";
import {
  Layout,
  Menu,
  Tabs,
  Table,
  DatePicker,
  Space,
  Card,
  Typography,
} from "antd";
import {
  UserOutlined,
  TableOutlined,
  LineChartOutlined,
  PlayCircleOutlined,
  ClockCircleOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import dayjs from "dayjs";
import { users } from "./data/user-data.js";
import { games } from "./data/game-data.js";
import "./App.css";

const { Header, Sider, Content } = Layout;
const { RangePicker } = DatePicker;
const { Title } = Typography;

const App = () => {
  const [selectedMenu, setSelectedMenu] = useState("users");
  const [dateRange, setDateRange] = useState(null);

  // Get current data based on selected menu
  const getCurrentData = () => {
    switch (selectedMenu) {
      case "users":
        return users.map((user, index) => ({
          key: index + 1,
          id: index + 1,
          name: user.lName,
          createdAt: user.createdAt,
          createdDate: dayjs(user.createdAt).format("YYYY-MM-DD"),
        }));
      case "games":
        return games.map((game, index) => ({
          key: index + 1,
          id: game.id,
          name: game.name,
          creatorName: game.creatorLastName,
          createdAt: game.createdAt,
          createdDate: dayjs(game.createdAt).format("YYYY-MM-DD"),
        }));
      default:
        return [];
    }
  };

  const currentData = getCurrentData();

  // Process data for chart
  const chartData = useMemo(() => {
    let filteredData = currentData;

    // Apply date filter if set
    if (dateRange && dateRange[0] && dateRange[1]) {
      const startDate = dateRange[0].startOf("day");
      const endDate = dateRange[1].endOf("day");

      filteredData = currentData.filter((item) => {
        const itemDate = dayjs(item.createdAt);
        return itemDate.isAfter(startDate) && itemDate.isBefore(endDate);
      });
    }

    if (selectedMenu === "games") {
      // For games, group by creator and count games per creator
      const creatorGroups = {};
      filteredData.forEach((item) => {
        const creator = item.creatorName || "Unknown";
        creatorGroups[creator] = (creatorGroups[creator] || 0) + 1;
      });

      // Convert to chart format and sort by count
      return Object.entries(creatorGroups)
        .map(([creator, count]) => ({
          creator,
          count,
          name: creator, // for tooltip
        }))
        .sort((a, b) => b.count - a.count);
    } else {
      // For other data types, group by date and count
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
    }
  }, [currentData, dateRange, selectedMenu]);

  // Dynamic table columns based on selected menu
  const getColumns = () => {
    const baseColumns = [
      {
        title: "ID",
        dataIndex: "id",
        key: "id",
        width: 60,
        sorter: (a, b) => a.id - b.id,
      },
    ];

    switch (selectedMenu) {
      case "users":
        return [
          ...baseColumns,
          {
            title: "Last Name",
            dataIndex: "name",
            key: "name",
            sorter: (a, b) => a.name.localeCompare(b.name),
          },
          {
            title: "Created At",
            dataIndex: "createdAt",
            key: "createdAt",
            sorter: (a, b) =>
              dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf(),
          },
        ];
      case "games":
        return [
          {
            title: "Game Name",
            dataIndex: "name",
            key: "name",
            sorter: (a, b) => a.name.localeCompare(b.name),
          },
          {
            title: "Creator Name",
            dataIndex: "creatorName",
            key: "creatorName",
            sorter: (a, b) => a.creatorName.localeCompare(b.creatorName),
          },
          {
            title: "Created At",
            dataIndex: "createdAt",
            key: "createdAt",
            sorter: (a, b) =>
              dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf(),
          },
        ];

      default:
        return baseColumns;
    }
  };

  // Menu items for sidebar
  const menuItems = [
    {
      key: "users",
      icon: <UserOutlined />,
      label: "Users",
    },
    {
      key: "games",
      icon: <PlayCircleOutlined />,
      label: "Games",
    },
  ];

  // Tab items
  const tabItems = [
    {
      key: "1",
      label: <span>Data Table</span>,
      children: (
        <Card size="small" style={{ marginTop: 0 }}>
          <Table
            columns={getColumns()}
            dataSource={currentData}
            pagination={false}
            size="small"
            scroll={{ x: "max-content" }}
            style={{ marginTop: 0 }}
          />
        </Card>
      ),
    },
    {
      key: "2",
      label: <span>Chart View</span>,
      children: (
        <Card size="small" style={{ marginTop: 0 }}>
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <div>
              <span style={{ marginRight: 16, fontWeight: 500 }}>
                Filter by Date Range:
              </span>
              <RangePicker
                value={dateRange}
                onChange={setDateRange}
                format="YYYY-MM-DD"
                allowClear
                placeholder={["Start Date", "End Date"]}
                size="small"
              />
            </div>

            <div style={{ height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                {selectedMenu === "games" ? (
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="creator"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={11}
                    />
                    <YAxis
                      label={{
                        value: "Number of Games Created",
                        angle: -90,
                        position: "insideLeft",
                      }}
                      fontSize={11}
                    />
                    <Tooltip
                      labelFormatter={(label) => `Creator: ${label}`}
                      formatter={(value) => [value, "Games Created"]}
                    />
                    <Legend />
                    <Bar dataKey="count" fill="#1890ff" name="Games Created" />
                  </BarChart>
                ) : (
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
                        value: `Number of ${selectedMenu} Created`,
                        angle: -90,
                        position: "insideLeft",
                      }}
                      fontSize={11}
                    />
                    <Tooltip
                      labelFormatter={(label) => `Date: ${label}`}
                      formatter={(value) => [value, `${selectedMenu} Created`]}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#1890ff"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      name={`${selectedMenu} Created`}
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>

            {chartData.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 0",
                  color: "#999",
                }}
              >
                No data available for the selected date range
              </div>
            )}
          </Space>
        </Card>
      ),
    },
  ];

  const handleMenuClick = ({ key }) => {
    setSelectedMenu(key);
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        width={200}
        style={{
          background: "#fff",
          boxShadow: "2px 0 6px rgba(0, 21, 41, 0.1)",
          position: "fixed",
          height: "100vh",
          left: 0,
          top: 0,
          zIndex: 10,
        }}
      >
        <div
          style={{
            padding: "16px",
            borderBottom: "1px solid #f0f0f0",
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "16px",
          }}
        >
          Dashboard
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedMenu]}
          onClick={handleMenuClick}
          style={{ height: "100%", borderRight: 0 }}
          items={menuItems}
        />
      </Sider>

      <Layout style={{ marginLeft: 200 }}>
        <Header
          style={{
            background: "#fff",
            padding: "0 24px",
            boxShadow: "0 2px 6px rgba(0, 21, 41, 0.1)",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Title level={4} style={{ margin: 0, textTransform: "capitalize" }}>
            {selectedMenu} Management
          </Title>
        </Header>

        <Content
          style={{
            margin: "16px",
            padding: "16px",
            background: "#f5f5f5",
            minHeight: 280,
          }}
        >
          <Tabs
            defaultActiveKey="1"
            items={tabItems}
            size="default"
            style={{ background: "transparent" }}
          />
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;
