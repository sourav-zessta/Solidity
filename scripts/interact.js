const simpleContract = artifacts.require('SimpleContract.sol');

module.exports = async function (callback) {
  try {
    const contractInstance = await simpleContract.deployed();

    console.log('Result:', contractInstance);
    callback();
  } catch (error) {
    console.error(error);
    callback();
  }
};
