/**
 * Tarot Page Component
 * Main page for Tarot deck operations: initialize, shuffle, and draw cards
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTarotDeck } from '../../hooks/useTarotDeck';
import { isMajorArcana } from '../../types/tarot';
import { getCardImagePath } from '../../utils/tarot';

/**
 * Tarot Page - Deck manipulation interface
 */
export function TarotPage() {
  const navigate = useNavigate();
  const [drawCount, setDrawCount] = useState(3);

  const {
    drawnCards,
    isShuffled,
    isInitialized,
    error,
    remainingCount,
    initializeDeck,
    shuffle,
    drawCards,
    reset,
  } = useTarotDeck();

  const handleDrawCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 1) {
      setDrawCount(Math.min(value, remainingCount || 78));
    }
  };

  const handleDrawCards = () => {
    drawCards(drawCount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-10">
          <div className="text-5xl mb-3">🃏</div>
          <h1 className="text-4xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-purple-200 to-amber-200 mb-2">
            Tarot Deck
          </h1>
          <p className="text-purple-200/70">
            Initialize your deck, shuffle the cards, and draw your fate
          </p>
        </header>

        {/* Error Display */}
        {error && (
          <div className="max-w-2xl mx-auto mb-6">
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-300 text-sm flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Control Panel */}
        <div className="max-w-2xl mx-auto mb-10">
          <div className="bg-slate-800/50 backdrop-blur-xl border border-purple-500/20 rounded-2xl shadow-2xl shadow-purple-900/20 p-6">
            {/* Status Display */}
            <div className="flex flex-wrap justify-center gap-6 mb-6 text-center">
              <div className="px-4 py-2 bg-slate-900/50 rounded-lg border border-purple-500/20">
                <div className="text-xs text-purple-300/60 uppercase tracking-wider mb-1">
                  Status
                </div>
                <div className="text-lg font-medium text-white">
                  {isInitialized ? (
                    <span className="text-green-400">Initialized</span>
                  ) : (
                    <span className="text-yellow-400">Not Ready</span>
                  )}
                </div>
              </div>
              <div className="px-4 py-2 bg-slate-900/50 rounded-lg border border-purple-500/20">
                <div className="text-xs text-purple-300/60 uppercase tracking-wider mb-1">
                  Shuffled
                </div>
                <div className="text-lg font-medium text-white">
                  {isShuffled ? (
                    <span className="text-green-400">Yes</span>
                  ) : (
                    <span className="text-purple-300/60">No</span>
                  )}
                </div>
              </div>
              <div className="px-4 py-2 bg-slate-900/50 rounded-lg border border-purple-500/20">
                <div className="text-xs text-purple-300/60 uppercase tracking-wider mb-1">
                  Remaining
                </div>
                <div className="text-lg font-medium text-white">
                  {remainingCount}
                </div>
              </div>
              <div className="px-4 py-2 bg-slate-900/50 rounded-lg border border-purple-500/20">
                <div className="text-xs text-purple-300/60 uppercase tracking-wider mb-1">
                  Drawn
                </div>
                <div className="text-lg font-medium text-white">
                  {drawnCards.length}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              <button
                onClick={initializeDeck}
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium rounded-lg transition-all duration-200 shadow-lg shadow-emerald-900/30 flex items-center gap-2"
              >
                <span>🎴</span>
                <span>Initialize Deck</span>
              </button>

              <button
                onClick={shuffle}
                disabled={!isInitialized}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium rounded-lg transition-all duration-200 shadow-lg shadow-purple-900/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-purple-600 disabled:hover:to-indigo-600 flex items-center gap-2"
              >
                <span>🔀</span>
                <span>Shuffle Deck</span>
              </button>

              <button
                onClick={reset}
                disabled={!isInitialized && drawnCards.length === 0}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <span>🔄</span>
                <span>Reset</span>
              </button>
            </div>

            {/* Draw Cards Section */}
            <div className="flex flex-wrap justify-center items-center gap-4 pt-4 border-t border-purple-500/20">
              <div className="flex items-center gap-3">
                <label
                  htmlFor="drawCount"
                  className="text-purple-200/80 text-sm"
                >
                  Draw
                </label>
                <input
                  id="drawCount"
                  type="number"
                  min="1"
                  max={remainingCount || 78}
                  value={drawCount}
                  onChange={handleDrawCountChange}
                  disabled={!isInitialized || remainingCount === 0}
                  className="w-20 px-3 py-2 bg-slate-900/50 border border-purple-500/30 rounded-lg text-white text-center focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <span className="text-purple-200/80 text-sm">cards</span>
              </div>

              <button
                onClick={handleDrawCards}
                disabled={!isInitialized || remainingCount === 0}
                className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-medium rounded-lg transition-all duration-200 shadow-lg shadow-amber-900/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-amber-600 disabled:hover:to-orange-600 flex items-center gap-2"
              >
                <span>✨</span>
                <span>Draw Cards</span>
              </button>
            </div>
          </div>
        </div>

        {/* Drawn Cards Display */}
        {drawnCards.length > 0 && (
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-serif font-bold text-white text-center mb-6">
              Drawn Cards ({drawnCards.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {drawnCards.map((card, index) => (
                <div
                  key={`${card.id}-${index}`}
                  className="bg-slate-800/50 backdrop-blur-xl border border-purple-500/20 rounded-xl p-4 hover:border-purple-500/40 transition-all duration-200 hover:shadow-lg hover:shadow-purple-900/20"
                >
                  <div className="text-center">
                    {/* Card Image */}
                    <div className="mb-3">
                      <img
                        src={getCardImagePath(card)}
                        alt={card.name}
                        className="w-full h-auto rounded-lg shadow-lg shadow-purple-900/30 opacity-0 transition-opacity duration-500 ease-out"
                        onLoad={(e) => {
                          // Fade in when image loads
                          e.currentTarget.classList.remove('opacity-0');
                          e.currentTarget.classList.add('opacity-100');
                        }}
                        onError={(e) => {
                          // Fallback to emoji if image fails to load
                          const target = e.currentTarget;
                          target.style.display = 'none';
                          const fallback = target.nextElementSibling;
                          if (fallback) fallback.classList.remove('hidden');
                        }}
                      />
                      <div className="hidden text-3xl py-8">
                        {isMajorArcana(card) ? '⭐' : '🌙'}
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {card.name}
                    </h3>
                    <div className="text-sm text-purple-300/70">
                      {isMajorArcana(card) ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500/20 text-amber-200 rounded-full text-xs">
                          Major Arcana • {card.number}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-500/20 text-indigo-200 rounded-full text-xs">
                          {card.suit}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isInitialized && drawnCards.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4 opacity-50">🎴</div>
            <p className="text-purple-200/50 text-lg">
              Click "Initialize Deck" to begin your reading
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="fixed bottom-6 right-6">
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-slate-800/80 backdrop-blur border border-purple-500/30 text-purple-200 rounded-lg hover:bg-slate-700/80 transition-all duration-200 flex items-center gap-2"
          >
            <span>←</span>
            <span>Back to Home</span>
          </button>
        </div>
      </div>
    </div>
  );
}
