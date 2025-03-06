// Initialize components
let serialHandler;
let commandManager;

document.addEventListener('DOMContentLoaded', function() {
    serialHandler = new SerialHandler();
    commandManager = new CommandManager();

    // Setup event listeners
    setupEventListeners();
    
    // Initialize search debounce
    const searchBox = document.getElementById('searchBox');
    let debounceTimeout;
    searchBox.addEventListener('input', function() {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            const query = this.value;
            const filteredCommands = commandManager.searchCommands(query);
            commandManager.renderCommands(filteredCommands);
        }, 300);
    });
});

function setupEventListeners() {
    // Connect/Disconnect button
    document.getElementById('connectButton').addEventListener('click', async function() {
        if (!serialHandler.port) {
            const success = await serialHandler.connect();
            if (success) {
                this.textContent = 'Disconnect';
                this.classList.replace('btn-primary', 'btn-danger');
            }
        } else {
            await serialHandler.disconnect();
            this.textContent = 'Connect';
            this.classList.replace('btn-danger', 'btn-primary');
        }
    });

    // Send command button
    document.getElementById('sendButton').addEventListener('click', function() {
        const commandInput = document.getElementById('commandInput');
        const command = commandInput.value.trim();
        if (command) {
            serialHandler.sendCommand(command);
            commandInput.value = '';
        }
    });

    // Command input enter key
    document.getElementById('commandInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            document.getElementById('sendButton').click();
        }
    });

    // Add command form
    document.getElementById('addCommandForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const newCommand = {
            name: document.getElementById('commandName').value,
            command: document.getElementById('commandText').value,
            description: document.getElementById('commandDescription').value,
            category: document.getElementById('commandCategory').value,
            manufacturer: document.getElementById('commandManufacturer').value
        };
        commandManager.addCommand(newCommand);
        this.reset();
    });
}

// Command actions
function sendCommand(command) {
    if (serialHandler.port) {
        serialHandler.sendCommand(command);
    } else {
        alert('Please connect to a serial port first');
    }
}

function deleteCommand(index) {
    if (confirm('Are you sure you want to delete this command?')) {
        commandManager.deleteCommand(index);
    }
}

function editCommandForm(index) {
    const commands = commandManager.getAllCommands();
    const command = commands[index];
    
    document.getElementById('commandName').value = command.name;
    document.getElementById('commandText').value = command.command;
    document.getElementById('commandDescription').value = command.description;
    document.getElementById('commandCategory').value = command.category || '';
    document.getElementById('commandManufacturer').value = command.manufacturer || '';
    
    const addButton = document.getElementById('addCommandButton');
    addButton.textContent = 'Update Command';
    addButton.onclick = () => {
        const updatedCommand = {
            name: document.getElementById('commandName').value,
            command: document.getElementById('commandText').value,
            description: document.getElementById('commandDescription').value,
            category: document.getElementById('commandCategory').value,
            manufacturer: document.getElementById('commandManufacturer').value
        };
        commandManager.editCommand(index, updatedCommand);
        document.getElementById('addCommandForm').reset();
        addButton.textContent = 'Add Command';
        addButton.onclick = null;
    };
}
