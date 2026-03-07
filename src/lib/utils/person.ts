export function getPersonName(person: string): string {
    if (person === 'shubham') return 'Shubham';
    if (person === 'khushi') return 'Khushi';
    if (person === 'shared' || person === 'both') return 'Together';
    return 'Someone';
}
