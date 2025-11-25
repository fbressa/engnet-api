import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class BodyLoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
      console.log('=== BODY LOGGER MIDDLEWARE ===');
      console.log('URL:', req.url);
      console.log('Content-Type:', req.headers['content-type']);
      console.log('Body:', req.body);
      console.log('Body type:', typeof req.body);
      console.log('Body keys:', Object.keys(req.body || {}));
      console.log('==============================');
    }
    next();
  }
}
