import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Race } from 'src/app/common/race';
import { IProvider } from '../provider';
import { firstValueFrom } from 'rxjs';

type ChampionChipRace = {
  name: string;
  csv_data: string[][];
  csv_headers: string[];
  updated_at: string;
  columns: string;
  columns_mobile: string;
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

    return chipEvents.flatMap(this.mapRaces);
  }

  private async getChipEvents(): Promise<ChipEvent[]> {
    return await firstValueFrom(this.http.get<ChipEvent[]>(`https://api.championchipireland.com/v1/chip_events?${Date.now()}`));
  }

  mapRaces = (chipEvent: ChipEvent): Race[] => {
    const hasMultipleRaces = chipEvent.races.length > 1;

    return chipEvent.races.map((race) => ({
      name: hasMultipleRaces ? `${chipEvent.name} - ${race.name}` : chipEvent.name,
      results: this.mapRace(race),
      headers: race.columns.split(',').map((x) => race.csv_headers[Number(x)]),
      headersMobile: race.columns_mobile.split(',').map((x) => race.csv_headers[Number(x)]),
    }));
  };

  mapRace = (race: ChampionChipRace): any[] => {
    return race.csv_data.map((data) =>
      race.csv_headers.reduce((result: any, header, index) => {
        result[header] = data[index];
        return result;
      }, {})
    );
  };
}
