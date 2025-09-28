

import React from 'react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { DollarSign, Users, Briefcase, FileText } from 'lucide-react';

const salesData = [
  { name: 'يناير', sales: 4000 },
  { name: 'فبراير', sales: 3000 },
  { name: 'مارس', sales: 5000 },
  { name: 'أبريل', sales: 4500 },
];

const customerData = [{ name: 'راضٍ', value: 850 }, { name: 'محايد', value: 150 }];
const CUSTOMER_COLORS = ['#f59e0b', '#64748b'];

const reportData = [
  { name: 'مبيعات', count: 120 },
  { name: 'صيانة', count: 80 },
  { name: 'مشاريع', count: 45 },
];

const productivityData = [
  { name: 'فريق أ', value: 80 },
  { name: 'فريق ب', value: 95 },
];

const kpiData = [
  { title: 'الإيرادات', value: '1.2M ر.س', change: '+5.2%', icon: DollarSign },
  { title: 'العملاء النشطين', value: '850', change: '+20', icon: Users },
  { title: 'المشاريع الجارية', value: '12', change: '+1', icon: Briefcase },
  { title: 'التقارير المقدمة', value: '450', change: '+30', icon: FileText },
];

export const AdvancedStats: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>الإحصائيات المتقدمة</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiData.map(({ title, value, change, icon: Icon }) => (
            <Card key={title}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-600 dark:text-slate-300">{title}</p>
                  <Icon className="text-primary" size={20} />
                </div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-success">{change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle>اتجاه المبيعات</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={salesData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="rgb(200 200 200)" />
                  <Tooltip />
                  <Area type="monotone" dataKey="sales" stroke="#f59e0b" fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader><CardTitle>رضا العملاء</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={customerData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {customerData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CUSTOMER_COLORS[index % CUSTOMER_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>تحليل التقارير</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={reportData} layout="vertical">
                  <XAxis type="number" stroke="rgb(200 200 200)" />
                  <YAxis type="category" dataKey="name" width={60} stroke="rgb(200 200 200)" />
                  <Tooltip />
                  <Bar dataKey="count" fill="#f59e0b" barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>إنتاجية الفريق</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={productivityData}>
                  <XAxis dataKey="name" stroke="rgb(200 200 200)" />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" name="إنتاجية" stroke="#f59e0b" />
                  <Line type="monotone" dataKey="value" name="المتوسط" stroke="#f97316" strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};