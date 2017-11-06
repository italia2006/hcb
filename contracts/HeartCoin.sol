pragma solidity ^0.4.17;

import "./ERC20.sol";


// The goal of this contract is to implement an ethereum smart contract token used to reward and labelize
// volunteers actions.
// The owner of the contract is the only actor which is allowed to transfer tokens from one account to another
// Then the contract owner is the only stakeholder which needs to own an ethereum wallet filled with ethers
// Any other stakeholder (Volunteer, Association, Merchant partnmers do not need it. They even do not have to know
// that there is a blockchain smartcontract acting behind.
contract HeartCoin is ERC20Interface {
    //=====================
    //Contract data section
    //=====================

    // Owner of this contract
    address public          _contractOwner;

    string public constant  _symbol                      = "HCT";
    string public constant  _name                        = "HeartCoin Currency Token";
    uint8 public constant   _decimals                    = 2;
    uint256                 _totalSupply                 = 0; //BY efault no supply. Will be provided at construction time
    uint256                 _minEtherBalanceForBank      = 1; //Ether

    // Balances for each stakeholder account
    mapping(address => uint256) public _balances;

   // Functions with this modifier can only be executed by the owner
    modifier onlyOwner() {
        require(msg.sender == _contractOwner);
        _;
    }

    //=========================
    //Contract triggered events
    //=========================
    event ContractOwnerEthersTooLow(address target, uint256 theBalance, bool retval);
    event TokensSupplyTooLow(address from,address target, uint256 theBalance,bool retval);
    event FromBalanceTooLow(address from, address to,  uint256 theBalance,bool retval);

    // Contract Constructor
    function HeartCoin(uint256 totalSupply) public {
        _contractOwner              = msg.sender;
        _totalSupply                = totalSupply;
        _balances[_contractOwner]   = _totalSupply;
    }


    function totalSupply() public view returns (uint256) {
        return _balances[_contractOwner];
    }

    // What is the balance of a particular account?
    function balanceOf(address accountOwner) public view returns (uint256) {
        return _balances[accountOwner];
    }

    //Transfer the balance from contract owner (bank) to a stakeholder account
    //The onlyOwner modifyer ensures that the transfer is only triggerable by the contract owner
    function transfer(address to, uint256 amount) public onlyOwner returns (bool) {
        //Verify that the contract owner is not going to low in ether....i.e. not spending tto much for stakeholders transfers
        if ( _contractOwner.balance < _minEtherBalanceForBank ) {
            ContractOwnerEthersTooLow(_contractOwner,_contractOwner.balance,true);
            revert();
        }

        if (_balances[_contractOwner] >= amount && amount > 0 ) {
            _balances[_contractOwner] -= amount;
            _balances[to]             += amount;

            Transfer(_contractOwner, to, amount,true);
            return true;
        }

        TokensSupplyTooLow(_contractOwner, to, amount,false);
        return false;
    }

    // Send _value amount of tokens from address from to address to
    // The transferFrom method is used for a withdraw workflow, allowing contracts to send
    // tokens on your behalf, for example to "deposit" to a contract address and/or to charge
    // fees in sub-currencies; the command should fail unless the _from account has
    // deliberately authorized the sender of the message via some mechanism; we propose
    // these standardized APIs for approval:
    //
    // The onlyOwner reference is to ensure that only the bank will pay fees fro the HeartCoin
    // transfers. In a later run if there are too much fees, we can see how the bank can be payed
    // by the caller.
    function transferFrom(address from, address to,uint256 amount) public onlyOwner returns (bool) {
        require(from != address(0x0));
        require(to != address(0x0));

        if ( amount > 0 && _balances[from] >= amount ) {
            _balances[from]            -= amount;
            _balances[to]              += amount;
            Transfer(from, to, amount,true);
            return true;
        }

        FromBalanceTooLow(from, to, amount,false);
        return false;
    }


    function mintToken(uint256 mintedAmount) public onlyOwner {
        _balances[_contractOwner] += mintedAmount;
        _totalSupply += mintedAmount;
    }



    // Allow _spender to withdraw from your account, multiple times, up to the _value amount.
    // If this function is called again it overwrites the current allowance with _value.
    // For the time being due to the fact that the withdrawer is always the bank when a transfer from to
    // is needed, this allowance is not used.
    function approve(address _spender, uint256 _amount) public returns (bool) {
        // TODO
        return true;
    }

    function allowance(address _owner, address _spender) public view returns (uint256) {
        if (_spender == _contractOwner)
            return _balances[_owner];
        return 0;
    }

    // Function to inactivate the contrac t usage
    function kill() private onlyOwner {
        selfdestruct(_contractOwner);
    }

    //Explicite function to send ethers to our contract by explicitely calling this contract function
    function receiveDonation() public payable {
    }

    //Fallback function used by default when anybody send ethers to our contract from their wallet
    function () public payable {
    }
}
