use anchor_lang::prelude::*;

declare_id!("7spG7C84YJyTaxVvHLLtNbWF18SgACLyz5AdkBrwU1zY");

#[program]
pub mod gappe {
    use super::*;

    /// Setup profile for an account.
    pub fn setup_profile(ctx: Context<SetupProfile>, username: String) -> ProgramResult {
        ctx.accounts.profile.username = username;
        Ok(())
    }

    /// Updates the username of an account.
    pub fn update_username(ctx: Context<UpdateProfile>, username: String) -> ProgramResult {
        ctx.accounts.profile.username = username;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct SetupProfile<'info> {
    /// Limits the size of profile to 8000 bytes. Since `String` username is open-ended,
    /// a size needs to be provided.
    #[account(init, payer = user, space = 8000)]
    pub profile: Account<'info, Profile>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>
}

#[derive(Accounts)]
pub struct UpdateProfile<'info> {
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

