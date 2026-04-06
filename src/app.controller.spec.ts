import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  describe('getRoot', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getRoot()).toBe('Hello World!');
    });
  });

  describe('getHello', () => {
    it('should return a message object from the service', () => {
      const result = appController.getHello();
      expect(result).toEqual({ message: 'Welcome to E-Voting System' });
    });
  });
});
