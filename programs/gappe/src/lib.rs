use anchor_lang::prelude::*;

declare_id!("7spG7C84YJyTaxVvHLLtNbWF18SgACLyz5AdkBrwU1zY");

#[program]
pub mod gappe {
    use super::*;

    /// Setup profile for an account.
    pub fn setup_profile(ctx: Context<SetupProfile>, name: String, authority: Pubkey) -> ProgramResult {
        ctx.accounts.profile.name = name;
        ctx.accounts.profile.authority = authority;
        Ok(())
    }

    /// Updates the name of a profile.
    pub fn update_name(ctx: Context<UpdateProfile>, name: String) -> ProgramResult {
        ctx.accounts.profile.name = name;
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
    pub system_program: Program<'info, System>
}

#[derive(Accounts)]
pub struct UpdateProfile<'info> {
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

