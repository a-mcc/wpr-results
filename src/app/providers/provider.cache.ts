import { Injectable } from '@angular/core';
import { Race } from '../common/race';

@Injectable({ providedIn: 'root' })
export class ProviderCache {
  public async get(providerName: string, raceName: string, getter: () => Promise<Race>): Promise<Race> {
    const key = `${providerName}.${raceName}`;

    const cache = sessionStorage.getItem(key);
    if (cache) {
      return JSON.parse(cache);
    }

    const data = await getter();
    sessionStorage.setItem(key, JSON.stringify(data));

    return data;
  }
}
