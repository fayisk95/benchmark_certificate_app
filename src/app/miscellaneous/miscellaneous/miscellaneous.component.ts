import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MiscellaneousService } from '../services/miscellaneous.service';
import { MiscellaneousGroup, MiscellaneousRecord } from '../models/miscellaneous.model';
import { GroupFormDialogComponent } from '../dialogs/group-form-dialog.component';
import { RecordFormDialogComponent } from '../dialogs/record-form-dialog.component';

@Component({
  standalone: false,
  selector: 'app-miscellaneous',
  templateUrl: './miscellaneous.component.html',
  styleUrls: ['./miscellaneous.component.scss']
})
export class MiscellaneousComponent implements OnInit {
  groups: MiscellaneousGroup[] = [];
  selectedGroupId: number | null = null;
  selectedGroupRecords: MiscellaneousRecord[] = [];
  loading = false;
  searchTerm = '';
  selectedGroupCode = '';

  // Table columns
  groupColumns: string[] = ['code_name', 'group_name', 'group_code', 'description', 'record_count', 'actions'];
  recordColumns: string[] = ['record_code', 'record_name', 'record_value', 'is_active', 'sort_order', 'actions'];

  constructor(
    private miscellaneousService: MiscellaneousService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadGroups();
  }

  loadGroups(): void {
    this.loading = true;
    this.miscellaneousService.loadGroups().subscribe({
      next: (response) => {
        this.groups = response.groups;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading groups:', error);
        this.loading = false;
      }
    });
  }

  loadRecordsForGroup(groupId: number): void {
    this.selectedGroupId = groupId;
    this.miscellaneousService.loadRecords(groupId).subscribe({
      next: (response) => {
        this.selectedGroupRecords = response.records;
      },
      error: (error) => {
        console.error('Error loading records:', error);
      }
    });
  }

  get filteredGroups(): MiscellaneousGroup[] {
    return this.groups.filter(group => {
      const matchesSearch = !this.searchTerm || 
        group.group_name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        group.code_name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        group.group_code.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesGroupCode = !this.selectedGroupCode || group.group_code === this.selectedGroupCode;
      
      return matchesSearch && matchesGroupCode;
    });
  }

  get groupCodes(): string[] {
    const codes = this.groups.map(group => group.group_code);
    return [...new Set(codes)].sort();
  }

  getRecordCount(groupId: number): number {
    return this.miscellaneousService.getRecordsByGroup(groupId).length;
  }

  // Group operations
  createGroup(): void {
    const dialogRef = this.dialog.open(GroupFormDialogComponent, {
      width: '600px',
      data: { isEdit: false }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.miscellaneousService.createGroup(result).subscribe({
          next: () => {
            this.loadGroups();
          },
          error: (error) => {
            console.error('Error creating group:', error);
          }
        });
      }
    });
  }

  editGroup(group: MiscellaneousGroup): void {
    const dialogRef = this.dialog.open(GroupFormDialogComponent, {
      width: '600px',
      data: { isEdit: true, group }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.miscellaneousService.updateGroup(group.id.toString(), result).subscribe({
          next: () => {
            this.loadGroups();
          },
          error: (error) => {
            console.error('Error updating group:', error);
          }
        });
      }
    });
  }

  deleteGroup(group: MiscellaneousGroup): void {
    if (confirm(`Are you sure you want to delete the group "${group.group_name}"? This will also delete all records in this group.`)) {
      this.miscellaneousService.deleteGroup(group.id.toString()).subscribe({
        next: () => {
          this.loadGroups();
          if (this.selectedGroupId === group.id) {
            this.selectedGroupId = null;
            this.selectedGroupRecords = [];
          }
        },
        error: (error) => {
          console.error('Error deleting group:', error);
        }
      });
    }
  }

  // Record operations
  createRecord(groupId: number): void {
    const dialogRef = this.dialog.open(RecordFormDialogComponent, {
      width: '600px',
      data: { isEdit: false, groupId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.miscellaneousService.createRecord({ ...result, group_id: groupId }).subscribe({
          next: () => {
            this.loadRecordsForGroup(groupId);
          },
          error: (error) => {
            console.error('Error creating record:', error);
          }
        });
      }
    });
  }

  editRecord(record: MiscellaneousRecord): void {
    const dialogRef = this.dialog.open(RecordFormDialogComponent, {
      width: '600px',
      data: { isEdit: true, record, groupId: record.group_id }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.miscellaneousService.updateRecord(record.id.toString(), result).subscribe({
          next: () => {
            this.loadRecordsForGroup(record.group_id);
          },
          error: (error) => {
            console.error('Error updating record:', error);
          }
        });
      }
    });
  }

  deleteRecord(record: MiscellaneousRecord): void {
    if (confirm(`Are you sure you want to delete the record "${record.record_name}"?`)) {
      this.miscellaneousService.deleteRecord(record.id.toString()).subscribe({
        next: () => {
          this.loadRecordsForGroup(record.group_id);
        },
        error: (error) => {
          console.error('Error deleting record:', error);
        }
      });
    }
  }

  toggleRecordStatus(record: MiscellaneousRecord): void {
    const updates = { is_active: !record.is_active };
    this.miscellaneousService.updateRecord(record.id.toString(), updates).subscribe({
      next: () => {
        this.loadRecordsForGroup(record.group_id);
      },
      error: (error) => {
        console.error('Error updating record status:', error);
      }
    });
  }

  getSelectedGroupName(): string {
    const group = this.groups.find(g => g.id === this.selectedGroupId);
    return group ? group.group_name : '';
  }

  clearSelection(): void {
    this.selectedGroupId = null;
    this.selectedGroupRecords = [];
  }

  onSearchChange(): void {
    // The filtering is handled by the filteredGroups getter
    // This method can be used for additional search logic if needed
  }

  onGroupCodeChange(): void {
    // The filtering is handled by the filteredGroups getter
    // This method can be used for additional filter logic if needed
  }
}