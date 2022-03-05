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
    await program.rpc.setupProfile('username', {
      accounts: {
        profile: account1.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [account1],
    });

    const profile = await program.account.profile.fetch(account1.publicKey);
    expect(profile.username).to.equal('username');
  });

  it('update profile', async () => {
    await program.rpc.setupProfile('username', {
      accounts: {
        profile: account2.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [account2],
    });

    let profile = await program.account.profile.fetch(account2.publicKey);
    expect(profile.username).to.equal('username');

    await program.rpc.updateUsername('username2', {
      accounts: {
        profile: account2.publicKey,
      },
    });

    profile = await program.account.profile.fetch(account2.publicKey);
    expect(profile.username).to.equal('username2');
  });

  it('fetch two separate profile', async () => {
    const profile1 = await program.account.profile.fetch(account1.publicKey);
    expect(profile1.username).to.equal('username');

    const profile2 = await program.account.profile.fetch(account2.publicKey);
    expect(profile2.username).to.equal('username2');
  });
});
