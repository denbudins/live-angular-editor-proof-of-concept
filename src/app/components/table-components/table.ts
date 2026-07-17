import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';

// @editable:start
interface User {
  id: number;
  name: string;
  role: string;
  status: 'active' | 'inactive';
  joined: string;
}
// @editable:end

@Component({
  selector: 'app-table',
  imports: [CommonModule, MatTableModule],
  templateUrl: './table.html',
  styleUrl: './table.scss',
})
export default class TableComponent implements OnInit {
  // @editable:start
  users: User[] = [
    {
      id: 1,
      name: 'Ana Kovač',
      role: 'Admin',
      status: 'active',
      joined: '2024-01-15',
    },
    {
      id: 2,
      name: 'Ivan Horvat',
      role: 'Developer',
      status: 'active',
      joined: '2024-02-20',
    },
    {
      id: 3,
      name: 'Maja Blažić',
      role: 'Designer',
      status: 'inactive',
      joined: '2024-03-10',
    },
    {
      id: 4,
      name: 'Luka Perić',
      role: 'Developer',
      status: 'active',
      joined: '2024-04-05',
    },
    {
      id: 5,
      name: 'Sara Novak',
      role: 'Manager',
      status: 'active',
      joined: '2024-05-18',
    },
  ];
  displayedColumns: string[] = ['id', 'name', 'role', 'status', 'joined'];

  ngOnInit() {}
  // @editable:end
}
