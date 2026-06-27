'use client';

import { useState } from 'react';

export default function Home() {
  const [query, setQuery] = useState('');
  const [papers, setPapers] = useState<any[]>([]);
  const [selectedPaper, setSelectedPaper] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [openAccessOnly, setOpenAccessOnly] = useState(true);

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, open_access_only: openAccessOnly }),
      });
      const data = await res.json();
      if (data.success) setPapers(data.data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-16 max-w-5xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="text-5xl">🎓</span>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Semantic Scholar
            </h1>
          </div>
          <p className="text-gray-300 text-lg">Free academic search - 200M+ papers with AI insights</p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700 shadow-2xl mb-8">
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search papers, authors, topics..."
              className="flex-1 px-6 py-4 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              disabled={!query || loading}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-xl font-semibold transition-all disabled:opacity-50"
            >
              {loading ? 'Searching...' : '🔍 Search'}
            </button>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-400">
            <input
              type="checkbox"
              checked={openAccessOnly}
              onChange={(e) => setOpenAccessOnly(e.target.checked)}
              className="rounded border-slate-600 bg-slate-700 text-blue-500"
            />
            Open Access papers only
          </label>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-bold text-blue-400">Search Results ({papers.length})</h2>
            {papers.map((paper, i) => (
              <div
                key={i}
                onClick={() => setSelectedPaper(paper)}
                className={`bg-slate-800/50 backdrop-blur-sm rounded-xl p-5 border cursor-pointer transition-all ${
                  selectedPaper?.id === paper.id
                    ? 'border-blue-500 shadow-lg'
                    : 'border-slate-700 hover:border-slate-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">{paper.title}</h3>
                    <p className="text-sm text-gray-400 mb-2">{paper.authors.join(', ')}</p>
                    <p className="text-sm text-gray-300 line-clamp-2">{paper.abstract_text}</p>
                  </div>
                  {paper.open_access && (
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded ml-3">Open Access</span>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                  <span>{paper.year}</span>
                  <span>{paper.citations} citations</span>
                  {paper.pdf_url && (
                    <a href={paper.pdf_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                      📄 PDF
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 h-fit">
            <h3 className="text-lg font-bold text-blue-400 mb-4">Paper Details</h3>
            {selectedPaper ? (
              <div>
                <h4 className="font-bold mb-2">{selectedPaper.title}</h4>
                <p className="text-sm text-gray-400 mb-4">{selectedPaper.authors.join(', ')}</p>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 bg-slate-700/30 rounded-lg">
                    <p className="text-gray-400 text-xs">Year</p>
                    <p className="font-bold">{selectedPaper.year}</p>
                  </div>
                  <div className="p-3 bg-slate-700/30 rounded-lg">
                    <p className="text-gray-400 text-xs">Citations</p>
                    <p className="font-bold">{selectedPaper.citations}</p>
                  </div>
                </div>
                <a
                  href={selectedPaper.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-center font-semibold transition-colors"
                >
                  View on Semantic Scholar →
                </a>
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">Select a paper to view details</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
