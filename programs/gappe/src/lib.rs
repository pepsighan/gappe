extern crate core;

use anchor_lang::prelude::*;

declare_id!("3qFjQjHysMD7vDkpC7DBAyUhNkMQEPYRVWzkokZHLQfg");

#[program]
pub mod gappe {
    use super::*;

    /// Sends a message.
    pub fn send_message(ctx: Context<SendMessage>, message: String, sent_to: Pubkey) -> Result<()> {
        ctx.accounts.message.text = message;
        ctx.accounts.message.sent_by = ctx.accounts.owner.key();
        ctx.accounts.message.sent_to = sent_to;
        ctx.accounts.message.timestamp = Clock::get().unwrap().unix_timestamp;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct SendMessage<'info> {
    /// Need to specify the space because `text: String` is unbounded.
    #[account(init, payer = owner, space = 900)]
    pub message: Account<'info, Message>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

/// A message that is sent by the user to someone else in their contact.
#[account]
pub struct Message {
    pub sent_by: Pubkey,
    pub sent_to: Pubkey,
    pub text: String,
    pub timestamp: i64,
}
