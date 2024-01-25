// epiphron-web
// Devon McKee, 2024

const delay = ms => new Promise(res => setTimeout(res, ms));

console.log(`Detected ${navigator.hardwareConcurrency} logical cores...`);
let cpuWorkers = [];
for (let i = 0; i < navigator.hardwareConcurrency; i++) {
    let w = new Worker('cpuWorker.js');
    cpuWorkers.push(w);
}

async function cpuAtomicTest(contention=1, padding=1) {
    console.log(`Testing CPU atomics with contention ${contention} and padding ${padding}...`);
    
    // Setup SharedArrayBuffer for atomics
    let bufLen = Uint8Array.BYTES_PER_ELEMENT * Math.ceil(navigator.hardwareConcurrency * padding / contention);
    const buffer = new SharedArrayBuffer(bufLen);
    const bufArray = new Uint8Array(buffer);
    for (let i = 0; i < bufArray.length; i++) bufArray[i] = 0;

    console.log(bufArray);

    // Start timer and workers
    finished_workers = 0;
    let start_time = performance.now();
    for (let i = 0; i < navigator.hardwareConcurrency; i++) {
        cpuWorkers[i].postMessage({msg : 'start', buffer : buffer, i : Math.floor(i / contention * padding)});
    }
    
    await delay(4000);

    // End workers
    cpuWorkers.forEach((w) => w.postMessage({msg : 'stop'}));
    let end_time = performance.now();
    let test_time = end_time - start_time;
    console.log(`Workers terminated after ${test_time} ms.`);

    let res = 0;
    for (let i = 0; i < bufArray.length; i++) res += Atomics.load(bufArray, i);
    console.log(`Performed ${res} operations.`);
    console.log(`Throughput: ${res / test_time} atomic ops/ms`);
    return res / test_time;
}

async function cpuAtomicSweep() {
    await cpuAtomicTest(1, 1);
    await cpuAtomicTest(1, 2);
    await cpuAtomicTest(2, 1);
    await cpuAtomicTest(2, 2);
}

async function gpuAtomicTest(contention=1, padding=1) {

}



cpuAtomicSweep();
// cpuAtomicTest(4, 1);