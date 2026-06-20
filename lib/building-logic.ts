export const BUILDING_MAP = [
  { code: '1E', name: 'Building 1 East', keywords: ['library', 'admin', 'administration'] },
  { code: '2W', name: 'Building 2 West', keywords: ['Management'] },
  { code: '2E', name: 'Building 2 East', keywords: ['Diploma', 'BVoc', 'Engineering'] },
  { code: '3W', name: 'Building 3 West', keywords: ['Hotel Management', 'Medical', 'Paramedical', 'Nursing'] },
  { code: '3E', name: 'Building 3 East', keywords: ['Applied Sciences', 'Agriculture', 'Art'] },
  { code: 'Library', name: 'Central Library', keywords: ['library'] },
  { code: 'Auditorium', name: 'Auditorium', keywords: ['auditorium', 'event'] },
  { code: 'Workshop', name: 'Workshop Block', keywords: ['workshop', 'mechanical', 'lab'] },
  { code: 'Gymnasium', name: 'Gymnasium', keywords: ['Gym', 'Sports'] },
  { code: 'Admin', name: 'Administrative Block', keywords: ['admin', 'office', 'principal'] },
];

export function getAutoBuilding(faculty: string, course: string): string {
  const text = `${faculty} ${course}`.toLowerCase();
  
  if (text.includes('hotel') || text.includes('medical') || text.includes('paramedical') || text.includes('nursing')) return '3W';
  if (text.includes('management') && !text.includes('hotel')) return '2W';
  if (text.includes('diploma') || text.includes('bvoc') || text.includes('engineering') || text.includes('technology')) return '2E';
  if (text.includes('workshop') || text.includes('mechanical')) return 'Workshop';
  if (text.includes('library')) return 'Library';
  if (text.includes('gym') || text.includes('sports')) return 'Gymnasium';
  
  return '3E'; // Default
}
