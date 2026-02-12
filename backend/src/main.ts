import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  app.enableCors();
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  
  // Serve static frontend files
  app.useStaticAssets(join(__dirname, '..', '..', 'frontend', 'dist'));
  app.setBaseViewsDir(join(__dirname, '..', '..', 'frontend', 'dist'));
  
  // Fallback to index.html for SPA routing
  app.use((req, res, next) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(join(__dirname, '..', '..', 'frontend', 'dist', 'index.html'));
    } else {
      next();
    }
  });
  
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: http://0.0.0.0:${port}`);
}
bootstrap();
