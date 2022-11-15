export class User {
    id: number;
    name: string;
    govId: string;
    balance: GLfloat;
    password: string;
}

export class UserDeposit {
    balance: GLfloat;
}

export class UserTransfer {
    transferToUser: string;
    balanceTransfer: GLfloat;
}

export class UserResponse {
    status: boolean;
    message: string;
}