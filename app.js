const axios=require("axios");
const qs= require("qs");
require('dotenv').config()

let lastView=0;

const updateTitle =(async()=>{

    // get the new accesstoken from refreshtoken everytime the code runs
    let res1= await axios
        .post(
            'https://oauth2.googleapis.com/token',
            qs.stringify({
                refresh_token:process.env.refreshToken,
                grant_type:'refresh_token'
            }),
            {
                auth:{
                    username:process.env.clientID,
                    password:process.env.clientSecret
                }
            }
        )
    const token=res1.data.access_token;
    // console.log(token);



    //get the video stats... it's views and also the categoryId, description and tags
    // On put request.. the route require categoryId , title , desc and tags to be updated... so we will provide new title and remaining 3 will be same

    let res2=await axios
        .get(
            "https://www.googleapis.com/youtube/v3/videos",
            {
                params:{
                    id:"uMKs5uB076U",
                    part:"snippet,statistics",
                    key:process.env.YTUBE_API_KEY,
                }
            },
        );

        let data= res2.data.items[0];
        let {categoryId, title,description,tags}=data.snippet;
        let {viewCount}=data.statistics;
        // console.log(data);

        

    // update the title only if the view count increases.... this will save api calls!

        if(lastView!==viewCount){

            await axios
            .put(
                'https://www.googleapis.com/youtube/v3/videos?part=snippet',
                {
                    id:"uMKs5uB076U",
                    snippet:{
                        categoryId,
                        description,
                        tags,
                        title:`This video has ${viewCount} views`,
                    }
                },
                {
                    headers:{
                        authorization:'Bearer '+token
                    }
                }
            )

            // log for pm2 monitor
            console.log("Video title updated from " +lastView+ " to "+ viewCount);
            lastView=viewCount;


        }else{
            console.log("Title was not updated")
        }

        


});


// run the code when the script first runs... on reload or someother condition
updateTitle();

const cron = require('node-cron');

// will update the views every min
cron.schedule("00 */1 * * * *",()=>{
    updateTitle();
})




