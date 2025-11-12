

import React, { useState } from 'react';
import { Layout, Menu, Tabs, Table, DatePicker, Button } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import dayjs from 'dayjs';
import { users } from './data/user-data.js';

const { Header, Sider, Content } = Layout;


const columns = [
  {
    title: 'Last Name',
    dataIndex: 'lName',
    key: 'lName',
  },
  {
    title: 'Created At',
    dataIndex: 'createdAt',
    key: 'createdAt',
  },
];

// Prepare user data for graph (count by date)
const getGraphData = (data, start, end) => {
  // Group by date
  const counts = {};
  data.forEach(user => {
    const date = dayjs(user.createdAt).format('YYYY-MM-DD');
    if (
      (!start || dayjs(date).isAfter(start.subtract(1, 'day'))) &&
      (!end || dayjs(date).isBefore(end.add(1, 'day')))
    ) {
      counts[date] = (counts[date] || 0) + 1;
    }
  });
  // Convert to array
  return Object.entries(counts).map(([date, count]) => ({ date, count }));
};

function App() {
  const [selectedMenu, setSelectedMenu] = useState('users');
  const [range, setRange] = useState([null, null]);
  const [graphData, setGraphData] = useState(getGraphData(users));

  const handleRangeChange = (dates) => {
    setRange(dates);
  };

  const handleApplyRange = () => {
    setGraphData(getGraphData(users, range[0], range[1]));
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', padding: 0, minHeight: 64 }}>
        {/* Top Nav Bar (blank for now) */}
      </Header>
      <Layout>
        <Sider width={200} style={{ background: '#fff' }}>
          <Menu
            mode="inline"
            selectedKeys={[selectedMenu]}
            style={{ height: '100%', borderRight: 0 }}
            onClick={({ key }) => setSelectedMenu(key)}
            items={[{ key: 'users', label: 'Users' }]}
          />
        </Sider>
        <Layout style={{ padding: '24px' }}>
          <Content style={{ background: '#fff', minHeight: 280 }}>
            {selectedMenu === 'users' && (
              <Tabs defaultActiveKey="1">
                <Tabs.TabPane tab="Table" key="1">
                  <Table columns={columns} dataSource={users} rowKey="createdAt" />
                </Tabs.TabPane>
                <Tabs.TabPane tab="Graph" key="2">
                  <div style={{ marginBottom: 16 }}>
                    <DatePicker.RangePicker
                      value={range}
                      onChange={handleRangeChange}
                      style={{ marginRight: 8 }}
                    />
                    <Button type="primary" onClick={handleApplyRange}>
                      Apply Range
                    </Button>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={graphData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </Tabs.TabPane>
              </Tabs>
            )}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}

export default App;
