import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
  MatTableModule,
} from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

export const MODULE_REGISTRY: Record<string, unknown> = {
  '@angular/core': { Component, Input, Output, EventEmitter },
  '@angular/common': { CommonModule },
  '@angular/forms': { FormsModule, ReactiveFormsModule },
  '@angular/material/table': {
    MatTableModule,
    MatTable,
    MatHeaderCellDef,
    MatHeaderRowDef,
    MatColumnDef,
    MatCellDef,
    MatRowDef,
    MatHeaderCell,
    MatCell,
    MatHeaderRow,
    MatRow,
  },
  '@angular/material/button': { MatButtonModule },
  '@angular/material/input': { MatInputModule },
  '@angular/material/icon': { MatIconModule },
  '@angular/material/card': { MatCardModule },
};
