import React from 'react';
import { Card, CardContent } from './ui/Card';
import { StatCardData } from '../types';

interface StatCardProps {
    data: StatCardData;
}

const StatCard: React.FC<StatCardProps> = ({ data }) => {
    const { title, value, change, icon: Icon, color } = data;

    return (
        <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-xl blur opacity-0 group-hover:opacity-60 transition duration-500"></div>
            <Card className="relative transform transition-all duration-300 hover:-translate-y-1.5">
                <CardContent className="relative flex items-center justify-between p-4">
                    <div>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{title}</p>
                        <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
                        {change && (
                            <p className={`text-xs ${change.startsWith('+') ? 'text-success' : 'text-destructive'}`}>
                                {change}
                            </p>
                        )}
                    </div>
                    <div className={`p-3 rounded-full bg-primary/10 transition-colors duration-300 group-hover:bg-primary/20 ${color}`}>
                        <Icon size={24} className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"/>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default StatCard;