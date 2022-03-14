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

    const id = Buffer.from([
      211, 148, 232, 174, 169, 145, 71, 153, 145, 235, 157, 10, 170, 117, 86,
      197,
    ]); // Buffer.from(uuidv4(null, []));

    const receiver = 'FgeKvTXMumnr6UGaCwyh2NZAdWjeYeBqJP9HppyQnDxK';
    const sender = 'GchkX531gRuNcpVq81sv2y29SuSZg1GwExa3fsko7or5';
    const [message] = await anchor.web3.PublicKey.findProgramAddress(
      [
        anchor.utils.bytes.utf8.encode('message'),
        anchor.utils.bytes.bs58.decode(sender),
        anchor.utils.bytes.bs58.decode(receiver),
        id,
      ],
      program.programId
    );
    console.log(message.toBase58());

    const signature = await program.provider.connection.requestAirdrop(
      user.publicKey,
      100000000
    );
    await program.provider.connection.confirmTransaction(signature);

    await program.rpc.sendMessage('Hello there!', other.publicKey, id, {
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
