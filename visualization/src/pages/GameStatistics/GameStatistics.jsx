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
  ReferenceLine,
} from "recharts";
import dayjs from "dayjs";
import { games } from "../../data/game-data.js";
import "../../styles/common.css";
import styles from "./GameStatistics.module.css";

const { RangePicker } = DatePicker;

const GameStatistics = () => {
  // Set default date range to 30 days: from 30 days ago to today
  const [dateRange, setDateRange] = useState(() => {
    const endDate = dayjs();
    const startDate = dayjs().subtract(30, 'day');
    return [startDate, endDate];
  });
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
    // Show date filter for Chart View tabs (2, 3, and 4)
    if (activeTab === "2" || activeTab === "3" || activeTab === "4") {
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

  // Process data for day-of-week chart
  const dayOfWeekChartData = useMemo(() => {
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

    // Group by day of week
    const dayGroups = {
      Sunday: 0,
      Monday: 0,
      Tuesday: 0,
      Wednesday: 0,
      Thursday: 0,
      Friday: 0,
      Saturday: 0,
    };

    filteredData.forEach((item) => {
      const dayOfWeek = dayjs(item.createdAt).format("dddd");
      dayGroups[dayOfWeek]++;
    });

    // Convert to chart format in proper order
    const daysOrder = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return daysOrder.map((day) => ({
      day,
      count: dayGroups[day],
      shortDay: day.substring(0, 3), // For display
    }));
  }, [gameData, dateRange]);

  // Process data for hour-of-day chart
  const hourOfDayChartData = useMemo(() => {
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

    // Group by hour of day (0-23)
    const hourGroups = {};
    for (let i = 0; i < 24; i++) {
      hourGroups[i] = 0;
    }

    filteredData.forEach((item) => {
      const hour = dayjs(item.createdAt).hour();
      hourGroups[hour]++;
    });

    // Convert to chart format
    return Object.entries(hourGroups)
      .map(([hour, count]) => {
        const hourNum = parseInt(hour);
        const displayHour =
          hourNum === 0
            ? "12 AM"
            : hourNum === 12
            ? "12 PM"
            : hourNum < 12
            ? `${hourNum} AM`
            : `${hourNum - 12} PM`;

        return {
          hour: hourNum,
          count: count,
          displayHour,
          period: hourNum < 12 ? "AM" : "PM",
        };
      })
      .sort((a, b) => a.hour - b.hour);
  }, [gameData, dateRange]);

  // Enhanced day-of-week chart with current week performance
  const enhancedDayOfWeekChartData = useMemo(() => {
    const today = dayjs();
    const startOfWeek = today.startOf("week"); // Sunday
    const currentDayOfWeek = today.day(); // 0 = Sunday, 6 = Saturday

    // Get all historical data (excluding current week for average calculation)
    const historicalData = gameData.filter((item) => {
      const itemDate = dayjs(item.createdAt);
      return !itemDate.isSame(startOfWeek, "week");
    });

    // Get current week data
    const currentWeekData = gameData.filter((item) => {
      const itemDate = dayjs(item.createdAt);
      return itemDate.isSame(startOfWeek, "week");
    });

    // Calculate historical averages by day
    const weekGroups = {};
    historicalData.forEach((item) => {
      const itemDate = dayjs(item.createdAt);
      const weekKey = itemDate.startOf("week").format("YYYY-MM-DD");
      const dayOfWeek = itemDate.format("dddd");

      if (!weekGroups[weekKey]) {
        weekGroups[weekKey] = {
          Sunday: 0,
          Monday: 0,
          Tuesday: 0,
          Wednesday: 0,
          Thursday: 0,
          Friday: 0,
          Saturday: 0,
        };
      }
      weekGroups[weekKey][dayOfWeek]++;
    });

    // Calculate averages
    const weekCount = Object.keys(weekGroups).length;
    const averages = {
      Sunday: 0,
      Monday: 0,
      Tuesday: 0,
      Wednesday: 0,
      Thursday: 0,
      Friday: 0,
      Saturday: 0,
    };

    if (weekCount > 0) {
      Object.values(weekGroups).forEach((week) => {
        Object.keys(averages).forEach((day) => {
          averages[day] += week[day];
        });
      });

      Object.keys(averages).forEach((day) => {
        averages[day] = averages[day] / weekCount;
      });
    }

    // Get current week counts
    const currentWeekCounts = {
      Sunday: 0,
      Monday: 0,
      Tuesday: 0,
      Wednesday: 0,
      Thursday: 0,
      Friday: 0,
      Saturday: 0,
    };

    currentWeekData.forEach((item) => {
      const dayOfWeek = dayjs(item.createdAt).format("dddd");
      currentWeekCounts[dayOfWeek]++;
    });

    // Create chart data
    const daysOrder = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return daysOrder.map((day, index) => ({
      day,
      shortDay: day.substring(0, 3),
      average: Math.round(averages[day] * 100) / 100,
      thisWeek: index <= currentDayOfWeek ? currentWeekCounts[day] : null,
      isToday: index === currentDayOfWeek,
    }));
  }, [gameData]);

  // Enhanced hour-of-day chart with today's performance
  const enhancedHourOfDayChartData = useMemo(() => {
    const today = dayjs();
    const currentHour = today.hour();

    // Get all historical data (excluding today for average calculation)
    const historicalData = gameData.filter((item) => {
      const itemDate = dayjs(item.createdAt);
      return !itemDate.isSame(today, "day");
    });

    // Get today's data
    const todayData = gameData.filter((item) => {
      const itemDate = dayjs(item.createdAt);
      return itemDate.isSame(today, "day");
    });

    // Calculate historical averages by hour
    const dayGroups = {};
    historicalData.forEach((item) => {
      const itemDate = dayjs(item.createdAt);
      const dayKey = itemDate.format("YYYY-MM-DD");
      const hour = itemDate.hour();

      if (!dayGroups[dayKey]) {
        dayGroups[dayKey] = {};
        for (let i = 0; i < 24; i++) {
          dayGroups[dayKey][i] = 0;
        }
      }
      dayGroups[dayKey][hour]++;
    });

    // Calculate averages
    const dayCount = Object.keys(dayGroups).length;
    const averages = {};
    for (let i = 0; i < 24; i++) {
      averages[i] = 0;
    }

    if (dayCount > 0) {
      Object.values(dayGroups).forEach((day) => {
        for (let i = 0; i < 24; i++) {
          averages[i] += day[i];
        }
      });

      for (let i = 0; i < 24; i++) {
        averages[i] = averages[i] / dayCount;
      }
    }

    // Get today's counts
    const todayCounts = {};
    for (let i = 0; i < 24; i++) {
      todayCounts[i] = 0;
    }

    todayData.forEach((item) => {
      const hour = dayjs(item.createdAt).hour();
      todayCounts[hour]++;
    });

    // Create chart data
    const chartData = [];
    for (let i = 0; i < 24; i++) {
      const displayHour =
        i === 0
          ? "12 AM"
          : i === 12
          ? "12 PM"
          : i < 12
          ? `${i} AM`
          : `${i - 12} PM`;

      chartData.push({
        hour: i,
        displayHour,
        average: Math.round(averages[i] * 100) / 100,
        today: i <= currentHour ? todayCounts[i] : null,
        isCurrentHour: i === currentHour,
      });
    }

    return chartData;
  }, [gameData]);

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
      label: <span>Creation Progression</span>,
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
    {
      key: "3",
      label: <span>Creation by Day</span>,
      children: (
        <Card size="small" className={styles.cardContainer}>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={enhancedDayOfWeekChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="shortDay" fontSize={12} />
                <YAxis
                  label={{
                    value: "Number of Games Created",
                    angle: -90,
                    position: "insideLeft",
                  }}
                  fontSize={11}
                />
                <Tooltip
                  labelFormatter={(label) =>
                    `Day: ${
                      enhancedDayOfWeekChartData.find(
                        (d) => d.shortDay === label
                      )?.day || label
                    }`
                  }
                  formatter={(value, name) => [
                    value === null ? "No data yet" : value,
                    name,
                  ]}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="average"
                  stroke="var(--warning-color, #faad14)"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "var(--warning-color, #faad14)" }}
                  name="Historical Average"
                />
                <Line
                  type="monotone"
                  dataKey="thisWeek"
                  stroke="var(--primary-color, #1890ff)"
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  dot={{ r: 5, fill: "var(--primary-color, #1890ff)" }}
                  name="This Week"
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>

            {enhancedDayOfWeekChartData.every(
              (d) =>
                d.average === 0 && (d.thisWeek === 0 || d.thisWeek === null)
            ) && (
              <div className={styles.noDataMessage}>
                No data available for the selected date range
              </div>
            )}
          </div>
        </Card>
      ),
    },
    {
      key: "4",
      label: <span>Creation by Hour</span>,
      children: (
        <Card size="small" className={styles.cardContainer}>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={enhancedHourOfDayChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="displayHour"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={10}
                  interval={0}
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
                  labelFormatter={(label) => `Time: ${label}`}
                  formatter={(value, name) => [
                    value === null ? "No data yet" : value,
                    name,
                  ]}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="average"
                  stroke="var(--error-color, #ff4d4f)"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "var(--error-color, #ff4d4f)" }}
                  name="Historical Average"
                />
                <Line
                  type="monotone"
                  dataKey="today"
                  stroke="var(--success-color, #52c41a)"
                  strokeWidth={3}
                  strokeDasharray="8 4"
                  dot={{ r: 5, fill: "var(--success-color, #52c41a)" }}
                  name="Today"
                  connectNulls={false}
                />
                <ReferenceLine
                  x={
                    enhancedHourOfDayChartData.find((d) => d.isCurrentHour)
                      ?.displayHour
                  }
                  stroke="var(--success-color, #52c41a)"
                  strokeDasharray="2 2"
                  label={{ value: "Now", position: "top" }}
                />
              </LineChart>
            </ResponsiveContainer>

            {enhancedHourOfDayChartData.every(
              (d) => d.average === 0 && (d.today === 0 || d.today === null)
            ) && (
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
