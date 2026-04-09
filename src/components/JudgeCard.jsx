const FALLBACK_JUDGE_IMAGE = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="330" height="440" viewBox="0 0 330 440"><rect width="330" height="440" fill="%23e7e5e4"/><text x="50%25" y="52%25" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="%2318181b">Judge</text></svg>';

const JudgeCard = ({ judge }) => {
  return (
    <div className="group relative overflow-hidden rounded-[2rem] border border-zinc-200 bg-white p-6 text-zinc-900 shadow-[0_18px_60px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-1">
      <div className="relative mb-6">
        <img
          src={judge.imageUrl || FALLBACK_JUDGE_IMAGE}
          alt={judge.name}
          className="h-64 w-full rounded-[1.5rem] border border-zinc-200 object-cover"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = FALLBACK_JUDGE_IMAGE;
          }}
        />
        <div className="absolute right-4 top-4 rounded-full bg-zinc-900 px-3 py-1 text-xs font-semibold text-white">
          {judge.rating?.toFixed(1) || 'N/A'}
        </div>
      </div>

      <h3 className="text-2xl font-semibold text-zinc-900">{judge.name}</h3>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-zinc-900 px-4 py-1 text-sm font-medium text-white">
          {judge.court || 'Court'}
        </span>
        <span className="text-sm text-zinc-500">{judge.experience || 0} yrs experience</span>
      </div>

      <p className="mt-4 text-sm uppercase tracking-[0.18em] text-zinc-500">{judge.specialization || 'General'}</p>
      <p className="mt-4 line-clamp-3 text-sm leading-7 text-zinc-600">{judge.bio || 'No profile summary available.'}</p>

      <button className="mt-6 w-full rounded-full bg-white border border-zinc-900 py-3 text-sm font-medium text-zinc-900 hover:bg-zinc-100">
        View Case History
      </button>
    </div>
  );
};

export default JudgeCard;
