import { Test, TestingModule } from '@nestjs/testing';
import { CallResponse } from '../dto/response.dto';
import { AuthService } from '../auth/shared/auth.service';
import { RegisterUserDto } from './dto/create.user.dto';
import { RegisterDepositDto } from './dto/deposit.user.dto';
import { TransferBalanceDto } from './dto/transfer.balance.user.dto';
import { UsersController } from './users.controller';
import { Users } from './shared/users.entity';
import { UsersService } from './shared/users.service';
import { JwtAuthGuard } from '../auth/shared/jwt-auth.guard';


const listUsers: Users[] = [
    new Users({ id: 1, name: 'Rodolfo', govId: '33322211155', balance: 5000, password: '4321' }),
    new Users({ id: 2, name: 'Rafael', govId: '11122233344', balance: 5000, password: '1234' })
]

const newUserEntity = new Users({ name: 'Rafael', govId: '33322211155', password: '1234' });

const responseTransfer: CallResponse = { message: 'Transfer made successfully.' }

const responseDeposit: CallResponse = { message: 'Successfully deposited.' }

describe('UsersController', () => {
    let usersController: UsersController;
    let usersService: UsersService;

    beforeEach(async () => {

        const app: TestingModule = await Test.createTestingModule({
            controllers: [UsersController],
            providers: [JwtAuthGuard,
                {
                    provide: UsersService,
                    useValue: {
                        getAllUsers: jest.fn().mockResolvedValue(listUsers),
                        registerUser: jest.fn().mockResolvedValue(newUserEntity),
                        deposit: jest.fn().mockResolvedValue(responseDeposit),
                        transfer: jest.fn().mockResolvedValue(responseTransfer),
                    }
                },
                {
                    provide: AuthService,
                    useValue: {
                        login: jest.fn((govId, password) => {
                            if (
                                govId !== listUsers[0].govId ||
                                password !== listUsers[0].password
                            ) {
                                return null;
                            } else {
                                return listUsers[0];
                            }
                        }),
                        generateUserCredentials: jest.fn(() => {
                            return { access_token: '' };
                        })
                    }
                },
            ],
        })
            .compile();
        usersController = app.get<UsersController>(UsersController);
        usersService = app.get<UsersService>(UsersService);
    });

    describe('List users', () => {

        it('should return List Users!', async () => {
            //act
            const result = await usersController.getAllUsers();
            //assert
            expect(result).toBe(listUsers);
            expect(usersService.getAllUsers).toHaveBeenCalledTimes(1);
            expect(typeof result).toEqual('object');
        });

        it('should throw an exception in List Users!', () => {
            //arrange
            jest.spyOn(usersService, 'getAllUsers').mockRejectedValueOnce(new Error());
            //assert
            expect(usersController.getAllUsers()).rejects.toThrowError();
        });

    });

    describe('Create user', () => {

        it('should created a new User item sucessfully!', async () => {
            //arrange
            const body: RegisterUserDto = {
                name: 'Rafael',
                govId: '33322211155',
                password: '1234'
            };
            //act
            const result = await usersController.registerUser(body)
            //assert
            expect(result).toEqual(newUserEntity);
            expect(usersService.registerUser).toHaveBeenCalledTimes(1);
            expect(usersService.registerUser).toHaveBeenCalledWith(body);
        });

        it('should throw an exception in Create User!', () => {
            //arrange
            const body: RegisterUserDto = {
                name: 'Rafael',
                govId: '33322211155',
                password: '1234'
            };
            jest.spyOn(usersService, 'registerUser').mockRejectedValueOnce(new Error());
            //assert
            expect(usersController.registerUser(body)).rejects.toThrowError();
        });
    });

    describe('Deposit user', () => {

        it('should deposit balance to user successfully!', async () => {
            //arrange
            const body: RegisterDepositDto = {
                balance: 100
            };
            const tokenExtractUser: any = {
                user: {
                    id: 1,
                    govId: '33322211155',
                }
            };
            //act
            const result = await usersController.deposit(tokenExtractUser, body)
            //assert
            expect(result).toBe(responseDeposit);
            expect(usersService.deposit).toHaveBeenCalledTimes(1);
            expect(usersService.deposit).toHaveBeenCalledWith(tokenExtractUser, body);
        });

        it('should throw an exception in Deposit user!', () => {
            //arrange
            const body: RegisterDepositDto = {
                balance: 100
            };
            const tokenExtractUser: any = {
                user: { id: 1, balance: 100 }
            };
            jest.spyOn(usersService, 'deposit').mockRejectedValueOnce(new Error());
            //assert
            expect(usersController.deposit(tokenExtractUser, body)).rejects.toThrowError();
        });
    });

    describe('Transfer between users', () => {

        it('should transfer balance from the logged in user to another user successfully!', async () => {
            //arrange
            const data: TransferBalanceDto = {
                transferToUser: '44861199832',
                balanceTransfer: 1000,
            };
            const req: any = {
                user: { id: 15, balance: 100, govId: '11122233344' }
            }
            //act
            const result = await usersController.transfer(req, data)
            //assert
            expect(result).toEqual(responseTransfer);
            expect(usersService.transfer).toHaveBeenCalledTimes(1);
            expect(usersService.transfer).toHaveBeenCalledWith(req, data);
        });

        it('should throw an exceptionin Transfer!', () => {
            //arrange
            const data: TransferBalanceDto = {
                transferToUser: '44861199832',
                balanceTransfer: 1000,
            };
            const req: any = {
                user: { id: 15, govId: '44861199832' }
            }
            jest.spyOn(usersService, 'transfer').mockRejectedValueOnce(new Error());
            //assert
            expect(usersController.transfer(req, data)).rejects.toThrowError();
        });
    });
});
