const fs = require('fs');
const path = require('path');

const pbPath = 'C:\\Users\\srcem\\.gemini\\antigravity\\conversations\\2dc1f16f-7444-40f2-9853-7bf4ac0efa89.pb';

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

} catch (e) {
    console.error(e);
}
