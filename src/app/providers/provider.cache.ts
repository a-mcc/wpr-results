import { Injectable } from '@angular/core';
import { Race } from '../common/race';

@Injectable({ providedIn: 'root' })
export class ProviderCache {
  public async getOrRetrieve(providerName: string, raceName: string, getter: () => Promise<Race>): Promise<Race> {
    const item = this.get(providerName, raceName);
    if (item) {
      return item;
    }

    const data = await getter();
    this.set(providerName, raceName, data);

    return data;
  }

  public get(providerName: string, raceName: string): any {
    return JSON.parse(localStorage.getItem(`${providerName}.${raceName}`)!);
  }

  public set(providerName: string, raceName: string, data: any): void {
    localStorage.setItem(`${providerName}.${raceName}`, JSON.stringify(data));
  }
}
