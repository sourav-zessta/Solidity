const Simple = artifacts.require('SimpleContract');

module.exports = function (deployer) {
  deployer.deploy(Simple);
};

// const Migrations = artifacts.require('Migrations');

// module.exports = function (deployer) {
//   deployer.deploy(Migrations);
// };
