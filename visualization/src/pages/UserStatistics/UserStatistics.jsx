  // Table columns for Returning Users
  const returningUsersColumns = [
    {
      title: "Last Name",
      dataIndex: "lastName",
      key: "lastName",
      align: "center",
    },
    {
      title: "Games Created",
      dataIndex: "totalGames",
      key: "totalGames",
      align: "center",
    },
    {
      title: "Unique Days",
      dataIndex: "uniqueDates",
      key: "uniqueDays",
      align: "center",
      render: (uniqueDates) => (uniqueDates ? uniqueDates.length : 0),
    },
  ];
import React, { useState, useMemo } from "react";
import { Tabs, Table, DatePicker, Space, Card, Statistic, Modal, Button } from "antd";
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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import dayjs from "dayjs";
import { users } from "../../data/user-data.js";
import { games } from "../../data/game-data.js";
import "../../styles/common.css";
import styles from "./UserStatistics.module.css";

const { RangePicker } = DatePicker;

// Custom label component for showing weekly totals at the end of lines
const WeeklyTotalLabel = ({ viewBox, value, fill }) => {
  const { x, y } = viewBox;
  if (value === null || value === undefined) return null;
  
  return (
    <text
      x={x + 5}
      y={y}
      fill={fill}
      fontSize={12}
      fontWeight="bold"
      textAnchor="start"
      dominantBaseline="middle"
    >
      {`Total: ${value}`}
    </text>
  );
};

