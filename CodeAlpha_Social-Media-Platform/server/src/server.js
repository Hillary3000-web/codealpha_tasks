require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`\n🚀 Social Media API running on http://localhost:${PORT}`);
  console.log(`📡 Environment: development\n`);
});
