extern crate core;

use anchor_lang::prelude::*;

declare_id!("3qFjQjHysMD7vDkpC7DBAyUhNkMQEPYRVWzkokZHLQfg");

#[program]
pub mod gappe {
    use super::*;

    /// Setup profile for an account.
    pub fn setup_profile(ctx: Context<SetupProfile>, name: String, authority: Pubkey) -> Result<()> {
        ctx.accounts.profile.name = name;
        ctx.accounts.profile.authority = authority;
        Ok(())
    }

    /// Updates the name of a profile.
    pub fn update_name(ctx: Context<UpdateName>, name: String) -> Result<()> {
        ctx.accounts.profile.name = name;
        Ok(())
    }

    /// Adds a contact.
    pub fn add_contact(ctx: Context<AddContact>, contact: Pubkey) -> Result<()> {
        ctx.accounts.contact.owner = ctx.accounts.owner.key();
        ctx.accounts.contact.address = contact;
        Ok(())
    }

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
pub struct SetupProfile<'info> {
    /// Limits the size of profile to 8000 bytes. Since `String` name is open-ended,
    /// a size needs to be provided.
    #[account(init, payer = user, space = 8000)]
    pub profile: Account<'info, Profile>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateName<'info> {
    /// Only allows the actual wallet of the profile to update profile.
    /// Checks profile.authority matches signer's key.
    #[account(mut, has_one = authority)]
    pub profile: Account<'info, Profile>,
    pub authority: Signer<'info>,
}


/// The profile of each account on Gappe. This is what is other users see before
/// interacting with others.
#[account]
#[derive(Default)]
pub struct Profile {
    /// The wallet which owns this profile and can make changes to it.
    pub authority: Pubkey,
    /// The name of the user.
    pub name: String,
}

#[derive(Accounts)]
pub struct AddContact<'info> {
    #[account(init, payer = owner)]
    pub contact: Account<'info, Contact>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

/// A contact of a user.
#[account]
#[derive(Default)]
pub struct Contact {
    /// The owner of the contact.
    pub owner: Pubkey,
    /// The contact's public key.
    pub address: Pubkey,
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
