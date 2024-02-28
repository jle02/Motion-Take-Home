# Motion-Take-Home

executed index.js with the following command: 

node . curl -i -X GET "https://graph.facebook.com/v19.0/me?fields=id%2Cname%2Clast_name&access_token=<YOUR_ACCESS_TOKEN_HERE>"

Alternatively could have just hardcoded the curl command and have just the access token be the only cli argument, but I chose to have that more open ended so that we can trigger other curl commands to facebook if we wish