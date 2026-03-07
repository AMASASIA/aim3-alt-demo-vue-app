const { spawn } = require('child_process');
const path = require('path');

// Colors for output
const colors = {
    reset: "\x1b[0m",
    frontend: "\x1b[36m", // Cyan
    backend: "\x1b[32m",  // Green
    error: "\x1b[31m"     // Red
};

function log(source, data, isError = false) {
    const color = source === 'Frontend' ? colors.frontend : colors.backend;
    const lines = data.toString().split('\n');
    lines.forEach(line => {
        if (line.trim()) {
            console.log(`${color}[${source}]${colors.reset} ${isError ? colors.error : ''}${line}${colors.reset}`);
        }
    });
}

function startProcess(name, command, args, cwd) {
    const proc = spawn(command, args, {
        cwd,
        shell: true,
        env: { ...process.env, FORCE_COLOR: 'true' }
    });

    proc.stdout.on('data', (data) => log(name, data));
    proc.stderr.on('data', (data) => log(name, data, true));

    proc.on('close', (code) => {
        console.log(`${colors.error}[${name}] process exited with code ${code}${colors.reset}`);
        process.exit(code);
    });

    return proc;
}

console.log(`${colors.backend}Starting Backend (Express)...${colors.reset}`);
const backend = startProcess('Backend', 'npm', ['run', 'server'], path.resolve(__dirname, '..'));

console.log(`${colors.backend}Starting Hyper Core (Python)...${colors.reset}`);
const pythonCore = startProcess('HyperCore', 'python', ['-m', 'uvicorn', 'main:app', '--host', '0.0.0.0', '--port', '8000'], path.resolve(__dirname, '..'));

console.log(`${colors.frontend}Starting Frontend (Vite)...${colors.reset}`);
const frontend = startProcess('Frontend', 'npm', ['run', 'dev'], path.resolve(__dirname, '..'));

// Handle termination
process.on('SIGINT', () => {
    console.log('\nStopping processes...');
    backend.kill();
    pythonCore.kill();
    frontend.kill();
    process.exit();
});
