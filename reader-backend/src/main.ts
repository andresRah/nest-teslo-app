import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';

async function main() {
  const app = await NestFactory.create(AppModule);
  app.enableVersioning({
    type: VersioningType.URI,
  });  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // deletes attributes that are not being expected
    forbidNonWhitelisted: true, // throws an error if an unexpected attribute is received
  }));
  await app.listen(process.env.PORT ?? 5000);
}
main();
