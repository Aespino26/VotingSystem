import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getRoot() {
    return 'Hello World!';
  }

  @Get('hello')
  getHello() {
    return { message: this.appService.getHello() };
  }
}
