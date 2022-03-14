extern crate core;

use anchor_lang::prelude::*;
use borsh::{BorshDeserialize, BorshSerialize};

declare_id!("3qFjQjHysMD7vDkpC7DBAyUhNkMQEPYRVWzkokZHLQfg");

#[program]
pub mod gappe {
    use super::*;

    /// Sends a message.
    pub fn send_message(
        ctx: Context<SendMessage>,
        payload: String,
        sent_to: Pubkey,
        uuid: Vec<u8>,
    ) -> Result<()> {
        ctx.accounts.message.payload = payload;
        ctx.accounts.message.sent_by = ctx.accounts.owner.key();
        ctx.accounts.message.sent_to = sent_to;
        ctx.accounts.message.uuid = uuid;
        ctx.accounts.message.timestamp = Clock::get().unwrap().unix_timestamp;
        ctx.accounts.message.bump = *ctx.bumps.get("message").unwrap();
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(payload: String, sent_to: Pubkey, uuid: Vec<u8>)]
pub struct SendMessage<'info> {
    /// Need to specify the space because `payload: String` is unbounded.
    #[account(
    init,
    payer = owner,
    space = 900,
    seeds = ["message".as_ref(), owner.key().as_ref(), sent_to.as_ref(), uuid.as_ref()],
    bump
    )]
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
    pub payload: String,
    pub uuid: Vec<u8>,
    pub timestamp: i64,
    pub bump: u8,
}
