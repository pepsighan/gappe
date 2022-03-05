import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { Gappe } from '../target/types/gappe';
import { expect } from 'chai';

describe('gappe', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.Provider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Gappe as Program<Gappe>;

  const account1 = anchor.web3.Keypair.generate();
  const account2 = anchor.web3.Keypair.generate();

  it('setup profile', async () => {
    await program.rpc.setupProfile('username', account1.publicKey, {
      accounts: {
        profile: account1.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [account1],
    });

    const profile = await program.account.profile.fetch(account1.publicKey);
    expect(profile.name).to.equal('username');
  });

  it('update profile', async () => {
    await program.rpc.setupProfile('username', account2.publicKey, {
      accounts: {
        profile: account2.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [account2],
    });

    let profile = await program.account.profile.fetch(account2.publicKey);
    expect(profile.name).to.equal('username');

    await program.rpc.updateUsername('username2', {
      accounts: {
        profile: account2.publicKey,
        authority: account2.publicKey,
      },
      signers: [account2],
    });

    profile = await program.account.profile.fetch(account2.publicKey);
    expect(profile.name).to.equal('username2');
  });

  it('fetch two separate profile', async () => {
    const profile1 = await program.account.profile.fetch(account1.publicKey);
    expect(profile1.name).to.equal('username');

    const profile2 = await program.account.profile.fetch(account2.publicKey);
    expect(profile2.name).to.equal('username2');
  });

  it('do not allow updating profile using wrong account', async () => {
    const user1 = anchor.web3.Keypair.generate();
    const user2 = anchor.web3.Keypair.generate();

    await program.rpc.setupProfile('username', user1.publicKey, {
      accounts: {
        profile: user1.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [user1],
    });

    let err;
    try {
      await program.rpc.updateUsername('username2', {
        accounts: {
          profile: user1.publicKey,
          authority: user1.publicKey,
        },
        signers: [user2],
      });
    } catch (error) {
      err = error;
    }

    expect(err).to.not.be.undefined;
  });
});