const UserStatistics = () => {
  // Set default date range to 30 days: from 30 days ago to today
  const [dateRange, setDateRange] = useState(() => {
    const endDate = dayjs();
    const startDate = dayjs().subtract(30, 'day');
    return [startDate, endDate];
  });
  const [activeTab, setActiveTab] = useState("1");
  const [activeIndex, setActiveIndex] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Get user data with games count
  const getUserData = () => {
    // Calculate games count per user by user ID
    const gamesCountByUserId = {};
    games.forEach((game) => {
      const creatorId = game.creatorId;
      gamesCountByUserId[creatorId] = (gamesCountByUserId[creatorId] || 0) + 1;
    });

    return users.map((user, index) => ({
      key: index + 1,
      id: index + 1,
      name: user.lName,
      createdAt: user.createdAt,
      createdDate: dayjs(user.createdAt).format("YYYY-MM-DD"),
      gamesCount: gamesCountByUserId[user.id] || 0,
    }));
  };

  const userData = getUserData();

  // Generate tab extra content based on active tab
  const getTabExtraContent = (activeTab) => {
    // Show date filter for Chart View tabs (2, 4, and 5)
    if (activeTab === "2" || activeTab === "4" || activeTab === "5") {
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

  // Process data for monthly registration chart (past 4 months)
  const monthlyRegistrationData = useMemo(() => {
    const today = dayjs();
    const months = [];
    
    // Generate data for the current month and past 3 months (total 4 months)
    for (let i = 3; i >= 0; i--) {
      const monthStart = today.subtract(i, 'month').startOf('month');
      const monthKey = monthStart.format('YYYY-MM');
      const monthLabel = monthStart.format('MMM');
      
      months.push({
        monthKey,
        monthLabel,
        monthStart,
        isCurrentMonth: i === 0
      });
    }

    // Create chart data with days 1-31
    const chartData = [];
    for (let day = 1; day <= 31; day++) {
      const dayData = { day };
      
      // Initialize counts for each month
      months.forEach(month => {
        dayData[month.monthKey] = null; // Use null for days that don't exist in that month
      });
      
      chartData.push(dayData);
    }

    // Initialize monthly totals
    const monthlyTotals = {};
    months.forEach(month => {
      monthlyTotals[month.monthKey] = 0;
    });

    // Count registrations per day of month for each month
    userData.forEach((item) => {
      const itemDate = dayjs(item.createdAt);
      const dayOfMonth = itemDate.date(); // 1-31
      
      // Check which tracked month this date belongs to
      months.forEach(month => {
        if (itemDate.isSame(month.monthStart, 'month')) {
          const daysInMonth = month.monthStart.daysInMonth();
          
          // Only count if this day exists in the month
          if (dayOfMonth <= daysInMonth) {
            if (chartData[dayOfMonth - 1][month.monthKey] === null) {
              chartData[dayOfMonth - 1][month.monthKey] = 0;
            }
            chartData[dayOfMonth - 1][month.monthKey]++;
            monthlyTotals[month.monthKey]++;
          }
        }
      });
    });

    return {
      chartData,
      months,
      monthlyTotals
    };
  }, [userData]);

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

    // Calculate weekly totals
    const thisWeekTotal = Object.values(currentWeekCounts).reduce((sum, val) => sum + val, 0);
    const pastWeek1Total = Object.values(pastWeeksCounts[0]).reduce((sum, val) => sum + val, 0);
    const pastWeek2Total = Object.values(pastWeeksCounts[1]).reduce((sum, val) => sum + val, 0);
    const pastWeek3Total = Object.values(pastWeeksCounts[2]).reduce((sum, val) => sum + val, 0);
    const pastWeek4Total = Object.values(pastWeeksCounts[3]).reduce((sum, val) => sum + val, 0);
    const averageTotal = Object.values(averages).reduce((sum, val) => sum + val, 0);

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
    const chartData = daysOrder.map((day, index) => ({
      day,
      shortDay: day.substring(0, 3),
      average: Math.round(averages[day] * 100) / 100, // Round to 2 decimal places
      thisWeek: index <= currentDayOfWeek ? currentWeekCounts[day] : null, // Only show up to today
      pastWeek1: pastWeeksCounts[0][day], // 1 week ago
      pastWeek2: pastWeeksCounts[1][day], // 2 weeks ago
      pastWeek3: pastWeeksCounts[2][day], // 3 weeks ago
      pastWeek4: pastWeeksCounts[3][day], // 4 weeks ago
      isToday: index === currentDayOfWeek,
      // Add weekly totals to each data point
      averageTotal: Math.round(averageTotal * 100) / 100,
      thisWeekTotal: thisWeekTotal,
      pastWeek1Total: pastWeek1Total,
      pastWeek2Total: pastWeek2Total,
      pastWeek3Total: pastWeek3Total,
      pastWeek4Total: pastWeek4Total,
    }));

    return {
      chartData,
      currentDayOfWeek, // Include this for label positioning
      weeklyTotals: {
        average: Math.round(averageTotal * 100) / 100,
        thisWeek: thisWeekTotal,
        pastWeek1: pastWeek1Total,
        pastWeek2: pastWeek2Total,
        pastWeek3: pastWeek3Total,
        pastWeek4: pastWeek4Total,
      }
    };
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

  // Data for user registration vs game creation pie chart
  const userEngagementData = useMemo(() => {
    // Get unique users who created games
    const usersWhoCreatedGames = new Set();
    games.forEach((game) => {
      usersWhoCreatedGames.add(game.creatorLastName);
    });

    const totalUsers = users.length;
    const usersWithGames = Array.from(usersWhoCreatedGames).filter(userName => 
      users.some(user => user.lName === userName)
    ).length;
    const usersWithoutGames = totalUsers - usersWithGames;

    const percentageWithGames = totalUsers > 0 ? ((usersWithGames / totalUsers) * 100).toFixed(1) : 0;
    const percentageWithoutGames = totalUsers > 0 ? ((usersWithoutGames / totalUsers) * 100).toFixed(1) : 0;

    return [
      {
        name: 'Users Who Created Games',
        value: usersWithGames,
        percentage: percentageWithGames,
        color: 'var(--success-color, #52c41a)',
      },
      {
        name: 'Users Who Did Not Create Games',
        value: usersWithoutGames,
        percentage: percentageWithoutGames,
        color: 'var(--warning-color, #faad14)',
      },
    ];
  }, []);

  // Data for games per user distribution pie chart
  const gamesPerUserDistribution = useMemo(() => {

    // Calculate games count per user by user ID
    const gamesCountByUserId = {};
    games.forEach((game) => {
      const creatorId = game.creatorId;
      gamesCountByUserId[creatorId] = (gamesCountByUserId[creatorId] || 0) + 1;
    });

    // Count how many users created X games, bucket 21+ games
    const distribution = {};
    users.forEach((user) => {
      const gameCount = gamesCountByUserId[user.id] || 0;
      let bucket = gameCount;
      if (gameCount > 20) bucket = 21;
      distribution[bucket] = (distribution[bucket] || 0) + 1;
    });

    // Define colors for the pie chart slices
    const colors = [
      '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe',
      '#00c49f', '#ffbb28', '#ff6b9d', '#a4de6c', '#d084d0',
      '#8dd1e1', '#83a6ed', '#ffa07a', '#98d8c8', '#f6a5b6', '#b0b0b0'
    ];

    // Convert to array format for pie chart, sorted by game count (ascending)
    const chartData = [];
    for (let i = 0; i <= 20; i++) {
      if (distribution[i]) {
        chartData.push({
          name: `${i} Game${i === 1 ? '' : 's'}`,
          gameCount: i,
          value: distribution[i],
          percentage: users.length > 0 ? ((distribution[i] / users.length) * 100).toFixed(1) : 0,
        });
      }
    }
    if (distribution[21]) {
      chartData.push({
        name: `21+ Games`,
        gameCount: 21,
        value: distribution[21],
        percentage: users.length > 0 ? ((distribution[21] / users.length) * 100).toFixed(1) : 0,
      });
    }

    // Assign colors
    chartData.forEach((item, index) => {
      item.color = colors[index % colors.length];
    });

    return chartData;
  }, []);


  // Table columns for Games Per User
  const gamesPerUserTableColumns = [
    {
      title: 'Number of Games',
      dataIndex: 'gameCount',
      key: 'gameCount',
      align: 'center',
      render: (value) => (value === 21 ? '21+' : value),
    },
    {
      title: 'Number of Users',
      dataIndex: 'value',
      key: 'value',
      align: 'center',
    },
  ];

  // Returning users data
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

  // Prepare chart data for selected returning user
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
      },
      {
        title: "Unique Days",
        dataIndex: "uniqueDates",
        key: "uniqueDays",
        sorter: (a, b) => a.uniqueDates.length - b.uniqueDates.length,
        render: (uniqueDates) => (uniqueDates ? uniqueDates.length : 0),
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
      label: <span>Registration by Month</span>,
      children: (
        <Card size="small" className={styles.cardContainer}>
          <div style={{ marginBottom: '12px', padding: '8px 12px', background: '#f5f5f5', borderRadius: '4px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '12px' }}>
              {monthlyRegistrationData.months.map((month, index) => {
                const colors = [
                  'var(--primary-color, #1890ff)',
                  'var(--success-color, #52c41a)',
                  'var(--warning-color, #faad14)',
                  'var(--error-color, #ff4d4f)'
                ];
                const total = monthlyRegistrationData.monthlyTotals?.[month.monthKey] || 0;
                return (
                  <span key={month.monthKey} style={{ color: colors[index % colors.length], fontWeight: 'bold' }}>
                    {month.monthLabel}: {total} users
                  </span>
                );
              })}
            </div>
          </div>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyRegistrationData.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="day"
                  fontSize={12}
                  label={{
                    value: "Day of Month",
                    position: "insideBottom",
                    offset: -5,
                  }}
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
                  labelFormatter={(label) => `Day ${label}`}
                />
                <Legend />
                {monthlyRegistrationData.months.map((month, index) => {
                  const colors = [
                    'var(--primary-color, #1890ff)',
                    'var(--success-color, #52c41a)',
                    'var(--warning-color, #faad14)',
                    'var(--error-color, #ff4d4f)'
                  ];
                  return (
                    <Line
                      key={month.monthKey}
                      type="monotone"
                      dataKey={month.monthKey}
                      stroke={colors[index % colors.length]}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      name={month.monthLabel}
                      connectNulls={false}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>

            {monthlyRegistrationData.chartData.length === 0 && (
              <div className={styles.noDataMessage}>
                No data available
              </div>
            )}
          </div>
        </Card>
      ),
    },
    {
      key: "4",
      label: <span>Registration by Week</span>,
      children: (
        <Card size="small" className={styles.cardContainer}>
          <div style={{ marginBottom: '12px', padding: '8px 12px', background: '#f5f5f5', borderRadius: '4px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '12px' }}>
              <span style={{ color: 'var(--primary-color, #1890ff)', fontWeight: 'bold' }}>
                This Week: {enhancedDayOfWeekChartData.weeklyTotals?.thisWeek || 0} users
              </span>
              <span style={{ color: 'var(--success-color, #52c41a)', fontWeight: 'bold' }}>
                1 Week Ago: {enhancedDayOfWeekChartData.weeklyTotals?.pastWeek1 || 0} users
              </span>
              <span style={{ color: '#ff7875', fontWeight: 'bold' }}>
                2 Weeks Ago: {enhancedDayOfWeekChartData.weeklyTotals?.pastWeek2 || 0} users
              </span>
              <span style={{ color: '#b37feb', fontWeight: 'bold' }}>
                3 Weeks Ago: {enhancedDayOfWeekChartData.weeklyTotals?.pastWeek3 || 0} users
              </span>
              <span style={{ color: '#36cfc9', fontWeight: 'bold' }}>
                4 Weeks Ago: {enhancedDayOfWeekChartData.weeklyTotals?.pastWeek4 || 0} users
              </span>
              <span style={{ color: 'var(--warning-color, #faad14)', fontWeight: 'bold' }}>
                Historical Avg: {enhancedDayOfWeekChartData.weeklyTotals?.average || 0} users
              </span>
            </div>
          </div>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={enhancedDayOfWeekChartData.chartData}>
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
                      enhancedDayOfWeekChartData.chartData.find(
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

            {enhancedDayOfWeekChartData.chartData.every(
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
      key: "5",
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
    {
      key: "6",
      label: <span>User Engagement</span>,
      children: (
        <Card size="small" className={styles.cardContainer}>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={userEngagementData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percentage, value }) => 
                    `${name}: ${value} (${percentage}%)`
                  }
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {userEngagementData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => [
                    `${value} users (${props.payload.percentage}%)`,
                    props.payload.name
                  ]}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value, entry) => `${entry.payload.name} (${entry.payload.percentage}%)`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      ),
    },
    {
      key: "7",
      label: <span>Games Per User</span>,
      children: (
        <Card size="small" className={styles.cardContainer}>
          <Table
            columns={gamesPerUserTableColumns}
            dataSource={gamesPerUserDistribution.map((row, idx) => ({ ...row, key: idx }))}
            pagination={false}
            bordered
            style={{ margin: '24px 0', width: '100%', maxWidth: 500 }}
          />
        </Card>
      ),
    },
    {
      key: "8",
      label: <span>Returning Users</span>,
      children: (
        <Card size="small" className={styles.cardContainer}>
          <div style={{ marginBottom: '16px' }}>
            <Space>
              <Statistic
                title="Returning Users"
                value={returningUsers.length}
                valueStyle={{ color: "var(--success-color)", fontSize: "16px" }}
              />
              <Statistic
                title="Total Games"
                value={returningUsers.reduce((sum, user) => sum + user.totalGames, 0)}
                valueStyle={{ color: "var(--primary-color)", fontSize: "16px" }}
              />
            </Space>
          </div>
          <Table
            columns={returningUsersColumns}
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
        tabBarExtraContent={getTabExtraContent(activeTab)}
      />

      {/* Modal for returning user timeline */}
      <Modal
        title={`Game Creation Timeline - ${selectedUser?.lastName}`}
        open={modalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={1000}
      >
        {selectedUser && (
          <div style={{ height: '400px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
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

export default UserStatistics;
