import { Component, ViewChild } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef } from 'ag-grid-community';
import { Race } from './common/race';
import { Result } from './common/result';
import { ChampionChipIreland } from './providers/championchip-ireland/championchip-ireland.provider';
import { IProvider } from './providers/provider';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  @ViewChild('#grid') grid!: AgGridAngular;

  public defaultColumnDef: ColDef;
  public gridColumnDefinitions: ColDef[];
  public gridData: Result[] = [];

  public activeProvider!: IProvider;
  public providers: IProvider[];

  public activeRace?: Race;
  public races: Race[] = [];

  constructor(championChipIreland: ChampionChipIreland) {
    this.providers = [championChipIreland];
    this.onProviderChange(this.providers[0].name);

    this.gridColumnDefinitions = [
      { field: 'firstName' },
      { field: 'lastName' },
      { field: 'position' },
      { field: 'bib' },
      { field: 'gender' },
      { field: 'category' },
      { field: 'club' },
      { field: 'raceTime' },
      { field: 'chipTime' },
    ];

    this.defaultColumnDef = {
      filter: true,
    };
  }

  title = 'WPR Results';

  async onProviderChange(name: string): Promise<void> {
    this.activeProvider = this.providers.find((x) => x.name === name)!;
    this.races = await this.activeProvider!.getRaces();
    this.onRaceChange(this.races[0].name);
  }

  onRaceChange(name: string) {
    this.activeRace = this.races.find((x) => x.name === name);

    this.gridData = this.activeRace!.results;
  }
}
