// Global game state — single source of truth
const GameState = {
  principle: -1,            // 0=Transparencia 1=Integridad 2=Prudencia
  gymCompleted: [false, false, false],
  playerHP: 3,
  specialUsed: false,       // resets per gym

  // computed
  get allGymsComplete() {
    return this.gymCompleted.every(Boolean);
  },

  get score() {
    // 15 questions total, each correct = 1 HP off enemy (max 5 per gym)
    // We track correct answers per gym
    return Math.round((this.correctAnswers / 15) * 100);
  },

  correctAnswers: 0,        // cumulative across all gyms

  resetForBattle() {
    this.playerHP = 3;
    this.specialUsed = false;
  },

  save() {
    SCORMManager.saveProgress({
      principle: this.principle,
      gymCompleted: this.gymCompleted,
      correctAnswers: this.correctAnswers
    });
  },

  load() {
    const saved = SCORMManager.loadProgress();
    if (!saved) return false;
    this.principle = saved.principle ?? -1;
    this.gymCompleted = saved.gymCompleted ?? [false, false, false];
    this.correctAnswers = saved.correctAnswers ?? 0;
    return true;
  }
};
