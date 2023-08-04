export type Race = {
  name: string;
  results: any[];
  headers: string[];
  headersMobile: string[];
};

export class RaceMap extends Map<string, () => Promise<Race>> {}
