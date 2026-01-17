/**
 * Minor Arcana Tarot Card Meanings - Pentacles
 * Complete interpretations for the 14 Pentacles cards
 */

import type { TarotCardMeaning } from '../types/tarotMeaning';

export const PENTACLES_MEANINGS: TarotCardMeaning[] = [
    {
        id: 'minor-pentacles-ace',
        name: 'Ace of Pentacles',
        arcana: 'minor',
        suit: 'Pentacles',
        rank: 'Ace',
        element: 'Earth',
        keywords: ['opportunity', 'prosperity', 'new venture', 'manifestation'],
        uprightMeaning: {
            keywords: ['new financial opportunity', 'manifestation', 'abundance', 'prosperity'],
            description: 'The Ace of Pentacles represents new financial opportunities, prosperity, and material manifestation. A seed of abundance is being planted.'
        },
        reversedMeaning: {
            keywords: ['lost opportunity', 'lack of planning', 'scarcity mindset', 'instability'],
            description: 'Reversed indicates missed opportunities, poor planning, or a scarcity mindset. Resources may be mismanaged.'
        }
    },
    {
        id: 'minor-pentacles-2',
        name: '2 of Pentacles',
        arcana: 'minor',
        suit: 'Pentacles',
        rank: '2',
        element: 'Earth',
        keywords: ['balance', 'adaptability', 'juggling', 'flexibility'],
        uprightMeaning: {
            keywords: ['multiple priorities', 'time management', 'prioritization', 'adaptability'],
            description: 'The Two of Pentacles represents juggling multiple priorities and staying flexible. Balance is required as you navigate changing circumstances.'
        },
        reversedMeaning: {
            keywords: ['overwhelm', 'disorganization', 'reprioritization', 'overcommitted'],
            description: 'Reversed indicates overwhelm, disorganization, or being overcommitted. Time to reprioritize and regain balance.'
        }
    },
    {
        id: 'minor-pentacles-3',
        name: '3 of Pentacles',
        arcana: 'minor',
        suit: 'Pentacles',
        rank: '3',
        element: 'Earth',
        keywords: ['teamwork', 'collaboration', 'craftsmanship', 'learning'],
        uprightMeaning: {
            keywords: ['teamwork', 'collaboration', 'learning', 'implementation'],
            description: 'The Three of Pentacles represents teamwork, skilled work, and collaborative achievement. Quality work comes from combining different talents.'
        },
        reversedMeaning: {
            keywords: ['disharmony', 'misalignment', 'working alone', 'lack of skill'],
            description: 'Reversed indicates lack of teamwork, misaligned goals, or preferring to work alone. Collaboration is strained.'
        }
    },
    {
        id: 'minor-pentacles-4',
        name: '4 of Pentacles',
        arcana: 'minor',
        suit: 'Pentacles',
        rank: '4',
        element: 'Earth',
        keywords: ['security', 'control', 'saving', 'conservation'],
        uprightMeaning: {
            keywords: ['saving money', 'security', 'conservatism', 'scarcity'],
            description: 'The Four of Pentacles represents saving, security, and holding onto resources. Beware of excessive attachment to material possessions.'
        },
        reversedMeaning: {
            keywords: ['greed', 'materialism', 'generosity', 'letting go'],
            description: 'Reversed indicates either extreme greed or newfound generosity. You may be releasing attachment to material things.'
        }
    },
    {
        id: 'minor-pentacles-5',
        name: '5 of Pentacles',
        arcana: 'minor',
        suit: 'Pentacles',
        rank: '5',
        element: 'Earth',
        keywords: ['hardship', 'loss', 'isolation', 'worry'],
        uprightMeaning: {
            keywords: ['financial loss', 'poverty', 'lack mindset', 'isolation'],
            description: 'The Five of Pentacles represents financial hardship, feeling left out in the cold. Help is available if you look for it.'
        },
        reversedMeaning: {
            keywords: ['recovery', 'improvement', 'acceptance', 'spiritual wealth'],
            description: 'Reversed indicates financial recovery, accepting help, or finding spiritual wealth despite material lack.'
        }
    },
    {
        id: 'minor-pentacles-6',
        name: '6 of Pentacles',
        arcana: 'minor',
        suit: 'Pentacles',
        rank: '6',
        element: 'Earth',
        keywords: ['generosity', 'charity', 'giving', 'receiving'],
        uprightMeaning: {
            keywords: ['giving', 'receiving', 'sharing wealth', 'generosity'],
            description: 'The Six of Pentacles represents generosity, charity, and the flow of giving and receiving. Balance in sharing resources.'
        },
        reversedMeaning: {
            keywords: ['strings attached', 'one-sided', 'debt', 'self-care'],
            description: 'Reversed indicates gifts with strings attached, one-sided generosity, or neglecting your own needs while giving to others.'
        }
    },
    {
        id: 'minor-pentacles-7',
        name: '7 of Pentacles',
        arcana: 'minor',
        suit: 'Pentacles',
        rank: '7',
        element: 'Earth',
        keywords: ['assessment', 'patience', 'long-term view', 'investment'],
        uprightMeaning: {
            keywords: ['long-term view', 'sustainable results', 'perseverance', 'investment'],
            description: 'The Seven of Pentacles represents assessing progress and long-term investments. Patience is required as you wait for seeds to grow.'
        },
        reversedMeaning: {
            keywords: ['lack of progress', 'impatience', 'wasted effort', 'distraction'],
            description: 'Reversed indicates impatience, lack of visible progress, or questioning whether your efforts are worthwhile.'
        }
    },
    {
        id: 'minor-pentacles-8',
        name: '8 of Pentacles',
        arcana: 'minor',
        suit: 'Pentacles',
        rank: '8',
        element: 'Earth',
        keywords: ['apprenticeship', 'skill', 'diligence', 'mastery'],
        uprightMeaning: {
            keywords: ['apprenticeship', 'repetitive tasks', 'mastery', 'skill development'],
            description: 'The Eight of Pentacles represents dedicated work, skill development, and mastering your craft. Practice makes perfect.'
        },
        reversedMeaning: {
            keywords: ['perfectionism', 'misdirected activity', 'lack of focus', 'shortcuts'],
            description: 'Reversed indicates perfectionism, cutting corners, or misdirected effort. Focus and quality may be lacking.'
        }
    },
    {
        id: 'minor-pentacles-9',
        name: '9 of Pentacles',
        arcana: 'minor',
        suit: 'Pentacles',
        rank: '9',
        element: 'Earth',
        keywords: ['abundance', 'luxury', 'self-sufficiency', 'independence'],
        uprightMeaning: {
            keywords: ['abundance', 'luxury', 'self-sufficiency', 'financial independence'],
            description: 'The Nine of Pentacles represents abundance, luxury, and enjoying the fruits of your labor. Independence and self-sufficiency are celebrated.'
        },
        reversedMeaning: {
            keywords: ['self-worth', 'over-investment in work', 'hustling', 'superficial'],
            description: 'Reversed indicates questioning self-worth, over-working, or superficial displays of wealth without true satisfaction.'
        }
    },
    {
        id: 'minor-pentacles-10',
        name: '10 of Pentacles',
        arcana: 'minor',
        suit: 'Pentacles',
        rank: '10',
        element: 'Earth',
        keywords: ['legacy', 'inheritance', 'family', 'long-term success'],
        uprightMeaning: {
            keywords: ['wealth', 'inheritance', 'family', 'establishment'],
            description: 'The Ten of Pentacles represents ultimate material success, legacy, and family wealth. Generational prosperity and established foundations.'
        },
        reversedMeaning: {
            keywords: ['family disputes', 'financial failure', 'debt', 'fleeting success'],
            description: 'Reversed indicates family disputes over money, financial instability, or wealth that doesn\'t bring happiness.'
        }
    },
    {
        id: 'minor-pentacles-page',
        name: 'Page of Pentacles',
        arcana: 'minor',
        suit: 'Pentacles',
        rank: 'Page',
        element: 'Earth',
        keywords: ['manifestation', 'ambition', 'new career', 'planning'],
        uprightMeaning: {
            keywords: ['manifestation', 'financial opportunity', 'skill development', 'ambition'],
            description: 'The Page of Pentacles represents new opportunities for prosperity, learning new skills, and ambitious planning for the future.'
        },
        reversedMeaning: {
            keywords: ['lack of progress', 'procrastination', 'learn from failure', 'short-term focus'],
            description: 'Reversed indicates procrastination, lack of progress, or focusing only on short-term gains rather than building foundations.'
        }
    },
    {
        id: 'minor-pentacles-knight',
        name: 'Knight of Pentacles',
        arcana: 'minor',
        suit: 'Pentacles',
        rank: 'Knight',
        element: 'Earth',
        keywords: ['efficiency', 'routine', 'persistence', 'reliability'],
        uprightMeaning: {
            keywords: ['hard work', 'productivity', 'routine', 'conservatism'],
            description: 'The Knight of Pentacles represents hard work, patience, and methodical progress. Slow and steady wins the race.'
        },
        reversedMeaning: {
            keywords: ['self-discipline', 'workaholic', 'boredom', 'stagnation'],
            description: 'Reversed indicates workaholism, boredom, or stubbornness. You may be stuck in routines that no longer serve you.'
        }
    },
    {
        id: 'minor-pentacles-queen',
        name: 'Queen of Pentacles',
        arcana: 'minor',
        suit: 'Pentacles',
        rank: 'Queen',
        element: 'Earth',
        keywords: ['nurturing', 'practicality', 'security', 'abundance'],
        uprightMeaning: {
            keywords: ['practical', 'creature comforts', 'financial security', 'nurturing'],
            description: 'The Queen of Pentacles represents practical nurturing, financial security, and creating a comfortable home. She balances work and home life gracefully.'
        },
        reversedMeaning: {
            keywords: ['work-home conflict', 'self-care', 'smothering', 'financial dependence'],
            description: 'Reversed indicates work-home imbalance, neglecting self-care, or over-dependence on financial security for happiness.'
        }
    },
    {
        id: 'minor-pentacles-king',
        name: 'King of Pentacles',
        arcana: 'minor',
        suit: 'Pentacles',
        rank: 'King',
        element: 'Earth',
        keywords: ['abundance', 'prosperity', 'security', 'leadership'],
        uprightMeaning: {
            keywords: ['wealth', 'business', 'leadership', 'security'],
            description: 'The King of Pentacles represents wealth, business acumen, and material abundance. A secure, prosperous leader who builds lasting success.'
        },
        reversedMeaning: {
            keywords: ['financially inept', 'obsessed with wealth', 'stubborn', 'greedy'],
            description: 'Reversed indicates greed, stubbornness, or obsession with material wealth at the expense of other values.'
        }
    }
];
