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
    const today = dayjs();
    const registeredToday = users.filter((user) => {
      const userDate = dayjs(user.createdAt);
      return userDate.isSame(today, "day");
    }).length;

    return (
      <div className={styles.tabExtraContent}>
        <Space>
          <Statistic
            title="Total Users"
            value={users.length}
            valueStyle={{ color: "var(--success-color)", fontSize: "16px" }}
            style={{ textAlign: "right", marginRight: 16 }}
          />
          <Statistic
            title="Registered Today"
            value={registeredToday}
            valueStyle={{ color: "var(--primary-color)", fontSize: "16px" }}
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

  // Process data for day-of-week chart
  const dayOfWeekChartData = useMemo(() => {
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
  }, [userData, dateRange]);

  // Process data for hour-of-day chart
  const hourOfDayChartData = useMemo(() => {
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
  }, [userData, dateRange]);

  // Enhanced day-of-week chart with current week performance
  const enhancedDayOfWeekChartData = useMemo(() => {
    const today = dayjs();
    const startOfWeek = today.startOf("week"); // Sunday
    const currentDayOfWeek = today.day(); // 0 = Sunday, 6 = Saturday
    const startOfPastWeek = today.subtract(7, 'day').startOf("week"); // Sunday of past week

    // Get all historical data (excluding current week for average calculation)
    const historicalData = userData.filter((item) => {
      const itemDate = dayjs(item.createdAt);
      return !itemDate.isSame(startOfWeek, "week");
    });

    // Get current week data
    const currentWeekData = userData.filter((item) => {
      const itemDate = dayjs(item.createdAt);
      return itemDate.isSame(startOfWeek, "week");
    });

    // Get past 4 weeks data
    const pastWeeksData = [];
    for (let i = 1; i <= 4; i++) {
      const weekStart = today.subtract(i, 'week').startOf("week");
      const weekData = userData.filter((item) => {
        const itemDate = dayjs(item.createdAt);
        return itemDate.isSame(weekStart, "week");
      });
      pastWeeksData.push(weekData);
    }

    // Calculate historical averages by day
    const historicalDayGroups = {
      Sunday: [],
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
    };

    // Group historical data by weeks, then by days
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

    // Get past 4 weeks counts
    const pastWeeksCounts = [];
    for (let i = 0; i < 4; i++) {
      const weekCounts = {
        Sunday: 0,
        Monday: 0,
        Tuesday: 0,
        Wednesday: 0,
        Thursday: 0,
        Friday: 0,
        Saturday: 0,
      };
      
      pastWeeksData[i].forEach((item) => {
        const dayOfWeek = dayjs(item.createdAt).format("dddd");
        weekCounts[dayOfWeek]++;
      });
      
      pastWeeksCounts.push(weekCounts);
    }

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
      average: Math.round(averages[day] * 100) / 100, // Round to 2 decimal places
      thisWeek: index <= currentDayOfWeek ? currentWeekCounts[day] : null, // Only show up to today
      pastWeek1: pastWeeksCounts[0][day], // 1 week ago
      pastWeek2: pastWeeksCounts[1][day], // 2 weeks ago
      pastWeek3: pastWeeksCounts[2][day], // 3 weeks ago
      pastWeek4: pastWeeksCounts[3][day], // 4 weeks ago
      isToday: index === currentDayOfWeek,
    }));
  }, [userData]);

  // Enhanced hour-of-day chart with today's performance
  const enhancedHourOfDayChartData = useMemo(() => {
    const today = dayjs();
    const currentHour = today.hour();

    // Get all historical data (excluding today for average calculation)
    const historicalData = userData.filter((item) => {
      const itemDate = dayjs(item.createdAt);
      return !itemDate.isSame(today, "day");
    });

    // Get today's data
    const todayData = userData.filter((item) => {
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
        average: Math.round(averages[i] * 100) / 100, // Round to 2 decimal places
        today: i <= currentHour ? todayCounts[i] : null, // Only show up to current hour
        isCurrentHour: i === currentHour,
      });
    }

    return chartData;
  }, [userData]);

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
      label: <span>Registration Progression</span>,
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
    {
      key: "3",
      label: <span>Registration by Day</span>,
      children: (
        <Card size="small" className={styles.cardContainer}>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={enhancedDayOfWeekChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="shortDay" fontSize={12} />
                <YAxis
                  label={{
                    value: "Number of Users Registered",
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
                  dot={{ r: 3, fill: "var(--warning-color, #faad14)" }}
                  name="Historical Average"
                />
                <Line
                  type="monotone"
                  dataKey="thisWeek"
                  stroke="var(--primary-color, #1890ff)"
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  dot={{ r: 4, fill: "var(--primary-color, #1890ff)" }}
                  name="This Week"
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="pastWeek1"
                  stroke="var(--success-color, #52c41a)"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                  dot={{ r: 3, fill: "var(--success-color, #52c41a)" }}
                  name="1 Week Ago"
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="pastWeek2"
                  stroke="#ff7875"
                  strokeWidth={2}
                  strokeDasharray="2 4"
                  dot={{ r: 3, fill: "#ff7875" }}
                  name="2 Weeks Ago"
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="pastWeek3"
                  stroke="#b37feb"
                  strokeWidth={2}
                  strokeDasharray="4 2"
                  dot={{ r: 3, fill: "#b37feb" }}
                  name="3 Weeks Ago"
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="pastWeek4"
                  stroke="#36cfc9"
                  strokeWidth={2}
                  strokeDasharray="1 3"
                  dot={{ r: 3, fill: "#36cfc9" }}
                  name="4 Weeks Ago"
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
      label: <span>Registration by Hour</span>,
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
                    value: "Number of Users Registered",
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
                  stroke="var(--success-color, #52c41a)"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "var(--success-color, #52c41a)" }}
                  name="Historical Average"
                />
                <Line
                  type="monotone"
                  dataKey="today"
                  stroke="var(--error-color, #ff4d4f)"
                  strokeWidth={3}
                  strokeDasharray="8 4"
                  dot={{ r: 5, fill: "var(--error-color, #ff4d4f)" }}
                  name="Today"
                  connectNulls={false}
                />
                <ReferenceLine
                  x={
                    enhancedHourOfDayChartData.find((d) => d.isCurrentHour)
                      ?.displayHour
                  }
                  stroke="var(--error-color, #ff4d4f)"
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

export default UserStatistics;
