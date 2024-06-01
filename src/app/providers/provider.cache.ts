import { Injectable } from '@angular/core';
import { Race } from '../common/race';

@Injectable({ providedIn: 'root' })
export class ProviderCache {
  public async getOrRetrieve(providerName: string, raceName: string, getter: () => Promise<Race>): Promise<Race> {
    const item = this.get<Race>(providerName, raceName);
    if (item) {
      return item;
    }

    return this.set(providerName, raceName, await getter());
  }

  public get<T>(providerName: string, raceName: string): T {
    return JSON.parse(localStorage.getItem(this.getName(providerName, raceName))!);
  }

  public set<T>(providerName: string, raceName: string, data: T): T {
    localStorage.setItem(this.getName(providerName, raceName), JSON.stringify(data));
    return data;
  }

  public remove(providerName: string, raceName: string) {
    localStorage.removeItem(this.getName(providerName, raceName));
  }

  private getName(providerName: string, raceName: string) {
    return `${providerName}.${raceName}`;
  }
}
