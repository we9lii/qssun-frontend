import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { useAppContext } from '../../hooks/useAppContext';

interface OnboardingScreenProps {
    onComplete: () => void;
}

type OnboardingFormInputs = {
    name: string;
    phone: string;
    password: string;
    confirmPassword: string;
};

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
    const { user, updateUser } = useAppContext();
    const [isLoading, setIsLoading] = useState(false);
    const { register, handleSubmit, watch, formState: { errors } } = useForm<OnboardingFormInputs>({
        defaultValues: {
            name: user?.name || '',
            phone: user?.phone || '',
        }
    });

    if (!user) {
        // This should not happen if App.tsx logic is correct,
        // but as a safeguard we prevent rendering.
        return null;
    }

    const onSubmit: SubmitHandler<OnboardingFormInputs> = (data) => {
        setIsLoading(true);
        // Simulate a save operation
        setTimeout(() => {
            updateUser({
                name: data.name,
                phone: data.phone,
                isFirstLogin: false, // Update the flag to move to the main app
            });
            toast.success('تم تحديث ملفك بنجاح! أهلاً بك.');
            // The state update in updateUser will cause App.tsx to re-render and show the dashboard.
            // onComplete is kept for prop consistency but is no longer essential.
            onComplete(); 
            setIsLoading(false);
        }, 500);
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
