const fs = require('fs');
const path = require('path');

const pbPath = 'C:\\Users\\srcem\\.gemini\\antigravity\\conversations\\51015aab-8587-4d59-830b-e88529c3bb99.pb';

try {
    const buffer = fs.readFileSync(pbPath);
    const content = buffer.toString('utf8');

    // Look for "Gabrielle"
    const index = content.indexOf('Gabrielle');
    if (index !== -1) {
        console.log("✅ Encontrado 'Gabrielle' en el índice:", index);
        console.log("Contexto:", content.substring(index - 500, index + 2000));
    } else {
        console.log("❌ No se encontró 'Gabrielle'.");
    }

    // Look for email
    const emailIndex = content.indexOf('anagabriellelr03');
    if (emailIndex !== -1) {
        console.log("✅ Encontrado email en el índice:", emailIndex);
        console.log("Contexto:", content.substring(emailIndex - 500, emailIndex + 2000));
    }

} catch (e) {
    console.error(e);
}
