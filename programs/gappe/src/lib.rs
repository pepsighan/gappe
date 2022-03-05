extern crate core;

use core::num::flt2dec::Sign;
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
    pub fn update_name(ctx: Context<UpdateName>, name: String) -> ProgramResult {
        ctx.accounts.profile.name = name;
        Ok(())
    }

    /// Sends friend request.
    pub fn send_friend_request(ctx: Context<SendFriendRequest>) -> ProgramResult {
        let self_pubkey = ctx.accounts.requester.key();
        let friend_pubkey = ctx.accounts.profile_friend.authority;

        // If already a friend, error out.
        if ctx.accounts.profile_friend.friends.contains(&self_pubkey) {
            return Err(error!(GappeError::AlreadyFriend));
        }

        // If already requested, ignore this one.
        if ctx.accounts.profile_friend.friend_requests.contains(&self_pubkey) {
            return Ok(());
        }

        // Send the request to a potential friend.
        ctx.accounts.profile_friend.friend_requests.push(self_pubkey);
        // Register the other user as one's friend.
        ctx.accounts.profile_self.friends.push(friend_pubkey);
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

#[derive(Accounts)]
pub struct SendFriendRequest<'info> {
    /// The profile of a potential friend.
    #[account(mut)]
    pub profile_friend: Account<'info, Profile>,
    /// The profile of oneself.
    #[account(mut)]
    pub profile_self: Account<'info, Profile>,
    /// The one who is sending the request.
    pub requester: Signer<'info>
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
    /// All the friends of this profile.
    pub friends: Vec<Pubkey>,
    /// All the friend requests sent to this profile.
    pub friend_requests: Vec<Pubkey>,
}


#[error_code]
pub enum GappeError {
    #[msg("Already a friend")]
    AlreadyFriend,
}