# Heart Coin

HeartCoin smart contract is intended to provide an Ethereum coin used by volunteering associations to reward their volunteers.

It is fully based on the ERC20 interface

Main specificatio:

1) The HeartCoin tokens must  be visible in a standard crypto wallet (then the ERC20 interface usage)

2) It is deployed by the "Banque Du Coeur" association account (Bank Account) here after which provides the necessary gas. 

3) In order to do coin transfers, end users will use a DAPP interface and do not have to have a crypto wallet with ethers (considered as an blockers our app. launch...). Then any gas needed must be provided by the Bank Account
   
4) The transfer needed via the contract are

  a) From Bank account to Association account for regular feed on association request
  b) From Association account to Volunteer account for rewarding volunteers
  c) From Volunteer account to Merchant account at Merchant patner offer reservation time
  
5) The contract must launch an event if the bank account become too low in ether.

6) The contract is deployed with an amount of 1000000 coins

7) The contract owner must be able to mint new coins

8) The contract must be able to receive ether as donations



