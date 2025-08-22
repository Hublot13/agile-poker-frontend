export interface User {
  socketId: string;
  name: string;
  isHost: boolean;
  connected: boolean;
}

export interface Room {
  code: string;
  deckType: string;
  roundState: 'idle' | 'voting' | 'revealed';
  users: User[];
  hostSocketId: string;
}

export interface RoomStats {
  totalUsers: number;
  votedUsers: number;
  average: number | null;
  votes: Record<string, string | number> | null;
}

export type DeckType = 'fibonacci' | 'tshirt' | 'modified-fibonacci';

export interface Deck {
  name: string;
  cards: (string | number)[];
}

export const DECKS: Record<DeckType, Deck> = {
  fibonacci: {
    name: 'Fibonacci',
    cards: [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, '?']
  },
  'modified-fibonacci': {
    name: 'Modified Fibonacci',
    cards: [0, 0.5, 1, 2, 3, 5, 8, 13, 20, 40, 100, '?']
  },
  tshirt: {
    name: 'T-Shirt Sizes',
    cards: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '?']
  }
};