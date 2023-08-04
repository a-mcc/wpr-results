import { RaceMap } from '../common/race';

export interface IProvider {
  name: string;
  getRaces: () => Promise<RaceMap>;
}
