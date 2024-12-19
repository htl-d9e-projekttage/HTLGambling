export interface Spin {
    lane1: string[];
    lane2: string[];
    lane3: string[];
    winIndex1: number;
    winIndex2: number;
    winIndex3: number;
    finalFace: finalFace;
    moneyWon: number;
}

export interface finalFace {
    1: {
        1: string;
        2: string;
        3: string;
    },
    2: {
        1: string;
        2: string;
        3: string;
    },
    3: {
        1: string;
        2: string;
        3: string;
    }
}