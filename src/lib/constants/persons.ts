export const PERSONS = [
    { id: 'shubham', label: 'Shubham', image: '/shubham.jpg' },
    { id: 'khushi', label: 'Khushi', image: '/khushi.jpg' }
] as const;

export type PersonId = typeof PERSONS[number]['id'];
