import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Race, RaceMap } from 'src/app/common/race';
import { IProvider } from '../provider';
import { firstValueFrom } from 'rxjs';
import * as cheerio from 'cheerio';
import { ProviderCache } from '../provider.cache';

type ParkrunRace = {
  parkrun: string;
  Position: string;
  'Gender Position': string;
  Name: string;
  Time: string;
  Achievement: string;
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

    while (races.size < 4) {
      const date = formatDate(saturday);
      races.set(date, () => this.getClubReport(date));
      saturday.setDate(saturday.getDate() - 7);
    }

    return races;

    function formatDate(date: Date): string {
      const year = date.getFullYear().toString();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');

      return `${year}-${month}-${day}`;
    }
  }

  private async getClubReport(date: string): Promise<Race> {
    return this.cache.getOrRetrieve(this.name, date, async () => {
      const html = await this.getHTML(this.consolidatedReportUrl + date);
      const $ = cheerio.load(html);

      const eventResults = $('h2').map((i, h2) => {
        const parkrunName = $(h2).text();
        const event = $(`a:contains("${parkrunName}")`).attr('href')!;

        return this.getEventResults(parkrunName, event);
      });

      const results = await Promise.all([...eventResults]);

      return {
        name: date,
        results: [...results].flat().sort((x, y) => x.parkrun.localeCompare(y.parkrun)),
        headers: ['parkrun', 'Position', 'Gender Position', 'Name', 'Time', 'Achievement'],
        headersMobile: ['parkrun', 'Position', 'Name', 'Time', 'Achievement'],
      };
    });
  }

  private async getEventResults(parkrunName: string, event: string): Promise<ParkrunRace[]> {
    parkrunName = parkrunName.split('parkrun')[0].trim();

    const html = await this.getHTML(event);
    const $ = cheerio.load(html);

    const results = $('tr[data-club="Ward Park Runners"]').map((i, tr) => {
      const $tr = $(tr);
      const position = $tr.attr('data-position')!;
      const genderPosition = $tr.find('td.Results-table-td--gender .detailed').text().split('/')[0].trim()!;
      const name = $tr.attr('data-name')!;
      const time = $tr.find('td.Results-table-td--time .compact').text()!;
      const achievement = $tr.attr('data-achievement')!;

      return {
        parkrun: parkrunName,
        Position: position,
        'Gender Position': genderPosition,
        Name: name,
        Time: time,
        Achievement: achievement,
      };
    });

    return [...results];
  }

  private async getHTML(url: string): Promise<string> {
    return await firstValueFrom(this.http.get(this.cors + url, { responseType: 'text' }));
  }
}
