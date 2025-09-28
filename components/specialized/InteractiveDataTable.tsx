import React, { useState, useMemo } from 'react';
import { Search, ArrowUpDown, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import * as XLSX from 'xlsx';

// Mock data for demonstration
const mockData = [
  { id: 1, name: 'مشروع برج الرياض', status: 'مكتمل', manager: 'أحمد علي', date: '2024-05-01' },
  { id: 2, name: 'صيانة مول جدة', status: 'قيد العمل', manager: 'فاطمة حسن', date: '2024-05-15' },
  { id: 3, name: 'توريد ألواح شمسية', status: 'معلق', manager: 'خالد الغامدي', date: '2024-05-20' },
  { id: 4, name: 'استشارة فنية - الدمام', status: 'مكتمل', manager: 'أحمد علي', date: '2024-04-25' },
];

type SortDirection = 'asc' | 'desc';

const statusVariant: { [key: string]: 'success' | 'warning' | 'default' } = {
  'مكتمل': 'success',
  'قيد العمل': 'warning',
  'معلق': 'default',
};

const headers = [
  { key: 'name', label: 'اسم المشروع/المهمة' },
  { key: 'status', label: 'الحالة' },
  { key: 'manager', label: 'المدير المسؤول' },
  { key: 'date', label: 'التاريخ' },
];

export const InteractiveDataTable: React.FC = () => {
  const [data] = useState(mockData);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: SortDirection } | null>(null);

  const filteredData = useMemo(() => {
    let filtered = data.filter(item => {
      const searchMatch = Object.values(item).some(val =>
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      );
      const statusMatch = statusFilter === 'all' || item.status === statusFilter;
      return searchMatch && statusMatch;
    });

    if (sortConfig !== null) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [data, searchTerm, statusFilter, sortConfig]);

  const requestSort = (key: string) => {
    let direction: SortDirection = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    XLSX.writeFile(workbook, 'exported_data.xlsx');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap justify-between items-center gap-4">
          <CardTitle>جدول البيانات التفاعلي</CardTitle>
          <div className="flex items-center gap-2">
            <Input
              placeholder="بحث ذكي..."
              icon={<Search size={16} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-auto"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 py-2 px-3 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm"
            >
              <option value="all">كل الحالات</option>
              <option value="مكتمل">مكتمل</option>
              <option value="قيد العمل">قيد العمل</option>
              <option value="معلق">معلق</option>
            </select>
            <Button variant="secondary" icon={<Download size={16} />} onClick={handleExport}>تصدير</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase bg-slate-100 dark:bg-slate-700">
              <tr>
                {headers.map((header) => (
                  <th key={header.key} className="px-4 py-2 text-right">
                    <button onClick={() => requestSort(header.key)} className="flex items-center gap-1 font-semibold text-slate-900 dark:text-slate-300 hover:text-primary dark:hover:text-primary">
                      {header.label} <ArrowUpDown size={14} />
                    </button>
                  </th>
                ))}
                <th className="px-4 py-2 text-right font-semibold text-slate-900 dark:text-slate-300">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item) => (
                <tr key={item.id} className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-2">{item.name}</td>
                  <td className="px-4 py-2"><Badge variant={statusVariant[item.status]}>{item.status}</Badge></td>
                  <td className="px-4 py-2">{item.manager}</td>
                  <td className="px-4 py-2">{item.date}</td>
                  <td className="px-4 py-2">
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost">عرض</Button>
                      <Button size="sm" variant="ghost">تعديل</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pt-4 text-xs text-slate-500">
          عرض {filteredData.length} من {data.length} عنصر
        </div>
      </CardContent>
    </Card>
  );
};