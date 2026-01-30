const fs = require('fs');
const db = require('./db');

// Leggi il file JSON
const cocktails = JSON.parse(fs.readFileSync('./cocktails.json', 'utf8'));

console.log(`Importando ${cocktails.length} cocktail...`);

// Aspetta che la tabella sia creata, poi fai gli insert
db.serialize(() => {
  cocktails.forEach((cocktail) => {
    db.run(
      `INSERT OR IGNORE INTO cocktails 
       (slug, nome, autore, luogo, anno, ingredienti, metodo, bicchiere, ghiaccio, garnish, note, image) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        cocktail.slug,
        cocktail.nome,
        cocktail.autore,
        cocktail.luogo,
        cocktail.anno,
        JSON.stringify(cocktail.ingredienti),
        cocktail.metodo,
        cocktail.bicchiere,
        cocktail.ghiaccio,
        cocktail.garnish,
        cocktail.note,
        cocktail.image
      ],
      (err) => {
        if (err) console.error(`Errore su ${cocktail.nome}:`, err.message);
        else console.log(`✓ ${cocktail.nome}`);
      }
    );
  });

  // Chiudi dopo tutti gli insert
  setTimeout(() => {
    db.close();
    console.log('Import completato!');
  }, 2000);
});
