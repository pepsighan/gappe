import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { expect } from 'chai';
import { v4 as uuidv4 } from 'uuid';
import { Gappe } from '../target/types/gappe';

describe('gappe', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.Provider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Gappe as Program<Gappe>;

  it('send a message', async () => {
    const user = anchor.web3.Keypair.generate();
    const other = anchor.web3.Keypair.generate();

    const id = uuidv4(null, []);
    const uuid = String.fromCharCode(...id);

    const [message] = await anchor.web3.PublicKey.findProgramAddress(
      [
        anchor.utils.bytes.utf8.encode('message'),
        anchor.utils.bytes.utf8.encode(uuid),
        user.publicKey.toBuffer(),
        other.publicKey.toBuffer(),
      ],
      program.programId
    );

    const signature = await program.provider.connection.requestAirdrop(
      user.publicKey,
      100000000
    );
    await program.provider.connection.confirmTransaction(signature);

    await program.rpc.sendMessage('Hello there!', other.publicKey, uuid, {
      accounts: {
        message,
        owner: user.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [user],
    });

    const savedMessage = await program.account.message.fetch(message);
    expect(savedMessage.payload).to.be.equal('Hello there!');
    expect(savedMessage.sentTo.toBase58()).to.be.equal(
      other.publicKey.toBase58()
    );
  });
});
