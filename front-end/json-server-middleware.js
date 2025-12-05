const fs = require('fs');
const path = require('path');

module.exports = (req, res, next) => {
  if (req.method === 'POST' && req.path === '/joojs') {
    const db = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/db.json'), 'utf-8'));
    const maxId = Math.max(...db.joojs.map(j => parseInt(j.id) || 0), 0);
    req.body.id = (maxId + 1).toString();
  }
  next();
};