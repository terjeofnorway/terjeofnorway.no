const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const staticDir = path.join(__dirname, '../../client/dist');

app.use(express.static(staticDir));

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
}); 