export interface Item {
    id: string;
    name: string;
    category: string;
    notes?: string;
    dateAdded: string;
    photoUri?: string;
    lastChecked?: string;
    usedStatus: 'used' | 'unused';
}
