import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LiveEditorComponent } from './components';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LiveEditorComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'live-angular-editor-proof-of-concept';
}
