import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  findAll() {
    return [
      {
        id: 1,
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'password',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        password: 'password',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }
}
