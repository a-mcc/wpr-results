import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Race, RaceMap } from 'src/app/common/race';
import { IProvider } from '../provider';
import { firstValueFrom } from 'rxjs';
import { ProviderCache } from '../provider.cache';
import { DateTime } from 'luxon';

interface UpdatableRace extends Race {
  updatedAt: string;
}

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
  constructor(private http: HttpClient, private cache: ProviderCache) {}

  public name = 'ChampionChip Ireland';

  private races!: RaceMap;

  public async getRaces(): Promise<RaceMap> {
    if (this.races) {
      return this.races;
    }

    const chipEvents = await this.getChipEvents();

    const cachedRaces = this.cache.get(this.name, this.name) || [];
    const mappedRaces = chipEvents.flatMap(this.mapRaces);
    const allRaces = this.mergeRaceData(cachedRaces, mappedRaces);

    this.cache.set(this.name, this.name, allRaces);

    this.races = allRaces.reduce((map, race) => {
      return map.set(race.name, async () => race);
    }, new RaceMap());

    return this.races;
  }

  private async getChipEvents(): Promise<ChipEvent[]> {
    return await firstValueFrom(this.http.get<ChipEvent[]>(`https://api.championchipireland.com/v1/chip_events?${Date.now()}`));
  }

  private mapRaces = (chipEvent: ChipEvent): UpdatableRace[] => {
    const hasMultipleRaces = chipEvent.races.length > 1;

    return chipEvent.races.map((race) => ({
      name: (hasMultipleRaces ? `${chipEvent.name} - ${race.name}` : chipEvent.name).trim(),
      results: this.mapRace(race),
      headers: race.columns.split(',').map((x) => race.csv_headers[Number(x)]),
      headersMobile: race.columns_mobile.split(',').map((x) => race.csv_headers[Number(x)]),
      updatedAt: parseDate(race.updated_at),
    }));

    function parseDate(date: string): string {
      date = date.replace(/(?:st|nd|rd|th)(?= )/, '');

      return DateTime.fromFormat(date, 'dd MMM yyyy T', { zone: 'UTC' }).toJSON()!;
    }
  };

  private mapRace = (race: ChampionChipRace): any[] => {
    return race.csv_data.map((data) =>
      race.csv_headers.reduce((result: any, header, index) => {
        result[header] = data[index];
        return result;
      }, {})
    );
  };

  private mergeRaceData = (cachedRaces: UpdatableRace[], mappedRaces: UpdatableRace[]): UpdatableRace[] => {
    const races: { [key: string]: UpdatableRace } = {};
    for (const race of cachedRaces) {
      races[race.name] = race;
    }

    for (const race of mappedRaces) {
      const cachedRace = races[race.name];
      if (!cachedRace || cachedRace.updatedAt < race.updatedAt) {
        races[race.name] = race;
      }
    }

    return Object.values(races);
  };
}
