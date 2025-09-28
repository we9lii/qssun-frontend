import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ScreenHeader } from '../../components/layout/ScreenHeader';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { cairoFont } from '../../utils/CairoFontBase64';
import { logoImage } from '../../utils/LogoImageBase64';
import { Briefcase, FileDown } from 'lucide-react';
import useAppStore from '../../store/useAppStore';

// Fix: Removed module augmentation for jspdf as it was causing type resolution errors.
// The autoTable method will be called using a type assertion `as any` instead.

interface QuotationOffer {
    name: string;
    system_size: number;
    price_before_tax: number;
    vat_15_percent: number;
    price_after_tax: number;
}

interface QuotationResult {
    customer_name: string;
    horsepower: number;
    offer_best: QuotationOffer;
    offer_good: QuotationOffer;
    offer_economical: QuotationOffer;
}

const CreateQuotationScreen: React.FC = () => {
    const { setActiveView } = useAppStore();
    const [customerName, setCustomerName] = useState('');
    const [horsepower, setHorsepower] = useState('');
    const [quotation, setQuotation] = useState<QuotationResult | null>(null);

    const handleGenerateQuotation = (e: React.FormEvent) => {
        e.preventDefault();
        const hp = parseFloat(horsepower);
        if (!customerName || isNaN(hp) || hp <= 0) {
            alert("الرجاء إدخال اسم العميل وقدرة حصانية صحيحة.");
            return;
        }

        const calculateOffer = (baseFactor: number): QuotationOffer => {
            const system_size = parseFloat((hp * 1.25).toFixed(2));
            const price_before_tax = Math.round(system_size * baseFactor);
            const vat_15_percent = Math.round(price_before_tax * 0.15);
            const price_after_tax = price_before_tax + vat_15_percent;
            return { name: '', system_size, price_before_tax, vat_15_percent, price_after_tax };
        };

        const result: QuotationResult = {
            customer_name: customerName,
            horsepower: hp,
            offer_best: { ...calculateOffer(4100), name: 'الأفضل' },
            offer_good: { ...calculateOffer(3600), name: 'الجيد' },
            offer_economical: { ...calculateOffer(3100), name: 'الاقتصادي' },
        };

        setQuotation(result);
    };

    const generatePDF = () => {
        if (!quotation) return;

        const doc = new jsPDF('p', 'pt', 'a4');
        
        // Add Cairo Font for Arabic support
        doc.addFileToVFS('Cairo-Regular.ttf', cairoFont);
        doc.addFont('Cairo-Regular.ttf', 'Cairo', 'normal');
        doc.setFont('Cairo');

        const pageHeight = doc.internal.pageSize.height;
        const pageWidth = doc.internal.pageSize.width;
        
        const arabicText = (text: string | string[], x: number, y: number, options = {}) => {
            doc.text(text, x, y, { align: 'right', ...options });
        };
        
        // Header - Use embedded Base64 logo
        doc.addImage(logoImage, 'PNG', 40, 40, 100, 35);

        doc.setFontSize(9);
        arabicText("شركة مدائن المستقبل للطاقة", pageWidth - 40, 45);
        arabicText("MADA'IN ALMOSTQBAL FOR ENERGY COMPANY", pageWidth - 40, 58);
        arabicText("شركة ذات مسؤولية محدودة", pageWidth - 40, 71);
        arabicText("الرقم الضريبي : 123456789012345", pageWidth - 40, 84);
        arabicText("س.ت : 123456789", pageWidth - 40, 97);

        // Title
        doc.setFontSize(16);
        doc.text("العرض الفني والمالي", pageWidth / 2, 140, { align: 'center' });
        
        doc.setFontSize(10);
        arabicText(`التاريخ: ${new Date().toLocaleDateString('ar-SA')}`, pageWidth - 40, 160);
        arabicText(`رقم العرض: QSN-${Date.now().toString().slice(-6)}`, pageWidth - 40, 175);
        
        // Customer Info
        arabicText("بسم الله الرحمن الرحيم", pageWidth - 40, 210);
        arabicText(`المكرم / ${quotation.customer_name} حفظه الله`, pageWidth - 40, 235);
        arabicText("السلام عليكم ورحمة الله وبركاته", pageWidth - 40, 260);
        arabicText("تحية طيبة وبعد ..", pageWidth - 40, 285);
        
        // Main Text
        const mainText = `حسب الاجتماع الذي دار معكم ومن خلال النقاش حول تشغيل عدد (1) رأس كهرباء بقدرة (${quotation.horsepower}) حصان على الطاقة الشمسية يسرنا نحن شركة مدائن المستقبل للطاقة أن نقدم لكم عرضنا الفني والمالي لتشغيل النظام الكهروضوئي على النحو التالي :`;
        const splitText = doc.splitTextToSize(mainText, pageWidth - 80);
        arabicText(splitText, pageWidth - 40, 310);
        
        // Table using jspdf-autotable
        // Fix: Cast `doc` to `any` to allow calling the `autoTable` method from the plugin without TypeScript errors.
        (doc as any).autoTable({
            startY: 370,
            head: [['العرض الثالث', 'العرض الثاني', 'العرض الأول', 'البيان']],
            body: [
                ['الاقتصادي', 'الجيد', 'الأفضل', `تشغيل مضخة (${quotation.horsepower}) حصان بنظام الإستطاعة الكاملة للنظام الكهروضوئي`],
                [`${quotation.offer_economical.system_size} kw`, `${quotation.offer_good.system_size} kw`, `${quotation.offer_best.system_size} kw`, 'حجم النظام'],
                ['1', '1', '1', 'عدد المضخات'],
                ['380V', '380V', '380V', 'المحول'],
                [`${quotation.offer_economical.price_before_tax} ر.س`, `${quotation.offer_good.price_before_tax} ر.س`, `${quotation.offer_best.price_before_tax} ر.س`, 'السعر غير شامل الضريبة'],
                [`${quotation.offer_economical.vat_15_percent} ر.س`, `${quotation.offer_good.vat_15_percent} ر.س`, `${quotation.offer_best.vat_15_percent} ر.س`, 'ضريبة القيمة المضافة ١٥%'],
                [`${quotation.offer_economical.price_after_tax} ر.س`, `${quotation.offer_good.price_after_tax} ر.س`, `${quotation.offer_best.price_after_tax} ر.س`, 'السعر شامل الضريبة'],
            ],
            theme: 'grid',
            styles: { font: 'Cairo', cellPadding: 5, halign: 'center' },
            headStyles: { fillColor: [22, 160, 133], halign: 'center' },
            columnStyles: { 3: { halign: 'right' } }
        });

        const finalY = (doc as any).lastAutoTable.finalY;

        // Terms and Conditions
        doc.setFontSize(10);
        let yPos = finalY + 30;
        
        const addSection = (title: string, items: string[]) => {
            if (yPos > pageHeight - 100) { doc.addPage(); yPos = 40; }
            arabicText(title, pageWidth - 40, yPos);
            yPos += 20;
            items.forEach(item => {
                if (yPos > pageHeight - 30) { doc.addPage(); yPos = 40; }
                const itemLines = doc.splitTextToSize(item, pageWidth - 60);
                arabicText(itemLines, pageWidth - 50, yPos);
                yPos += (itemLines.length * 15);
            });
            yPos += 10;
        };
        
        addSection("ثانيا : الدفعات", [
            "١- 50% دفعة أولى عند توقيع العقد.",
            "٢- 40% دفعة ثانية عند توريد كامل البضاعة.",
            "٣- 10% دفعة أخيرة بعد استلام المشروع.",
        ]);
        
        addSection("ثالثا: مدة التنفيذ", ["- مدة تنفيذ المشروع من 5 إلى 15 أيام عمل من تاريخ توقيع العقد واستلام الدفعة الأولى."]);
        
        addSection("رابعا : ملاحظات :", [
            "- الأسعار أعلاه سارية المفعول لمدة أسبوع من تاريخه.",
            "- جميع الأصناف والماركات الموضحة قابلة للتعديل حسب رغبة العميل.",
            "- الشركة المنفذة للمشروع غير مسؤولة عن أي ضعف في البئر.",
        ]);
        
        doc.save(`Quotation-${quotation.customer_name}.pdf`);
    };

    const ResultTable: React.FC<{ data: QuotationResult }> = ({ data }) => (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-center">
                <thead className="bg-slate-100 dark:bg-slate-700">
                    <tr>
                        <th className="p-2 text-right">البيان</th>
                        <th>{data.offer_best.name}</th>
                        <th>{data.offer_good.name}</th>
                        <th>{data.offer_economical.name}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="border-b dark:border-slate-700">
                        <td className="p-2 text-right">حجم النظام</td>
                        <td>{data.offer_best.system_size} kw</td>
                        <td>{data.offer_good.system_size} kw</td>
                        <td>{data.offer_economical.system_size} kw</td>
                    </tr>
                    <tr className="border-b dark:border-slate-700">
                        <td className="p-2 text-right">السعر (قبل الضريبة)</td>
                        <td>{data.offer_best.price_before_tax} ر.س</td>
                        <td>{data.offer_good.price_before_tax} ر.س</td>
                        <td>{data.offer_economical.price_before_tax} ر.س</td>
                    </tr>
                     <tr className="border-b dark:border-slate-700">
                        <td className="p-2 text-right">ضريبة القيمة المضافة 15%</td>
                        <td>{data.offer_best.vat_15_percent} ر.س</td>
                        <td>{data.offer_good.vat_15_percent} ر.س</td>
                        <td>{data.offer_economical.vat_15_percent} ر.س</td>
                    </tr>
                    <tr className="font-bold bg-slate-50 dark:bg-slate-800/50">
                        <td className="p-2 text-right">الإجمالي (شامل الضريبة)</td>
                        <td>{data.offer_best.price_after_tax} ر.س</td>
                        <td>{data.offer_good.price_after_tax} ر.س</td>
                        <td>{data.offer_economical.price_after_tax} ر.س</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="space-y-6">
            <ScreenHeader
                icon={Briefcase}
                title="إنشاء عرض سعر"
                colorClass="bg-nav-project"
                onBack={() => setActiveView('projects')}
            />

            <Card>
                <CardHeader>
                    <CardTitle>بيانات المشروع</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleGenerateQuotation} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium mb-1">اسم العميل</label>
                            <Input value={customerName} onChange={e => setCustomerName(e.target.value)} required />
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium mb-1">قدرة المضخة (حصان)</label>
                            <Input type="number" value={horsepower} onChange={e => setHorsepower(e.target.value)} required />
                        </div>
                        <div className="md:col-span-1">
                            <Button type="submit" className="w-full">إنشاء العرض</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {quotation && (
                <div id="results_container">
                    <Card>
                         <CardHeader>
                            <CardTitle>نتائج العرض الفني والمالي</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResultTable data={quotation}/>
                        </CardContent>
                    </Card>
                    <div className="mt-4 text-center">
                        <Button id="print_pdf_button" onClick={generatePDF} icon={<FileDown size={16}/>}>
                            طباعة عرض السعر (PDF)
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateQuotationScreen;