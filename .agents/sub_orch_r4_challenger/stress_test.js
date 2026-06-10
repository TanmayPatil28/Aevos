const http = require('http');

const endpoints = [
    "/api/terminal/ai",
    "/api/parse",
    "/api/parse/resume",
    "/api/narrative",
    "/api/jarvis",
    "/api/chat",
    "/api/career/skill-gap",
    "/api/career/progress",
    "/api/career/prep-rounds",
    "/api/career/insights",
    "/api/career/goals"
];

const results = [];
let pending = endpoints.length;

endpoints.forEach(endpoint => {
    const options = {
        hostname: 'localhost',
        port: 3001,
        path: endpoint,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    const req = http.request(options, (res) => {
        if (res.statusCode === 401) {
            results.push(`${endpoint}: Pass - 401 Unauthorized`);
        } else {
            results.push(`${endpoint}: Failed - returned ${res.statusCode}`);
        }
        done();
    });

    req.on('error', (e) => {
        results.push(`${endpoint}: Error - ${e.message}`);
        done();
    });

    req.write(JSON.stringify({prompt: "hello", context: {}}));
    req.end();
});

function done() {
    pending--;
    if (pending === 0) {
        console.log("Security Test Results:");
        console.log(results.join('\n'));
    }
}
