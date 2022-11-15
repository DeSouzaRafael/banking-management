import { Injectable, HttpException, HttpStatus, ConflictException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Users } from './users.entity';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
  ) { }

  async deposit(req, data: any): Promise<any> {

    let getUser = await this.userRepository.findOneBy({ id: req.user.id })

    if (!getUser) {
      throw new HttpException({
        message: 'User not found.'
      }, HttpStatus.BAD_REQUEST)
    } else if (data.balance < 0) {
      throw new HttpException({
        message: 'Negative values ​​are not valid.'
      }, HttpStatus.BAD_REQUEST)
    } else if (data.balance == 0) {
      throw new HttpException({
        message: 'Enter a deposit amount.'
      }, HttpStatus.BAD_REQUEST)
    } else if (data.balance > 2000) {
      throw new HttpException({
        message: 'Amount greater than the accepted limit on the deposit.'
      }, HttpStatus.BAD_REQUEST)
    }
    let totalCash = getUser.balance + data.balance

    return this.userRepository.update(getUser.id, { balance: parseFloat(totalCash.toFixed(2)) })
      .then((result) => {
        throw new HttpException({
          status: true,
          message: 'Successfully deposited.'
        }, HttpStatus.OK)
      })
  }

  async transfer(req, data: any): Promise<any> {
    data.transferToUser = data.transferToUser.replace(/\D/g, '')

    if (cpf(data.transferToUser) == false) {
      throw new HttpException({
        message: 'Invalid CPF.'
      }, HttpStatus.BAD_REQUEST)
    }

    if (data.balanceTransfer <= 0) {
      throw new HttpException({
        message: 'enter some value.'
      }, HttpStatus.BAD_REQUEST)
    }

    let originUser = await this.userRepository.findOneBy({ id: req.user.id })
    let userToTransfer = await this.userRepository.findOne({ where: { govId: data.transferToUser } })

    if (originUser && userToTransfer) {

      if (originUser.govId == userToTransfer.govId) {
        throw new HttpException({
          message: 'You cannot transfer to yourself.'
        }, HttpStatus.BAD_REQUEST)
      }

      if (data.balanceTransfer > originUser.balance) {
        throw new HttpException({
          message: 'Insufficient funds.'
        }, HttpStatus.BAD_REQUEST)
      }

      if (data.balanceTransfer > 2000 ) {
        throw new HttpException({
          message: 'Value higher than acceptable.'
        }, HttpStatus.BAD_REQUEST)
      }

      let originUserWithdraw = originUser.balance - data.balanceTransfer
      let balanceUserReceive = userToTransfer.balance + data.balanceTransfer

      await this.userRepository.update(originUser.id, { balance: parseFloat(originUserWithdraw.toFixed(2)) })
      let transfer = await this.userRepository.update(userToTransfer.id, { balance: parseFloat(balanceUserReceive.toFixed(2)) })

      if (transfer) {
        throw new HttpException({
          message: 'Transfer made successfully.'
        }, HttpStatus.OK)
      } else {
        await this.userRepository.update(originUser.id, { balance: parseFloat(originUser.balance.toFixed(2)) })
        throw new HttpException({
          message: 'Transaction failed.'
        }, HttpStatus.BAD_REQUEST)
      }

    } else {
      throw new HttpException({
        message: 'User to transfer not exist.'
      }, HttpStatus.BAD_REQUEST)
    }

  }

  async registerUser(data: any): Promise<any> {
    data.govId = data.govId.replace(/\D/g, '')

    let valid = await cpf(data.govId)
    if (valid == false) {
      throw new HttpException({
        message: 'Invalid CPF.'
      }, HttpStatus.BAD_REQUEST)
    }

    let userExist = await this.userRepository.findOne({ where: { govId: data.govId } })
    if (userExist) {
      throw new HttpException({
        message: 'There is already an account with the CPF entered.'
      }, HttpStatus.BAD_REQUEST)
    }

    if (data.password.length < 4) {
      throw new HttpException({
        message: 'Password must be at least four characters long.'
      }, HttpStatus.BAD_REQUEST)
    }

    if (data.name.length < 5) {
      throw new HttpException({
        message: 'Enter your name.'
      }, HttpStatus.BAD_REQUEST)
    }

    let user = new Users()
    user.name = data.name
    user.govId = data.govId
    user.password = bcrypt.hashSync(data.password, 10)
    user.balance = 0

    return this.userRepository.save(user)
      .then((result) => {
        throw new HttpException({
          message: 'Account Created Successfully.'
        }, HttpStatus.OK)
      })
    //.catch((error) => {
    //  throw new HttpException({
    //    message: 'Invalid data.'
    //  }, HttpStatus.BAD_REQUEST)
    //})
  }

  async findOne(govId: string): Promise<Users | undefined> {
    return this.userRepository.findOne({
      where: {
        govId: govId
      }
    })
  }
}

function cpf(cpf) {
  cpf = cpf.replace(/\D/g, '');
  if (cpf.toString().length != 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  var result = true;
  [9, 10].forEach(function (j) {
    var soma = 0, r;
    cpf.split(/(?=)/).splice(0, j).forEach(function (e, i) {
      soma += parseInt(e) * ((j + 2) - (i + 1));
    });
    r = soma % 11;
    r = (r < 2) ? 0 : 11 - r;
    if (r != cpf.substring(j, j + 1)) result = false;
  });
  return result;
}

