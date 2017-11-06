# Heart Coin

HeartCoin smart contract is intended to provide an Ethereum coin used by volunteering associations to reward their volunteers.

It is fully based on the ERC20 interface

Basic specifications:

1. The HeartCoin tokens must  be visible in a standard crypto wallet (then the ERC20 interface usage)

1. It is deployed by the "Banque Du Coeur" association account (Bank Accoun here after) which provides the necessary gas.

1. In order to do coin transfers, end users will use a DAPP interface and do not have to have a crypto wallet with ethers (considered as an blockers for our app. launch...). Then any gas needed must be provided by the Bank Account

1. The transfer needed via the contract are:
   1. From Bank account to Association account for regular feed on association request
   1. From Association account to Volunteer account for rewarding volunteers
   1. From Volunteer account to Merchant account at Merchant patner offer reservation time

1. The contract must launch an event if the bank account become too low in ether.

1. The contract is deployed with an amount of 1000000 coins

1. The contract owner must be able to mint new coins

1. The contract must be able to receive ether as donations

1. At destruction time (kill) the contract must give back to the Bank Account all the donated ethers


## Setup

The project is using truffle based project and is configured as in the [Geneva DevChain](https://github.com/DevchainUserGroup/environment/tree/master/truffle) truffle environment (please refere there for more details).

1. Run testrpc: `make run-testrpc`
2. Compile: `./node_modules/.bin/truffle compile`
3. Deploy: `./node_modules/.bin/truffle deploy`
