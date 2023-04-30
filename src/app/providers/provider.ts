import { Race } from '../common/race';

export interface IProvider {
  name: string;
  getRaces: () => Promise<Race[]>;
}
