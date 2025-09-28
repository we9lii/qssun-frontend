import React, { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { Button } from '../components/ui/Button';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { LanguageToggle } from '../components/ui/LanguageToggle';
import { Card, CardContent } from '../components/ui/Card';
import toast from 'react-hot-toast';
import { Input } from '../components/ui/Input';
import { User as UserIcon, KeyRound } from 'lucide-react';

const LoginScreen: React.FC = () => {
    const { t, login } = useAppContext();
    const [isLoading, setIsLoading] = useState(false);
    const [employeeId, setEmployeeId] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!employeeId.trim() || !password.trim()) {
            toast.error('الرجاء إدخال رقم الموظف وكلمة المرور.');
            return;
        }
        setIsLoading(true);

        // Simulate a network delay for a better UX
        setTimeout(() => {
            login(employeeId.trim(), password.trim());
            setIsLoading(false);
        }, 500);
    };

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-800 flex items-center justify-center p-4 transition-colors duration-500 relative">
            <div dir="ltr" className="absolute top-4 right-4 flex items-center gap-2 z-10">
                <LanguageToggle />
                <ThemeToggle />
            </div>

            <div className="w-full max-w-md z-10">
                <div className="flex justify-center mb-8">
                     <img 
                        src="https://www2.0zz0.com/2025/09/11/07/879817109.png" 
                        alt="Qssun Logo" 
                        className="h-16 w-auto" 
                    />
                </div>

                <Card>
                    <CardContent className="p-8 sm:p-12">
                        <h1 className="text-center text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">{t('welcome')}</h1>
                        <p className="text-center text-slate-600 dark:text-slate-300 mb-8">{t('dailyReportsSystem')}</p>
                        
                        <form onSubmit={handleLogin} className="space-y-6">
                             <div>
                                <label htmlFor="employeeId" className="sr-only">{t('employeeId')}</label>
                                <Input 
                                    id="employeeId"
                                    type="text"
                                    placeholder={t('employeeId')}
                                    icon={<UserIcon size={16} />}
                                    value={employeeId}
                                    onChange={(e) => setEmployeeId(e.target.value)}
                                    required
                                />
                             </div>
                              <div>
                                <label htmlFor="password" className="sr-only">{t('password')}</label>
                                <Input 
                                    id="password"
                                    type="password"
                                    placeholder={t('password')}
                                    icon={<KeyRound size={16} />}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                             </div>
                             <Button 
                                type="submit"
                                className="w-full" 
                                size="lg" 
                                isLoading={isLoading}
                            >
                                {t('login')}
                            </Button>
                        </form>

                    </CardContent>
                </Card>

                <div className="mt-8 flex justify-center">
                    <a href="#" title="Developed by">
                        <img 
                            src="https://www2.0zz0.com/2025/09/11/09/271562700.gif" 
                            alt="Developer Logo"
                            className="h-24 w-auto transition-transform duration-300 hover:scale-110"
                        />
                    </a>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;