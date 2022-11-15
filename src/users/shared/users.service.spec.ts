import { BadRequestException, HttpCode, HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from './users.entity';
import { UsersService } from './users.service';

const listUsers: Users[] = [
  new Users({ id: 1, name: 'Rodolfo', govId: '97501056056', balance: 5000, password: '4321' }),
  new Users({ id: 2, name: 'Rafael', govId: '80025687026', balance: 5000, password: '1234' })
]

const responseRegister: any = { message: 'Invalid data.' }

const responseDepositUser = listUsers[1]
responseDepositUser.balance = responseDepositUser.balance + 1000

const responseDeposit: any = { status: true, message: 'Successfully deposited.' }

describe('UsersService', () => {
  let usersService: UsersService;
  let usersRepository: Repository<Users>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(Users),
          useValue: {
            find: jest.fn().mockResolvedValue(listUsers),
            save: jest.fn().mockResolvedValue(listUsers[1]),
            registerUser: jest.fn().mockResolvedValue(responseRegister),
            update: jest.fn().mockResolvedValue(responseDepositUser),
            deposit: jest.fn().mockResolvedValue(responseDeposit),
            findOneBy: jest.fn().mockResolvedValue(listUsers[0]),
            findOne: jest.fn().mockResolvedValue(listUsers[1]),
          }
        }
      ],
    }).compile();

    usersService = await module.get<UsersService>(UsersService);
    usersRepository = module.get<Repository<Users>>(
      getRepositoryToken(Users),
    );
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(usersService).toBeDefined();
    expect(usersRepository).toBeDefined();
  });

  describe('registerUser', () => {
    it('should return a registerUser successfully', async () => {
      //arrange
      const body: any = {
        name: 'Rafael',
        govId: '80025687026',
        password: '1234'
      };
      // Act
      const result = await usersRepository.save(body);
      // Assert
      expect(result).toEqual(listUsers[1]);
      expect(usersRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should throw an exception in getAllUsers', () => {
      // Arrange
      const body: any = {
        name: 'Rafael',
        govId: '80025687026',
        password: '1234'
      };
      jest.spyOn(usersRepository, 'save').mockRejectedValueOnce(new Error());
      // Assert
      expect(usersService.registerUser(body)).rejects.toThrowError();
    });
  });

  describe('deposit', () => {
    it('should return a deposit successfully', async () => {
      //arrange
      const body: any = {
        balance: 1000
      };
      const req: any = {
        user: {
          id: 1,
          govId: '97501056056',
        }
      };
      // Act
      const result = await usersRepository.update(req, body);
      // Assert
      expect(result).toEqual(responseDepositUser);
      expect(usersRepository.update).toHaveBeenCalledTimes(1);
    });

    it('should throw an exception in deposit', () => {
      // Arrange
      const body: any = {
        balance: 1000
      };
      const req: any = {
        user: {
          id: 1,
          govId: '97501056056',
        }
      };
      jest.spyOn(usersRepository, 'update').mockRejectedValueOnce(new Error());
      // Assert
      expect(usersService.deposit(req, body)).rejects.toThrowError();
    });
  });

  describe('transfer', () => {
    it('should return a transfer successfully', async () => {
      //arrange
      const data: any = {
        transferToUser: '80025687026',
        balanceTransfer: 1000,
      };
      const req: any = {
        user: { id: 1, balance: 5000, govId: '97501056056' }
      }
      // Act
      const result = await usersRepository.findOneBy(req);
      const resultUserToTransfer = await usersRepository.findOne({ where: { govId: data.transferToUser } });
      // Assert
      expect(result).toEqual(listUsers[0]);
      expect(resultUserToTransfer).toEqual(listUsers[1]);
      expect(usersRepository.findOneBy).toHaveBeenCalledTimes(1);
    });

    it('should throw an exception in transfer', () => {
      // Arrange
      const data: any = {
        transferToUser: '80025687026',
        balanceTransfer: 1000,
      };
      const req: any = {
        user: { id: 1, balance: 5000, govId: '97501056056' }
      }
      jest.spyOn(usersRepository, 'findOneBy').mockRejectedValueOnce(new Error());
      // Assert
      expect(usersService.transfer(req, data)).rejects.toThrowError();
    });
  });
















})