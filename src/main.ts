import { Injectable } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function initServer() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT || 3000);
}
initServer();