import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, LoggerService } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from '../src/app.module'
import { JwtModule } from '@nestjs/jwt'

class TestLogger implements LoggerService {
  log(message: string) { }
  error(message: string, trace: string) { }
  warn(message: string) { }
  debug(message: string) { }
  verbose(message: string) { }
}

describe('Bank Management', () => {
  let app: INestApplication

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, JwtModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.useLogger(new TestLogger())
    await app.init()
  })

  afterAll(async () => {
    await Promise.all([
      app.close(),
    ])
  })

  describe('Create Users', () => {

    it('Creating Frist User', async () => {
      const response = await request(app.getHttpServer())
        .post('/users/register')
        .send({ name: 'Rodolfo', govId: '97501056056', password: '4321' })
        .expect(200)

      const data = response.body.message

      expect(data).toBe("Account Created Successfully.")
    })

    it('Creating Second User', async () => {
      const response = await request(app.getHttpServer())
        .post('/users/register')
        .send({ name: 'Rafael', govId: '80025687026', password: '1234' })
        .expect(200)

      const data = response.body.message

      expect(data).toBe('Account Created Successfully.')
    })

    it('Fails create user with invalid CPF', async () => {
      const response = await request(app.getHttpServer())
        .post('/users/register')
        .send({ name: 'Rafael', govId: '1234ffgh445', password: '1234' })
        .expect(400)

      const data = response.body.message

      expect(data).toBe('Invalid CPF.')
    })
  })

  describe('Authentication', () => {
    let jwtToken: string

    describe('AuthModule', () => {
      it('Authenticates user with valid credentials and provides a jwt token', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send({ username: '97501056056', password: '4321' })
          .expect(200)

        jwtToken = response.body.access_token
        expect(jwtToken).toMatch(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/) // jwt regex
      })

      it('Fails to authenticate user with an incorrect password', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send({ username: 'sdfsdf25', password: '1232' })
          .expect(401)

        expect(response.body.access_token).not.toBeDefined()
      })
    })

    describe('Protected Routes', () => {

      describe('Balance', () => {

        it('Get Balance User', async () => {
          const response = await request(app.getHttpServer())
            .get('/users/balance')
            .set('Authorization', `Bearer ${jwtToken}`)
            .expect(200)

          const data = response.body
          expect(data).toStrictEqual({name: "Rodolfo", balance: 0});
        })

        it('Fails to authenticate to Get Balance', async () => {
          const response = await request(app.getHttpServer())
            .get('/users/balance')
            .expect(401)

          const data = response.body
          expect(data).toStrictEqual({ statusCode: 401, message: "Unauthorized"});
        })

      })

      describe('Deposit', () => {

        it('Valid deposit', async () => {
          const response = await request(app.getHttpServer())
            .put('/users/deposit')
            .set('Authorization', `Bearer ${jwtToken}`)
            .send({ balance: 2000 })
            .expect(200)

          const data = response.body.message
          expect(data).toBe('Successfully deposited.');
        })

        it('Fails to authenticate user to deposit', async () => {
          const response = await request(app.getHttpServer())
            .put('/users/deposit')
            .send({ balance: 1000 })
            .expect(401)

          const data = response.body.message
          expect(data).toBe('Unauthorized');
        })

        it('Fails to deposit an amount greater than accepted', async () => {
          const response = await request(app.getHttpServer())
            .put('/users/deposit')
            .set('Authorization', `Bearer ${jwtToken}`)
            .send({ balance: 2001 })
            .expect(400)

          const data = response.body.message
          expect(data).toBe('Amount greater than accepted limit on deposit.');
        })

        it('Fails to send negative values', async () => {
          const response = await request(app.getHttpServer())
            .put('/users/deposit')
            .set('Authorization', `Bearer ${jwtToken}`)
            .send({ balance: -1000 })
            .expect(400)

          const data = response.body.message
          expect(data).toBe('Negative values ​​are not valid.');
        })

        it('Fails when to send letter instead of numbers', async () => {
          const response = await request(app.getHttpServer())
            .put('/users/deposit')
            .set('Authorization', `Bearer ${jwtToken}`)
            .send({ balance: `thousand` })
            .expect(500)

          const data = response.body.message
          expect(data).toBe('Internal server error');
        })

      })

      describe('Transfers', () => {

        it('Valid transfer', async () => {

          const response = await request(app.getHttpServer())
            .put('/users/transfer')
            .set('Authorization', `Bearer ${jwtToken}`)
            .send({ transferToUser: "80025687026", balanceTransfer: 1000 })
            .expect(200);

          const data = await response.body.message

          expect(data).toBe('Transfer made successfully.')
        })

        it('Fails Transfer attempt to yourself', async () => {

          const response = await request(app.getHttpServer())
            .put('/users/transfer')
            .set('Authorization', `Bearer ${jwtToken}`)
            .send({ transferToUser: "97501056056", balanceTransfer: 1000 })
            .expect(400)

          const data = response.body.message

          expect(data).toBe('You cannot transfer to yourself.')
        })

        it('Fails to enter invalid CPF', async () => {

          const response = await request(app.getHttpServer())
            .put('/users/transfer')
            .set('Authorization', `Bearer ${jwtToken}`)
            .send({ transferToUser: "99988877745", balanceTransfer: 1000 })
            .expect(400)

          const data = response.body.message

          expect(data).toBe('Invalid CPF.')
        })

        it('Fails trying to transfer negative values', async () => {

          const response = await request(app.getHttpServer())
            .put('/users/transfer')
            .set('Authorization', `Bearer ${jwtToken}`)
            .send({ transferToUser: "80025687026", balanceTransfer: -1000 })
            .expect(400)

          const data = response.body.message

          expect(data).toBe('You cannot transfer negative values.')
        })

        it('Fails when trying to transfer no value (0)', async () => {

          const response = await request(app.getHttpServer())
            .put('/users/transfer')
            .set('Authorization', `Bearer ${jwtToken}`)
            .send({ transferToUser: "80025687026", balanceTransfer: 0 })
            .expect(400)

          const data = response.body.message

          expect(data).toBe('Enter a transfer amount.')
        })

        it('Fails to authenticate user to transfer', async () => {

          const response = await request(app.getHttpServer())
            .put('/users/transfer')
            .send({ transferToUser: "80025687026", balanceTransfer: 1000 })
            .expect(401)

          const data = response.body.message

          expect(data).toBe('Unauthorized')
        })

        it('Fails user to transfer does not exist', async () => {

          const response = await request(app.getHttpServer())
            .put('/users/transfer')
            .set('Authorization', `Bearer ${jwtToken}`)
            .send({ transferToUser: "67955397096", balanceTransfer: 1000 })
            .expect(400)

          const data = response.body.message

          expect(data).toBe('User to transfer does not exist.')
        })
      })
    })
  })
})
