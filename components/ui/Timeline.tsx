
import React from 'react';
import { StageHistoryItem } from '../../types';
import { MessageSquare, FileText, Edit } from 'lucide-react';

interface TimelineProps {
  items: StageHistoryItem[];
  onItemClick?: (item: StageHistoryItem) => void;
}

const TimelineItem: React.FC<{ item: StageHistoryItem; isLast: boolean, onClick?: () => void; }> = ({ item, isLast, onClick }) => {
    const isClickable = !!onClick;
  return (
    <li className={`relative mb-6 ms-4 group ${isClickable ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 p-2 rounded-md -ms-2' : ''}`} onClick={onClick}>
      {!isLast && <div className="absolute w-px h-full bg-slate-300 dark:bg-slate-600 -start-1.5 mt-2"></div>}
      <div className="absolute w-3 h-3 bg-slate-300 rounded-full -start-1.5 border border-white dark:border-slate-800 dark:bg-slate-600"></div>
      <time className="mb-1 text-sm font-normal leading-none text-slate-500 dark:text-slate-400">
        {new Date(item.timestamp).toLocaleString('ar-SA')}
      </time>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
        {item.stageName}
        {item.modified && <span className="text-xs font-normal text-yellow-500">(تم تعديله)</span>}
      </h3>
      <p className="text-sm font-normal text-slate-600 dark:text-slate-300">بواسطة: {item.processor}</p>
      
      {item.comment && (
        <p className="mt-2 p-2 text-sm bg-slate-100 dark:bg-slate-700 rounded-md flex items-start gap-2">
            <MessageSquare size={14} className="mt-0.5 flex-shrink-0"/>
            <span>{item.comment}</span>
        </p>
      )}

      {item.documents && item.documents.length > 0 && (
          <div className="mt-2 space-y-1">
              {item.documents.map(doc => (
                  <div key={doc.id} className="text-xs p-1.5 bg-slate-200 dark:bg-slate-700 rounded flex items-center gap-2">
                      <FileText size={12} className="text-primary"/>
                      <span>{doc.file.name} ({doc.type})</span>
                  </div>
              ))}
          </div>
      )}

      {item.modified && (
        <p className="text-xs text-yellow-500 mt-2">
          آخر تعديل بواسطة {item.modified.processor} في {new Date(item.modified.timestamp).toLocaleString('ar-SA')}
        </p>
      )}
      {isClickable && (
          <div className="absolute top-2 left-2 p-1 rounded-full bg-slate-100 dark:bg-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
              <Edit size={14} className="text-primary"/>
          </div>
      )}
    </li>
  );
};

export const Timeline: React.FC<TimelineProps> = ({ items, onItemClick }) => {
  return (
    <ol className="relative border-s border-slate-300 dark:border-slate-600">
      {items.map((item, index) => (
        <TimelineItem 
            key={item.stageId + item.timestamp} 
            item={item} 
            isLast={index === items.length - 1}
            onClick={onItemClick ? () => onItemClick(item) : undefined}
        />
      ))}
    </ol>
  );
};