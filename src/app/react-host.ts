import {
  Component,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { createRoot, Root } from 'react-dom/client';
import Demo from './components/react/Card';

@Component({
  selector: 'app-react-host',
  standalone: true,
  template: `<div #reactRoot></div>`,
})
export class ReactHostComponent implements AfterViewInit, OnDestroy {
  @ViewChild('reactRoot', { static: true })
  private reactRoot!: ElementRef<HTMLDivElement>;
  private root: Root | null = null;

  ngAfterViewInit(): void {
    console.log('ReactHostComponent: ngAfterViewInit');
    this.root = createRoot(this.reactRoot.nativeElement);
    this.root.render(Demo());
  }

  ngOnDestroy(): void {
    this.root?.unmount();
    this.root = null;
  }
}
