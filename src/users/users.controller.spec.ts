import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth/shared/auth.service';
import { UsersController } from './users.controller';
import { UserEntity } from './shared/users.entity';
import { UsersService } from './shared/users.service';
import { JwtAuthGuard } from '../auth/shared/jwt-auth.guard';
import { User, UserDeposit, UserResponse, UserTransfer } from './shared/users';


const listUsers: UserEntity[] = [
    new UserEntity({ id: 1, name: 'Rodolfo', govId: '97501056056', balance: 5000, password: '4321' }),
    new UserEntity({ id: 2, name: 'Rafael', govId: '80025687026', balance: 5000, password: '1234' })
]

const newUserEntity = new UserEntity({ name: 'Rafael', govId: '80025687026', password: '1234' });

const responseTransfer: UserResponse = { status: true, message: 'Transfer made successfully.' }

const responseDeposit: UserResponse = { status: false, message: 'Successfully deposited.' }

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

    describe('Create user', () => {

        it('should created a new User item sucessfully!', async () => {

            const body: User = {
                id: null, 
                balance: 0,
                name: 'Rafael',
                govId: '80025687026',
                password: '1234'
            };
            
            const result = await usersController.registerUser(body)
            
            expect(result).toEqual(newUserEntity);
            expect(usersService.registerUser).toHaveBeenCalledTimes(1);
            expect(usersService.registerUser).toHaveBeenCalledWith(body);
        });

        it('should throw an exception in Create User!', () => {
            
            const body: User = {
                id: null, 
                balance: 0,
                name: 'Rafael',
                govId: '80025687026',
                password: '1234'
            };
            jest.spyOn(usersService, 'registerUser').mockRejectedValueOnce(new Error());
            
            expect(usersController.registerUser(body)).rejects.toThrowError();
        });
    });

    describe('Deposit user', () => {

        it('should deposit balance to user successfully!', async () => {
            
            const body: UserDeposit = {
                balance: 100
            };
            const tokenExtractUser: object = {
                user: {
                    id: 1,
                    govId: '97501056056',
                }
            };
            
            const result = await usersController.deposit(tokenExtractUser, body)
            
            expect(result).toBe(responseDeposit);
            expect(usersService.deposit).toHaveBeenCalledTimes(1);
            expect(usersService.deposit).toHaveBeenCalledWith(tokenExtractUser, body);
        });

        it('should throw an exception in Deposit user!', () => {
            
            const body: UserDeposit = {
                balance: 100
            };
            const tokenExtractUser: object = {
                user: { id: 1, balance: 100 }
            };
            jest.spyOn(usersService, 'deposit').mockRejectedValueOnce(new Error());
            
            expect(usersController.deposit(tokenExtractUser, body)).rejects.toThrowError();
        });
    });

    describe('Transfer between users', () => {

        it('should transfer balance from the logged in user to another user successfully!', async () => {
            
            const data: UserTransfer = {
                transferToUser: '80025687026',
                balanceTransfer: 1000,
            };
            const req: object = {
                user: { id: 1, balance: 100, govId: '97501056056' }
            }
            
            const result = await usersController.transfer(req, data)
            
            expect(result).toEqual(responseTransfer);
            expect(usersService.transfer).toHaveBeenCalledTimes(1);
            expect(usersService.transfer).toHaveBeenCalledWith(req, data);
        });

        it('should throw an exceptionin Transfer!', () => {
            
            const data: UserTransfer = {
                transferToUser: '80025687026',
                balanceTransfer: 1000,
            };
            const req: object = {
                user: { id: 1, govId: '97501056056' }
            }
            jest.spyOn(usersService, 'transfer').mockRejectedValueOnce(new Error());
            
            expect(usersController.transfer(req, data)).rejects.toThrowError();
        });
    });
});
