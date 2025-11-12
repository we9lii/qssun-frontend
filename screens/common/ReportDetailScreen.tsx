import React, { useState, useEffect } from 'react';
import { Report, ReportType, SalesDetails, MaintenanceDetails, ProjectDetails, ProjectUpdate, ProjectException, AdminNote } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ScreenHeader } from '../../components/layout/ScreenHeader';
import { BarChart2, Printer, Star, Download, CheckCircle, Circle, User, Phone, MapPin, FileText, MessageSquare, Briefcase, Check, Users2, AlertTriangle, PlusCircle, Paperclip, Send, X } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import useAppStore from '../../store/useAppStore';
import { useAppContext } from '../../hooks/useAppContext';
import { Role } from '../../types';
import { FileUploadModal } from '../../components/common/FileUploadModal';
import { Textarea } from '../../components/ui/Textarea';

interface ReportDetailScreenProps {
    report: Report;
}

const typeColors: { [key in ReportType]: string } = {
    [ReportType.Sales]: 'bg-nav-sales',
    [ReportType.Maintenance]: 'bg-nav-maintenance',
    [ReportType.Inquiry]: 'bg-nav-log',
    [ReportType.Project]: 'bg-nav-project',
};

const ProjectUpdateItem: React.FC<{ update: ProjectUpdate, canViewAllFiles: boolean, currentUserId?: string }> = ({ update, canViewAllFiles, currentUserId }) => {
    const { t } = useAppContext();
    const isHandoverStage = update.id === 'deliveryHandover' || update.id === 'deliveryHandover_signed';
    const visibleFiles = (canViewAllFiles || isHandoverStage)
        ? update.files 
        : update.files?.filter(file => file.uploadedBy === currentUserId);
        
    return (
        <div className="flex flex-col p-3 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {update.completed ? <CheckCircle size={18} className="text-success" /> : <Circle size={18} className="text-slate-400" />}
                    <div>
                        <span className={`font-semibold ${update.completed ? 'text-slate-600 dark:text-slate-400' : ''}`}>{update.label}</span>
                        {update.timestamp && <p className="text-xs text-slate-400">{new Date(update.timestamp).toLocaleString()}</p>}
                    </div>
                </div>
            </div>
            {update.comment && (
                <p className="mt-2 p-2 text-xs bg-slate-200 dark:bg-slate-700 rounded-md flex items-start gap-2">
                    <MessageSquare size={12} className="mt-0.5 flex-shrink-0"/>
                    <span>{update.comment}</span>
                </p>
            )}
            {visibleFiles && visibleFiles.length > 0 && (
                <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 space-y-1">
                    <h5 className="text-xs font-semibold text-slate-500">{t('attachedFiles')}</h5>
                    {visibleFiles.map((file) => (
                        <a key={file.id} href={file.url} target="_blank" rel="noopener noreferrer" className="text-xs p-1 bg-slate-200 dark:bg-slate-700 rounded flex items-center gap-1.5 hover:text-primary transition-colors">
                            <Download size={12} /> {file.fileName}
                        </a>
                    ))}
                </div>
            )}
        </div>
    )
};


