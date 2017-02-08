import { log } from './log'; 
import 'rxjs/add/operator/map';
import {Observable} from 'rxjs/Observable';

export class sql {
  

  constructor() { }
  

  open(name:string) { 

      return new Promise(function(resolve, reject) { 

        try 
        {

            var requestCallback = function(response)
            {
                var resp = {} as any; 
                 resp.message = response.message;
                 resp.data = response.data; 
                 resp.pid = response.pid; 

                if(response.error)
                {
                    reject(resp); 
                }
                else
                {
                    resolve(resp); 
                }
            }
            console.log('====>'+typeof requestCallback); 
            eval("atajo.sql.open(name, requestCallback)"); 

        } 
        catch(e)
        {
            reject(e); 
        }

      })
      

  }; 

  close() { 

      return new Promise(function(resolve, reject) { 

        try 
        {

            var response = function(response)
            {
                var resp = {message:response.message, data:response.data, pid:response.pid}; 
                if(response.error)
                {
                    reject(resp); 
                }
                else
                {
                    resolve(resp); 
                }
            }

            eval("atajo.sql.close(response)"); 

        } 
        catch(e)
        {
            reject(e); 
        }

      })



  };


  get(name:string, query:string, parameters:Object[]) { 
      
       return new Promise(function(resolve, reject) { 

        try 
        {
            eval("atajo.sql.get(name, query, parameters).then(function(response) { resolve(response);  }).catch(function(response) { reject(response); })"); 

        } 
        catch(e)
        {
            reject(e); 
        }

      })

    

  } 

  exec(query:string, parameters:string[]) { 

      return new Promise(function(resolve, reject) { 

        try 
        {

            var queryResponse = function(response)
            {
                var resp = {message:response.message, data:response.data, pid:response.pid}; 
                if(response.error)
                {
                    reject(resp); 
                }
                else
                {
                    resolve(resp); 
                }
            }

            var transactionResponse = function(response)
            {
                var resp = {message:response.message, data:response.data, pid:response.pid}; 
                if(response.error)
                {
                    reject(resp); 
                }
                else
                {
                    resolve(resp); 
                }
            }

            eval("atajo.sql.exec(query, parameters, queryResponse, transactionResponse)"); 

        } 
        catch(e)
        {
            reject(e); 
        }

      })



  };


  batch(queries:string[]) { 

      return new Promise(function(resolve, reject) { 

        try 
        {

           
            var transactionResponse = function(response)
            {
                var resp = {message:response.message, data:response.data, pid:response.pid}; 
                if(response.error)
                {
                    reject(resp); 
                }
                else
                {
                    resolve(resp); 
                }
            }

            eval("atajo.sql.batch(queries, transactionResponse)"); 

        } 
        catch(e)
        {
            reject(e); 
        }

      }); 



  };

  //    fetchDatabase: function(name, handler, requestObj, requestCallback) {
  fetchDatabase(name:string, handler:string, requestObject:Object) { 

      return new Promise(function(resolve, reject) { 

        try 
        {

           
            var transactionResponse = function(response)
            {
                

                var resp = {message:response.message, data:response.data, pid:response.pid}; 
                if(response.error)
                {
                    reject(resp); 
                }
                else
                {
                    resolve(resp); 
                }
            }

            eval("atajo.sql.fetchDatabase(name, handler, requestObject, transactionResponse)"); 

        } 
        catch(e)
        {
            reject(e); 
        }

      }); 



  };




}
