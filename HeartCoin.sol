pragma solidity ^0.4.11;
   
  // ----------------------------------------------------------------------------------------------
  // Sample fixed supply token contract
  // Enjoy. (c) BokkyPooBah 2017. The MIT Licence.
  // ----------------------------------------------------------------------------------------------
   
  // ERC Token Standard #20 Interface
  // https://github.com/ethereum/EIPs/issues/20
  contract ERC20Interface {
      // Get the total token supply
      function totalSupply() constant returns (uint256 totalSupply);
   
      // Get the account balance of another account with address _owner
      function balanceOf(address _owner) constant returns (uint256 balance);
   
      // Send _value amount of tokens to address _to
      function transfer(address _to, uint256 _value) returns (bool success);
   
      // Send _value amount of tokens from address _from to address _to
      function transferFrom(address _from, address _to, uint256 _value) returns (bool success);
   
      // Allow _spender to withdraw from your account, multiple times, up to the _value amount.
      // If this function is called again it overwrites the current allowance with _value.
      // this function is required for some DEX functionality
      function approve(address _spender, uint256 _value) returns (bool success);
   
      // Returns the amount which _spender is still allowed to withdraw from _owner
      function allowance(address _owner, address _spender) constant returns (uint256 remaining);
   
      // Triggered when tokens are transferred.
      event Transfer(address indexed _from, address indexed _to, uint256 _value,bool retVal);
   
      // Triggered whenever approve(address _spender, uint256 _value) is called.
      event Approval(address indexed _owner, address indexed _spender, uint256 _value);
  }
   
contract HeartCoin is ERC20Interface 
 {
   string public constant symbol 	  = "HCC";
   string public constant name 		 = "HeartCoin Currency Token";
   uint8 public constant decimals 	= 2;
   uint256 _totalSupply 			       = 0;
   uint256 	minBalanceForAccounts	  = 5; //Ether
   uint256	minEtherBalanceForBank	= 1; //Ether
   bool     allowanceActive         = false;
   // Owner of this contract
   address public owner;
 
 	mapping (address => bool) public frozenAccount;

  // Balances for each account
   mapping(address => uint256) public balances;
 
  // Owner of account approves the transfer of an amount to another account
   mapping(address => mapping (address => uint256)) allowed;
 
  // Functions with this modifier can only be executed by the owner
   modifier onlyOwner() 
   {
       if (msg.sender != owner) {
           throw;
       }
       _;
   }
 
 	// Other events
 	event FrozenFunds(address target, bool frozen);
 	event OwnerBalanceTooLow(address target, uint256 theBalance);

  // Constructor
   function HeartCoin(uint256 totalSupply) {
       owner 			       = msg.sender;
       _totalSupply 	   = totalSupply;
       balances[owner] 	 = _totalSupply;
   }
 
  function totalSupply() constant returns (uint256 totalSupply) {
       totalSupply = _totalSupply;
   }
 
  // What is the balance of a particular account?
   function balanceOf(address _owner) constant returns (uint256 balance) {
       return balances[_owner];
   }
 
  // Transfer the balance from owner's account to another account
  //The onlyOwner reference is to be sure that the oneway transfer is only made from the
  //HeartCoin owner (bank) to another stakeholder
   function transfer(address _to, uint256 _amount) onlyOwner returns (bool success) 
   {
      //Verify that we are not going to low in ether....i.e. the bank is not
      //spending tto much for stakeholders transfers
   		if ( owner.balance < minEtherBalanceForBank ) 
   		{
   			OwnerBalanceTooLow(owner,owner.balance);
   			throw;
   		}

    	if (frozenAccount[msg.sender])
      {
          FrozenFunds(msg.sender,true);
          throw; 
      }

       if (balances[msg.sender] >= _amount && _amount > 0 ) 
       {
           balances[msg.sender] -= _amount;
           balances[_to]        += _amount;

           Transfer(msg.sender, _to, _amount,true);
           return true;
       } 

       Transfer(msg.sender, _to, _amount,false);
       return false;
   }
 
  // Send _value amount of tokens from address _from to address _to
   // The transferFrom method is used for a withdraw workflow, allowing contracts to send
   // tokens on your behalf, for example to "deposit" to a contract address and/or to charge
   // fees in sub-currencies; the command should fail unless the _from account has
   // deliberately authorized the sender of the message via some mechanism; we propose
   // these standardized APIs for approval:
   //
   // The onlyOwner reference is to ensure that only the bank will pay fees fro the HeartCoin 
   // transfers. In a later run if there are too much fees, we can see how the bank can be payed
   // by the caller.
   function transferFrom(
       address _from,
       address _to,
       uint256 _amount
   ) onlyOwner returns (bool success) 
   {
   		if (frozenAccount[_from]) throw;

      if ( _amount > 0 && balances[_from] >= _amount ) 
      {
          if ( allowanceActive == false )
          {
             balances[_from]            -= _amount;
             balances[_to]              += _amount;         
             Transfer(_from, _to, _amount,true);
             return true;
          }
          else
          {
              if (allowed[_from][msg.sender] >= _amount )  
              {
                   balances[_from]            -= _amount;
                   balances[_to]              += _amount;
                   allowed[_from][msg.sender] -= _amount;           
                   Transfer(_from, _to, _amount,true);
                   return true;
              } 
          }
      }

      Transfer(_from, _to, _amount,false);
      return false;
   }
 

   function mintToken(address target, uint256 mintedAmount) onlyOwner
   {
	    balances[target] 	+= mintedAmount;
	    _totalSupply 		  += mintedAmount;

	    Transfer(0, owner, mintedAmount,true);
	    Transfer(owner, target, mintedAmount,true);
	}


	function freezeAccount(address target, bool freeze) onlyOwner 
	{
	    frozenAccount[target] = freeze;
	    FrozenFunds(target, freeze);
	}

	function unFreezeAccount(address target) onlyOwner 
	{
	    freezeAccount(target,false);
	}


	function setMinBalance(uint minimumBalanceInFinney) onlyOwner 
	{
     	minBalanceForAccounts = minimumBalanceInFinney * 1 finney;
	}

/* ================================================= */
  // Allow _spender to withdraw from your account, multiple times, up to the _value amount.
   // If this function is called again it overwrites the current allowance with _value.
   //For the time being due to the fact that th withdrawer is always the bank when a transfer from to
   //is needed, this allowance is not used. Tere is the activateAllowance function to activate this
   //behaviour if needed
   function approve(address _spender, uint256 _amount) returns (bool success) 
   {
      if ( allowanceActive )
      {
       allowed[msg.sender][_spender] = _amount;
       Approval(msg.sender, _spender, _amount);
      }
       return true;
   }
 
  function allowance(address _owner, address _spender) constant returns (uint256 remaining) 
  {
       if ( allowanceActive )
        return allowed[_owner][_spender];
       else
        return 2^256-1;
   }

   function activateAllowance(bool _value) onlyOwner
   {
      allowanceActive = _value;
   }
/* Function to recover the funds on the contract */
    function kill() onlyOwner { if (msg.sender == owner) suicide(owner); }
}