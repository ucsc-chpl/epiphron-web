console.log('Initialized worker.');

let working = false;

self.addEventListener('message', (ev) => {
    switch(ev.data.msg) {
        case 'start':
            let i = ev.data.i;
            let buffer = ev.data.buffer;
            let bufArray = new Uint8Array(buffer);
            working = true;
            console.log(`Started worker on element ${i}`);
            while (working) { Atomics.add(bufArray, i, 1); }
            console.log(`Terminating worker on element ${i}...`);
            break;
        case 'stop':
            working = false;
            break;
    }
});