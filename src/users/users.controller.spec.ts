import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth/shared/auth.service';
import { UsersController } from './users.controller';
import { Users } from './shared/users.entity';
import { UsersService } from './shared/users.service';
import { JwtAuthGuard } from '../auth/shared/jwt-auth.guard';


const listUsers: Users[] = [
    new Users({ id: 1, name: 'Rodolfo', govId: '97501056056', balance: 5000, password: '4321' }),
    new Users({ id: 2, name: 'Rafael', govId: '80025687026', balance: 5000, password: '1234' })
]

const newUserEntity = new Users({ name: 'Rafael', govId: '80025687026', password: '1234' });

const responseTransfer: any = { message: 'Transfer made successfully.' }

const responseDeposit: any = { message: 'Successfully deposited.' }

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
            //arrange
            const body: any = {
                name: 'Rafael',
                govId: '80025687026',
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
            const body: any = {
                name: 'Rafael',
                govId: '80025687026',
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
            const body: any = {
                balance: 100
            };
            const tokenExtractUser: any = {
                user: {
                    id: 1,
                    govId: '97501056056',
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
            const body: any = {
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
            const data: any = {
                transferToUser: '80025687026',
                balanceTransfer: 1000,
            };
            const req: any = {
                user: { id: 1, balance: 100, govId: '97501056056' }
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
            const data: any = {
                transferToUser: '80025687026',
                balanceTransfer: 1000,
            };
            const req: any = {
                user: { id: 1, govId: '97501056056' }
            }
            jest.spyOn(usersService, 'transfer').mockRejectedValueOnce(new Error());
            //assert
            expect(usersController.transfer(req, data)).rejects.toThrowError();
        });
    });
});
