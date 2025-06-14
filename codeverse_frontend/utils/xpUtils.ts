export function calculateXP(problemDifficulty: "EASY" | "MEDIUM" | "HARD", isCorrect: boolean): number {
    if (!isCorrect) return 0;
    switch (problemDifficulty) {
      case "EASY":
        return 10;
      case "MEDIUM":
        return 25;
      case "HARD":
        return 50;
      default:
        return 0;
    }
  }
  
  export function levelFromXP(xp: number): number {
    return Math.floor(Math.sqrt(xp / 100));
  }