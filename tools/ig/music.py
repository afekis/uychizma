# UyChizma uchun o'zimiz yaratadigan fon musiqasi (mualliflik muammosiz): python3 music.py out.wav <davomiylik_s> <uslub> [seed]
# Uslublar: klassik (iliq akustik pluck), chizma (lo-fi elektron), quiz (quvnoq pop), tur (yumshoq piano), fakt (kuchli beat), yer (ambient)
import sys, wave, numpy as np
out, dur, style = sys.argv[1], float(sys.argv[2]), sys.argv[3]
seed = int(sys.argv[4]) if len(sys.argv) > 4 else 0
SR = 44100
rng = np.random.default_rng(seed)
P = {
  'klassik': dict(bpm=96, root=57, prog=[0, 7, 9, 5], wave='pluck', drums='soft'),
  'chizma':  dict(bpm=84, root=50, prog=[0, 3, 8, 10], wave='square', drums='lofi', minor=True),
  'quiz':    dict(bpm=122, root=60, prog=[0, 5, 9, 7], wave='saw', drums='pop'),
  'tur':     dict(bpm=78, root=55, prog=[0, 9, 5, 7], wave='piano', drums='none'),
  'fakt':    dict(bpm=128, root=52, prog=[0, 0, 3, 10], wave='saw', drums='hard', minor=True),
  'yer':     dict(bpm=90, root=53, prog=[0, 5, 7, 5], wave='pad', drums='soft'),
  'hikoya':  dict(bpm=72, root=50, prog=[0, 8, 3, 10], wave='pad', drums='soft', minor=True),
  'yangilik': dict(bpm=110, root=58, prog=[0, 7, 9, 5], wave='pluck', drums='pop'),
}[style]
keys = [0, 2, -3, 5, -2, 3]
root = P['root'] + keys[seed % len(keys)]
bpm = P['bpm'] + int(rng.integers(-6, 7))
beat = 60 / bpm
N = int(dur * SR)
mix = np.zeros(N)
t_all = np.arange(N) / SR
f = lambda m: 440 * 2 ** ((m - 69) / 12)

def tone(freq, length, kind, vel=1.0):
    n = int(length * SR); t = np.arange(n) / SR
    if kind == 'pluck':
        s = np.sin(2*np.pi*freq*t) + .4*np.sin(4*np.pi*freq*t) + .15*np.sin(6*np.pi*freq*t); env = np.exp(-t*5)
    elif kind == 'piano':
        s = np.sin(2*np.pi*freq*t) + .5*np.sin(4*np.pi*freq*t)*np.exp(-t*3) + .2*np.sin(6*np.pi*freq*t)*np.exp(-t*5); env = np.exp(-t*2.2)
    elif kind == 'square':
        s = np.sign(np.sin(2*np.pi*freq*t))*.35 + np.sin(2*np.pi*freq*t)*.6; env = np.exp(-t*4)
    elif kind == 'saw':
        s = 2*((freq*t) % 1) - 1; s = np.convolve(s, np.ones(6)/6, 'same'); env = np.exp(-t*6)
    else:  # pad
        s = sum(np.sin(2*np.pi*freq*(1+d)*t) for d in (-.004, 0, .004)) / 3; env = np.minimum(1, t/0.5) * np.exp(-t*.4)
    a = np.minimum(1, t/0.005)
    return s * env * a * vel

def add(sig, at):
    i = int(at * SR)
    if i >= N: return
    j = min(N, i + len(sig)); mix[i:j] += sig[:j-i]

minor = P.get('minor', False)
triad = [0, 3, 7] if minor else [0, 4, 7]
bar = 4 * beat
nb = int(dur / bar) + 2
for b in range(nb):
    ch = root + P['prog'][b % 4]
    t0 = b * bar
    # bas
    add(tone(f(ch - 12), bar*.95, 'pad' if P['wave'] == 'pad' else 'piano', .55), t0)
    # akkord / arpedjio
    if P['wave'] in ('pad',):
        for iv in triad: add(tone(f(ch + iv), bar*1.1, 'pad', .25), t0)
    else:
        pat = [0, 1, 2, 1, 0, 2, 1, 2] if P['wave'] != 'piano' else [0, 2, 1, 2]
        step = bar / len(pat)
        for k, p in enumerate(pat):
            oct_ = 12 if (k == 4 and rng.random() < .5) else 0
            add(tone(f(ch + triad[p] + oct_), step*1.8, P['wave'], .28), t0 + k*step)
    # ohang (melodiya) — har 2-taktda
    if b % 2 == 1 and P['wave'] != 'pad':
        scale = [0, 2, 3, 5, 7, 8, 10] if minor else [0, 2, 4, 5, 7, 9, 11]
        for k in range(4):
            m = root + 12 + scale[int(rng.integers(0, 7))]
            add(tone(f(m), beat*.9, 'pluck' if P['wave'] != 'square' else 'square', .18), t0 + k*beat)

def kick():
    n = int(.25*SR); t = np.arange(n)/SR; return np.sin(2*np.pi*(50+90*np.exp(-t*30))*t)*np.exp(-t*12)
def snare():
    n = int(.18*SR); t = np.arange(n)/SR; return rng.standard_normal(n)*np.exp(-t*22)*.5 + np.sin(2*np.pi*190*t)*np.exp(-t*25)*.3
def hat():
    n = int(.05*SR); t = np.arange(n)/SR; s = rng.standard_normal(n); s = s - np.convolve(s, np.ones(4)/4, 'same'); return s*np.exp(-t*70)*.25
d = P['drums']
if d != 'none':
    vol = {'soft': .5, 'lofi': .6, 'pop': .75, 'hard': .95}[d]
    nbeats = int(dur / beat) + 1
    for k in range(nbeats):
        t0 = k * beat
        if k % 2 == 0 or d == 'hard': add(kick()*vol, t0)
        if k % 2 == 1 and d != 'soft': add(snare()*vol, t0)
        add(hat()*vol*.8, t0 + beat/2)
        if d in ('pop', 'hard'): add(hat()*vol*.5, t0)
# yakun: fade in/out, normallashtirish
fade = np.minimum(1, t_all/0.4) * np.minimum(1, (dur - t_all)/1.2).clip(0, 1)
mix *= fade
mix = np.tanh(mix / (np.abs(mix).max() + 1e-9) * 1.6) * 0.8
st = np.stack([mix, np.roll(mix, int(.012*SR))*.96], 1)
w = wave.open(out, 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((st * 32767).astype('<i2').tobytes()); w.close()
print('ok', out, style, bpm, 'bpm')
