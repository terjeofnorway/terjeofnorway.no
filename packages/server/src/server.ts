import express from 'express';
import path from 'path';

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);
const staticDir = path.join(__dirname, '../../client/dist');

app.use(express.static(staticDir));

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${port}`);
});
