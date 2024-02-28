const { exec } = require('child_process');

let curlCommand = '';
const RATE_LIMIT_MESSAGE = "request limit reached"

// Exponential backoff parameters
let delay = 2000; // Initial delay (2 seconds)
let backOffDelay = 2000;
const maxDelay = 60000; // Maximum delay (1 minute), I set a max backoff of one minute but this could be removed to attain true exponential backoff
const backoffFactor = 2; // Backoff factor

let intervalId = null; // Variable to hold the interval ID

//MAIN FUNCTIONS
const handleRateLimiting = () => {
    console.log("Rate limit encountered, applying exponential backoff");
    // Clear the interval to prevent further executions
    clearInterval(intervalId);
    //handle exponential backoff
    setTimeout(() => {
        executeCommand(); // Restart the command execution after delay
        // Restart the interval
        intervalId = setInterval(executeCommand, delay);
    }, backOffDelay);
    // Increase delay exponentially
    backOffDelay = Math.min(backOffDelay * backoffFactor, maxDelay);
    console.log("Next retry in " + backOffDelay / 1000 + " seconds");
}

const parseCurlArguments = (cliArguments) => {
    // Skip the first two arguments (node executable and script filename)
    const urlIndex = cliArguments.length - 1;
    let fullUrl = cliArguments[urlIndex]; // get the full url to add quotes to the curl command, seems like process.argv strips them out but they are required

    fullUrl = `"${fullUrl}"`;

    cliArguments = cliArguments.slice(2, urlIndex);
    // Join the arguments into a single string
    curlCommand = cliArguments.join(' ');
    curlCommand += ` ${fullUrl}`;
};

// Function to execute the command and handle the result
const executeCommand = () => {
    exec(curlCommand, (error, stdout, stderr) => {
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);

        if (error !== null) {
            console.log('exec error: ' + error);
            return
        } else {
            // Split the response by double newline characters to separate headers from the body
            const [headers, body] = stdout.split('\r\n\r\n');

            // Extract the JSON string from the body
            const jsonString = body.trim();

            // Parse the JSON string into an object
            const responseObject = JSON.parse(jsonString);

            if (responseObject.error != null) {
                const message = responseObject.error.message
                console.log("response message: " + JSON.stringify(message))
                if (message.includes(RATE_LIMIT_MESSAGE)) {
                    handleRateLimiting()
                }
            } else {
                console.log("Response Body: " + JSON.stringify(responseObject))
            }
        }
    });
};


//MAIN EXECUTION
// Parse curl arguments
parseCurlArguments(process.argv);
console.log("Curl command: " + curlCommand)

// Initial execution of the command
executeCommand();

// Start the interval for regular execution
intervalId = setInterval(executeCommand, delay);
