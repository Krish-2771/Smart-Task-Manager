import { generateAISuggestions } from '../../utils/helpers';

export default function AISuggestionsPanel({ tasks }) {
  const suggestions = generateAISuggestions(tasks);

  return (
    <div className="card p-6 border-l-4 border-primary-500">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center shadow-md">
          <span className="text-xl">🤖</span>
        </div>
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white">AI Productivity Insights</h3>
          <p className="text-xs text-slate-400">Personalized based on your task data</p>
        </div>
      </div>

      <div className="space-y-3">
        {suggestions.map((s, i) => (
          <div key={i}
            className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl animate-slide-up"
            style={{ animationDelay: `${i * 80}ms` }}>
            <div className="w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-600 text-xs font-bold shrink-0 mt-0.5">
              {i + 1}
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{s}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
