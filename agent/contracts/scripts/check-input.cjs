const fs = require('node:fs');
const path = require('node:path');
const Ajv = require('ajv');
const schema = JSON.parse(fs.readFileSync(path.join(__dirname, '../coach-input.schema.json'), 'utf8'));
const validate = new Ajv({allErrors: true, strict: false}).compile(schema);
if (process.argv.length < 3) { console.error('Usage: node scripts/check-input.cjs <input.json> [...]'); process.exit(2); }
for (const file of process.argv.slice(2)) {
  try {
    const ok = validate(JSON.parse(fs.readFileSync(file, 'utf8')));
    console.log(JSON.stringify({file, structure_valid: ok, errors: ok ? [] : validate.errors}));
    if (!ok) process.exitCode = 1;
  } catch (error) { console.error(JSON.stringify({file, error: error.message})); process.exitCode = 1; }
}
