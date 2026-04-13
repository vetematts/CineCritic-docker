import app from './index.js';
import { config } from './config/index.js';

app.listen(config.port, () => {
  const baseUrl = `http://localhost:${config.port}`;
  console.log(`API:  ${baseUrl}`);
  console.log(`Docs: ${baseUrl}/docs`);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});
