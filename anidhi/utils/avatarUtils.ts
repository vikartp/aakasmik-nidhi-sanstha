/**
 * Generate avatar URL using ui-avatars.com service
 * @param name - User's name
 * @param size - Avatar size (default: 128)
 * @param background - Background color hex without # (default: random)
 * @param color - Text color hex without # (default: fff)
 * @returns Avatar URL
 */
export function getAvatarLink(
  name: string, 
  size: number = 128, 
  background?: string, 
  color: string = 'fff'
): string {
  const encodedName = encodeURIComponent(name.trim() || 'User');
  let url = `https://ui-avatars.com/api/?name=${encodedName}&size=${size}&color=${color}&bold=true&rounded=true`;
  
  if (background) {
    url += `&background=${background}`;
  }
  
  return url;
}

/**
 * Get user initials from name
 * @param name - User's name
 * @returns User initials (max 2 characters)
 */
export function getUserInitials(name: string): string {
  if (!name || name.trim() === '') return 'U';
  
  const words = name.trim().split(' ').filter(word => word.length > 0);
  
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

/**
 * Generate a consistent color based on user name
 * @param name - User's name
 * @returns Hex color code without #
 */
export function getNameBasedColor(name: string): string {
  if (!name) return '007AFF';
  
  const colors = [
    '007AFF', // Blue
    'FF3B30', // Red
    'FF9500', // Orange
    'FFCC00', // Yellow
    '34C759', // Green
    '5856D6', // Purple
    'AF52DE', // Pink
    'FF2D92', // Magenta
    '5AC8FA', // Light Blue
    '32D74B', // Light Green
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
}
