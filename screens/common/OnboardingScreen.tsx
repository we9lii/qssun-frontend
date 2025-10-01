import React, { useState } from 'react';
// FIX: Separated value and type imports for react-hook-form
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { useAppContext } from '../../hooks/useAppContext';
import { API_BASE_URL } from '../../config'; // Import from the central config file

// The onComplete prop is no longer needed as the component relies on the global context update.
interface OnboardingScreenProps {}

type OnboardingFormInputs = {
    name: string;
    phone: string;
    password: string;
    confirmPassword: string;
};

const OnboardingScreen: React.FC<OnboardingScreenProps> = () => {
    const { user, updateUser } = useAppContext();
    const [isLoading, setIsLoading] = useState(false);
    const { register, handleSubmit, watch, formState: { errors } } = useForm<OnboardingFormInputs>({
        defaultValues: {
            name: user?.name || '',
            phone: user?.phone || '',
        }
    });

    if (!user) {
        return null;
    }

    const onSubmit: SubmitHandler<OnboardingFormInputs> = async (data) => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/users/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    name: data.name,
                    phone: data.phone,
                    password: data.password // Sending plain text password, backend should hash it
                })
            });

            // Check if the response content type is JSON before parsing
            const contentType = response.headers.get("content-type");
            if (!response.ok) {
                let errorData = { message: 'فشل تحديث الملف الشخصي.' };
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    errorData = await response.json();
                } else {
                     console.error("Non-JSON error response:", await response.text());
                }
                throw new Error(errorData.message);
            }
            
            toast.success('تم تحديث ملفك بنجاح! أهلاً بك.');
            // If API call is successful, update the global user context.
            // The App component will automatically re-render and show the dashboard.
            updateUser({
                name: data.name,
                phone: data.phone,
                isFirstLogin: false, // This is the key change to move past this screen
            });

        } catch (error: any) {
            console.error('Onboarding error:', error);
            // Handle cases where the error is not a valid JSON (like HTML error pages)
            if (error instanceof SyntaxError) {
                 toast.error('حدث خطأ غير متوقع من الخادم.');
            } else {
                toast.error(error.message || 'حدث خطأ غير متوقع.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-800 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-center text-2xl">إكمال ملفك الشخصي</CardTitle>
                        <p className="text-center text-sm text-slate-500">مرحباً بك! يرجى إكمال بياناتك وتعيين كلمة مرور جديدة للمتابعة.</p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">الاسم</label>
                                <Input {...register("name", { required: "الاسم مطلوب" })} />
                                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">رقم الجوال</label>
                                <Input dir="ltr" {...register("phone", { required: "رقم الجوال مطلوب" })} type="tel" />
                                {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">كلمة المرور الجديدة</label>
                                <Input {...register("password", { required: "كلمة المرور مطلوبة", minLength: { value: 6, message: "يجب أن تكون 6 أحرف على الأقل" }})} type="password" />
                                {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">تأكيد كلمة المرور</label>
                                <Input {...register("confirmPassword", { required: "التأكيد مطلوب", validate: (value) => value === watch('password') || "كلمتا المرور غير متطابقتين" })} type="password" />
                                {errors.confirmPassword && <p className="text-xs text-destructive mt-1">{errors.confirmPassword.message}</p>}
                            </div>
                            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                                حفظ ومتابعة
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default OnboardingScreen;