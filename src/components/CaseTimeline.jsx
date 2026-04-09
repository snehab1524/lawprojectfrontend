import React from 'react';
import { Clock, User, MessageCircle } from 'lucide-react';

const CaseTimeline = ({ timeline }) => {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-slate-800/50 rounded-2xl p-8 text-center border-2 border-dashed border-gray-200 dark:border-slate-700">
        <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">No updates yet</h3>
        <p className="text-gray-500 dark:text-gray-400">Be the first to add an update to this case</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3 mb-6">
        <Clock className="w-8 h-8" />
        Case Timeline
      </h3>
      <div className="relative">
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full" />
        {timeline.map((update, index) => (
          <div key={index} className="relative flex items-start gap-4 mb-8">
            <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg ring-8 ring-white/20 dark:ring-slate-900/20">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-xl ml-4">
              <div className="flex items-center gap-3 mb-3">
                <span className="font-bold text-gray-900 dark:text-white text-lg">{update.updatedByName}</span>
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 text-xs font-bold rounded-full">
                  {update.updatedByRole}
                </span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed whitespace-pre-wrap">{update.text}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span>{new Date(update.date).toLocaleDateString()}</span>
                <span>{new Date(update.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CaseTimeline;

