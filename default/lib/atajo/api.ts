import { sim } from './lib/sim'; 
import { log } from './lib/log'; 
import { events } from './lib/events'; 
import { sql } from './lib/sql'; 


export class atajo {
  

  constructor() { }

  static log = new log();        
  static sim = new sim();    
  static events = new events();     
  static sql = new sql();     

  

}
