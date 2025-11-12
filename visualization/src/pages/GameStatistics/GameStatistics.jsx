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
import { games } from "../../data/game-data.js";
import "../../styles/common.css";
import styles from "./GameStatistics.module.css";

const { RangePicker } = DatePicker;

const GameStatistics = () => {
  const [dateRange, setDateRange] = useState(null);
  const [activeTab, setActiveTab] = useState("1");

  // Get game data
  const getGameData = () => {
    return games.map((game, index) => ({
      key: index + 1,
      id: game.id,
      name: game.name,
      creatorName: game.creatorLastName,
      createdAt: game.createdAt,
      createdDate: dayjs(game.createdAt).format("YYYY-MM-DD"),
    }));
  };

  const gameData = getGameData();

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
    const uniqueCreators = [
      ...new Set(games.map((game) => game.creatorLastName)),
    ].length;
    return (
      <div className={styles.tabExtraContent}>
        <Space>
          <Statistic
            title="Total Games"
            value={games.length}
            valueStyle={{ color: "var(--success-color)", fontSize: "16px" }}
            style={{ textAlign: "right", marginRight: 16 }}
          />
          <Statistic
            title="Unique Creators"
            value={uniqueCreators}
            valueStyle={{ color: "var(--primary-color)", fontSize: "16px" }}
            style={{ textAlign: "right" }}
          />
        </Space>
      </div>
    );
  };

  // Process data for chart
  const chartData = useMemo(() => {
    let filteredData = gameData;

    // Apply date filter if set
    if (dateRange && dateRange[0] && dateRange[1]) {
      const startDate = dateRange[0].startOf("day");
      const endDate = dateRange[1].endOf("day");

      filteredData = gameData.filter((item) => {
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
  }, [gameData, dateRange]);

  // Table columns for games
  const gameColumns = [
    // {
    //   title: "ID",
    //   dataIndex: "id",
    //   key: "id",
    //   width: 60,
    //   sorter: (a, b) => a.id - b.id,
    // },
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

  // Tab items
  const tabItems = [
    {
      key: "1",
      label: <span>Data Table</span>,
      children: (
        <Card size="small" className={styles.cardContainer}>
          <Table
            columns={gameColumns}
            dataSource={gameData}
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
                    value: "Number of Games Created",
                    angle: -90,
                    position: "insideLeft",
                  }}
                  fontSize={11}
                />
                <Tooltip
                  labelFormatter={(label) => `Date: ${label}`}
                  formatter={(value) => [value, "Games Created"]}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="var(--primary-color)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="Games Created"
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

export default GameStatistics;
