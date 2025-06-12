import { MessageReaction } from 'discord.js';

export function extractPropositionInfo(messageContent: string) {
	const lines = messageContent.split('\n');
	const subject =
		lines
			.find((l) => l.startsWith('**Subject**'))
			?.replace('**Subject** : ', '')
			.trim() || '';
	const format =
		lines
			.find((l) => l.startsWith('**Format**'))
			?.replace('**Format** : ', '')
			.trim() || '';
	const proposedByMatch = messageContent.match(/by <@!?([0-9]+)>/);
	const proposedBy = proposedByMatch ? proposedByMatch[1] : null;
	return { subject, format, proposedBy };
}

export async function getVotersFromReaction(
	reaction: MessageReaction,
	emoji: string,
) {
	const react = reaction.message.reactions.cache.get(emoji);
	if (!react) return [];
	const users = await react.users.fetch();
	return users.filter((u: any) => !u.bot).map((u: any) => u.id);
}

export function getSubmissionExplanation(voteChannelId: string | null) {
	return (
		'🎉 **Submit your ideas!**\n\n' +
		'To submit an idea:\n' +
		'1. Click the **📝 Submit an idea** button below.\n' +
		'2. Enter the subject of your idea and its description.\n' +
		'3. Select the desired format (**Whitepaper** or **Masterclass**).\n' +
		'4. Indicate if you want to be a contributor for this idea.\n\n' +
		'Your proposal will then be sent to the <#' +
		voteChannelId +
		'> channel for everyone to vote!'
	);
}

export function getVoteExplanation() {
	return (
		'📢 **How to vote on proposals**\n\n' +
		'- Each new idea will appear here.\n' +
		'- To vote on the subject: ✅ = Yes, ❌ = No\n' +
		'- To vote on the format: 👍 = Yes, 👎 = No\n\n' +
		'Once enough votes are collected, the proposal will be either approved or rejected and moved to the results channel.'
	);
}

export function getResultExplanation() {
	return (
		'🏁 **Results of votes**\n\n' +
		'- All approved or rejected proposals will appear here.\n' +
		'- ✅ = Approved\n' +
		'- ❌ = Rejected\n\n' +
		'You can follow the outcome of each idea in this channel.'
	);
}
