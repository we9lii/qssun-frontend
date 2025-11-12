import React from 'react';
// FIX: Import useNavigate for routing.
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { useAppContext } from '../../hooks/useAppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FileText, CheckCircle, MessageCircle, DollarSign, TrendingUp, Calendar, ArrowRight } from 'lucide-react';
import useAppStore from '../../store/useAppStore';

const employeePerformanceData = [
  { name: 'عبدالله', "التقارير المقدمة": 40, "أعمال الصيانة": 24, "أعمال التركيب": 18, "الاستفسارات المعالجة": 35 },
  { name: 'فاطمة', "التقارير المقدمة": 30, "أعمال الصيانة": 13, "أعمال التركيب": 22, "الاستفسارات المعالجة": 20 },
  { name: 'محمد', "التقارير المقدمة": 20, "أعمال الصيانة": 48, "أعمال التركيب": 12, "الاستفسارات المعالجة": 15 },
  { name: 'سارة', "التقارير المقدمة": 27, "أعمال الصيانة": 39, "أعمال التركيب": 8, "الاستفسارات المعالجة": 28 },
];

const revenueData = [
  { name: 'الأسبوع 1', 'الإيرادات': 40000 },
  { name: 'الأسبوع 2', 'الإيرادات': 30000 },
  { name: 'الأسبوع 3', 'الإيرادات': 55000 },
  { name: 'الأسبوع 4', 'الإيرادات': 48000 },
];

const customerFeedbackData = [
  { name: 'إيجابي', value: 400 },
  { name: 'محايد', value: 120 },
  { name: 'سلبي', value: 35 },
];
const FEEDBACK_COLORS = ['#10b981', '#f97316', '#ef4444'];

const branchRevenueData = [
    { name: 'الرياض', 'الإيرادات': 120000 },
    { name: 'جدة', 'الإيرادات': 95000 },
    { name: 'الدمام', 'الإيرادات': 75000 },
    { name: 'مكة', 'الإيرادات': 40000 },
]

const kpiCards = [
    { title: 'التقارير المقدمة', value: '315', icon: FileText },
    { title: 'الأعمال الفنية', value: '180', icon: CheckCircle },
    { title: 'الاستفسارات المعالجة', value: '98', icon: MessageCircle },
    { title: 'استفسارات الأسعار', value: '75', icon: DollarSign },
    { title: 'المبيعات الناجحة', value: '42', icon: TrendingUp },
    { title: 'المواعيد القادمة', value: '12', icon: Calendar },
]

// FIX: Changed to a default export to resolve the build issue.
const AdminAnalyticsScreen: React.FC = () => {
  const { t } = useAppContext();
  // FIX: Remove setActiveView from destructuring as it does not exist.
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
            <h1 className="text-3xl font-bold">{t('analytics')}</h1>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 p-1 bg-slate-200 dark:bg-slate-700 rounded-lg">
                    <Button size="sm" variant="primary">أسبوع</Button>
                    <Button size="sm" variant="secondary">شهر</Button>
                    <Button size="sm" variant="secondary">سنة</Button>
                    <select className="bg-transparent border-0 rounded-md text-sm py-1.5 focus:ring-0">
                        <option>جميع الفروع</option>
                        <option>الرياض</option>
                        <option>جدة</option>
                    </select>
                </div>
                {/* FIX: Use navigate to go back to the dashboard. */}
                <Button onClick={() => navigate('/')} variant="secondary">
                    <ArrowRight size={16} className="me-2" />
                    رجوع
                </Button>
            </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {kpiCards.map(({ title, value, icon: Icon }) => (
                <Card key={title}>
                    <CardContent className="p-4 text-center">
                        <Icon className="mx-auto h-8 w-8 text-primary mb-2"/>
                        <p className="text-xl font-bold">{value}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{title}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>أداء الموظفين</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={employeePerformanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="التقارير المقدمة" fill="#8884d8" />
                <Bar dataKey="أعمال الصيانة" fill="#82ca9d" />
                <Bar dataKey="أعمال التركيب" fill="#ffc658" />
                <Bar dataKey="الاستفسارات المعالجة" fill="#ff7300" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
            <CardHeader><CardTitle>الإيرادات الأسبوعية</CardTitle></CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="الإيرادات" stroke="#8884d8" />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>

        <Card>
            <CardHeader><CardTitle>ملاحظات العملاء</CardTitle></CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie data={customerFeedbackData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                            {customerFeedbackData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={FEEDBACK_COLORS[index % FEEDBACK_COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader><CardTitle>إيرادات الفروع</CardTitle></CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={branchRevenueData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="الإيرادات" fill="#82ca9d" />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalyticsScreen;
