const cron= require('node-cron');
//learning cronjob 


cron.schedule("00 */5 * * * *",()=>{
    console.log("hello000");
})