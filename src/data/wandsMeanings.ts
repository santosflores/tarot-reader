/**
 * Minor Arcana Tarot Card Meanings - Wands
 * Complete interpretations for the 14 Wands cards
 */

import type { TarotCardMeaning } from '../types/tarotMeaning';

export const WANDS_MEANINGS: TarotCardMeaning[] = [
    {
        id: 'minor-wands-ace',
        name: 'Ace of Wands',
        arcana: 'minor',
        suit: 'Wands',
        rank: 'Ace',
        element: 'Fire',
        keywords: ['inspiration', 'new opportunities', 'growth', 'potential'],
        uprightMeaning: {
            keywords: ['inspiration', 'new opportunities', 'growth', 'potential'],
            description: 'The Ace of Wands represents a spark of inspiration, new creative ventures, and exciting opportunities. A powerful new beginning with passionate energy.'
        },
        reversedMeaning: {
            keywords: ['delays', 'lack of direction', 'creative block', 'devoid of energy'],
            description: 'Reversed indicates delays, lack of motivation, or creative blocks. The spark may be struggling to ignite.'
        }
    },
    {
        id: 'minor-wands-2',
        name: '2 of Wands',
        arcana: 'minor',
        suit: 'Wands',
        rank: '2',
        element: 'Fire',
        keywords: ['planning', 'future', 'progress', 'discovery'],
        uprightMeaning: {
            keywords: ['future planning', 'progress', 'decisions', 'discovery'],
            description: 'The Two of Wands represents planning for the future, making decisions about which path to take, and expanding horizons.'
        },
        reversedMeaning: {
            keywords: ['personal goals', 'inner alignment', 'fear of unknown', 'lack of planning'],
            description: 'Reversed indicates fear of the unknown, lack of planning, or staying in your comfort zone instead of exploring.'
        }
    },
    {
        id: 'minor-wands-3',
        name: '3 of Wands',
        arcana: 'minor',
        suit: 'Wands',
        rank: '3',
        element: 'Fire',
        keywords: ['expansion', 'foresight', 'overseas', 'looking ahead'],
        uprightMeaning: {
            keywords: ['progress', 'expansion', 'foresight', 'overseas opportunities'],
            description: 'The Three of Wands represents expansion, foresight, and looking ahead. Your plans are in motion and opportunities are on the horizon.'
        },
        reversedMeaning: {
            keywords: ['playing small', 'lack of foresight', 'unexpected delays', 'frustration'],
            description: 'Reversed indicates playing it safe, unexpected obstacles, or frustration with the pace of progress.'
        }
    },
    {
        id: 'minor-wands-4',
        name: '4 of Wands',
        arcana: 'minor',
        suit: 'Wands',
        rank: '4',
        element: 'Fire',
        keywords: ['celebration', 'homecoming', 'harmony', 'milestone'],
        uprightMeaning: {
            keywords: ['celebration', 'joy', 'harmony', 'relaxation'],
            description: 'The Four of Wands represents celebration, homecoming, and community. A joyful milestone has been reached and it\'s time to celebrate.'
        },
        reversedMeaning: {
            keywords: ['personal celebration', 'inner harmony', 'conflict', 'transition'],
            description: 'Reversed indicates personal rather than public celebration, or conflict disrupting harmony. There may be instability at home.'
        }
    },
    {
        id: 'minor-wands-5',
        name: '5 of Wands',
        arcana: 'minor',
        suit: 'Wands',
        rank: '5',
        element: 'Fire',
        keywords: ['conflict', 'competition', 'tension', 'diversity'],
        uprightMeaning: {
            keywords: ['conflict', 'disagreements', 'competition', 'tension'],
            description: 'The Five of Wands represents conflict, competition, and clashing egos. Healthy competition can drive growth if channeled constructively.'
        },
        reversedMeaning: {
            keywords: ['inner conflict', 'avoiding conflict', 'respecting differences', 'peace'],
            description: 'Reversed indicates inner conflict, avoiding confrontation, or finding ways to work together despite differences.'
        }
    },
    {
        id: 'minor-wands-6',
        name: '6 of Wands',
        arcana: 'minor',
        suit: 'Wands',
        rank: '6',
        element: 'Fire',
        keywords: ['success', 'public recognition', 'victory', 'pride'],
        uprightMeaning: {
            keywords: ['success', 'public recognition', 'progress', 'self-confidence'],
            description: 'The Six of Wands represents public success, recognition, and victory. You are celebrated for your achievements and leadership.'
        },
        reversedMeaning: {
            keywords: ['private achievement', 'fall from grace', 'egotism', 'lack of recognition'],
            description: 'Reversed indicates lack of recognition, ego issues, or private achievements without public acclaim.'
        }
    },
    {
        id: 'minor-wands-7',
        name: '7 of Wands',
        arcana: 'minor',
        suit: 'Wands',
        rank: '7',
        element: 'Fire',
        keywords: ['challenge', 'competition', 'protection', 'perseverance'],
        uprightMeaning: {
            keywords: ['challenge', 'competition', 'protection', 'perseverance'],
            description: 'The Seven of Wands represents standing your ground, defending your position, and overcoming challenges. You have the high ground.'
        },
        reversedMeaning: {
            keywords: ['exhaustion', 'giving up', 'overwhelmed', 'admitting defeat'],
            description: 'Reversed indicates exhaustion from constant defense, feeling overwhelmed, or questioning whether the fight is worth it.'
        }
    },
    {
        id: 'minor-wands-8',
        name: '8 of Wands',
        arcana: 'minor',
        suit: 'Wands',
        rank: '8',
        element: 'Fire',
        keywords: ['speed', 'action', 'movement', 'quick decisions'],
        uprightMeaning: {
            keywords: ['movement', 'fast-paced change', 'action', 'alignment'],
            description: 'The Eight of Wands represents swift action, rapid progress, and momentum. Things are moving quickly—stay focused and ride the wave.'
        },
        reversedMeaning: {
            keywords: ['delays', 'frustration', 'resisting change', 'internal alignment'],
            description: 'Reversed indicates delays, frustration with slow progress, or resisting the rapid changes around you.'
        }
    },
    {
        id: 'minor-wands-9',
        name: '9 of Wands',
        arcana: 'minor',
        suit: 'Wands',
        rank: '9',
        element: 'Fire',
        keywords: ['resilience', 'persistence', 'boundaries', 'last stand'],
        uprightMeaning: {
            keywords: ['resilience', 'courage', 'persistence', 'test of faith'],
            description: 'The Nine of Wands represents resilience and persistence. Though weary from battle, you have the strength to make one last push.'
        },
        reversedMeaning: {
            keywords: ['paranoia', 'exhaustion', 'stubbornness', 'giving up'],
            description: 'Reversed indicates exhaustion, paranoia, or stubbornness. You may be defending against threats that aren\'t real.'
        }
    },
    {
        id: 'minor-wands-10',
        name: '10 of Wands',
        arcana: 'minor',
        suit: 'Wands',
        rank: '10',
        element: 'Fire',
        keywords: ['burden', 'responsibility', 'hard work', 'accomplishment'],
        uprightMeaning: {
            keywords: ['burden', 'extra responsibility', 'hard work', 'completion'],
            description: 'The Ten of Wands represents carrying a heavy burden, taking on too much responsibility. Success is near, but the weight is exhausting.'
        },
        reversedMeaning: {
            keywords: ['doing it all', 'delegation', 'release', 'burnout'],
            description: 'Reversed indicates learning to delegate, releasing burdens, or recognizing burnout before it\'s too late.'
        }
    },
    {
        id: 'minor-wands-page',
        name: 'Page of Wands',
        arcana: 'minor',
        suit: 'Wands',
        rank: 'Page',
        element: 'Fire',
        keywords: ['exploration', 'excitement', 'freedom', 'discovery'],
        uprightMeaning: {
            keywords: ['inspiration', 'ideas', 'discovery', 'free spirit'],
            description: 'The Page of Wands represents creative inspiration, enthusiasm, and the excitement of new adventures. A messenger of passion and potential.'
        },
        reversedMeaning: {
            keywords: ['newly formed ideas', 'redirect energy', 'self-limiting beliefs', 'lack of direction'],
            description: 'Reversed indicates scattered energy, self-limiting beliefs, or ideas that haven\'t fully formed yet.'
        }
    },
    {
        id: 'minor-wands-knight',
        name: 'Knight of Wands',
        arcana: 'minor',
        suit: 'Wands',
        rank: 'Knight',
        element: 'Fire',
        keywords: ['energy', 'passion', 'adventure', 'impulsiveness'],
        uprightMeaning: {
            keywords: ['energy', 'passion', 'inspired action', 'adventure'],
            description: 'The Knight of Wands represents passionate pursuit, adventure, and inspired action. He charges forward with enthusiasm and courage.'
        },
        reversedMeaning: {
            keywords: ['haste', 'scattered energy', 'delays', 'frustration'],
            description: 'Reversed indicates scattered energy, hasty decisions, or frustration from delays. Passion may be burning out of control.'
        }
    },
    {
        id: 'minor-wands-queen',
        name: 'Queen of Wands',
        arcana: 'minor',
        suit: 'Wands',
        rank: 'Queen',
        element: 'Fire',
        keywords: ['courage', 'confidence', 'determination', 'social'],
        uprightMeaning: {
            keywords: ['courage', 'confidence', 'independence', 'social butterfly'],
            description: 'The Queen of Wands represents confident, passionate leadership. She is magnetic, courageous, and inspires others with her warmth and determination.'
        },
        reversedMeaning: {
            keywords: ['self-respect', 'self-confidence', 'jealousy', 'selfishness'],
            description: 'Reversed indicates self-doubt, jealousy, or selfishness. The fire may be burning too hot or not at all.'
        }
    },
    {
        id: 'minor-wands-king',
        name: 'King of Wands',
        arcana: 'minor',
        suit: 'Wands',
        rank: 'King',
        element: 'Fire',
        keywords: ['leadership', 'vision', 'entrepreneur', 'honor'],
        uprightMeaning: {
            keywords: ['natural-born leader', 'vision', 'entrepreneur', 'honor'],
            description: 'The King of Wands represents bold leadership, vision, and entrepreneurial spirit. He leads with passion, charisma, and a clear vision.'
        },
        reversedMeaning: {
            keywords: ['impulsiveness', 'overbearing', 'unachievable expectations', 'tyranny'],
            description: 'Reversed indicates impulsive leadership, overbearing behavior, or setting unrealistic expectations that lead to failure.'
        }
    }
];
