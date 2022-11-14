/*import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Any, Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy';












const userLogin: any = { govId: '11122233344', password: '1234'}

describe('AuthService', () => {
  let authService: AuthService;
  let authRepository: Repository<any>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,LocalStrategy, JwtStrategy,
    {
        provide: getRepositoryToken(Any),
        useValue: {
            //findOne: jest.fn().mockResolvedValue(userLogin),
           //validateUser: jest.fn().mockResolvedValue(),
           //sign: jest.fn().mockResolvedValue(),
           //login: jest.fn().mockResolvedValue(),
        }
    }],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    authRepository = module.get<Repository<any>>(
        getRepositoryToken(Any),
    );
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(authService).toBeDefined();
    expect(authRepository).toBeDefined();
  });
});*/




import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy';

describe('AuthService', () => {
  let service: AuthService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService, LocalStrategy, JwtStrategy],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});