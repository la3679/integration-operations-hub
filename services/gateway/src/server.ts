import { app } from './app.ts';
import { config } from './config.ts';

app.listen(config.port, () => {
  console.info(JSON.stringify({ level: 'info', message: 'Gateway started', port: config.port }));
});
