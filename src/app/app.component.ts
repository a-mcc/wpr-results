import { Component, ViewChild, HostListener, OnInit } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { ColDef, ValueGetterParams } from 'ag-grid-community';
import { Race, RaceMap } from './common/race';
import { ChampionChipIreland } from './providers/championchip-ireland/championchip-ireland.provider';
import { IProvider } from './providers/provider';
import { AgGridAngular } from 'ag-grid-angular';
import { IconDefinition, faPersonRunning, faDownload, faShareNodes } from '@fortawesome/free-solid-svg-icons';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { ParkrunProvider } from './providers/parkrun/parkrun.provider';
import { MyRaceResult } from './providers/my-race-result/my-race-result-provider';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  @ViewChild(AgGridAngular) grid!: AgGridAngular;

  public isLoading: boolean = true;

  public runner: IconDefinition = faPersonRunning;
  public download: IconDefinition = faDownload;
  public share: IconDefinition = faShareNodes;

  public defaultGridColumnDef: ColDef = { sortable: true };
  public gridColumnDefinitions: ColDef[] = [];
  public gridColumnDefinitionsMobile: ColDef[] = [];
  public gridData: any[] = [];

  public providers: IProvider[];
  public activeProvider!: IProvider;

  public raceNames: string[] = [];
  public activeRaceName: string = '';

  private races: RaceMap = new RaceMap();
  private activeRace!: Race;

  public quickFilter: string = '';

  public isMobile: boolean = false;
  public hasMobileColumns: boolean = false;
  public showAllColumns: boolean = false;

  constructor(
    private clipboard: Clipboard,
    private parkrunProvider: ParkrunProvider,
    private championChipIreland: ChampionChipIreland,
    private myRaceResult: MyRaceResult
  ) {
    this.providers = [parkrunProvider, championChipIreland, myRaceResult];
  }

  async ngOnInit(): Promise<void> {
    const params = /#\/(?<provider>[^\/]+)\/(?<race>[^\/]+)(\/(?<filter>[^\/]+))?/.exec(location.hash)?.groups;

    const providerName = getParam('provider').toLowerCase();
    const raceName = getParam('race').toLowerCase();

    const provider = this.providers.find((x) => x.name.toLowerCase() === providerName) || this.providers[0];
    await this.onProviderChange(provider.name, raceName);

    this.quickFilter = getParam('filter');

    function getParam(name: string): string {
      return decodeURIComponent(params?.[name] || '');
    }
  }

  async onProviderChange(name: string, raceName: string | null = null): Promise<void> {
    this.updateUrl(false);
    this.quickFilter = '';
    this.isLoading = true;
    this.raceNames = [];
    this.activeProvider = this.providers.find((x) => x.name === name)!;
    this.races = await this.activeProvider.getRaces();
    this.raceNames = [...this.races.keys()];

    const race = this.raceNames.find((x) => x.toLowerCase() === raceName?.toLowerCase()) || this.raceNames[0];
    await this.onRaceChange(race);
  }

  async onRaceChange(name: string) {
    this.isLoading = true;

    this.activeRace = await this.races.get(name)!();
    this.activeRaceName = this.activeRace.name;

    this.gridData = this.activeRace.results;
    this.gridColumnDefinitions = this.activeRace.headers.map((key) => {
      const hasData = this.gridData.some((x) => x[key]);
      const isNumeric = hasData && this.gridData.every((x) => !Number.isNaN(Number(x[key])));

      return {
        field: key,
        hide: !hasData,
        cellDataType: isNumeric ? 'number' : undefined,
        valueGetter: isNumeric ? this.numberParser(key) : undefined,
      };
    });

    this.gridColumnDefinitionsMobile = this.gridColumnDefinitions.map((columnDefinition) => ({
      ...columnDefinition,
      hide: columnDefinition.hide || !this.activeRace.headersMobile.includes(columnDefinition.field!),
    }));

    this.hasMobileColumns = this.activeRace.headersMobile.length != this.activeRace.headers.length;

    this.isLoading = false;

    this.updateUrl();
  }

  onQuickFilterChanged(value: string): void {
    this.quickFilter = value;

    this.updateUrl();
  }

  numberParser(key: string) {
    return (params: ValueGetterParams) => Number(params.data[key]);
  }

  resizeGrid() {
    this.grid.api.autoSizeAllColumns();

    const gridApi: any = this.grid.api;
    const availableWidth = gridApi.gridBodyCtrl.eBodyViewport.clientWidth;
    const usedWidth = gridApi.gridBodyCtrl.columnModel.displayedColumns.reduce((totalWidth: any, column: any) => totalWidth + column.actualWidth, 0);

    if (availableWidth > usedWidth) {
      this.grid.api.sizeColumnsToFit();
    }
  }

  shareGrid() {
    this.clipboard.copy(location.href);
  }

  exportGrid() {
    this.grid.api.exportDataAsCsv({
      exportedRows: 'filteredAndSorted',
      fileName: `${this.activeRace.name}.csv`,
      allColumns: true,
    });
  }

  onShowAllColumnsChange(event: MatSlideToggleChange) {
    this.showAllColumns = event.checked;

    setTimeout(() => this.resizeGrid());
  }

  @HostListener('window:resize')
  onWindowResize() {
    this.isMobile = window.innerWidth < 1024;

    setTimeout(() => this.resizeGrid());
  }

  updateUrl(includeHash = true) {
    const encode = (value: string) => encodeURIComponent(value);

    let url = location.origin + location.pathname;
    if (includeHash) {
      url += `#/${encode(this.activeProvider.name)}/${encode(this.activeRace.name)}/${encode(this.quickFilter)}`;
    }

    history.replaceState({}, document.title, url);
  }
}
