use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod gappe {
    use super::*;

    /// Setup profile for an account.
    pub fn setup_profile(ctx: Context<SetupProfile>, username: String) -> ProgramResult {
        ctx.accounts.profile.username = username;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct SetupProfile<'info> {
    /// `mut` is needed to save changes made to the profile.
    #[account(mut)]
    pub profile: Account<'info, Profile>,
}

/// The profile of each account on Gappe. This is what is other users see before
/// interacting with others.
#[account]
#[derive(Default)]
pub struct Profile {
    pub username: String,
}

