var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
var dnode = require('dnode');
var mysql = require('mysql');

var abiHeart = JSON.parse('[{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_amount","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"totalSupply","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_amount","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"balances","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_value","type":"bool"}],"name":"activateAllowance","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"kill","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"target","type":"address"}],"name":"unFreezeAccount","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"target","type":"address"},{"name":"mintedAmount","type":"uint256"}],"name":"mintToken","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_amount","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"frozenAccount","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"minimumBalanceInFinney","type":"uint256"}],"name":"setMinBalance","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"target","type":"address"},{"name":"freeze","type":"bool"}],"name":"freezeAccount","outputs":[],"payable":false,"type":"function"},{"inputs":[{"name":"totalSupply","type":"uint256"}],"payable":false,"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"target","type":"address"},{"indexed":false,"name":"frozen","type":"bool"}],"name":"FrozenFunds","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"target","type":"address"},{"indexed":false,"name":"theBalance","type":"uint256"}],"name":"OwnerBalanceTooLow","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"},{"indexed":false,"name":"_value","type":"uint256"},{"indexed":false,"name":"retVal","type":"bool"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_spender","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Approval","type":"event"}]');

var addContract = '0xbb24715b7e0d580f93eb97a8c91da9dccad0016c';


function waitForTx(tx_hash, secondsDuration) 
{
      var d = new Date();
      var n = d.getTime()/1000;
      var m = n;
      var result = null;

      // This is not really efficient but nodejs cannot pause the running process
      while(result == null && (m - n < secondsDuration)) 
      {
          result = web3.eth.getTransactionReceipt(tx_hash);
          m = d.getTime()/1000;
      }

      if ( result != null)
        return true;
      else
        return false;
}

function waitForSecs(secondsDuration) 
{
      var d = new Date();
      var n = d.getTime()/1000;
      var m = n;

      // This is not really efficient but nodejs cannot pause the running process
      while(m - n < secondsDuration) 
      {
          m = d.getTime()/1000;
      }

      return;
}


