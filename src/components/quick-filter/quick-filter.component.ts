import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IconDefinition, faMagnifyingGlass, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FormsModule } from '@angular/forms';
import { FaButtonComponent } from '../fa-button/fa-button.component';

@Component({
  standalone: true,
  imports: [FaButtonComponent, FormsModule],
  selector: 'quick-filter',
  templateUrl: './quick-filter.component.html',
  styleUrls: ['./quick-filter.component.scss'],
})
export class QuickFilterComponent {
  @Input({ required: true })
  public text!: string;
  @Output()
  public textChange: EventEmitter<string> = new EventEmitter<string>();

  public filter: IconDefinition = faMagnifyingGlass;
  public clearFilter: IconDefinition = faXmark;

  private quickFilterDebounce?: ReturnType<typeof setTimeout>;

  clearQuickFilter() {
    this.text = '';
    this.onQuickFilterChanged('', true);
  }

  onQuickFilterChanged(quickFilter: string, noDelay: boolean = false) {
    this.quickFilterDebounce && clearTimeout(this.quickFilterDebounce);

    this.quickFilterDebounce = setTimeout(() => this.textChange.emit(quickFilter), noDelay ? 0 : 500);
  }
}
