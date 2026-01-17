/**
 * Minor Arcana Tarot Card Meanings - Swords
 * Complete interpretations for the 14 Swords cards
 */

import type { TarotCardMeaning } from '../types/tarotMeaning';

export const SWORDS_MEANINGS: TarotCardMeaning[] = [
    {
        id: 'minor-swords-ace',
        name: 'Ace of Swords',
        arcana: 'minor',
        suit: 'Swords',
        rank: 'Ace',
        element: 'Air',
        keywords: ['clarity', 'breakthrough', 'truth', 'new ideas'],
        uprightMeaning: {
            keywords: ['breakthrough', 'clarity', 'sharp mind', 'truth'],
            description: 'The Ace of Swords represents mental clarity, breakthrough ideas, and truth. A new perspective cuts through confusion with razor-sharp insight.'
        },
        reversedMeaning: {
            keywords: ['inner clarity', 'confusion', 'brutality', 'chaos'],
            description: 'Reversed indicates confusion, clouded judgment, or using intellect destructively. Truth may be distorted or withheld.'
        }
    },
    {
        id: 'minor-swords-2',
        name: '2 of Swords',
        arcana: 'minor',
        suit: 'Swords',
        rank: '2',
        element: 'Air',
        keywords: ['indecision', 'stalemate', 'avoidance', 'blocked emotions'],
        uprightMeaning: {
            keywords: ['difficult decisions', 'weighing options', 'denial', 'stalemate'],
            description: 'The Two of Swords represents a difficult choice and avoiding a decision. A stalemate exists between head and heart.'
        },
        reversedMeaning: {
            keywords: ['indecision', 'information overload', 'no right choice', 'paralysis'],
            description: 'Reversed intensifies indecision, information overload, or feeling there is no right choice. Time to face what you\'ve been avoiding.'
        }
    },
    {
        id: 'minor-swords-3',
        name: '3 of Swords',
        arcana: 'minor',
        suit: 'Swords',
        rank: '3',
        element: 'Air',
        keywords: ['heartbreak', 'sorrow', 'grief', 'painful truth'],
        uprightMeaning: {
            keywords: ['heartbreak', 'emotional pain', 'sorrow', 'grief'],
            description: 'The Three of Swords represents heartbreak, painful truths, and grief. Though painful, this sorrow leads to healing and growth.'
        },
        reversedMeaning: {
            keywords: ['negativity', 'releasing pain', 'recovery', 'forgiveness'],
            description: 'Reversed indicates recovering from pain, releasing negativity, or needing to forgive. Healing is in progress.'
        }
    },
    {
        id: 'minor-swords-4',
        name: '4 of Swords',
        arcana: 'minor',
        suit: 'Swords',
        rank: '4',
        element: 'Air',
        keywords: ['rest', 'restoration', 'contemplation', 'recuperation'],
        uprightMeaning: {
            keywords: ['rest', 'relaxation', 'meditation', 'contemplation'],
            description: 'The Four of Swords represents rest, recovery, and mental retreat. Take time to heal and restore before the next battle.'
        },
        reversedMeaning: {
            keywords: ['exhaustion', 'burnout', 'restlessness', 'stagnation'],
            description: 'Reversed indicates burnout, restlessness, or refusing to rest. You need recovery time that you may be denying yourself.'
        }
    },
    {
        id: 'minor-swords-5',
        name: '5 of Swords',
        arcana: 'minor',
        suit: 'Swords',
        rank: '5',
        element: 'Air',
        keywords: ['conflict', 'defeat', 'betrayal', 'winning at all costs'],
        uprightMeaning: {
            keywords: ['conflict', 'disagreements', 'competition', 'defeat'],
            description: 'The Five of Swords represents conflict, winning at any cost, and hollow victories. Consider whether the battle is worth fighting.'
        },
        reversedMeaning: {
            keywords: ['reconciliation', 'making amends', 'moving on', 'compromise'],
            description: 'Reversed indicates reconciliation, making amends, or realizing past conflicts were not worth it. Time to move on.'
        }
    },
    {
        id: 'minor-swords-6',
        name: '6 of Swords',
        arcana: 'minor',
        suit: 'Swords',
        rank: '6',
        element: 'Air',
        keywords: ['transition', 'leaving behind', 'moving on', 'recovery'],
        uprightMeaning: {
            keywords: ['transition', 'change', 'rite of passage', 'releasing baggage'],
            description: 'The Six of Swords represents transition, moving on from difficulty, and finding calmer waters. Leave troubles behind.'
        },
        reversedMeaning: {
            keywords: ['emotional baggage', 'unfinished business', 'stuck', 'resistance'],
            description: 'Reversed indicates resistance to change, emotional baggage, or unfinished business preventing movement forward.'
        }
    },
    {
        id: 'minor-swords-7',
        name: '7 of Swords',
        arcana: 'minor',
        suit: 'Swords',
        rank: '7',
        element: 'Air',
        keywords: ['deception', 'strategy', 'stealth', 'getting away with'],
        uprightMeaning: {
            keywords: ['betrayal', 'deception', 'getting away with something', 'strategy'],
            description: 'The Seven of Swords represents deception, strategy, and getting away with something. Be wary of dishonesty from others or yourself.'
        },
        reversedMeaning: {
            keywords: ['imposter syndrome', 'coming clean', 'conscience', 'confession'],
            description: 'Reversed indicates coming clean, imposter syndrome, or conscience catching up. Secrets may be revealed.'
        }
    },
    {
        id: 'minor-swords-8',
        name: '8 of Swords',
        arcana: 'minor',
        suit: 'Swords',
        rank: '8',
        element: 'Air',
        keywords: ['restriction', 'imprisonment', 'victim mentality', 'self-imposed'],
        uprightMeaning: {
            keywords: ['negative thoughts', 'self-imposed restriction', 'imprisonment', 'victim mentality'],
            description: 'The Eight of Swords represents feeling trapped by your own thoughts. The restrictions are often self-imposed.'
        },
        reversedMeaning: {
            keywords: ['self-acceptance', 'new perspective', 'freedom', 'empowerment'],
            description: 'Reversed indicates breaking free from mental imprisonment, new perspectives, and self-acceptance.'
        }
    },
    {
        id: 'minor-swords-9',
        name: '9 of Swords',
        arcana: 'minor',
        suit: 'Swords',
        rank: '9',
        element: 'Air',
        keywords: ['anxiety', 'worry', 'nightmares', 'despair'],
        uprightMeaning: {
            keywords: ['anxiety', 'worry', 'fear', 'deep unhappiness'],
            description: 'The Nine of Swords represents anxiety, nightmares, and mental anguish. The fears may be worse than reality.'
        },
        reversedMeaning: {
            keywords: ['inner turmoil', 'deep-seated fears', 'hope', 'recovery'],
            description: 'Reversed indicates addressing inner turmoil, facing deep fears, or beginning to find hope and recovery.'
        }
    },
    {
        id: 'minor-swords-10',
        name: '10 of Swords',
        arcana: 'minor',
        suit: 'Swords',
        rank: '10',
        element: 'Air',
        keywords: ['rock bottom', 'endings', 'betrayal', 'new beginnings'],
        uprightMeaning: {
            keywords: ['painful endings', 'deep wounds', 'betrayal', 'loss'],
            description: 'The Ten of Swords represents hitting rock bottom, painful endings, and ultimate defeat. Yet dawn approaches—this is the end before a new beginning.'
        },
        reversedMeaning: {
            keywords: ['recovery', 'regeneration', 'resisting end', 'inevitable doom'],
            description: 'Reversed indicates recovery from crisis, resisting inevitable endings, or prolonging pain unnecessarily.'
        }
    },
    {
        id: 'minor-swords-page',
        name: 'Page of Swords',
        arcana: 'minor',
        suit: 'Swords',
        rank: 'Page',
        element: 'Air',
        keywords: ['curiosity', 'new ideas', 'thirst for knowledge', 'communication'],
        uprightMeaning: {
            keywords: ['new ideas', 'curiosity', 'thirst for knowledge', 'new ways of communicating'],
            description: 'The Page of Swords represents intellectual curiosity, new ideas, and eagerness to learn. A messenger of mental energy and communication.'
        },
        reversedMeaning: {
            keywords: ['deception', 'all talk', 'hurtful words', 'haste'],
            description: 'Reversed indicates all talk and no action, deceptive communication, or using words to hurt rather than help.'
        }
    },
    {
        id: 'minor-swords-knight',
        name: 'Knight of Swords',
        arcana: 'minor',
        suit: 'Swords',
        rank: 'Knight',
        element: 'Air',
        keywords: ['action', 'impulsiveness', 'ambition', 'assertiveness'],
        uprightMeaning: {
            keywords: ['ambitious', 'action-oriented', 'driven to succeed', 'fast-thinking'],
            description: 'The Knight of Swords represents swift action, ambition, and charging forward with ideas. He pursues goals with intense determination.'
        },
        reversedMeaning: {
            keywords: ['restless', 'unfocused', 'burnout', 'reckless'],
            description: 'Reversed indicates restlessness, reckless behavior, or burnout from charging ahead without direction.'
        }
    },
    {
        id: 'minor-swords-queen',
        name: 'Queen of Swords',
        arcana: 'minor',
        suit: 'Swords',
        rank: 'Queen',
        element: 'Air',
        keywords: ['independence', 'clear boundaries', 'direct communication', 'perception'],
        uprightMeaning: {
            keywords: ['independent', 'unbiased judgement', 'clear boundaries', 'direct communication'],
            description: 'The Queen of Swords represents independent thinking, clear communication, and unbiased judgment. She speaks truth with compassion.'
        },
        reversedMeaning: {
            keywords: ['cold-hearted', 'bitter', 'cruel', 'pessimistic'],
            description: 'Reversed indicates coldness, bitterness, or using intellect cruelly. Communication may be harsh or pessimistic.'
        }
    },
    {
        id: 'minor-swords-king',
        name: 'King of Swords',
        arcana: 'minor',
        suit: 'Swords',
        rank: 'King',
        element: 'Air',
        keywords: ['intellectual power', 'authority', 'truth', 'discipline'],
        uprightMeaning: {
            keywords: ['mental clarity', 'intellectual power', 'authority', 'truth'],
            description: 'The King of Swords represents intellectual authority, clear thinking, and fair judgment. He leads with logic and ethical standards.'
        },
        reversedMeaning: {
            keywords: ['power abuse', 'manipulation', 'tyranny', 'cruelty'],
            description: 'Reversed indicates abuse of intellectual power, manipulation, or tyrannical behavior. Judgment may be compromised.'
        }
    }
];
