export const BUILDING_MAP = [
  { code: '2W', name: 'Building 2 West', keywords: ['Management'] },
  { code: '2E', name: 'Building 2 East', keywords: ['Diploma', 'BVoc', 'Engineering'] },
  { code: '3W', name: 'Building 3 West', keywords: ['Hotel Management', 'Medical', 'Paramedical', 'Nursing'] },
  { code: '3E', name: 'Building 3 East', keywords: ['Applied Sciences', 'Agriculture', 'Art'] },
  { code: 'Gymnasium', name: 'Gymnasium', keywords: ['Gym', 'Sports'] },
];

export function getAutoBuilding(faculty: string, course: string): string {
  const text = `${faculty} ${course}`.toLowerCase();
  
  if (text.includes('management') && !text.includes('hotel')) return '2W';
  if (text.includes('hotel') || text.includes('medical') || text.includes('paramedical') || text.includes('nursing')) return '3W';
  if (text.includes('diploma') || text.includes('bvoc') || text.includes('engineering') || text.includes('technology')) return '2E';
  
  return '3E'; // Default
}
