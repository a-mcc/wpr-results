import { Component, Input, Output } from '@angular/core';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

@Component({
  standalone: true,
  imports: [FaIconComponent],
  selector: 'fa-button',
  templateUrl: './fa-button.component.html',
  styleUrls: ['./fa-button.component.scss'],
})
export class FaButtonComponent {
  @Input({ required: true })
  icon!: IconDefinition;

  @Input()
  clickable: boolean = true;
}
