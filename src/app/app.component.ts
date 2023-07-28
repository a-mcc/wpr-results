import { Component, ViewChild, HostListener } from '@angular/core';
import { ColDef, ValueGetterParams } from 'ag-grid-community';
import { Race } from './common/race';
import { ChampionChipIreland } from './providers/championchip-ireland/championchip-ireland.provider';
import { IProvider } from './providers/provider';
import { AgGridAngular } from 'ag-grid-angular';
import { IconDefinition, faPersonRunning, faRotateLeft } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  @ViewChild(AgGridAngular) grid!: AgGridAngular;

  public runner: IconDefinition = faPersonRunning;
  public reset: IconDefinition = faRotateLeft;

  public defaultGridColumnDef: ColDef = {
    sortable: true,
    flex: 1,
  };
  public gridColumnDefinitions: ColDef[] = [];
  public gridData: any[] = [];

  public activeProvider?: IProvider;
  public providers: IProvider[];

  public activeRace?: Race;
  public races: Race[] = [];

  public quickFilter: string = '';

  constructor(private championChipIreland: ChampionChipIreland) {
    this.providers = [championChipIreland];
    this.onProviderChange(this.providers[0].name);
  }

  title = 'WPR Results';

  async onProviderChange(name: string): Promise<void> {
    this.activeProvider = this.providers.find((x) => x.name === name);
    this.races = await this.activeProvider!.getRaces();
    this.onRaceChange(this.races[0].name);
  }

  onRaceChange(name: string) {
    this.activeRace = this.races.find((x) => x.name === name);

    this.gridData = this.activeRace!.results;
    this.gridColumnDefinitions = Object.keys(this.gridData[0]).map((key) => {
      const hasData = this.gridData.some((x) => x[key]);
      const isNumeric = this.gridData.every((x) => !Number.isNaN(Number(x[key])));

      return {
        field: key,
        hide: !hasData,
        cellDataType: isNumeric ? 'number' : undefined,
        valueGetter: isNumeric ? this.numberParser(key) : undefined,
      };
    });
  }

  numberParser(key: string) {
    return (params: ValueGetterParams) => Number(params.data[key]);
  }

  resetGrid() {
    this.grid.api.setFilterModel(null);
    this.grid.columnApi.resetColumnState();
  }

  @HostListener('window:resize', ['$event'])
  resizeGrid() {
    const gridApi: any = this.grid.api;

    const panel = gridApi.gridBodyCtrl;
    const columns = panel.columnModel;

    const availableWidth = panel.eBodyViewport.clientWidth;
    const usedWidth = columns.displayedColumns.reduce((totalWidth: any, column: any) => totalWidth + column.actualWidth, 0);

    if (usedWidth < availableWidth) {
      this.grid.api.sizeColumnsToFit();
    } else {
      this.grid.columnApi.autoSizeAllColumns();
    }
  }
}
