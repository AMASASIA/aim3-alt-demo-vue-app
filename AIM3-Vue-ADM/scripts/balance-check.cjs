const os = require('os');

function getHealth() {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memUsagePercent = (usedMem / totalMem * 100).toFixed(2);

    const nodeMemUsage = process.memoryUsage();

    console.log('--- AIM3 SYSTEM BALANCE CHECK ---');
    console.log(`OS: ${os.type()} ${os.release()} (${os.arch()})`);
    console.log(`CPUs: ${os.cpus().length} cores`);
    console.log(`uptime: ${(os.uptime() / 3600).toFixed(2)} hours`);
    console.log('');
    console.log('--- MEMORY (System) ---');
    console.log(`Total: ${(totalMem / 1024 / 1024 / 1024).toFixed(2)} GB`);
    console.log(`Used:  ${(usedMem / 1024 / 1024 / 1024).toFixed(2)} GB (${memUsagePercent}%)`);
    console.log(`Free:  ${(freeMem / 1024 / 1024 / 1024).toFixed(2)} GB`);
    console.log('');
    console.log('--- MEMORY (Node.js Process) ---');
    console.log(`RSS:        ${(nodeMemUsage.rss / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Heap Total: ${(nodeMemUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Heap Used:  ${(nodeMemUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`);
    console.log(`External:   ${(nodeMemUsage.external / 1024 / 1024).toFixed(2)} MB`);
    console.log('');

    if (memUsagePercent > 90) {
        console.warn('⚠️ CRITICAL: OS Memory usage is very high. System may freeze.');
    } else if (memUsagePercent > 80) {
        console.warn('⚠️ WARNING: Memory usage is high. Consider closing other apps.');
    } else {
        console.log('✅ Memory levels are stable.');
    }

    const heapLimit = 8192; // We set this in package.json
    const heapUsedPercent = (nodeMemUsage.heapUsed / 1024 / 1024 / heapLimit * 100).toFixed(2);
    console.log(`Heap Headroom: ${heapUsedPercent}% of 8GB limit used.`);

    if (heapUsedPercent > 80) {
        console.warn('⚠️ Node.js is nearing its memory limit. Restarting the dev server may help.');
    }
}

getHealth();
