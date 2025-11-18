// src/scripts/hash-password.ts
import * as bcrypt from 'bcrypt';

async function run() {
  const senha = '123456'; // coloque aqui a senha que você quer
  const hash = await bcrypt.hash(senha, 10);
  console.log('Hash gerado para', senha, ':');
  console.log(hash);
}

run().catch(console.error);
