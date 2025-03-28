import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { JwtService } from '@nestjs/jwt';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  
  const jwtService = app.get(JwtService);
  
  const jwtMiddleware = (req, res, next) => {
    try {
      if (req.path.startsWith('/videos/')) {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
          return res.status(401).json({ message: 'Unauthorized' });
        }
        
        const token = authHeader.split(' ')[1];
        const payload = jwtService.verify(token);
        req.user = payload;
      }
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  };
  
  // Create a router for /uploads
  const uploadsRouter = express.Router();
  
  // Apply JWT middleware to the router
  uploadsRouter.use(jwtMiddleware);
  
  // Serve static files after JWT verification
  uploadsRouter.use(express.static(join(__dirname, '..', 'uploads')));
  
  // Mount the router
  app.use('/uploads', uploadsRouter);
  
  const port = process.env.PORT || 3050;
  await app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${port}`);
  });
}
bootstrap();