import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/shared/users.service';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let usersService = { getAllUsers: () => ['test'] };

  /*beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });*/

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [UsersModule],
    })
      .overrideProvider(UsersService)
      .useValue(usersService)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
    
  });

  it(`/GET`, () => {
    return request(app.getHttpServer())
      .get('/users/list')
      .expect(200)
      .expect({
        data: usersService.getAllUsers(),
      });
  });

  afterAll(async () => {
    await app.close();
  });

  /*it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });*/
});
