import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: ['https://9929-41-140-60-37.ngrok-free.app'], 
    methods: ['GET', 'POST', 'PUT', 'DELETE'], 
    credentials: true, 
  });


  app.enableCors({
    origin: 'http://localhost:8080', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe())

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
