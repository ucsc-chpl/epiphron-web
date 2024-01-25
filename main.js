// epiphron-web
// Devon McKee, 2024

const delay = ms => new Promise(res => setTimeout(res, ms));

console.log(`Detected ${navigator.hardwareConcurrency} logical cores...`);
let cpuWorkers = [];
let finished_workers = 0;
for (let i = 0; i < navigator.hardwareConcurrency; i++) {
    let w = new Worker('cpuWorker.js');
    w.onmessage = (e) => { finished_workers++; }
    cpuWorkers.push(w);
}

async function cpuAtomicTest(contention=1, padding=1) {
    console.log(`Testing CPU atomics with contention ${contention} and padding ${padding}...`);
    
    // Setup SharedArrayBuffer for atomics
    let bufLen = Uint8Array.BYTES_PER_ELEMENT * navigator.hardwareConcurrency * padding / contention;
    const buffer = new SharedArrayBuffer(bufLen);
    const bufArray = new Uint8Array(buffer);
    for (let i = 0; i < bufArray.length; i++) bufArray[i] = 0;

    console.log(bufArray);

    // Start timer and workers
    finished_workers = 0;
    let start_time = performance.now();
    for (let i = 0; i < navigator.hardwareConcurrency; i++) {
        cpuWorkers[i].postMessage({msg : 'start', buffer : buffer, i : i});
    }
    
    await delay(5000);

    // End workers
    cpuWorkers.forEach((w) => w.postMessage({msg : 'stop'}));
    let end_time = performance.now();
    console.log(`Workers terminated after ${end_time - start_time} ms.`);

    let res = bufArray.reduce((a, b) => a + b);
    console.log(`Performed ${res} operations.`);
}


cpuAtomicTest();