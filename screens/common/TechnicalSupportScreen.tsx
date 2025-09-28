import React from 'react';
import { LifeBuoy, Mail, Phone, Rocket, Type, Paintbrush, Wind, MessageCircle } from 'lucide-react';
import { ScreenHeader } from '../../components/layout/ScreenHeader';
import { useAppContext } from '../../hooks/useAppContext';
import useAppStore from '../../store/useAppStore';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/Button';

const TechnicalSupportScreen: React.FC = () => {
    const { t } = useAppContext();
    const { setActiveView } = useAppStore();

    const supportDetails = {
        name: "فيصل بن محمد النتيفي",
        title: "مطور ومدير النظام",
        phone: "0560080070",
        email: "it.faisal@qssun.solar",
        intro: "أُحوِّل الأفكار إلى واقع رقمي ملموس. هنا لتقديم الدعم الفني وضمان أفضل تجربة استخدام للنظام.",
    };

    const skills = [
        { name: "React", icon: Rocket },
        { name: "TypeScript", icon: Type },
        { name: "UI/UX Design", icon: Paintbrush },
        { name: "TailwindCSS", icon: Wind },
    ];

    const handleContact = (type: 'email' | 'whatsapp') => {
        if (type === 'email') {
            const email = supportDetails.email;
            navigator.clipboard.writeText(email).then(() => {
                toast.success('تم نسخ البريد الإلكتروني!');
                window.location.href = `mailto:${email}`;
            }, () => {
                toast.error('فشل نسخ البريد الإلكتروني.');
            });
        } else {
            const phone = '966560080070';
            const displayPhone = supportDetails.phone;
            navigator.clipboard.writeText(displayPhone).then(() => {
                toast.success('تم نسخ رقم الواتساب!');
                window.open(`https://wa.me/${phone}`, '_blank');
            }, () => {
                toast.error('فشل نسخ رقم الواتساب.');
            });
        }
    };

    return (
        <div className="relative min-h-[calc(100vh-160px)] flex items-center justify-center p-4">
            <div className="lava-lamp-bg"></div>
            
            <div className="relative w-full max-w-2xl animated-border-wrapper">
                <div className="relative m-[2px] bg-white/10 dark:bg-slate-800/20 backdrop-blur-2xl rounded-xl shadow-2xl text-white p-8 text-center">
                    {/* Header */}
                    <div className="flex flex-col items-center mb-6">
                        <img
                            src="https://www2.0zz0.com/2025/09/11/09/271562700.gif"
                            alt="Developer Logo"
                            className="h-28 w-28 rounded-full border-4 border-white/30 shadow-lg object-cover mb-4"
                        />
                        <h2 className="text-3xl font-bold">{supportDetails.name}</h2>
                        <p className="text-amber-300 font-medium">{supportDetails.title}</p>
                    </div>

                    {/* Intro */}
                    <p className="text-slate-200 mb-8 max-w-lg mx-auto">{supportDetails.intro}</p>

                    {/* Skills */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold mb-4 text-slate-100">مجالات الخبرة</h3>
                        <div className="flex flex-wrap justify-center gap-3">
                            {skills.map(skill => (
                                <div key={skill.name} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm p-2 px-4 rounded-lg border border-white/10">
                                    <skill.icon size={18} className="text-amber-300" />
                                    <span className="text-sm font-medium">{skill.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Contact Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button 
                            onClick={() => handleContact('whatsapp')}
                            className="bg-green-500/80 hover:bg-green-500 text-white shadow-lg flex-1 backdrop-blur-md border border-white/10"
                            icon={<MessageCircle size={18} />}
                        >
                            تواصل عبر الواتساب
                        </Button>
                         <Button 
                            onClick={() => handleContact('email')}
                            className="bg-primary/80 hover:bg-primary text-white shadow-lg flex-1 backdrop-blur-md border border-white/10"
                            icon={<Mail size={18} />}
                        >
                            تواصل عبر البريد الإلكتروني
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TechnicalSupportScreen;