import type { LocationObject } from 'expo-location';

export interface Melding {
  id: string;
  image: string;
  description: string;
  location: LocationObject;
  category: string;
  monteurName: string;
  timestamp: number;
} 