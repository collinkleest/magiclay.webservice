import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app.module'
require('dotenv').config()

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true })
  const config = new DocumentBuilder()
    .setTitle('Magic Lay API')
    .setDescription('The Magic Lay REST API Specification')
    .setVersion('0.0.1')
    .addTag('parlays')
    .addTag('sportsbetting')
    .addTag('betting')
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)
  app.useGlobalPipes(new ValidationPipe())
  await app.listen(3000)
}
bootstrap()
