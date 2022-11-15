import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './users.entity';
import { UsersService } from './users.service';
import { User, UserDeposit, UserResponse, UserTransfer } from './users';


const listUsers: UserEntity[] = [
  new UserEntity({ id: 1, name: 'Rodolfo', govId: '97501056056', balance: 5000, password: '4321' }),
  new UserEntity({ id: 2, name: 'Rafael', govId: '80025687026', balance: 5000, password: '1234' })
]

const responseRegister: UserResponse = { status: false, message: 'Invalid data.' }

const responseDepositUser = listUsers[1]
responseDepositUser.balance = responseDepositUser.balance + 1000

const responseDeposit = { status: true, message: 'Successfully deposited.' }

describe('UsersService', () => {
  let usersService: UsersService;
  let usersRepository: Repository<UserEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(UserEntity),
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
    usersRepository = module.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(usersService).toBeDefined();
    expect(usersRepository).toBeDefined();
  });

  describe('registerUser', () => {
    it('should return a registerUser successfully', async () => {
      
      const body = {
        name: 'Rafael',
        govId: '80025687026',
        password: '1234',
        balance: 0, 
        id: null
      };
      
      const result = await usersRepository.save(body);
      
      expect(result).toEqual(listUsers[1]);
      expect(usersRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should throw an exception in registerUser', () => {
      
      const body: User = {
        name: 'Rafael',
        govId: '80025687026',
        password: '1234',
        balance: 0, 
        id: null
      };
      jest.spyOn(usersRepository, 'save').mockRejectedValueOnce(new Error());
      
      expect(usersService.registerUser(body)).rejects.toThrowError();
    });
  });

  describe('deposit', () => {
    it('should return a deposit successfully', async () => {
      
      const body: UserDeposit = {
        balance: 1000
      };
      const req: object = {
        user: {
          id: 1,
          govId: '97501056056',
        }
      };
      
      const result = await usersRepository.update(req, body);
      
      expect(result).toEqual(responseDepositUser);
      expect(usersRepository.update).toHaveBeenCalledTimes(1);
    });

    it('should throw an exception in deposit', () => {
      
      const body: UserDeposit = {
        balance: 1000
      };
      const req: object = {
        user: { id: 1, balance: 5000, govId: '97501056056' }
      };
      jest.spyOn(usersRepository, 'update').mockRejectedValueOnce(new Error());
      
      expect(usersService.deposit(req, body)).rejects.toThrowError();
    });
  });

  describe('transfer', () => {
    it('should return a transfer successfully', async () => {
      
      const body: UserTransfer = {
        transferToUser: '80025687026',
        balanceTransfer: 1000,
      };
      const req: object = {
        user: { id: 1, balance: 5000, govId: '97501056056' }
      }
      
      const result = await usersRepository.findOneBy(req);
      const resultUserToTransfer = await usersRepository.findOne({ where: { govId: body.transferToUser } });
      
      expect(result).toEqual(listUsers[0]);
      expect(resultUserToTransfer).toEqual(listUsers[1]);
      expect(usersRepository.findOneBy).toHaveBeenCalledTimes(1);
    });

    it('should throw an exception in transfer', () => {
      
      const body: UserTransfer = {
        transferToUser: '80025687026',
        balanceTransfer: 1000,
      };
      const req: object = {
        user: { id: 1, balance: 5000, govId: '97501056056' }
      };
      jest.spyOn(usersRepository, 'findOneBy').mockRejectedValueOnce(new Error());
      
      expect(usersService.transfer(req, body)).rejects.toThrowError();
    });
  });
















})