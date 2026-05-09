import dotenv from 'dotenv';
dotenv.config();

async function testImports() {
    console.log('Testing User...');
    try { await import('./models/User.js'); console.log('User OK'); } catch (e) { console.error('User FAIL:', e); }

    console.log('Testing PetReport...');
    try { await import('./models/PetReport.js'); console.log('PetReport OK'); } catch (e) { console.error('PetReport FAIL:', e); }

    console.log('Testing Notification...');
    try { await import('./models/Notification.js'); console.log('Notification OK'); } catch (e) { console.error('Notification FAIL:', e); }

    console.log('Testing chats route...');
    try { await import('./routes/chats.js'); console.log('Chats route OK'); } catch (e) { console.error('Chats route FAIL:', e); }
}

testImports();
