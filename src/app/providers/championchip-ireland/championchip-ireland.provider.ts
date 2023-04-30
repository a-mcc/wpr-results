import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Race } from 'src/app/common/race';
import { Result } from 'src/app/common/result';
import { IProvider } from '../provider';

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

    return chipEvents
      .filter((x) => !x.name.endsWith('Rankings'))
      .map((x) => ({
        name: x.name,
        results: x.races.map(this.mapRace)[0],
      }));
  }

  private async getChipEvents(): Promise<ChipEvent[]> {
    return await this.http
      .get<ChipEvent[]>(
        `https://api.championchipireland.com/v1/chip_events?${Date.now()}`
      )
      .toPromise();
  }

  private mapRace(race: ChampionChipRace): Result[] {
    const findIndex = (field: string) => race.csv_headers.indexOf(field);
    const indices = {
      firstName: findIndex('Firstname'),
      lastName: findIndex('Lastname'),
      position: findIndex('Pos'),
      bib: findIndex('Bib'),
      gender: findIndex('Gender'),
      category: findIndex('Cat'),
      club: findIndex('Club'),
      raceTime: findIndex('Finish'),
      chipTime: findIndex('Chiptime'),
    };

    return race.csv_data.map((data) => ({
      firstName: data[indices.firstName],
      lastName: data[indices.lastName],
      position: parseInt(data[indices.position], 10),
      bib: parseInt(data[indices.bib], 10),
      gender: data[indices.gender],
      category: data[indices.category],
      club: data[indices.club],
      raceTime: data[indices.raceTime],
      chipTime: data[indices.chipTime],
    }));
  }
}
