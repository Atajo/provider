import { log } from './log'; 


export class sim {
  


  constructor() { }

  info() { 

      return new Promise(function(resolve, reject) { 

        try {

            eval("atajo.sim.getSimInfo(resolve, reject)"); 

        } 
        catch(e)
        {
            reject(e); 
        }



      })
      

  }



}
