/*
document.getElementById('sendAtScriptBtn').addEventListener('click', () => {
    // Get the input from the textarea
    const inputText = document.getElementById('atScriptInput').value;
    
    // Split the input text by ";"
    const commandsArray = inputText.split(';');
    
    // Remove any empty strings (in case there's a trailing semicolon)
    const filteredArray = commandsArray.filter(command => command.trim() !== '');
    
    // Function to process commands with delays
    const processCommands = async (commands) => {
        for (const command of commands) {
            if (command.trim().startsWith('delay(') && command.trim().endsWith(')')) {
                // Extract delay time in milliseconds
                const delayTime = parseInt(command.trim().match(/delay\((\d+)\)/)[1], 10);
                await new Promise(resolve => setTimeout(resolve, delayTime));
            } else {
                const trimmedCommand = command.trim(); // Trim whitespace
                console.log(trimmedCommand); // Log the command
                // Send each command to the serial port
                window.serialTerminal.writeToTerminal(trimmedCommand, 'sent');
                window.serialTerminal.sendMessage(trimmedCommand);
            }
        }
    };
    
    // Process the commands
    processCommands(filteredArray);
});
*/
