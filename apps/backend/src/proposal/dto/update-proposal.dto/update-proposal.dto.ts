import { PartialType } from '@nestjs/mapped-types';
import { CreateProposalDto } from '../create-proposal.dto/create-proposal.dto';

export class UpdateProposalDto extends PartialType(CreateProposalDto) {}
