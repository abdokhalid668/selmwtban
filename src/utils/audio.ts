// Web Audio API procedural sound generation for a futuristic cyberpunk vibe.
// Since browsers block autoplay, AudioContext is initialized lazily upon first interaction.

class CyberSoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private initCtx() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  public getMutedState() {
    return this.isMuted;
  }

  // Plays a tight futuristic tick
  public playClick() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  // Plays a dice rolling sequence (rapid sci-fi ticks)
  public playDiceRoll() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const duration = 0.6; // total roll animation sound time
    const numTicks = 8;

    for (let i = 0; i < numTicks; i++) {
      const delay = (i / numTicks) * duration;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.type = 'triangle';
      // Alternate frequencies to make a rotating sound
      const freq = 400 + (i % 3) * 150 + Math.random() * 50;
      osc.frequency.setValueAtTime(freq, now + delay);
      osc.frequency.exponentialRampToValueAtTime(freq / 2, now + delay + 0.04);

      gain.gain.setValueAtTime(0.04, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.04);

      osc.start(now + delay);
      osc.stop(now + delay + 0.04);
    }
  }

  // Plays an ascending cyberpunk chime for climbing ladders
  public playLadderUp() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]; // C major pentatonic climb
    const step = 0.08;

    notes.forEach((freq, index) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * step);
      osc.frequency.setValueAtTime(freq * 1.5, now + index * step + 0.03); // metallic ring mod feel

      gain.gain.setValueAtTime(0.0, now + index * step);
      gain.gain.linearRampToValueAtTime(0.06, now + index * step + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * step + 0.15);

      osc.start(now + index * step);
      osc.stop(now + index * step + 0.2);
    });
  }

  // Plays a glitchy warning tone for sliding down snakes
  public playSnakeDown() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const duration = 0.5;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    // Glitchy detuned saw wave combination
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(180, now);
    osc1.frequency.linearRampToValueAtTime(60, now + duration);

    osc2.type = 'square';
    osc2.frequency.setValueAtTime(184, now); // slightly detuned for chorus
    osc2.frequency.linearRampToValueAtTime(62, now + duration);

    // Apply an LFO amplitude modulation to make it buzz
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.type = 'sawtooth';
    lfo.frequency.setValueAtTime(25, now); // 25Hz vibration
    lfo.connect(lfoGain);
    lfoGain.connect(gainNode.gain);

    gainNode.gain.setValueAtTime(0.0, now);
    gainNode.gain.linearRampToValueAtTime(0.08, now + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc1.start(now);
    osc2.start(now);
    lfo.start(now);

    osc1.stop(now + duration);
    osc2.stop(now + duration);
    lfo.stop(now + duration);
  }

  // Cyber sound for drawing special action cards
  public playCardReveal() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    
    // Low rumble followed by an ethereal high bell
    const oscLow = this.ctx.createOscillator();
    const gainLow = this.ctx.createGain();
    oscLow.type = 'triangle';
    oscLow.frequency.setValueAtTime(110, now);
    oscLow.frequency.exponentialRampToValueAtTime(165, now + 0.3);
    oscLow.connect(gainLow);
    gainLow.connect(this.ctx.destination);
    gainLow.gain.setValueAtTime(0.08, now);
    gainLow.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    oscLow.start(now);
    oscLow.stop(now + 0.4);

    // Ethereal sweep
    const oscHigh = this.ctx.createOscillator();
    const gainHigh = this.ctx.createGain();
    oscHigh.type = 'sine';
    oscHigh.frequency.setValueAtTime(440, now + 0.1);
    oscHigh.frequency.exponentialRampToValueAtTime(1760, now + 0.5);
    oscHigh.connect(gainHigh);
    gainHigh.connect(this.ctx.destination);
    gainHigh.gain.setValueAtTime(0.0, now + 0.1);
    gainHigh.gain.linearRampToValueAtTime(0.08, now + 0.2);
    gainHigh.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    oscHigh.start(now + 0.1);
    oscHigh.stop(now + 0.6);
  }

  // Plays a celebratory neon synthwave win tune
  public playWinMusic() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Retro synth arpeggio (C Major chord progression up and down)
    const notes = [
      { f: 261.63, t: 0.0 }, // C4
      { f: 329.63, t: 0.15 }, // E4
      { f: 392.00, t: 0.3 }, // G4
      { f: 523.25, t: 0.45 }, // C5
      { f: 392.00, t: 0.6 }, // G4
      { f: 523.25, t: 0.75 }, // C5
      { f: 659.25, t: 0.9 }, // E5
      { f: 783.99, t: 1.05 }, // G5
      { f: 1046.50, t: 1.2 }, // C6 (long)
    ];

    notes.forEach((note, index) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.type = index === notes.length - 1 ? 'sine' : 'sawtooth';
      osc.frequency.setValueAtTime(note.f, now + note.t);

      // Add a second detuned oscillator for synth chorus effect on the final triumphant note
      if (index === notes.length - 1) {
        const oscSub = this.ctx!.createOscillator();
        const gainSub = this.ctx!.createGain();
        oscSub.type = 'sawtooth';
        oscSub.frequency.setValueAtTime(note.f + 4, now + note.t);
        oscSub.connect(gainSub);
        gainSub.connect(this.ctx!.destination);
        gainSub.gain.setValueAtTime(0.0, now + note.t);
        gainSub.gain.linearRampToValueAtTime(0.06, now + note.t + 0.1);
        gainSub.gain.exponentialRampToValueAtTime(0.001, now + note.t + 1.2);
        oscSub.start(now + note.t);
        oscSub.stop(now + note.t + 1.2);
      }

      const dur = index === notes.length - 1 ? 1.0 : 0.12;
      gain.gain.setValueAtTime(0.0, now + note.t);
      gain.gain.linearRampToValueAtTime(0.05, now + note.t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.t + dur);

      osc.start(now + note.t);
      osc.stop(now + note.t + dur);
    });
  }
}

export const soundEngine = new CyberSoundEngine();
