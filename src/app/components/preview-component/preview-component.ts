import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompilerService } from '../../services';

@Component({
  selector: 'app-preview-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './preview-component.html',
  styleUrl: './preview-component.scss',
})
export class PreviewComponent {
  readonly compiler = inject(CompilerService);
}