const RenderReportDetails: React.FC<{ report: Report }> = ({ report }) => {
    const { t, user, lang } = useAppContext();
    const canViewAllFiles = user?.role !== Role.TeamLead;
    const currentUserId = user?.id;

    switch (report.type) {
        case ReportType.Sales:
            const salesDetails = report.details as SalesDetails;
            return (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <InfoItem label={t('totalCustomers')} value={salesDetails.totalCustomers} />
                        <InfoItem label={t('serviceType')} value={salesDetails.serviceType} />
                    </div>
                    <h4 className="font-semibold pt-4 border-t mt-4">{t('customerDetails')}:</h4>
                     {salesDetails.customers.length > 0 ? (
                        <div className="space-y-4">
                            {salesDetails.customers.map((c) => (
                                <div key={c.id} className="p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <InfoItem icon={User} label={t('name')} value={c.name} />
                                        <InfoItem icon={Phone} label={t('phone')} value={c.phone} />
                                        <InfoItem icon={MapPin} label={t('region')} value={c.region} />
                                        <InfoItem icon={FileText} label={t('requestType')} value={c.requestType} />
                                    </div>
                                    {c.notes && <InfoItem label={t('notes')} value={c.notes} isFullWidth className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700" />}
                                    
                                    {c.files && c.files.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                                            <h5 className="text-sm font-semibold mb-2">{t('attachedFiles')}</h5>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                {c.files.map((file, index) => (
                                                    <a
                                                        key={index}
                                                        href={file.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-2 p-1.5 text-sm bg-slate-200 dark:bg-slate-700 rounded-md hover:bg-primary/20 transition-colors"
                                                    >
                                                        <Download size={14} className="text-primary flex-shrink-0" />
                                                        <span className="truncate">{file.fileName}</span>
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-500">{t('noCustomersAdded')}</p>
                    )}
                </div>
            );
        case ReportType.Maintenance:
            const maintDetails = report.details as MaintenanceDetails;
             return (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <InfoItem label={t('customerName')} value={maintDetails.customerName} />
                        <InfoItem label={t('serviceType')} value={maintDetails.serviceType} />
                        <InfoItem label={t('workStatus')} value={maintDetails.workStatus} />
                        <InfoItem label={t('durationHours')} value={maintDetails.duration} />
                        <InfoItem label={t('location')} value={maintDetails.location} isFullWidth />
                        <InfoItem label={t('equipmentUsed')} value={maintDetails.equipment} isFullWidth />
                        <InfoItem label={t('technicalNotes')} value={maintDetails.notes} isFullWidth />
                    </div>
                    
                    {maintDetails.beforeImages && maintDetails.beforeImages.length > 0 && (
                        <div>
                            <h4 className="font-semibold pt-4 border-t mt-4">{t('beforeWorkPhotos')}</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-2">
                                {maintDetails.beforeImages.map((img, index) => (
                                    <a key={index} href={img.url} target="_blank" rel="noopener noreferrer" className="block">
                                        <img src={img.url} alt={`Before ${index + 1}`} className="w-full h-24 object-cover rounded-md" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {maintDetails.afterImages && maintDetails.afterImages.length > 0 && (
                        <div>
                            <h4 className="font-semibold pt-4 border-t mt-4">{t('afterWorkPhotos')}</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-2">
                                {maintDetails.afterImages.map((img, index) => (
                                    <a key={index} href={img.url} target="_blank" rel="noopener noreferrer" className="block">
                                        <img src={img.url} alt={`After ${index + 1}`} className="w-full h-24 object-cover rounded-md" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            );
        case ReportType.Project:
            const projectDetails = report.details as ProjectDetails;
            const { technicalTeams } = useAppStore.getState();
            const assignedTeam = technicalTeams.find(t => t.id === report.assignedTeamId);
            const filteredUpdates = (user?.role === Role.TeamLead)
                ? (projectDetails.updates || []).filter(u => !['contract','firstPayment','secondPayment'].includes(u.id))
                : (projectDetails.updates || []);
            return (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h4 className="font-semibold mb-2">{t('basicInformation')}</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <InfoItem icon={User} label={t('projectOwner')} value={projectDetails.projectOwner} />
                                <InfoItem icon={Phone} label={t('projectOwnerPhone')} value={projectDetails.projectOwnerPhone} />
                                <InfoItem icon={MapPin} label={t('projectLocation')} value={projectDetails.location} />
                                <InfoItem icon={Briefcase} label={t('projectSize')} value={projectDetails.size} />
                                <InfoItem icon={Users2} label={t('assignedTeam')} value={assignedTeam?.name || t('notSpecified')} className="md:col-span-2" />
                            </div>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">{t('technicalTeam')}</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <InfoItem icon={User} label={t('teamLeader')} value={assignedTeam?.leaderName || t('notSpecified')} />
                                <InfoItem icon={Users2} label={t('teamMembers')} value={(assignedTeam?.members && assignedTeam.members.length > 0) ? assignedTeam.members.join(lang === 'ar' ? '، ' : ', ') : t('notSpecified')} className="md:col-span-2" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-2">{t('technicalSpecifications')}</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <InfoItem label={t('panelType')} value={projectDetails.panelType === 'other' ? projectDetails.customPanelType : projectDetails.panelType} />
                            <InfoItem label={t('panelCount')} value={projectDetails.panelCount} />
                            <InfoItem label={t('numBases15x2')} value={projectDetails.baseType15x2Count} />
                            <InfoItem label={t('numBases30x2')} value={projectDetails.baseType30x2Count} />
                            <InfoItem label={t('totalNumberOfBases')} value={projectDetails.totalBases} />
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-2">{t('workflowStages')}</h4>
                        <div className="space-y-2">
                            {filteredUpdates.map((update) => (
                                <ProjectUpdateItem key={update.id} update={update} canViewAllFiles={canViewAllFiles} currentUserId={currentUserId} />
                            ))}
                        </div>
                    </div>
                </div>
            );
        default:
            return <p>{t('noDetailsForReportType')}</p>;
    }
};

const InfoItem: React.FC<{ label: string, value?: string | number, isFullWidth?: boolean, icon?: React.ElementType, className?: string }> = ({ label, value, isFullWidth, icon: Icon, className }) => (
    <div className={`${isFullWidth ? 'col-span-full' : ''} ${className}`}>
        <p className="text-sm text-slate-500 flex items-center gap-1.5">
            {Icon && <Icon size={14} />}
            {label}
        </p>
        <p className="font-semibold truncate" dir={label.includes('هاتف') ? 'ltr' : 'auto'}>{value || '---'}</p>
    </div>
);

const AdminNotesSection: React.FC<{ report: Report }> = ({ report }) => {
    const { t, user } = useAppContext();
    const { addAdminNote, addAdminNoteReply } = useAppStore();
    const [newNote, setNewNote] = useState('');
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState('');

    if (!user) return null;

    const handleAddNote = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newNote.trim()) return;
        addAdminNote(report.id, newNote, user);
        setNewNote('');
    };

    const handleAddReply = (noteId: string) => {
        if (!replyContent.trim()) return;
        addAdminNoteReply(report.id, noteId, replyContent, user);
        setReplyContent('');
        setReplyingTo(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, callback: () => void) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            callback();
        }
    };

    const notes = Array.isArray(report.adminNotes) ? report.adminNotes : [];

    return (
        <Card>
            <CardHeader>
                <CardTitle>الملاحظات والمناقشات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4 max-h-[500px] overflow-y-auto p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    {notes.length > 0 ? (
                        notes.map(note => {
                            const isCurrentUserAuthor = user?.id === note.authorId;
                            return (
                                <div key={note.id} className={`flex flex-col ${isCurrentUserAuthor ? 'items-end' : 'items-start'}`}>
                                    <div className={`max-w-xl p-3 rounded-lg ${isCurrentUserAuthor ? 'bg-blue-500 text-white rounded-br-none' : 'bg-slate-100 dark:bg-slate-700 rounded-bl-none'}`}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className={`text-xs font-semibold ${isCurrentUserAuthor ? 'text-blue-100' : 'text-slate-600 dark:text-slate-300'}`}>{note.authorName}</p>
                                            <p className={`text-xs ${isCurrentUserAuthor ? 'text-blue-200' : 'text-slate-400'}`}>{new Date(note.timestamp).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                        <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                                    </div>
                                    
                                    {/* Replies */}
                                    <div className={`w-11/12 mt-2 space-y-2 ${isCurrentUserAuthor ? 'self-end' : 'self-start'}`}>
                                        {note.replies.map(reply => {
                                             const isCurrentUserReplyAuthor = user?.id === reply.authorId;
                                             return (
                                                <div key={reply.id} className={`flex flex-col ${isCurrentUserReplyAuthor ? 'items-end' : 'items-start'}`}>
                                                    <div className={`max-w-full p-2 rounded-lg ${isCurrentUserReplyAuthor ? 'bg-blue-400 text-white rounded-br-none' : 'bg-slate-200 dark:bg-slate-600 rounded-bl-none'}`}>
                                                         <div className="flex items-center gap-2">
                                                            <p className={`text-xs font-semibold ${isCurrentUserReplyAuthor ? 'text-blue-100' : 'text-slate-500 dark:text-slate-300'}`}>{reply.authorName}</p>
                                                            <p className={`text-xs ${isCurrentUserReplyAuthor ? 'text-blue-200' : 'text-slate-400'}`}>{new Date(reply.timestamp).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</p>
                                                         </div>
                                                        <p className="text-sm">{reply.content}</p>
                                                    </div>
                                                </div>
                                             )
                                        })}
                                        {replyingTo === note.id ? (
                                             <div className="flex items-center gap-1 pt-1">
                                                <Textarea
                                                    placeholder="اكتب ردك..."
                                                    value={replyContent}
                                                    onChange={(e) => setReplyContent(e.target.value)}
                                                    onKeyDown={(e) => handleKeyDown(e, () => handleAddReply(note.id))}
                                                    rows={1}
                                                    className="flex-1 text-sm"
                                                />
                                                <Button size="sm" variant="ghost" className="p-2 h-auto text-primary" onClick={() => handleAddReply(note.id)}><Send size={16} /></Button>
                                                <Button size="sm" variant="ghost" className="p-2 h-auto" onClick={() => setReplyingTo(null)}><X size={16}/></Button>
                                            </div>
                                        ) : (
                                            <Button variant="ghost" size="sm" className="text-xs text-slate-500 hover:text-primary" onClick={() => setReplyingTo(note.id)}>إضافة رد</Button>
                                        )}
                                    </div>
                                </div>
                            )
                        })
                    ) : (
                        <p className="text-sm text-center text-slate-500 py-4">لا توجد ملاحظات. ابدأ المحادثة!</p>
                    )}
                </div>
                
                <form onSubmit={handleAddNote} className="flex items-center gap-2">
                    <Textarea
                        placeholder="اكتب ملاحظتك هنا..."
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, () => handleAddNote(e))}
                        rows={1}
                        className="flex-1"
                    />
                    <Button type="submit" size="md" className="p-3">
                        <Send size={18} />
                    </Button>
                </form>

            </CardContent>
        </Card>
    );
};


const ReportDetailScreen: React.FC<ReportDetailScreenProps> = ({ report }) => {
    const { printReport, addProjectException, markNotesAsRead } = useAppStore();
    const { t, user, lang } = useAppContext();
    const [isExceptionsModalOpen, setExceptionsModalOpen] = useState(false);

    useEffect(() => {
        if (user && report.id) {
            markNotesAsRead(report.id, user.id);
        }
    }, [report.id, user, markNotesAsRead]);

    const backPath = user?.role === Role.Admin ? '/reports' : '/projects';

    const handleAddException = (files: File[], comment: string) => {
        if (!user) return;
        addProjectException(report.id, files, comment, user.employeeId);
    };
    
    const projectDetails = report.details as ProjectDetails | undefined;

    return (
        <>
            <div className="space-y-6">
                <ScreenHeader 
                    icon={BarChart2} 
                    title={`${t('reportDetails')}: ${report.id}`}
                    colorClass={typeColors[report.type]}
                    onBack={backPath}
                    actionButton={
                        <Button onClick={() => printReport(report.id)} icon={<Printer size={16}/>}>
                            {t('print')}
                        </Button>
                    }
                />
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-3 space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle>{t('report')} - {report.type}</CardTitle>
                                        <p className="text-sm text-slate-500">
                                            {t('by')} {report.employeeName} {t('at')} {new Date(report.date).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US')}
                                        </p>
                                    </div>
                                    <Badge>{report.status}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <RenderReportDetails report={report} />
                            </CardContent>
                        </Card>

                        {/* Admin Notes are visible to all, and all can add notes and replies */}
                        <AdminNotesSection report={report} />


                        {report.type === ReportType.Project && (
                            <Card>
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="flex items-center gap-2">
                                            <AlertTriangle size={20} className="text-amber-500"/> {t('exceptions')}
                                        </CardTitle>
                                        <Button type="button" variant="secondary" icon={<PlusCircle size={16}/>} onClick={() => setExceptionsModalOpen(true)}>
                                            {t('addException')}
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                     <div className="space-y-3">
                                        {projectDetails?.exceptions && projectDetails.exceptions.length > 0 ? (
                                            projectDetails.exceptions.map(exc => (
                                                <div key={exc.id} className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                                    <p className="text-xs text-amber-600 dark:text-amber-400">{new Date(exc.timestamp).toLocaleString()}</p>
                                                    <p className="text-sm my-1">{exc.comment}</p>
                                                    {exc.files && exc.files.length > 0 && (
                                                         <div className="flex flex-wrap gap-2 mt-2">
                                                            {exc.files.map(file => (
                                                                <a key={file.id} href={file.url} target="_blank" rel="noreferrer" className="text-xs flex items-center gap-1 bg-amber-200/50 dark:bg-amber-800/50 p-1 rounded hover:bg-amber-200 transition-colors">
                                                                    <Paperclip size={12}/> {file.fileName}
                                                                </a>
                                                            ))}
                                                         </div>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-center text-slate-500 py-4">{t('noExceptionsRecorded')}</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                         {report.modifications && report.modifications.length > 0 && (
                            <Card>
                                <CardHeader><CardTitle>سجل التعديلات</CardTitle></CardHeader>
                                <CardContent>
                                    <ul className="space-y-2">
                                        {report.modifications.map((mod, index) => (
                                            <li key={index} className="text-sm text-slate-500">
                                                تم التعديل بواسطة <span className="font-semibold text-slate-700 dark:text-slate-300">{mod.modifiedBy}</span> في <span className="font-mono text-xs">{new Date(mod.timestamp).toLocaleString('ar-SA')}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
            {isExceptionsModalOpen && (
                <FileUploadModal
                    isOpen={isExceptionsModalOpen}
                    onClose={() => setExceptionsModalOpen(false)}
                    onSubmit={handleAddException}
                    title={t('addNewException')}
                    submitButtonText={t('add')}
                    required
                />
            )}
        </>
    );
};

export default ReportDetailScreen;