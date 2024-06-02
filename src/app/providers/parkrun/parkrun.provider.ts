import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Race, RaceMap } from 'src/app/common/race';
import { IProvider } from '../provider';
import { firstValueFrom } from 'rxjs';
import { CheerioAPI, Element, load } from 'cheerio';
import { ProviderCache } from '../provider.cache';
import { get } from 'http';

type ParkrunRace = {
  parkrun: string;
  Position: string;
  'Gender Position': string;
  Name: string;
  Time: string;
};

@Injectable({ providedIn: 'root' })
export class ParkrunProvider implements IProvider {
  constructor(private http: HttpClient, private cache: ProviderCache) {}

  public name = 'parkrun';

  private cors = 'https://cors.a-mcc.workers.dev/?';
  private consolidatedReportUrl = 'https://www.parkrun.com/results/consolidatedclub/?clubNum=25570&eventdate=';

  public async getRaces(): Promise<RaceMap> {
    const now = new Date();
    const daysSinceSaturday = (1 + now.getDay()) % 7;
    const saturday = new Date(now.setDate(now.getDate() - daysSinceSaturday));

    const races = new RaceMap();

    while (races.size < 52) {
      const date = this.formatDate(saturday);
      races.set(date, () => this.getClubReport(date));
      saturday.setDate(saturday.getDate() - 7);
    }

    return races;
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private async getClubReport(date: string): Promise<Race> {
    const getReport = async () => {
      const html = await this.getHTML(this.consolidatedReportUrl + date);

      const $ = load(html);

      const results = $('h2').map((i, h2) => this.getEventResults($, h2));

      return {
        name: date,
        results: [...results].flat().sort((x, y) => x.parkrun.localeCompare(y.parkrun)),
        headers: ['parkrun', 'Position', 'Gender Position', 'Name', 'Time'],
        headersMobile: ['parkrun', 'Position', 'Name', 'Time'],
      };
    };

    const today = this.formatDate(new Date());
    if (date === today) {
      return await getReport();
    }

    return this.cache.getOrRetrieve(this.name, date, getReport);
  }

  private getEventResults($: CheerioAPI, h2: Element): ParkrunRace[] {
    const parkrunName = $(h2)
      .text()
      .replace(/ ?parkrun ?/, '')
      .trim();

    const results = $('~table:first', h2)
      .find('tr:has(td:nth-child(4):contains("Ward Park Runners"))')
      .map((i, tr) => {
        const [position, genderPosition, name, time] = [...$(tr).find('td:not(:nth-child(4))')].map((td) => $(td).text());

        return {
          parkrun: parkrunName,
          Position: position,
          'Gender Position': genderPosition,
          Name: name,
          Time: time,
        };
      });

    return [...results];
  }

  private async getHTML(url: string): Promise<string> {
    return await firstValueFrom(this.http.get(this.cors + url, { responseType: 'text' }));
  }
}
