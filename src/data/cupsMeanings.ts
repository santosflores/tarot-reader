/**
 * Minor Arcana Tarot Card Meanings - Cups
 * Complete interpretations for the 14 Cups cards
 */

import type { TarotCardMeaning } from '../types/tarotMeaning';

export const CUPS_MEANINGS: TarotCardMeaning[] = [
    {
        id: 'minor-cups-ace',
        name: 'Ace of Cups',
        arcana: 'minor',
        suit: 'Cups',
        rank: 'Ace',
        element: 'Water',
        keywords: ['new feelings', 'emotional awakening', 'creativity', 'intuition'],
        uprightMeaning: {
            keywords: ['love', 'new relationships', 'compassion', 'creativity'],
            description: 'The Ace of Cups represents new emotional beginnings, love, and creative inspiration. A new relationship, deep feelings, or spiritual awakening may be emerging.'
        },
        reversedMeaning: {
            keywords: ['blocked emotions', 'emptiness', 'creative block', 'repressed feelings'],
            description: 'Reversed indicates emotional blockage, repressed feelings, or difficulty expressing love. Creative inspiration may be lacking.'
        }
    },
    {
        id: 'minor-cups-2',
        name: '2 of Cups',
        arcana: 'minor',
        suit: 'Cups',
        rank: '2',
        element: 'Water',
        keywords: ['partnership', 'attraction', 'unity', 'connection'],
        uprightMeaning: {
            keywords: ['unified love', 'partnership', 'mutual attraction', 'connection'],
            description: 'The Two of Cups represents partnerships, mutual attraction, and emotional connections. A balanced relationship based on equality and respect.'
        },
        reversedMeaning: {
            keywords: ['imbalance', 'broken communication', 'tension', 'separation'],
            description: 'Reversed indicates relationship imbalance, miscommunication, or separation. There may be a lack of harmony in partnerships.'
        }
    },
    {
        id: 'minor-cups-3',
        name: '3 of Cups',
        arcana: 'minor',
        suit: 'Cups',
        rank: '3',
        element: 'Water',
        keywords: ['celebration', 'friendship', 'community', 'joy'],
        uprightMeaning: {
            keywords: ['celebration', 'friendship', 'creativity', 'collaborations'],
            description: 'The Three of Cups represents celebration, friendship, and community. A time of joy, social gatherings, and creative collaboration with friends.'
        },
        reversedMeaning: {
            keywords: ['overindulgence', 'gossip', 'isolation', 'cancelled celebration'],
            description: 'Reversed warns of overindulgence, gossip, or feeling isolated from your social circle. Celebrations may be postponed.'
        }
    },
    {
        id: 'minor-cups-4',
        name: '4 of Cups',
        arcana: 'minor',
        suit: 'Cups',
        rank: '4',
        element: 'Water',
        keywords: ['contemplation', 'apathy', 'reevaluation', 'discontent'],
        uprightMeaning: {
            keywords: ['meditation', 'contemplation', 'apathy', 'reevaluation'],
            description: 'The Four of Cups represents contemplation and withdrawal. You may be feeling disconnected or uninterested in what life offers, focusing inward instead.'
        },
        reversedMeaning: {
            keywords: ['renewed interest', 'awareness', 'new perspective', 'acceptance'],
            description: 'Reversed indicates renewed interest and openness to opportunities. You are becoming aware of what you have been missing.'
        }
    },
    {
        id: 'minor-cups-5',
        name: '5 of Cups',
        arcana: 'minor',
        suit: 'Cups',
        rank: '5',
        element: 'Water',
        keywords: ['loss', 'grief', 'disappointment', 'regret'],
        uprightMeaning: {
            keywords: ['regret', 'failure', 'disappointment', 'pessimism'],
            description: 'The Five of Cups represents loss, grief, and disappointment. Focus on what remains rather than what was lost. Healing comes from shifting perspective.'
        },
        reversedMeaning: {
            keywords: ['acceptance', 'moving on', 'finding peace', 'recovery'],
            description: 'Reversed indicates acceptance, moving on from loss, and finding peace. You are ready to recover and see the remaining opportunities.'
        }
    },
    {
        id: 'minor-cups-6',
        name: '6 of Cups',
        arcana: 'minor',
        suit: 'Cups',
        rank: '6',
        element: 'Water',
        keywords: ['nostalgia', 'childhood', 'innocence', 'reunion'],
        uprightMeaning: {
            keywords: ['revisiting the past', 'childhood memories', 'innocence', 'joy'],
            description: 'The Six of Cups represents nostalgia, childhood memories, and innocence. Reconnecting with the past or old friends brings joy and comfort.'
        },
        reversedMeaning: {
            keywords: ['stuck in the past', 'naivety', 'unrealistic', 'moving forward'],
            description: 'Reversed warns of being stuck in the past, naivety, or unrealistic nostalgia. Time to release old memories and move forward.'
        }
    },
    {
        id: 'minor-cups-7',
        name: '7 of Cups',
        arcana: 'minor',
        suit: 'Cups',
        rank: '7',
        element: 'Water',
        keywords: ['fantasy', 'illusion', 'choices', 'wishful thinking'],
        uprightMeaning: {
            keywords: ['opportunities', 'choices', 'wishful thinking', 'illusion'],
            description: 'The Seven of Cups represents many choices, fantasy, and illusion. Beware of wishful thinking; not all that glitters is gold. Focus is needed.'
        },
        reversedMeaning: {
            keywords: ['alignment', 'personal values', 'overwhelmed', 'clarity'],
            description: 'Reversed brings clarity and alignment with values. The fog lifts, revealing which choice is truly right for you.'
        }
    },
    {
        id: 'minor-cups-8',
        name: '8 of Cups',
        arcana: 'minor',
        suit: 'Cups',
        rank: '8',
        element: 'Water',
        keywords: ['walking away', 'disillusionment', 'seeking truth', 'letting go'],
        uprightMeaning: {
            keywords: ['disappointment', 'abandonment', 'withdrawal', 'escapism'],
            description: 'The Eight of Cups represents walking away from something that no longer serves you. A journey of self-discovery and seeking deeper meaning.'
        },
        reversedMeaning: {
            keywords: ['stagnation', 'fear of change', 'staying put', 'avoidance'],
            description: 'Reversed indicates fear of leaving comfort behind, stagnation, or avoiding necessary change. You may be drifting aimlessly.'
        }
    },
    {
        id: 'minor-cups-9',
        name: '9 of Cups',
        arcana: 'minor',
        suit: 'Cups',
        rank: '9',
        element: 'Water',
        keywords: ['contentment', 'satisfaction', 'gratitude', 'wish fulfillment'],
        uprightMeaning: {
            keywords: ['contentment', 'satisfaction', 'gratitude', 'wish fulfilled'],
            description: 'The Nine of Cups is the wish card representing contentment and emotional fulfillment. Your wishes are coming true. Enjoy this moment of satisfaction.'
        },
        reversedMeaning: {
            keywords: ['inner happiness', 'materialism', 'dissatisfaction', 'greed'],
            description: 'Reversed warns of superficial happiness, materialism, or dissatisfaction despite having everything. True fulfillment comes from within.'
        }
    },
    {
        id: 'minor-cups-10',
        name: '10 of Cups',
        arcana: 'minor',
        suit: 'Cups',
        rank: '10',
        element: 'Water',
        keywords: ['harmony', 'family', 'happiness', 'alignment'],
        uprightMeaning: {
            keywords: ['divine love', 'blissful relationships', 'harmony', 'alignment'],
            description: 'The Ten of Cups represents ultimate emotional fulfillment, family harmony, and lasting happiness. The ideal domestic bliss and loving relationships.'
        },
        reversedMeaning: {
            keywords: ['broken family', 'disharmony', 'misaligned values', 'neglect'],
            description: 'Reversed indicates family dysfunction, misaligned values, or neglecting relationships. Domestic harmony is disrupted.'
        }
    },
    {
        id: 'minor-cups-page',
        name: 'Page of Cups',
        arcana: 'minor',
        suit: 'Cups',
        rank: 'Page',
        element: 'Water',
        keywords: ['creative opportunities', 'intuition', 'curiosity', 'sensitivity'],
        uprightMeaning: {
            keywords: ['creative opportunities', 'intuitive messages', 'curiosity', 'possibility'],
            description: 'The Page of Cups represents creative inspiration, intuitive messages, and emotional exploration. Be open to new feelings and artistic opportunities.'
        },
        reversedMeaning: {
            keywords: ['emotional immaturity', 'creative blocks', 'escapism', 'insecurity'],
            description: 'Reversed indicates emotional immaturity, creative blocks, or escaping into fantasy. You may be avoiding emotional growth.'
        }
    },
    {
        id: 'minor-cups-knight',
        name: 'Knight of Cups',
        arcana: 'minor',
        suit: 'Cups',
        rank: 'Knight',
        element: 'Water',
        keywords: ['romance', 'charm', 'imagination', 'idealism'],
        uprightMeaning: {
            keywords: ['creativity', 'romance', 'charm', 'imagination'],
            description: 'The Knight of Cups represents romantic proposals, following the heart, and creative pursuits. A charming messenger of emotional offerings.'
        },
        reversedMeaning: {
            keywords: ['unrealistic', 'jealousy', 'moodiness', 'disappointed'],
            description: 'Reversed indicates unrealistic expectations, moodiness, or jealousy. The romantic ideal may prove disappointing in reality.'
        }
    },
    {
        id: 'minor-cups-queen',
        name: 'Queen of Cups',
        arcana: 'minor',
        suit: 'Cups',
        rank: 'Queen',
        element: 'Water',
        keywords: ['compassion', 'emotional security', 'intuition', 'nurturing'],
        uprightMeaning: {
            keywords: ['compassionate', 'caring', 'emotionally stable', 'intuitive'],
            description: 'The Queen of Cups represents emotional security, intuition, and compassion. She embodies empathy and nurturing while maintaining healthy boundaries.'
        },
        reversedMeaning: {
            keywords: ['inner feelings', 'self-care', 'emotional manipulation', 'insecurity'],
            description: 'Reversed indicates emotional manipulation, codependency, or neglecting self-care. Boundaries may be lacking or too rigid.'
        }
    },
    {
        id: 'minor-cups-king',
        name: 'King of Cups',
        arcana: 'minor',
        suit: 'Cups',
        rank: 'King',
        element: 'Water',
        keywords: ['emotional balance', 'diplomacy', 'control', 'wisdom'],
        uprightMeaning: {
            keywords: ['emotionally balanced', 'compassionate', 'diplomatic', 'wise'],
            description: 'The King of Cups represents emotional maturity, diplomacy, and balanced leadership. He masters emotions without suppressing them.'
        },
        reversedMeaning: {
            keywords: ['moodiness', 'volatility', 'manipulation', 'anxiety'],
            description: 'Reversed indicates emotional volatility, manipulation, or repressed feelings. Emotions may be controlling you rather than the reverse.'
        }
    }
];
