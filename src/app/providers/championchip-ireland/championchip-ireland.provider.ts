import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Race } from 'src/app/common/race';
import { IProvider } from '../provider';
import { firstValueFrom } from 'rxjs';

type ChampionChipRace = {
  csv_data: string[][];
  csv_headers: string[];
  updated_at: string;
};

type ChipEvent = {
  name: string;
  races: ChampionChipRace[];
};

@Injectable({ providedIn: 'root' })
export class ChampionChipIreland implements IProvider {
  constructor(private http: HttpClient) {}

  public name = 'ChampionChip Ireland';

  public async getRaces(): Promise<Race[]> {
    const chipEvents = await this.getChipEvents();

    return chipEvents.map((x) => ({
      name: x.name,
      results: x.races.map(this.mapRace)[0],
    }));
  }

  private async getChipEvents(): Promise<ChipEvent[]> {
    return await firstValueFrom(
      this.http.get<ChipEvent[]>(
        `https://api.championchipireland.com/v1/chip_events?${Date.now()}`
      )
    );
  }

  private mapRace(race: ChampionChipRace): any[] {
    return race.csv_data.map((data) =>
      race.csv_headers.reduce((result: any, header, index) => {
        result[header] = data[index];
        return result;
      }, {})
    );
  }
}
