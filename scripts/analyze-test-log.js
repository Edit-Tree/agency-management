#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const logFile = path.join(process.cwd(), 'test-log.txt');

if (!fs.existsSync(logFile)) {
    console.log('❌ No test log found. Run npm run test:start first.');
    process.exit(1);
}

const content = fs.readFileSync(logFile, 'utf-8');
const lines = content.split('\n');

console.log('\n📊 TEST RESULTS SUMMARY\n');
console.log('='.repeat(80));

const errors = lines.filter(line => line.includes('ERROR'));
const successes = lines.filter(line => line.includes('SUCCESS'));

console.log(`✅ Successful requests: ${successes.length}`);
console.log(`❌ Failed requests: ${errors.length}`);

if (errors.length > 0) {
    console.log('\n🔴 ISSUES FOUND:\n');
    errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.trim()}`);
    });
    console.log('\n💡 Fix these issues first before continuing testing.');
} else {
    console.log('\n🎉 All tests passed! No errors detected.');
}

console.log('\n' + '='.repeat(80));
console.log(`📄 Full log available at: ${logFile}\n`);
