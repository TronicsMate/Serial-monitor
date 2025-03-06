class SerialTerminal {
    constructor() {
        this.port = null;
        this.reader = null;
        this.keepReading = false;
        this.signals = { dtr: true, rts: true };
        this.showTimestamp = true;
        this.autoscroll = true;
        this.scriptRunning = false; // Declare isRunning inside the class

        // UI Elements
        this.connectBtn = document.getElementById('connectBtn');
        this.baudRate = document.getElementById('baudRate');
        this.messageInput = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.terminal = document.getElementById('terminal');
        this.clearBtn = document.getElementById('clearBtn');
        this.dtrControl = document.getElementById('dtrControl');
        this.rtsControl = document.getElementById('rtsControl');
        this.showTimestampControl = document.getElementById('showTimestamp');
        this.autoscrollControl = document.getElementById('autoscroll');
        this.atCommandInput = document.getElementById('atCommandInput');
        this.sendAtScriptBtn = document.getElementById('sendAtScriptBtn');
        this.stopAtScriptBtn = document.getElementById('stopScriptBtn');

        // Check Web Serial API support
        if (!('serial' in navigator)) {
            this.writeToTerminal('Web Serial API is not supported in your browser. Please use Chrome or Edge.', 'error');
            this.connectBtn.disabled = true;
        }

        // Bind event listeners
        this.connectBtn.addEventListener('click', () => this.toggleConnection());
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
        this.clearBtn.addEventListener('click', () => this.clearTerminal());
        this.dtrControl.addEventListener('change', () => this.updateSignals());
        this.rtsControl.addEventListener('change', () => this.updateSignals());
        this.showTimestampControl.addEventListener('change', () => {
            this.showTimestamp = this.showTimestampControl.checked;
            this.writeToTerminal(`Timestamps ${this.showTimestamp ? 'enabled' : 'disabled'}`, 'system');
        });
        this.autoscrollControl.addEventListener('change', () => {
            this.autoscroll = this.autoscrollControl.checked;
            this.writeToTerminal(`Auto-scroll ${this.autoscroll ? 'enabled' : 'disabled'}`, 'system');
        });
        
        this.sendAtScriptBtn.addEventListener('click', () => this.excuteATScript());
        this.stopAtScriptBtn.addEventListener('click', () => this.stopScript());

        // Disable input until connected
        this.messageInput.disabled = true;
        this.sendBtn.disabled = true; // Disable the original send button
        
        // Welcome message
        this.writeToTerminal('Welcome to the Web Serial Terminal', 'system');
        this.writeToTerminal('Click "Connect" to begin communication with your device', 'system');

        // Add AT Scripts setup
        this.setupATScripts();

        // Initialize event listeners
        this.initializeEventListeners();

        const sendAtCommandBtn = document.getElementById('sendAtCommandBtn');
        if (sendAtCommandBtn) {
            sendAtCommandBtn.addEventListener('click', () => {
                // Get the input from the textarea
                const inputText = document.getElementById('atCommandInput').value;
                
                // Send command
                this.writeToTerminal(inputText, 'sent');
                this.sendMessage(inputText);
            });
        }
    }

    writeToTerminal(message, type = '', isHtml = false) {
        // Create a new message element
        const msgElement = document.createElement('p');
        
        // Add timestamp if enabled
        if (this.showTimestamp) {
            const now = new Date();
            const timestamp = this.formatTime(now);
            
            const timestampSpan = document.createElement('span');
            timestampSpan.classList.add('timestamp');
            timestampSpan.textContent = `[${timestamp}]`;
            msgElement.appendChild(timestampSpan);
        }
        
        // Create the message span with type-based color
        const messageSpan = document.createElement('span');
        if (type) {
            messageSpan.classList.add(type);
        }
        
        // Add appropriate prefix based on message type
        let prefix = '';
        switch(type) {
            case 'sent':
                prefix = ' > ';
                break;
            case 'received':
                prefix = ' < ';
                break;
            case 'error':
                prefix = ' ! ';
                break;
            case 'system':
                prefix = ' # ';
                break;
            default:
                prefix = ' ';
        }
        
        // Set message content
        if (isHtml) {
            messageSpan.innerHTML = prefix + message;
        } else {
            messageSpan.textContent = prefix + message;
        }
        
        msgElement.appendChild(messageSpan);
        
        // Add the message to the terminal
        this.terminal.appendChild(msgElement);
        
        // Auto-scroll if enabled
        if (this.autoscroll) {
            this.terminal.scrollTop = this.terminal.scrollHeight;
        }
        
        // Also log to console for debugging
        console.log(`${type}: ${message}`);
    }
    
    formatTime(date) {
        return [
            date.getHours().toString().padStart(2, '0'),
            date.getMinutes().toString().padStart(2, '0'),
            date.getSeconds().toString().padStart(2, '0')
        ].join(':');
    }

    async connect() {
        try {
            this.port = await navigator.serial.requestPort();
            await this.port.open({
                baudRate: parseInt(this.baudRate.value),
                dataBits: 8,
                stopBits: 1,
                parity: "none",
                flowControl: "none"
            });

            this.connectBtn.textContent = 'Disconnect';
            this.baudRate.disabled = true;
            this.messageInput.disabled = false;
            this.sendBtn.disabled = false;
            
            await this.updateSignals();
            this.writeToTerminal('Connected to serial port', 'system');
            
            this.keepReading = true;
            this.readLoop();
        } catch (error) {
            if (error.name === 'NotFoundError') {
                this.writeToTerminal('No device selected', 'error');
            } else if (error.name === 'SecurityError') {
                this.writeToTerminal('Permission to access serial port was denied', 'error');
            } else {
                this.writeToTerminal(`Connection error: ${error.message}`, 'error');
            }
        }
    }

    async disconnect() {
        this.keepReading = false;
        
        if (this.reader) {
            try {
                await this.reader.cancel();
            } catch (error) {
                console.error('Error cancelling reader:', error);
            }
        }
        
        if (this.port) {
            try {
                await this.port.close();
            } catch (error) {
                console.error('Error closing port:', error);
            }
            this.port = null;
        }
        
        // Reset only connection-related states
        this.reader = null;
        
        // Reset UI elements related to connection
        this.connectBtn.textContent = 'Connect';
        this.baudRate.disabled = false;
        this.messageInput.disabled = true;
        this.sendBtn.disabled = true;
        
        // Reset signals
        this.signals = { dtr: true, rts: true };
        this.dtrControl.checked = true;
        this.rtsControl.checked = true;
        
        // Write disconnection message
        this.writeToTerminal('Serial port disconnected. Click "Connect" to reconnect.', 'system');
    }

    async toggleConnection() {
        if (this.port) {
            await this.disconnect();
        } else {
            await this.connect();
        }
    }

    async readLoop() {
        try {
            while (this.port?.readable && this.keepReading) {
                this.reader = this.port.readable.getReader();
                
                const textDecoder = new TextDecoder();
                let buffer = '';
                
                while (true) {
                    const { value, done } = await this.reader.read();
                    
                    if (done) {
                        break;
                    }
                    
                    // Decode the received data and add to buffer
                    const text = textDecoder.decode(value);
                    buffer += text;
                    
                    // Process complete lines
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || ''; // Keep the last incomplete line in the buffer
                    
                    for (const line of lines) {
                        if (line.trim()) {
                            this.writeToTerminal(line.trim(), 'received');
                        }
                    }
                }
            }
        } catch (error) {
            // Specific error handling
            let errorMessage = 'Serial port disconnected';
            
            // Provide more specific error messages
            switch (error.name) {
                case 'NetworkError':
                    errorMessage = 'Network error: Device connection lost';
                    break;
                case 'AbortError':
                    errorMessage = 'Connection aborted unexpectedly';
                    break;
                default:
                    errorMessage = `Serial error: ${error.message}`;
            }
            
            // Write error to terminal
            this.writeToTerminal(errorMessage, 'error');
            
            // Reset connection-specific state
            await this.disconnect();
        } finally {
            if (this.reader) {
                this.reader.releaseLock();
            }
        }
    }

    findCommandDescription(command) {
        // Try to find the command in the predefined commands
        const commandManager = window.commandManager; // Assuming CommandManager is globally accessible
        if (commandManager && commandManager.commands) {
            const matchedCommand = commandManager.commands.find(cmd => 
                cmd.value.trim().toLowerCase() === command.trim().toLowerCase()
            );
            
            return matchedCommand ? matchedCommand.description : null;
        }
        return null;
    }

    async sendMessage(message = null) {
        if (!this.port) return;
        
        // If no message provided, use input field
        const messageToSend = message || this.messageInput.value.trim();
        if (!messageToSend) return;
        
        try {
            const writer = this.port.writable.getWriter();
            const encoder = new TextEncoder();
            
            // Get the selected line ending
            const lineEnding = document.querySelector('input[name="lineEnding"]:checked').value;
            const fullMessage = messageToSend + eval(`"${lineEnding}"`);
            
            await writer.write(encoder.encode(fullMessage));
            writer.releaseLock();
            
            // Find description if available
            const description = this.findCommandDescription(messageToSend);
            
            // Write sent message with description (if available)
            const displayMessage = description 
                ? `${messageToSend} <span class="comment">// ${description}</span>` 
                : messageToSend;
            this.writeToTerminal(displayMessage, 'sent', true);
            
            // Only clear input if using input field
            if (!message) {
                this.messageInput.value = '';
            }

            return fullMessage; // Return for script usage
        } catch (error) {
            this.writeToTerminal(`Send error: ${error.message}`, 'error');
            throw error; // Rethrow for script error handling
        }
    }

    async runATScript(commands) {
        if (!this.port || !this.port.writable) {
            this.writeToTerminal('Please connect to a serial port first', 'error');
            return;
        }

        const writer = this.port.writable.getWriter();
        const textEncoder = new TextEncoder();

        try {
            for (const command of commands) {
                // Add line ending
                const commandWithLineEnding = command + '\r';
                
                // Send command
                await writer.write(textEncoder.encode(commandWithLineEnding));
                
                // Find description if available
                const description = this.findCommandDescription(command);
                
                // Write sent message with description (if available)
                const displayMessage = description 
                    ? `${command} <span class="comment">// ${description}</span>` 
                    : command;
                this.writeToTerminal(displayMessage, 'sent', true);

                // Wait for 1000ms between commands
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        } catch (error) {
            this.writeToTerminal(`Error running script: ${error.message}`, 'error');
        } finally {
            writer.releaseLock();
        }
    }

    async updateSignals() {
        if (!this.port) return;
        
        this.signals.dtr = this.dtrControl.checked;
        this.signals.rts = this.rtsControl.checked;
        
        try {
            await this.port.setSignals(this.signals);
            this.writeToTerminal(`Signals updated - DTR: ${this.signals.dtr}, RTS: ${this.signals.rts}`, 'system');
        } catch (error) {
            this.writeToTerminal(`Error setting signals: ${error.message}`, 'error');
        }
    }

    clearTerminal() {
        this.terminal.innerHTML = '';
        this.writeToTerminal('Terminal cleared', 'system');
    }

    setupATScripts() {
        const scriptButtons = document.querySelectorAll('.btn-script');
        scriptButtons.forEach(button => {
            button.addEventListener('click', () => {
                const commands = JSON.parse(button.getAttribute('data-script'));
                this.runATScript(commands);
            });
        });
    }

    copyTerminalToClipboard() {
        const terminalContent = this.terminal.innerText;
        
        // Create a temporary textarea to copy text
        const tempTextArea = document.createElement('textarea');
        tempTextArea.value = terminalContent;
        document.body.appendChild(tempTextArea);
        
        // Select and copy the text
        tempTextArea.select();
        document.execCommand('copy');
        
        // Remove the temporary textarea
        document.body.removeChild(tempTextArea);
        
        // Optional: Provide user feedback (you could add a toast or temporary message)
        this.writeToTerminal('Terminal content copied to clipboard', 'info');
    }

    initializeEventListeners() {
        const copyTerminalBtn = document.getElementById('copyTerminalBtn');
        if (copyTerminalBtn) {
            copyTerminalBtn.addEventListener('click', () => {
                this.copyTerminalToClipboard();
            });
        }
        
        const sendAtCommandBtn = document.getElementById('sendAtCommandBtn');
        if (sendAtCommandBtn) {
            sendAtCommandBtn.addEventListener('click', () => {
                const command = this.atCommandInput.value.trim();
                if (command) {
                    this.writeToTerminal(command, 'sent');
                    this.sendMessage(command);
                    this.atCommandInput.value = ''; // Clear input after sending
                }
            });
        }
    }

    sendAtCommand() {
        const command = this.atCommandInput.value.trim();
        if (command) {
            this.writeToTerminal(command, 'sent');
            this.sendMessage(command);
            this.atCommandInput.value = ''; // Clear input after sending
        }
    }
    
    excuteATScript() {
        
        const inputText = document.getElementById('atScriptInput').value;
        const commandsArray = inputText.split(';');
        const filteredArray = commandsArray.filter(command => command.trim() !== '');
        const runLoop = document.getElementById('runLoopCheckbox').checked;
        
        this.scriptRunning = true; // Set running state
        
        const processCommands = async (commands) => {
            for (const command of commands) {
                if (!this.scriptRunning) break; // Stop execution if not running
                if (command.trim().startsWith('delay(') && command.trim().endsWith(')')) {
                    const delayTime = parseInt(command.trim().match(/delay\((\d+)\)/)[1], 10);
                    await new Promise(resolve => setTimeout(resolve, delayTime));
                } else {
                    const trimmedCommand = command.trim();
                    console.log(trimmedCommand);
                    this.writeToTerminal(trimmedCommand, 'sent');
                    this.sendMessage(trimmedCommand);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
            if (runLoop && this.scriptRunning) {
                processCommands(commands); // Restart the process if loop is checked
            }
        };
        
        processCommands(filteredArray);
    }

    stopScript() {
        this.scriptRunning = false; // Set running state to false
        console.log('Script stopped');
    }

    pasteScript(script) {
        const atScriptInput = document.getElementById('atScriptInput');
        atScriptInput.value += script + '\n'; // Append the script to the textarea
    }
}

// Initialize the terminal
const serialTerminal = new SerialTerminal();
