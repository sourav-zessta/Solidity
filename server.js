const express = require('express');
const { Web3 } = require('web3');
const { Transaction } = require('@ethereumjs/tx');
const solc = require('solc');

const app = express();

const web3 = new Web3('http://127.0.0.1:8545');

const account = '0x44F05D9Ea2c27f0237371292D87b3e839235E196';
const privateKey = Buffer.from(
  'faf4b02e4092d895fef02c073c98147568d1d789f8297368c678189b6fd19b31',
  'hex'
);

app.get('/getBalance', (req, res) => {
  try {
    web3.eth
      .getBalance(account)
      .then((result) => res.json({ value: result.toString() }));
  } catch (error) {
    console.log(error);
  }
});

app.get('/compileContract', async (req, res) => {
  try {
    const sourceCode = `// SPDX-License-Identifier: MIT
    pragma solidity ^0.8.0;

    contract SimpleContract {
        uint public myNumber;

        constructor() {
            myNumber = 42;
        }

        function setNumber(uint newValue) public {
            myNumber = newValue;
        }
    }
    `;
    var input = {
      language: 'Solidity',
      sources: {
        'test.sol': {
          content: sourceCode,
        },
      },
      settings: {
        outputSelection: {
          '*': {
            '*': ['*'],
          },
        },
      },
    };

    var output = await JSON.parse(solc.compile(JSON.stringify(input)));

    /*  Default gasPrice = 1 Gwei (1,000,000,000 Wei) = 0.000000001 Ether
        Note: 
          * (Wei) is the smallest unit of Ether
            1 Gwei = 1,000,000,000 We
            1 Ether = 10^18 Wei
    */
    const gasPrice = 1000000000;
    // Depoying the contract on Etherium Network
    web3.eth.getTransactionCount(account).then((nonce) => {
      console.log('Transaction Count: ', nonce);
      const { object } =
        output.contracts['test.sol']['SimpleContract']['evm'][
          'deployedBytecode'
        ];
      console.log('object: ', '0x' + `${object}`);
      const estimatedGasCost =
        output.contracts['test.sol']['SimpleContract']['evm']['gasEstimates'][
          'creation'
        ]['totalCost'];
      console.log('gasEstimation: ', estimatedGasCost);

      // Creating Transaction Object

      const transactionObject = {
        nonce: web3.utils.toHex(nonce),
        gasLimit: web3.utils.toHex(estimatedGasCost * gasPrice),
        gasPrice: web3.utils.toHex(gasPrice),
        data: '0x' + `${object}`,
      };

      // Sign the transaction
      const transaction = new Transaction(transactionObject);
      const signedTransaction = transaction.sign(privateKey);
      console.log('Signed Transaction: ', signedTransaction);
      const serializedTransaction = signedTransaction.serialize();
      console.log('serialized: ', serializedTransaction);

      // Broadcast the transaction to the Ethereum Network (Ganache Network)
      const raw = '0x' + serializedTransaction.toString('hex');
      web3.eth
        .sendSignedTransaction(raw)
        .on('transactionHash', (hash) => {
          console.log('Transaction Hash: ', hash);
        })
        .on('confirmation', (confirmationNumber, receipt) => {
          console.log('Confirmation Number: ', confirmationNumber);
          console.log('Receipt: ', receipt);
        })
        .on('error', (error) => {
          console.log('Error: ', error);
        });
    });

    res.json(output);
  } catch (error) {
    console.log(error);
  }
});

app.listen('10000', () => {
  console.log('Etherium Server Listening at port 10000');
});
