/* global web3 */

var HeartCoin = artifacts.require('HeartCoin')

module.exports = function (deployer, network) {
  return deployer.deploy(HeartCoin, 1e8)
}
