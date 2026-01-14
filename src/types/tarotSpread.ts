/**
 * Tarot Spread Type Definitions
 * Configurations for different tarot card spread layouts
 */

/**
 * Available spread types with their specific purposes
 */
export type SpreadType =
    | 'DAILY_GUIDANCE'
    | 'DECISION_CROSS'
    | 'TEMPORAL_FLOW'
    | 'RELATIONSHIP_MIRROR'
    | 'SOUL_JOURNEY';

/**
 * Position configuration for a single card in a spread
 */
export interface SpreadPosition {
    /** Horizontal position as percentage (0-100) */
    x: number;
    /** Vertical position as percentage (0-100) */
    y: number;
    /** Rotation in degrees */
    rotation: number;
    /** Label for this position (e.g., "Past", "Present", "Future") */
    label: string;
}

/**
 * Full configuration for a spread type
 */
export interface SpreadConfig {
    /** Unique spread type identifier */
    type: SpreadType;
    /** Display name for the spread */
    name: string;
    /** Number of cards in this spread */
    cardCount: number;
    /** Description of when to use this spread */
    description: string;
    /** Position configurations for each card slot */
    positions: SpreadPosition[];
}

/**
 * Spread configurations with positions and labels
 */
export const SPREAD_CONFIGS: Record<SpreadType, SpreadConfig> = {
    DAILY_GUIDANCE: {
        type: 'DAILY_GUIDANCE',
        name: 'Daily Guidance',
        cardCount: 1,
        description: 'For general vibes, "card of the day," or very simple questions.',
        positions: [
            { x: 50, y: 50, rotation: 0, label: 'Your Message' },
        ],
    },

    DECISION_CROSS: {
        type: 'DECISION_CROSS',
        name: 'Decision Cross',
        cardCount: 3,
        description: 'For "Should I...?" or "Either/Or" questions.',
        positions: [
            { x: 50, y: 50, rotation: 0, label: 'The Choice' },
            { x: 20, y: 50, rotation: -5, label: 'Path A' },
            { x: 80, y: 50, rotation: 5, label: 'Path B' },
        ],
    },

    TEMPORAL_FLOW: {
        type: 'TEMPORAL_FLOW',
        name: 'Temporal Flow',
        cardCount: 3,
        description: 'For chronological concerns or "How did I get here?"',
        positions: [
            { x: 20, y: 50, rotation: -3, label: 'Past' },
            { x: 50, y: 50, rotation: 0, label: 'Present' },
            { x: 80, y: 50, rotation: 3, label: 'Future' },
        ],
    },

    RELATIONSHIP_MIRROR: {
        type: 'RELATIONSHIP_MIRROR',
        name: 'Relationship Mirror',
        cardCount: 5,
        description: 'For any interpersonal questions.',
        positions: [
            { x: 20, y: 50, rotation: -5, label: 'You' },
            { x: 80, y: 50, rotation: 5, label: 'The Other' },
            { x: 50, y: 30, rotation: 0, label: 'The Connection' },
            { x: 35, y: 70, rotation: -3, label: 'Challenges' },
            { x: 65, y: 70, rotation: 3, label: 'Outcome' },
        ],
    },

    SOUL_JOURNEY: {
        type: 'SOUL_JOURNEY',
        name: 'Soul Journey',
        cardCount: 10,
        description: 'For deep, complex, or existential questions.',
        positions: [
            // Cross section (cards 1-6)
            { x: 50, y: 50, rotation: 0, label: 'Present' },
            { x: 50, y: 50, rotation: 90, label: 'Challenge' },
            { x: 50, y: 75, rotation: 0, label: 'Foundation' },
            { x: 25, y: 50, rotation: 0, label: 'Past' },
            { x: 50, y: 25, rotation: 0, label: 'Crown' },
            { x: 75, y: 50, rotation: 0, label: 'Near Future' },
            // Staff section (cards 7-10)
            { x: 90, y: 85, rotation: 0, label: 'Self' },
            { x: 90, y: 65, rotation: 0, label: 'Environment' },
            { x: 90, y: 45, rotation: 0, label: 'Hopes & Fears' },
            { x: 90, y: 25, rotation: 0, label: 'Outcome' },
        ],
    },
};

/**
 * Get the spread configuration for a given type
 */
export function getSpreadConfig(type: SpreadType): SpreadConfig {
    return SPREAD_CONFIGS[type];
}

/**
 * Get all available spread types
 */
export function getAllSpreadTypes(): SpreadType[] {
    return Object.keys(SPREAD_CONFIGS) as SpreadType[];
}

/**
 * Infer spread type from number of cards (fallback logic)
 */
export function inferSpreadType(cardCount: number): SpreadType | null {
    switch (cardCount) {
        case 1:
            return 'DAILY_GUIDANCE';
        case 3:
            return 'TEMPORAL_FLOW'; // Default 3-card to Temporal Flow
        case 5:
            return 'RELATIONSHIP_MIRROR';
        case 10:
            return 'SOUL_JOURNEY';
        default:
            return null;
    }
}
