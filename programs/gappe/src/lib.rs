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
}

#[derive(Accounts)]
pub struct SetupProfile<'info> {
    #[account(init, payer = user)]
    pub profile: Account<'info, Profile>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>
}

/// The profile of each account on Gappe. This is what is other users see before
/// interacting with others.
#[account]
#[derive(Default)]
pub struct Profile {
    pub username: String,
}

