import { Component, Input, Output } from '@angular/core';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'fa-button',
  templateUrl: './fa-button.component.html',
  styleUrls: ['./fa-button.component.scss'],
})
export class FaButtonComponent {
  @Input({ required: true })
  icon!: IconDefinition;
}
