import { Injectable } from '@nestjs/common';
import { CreateSnowTestRegisterDto } from './dto/create-snow-test-register.dto';
import { UpdateSnowTestRegisterDto } from './dto/update-snow-test-register.dto';

@Injectable()
export class SnowTestRegisterService {
  create(createSnowTestRegisterDto: CreateSnowTestRegisterDto) {
    return 'This action adds a new snowTestRegister';
  }

  findAll() {
    return `This action returns all snowTestRegister`;
  }

  findOne(id: number) {
    return `This action returns a #${id} snowTestRegister`;
  }

  update(id: number, updateSnowTestRegisterDto: UpdateSnowTestRegisterDto) {
    return `This action updates a #${id} snowTestRegister`;
  }

  remove(id: number) {
    return `This action removes a #${id} snowTestRegister`;
  }
}
