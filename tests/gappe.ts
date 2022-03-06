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

    await program.rpc.updateName('username2', {
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
      await program.rpc.updateName('username2', {
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

  it('send friend request', async () => {
    const person1 = anchor.web3.Keypair.generate();
    const person2 = anchor.web3.Keypair.generate();

    await program.rpc.setupProfile('person1', person1.publicKey, {
      accounts: {
        profile: person1.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [person1],
    });
    await program.rpc.setupProfile('person2', person2.publicKey, {
      accounts: {
        profile: person2.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [person2],
    });

    await program.rpc.sendFriendRequest({
      accounts: {
        profileFriend: person2.publicKey,
        profileSelf: person1.publicKey,
        requester: person1.publicKey,
      },
      signers: [person1],
    });

    const profile1 = await program.account.profile.fetch(person1.publicKey);
    const profile2 = await program.account.profile.fetch(person2.publicKey);
    expect(profile1.friends.length).to.be.equal(1);
    expect(profile2.friendRequests.length).to.be.equal(1);
    expect(profile1.friends[0].toBase58()).to.be.equal(
      person2.publicKey.toBase58()
    );
    expect(profile2.friendRequests[0].toBase58()).to.be.equal(
      person1.publicKey.toBase58()
    );
  });

  it('accept friend request', async () => {
    const person1 = anchor.web3.Keypair.generate();
    const person2 = anchor.web3.Keypair.generate();

    await program.rpc.setupProfile('person1', person1.publicKey, {
      accounts: {
        profile: person1.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [person1],
    });
    await program.rpc.setupProfile('person2', person2.publicKey, {
      accounts: {
        profile: person2.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [person2],
    });

    await program.rpc.sendFriendRequest({
      accounts: {
        profileFriend: person2.publicKey,
        profileSelf: person1.publicKey,
        requester: person1.publicKey,
      },
      signers: [person1],
    });

    await program.rpc.decideOnFriendRequest(true, {
      accounts: {
        profileSelf: person2.publicKey,
        profileFriend: person1.publicKey,
        requester: person2.publicKey,
      },
      signers: [person2],
    });

    const profile1 = await program.account.profile.fetch(person1.publicKey);
    const profile2 = await program.account.profile.fetch(person2.publicKey);
    expect(profile1.friends.length).to.be.equal(1);
    expect(profile1.friendRequests.length).to.be.equal(0);
    expect(profile2.friends.length).to.be.equal(1);
    expect(profile1.friends[0].toBase58()).to.be.equal(
      person2.publicKey.toBase58()
    );
    expect(profile2.friends[0].toBase58()).to.be.equal(
      person1.publicKey.toBase58()
    );
  });

  it('reject friend request', async () => {
    const person1 = anchor.web3.Keypair.generate();
    const person2 = anchor.web3.Keypair.generate();

    await program.rpc.setupProfile('person1', person1.publicKey, {
      accounts: {
        profile: person1.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [person1],
    });
    await program.rpc.setupProfile('person2', person2.publicKey, {
      accounts: {
        profile: person2.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [person2],
    });

    await program.rpc.sendFriendRequest({
      accounts: {
        profileFriend: person2.publicKey,
        profileSelf: person1.publicKey,
        requester: person1.publicKey,
      },
      signers: [person1],
    });

    await program.rpc.decideOnFriendRequest(false, {
      accounts: {
        profileSelf: person2.publicKey,
        profileFriend: person1.publicKey,
        requester: person2.publicKey,
      },
      signers: [person2],
    });

    const profile1 = await program.account.profile.fetch(person1.publicKey);
    const profile2 = await program.account.profile.fetch(person2.publicKey);
    expect(profile1.friends.length).to.be.equal(0);
    expect(profile1.friendRequests.length).to.be.equal(0);
    expect(profile2.friends.length).to.be.equal(0);
  });
});
