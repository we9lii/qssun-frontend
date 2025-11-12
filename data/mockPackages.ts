export type PackageStatus = 'NEW' | 'PAYMENT_CONFIRMED' | 'PROCESSING' | 'READY_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';

export interface MockPackageRequest {
  id: string;
  title: string;
  description: string;
  customerName: string;
  customerPhone: string;
  priority: 'low' | 'medium' | 'high';
  status: PackageStatus;
  progressPercent: number;
  creationDate: string;
  lastModified: string;
  employeeId: string;
  employeeName?: string;
  branch: string;
  meta?: Record<string, any>;
}

export const mockPackageRequests: MockPackageRequest[] = [
  {
    id: 'PKG-MOCK-1001',
    title: 'طلب شحن سريع - أحمد علي',
    description: 'شحن مستعجل مع متابعة يومية.',
    customerName: 'أحمد علي',
    customerPhone: '0500000001',
    priority: 'high',
    status: 'NEW',
    progressPercent: 10,
    creationDate: '2025-10-20T08:00:00Z',
    lastModified: '2025-10-20T10:00:00Z',
    employeeId: 'EMP-001',
    employeeName: 'سارة المطيري',
    branch: 'الرياض',
    meta: { source: 'mock', packageType: 'سريع', deliveryMethod: 'Door-to-Door', isPaid: false }
  },
  {
    id: 'PKG-MOCK-1002',
    title: 'طلب شحن اقتصادي - ريم خالد',
    description: 'شحن اقتصادي، الدفع مؤكد.',
    customerName: 'ريم خالد',
    customerPhone: '0500000002',
    priority: 'medium',
    status: 'PAYMENT_CONFIRMED',
    progressPercent: 25,
    creationDate: '2025-10-19T12:30:00Z',
    lastModified: '2025-10-20T09:15:00Z',
    employeeId: 'EMP-002',
    employeeName: 'عبدالله القحطاني',
    branch: 'جدة',
    meta: { source: 'mock', packageType: 'اقتصادي', deliveryMethod: 'Pickup Point', isPaid: true }
  },
  {
    id: 'PKG-MOCK-1003',
    title: 'طلب شحن دولي - محمد زيد',
    description: 'جاري المعالجة والتخليص الجمركي.',
    customerName: 'محمد زيد',
    customerPhone: '0500000003',
    priority: 'high',
    status: 'PROCESSING',
    progressPercent: 55,
    creationDate: '2025-10-18T15:45:00Z',
    lastModified: '2025-10-20T11:20:00Z',
    employeeId: 'EMP-003',
    employeeName: 'فيصل بن محمد النتيفي',
    branch: 'القصيم',
    meta: { source: 'mock', packageType: 'دولي', deliveryMethod: 'Door-to-Door', isPaid: true }
  },
  {
    id: 'PKG-MOCK-1004',
    title: 'طلب شحن داخلي - ليلى منصور',
    description: 'جاهز للتسليم للعميل.',
    customerName: 'ليلى منصور',
    customerPhone: '0500000004',
    priority: 'low',
    status: 'READY_FOR_DELIVERY',
    progressPercent: 85,
    creationDate: '2025-10-17T09:10:00Z',
    lastModified: '2025-10-20T12:05:00Z',
    employeeId: 'EMP-004',
    employeeName: 'نورة الحربي',
    branch: 'الدمام',
    meta: { source: 'mock', packageType: 'داخلي', deliveryMethod: 'Pickup Point', isPaid: true }
  }
];