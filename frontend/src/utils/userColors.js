/**
 * Utilities for user avatars and colors.
 */

const AVATAR_COLORS = [
  'bg-[#0052CC]', // Blue
  'bg-[#6554C0]', // Purple
  'bg-[#00B8D9]', // Cyan
  'bg-[#36B37E]', // Green
  'bg-[#FF5630]', // Red
  'bg-[#FFAB00]', // Yellow/Orange
  'bg-[#0065FF]', // Light Blue
  'bg-[#5243AA]', // Indigo
  'bg-[#00875A]', // Dark Green
  'bg-[#DE350B]', // Dark Red
];

/**
 * Hash a string to a numeric value.
 */
const hashString = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
};

/**
 * Generates a deterministic color class based on user ID or email.
 */
export const getUserColor = (userId) => {
  if (!userId) return 'bg-[#42526E]';
  const hash = hashString(userId.toString());
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
};

/**
 * Gets initials from user email or name.
 * If single word, returns first two letters (e.g. Sanket -> SA).
 * If multi word or dots, returns first letter of each (e.g. Sanket.Zeple -> SZ).
 */
export const getUserInitials = (user) => {
  if (!user) return '?';
  const nameInput = user.full_name || user.email || (typeof user === 'string' ? user : '');
  if (!nameInput) return '?';
  
  // Clean email to use as name if full_name is missing
  const name = nameInput.includes('@') ? nameInput.split('@')[0] : nameInput;
  
  // if format is First.Last or contains spaces
  if (name.includes('.') || name.includes(' ')) {
    const pieces = name.split(/[. ]/);
    if (pieces.length >= 2 && pieces[pieces.length - 1][0]) {
      return (pieces[0][0] + pieces[pieces.length - 1][0]).toUpperCase();
    }
  }
  
  // if single word like "Sanket", return "SA"
  if (name.length >= 2) {
    return name.substring(0, 2).toUpperCase();
  }
  
  return name.substring(0, 1).toUpperCase();
};
