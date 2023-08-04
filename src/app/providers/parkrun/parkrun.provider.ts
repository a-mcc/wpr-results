import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Race, RaceMap } from 'src/app/common/race';
import { IProvider } from '../provider';
import { firstValueFrom } from 'rxjs';
import * as cheerio from 'cheerio';

@Injectable({ providedIn: 'root' })
export class ParkrunProvider implements IProvider {
  constructor(private http: HttpClient) {}

  public name = 'Parkrun';

  private cors = 'https://cors.a-mcc.workers.dev/?';
  private consolidatedReportUrl = 'https://www.parkrun.com/results/consolidatedclub/?clubNum=25570';

  public async getRaces(): Promise<RaceMap> {
    const races = new RaceMap();

    races.set('Club Report', () => this.getClubReport());

    return races;
  }

  private async getClubReport(): Promise<Race> {
    const html = await firstValueFrom(this.http.get(this.cors + this.consolidatedReportUrl, { responseType: 'text' }));

    const $ = cheerio.load(html);

    const results = $('h2').map((i, el) => {
      const $el = $(el);
      const name = $el.text();
      const rows = $el.nextAll('table:first').find('tr:contains("Ward Park Runners")');
      const times = rows.map((i, tr) => {
        const tds = $(tr).find('td');

        return {
          Parkrun: name,
          Position: tds.eq(0).text(),
          'Gender Position': tds.eq(1).text(),
          Name: tds.eq(2).text(),
          Time: tds.eq(4).text(),
        };
      });
      console.log([...times]);

      return [...times];
    });

    return {
      name: 'Club Report',
      results: [...results],
      headers: ['Parkrun', 'Position', 'Gender Position', 'Name', 'Time'],
      headersMobile: ['Parkrun', 'Position', 'Gender Position', 'Name', 'Time'],
    };
  }
}
