// src/client/components/Dashboard/Dashboard.jsx

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Activity, DollarSign, Calendar } from 'lucide-react';

const Dashboard = () => {
  // Dados de exemplo para os gráficos
  const chartData = [
    { name: 'Jan', clients: 65, sessions: 45 },
    { name: 'Feb', clients: 72, sessions: 52 },
    { name: 'Mar', clients: 85, sessions: 58 },
    { name: 'Apr', clients: 78, sessions: 48 },
    { name: 'May', clients: 90, sessions: 65 },
    { name: 'Jun', clients: 95, sessions: 70 }
  ];

  const stats = [
    {
      title: "Total Clients",
      value: "256",
      icon: <Users className="h-6 w-6" />,
      change: "+12%",
      changeColor: "text-green-500"
    },
    {
      title: "Active Sessions",
      value: "45",
      icon: <Activity className="h-6 w-6" />,
      change: "+5%",
      changeColor: "text-green-500"
    },
    {
      title: "Monthly Revenue",
      value: "$12,450",
      icon: <DollarSign className="h-6 w-6" />,
      change: "+8%",
      changeColor: "text-green-500"
    },
    {
      title: "Upcoming Sessions",
      value: "24",
      icon: <Calendar className="h-6 w-6" />,
      change: "-2%",
      changeColor: "text-red-500"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-gray-500">{stat.title}</div>
                <div className="p-2 bg-gray-100 rounded-full">{stat.icon}</div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <div className="text-2xl font-semibold">{stat.value}</div>
                <div className={`text-sm ${stat.changeColor}`}>{stat.change}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-4">Client Growth</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="clients" 
                    stroke="#4F46E5" 
                    strokeWidth={2} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-4">Session Activity</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="sessions" 
                    stroke="#10B981" 
                    strokeWidth={2} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Table */}
      <Card>
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Activity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[1, 2, 3, 4, 5].map((_, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">Client {index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap">Session Completed</td>
                    <td className="px-6 py-4 whitespace-nowrap">2024-03-{15 - index}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Completed
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;