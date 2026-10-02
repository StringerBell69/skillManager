import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import helmet from "helmet";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true, // Required for Stripe webhook signature verification
  });

  // Security
  app.use(helmet());
  app.enableCors({
    origin: process.env.WEB_URL || "http://localhost:3000",
    credentials: true,
  });

  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger (dev only)
  if (process.env.NODE_ENV !== "production") {
    const config = new DocumentBuilder()
      .setTitle("SkillManager API")
      .setDescription("API for SkillManager - AI Agent Distribution Platform")
      .setVersion("0.1.0")
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("docs", app, document);
  }

  // Railway injects PORT; keep API_PORT for local/dev overrides.
  const port = parseInt(process.env.PORT || process.env.API_PORT || "3001", 10);
  await app.listen(port, "0.0.0.0");

  console.log(`🚀 SkillManager API running on http://localhost:${port}`);
  if (process.env.NODE_ENV !== "production") {
    console.log(`📚 Swagger docs at http://localhost:${port}/docs`);
  }
}

bootstrap();
