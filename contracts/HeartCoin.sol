pragma solidity ^0.4.11;

  // ----------------------------------------------------------------------------------------------
  // HeartCoin token contract
  // Gianfranco Oldani
  // ----------------------------------------------------------------------------------------------


  // ERC Token Standard #20 Interface
  contract ERC20Interface {
      // Get the total token supply
      function totalSupply() constant returns (uint256);

      // Get the account balance of another account with address _owner
      function balanceOf(address _owner) constant returns (uint256);

      // Send _value amount of tokens to address _to
      function transfer(address _to, uint256 _value) returns (bool);

      // Send _value amount of tokens from address _from to address _to
      function transferFrom(address _from, address _to, uint256 _value) returns (bool);

      // Allow _spender to withdraw from your account, multiple times, up to the _value amount.
      // If this function is called again it overwrites the current allowance with _value.
      // this function is required for some DEX functionality
      function approve(address _spender, uint256 _value) returns (bool);

      // Returns the amount which _spender is still allowed to withdraw from _owner
      function allowance(address _owner, address _spender) constant returns (uint256);

      // Triggered when tokens are transferred.
      event Transfer(address indexed _from, address indexed _to, uint256 _value,bool retVal);

      // Triggered whenever approve(address _spender, uint256 _value) is called.
      event Approval(address indexed _owner, address indexed _spender, uint256 _value);
  }


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
    function HeartCoin(uint256 totalSupply) {
        _contractOwner              = msg.sender;
        _totalSupply                = totalSupply;
        _balances[_contractOwner]   = _totalSupply;
    }


    function totalSupply() view returns (uint256) {
        return _balances[_contractOwner];
    }

    // What is the balance of a particular account?
    function balanceOf(address accountOwner) view returns (uint256) {
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



/* ================================================= */
  // Allow _spender to withdraw from your account, multiple times, up to the _value amount.
   // If this function is called again it overwrites the current allowance with _value.
   //For the time being due to the fact that the withdrawer is always the bank when a transfer from to
   //is needed, this allowance is not used.
    function approve(address _spender, uint256 _amount) returns (bool) {
        // TODO
        return true;
    }

    function allowance(address _owner, address _spender) constant returns (uint256) {
        return 2^256-1;
    }

    // Function to inactivate the contrac t usage
    function kill() onlyOwner {
        selfdestruct(_contractOwner);
    }

    //Explicite function to send ethers to our contract by explicitely calling this contract function
    function receiveDonation() payable {
    }

    //Fallback function used by default when anybody send ethers to our contract from their wallet
    function () payable {
    }
}
