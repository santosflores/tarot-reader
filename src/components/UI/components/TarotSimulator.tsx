/**
 * TarotSimulator Component
 * Allows simulating drawCard and revealCard for testing
 * Only available for santosflores@gmail.com
 */

import { useState, useRef } from 'react';
import { createTarotDeck, shuffleDeck, drawCards } from '../../../utils/tarot';
import { useRevealedCard } from '../../../hooks/useRevealedCard';
import { CollapsibleSection } from './CollapsibleSection';
import type { TarotDeck, TarotCard } from '../../../types/tarot';

export function TarotSimulator() {
  const [deck, setDeck] = useState<TarotDeck | null>(null);
  const [drawnCards, setDrawnCards] = useState<TarotCard[]>([]);
  const [status, setStatus] = useState<string>('No deck initialized');
  const deckRef = useRef<TarotDeck | null>(null);
  const addRevealedCard = useRevealedCard((state) => state.addRevealedCard);

  const handleInitDeck = () => {
    const newDeck = createTarotDeck();
    deckRef.current = newDeck;
    setDeck(newDeck);
    setDrawnCards([]);
    setStatus(`Deck initialized with ${newDeck.length} cards`);
  };

  const handleShuffleDeck = () => {
    if (!deckRef.current) {
      setStatus('Error: No deck initialized');
      return;
    }
    const shuffled = shuffleDeck(deckRef.current);
    deckRef.current = shuffled;
    setDeck(shuffled);
    setStatus('Deck shuffled');
  };

  const handleDrawCard = (numberOfCards: number = 1) => {
    if (!deckRef.current) {
      setStatus('Error: No deck initialized. Please initialize first.');
      return;
    }

    if (numberOfCards < 1) {
      setStatus('Error: Number of cards must be at least 1');
      return;
    }

    if (numberOfCards > deckRef.current.length) {
      setStatus(`Error: Cannot draw ${numberOfCards} cards. Only ${deckRef.current.length} remaining.`);
      return;
    }

    try {
      const result = drawCards(deckRef.current, numberOfCards);
      deckRef.current = result.remaining;
      setDeck(result.remaining);
      setDrawnCards([...drawnCards, ...result.drawn]);
      setStatus(`Drew ${numberOfCards} card${numberOfCards === 1 ? '' : 's'}. ${result.remaining.length} remaining.`);
    } catch (error) {
      setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleRevealCard = (index: number) => {
    if (index < 0 || index >= drawnCards.length) {
      setStatus(`Error: Invalid card index. Available: 0-${drawnCards.length - 1}`);
      return;
    }

    const card = drawnCards[index];
    addRevealedCard(card);
    setStatus(`Revealed: ${card.name}`);
  };

  const handleRevealLast = () => {
    if (drawnCards.length === 0) {
      setStatus('Error: No cards drawn yet');
      return;
    }
    handleRevealCard(drawnCards.length - 1);
  };

  return (
    <CollapsibleSection title="Tarot Simulator" icon="🃏" defaultExpanded={false}>

      {/* Status */}
      <div className="mb-3 p-2 bg-slate-800/50 backdrop-blur-sm border border-purple-400/20 rounded-lg text-xs text-purple-200/90 min-h-[2rem]">
        {status}
      </div>

      {/* Deck Info */}
      {deck && (
        <div className="mb-3 text-xs text-purple-300/80">
          Deck: {deck.length} cards | Drawn: {drawnCards.length} cards
        </div>
      )}

      {/* Controls */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <button
            onClick={handleInitDeck}
            className="flex-1 px-3 py-1.5 text-xs font-medium bg-slate-800/90 hover:bg-purple-800/90 backdrop-blur-sm border border-purple-400/30 hover:border-purple-300/50 text-purple-200 hover:text-white rounded-lg transition-all hover:scale-[1.02] shadow-lg"
          >
            Init Deck
          </button>
          <button
            onClick={handleShuffleDeck}
            disabled={!deck}
            className="flex-1 px-3 py-1.5 text-xs font-medium bg-slate-800/90 hover:bg-indigo-800/90 backdrop-blur-sm border border-purple-400/30 hover:border-indigo-300/50 text-gray-300 hover:text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] shadow-lg"
          >
            Shuffle
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleDrawCard(1)}
            disabled={!deck || (deck && deck.length === 0)}
            className="flex-1 px-3 py-1.5 text-xs font-medium bg-slate-800/90 hover:bg-green-800/90 backdrop-blur-sm border border-purple-400/30 hover:border-green-300/50 text-gray-300 hover:text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] shadow-lg"
          >
            Draw 1
          </button>
          <button
            onClick={() => handleDrawCard(3)}
            disabled={!deck || (deck && deck.length < 3)}
            className="flex-1 px-3 py-1.5 text-xs font-medium bg-slate-800/90 hover:bg-green-800/90 backdrop-blur-sm border border-purple-400/30 hover:border-green-300/50 text-gray-300 hover:text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] shadow-lg"
          >
            Draw 3
          </button>
        </div>

        <button
          onClick={handleRevealLast}
          disabled={drawnCards.length === 0}
          className="w-full px-3 py-1.5 text-xs font-medium bg-slate-800/90 hover:bg-amber-800/90 backdrop-blur-sm border border-purple-400/30 hover:border-amber-300/50 text-gray-300 hover:text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] shadow-lg"
        >
          Reveal Last Card
        </button>

        {/* Drawn Cards List */}
        {drawnCards.length > 0 && (
          <div className="mt-3 pt-3 border-t border-purple-400/30">
            <p className="text-xs font-medium text-purple-200 mb-2">Drawn Cards:</p>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {drawnCards.map((card, index) => (
                <div
                  key={`${card.id}-${index}`}
                  className="flex items-center justify-between p-1.5 bg-slate-800/50 backdrop-blur-sm border border-purple-400/20 rounded-lg text-xs"
                >
                  <span className="text-purple-200/90">{card.name}</span>
                  <button
                    onClick={() => handleRevealCard(index)}
                    className="px-2 py-0.5 text-xs bg-purple-900/50 hover:bg-purple-800/70 border border-purple-400/30 hover:border-purple-300/50 text-purple-200 hover:text-white rounded transition-all hover:scale-105"
                  >
                    Reveal
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </CollapsibleSection>
  );
}
