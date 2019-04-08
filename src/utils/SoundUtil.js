import { Howl } from 'howler';

class SoundUtil {

    constructor() {
        this.lockNumber = 0;
        this.locks = {};
        this.globalLock = this.generateLock({
            queue: []
        });
        this.globalThinkingLock = this.generateLock({
            interval: 5000
        });
    }

    sequentialPlay(name) {
        this.playWithLock(name, this.globalLock);
    }

    play(name, options) {
        options = options || {};
        var sound = new Howl({
            src: ['/sounds/' + name + '.ogg'],
            ext: ['ogg'],
            ...options
        });

        sound.play();
    }

    playThinking() {
        this.playWithLock('VO_HERO_08_Thinking3_69', this.globalThinkingLock);
    }

    generateLock(options) {
        options = options || {};
        const id = ++this.lockNumber;
        this.locks[id] = {
            playing: false,
            queue: false,
            interval: false,
            ...options
        };
        return id;
    }

    playWithLock(name, lockID) {
        const lock = this.locks[lockID];
        if (lock.playing && lock.queue) {
            lock.queue.push(name);
        } else if (lock.playing === false) {
            const finish = () => {
                lock.playing = false;
                if (lock.queue && lock.queue.length !== 0) {
                    lockedPlay(lock.queue.shift());
                }
            }
            const lockedPlay = (filename) => {
                this.play(filename, {
                    onend: () => {
                        if (lock.interval) {
                            setTimeout(() => {
                                finish();
                            }, lock.interval);
                        } else {
                            finish();
                        }
                    }
                });
            }
            lock.playing = true;
            lockedPlay(name);
        }
    }

}

export default new SoundUtil();