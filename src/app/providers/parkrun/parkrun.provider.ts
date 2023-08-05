import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Race, RaceMap } from 'src/app/common/race';
import { IProvider } from '../provider';
import { firstValueFrom } from 'rxjs';
import * as cheerio from 'cheerio';

@Injectable({ providedIn: 'root' })
export class ParkrunProvider implements IProvider {
  constructor(private http: HttpClient) {}

  public name = 'parkrun';

  private cors = 'https://cors.a-mcc.workers.dev/?';
  private consolidatedReportUrl = 'https://www.parkrun.com/results/consolidatedclub/?clubNum=25570&eventdate=';

  private races: { [date: string]: Race } = {};

  public async getRaces(): Promise<RaceMap> {
    const now = new Date();
    const daysSinceSaturday = (1 + now.getDay()) % 7;
    const saturday = new Date(now.setDate(now.getDate() - daysSinceSaturday));

    const races = new RaceMap();

    while (races.size < 4) {
      const date = saturday.toISOString().split('T')[0];
      races.set(date, () => this.getClubReport(date));
      saturday.setDate(saturday.getDate() - 7);
    }

    return races;
  }

  private async getClubReport(date: string): Promise<Race> {
    if (this.races[date]) {
      return this.races[date];
    }

    const clubReportHtml = await firstValueFrom(this.http.get(this.cors + this.consolidatedReportUrl + date, { responseType: 'text' }));
    const $ = cheerio.load(clubReportHtml);

    const results = $('h2').map((i, el) => {
      const $el = $(el);
      const name = $el.text();

      const rows = $el.nextAll('table:first').find('tr:contains("Ward Park Runners")');
      const times = rows.map((i, tr) => {
        const tds = $(tr).find('td');

        return {
          parkrun: name,
          Position: tds.eq(0).text(),
          'Gender Position': tds.eq(1).text(),
          Name: tds.eq(2).text(),
          Time: tds.eq(4).text(),
        };
      });

      return [...times];
    });

    return (this.races[date] = {
      name: date,
      results: [...results].sort((x, y) => x.parkrun.localeCompare(y.parkrun)),
      headers: ['parkrun', 'Position', 'Gender Position', 'Name', 'Time'],
      headersMobile: ['parkrun', 'Position', 'Gender Position', 'Name', 'Time'],
    });
  }
}
