/**
 * 5-Tier Color Coding for Risk Scores:
 * 0 - 20: Green (#059669)
 * 20 - 40: Greenish Yellow (#84CC16)
 * 40 - 60: Orange (#F97316)
 * 60 - 80: Light Red (#EF4444)
 * 80 - 100: Dark Red (#991B1B)
 */
export const getScoreColor = (score: number | null | undefined): string => {
  if (score === null || score === undefined) return '#64748B';
  if (score >= 80) return '#991B1B'; // Dark Red (80 - 100)
  if (score >= 60) return '#EF4444'; // Light Red (60 - 79.99)
  if (score >= 40) return '#F97316'; // Orange (40 - 59.99)
  if (score >= 20) return '#84CC16'; // Greenish Yellow (20 - 39.99)
  return '#059669';                  // Green (0 - 19.99)
};

export const getScoreBgColor = (score: number | null | undefined): string => {
  if (score === null || score === undefined) return 'rgba(100, 116, 139, 0.12)';
  if (score >= 80) return 'rgba(153, 27, 27, 0.15)'; // Dark Red BG
  if (score >= 60) return 'rgba(239, 68, 68, 0.15)'; // Light Red BG
  if (score >= 40) return 'rgba(249, 115, 22, 0.15)'; // Orange BG
  if (score >= 20) return 'rgba(132, 204, 22, 0.15)'; // Greenish Yellow BG
  return 'rgba(5, 150, 105, 0.15)';                  // Green BG
};

export const SCORE_TIERS = [
  { range: '0–20', label: 'Low', color: '#059669', bg: 'rgba(5, 150, 105, 0.15)' },
  { range: '20–40', label: 'Greenish-Yellow', color: '#84CC16', bg: 'rgba(132, 204, 22, 0.15)' },
  { range: '40–60', label: 'Orange', color: '#F97316', bg: 'rgba(249, 115, 22, 0.15)' },
  { range: '60–80', label: 'Light Red', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)' },
  { range: '80–100', label: 'Dark Red', color: '#991B1B', bg: 'rgba(153, 27, 27, 0.15)' }
];

