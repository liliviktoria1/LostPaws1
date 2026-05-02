import dotenv from 'dotenv';
dotenv.config();

async function testImports() {
    console.log('Testing User...');
    try { await import('./models/User.js'); console.log('User OK'); } catch (e) { console.error('User FAIL:', e); }

    console.log('Testing PetReport...');
    try { await import('./models/PetReport.js'); console.log('PetReport OK'); } catch (e) { console.error('PetReport FAIL:', e); }

    console.log('Testing reports route...');
    try { await import('./routes/reports.js'); console.log('Reports route OK'); } catch (e) { console.error('Reports route FAIL:', e); }
}

testImports();
