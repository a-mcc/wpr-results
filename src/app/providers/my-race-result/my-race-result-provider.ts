import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Race, RaceMap } from 'src/app/common/race';
import { IProvider } from '../provider';
import { firstValueFrom } from 'rxjs';
import { ProviderCache } from '../provider.cache';

enum Races {
  BelfastCityHalfMarathon23 = "Belfast City Half Marathon '23",
}

@Injectable({ providedIn: 'root' })
export class MyRaceResult implements IProvider {
  constructor(private http: HttpClient, private cache: ProviderCache) {}

  public name = 'My Race Result';

  private races!: RaceMap;

  public async getRaces(): Promise<RaceMap> {
    if (this.races) {
      return this.races;
    }

    this.races = new RaceMap();
    this.races.set(
      Races.BelfastCityHalfMarathon23,
      async () => await this.cache.getOrRetrieve(this.name, Races.BelfastCityHalfMarathon23, async () => this.getBelfastCityHalfMarathon23())
    );

    return this.races;
  }

  private async getBelfastCityHalfMarathon23(): Promise<Race> {
    const json = await firstValueFrom(this.http.get('./assets/results/belfast-half-marathon-2023.json', { responseType: 'text' }));
    const rawResults: { [key: string]: string[][] } = JSON.parse(json);

    const byChipTime = (a: string[], b: string[]): number => a[6].localeCompare(b[6]);

    Object.keys(rawResults).forEach((cat: string) => {
      rawResults[cat].sort(byChipTime).forEach((result: string[], index: number) => {
        result.push(cat);
        result.push(`${index + 1}`);
      });
    });

    ['F', 'M'].forEach((gender) => {
      Object.keys(rawResults)
        .filter((key) => key.startsWith(gender))
        .map((key: string) => rawResults[key])
        .flat(1)
        .sort(byChipTime)
        .forEach((result: string[], index: number) => result.push(`${index + 1}`));
    });

    const results = Object.values(rawResults)
      .flat(1)
      .sort(byChipTime)
      .map((result, index) => ({
        Pos: index + 1,
        'Gender Pos': result[9],
        'Cat Pos': result[8],
        Cat: result[7],
        Bib: Number(result[2]),
        Name: result[3],
        Club: result[4],
        'Finish Time': result[5],
        'Chip Time': result[6],
      }));

    return {
      name: Races.BelfastCityHalfMarathon23,
      results: results,
      headers: ['Pos', 'Gender Pos', 'Cat Pos', 'Cat', 'Bib', 'Name', 'Club', 'Finish Time', 'Chip Time'],
      headersMobile: ['Pos', 'Gender Pos', 'Cat Pos', 'Cat', 'Bib', 'Name', 'Club', 'Finish Time', 'Chip Time'],
    };
  }
}
