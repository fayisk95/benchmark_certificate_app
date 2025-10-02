import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MiscellaneousService } from '../services/miscellaneous.service';
import { CreateGroupRequest, MiscellaneousGroup, UpdateGroupRequest } from '../models/miscellaneous.model';
import { GroupFormDialogComponent } from '../dialogs/group-form-dialog.component';
import { RecordFormDialogComponent } from '../dialogs/record-form-dialog.component';
import { NotificationService } from '../../shared/services/notification.service';

@Component({
  standalone: false,
  selector: 'app-miscellaneous',
  templateUrl: './miscellaneous.component.html',
  styleUrls: ['./miscellaneous.component.scss']
})
export class MiscellaneousComponent implements OnInit {
  groups: MiscellaneousGroup[] = [];
  selectedGroupId: string | null = null;
  loading = false;
  searchTerm = '';
  selectedGroupCode = '';

  // Table columns
  groupColumns: string[] = ['misc_group_name', 'misc_group_code', 'misc_description', 'actions'];
  recordColumns: string[] = ['misc_code', 'misc_name', 'misc_description', 'actions'];
  selectedGroupRecords: MiscellaneousGroup[] = [];

  constructor(
    private miscellaneousService: MiscellaneousService,
    private dialog: MatDialog,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.loadGroups();
  }

  loadGroups(): void {
    this.loading = true;
    this.miscellaneousService.loadGroups().subscribe({
      next: (response) => {
        this.groups = response;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading groups:', error);
        this.loading = false;
      }
    });
  }

  loadRecordsForGroup(groupId: string): void {
    this.selectedGroupId = groupId;
    console.log('Selected Group ID:', groupId);
    this.miscellaneousService.getRecordsByGroup(groupId).subscribe({
      next: (response) => {
        this.selectedGroupRecords = response;
      },
      error: (error) => {
        console.error('Error loading records:', error);
      }
    });
  }

  get filteredGroups(): MiscellaneousGroup[] {
    return this.groups.filter(group => {
      const matchesSearch = !this.searchTerm ||
        group.misc_group_name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        group.misc_code.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        group.misc_group_code.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesGroupCode = !this.selectedGroupCode || group.misc_group_code === this.selectedGroupCode;

      return matchesSearch && matchesGroupCode;
    });
  }

  get groupCodes(): string[] {
    const codes = this.groups.map(group => group.misc_group_code);
    return [...new Set(codes)].sort();
  }



  // Group operations
  createGroup(): void {
    const dialogRef = this.dialog.open(GroupFormDialogComponent, {
      width: '600px',
      data: { isEdit: false }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const createGroupRequest: CreateGroupRequest = {
          misc_code: result.code,
          misc_name: result.name,
          misc_group_code: result.group_code,
          misc_group_name: result.group_name,
          misc_description: result.description
        };
        this.miscellaneousService.createGroup(createGroupRequest).subscribe({
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
        const updateGroupRequest: UpdateGroupRequest = {
          misc_code: result.code,
          misc_name: result.name,
          misc_group_code: result.group_code,
          misc_group_name: result.group_name,
          misc_description: result.description
        };
        this.miscellaneousService.updateGroup(group.id.toString(), updateGroupRequest).subscribe({
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
    this.notificationService.warning(`Deleting group "${group.misc_group_name}" will remove all records. This action cannot be undone.`);
    const shouldDelete = false;
    if (shouldDelete) {
      this.miscellaneousService.deleteGroup(group.misc_group_code.toString()).subscribe({
        next: () => {
          this.loadGroups();
          if (this.selectedGroupId === group.misc_group_code) {
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
  createRecord(groupId: string): void {
    const dialogRef = this.dialog.open(RecordFormDialogComponent, {
      width: '600px',
      data: { isEdit: false, groupId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const createRecordRequest: CreateGroupRequest = {
          misc_code: result.misc_code,
          misc_name: result.misc_name,
          misc_group_code: groupId,
          misc_group_name: this.getSelectedGroupName(), // Group name can be empty or fetched if needed
          misc_description: result.description
        };

        this.miscellaneousService.createGroup(createRecordRequest).subscribe({
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

  editRecord(record: MiscellaneousGroup): void {
    const dialogRef = this.dialog.open(RecordFormDialogComponent, {
      width: '600px',
      data: { isEdit: true, record, groupId: record.misc_group_code }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const updateGroupRequest: UpdateGroupRequest = {
          misc_code: result.misc_code,
          misc_name: result.misc_name,
          misc_group_code: record.misc_group_code,
          misc_group_name: this.getSelectedGroupName(), // Group name can be empty or fetched if needed
          misc_description: result.description
        };
        this.miscellaneousService.updateGroup(record.id.toString(), updateGroupRequest).subscribe({
          next: () => {
            this.loadRecordsForGroup(record.misc_group_code);
          },
          error: (error) => {
            console.error('Error updating record:', error);
          }
        });
      }
    });
  }

  deleteRecord(record: MiscellaneousGroup): void {
    this.notificationService.warning(`Delete record "${record.misc_name}"? This action cannot be undone.`);
    const shouldDelete = false;
    if (shouldDelete) {
      this.miscellaneousService.deleteRecord(record.id.toString()).subscribe({
        next: () => {
          this.loadRecordsForGroup(record.misc_group_code);
        },
        error: (error) => {
          console.error('Error deleting record:', error);
        }
      });
    }
  }

  toggleRecordStatus(record: MiscellaneousGroup): void {
    // const updates = { is_active: !record.is_active };
    // this.miscellaneousService.updateRecord(record.id.toString(), updates).subscribe({
    //   next: () => {
    //     this.loadRecordsForGroup(record.group_id);
    //   },
    //   error: (error) => {
    //     console.error('Error updating record status:', error);
    //   }
    // });
  }

  getSelectedGroupName(): string {
    console.log('Getting name for group code:', this.selectedGroupId);
    const group = this.groups.find(g => g.misc_group_code === this.selectedGroupId);
    return group ? group.misc_group_name : '';
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