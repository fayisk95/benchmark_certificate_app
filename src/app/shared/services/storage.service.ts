import { Injectable } from '@angular/core';
import { MiscellaneousService } from '../../miscellaneous/services/miscellaneous.service';
import { MiscellaneousGroup } from '../../miscellaneous/models/miscellaneous.model';

@Injectable({
    providedIn: 'root',
})
export class StorageService {
    private certTrainings: MiscellaneousGroup[] = [];
    private batchTypes: MiscellaneousGroup[] = [];
    private certificateTypes: MiscellaneousGroup[] = [];

    constructor(private miscService: MiscellaneousService) { }

    // ================== Loaders ==================

    loadCertTrainings(): void {
        this.miscService.getRecordsByGroup('CTP').subscribe(res => {
            if (res) this.certTrainings = res;
        });
    }

    loadBatchTypes(): void {
        this.miscService.getRecordsByGroup('BT').subscribe(res => {
            if (res) this.batchTypes = res;
        });
    }

    loadCertificateTypes(): void {
        this.miscService.getRecordsByGroup('CT').subscribe(res => {
            if (res) this.certificateTypes = res;
        });
    }

    // ================== Get complete arrays ==================

    getCertTrainings(): MiscellaneousGroup[] {
        return this.certTrainings;
    }

    getBatchTypes(): MiscellaneousGroup[] {
        return this.batchTypes;
    }

    getCertificateTypes(): MiscellaneousGroup[] {
        return this.certificateTypes;
    }

    // ================== Get one object by ID ==================

    getCertTrainingById(id: string): MiscellaneousGroup | undefined {
        return this.certTrainings.find(item => item.misc_code === id);
    }

    getBatchTypeById(id: string): MiscellaneousGroup | undefined {
        return this.batchTypes.find(item => item.misc_code === id);
    }

    getCertificateTypeById(id: string): MiscellaneousGroup | undefined {
        return this.certificateTypes.find(item => item.misc_code === id);
    }

    // ================== Get only name by ID ==================

    getCertTrainingNameById(id: string): string | undefined {
        return this.getCertTrainingById(id)?.misc_name;
    }

    getBatchTypeNameById(id: string): string | undefined {
        return this.getBatchTypeById(id)?.misc_name;
    }

    getCertificateTypeNameById(id: string): string | undefined {
        return this.getCertificateTypeById(id)?.misc_name;
    }
}
