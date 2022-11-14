import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from './users.entity';
import { UsersService } from './users.service';
import { RegisterUserDto } from '../dto/create.user.dto';
import { CallResponse } from '../../dto/response.dto';
import { RegisterDepositDto } from '../dto/deposit.user.dto';
import { TransferBalanceDto } from '../dto/transfer.balance.user.dto';

const listUsers: Users[] = [
  new Users({ id: 1, name: 'Rodolfo', govId: '33322211155', balance: 5000, password: '4321' }),
  new Users({ id: 2, name: 'Rafael', govId: '11122233344', balance: 5000, password: '1234' })
]

const responseRegister: CallResponse = { message: 'Invalid data.' }

const responseDepositUser = listUsers[1]
responseDepositUser.balance = responseDepositUser.balance + 1000

const responseDeposit: CallResponse = { status: true, message: 'Successfully deposited.' }
const responseTransfer: CallResponse = { status: true, message: 'Transfer made successfully.' }

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
            transfer: jest.fn().mockResolvedValue(responseTransfer),
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

  describe('getAllUsers', () => {

    it('should return a list users successfully', async () => {
      // Act
      const result = await usersService.getAllUsers();

      // Assert
      expect(result).toBe(listUsers);
      expect(usersRepository.find).toHaveBeenCalledTimes(1);
    });

    it('should throw an exception in getAllUsers', () => {
      // Arrange
      jest.spyOn(usersRepository, 'find').mockRejectedValueOnce(new Error());

      // Assert
      expect(usersService.getAllUsers()).rejects.toThrowError();
    });

  });

  describe('registerUser', () => {
    it('should return a registerUser successfully', async () => {
      //arrange
      const body: RegisterUserDto = {
        name: 'Rafael',
        govId: '11122233344',
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
      const body: RegisterUserDto = {
        name: 'Rafael',
        govId: '11122233344',
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
      //arrange
      const body: RegisterDepositDto = {
        balance: 1000
      };
      const req: any = {
        user: {
          id: 1,
          govId: '33322211155',
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
      const body: RegisterDepositDto = {
        balance: 1000
      };
      const req: any = {
        user: {
          id: 1,
          govId: '33322211155',
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
      const data: TransferBalanceDto = {
        transferToUser: '11122233344',
        balanceTransfer: 1000,
      };
      const req: any = {
        user: { id: 1, balance: 5000, govId: '33322211155' }
      }
      // Act
      const result = await usersRepository.findOneBy(req);
      const resultUserToTransfer = await usersRepository.findOne({ where: { govId: data.transferToUser } });
      const resultTransfer = await usersService.transfer(req, data);
      // Assert
      expect(result).toEqual(listUsers[0]);
      expect(resultUserToTransfer).toEqual(listUsers[1]);
      expect(resultTransfer).toEqual(responseTransfer);
      //expect(usersRepository.findOneBy).toHaveBeenCalledTimes(1);
    });

    it('should throw an exception in transfer', () => {
      // Arrange
      const data: TransferBalanceDto = {
        transferToUser: '11122233344',
        balanceTransfer: 1000,
      };
      const req: any = {
        user: { id: 1, balance: 5000, govId: '33322211155' }
      }
      jest.spyOn(usersRepository, 'findOneBy').mockRejectedValueOnce(new Error());
      // Assert
      expect(usersService.transfer(req, data)).rejects.toThrowError();
    });
  });
















})