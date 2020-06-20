var TorusOrgs = artifacts.require("./TorusOrgs.sol");

module.exports = function(deployer) {
  deployer.deploy(TorusOrgs);
};
