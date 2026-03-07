const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const CONSULTANT_FILE = path.join(process.cwd(), 'liaison-consultant.md');
let consensusStatus = {
    ready: false,
    want: null,
    timestamp: null
};

// Simple file watcher mechanism
// In a real production app, chokidar would be robust, but fs.watch is sufficient here.
// We debounce slightly to avoid double-firing on some OSs.
let fsWait = false;

const checkFileContent = () => {
    if (!fs.existsSync(CONSULTANT_FILE)) return;

    fs.readFile(CONSULTANT_FILE, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading consultant file:', err);
            return;
        }

        // Search for "Want" extraction
        // Pattern: ## Want: ... or - Want: ...
        const wantMatch = data.match(/(?:##|-) Want:?\s*(.+)/i);

        if (wantMatch) {
            const extractedWant = wantMatch[1].trim();
            if (consensusStatus.want !== extractedWant) {
                console.log(`[Consensus] Detected Want: ${extractedWant}`);
                consensusStatus = {
                    ready: true,
                    want: extractedWant,
                    timestamp: Date.now()
                };
            }
        }
    });
};

// Initial check
checkFileContent();

// Watch for changes
try {
    if (!fs.existsSync(CONSULTANT_FILE)) {
        // If file doesn't exist, create it empty so we can watch it
        fs.writeFileSync(CONSULTANT_FILE, '# Liaison Consultant Analysis\n\nWaiting for input...', 'utf8');
    }

    fs.watch(CONSULTANT_FILE, (eventType, filename) => {
        if (filename && eventType === 'change') {
            if (fsWait) return;
            fsWait = setTimeout(() => {
                fsWait = false;
            }, 100);

            console.log(`[Consensus] File changed: ${filename}`);
            checkFileContent();
        }
    });
} catch (e) {
    console.error('[Consensus] Failed to setup file watcher:', e);
}

router.get('/status', (req, res) => {
    res.json(consensusStatus);
});

router.post('/reset', (req, res) => {
    consensusStatus = {
        ready: false,
        want: null,
        timestamp: null
    };
    res.json({ message: 'Consensus status reset' });
});

module.exports = router;