var server = dnode({
    zing: function (n, cb) { cb(n * 200) },

    balance: function(add,cb)
    {    	
		cb(web3.eth.getBalance(add));
    },

  doPay: function(idtrans, forwardUrl, cb)
	{

		//var connection = mysql.createConnection('mysql://root:siberia56@localhost:3306/heartcoinbank?debug=true');
		const connection = mysql.createConnection({
		  host: '127.0.0.1',
		  port : '8889',
		  user: 'root',
		  password: 'siberia56',
		  database: 'heartcoinbank'		  
		});

		console.log(forwardUrl);

    var queryTrans = "select c_type FROM hcb_transaction where id="+idtrans;
    //11
    connection.query(queryTrans, (err,rows) => {
      
      if(err) {connection.end(); throw err;}

      console.log('Data received from Db:\n');
      console.log(rows);

      //11
      rows.forEach( (row) => { 
              var transType = row.c_type;
              var query = "";
              //=================================
              if ( transType == 'V' ) //Transfer of hearts from association to volunteer. a1 is assoc, a2 is volunteer
              {
                query = 'SELECT u1.password as fromPass, u2.password as toPass, a1.chainAddress as adFrom, a2.chainAddress as adTo, t.nHearts as nh FROM hcb_transaction t, hcb_account a1, hcb_account a2, hcb_user u1, hcb_user u2 WHERE t.id='+idtrans+' and t.fromId=a1.ownerId and t.toId=a2.ownerId and u1.partnerId=a1.ownerId and u2.id=a2.ownerId';
                query = 'SELECT u1.password as fromPass, u2.password as toPass, a1.chainAddress as adFrom, a2.chainAddress as adTo, t.nHearts as nh FROM hcb_transaction t, hcb_account a1, hcb_account a2, hcb_user u1, hcb_user u2 ';
                query = query + ' WHERE t.id='+idtrans+' and   a1.ownerId  = t.fromId and   a2.ownerId  = t.toId  and u1.partnerId = t.fromId';
                query = query + ' and  u1.c_role = "A" and   u2.partnerId=a1.ownerId and     u2.id = t.toId';
              }
              else if ( transType == 'R' ) //Volunteer payement of reservation a1 volunteer, a2 partner
              {
                query = 'SELECT u1.password as fromPass, u2.password as toPass, a1.chainAddress as adFrom, a2.chainAddress as adTo, t.nHearts as nh FROM hcb_transaction t, hcb_account a1, hcb_account a2, hcb_user u1, hcb_user u2 WHERE t.id='+idtrans+' and t.fromId=a1.ownerId and t.toId=a2.ownerId and u1.partnerId=a1.ownerId and u2.id=a2.ownerId';
                query = 'SELECT u1.password as fromPass, u2.password as toPass, a1.chainAddress as adFrom, a2.chainAddress as adTo, t.nHearts as nh FROM hcb_transaction t, hcb_account a1, hcb_account a2, hcb_user u1, hcb_user u2 ';
                query = query + ' WHERE t.id='+idtrans+' and  a1.ownerId  = t.fromId and a2.ownerId  = t.toId ';
                query = query + ' and  u1.id = t.fromId';
                query = query + ' and  (u1.c_role = "C" or u1.c_role = "D") ';
                query = query + ' and  u2.partnerId = t.toId ';
                query = query + ' and u2.c_role = "B"';            
              }
              else
              {
                //Error unknown tzransaction type
                connection.end();
                cb(fromAddress,toAddress,amount,forwardUrl,0);
              }


              console.log('QUERY: ' + query);

              //22
              connection.query(query, (err,rows) => {
                  if(err) {connection.end(); throw err;}

                  console.log('Data received from Db:\n');
                  console.log(rows);

                  //22
                  rows.forEach( (row) => { 
                      
                  var fromAddress = row.adFrom; 
                  console.log("FROM ADD: " + fromAddress);
                  var fromPass = row.fromPass;
                  console.log("FROM PASS: " + fromPass);

                  var toAddress = row.adTo; 
                  console.log("TO ADD: " + toAddress);
                  var toPass = row.toPass;
                  console.log("TO PASS: " + toPass);

                  var amount = row.nh;
                  console.log(amount);

                  //retrieve bank account and unlock
                  var queryBank = "SELECT  a.chainAddress FROM hcb_bankaccount a WHERE  a.id=1";
                  console.log(queryBank);

                  //33
                  connection.query(queryBank, (err,rows) => {
              
                  if(err) {connection.end(); throw err;}

                  //33
                  rows.forEach( (row) => { 
                      var bankChain = row.chainAddress;
                      console.log("Bank chain:"+bankChain);
                      console.log("Unlock bank");
                      web3.personal.unlockAccount(bankChain,'bank');

                      console.log("Unlock lender: " + fromAddress + " pass " + fromPass);
                      web3.personal.unlockAccount(fromAddress,fromPass);

                      console.log("Unlock receiver: " + toAddress + " pass: "+toPass);
                      web3.personal.unlockAccount(toAddress,toPass);

                      var HeartCoinContract = web3.eth.contract(abiHeart);

                      var contractInstance = HeartCoinContract.at(addContract);


                        var event = contractInstance.Transfer({retVal: false});

                        var txnHash = contractInstance.transferFrom(fromAddress,toAddress,amount,{from: bankChain});
                        // watch for changes
                        event.watch(function(error, result){
                            if (!error)
                            {
                                console.log('RESULT: '+JSON.stringify(result));

                                if ( result.args.retVal == true )
                                {
                                    console.log("Transaction: " + txnHash);
                                    console.log("Transfer of " + amount + " hearts from " +  fromAddress + " to " + toAddress);

                                    if ( waitForTx(txnHash,20))
                                    {
                                      console.log("SUCCESS");

                                                //=============================
                                      var currentdate = new Date(); 
                                      console.log('DATE: '+currentdate);
                                      var stringRes = JSON.stringify(result);

                                      var queryInsert = "INSERT INTO hcb_chain (name,jsonEventResult,d_cre) values ('doPay','"+stringRes+"','"+currentdate+"')";
                                      console.log(queryInsert);

                                      connection.query(queryInsert, (err,rows) => {                                  
                                                
                                              if(err)
                                              {
                                                  console.log("Query failed", err);
                                                  connection.end(function(err)
                                                  {
                                                    cb(fromAddress,toAddress,amount,forwardUrl,0);
                                                  });
                                              }
                                              else
                                              {
                                                //Disconnect and exit with success.
                                                connection.end(function(err){
                                           
                                                  if(err)
                                                  {
                                                    console.log("Warning: disconnection failed", err);
                                                  }

                                                  cb(fromAddress,toAddress,amount,forwardUrl,0);
                                                });
                                              }                             
                                      });
                                    }
                                    else
                                    {
                                      console.log("FAILURE");
                                      connection.end();
                                      cb(fromAddress,toAddress,amount,forwardUrl,1);
                                      return;
                                    }
                                }
                                else
                                {
                                    console.log("FAILURE: Balance too low");
                                    connection.end();
                                    cb(fromAddress,toAddress,amount,forwardUrl,2); //Balance too low
                                    return;
                                }
                            }

                        });
                  });//33
                });//33
            });//22
          });//22
      });//11
    });//11
	}, //doPay function end

	doFill: function(idReq, forwardUrl,cb)
	{

		//var connection = mysql.createConnection('mysql://root:siberia56@localhost:3306/heartcoinbank?debug=true');
		const connection = mysql.createConnection({
		  host: '127.0.0.1',
		  port : '8889',
		  user: 'root',
		  password: 'siberia56',
		  database: 'heartcoinbank'		  
		});

		connection.connect((err) => {
		  if (err) throw err;
		  console.log('Connected!');
		});

    //ON va chercher les informations nécessaires au traitemen
    // 
    // r.heartsAmount : le nombre de coeur à transférer à l'association
    // a.chainAddress : l'adresse du compte de l'association sur la blockchain
    // u.password : le password avec lequel on a créé le compte de l'association qui est le password de l'administrateur.
    //              !!!!!!! ATTENTION A NE PAS PERDRE !!!!!
    //======================================================
    var query = "SELECT  r.heartsAmount, a.chainAddress, u.password FROM hcb_user u, hcb_assocrequest r, hcb_account a, hcb_partner p  WHERE   r.id="+idReq+" and a.ownerId=r.associationId and p.id=r.associationId and p.c_type='A' and u.partnerId=p.id and u.c_role = 'A'";
		console.log(query);

    connection.query(query, (err,rows) => {
  			
          if(err) {connection.end(); throw err;}

  			   console.log('Data received from Db:\n');
  			   console.log(rows);

  			 rows.forEach( (row) => { 

  			 var amount = row.heartsAmount;
  			 console.log(amount);

  			 var toAddress = row.chainAddress;
  			 console.log("Assoc add:" +toAddress);
         //Unlock account
         assocPass = row.password;
         console.log(row.password);

         //retrieve bank account and unlock
         var queryBank = "SELECT  a.chainAddress FROM hcb_bankaccount a WHERE  a.id=1";
         console.log(queryBank);
         connection.query(queryBank, (err,rows) => {
        
             if(err) {connection.end(); throw err;}

            rows.forEach( (row) => { 

             //Unlock bank
             var bankChain = row.chainAddress;
             console.log("Bank chain:"+bankChain);
             web3.personal.unlockAccount(bankChain,'bank');

             //UNlock associatuion
             console.log("Assoc add:" +toAddress);
             console.log("Assoc pass:" +assocPass);
             web3.personal.unlockAccount(toAddress,assocPass);

             //Do transfer
      			 var HeartCoinContract = web3.eth.contract(abiHeart);

             var contractInstance = HeartCoinContract.at(addContract);

             var txnHash = contractInstance.transfer(toAddress,amount,{from: bankChain});
             console.log("Transaction: " + txnHash);
             console.log("Transfer of " + amount + " hearts from " +  bankChain + " to " + toAddress);

             if ( waitForTx(txnHash,20))
             {
                console.log("SUCCESS");
                connection.end();
                cb(txnHash,forwardUrl);
              }
            else
            {
                console.log("FAILURE");
                connection.end();
                cb(0,forwardUrl);
            }
           });
       });
			});
		});
	},



  doGetBalanceOf: function(idowner, forwardUrl,cb)
  {

    //var connection = mysql.createConnection('mysql://root:siberia56@localhost:3306/heartcoinbank?debug=true');
    const connection = mysql.createConnection({
      host: '127.0.0.1',
      port : '8889',
      user: 'root',
      password: 'siberia56',
      database: 'heartcoinbank'     
    });
    connection.connect((err) => {
      if(err) {connection.end(); throw err;}
      console.log('Connected!');
    });

    connection.query("SELECT a.chainAddress FROM hcb_account a WHERE   a.ownerId="+idowner, (err,rows) => {
        
         if(err) {connection.end(); throw err;}

           console.log('Data received from Db:\n');
           console.log(rows);

         rows.forEach( (row) => { 

         var accountAddress = row.chainAddress;
         console.log('ChainAddress: '+accountAddress);

         var HeartCoinContract = web3.eth.contract(abiHeart);

         var contractInstance = HeartCoinContract.at(addContract);

         var balance = contractInstance.balanceOf.call(accountAddress).toString();
         console.log('Balance: '+balance);

         connection.end(); 
         cb(balance,forwardUrl);
        });
    });
  },

  doCreateUserAccount: function(uid, forwardUrl,cb)
  {
    const connection = mysql.createConnection({
      host: '127.0.0.1',
      port : '8889',
      user: 'root',
      password: 'siberia56',
      database: 'heartcoinbank'     
    });
    connection.connect((err) => {
      if(err) {console.log('NOOTTTT Connected!');;connection.end(); throw err;}
      console.log('Connected!');
    });

    connection.query("SELECT a.password FROM hcb_user a WHERE a.id="+uid, (err,rows) => {
        
            if(err) 
            {
                console.log("Error!!") ; 
                connection.end(); 
                throw err;
            }

          console.log('doCreateUserAccount: Data received from Db:\n');
          console.log(rows);

          rows.forEach( (row) => { 

          var add = web3.personal.newAccount(row.password);
          console.log("Address: " + add);

          //=============================
          var queryUpdate = "UPDATE hcb_account a set a.chainAddress ='"+add+"' where a.ownerId="+uid;
          console.log(queryUpdate);
          connection.query(queryUpdate, (err,rows) => {
              if(err) {throw err;}
              connection.end();
              cb(1,forwardUrl);
          });
        });
    });
  },

  doCreatePartnerAccount: function(uid, forwardUrl,cb)
  {

    //var connection = mysql.createConnection('mysql://root:siberia56@localhost:3306/heartcoinbank?debug=true');
    const connection = mysql.createConnection({
      host: '127.0.0.1',
      port : '8889',
      user: 'root',
      password: 'siberia56',
      database: 'heartcoinbank'     
    });
    connection.connect((err) => {
      if (err) 
      {
          console.log('NOT Connected!'); 
          throw err;
      }
      console.log('Connected!');
    });

    var queryString="SELECT u.password, u.partnerId FROM hcb_user u WHERE u.id="+uid;
    console.log(queryString);
    connection.query(queryString, (err,rows) => {
        
          if(err) {console.log("ERROR ======"); connection.end(); throw err;}

          
          console.log('doCreatePartnerAccount:Data received from Db:\n');
          console.log(rows);

          rows.forEach( (row) => { 

          var add = web3.personal.newAccount(row.password);
          console.log("Address: " + add);

          var pId = row.partnerId;
          console.log("PartnerId: " + pId);
          //=============================
          var queryUpdate = "UPDATE hcb_account a set a.chainAddress ='"+add+"' where a.ownerId="+pId;
          console.log(queryUpdate);
          connection.query(queryUpdate, (err,rows) => {
              if(err) {connection.end(); throw err;}
              connection.end();
              cb(1,forwardUrl);             
          });
          //=============================
        });
    });
  }
});
server.listen(7070);
