/**
 * Major Arcana Tarot Card Meanings
 * Complete interpretations for the 22 Major Arcana cards
 */

import type { TarotCardMeaning } from '../types/tarotMeaning';

export const MAJOR_ARCANA_MEANINGS: TarotCardMeaning[] = [
    {
        id: 'major-0',
        name: 'The Fool',
        arcana: 'major',
        number: 0,
        element: 'Air',
        zodiacSign: 'Uranus',
        keywords: ['beginnings', 'innocence', 'spontaneity', 'free spirit'],
        uprightMeaning: {
            keywords: ['new beginnings', 'adventure', 'potential', 'innocence'],
            description: 'The Fool represents new beginnings, having faith in the future, being inexperienced, not knowing what to expect, having beginner\'s luck, improvisation and believing in the universe.'
        },
        reversedMeaning: {
            keywords: ['recklessness', 'risk-taking', 'holding back', 'naivety'],
            description: 'When reversed, The Fool warns against recklessness and poor judgment. It may indicate fear of the unknown holding you back or taking unnecessary risks without proper consideration.'
        }
    },
    {
        id: 'major-1',
        name: 'The Magician',
        arcana: 'major',
        number: 1,
        element: 'Air',
        zodiacSign: 'Mercury',
        keywords: ['manifestation', 'willpower', 'creation', 'resourcefulness'],
        uprightMeaning: {
            keywords: ['power', 'skill', 'concentration', 'action'],
            description: 'The Magician signifies the power you have to manifest your desires into reality. You have all the tools and resources needed to succeed. Focus your energy and take action.'
        },
        reversedMeaning: {
            keywords: ['manipulation', 'untapped talents', 'deception', 'poor planning'],
            description: 'Reversed, The Magician suggests manipulation or trickery. It may indicate untapped potential, lack of direction, or using your skills for selfish purposes.'
        }
    },
    {
        id: 'major-2',
        name: 'The High Priestess',
        arcana: 'major',
        number: 2,
        element: 'Water',
        zodiacSign: 'Moon',
        keywords: ['intuition', 'mystery', 'subconscious', 'inner knowledge'],
        uprightMeaning: {
            keywords: ['intuition', 'sacred knowledge', 'divine feminine', 'subconscious mind'],
            description: 'The High Priestess represents intuition, mystery, and the subconscious mind. Trust your inner voice and look beyond the obvious. Secret knowledge awaits those who seek within.'
        },
        reversedMeaning: {
            keywords: ['secrets', 'disconnected from intuition', 'withdrawal', 'silence'],
            description: 'Reversed, she suggests you may be ignoring your intuition or that secrets are being kept. There may be a disconnection from your inner wisdom.'
        }
    },
    {
        id: 'major-3',
        name: 'The Empress',
        arcana: 'major',
        number: 3,
        element: 'Earth',
        zodiacSign: 'Venus',
        keywords: ['fertility', 'abundance', 'nurturing', 'nature'],
        uprightMeaning: {
            keywords: ['femininity', 'beauty', 'nature', 'abundance'],
            description: 'The Empress embodies fertility, abundance, and creation. She represents motherhood, nurturing, and connection to nature. A time of growth and creative expression.'
        },
        reversedMeaning: {
            keywords: ['creative block', 'dependence', 'smothering', 'neglect'],
            description: 'Reversed, The Empress may indicate creative blocks, over-dependence on others, or neglecting self-care. There may be a need to reconnect with nature and your feminine side.'
        }
    },
    {
        id: 'major-4',
        name: 'The Emperor',
        arcana: 'major',
        number: 4,
        element: 'Fire',
        zodiacSign: 'Aries',
        keywords: ['authority', 'structure', 'leadership', 'father figure'],
        uprightMeaning: {
            keywords: ['authority', 'establishment', 'structure', 'father figure'],
            description: 'The Emperor represents authority, structure, and solid foundations. He is the masculine counterpart to The Empress, embodying logic, leadership, and the power of discipline.'
        },
        reversedMeaning: {
            keywords: ['domination', 'rigidity', 'lack of discipline', 'inflexibility'],
            description: 'Reversed, The Emperor warns of tyranny, excessive control, or lack of discipline. There may be power struggles or an abuse of authority.'
        }
    },
    {
        id: 'major-5',
        name: 'The Hierophant',
        arcana: 'major',
        number: 5,
        element: 'Earth',
        zodiacSign: 'Taurus',
        keywords: ['tradition', 'conformity', 'spiritual wisdom', 'institutions'],
        uprightMeaning: {
            keywords: ['spiritual wisdom', 'religious beliefs', 'conformity', 'tradition'],
            description: 'The Hierophant represents traditional values, spiritual guidance, and conventional approaches. He suggests seeking wisdom from established institutions or mentors.'
        },
        reversedMeaning: {
            keywords: ['rebellion', 'subversiveness', 'new approaches', 'freedom'],
            description: 'Reversed, The Hierophant encourages questioning tradition and finding your own spiritual path. It may indicate a desire to break free from conventional expectations.'
        }
    },
    {
        id: 'major-6',
        name: 'The Lovers',
        arcana: 'major',
        number: 6,
        element: 'Air',
        zodiacSign: 'Gemini',
        keywords: ['love', 'harmony', 'relationships', 'choices'],
        uprightMeaning: {
            keywords: ['love', 'harmony', 'partnerships', 'values alignment'],
            description: 'The Lovers represents relationships, choices, and alignment of values. It speaks to the harmony of union and the importance of making heart-centered decisions.'
        },
        reversedMeaning: {
            keywords: ['disharmony', 'imbalance', 'misalignment', 'bad choices'],
            description: 'Reversed, The Lovers warns of disharmony in relationships, conflicting values, or poor choices. There may be a lack of balance or commitment issues.'
        }
    },
    {
        id: 'major-7',
        name: 'The Chariot',
        arcana: 'major',
        number: 7,
        element: 'Water',
        zodiacSign: 'Cancer',
        keywords: ['willpower', 'determination', 'success', 'control'],
        uprightMeaning: {
            keywords: ['control', 'willpower', 'success', 'determination'],
            description: 'The Chariot represents overcoming obstacles through determination and willpower. Victory is achieved through focus, confidence, and maintaining control over opposing forces.'
        },
        reversedMeaning: {
            keywords: ['lack of control', 'aggression', 'obstacles', 'lack of direction'],
            description: 'Reversed, The Chariot indicates loss of control, obstacles, or aggression. There may be a lack of direction or conflicting forces pulling you apart.'
        }
    },
    {
        id: 'major-8',
        name: 'Strength',
        arcana: 'major',
        number: 8,
        element: 'Fire',
        zodiacSign: 'Leo',
        keywords: ['courage', 'patience', 'inner strength', 'compassion'],
        uprightMeaning: {
            keywords: ['courage', 'persuasion', 'influence', 'compassion'],
            description: 'Strength represents inner courage, patience, and soft control. True strength comes not from force but from compassion, understanding, and gentle persuasion.'
        },
        reversedMeaning: {
            keywords: ['self-doubt', 'weakness', 'insecurity', 'raw emotion'],
            description: 'Reversed, Strength indicates self-doubt, weakness, or lack of confidence. There may be issues with self-control or allowing emotions to overwhelm you.'
        }
    },
    {
        id: 'major-9',
        name: 'The Hermit',
        arcana: 'major',
        number: 9,
        element: 'Earth',
        zodiacSign: 'Virgo',
        keywords: ['introspection', 'solitude', 'guidance', 'soul-searching'],
        uprightMeaning: {
            keywords: ['soul-searching', 'introspection', 'inner guidance', 'solitude'],
            description: 'The Hermit represents a period of introspection and soul-searching. Step back from the world to find your inner light and the wisdom that comes from solitude.'
        },
        reversedMeaning: {
            keywords: ['isolation', 'loneliness', 'withdrawal', 'lost'],
            description: 'Reversed, The Hermit warns of excessive isolation or loneliness. You may be withdrawing too much from society or refusing the guidance available to you.'
        }
    },
    {
        id: 'major-10',
        name: 'Wheel of Fortune',
        arcana: 'major',
        number: 10,
        element: 'Fire',
        zodiacSign: 'Jupiter',
        keywords: ['change', 'cycles', 'fate', 'luck'],
        uprightMeaning: {
            keywords: ['good luck', 'karma', 'life cycles', 'destiny'],
            description: 'The Wheel of Fortune represents the cycles of life, fate, and turning points. What goes around comes around. Embrace change as the wheel turns in your favor.'
        },
        reversedMeaning: {
            keywords: ['bad luck', 'resistance to change', 'breaking cycles', 'setbacks'],
            description: 'Reversed, the Wheel indicates bad luck, resistance to change, or feeling stuck in negative cycles. External forces may seem against you temporarily.'
        }
    },
    {
        id: 'major-11',
        name: 'Justice',
        arcana: 'major',
        number: 11,
        element: 'Air',
        zodiacSign: 'Libra',
        keywords: ['fairness', 'truth', 'law', 'cause and effect'],
        uprightMeaning: {
            keywords: ['justice', 'fairness', 'truth', 'law'],
            description: 'Justice represents fairness, truth, and the law of cause and effect. Actions have consequences. Be honest, make balanced decisions, and accept responsibility.'
        },
        reversedMeaning: {
            keywords: ['unfairness', 'dishonesty', 'lack of accountability', 'imbalance'],
            description: 'Reversed, Justice warns of unfairness, dishonesty, or refusal to accept consequences. Legal matters may not go in your favor, or there is bias at play.'
        }
    },
    {
        id: 'major-12',
        name: 'The Hanged Man',
        arcana: 'major',
        number: 12,
        element: 'Water',
        zodiacSign: 'Neptune',
        keywords: ['surrender', 'new perspective', 'pause', 'letting go'],
        uprightMeaning: {
            keywords: ['pause', 'surrender', 'letting go', 'new perspectives'],
            description: 'The Hanged Man represents suspension, sacrifice, and seeing things from a new perspective. Sometimes you must let go and surrender to gain enlightenment.'
        },
        reversedMeaning: {
            keywords: ['stalling', 'resistance', 'indecision', 'delays'],
            description: 'Reversed, The Hanged Man indicates stalling, resistance to change, or unnecessary delays. You may be avoiding a necessary sacrifice or refusing to see things differently.'
        }
    },
    {
        id: 'major-13',
        name: 'Death',
        arcana: 'major',
        number: 13,
        element: 'Water',
        zodiacSign: 'Scorpio',
        keywords: ['endings', 'transformation', 'transition', 'change'],
        uprightMeaning: {
            keywords: ['endings', 'change', 'transformation', 'transition'],
            description: 'Death represents endings, transformation, and new beginnings. This is not physical death but the end of a cycle. Embrace the transformation to allow rebirth.'
        },
        reversedMeaning: {
            keywords: ['resistance to change', 'fear of change', 'stagnation', 'decay'],
            description: 'Reversed, Death indicates resistance to inevitable change. Holding on to the past prevents new growth. Fear of endings leads to stagnation.'
        }
    },
    {
        id: 'major-14',
        name: 'Temperance',
        arcana: 'major',
        number: 14,
        element: 'Fire',
        zodiacSign: 'Sagittarius',
        keywords: ['balance', 'moderation', 'patience', 'harmony'],
        uprightMeaning: {
            keywords: ['balance', 'moderation', 'patience', 'purpose'],
            description: 'Temperance represents balance, moderation, and patience. Find the middle ground and mix opposing elements to create harmony. Practice patience and self-control.'
        },
        reversedMeaning: {
            keywords: ['imbalance', 'excess', 'lack of harmony', 'impatience'],
            description: 'Reversed, Temperance warns of imbalance, excess, or lack of long-term vision. There may be conflict between opposing forces or a need for moderation.'
        }
    },
    {
        id: 'major-15',
        name: 'The Devil',
        arcana: 'major',
        number: 15,
        element: 'Earth',
        zodiacSign: 'Capricorn',
        keywords: ['bondage', 'addiction', 'materialism', 'shadow self'],
        uprightMeaning: {
            keywords: ['shadow self', 'attachment', 'addiction', 'restriction'],
            description: 'The Devil represents bondage, addiction, and the shadow self. You may feel trapped by materialism or unhealthy attachments. The chains are often self-imposed.'
        },
        reversedMeaning: {
            keywords: ['release', 'detachment', 'breaking free', 'reclaiming power'],
            description: 'Reversed, The Devil indicates breaking free from bondage, releasing attachments, and reclaiming your power. You are ready to confront your shadows.'
        }
    },
    {
        id: 'major-16',
        name: 'The Tower',
        arcana: 'major',
        number: 16,
        element: 'Fire',
        zodiacSign: 'Mars',
        keywords: ['sudden change', 'upheaval', 'revelation', 'awakening'],
        uprightMeaning: {
            keywords: ['sudden change', 'upheaval', 'chaos', 'revelation'],
            description: 'The Tower represents sudden, disruptive change and revelation. Structures built on false foundations crumble. Though painful, this destruction clears the way for rebuilding.'
        },
        reversedMeaning: {
            keywords: ['fear of change', 'avoiding disaster', 'delaying inevitable', 'personal transformation'],
            description: 'Reversed, The Tower may indicate avoiding necessary change, fear of upheaval, or a personal transformation happening internally rather than externally.'
        }
    },
    {
        id: 'major-17',
        name: 'The Star',
        arcana: 'major',
        number: 17,
        element: 'Air',
        zodiacSign: 'Aquarius',
        keywords: ['hope', 'faith', 'renewal', 'inspiration'],
        uprightMeaning: {
            keywords: ['hope', 'faith', 'purpose', 'renewal'],
            description: 'The Star represents hope, faith, and spiritual renewal. After destruction comes healing. Trust in the universe and have faith that you are on the right path.'
        },
        reversedMeaning: {
            keywords: ['lack of faith', 'despair', 'discouragement', 'disconnection'],
            description: 'Reversed, The Star indicates hopelessness, lack of faith, or feeling disconnected from spirit. Reconnect with your inner light and rediscover hope.'
        }
    },
    {
        id: 'major-18',
        name: 'The Moon',
        arcana: 'major',
        number: 18,
        element: 'Water',
        zodiacSign: 'Pisces',
        keywords: ['illusion', 'intuition', 'fear', 'subconscious'],
        uprightMeaning: {
            keywords: ['illusion', 'fear', 'anxiety', 'subconscious'],
            description: 'The Moon represents illusion, fear, and the subconscious. Things are not as they appear. Trust your intuition to navigate through confusion and hidden truths.'
        },
        reversedMeaning: {
            keywords: ['release of fear', 'repressed emotions', 'inner confusion', 'clarity'],
            description: 'Reversed, The Moon indicates release of fear, clarity emerging, or repressed emotions surfacing. Hidden truths are coming to light.'
        }
    },
    {
        id: 'major-19',
        name: 'The Sun',
        arcana: 'major',
        number: 19,
        element: 'Fire',
        zodiacSign: 'Sun',
        keywords: ['joy', 'success', 'positivity', 'vitality'],
        uprightMeaning: {
            keywords: ['positivity', 'fun', 'warmth', 'success'],
            description: 'The Sun represents positivity, joy, and success. Like the sun brings light and warmth, this card brings optimism, vitality, and celebration of life.'
        },
        reversedMeaning: {
            keywords: ['inner child', 'temporary depression', 'overly optimistic', 'lack of clarity'],
            description: 'Reversed, The Sun may indicate temporary sadness, excessive optimism, or difficulty seeing your own shine. The joy is still there but may be dimmed temporarily.'
        }
    },
    {
        id: 'major-20',
        name: 'Judgement',
        arcana: 'major',
        number: 20,
        element: 'Fire',
        zodiacSign: 'Pluto',
        keywords: ['rebirth', 'reflection', 'reckoning', 'awakening'],
        uprightMeaning: {
            keywords: ['judgement', 'rebirth', 'inner calling', 'absolution'],
            description: 'Judgement represents rebirth, inner calling, and absolution. A time of reflection and self-evaluation. Answer your higher calling and rise to your purpose.'
        },
        reversedMeaning: {
            keywords: ['self-doubt', 'refuse to learn', 'self-criticism', 'ignoring the call'],
            description: 'Reversed, Judgement indicates self-doubt, harsh self-criticism, or ignoring your inner calling. You may be refusing to learn important life lessons.'
        }
    },
    {
        id: 'major-21',
        name: 'The World',
        arcana: 'major',
        number: 21,
        element: 'Earth',
        zodiacSign: 'Saturn',
        keywords: ['completion', 'accomplishment', 'fulfillment', 'wholeness'],
        uprightMeaning: {
            keywords: ['completion', 'integration', 'accomplishment', 'travel'],
            description: 'The World represents completion, accomplishment, and fulfillment. A cycle is complete. Celebrate your achievements while preparing for the next journey to begin.'
        },
        reversedMeaning: {
            keywords: ['incompletion', 'no closure', 'lack of achievement', 'shortcuts'],
            description: 'Reversed, The World indicates lack of closure, incomplete projects, or taking shortcuts. You may be delaying completion or not fully integrating life lessons.'
        }
    }
];
