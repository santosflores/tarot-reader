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
      <div className="mb-3 p-2 bg-gray-50 rounded text-xs text-gray-600 min-h-[2rem]">
        {status}
      </div>

      {/* Deck Info */}
      {deck && (
        <div className="mb-3 text-xs text-gray-500">
          Deck: {deck.length} cards | Drawn: {drawnCards.length} cards
        </div>
      )}

      {/* Controls */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <button
            onClick={handleInitDeck}
            className="flex-1 px-3 py-1.5 text-xs font-medium bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
          >
            Init Deck
          </button>
          <button
            onClick={handleShuffleDeck}
            disabled={!deck}
            className="flex-1 px-3 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Shuffle
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleDrawCard(1)}
            disabled={!deck || (deck && deck.length === 0)}
            className="flex-1 px-3 py-1.5 text-xs font-medium bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Draw 1
          </button>
          <button
            onClick={() => handleDrawCard(3)}
            disabled={!deck || (deck && deck.length < 3)}
            className="flex-1 px-3 py-1.5 text-xs font-medium bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Draw 3
          </button>
        </div>

        <button
          onClick={handleRevealLast}
          disabled={drawnCards.length === 0}
          className="w-full px-3 py-1.5 text-xs font-medium bg-amber-600 hover:bg-amber-700 text-white rounded-md transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Reveal Last Card
        </button>

        {/* Drawn Cards List */}
        {drawnCards.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs font-medium text-gray-700 mb-2">Drawn Cards:</p>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {drawnCards.map((card, index) => (
                <div
                  key={`${card.id}-${index}`}
                  className="flex items-center justify-between p-1.5 bg-gray-50 rounded text-xs"
                >
                  <span className="text-gray-700">{card.name}</span>
                  <button
                    onClick={() => handleRevealCard(index)}
                    className="px-2 py-0.5 text-xs bg-purple-100 hover:bg-purple-200 text-purple-700 rounded transition-colors"
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
