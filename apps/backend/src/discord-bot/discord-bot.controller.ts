import {
	Controller,
	Post,
	Body,
	Get,
	Query,
	HttpCode,
	HttpStatus,
	Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DiscordProposalService } from './services/discord-proposal.service';
import { DiscordBotProvider } from './discord-bot.provider';
import { Public } from 'src/auth/auth.decorator';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@ApiTags('Discord Bot')
@Controller('discord-bot')
export class DiscordBotController {
	constructor(
		private readonly discordProposalService: DiscordProposalService,
		private readonly discordBotProvider: DiscordBotProvider,
		private readonly configService: ConfigService,
	) {}

	// Endpoint pour créer les channels si besoin
	@Post('create-channels')
	async createChannels(
		@Body()
		body: {
			guildId: string;
			proposeName?: string;
			voteName?: string;
			resultName?: string;
		},
	) {
		return this.discordProposalService.createChannelsIfNotExist(
			body.guildId,
			body.proposeName,
			body.voteName,
			body.resultName,
		);
	}

	// Endpoint pour renommer les channels
	@Post('rename-channels')
	async renameChannels(
		@Body()
		body: {
			guildId: string;
			oldNames: { propose: string; vote: string; result: string };
			newNames: { propose: string; vote: string; result: string };
		},
	) {
		return this.discordProposalService.renameChannels(
			body.guildId,
			body.oldNames,
			body.newNames,
		);
	}

	// Endpoint pour lister les channels textuels (GET avec query param)
	@Get('list-channels')
	async listChannels(@Query('guildId') guildId: string) {
		return this.discordProposalService.listTextChannels(guildId);
	}

	@Public()
	@HttpCode(HttpStatus.OK)
	@Get('link')
	async getVerifyToken(
		@Query('code') code: string,
		@Query('state') guildId: string, // Ici, state = guildId
		@Res() res: Response,
	) {
		if (code) {
			await this.discordBotProvider.linkDiscord(code, guildId);
			const logoUrl =
				this.configService.get('SNOWLEDGE_LOGO_URL') || '/logo.png';
			res.setHeader('Content-Type', 'text/html');
			res.send(`
			<html>
			  <head>
				<title>Connexion Snowledge réussie</title>
				<meta charset="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<style>
				  body {
					background: #f6f8fa;
					display: flex;
					align-items: center;
					justify-content: center;
					height: 100vh;
					margin: 0;
					font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif;
				  }
				  .container {
					background: #fff;
					border-radius: 16px;
					box-shadow: 0 4px 24px rgba(0,0,0,0.08);
					padding: 40px 32px 32px 32px;
					text-align: center;
					max-width: 400px;
				  }
				  .logo {
					width: 80px;
					margin-bottom: 24px;
				  }
				  h2 {
					color: #1a202c;
					margin-bottom: 12px;
				  }
				  p {
					color: #444;
					margin-bottom: 8px;
					font-size: 1.08em;
				  }
				  .timer {
					margin-top: 18px;
					color: #888;
					font-size: 0.95em;
				  }
				</style>
			  </head>
			  <body>
				<div class="container">
				  <img class="logo" src="${logoUrl}" alt="Logo Snowledge" />
				  <h2>Merci d'avoir autorisé Snowledge !</h2>
				  <p>
					Votre connexion a bien été prise en compte.<br>
					Grâce à cette autorisation, vous pourrez accéder à toutes les fonctionnalités de Snowledge <b>directement depuis Discord</b>.
				  </p>
				  <p>
					La page va se fermer automatiquement dans <span id="timer">10</span> secondes...
				  </p>
				  <div class="timer">Vous pouvez fermer cette page si rien ne se passe.</div>
				</div>
				<script>
				  let seconds = 10;
				  const timer = document.getElementById('timer');
				  setInterval(() => {
					seconds--;
					if (timer) timer.textContent = seconds;
					if (seconds <= 0) window.close();
				  }, 1000);
				</script>
			  </body>
			</html>
			`);
		} else {
			res.redirect(`${process.env.FRONT_URL}/profile`);
		}
	}
}
