/**
 * Lightweight game sound effects using the Web Audio API.
 * No external dependencies or API keys required.
 */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

/** Short percussive "tap" for placing a piece */
export function playMoveSound(isX: boolean) {
  const c = getCtx();
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.connect(gain);
  gain.connect(c.destination);

  osc.type = 'sine';
  osc.frequency.setValueAtTime(isX ? 660 : 440, c.currentTime);
  osc.frequency.exponentialRampToValueAtTime(isX ? 880 : 330, c.currentTime + 0.08);

  gain.gain.setValueAtTime(0.18, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.12);

  osc.start(c.currentTime);
  osc.stop(c.currentTime + 0.12);
}

/** Cheerful ascending arpeggio for a win */
export function playWinSound() {
  const c = getCtx();
  const notes = [523, 659, 784, 1047]; // C5 E5 G5 C6

  notes.forEach((freq, i) => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);

    osc.type = 'triangle';
    const t = c.currentTime + i * 0.12;
    osc.frequency.setValueAtTime(freq, t);

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.2, t + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

    osc.start(t);
    osc.stop(t + 0.3);
  });
}

/** Descending tones for AI winning */
export function playLoseSound() {
  const c = getCtx();
  const notes = [440, 370, 311, 261]; // A4 F#4 Eb4 C4

  notes.forEach((freq, i) => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);

    osc.type = 'sawtooth';
    const t = c.currentTime + i * 0.15;
    osc.frequency.setValueAtTime(freq, t);

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.1, t + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.start(t);
    osc.stop(t + 0.35);
  });
}

/** Neutral two-tone chord for a draw */
export function playDrawSound() {
  const c = getCtx();
  [392, 440].forEach((freq) => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, c.currentTime);

    gain.gain.setValueAtTime(0.15, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.5);

    osc.start(c.currentTime);
    osc.stop(c.currentTime + 0.5);
  });
}
