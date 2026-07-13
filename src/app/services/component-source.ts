// src/app/services/code-sample.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface ComponentFiles {
  ts: string;
  html: string;
  scss: string;
}

@Injectable({ providedIn: 'root' })
export class CodeSampleService {
  private http = inject(HttpClient);

  public async fetchFile(path: string): Promise<string> {
    try {
      return await firstValueFrom(
        this.http.get(`${path}`, { responseType: 'text' }),
      );
    } catch {
      return '';
    }
  }
}
