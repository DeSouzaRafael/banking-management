# Banking Management

Welcome to Banking Management 1.0
The objective of this project is to simulate bank accounts main transactions.

## Requirements

This project requires the following programs to be installed in order to work properly:

[Node.js](https://nodejs.org) v16.14.0
[NestJS](https://nestjs.com) v9.1.5
[MySql](https://dev.mysql.com/downloads/installer/) latest version


After installing node, use the following command to install nestJS in the proper version:

```
npm i @nestjs/core@9.1.5 
```

Then, use this one to update project dependencies:

```
npm install
```

## Database

I'm using Mysql, follow the step by step on how to configure for use.

Connect local database using following parameters:

```json
Username: "DesafioCod"
Password: "DesafioCodigo321"
```
And run the following script:

```sql
CREATE SCHEMA `bank`
```

The table below does not need to be created, because when starting the project it creates the table if it does not exist.
If you want to create just follow this template:

```sql
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `govId` varchar(11) NOT NULL,
  `balance` float NOT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

You can change the access data to the database in the file ".env" or create a local database following the data already configured there.

## Development server

Run `npm run start` for a start server. The route we will be using `http://localhost:3000/`.



npm install dependencies

## Running end-to-end tests

I recommend running this test initially as it creates two users, and they can be used later.

Run `npm run test:e2e` to execute the end-to-end tests.

The users created in e2e are mocked, and will have the following data:

```json
    { "name": "Rodolfo", "govId": "97501056056", "password": "4321" },
    { "name": "Rafael", "govId": "80025687026", "password": "1234" }
```

If you want to create an user without runing e2e, you can use Register User Post function in URL Params tab.

## Running unit tests

Run `npm run test` to execute the unit tests.


## URL Params 

 
#### (Post) Register User `/users/register` 

##### Data Params:  
```json
{
    "name": "Rafael", 
    "govId": "000.000.000-00", 
    "password": "0000"
}
```

##### Success Response:  

* **Code:** 200
* **Content:** Account Created Successfully.

##### Error Response:

* **Code:** 400
* **Content:** There is already an account with the CPF input.

OR

* **Code:** 400
* **Content:** Password must be at least four characters long.

OR

* **Code:** 400
* **Content:** Enter your name.

<br>

#### (Post) Login User `/auth/login` 

##### Data Params:  
```json
{
    "username": "000.000.000-00", 
    "password": "80025687026"
}
```

##### Success Response:  

* **Code:** 200
* **Content:** access_token.

##### Error Response:

* **Code:** 401
* **Content:** Unauthorized.

<br>

#### (Get) Balance `/users/balance`

##### Required: Authentication

##### Success Response:  

* **Code:** 200
* **Content:** Name and Balance user.

##### Error Response:

* **Code:** 401
* **Content:** Unauthorized.

<br>

#### (Put) Deposit `/users/deposit`

##### Required: Authentication

##### Data Params:  
```json
{
    "balance": "1000"
}
```

##### Success Response:  

* **Code:** 200
* **Content:** Successfully deposited.

##### Error Response:

* **Code:** 401
* **Content:** Unauthorized.

OR

* **Code:** 400
* **Content:** User not found.

OR

* **Code:** 400
* **Content:** Negative values ​​are not valid.

OR

* **Code:** 400
* **Content:** Enter a deposit amount.

OR

* **Code:** 400
* **Content:** Amount greater than accepted limit on deposit.


<br>

#### (Put) Transfer `/users/transfer`

##### Required: Authentication

##### Data Params:  
```json
{
    "transferToUser": "000.000.000-00", //CPF to transfer to user
    "balanceTransfer": 1000             //value
}
```

##### Success Response:  

* **Code:** 200
* **Content:** Transfer made successfully.

##### Error Response:

* **Code:** 401
* **Content:** Unauthorized.

OR

* **Code:** 400
* **Content:** Invalid CPF.

OR

* **Code:** 400
* **Content:** You cannot transfer negative values.

OR

* **Code:** 400
* **Content:** Enter a transfer amount.

OR

* **Code:** 400
* **Content:** You cannot transfer to yourself.

OR

* **Code:** 400
* **Content:** Insufficient funds.

OR

* **Code:** 400
* **Content:** User to transfer does not exist.

OR

* **Code:** 500
* **Content:** Transaction failed.
