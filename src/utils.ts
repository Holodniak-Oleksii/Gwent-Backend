export const calculateRating = (
  wins: number,
  losses: number,
  draws: number
): number => {
  const totalGames = wins + losses + draws;
  if (totalGames === 0) return 1000;

  return Math.round(1000 + wins * 30 - losses * 20 + draws * 10);
};

export const getCloudinaryPublicId = (url: string): string | null => {
  const match = url.match(/\/upload\/(?:v\d+\/)?([^\.]+)/);
  return match ? match[1] : null;
};
