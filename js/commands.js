class CommandManager {
    constructor() {
        this.COMMANDS_STORAGE_KEY = 'serialTerminalCommands';
        this.commands = [];
        
        // UI elements
        this.commandLibrary = document.getElementById('commandLibrary');
        this.addCommandBtn = document.getElementById('addCommandBtn');
        this.modal = document.getElementById('addCommandModal');
        this.closeModalBtn = document.querySelector('.close-modal');
        this.saveCommandBtn = document.getElementById('saveCommandBtn');
        this.cancelCommandBtn = document.getElementById('cancelCommandBtn');
        this.commandSearch = document.getElementById('commandSearch');
        
        // Form elements
        this.commandName = document.getElementById('commandName');
        this.commandValue = document.getElementById('commandValue');
        this.commandDescription = document.getElementById('commandDescription');
        
        // Bind event listeners
        this.addCommandBtn.addEventListener('click', () => this.openAddCommandModal());
        this.closeModalBtn.addEventListener('click', () => this.closeAddCommandModal());
        this.cancelCommandBtn.addEventListener('click', () => this.closeAddCommandModal());
        this.saveCommandBtn.addEventListener('click', () => this.saveCommand());
        this.commandSearch.addEventListener('input', () => this.searchCommands());
        
        // Load commands from storage
        this.loadCommands();
    }
    
    openAddCommandModal() {
        this.modal.style.display = 'block';
        this.commandName.focus();
    }
    
    closeAddCommandModal() {
        this.modal.style.display = 'none';
        this.resetForm();
    }
    
    resetForm() {
        this.commandName.value = '';
        this.commandValue.value = '';
        this.commandDescription.value = '';
    }
    
    loadCommands() {
        try {
            // Always set the default commands with categories
            this.commands = [
                // Module Info Category
                { name: 'Module Info', value: 'ATI', description: 'Get module identification information', category: 'Module Info' },
                { name: 'Manufacturer ID', value: 'AT+CGMI', description: 'Request manufacturer identification', category: 'Module Info' },
                { name: 'Model ID', value: 'AT+CGMM', description: 'Request model identification', category: 'Module Info' },
                { name: 'Software Revision', value: 'AT+CGMR', description: 'Request software revision', category: 'Module Info' },
                { name: 'Revision', value: 'AT+GMR', description: 'Request revision information', category: 'Module Info' },
                { name: 'IMEI', value: 'AT+CGSN', description: 'Request IMEI (International Mobile Equipment Identity)', category: 'Module Info' },
                { name: 'Factory Serial Number', value: 'AT+CFSN', description: 'Request factory serial number', category: 'Module Info' },
                { name: 'IMSI', value: 'AT+CIMI', description: 'Request IMSI (International Mobile Subscriber Identity)', category: 'Module Info' },
                { name: 'ICCID', value: 'AT+CCID', description: 'Request Integrated Circuit Card Identity', category: 'Module Info' },

                // Expanded Network Category
                // Signal Strength and Quality
                { name: 'Signal Strength', value: 'AT+CSQ', description: 'Get signal strength', category: 'Network' },
                { name: 'Extended Signal Quality', value: 'AT+CESQ', description: 'Get extended signal quality parameters', category: 'Network' },
                
                // Network Registration
                { name: 'Network Registration', value: 'AT+CREG?', description: 'Check cellular network registration status', category: 'Network' },
                { name: 'GPRS Network Registration', value: 'AT+CGREG?', description: 'Check GPRS network registration status', category: 'Network' },
                { name: 'EPS Network Registration', value: 'AT+CEREG?', description: 'Check EPS network registration status', category: 'Network' },
                { name: '5GS Network Registration', value: 'AT+C5GREG?', description: 'Check 5G network registration status', category: 'Network' },
                
                // Operator and Network Selection
                { name: 'Select Operators', value: 'AT+COPS?', description: 'Query current network operator', category: 'Network' },
                { name: 'Preferred PLMN List', value: 'AT+CPLS?', description: 'Select preferred PLMN list', category: 'Network' },
                
                // Radio Access Technology
                { name: 'Select Radio Access Technology', value: 'AT+GTRAT?', description: 'Select Radio Access Technology', category: 'Network' },
                { name: 'Select RAT and BAND', value: 'AT+GTACT?', description: 'Select Radio Access Technology and BAND', category: 'Network' },
                
                // Cell and Network Information
                { name: 'Current Cell Information', value: 'AT+GTCCINFO?', description: 'Get current cell information', category: 'Network' },
                { name: 'Serving Cell Information', value: 'AT+GTCELLINFO?', description: 'Get Serving Cell Information', category: 'Network' },
                { name: 'Cell Lock Configuration', value: 'AT+GTCELLLOCK?', description: 'Cell lock information configuration', category: 'Network' },
                { name: 'Cell Scan', value: 'AT+GTCELLSCAN', description: 'Scan frequency and obtain neighbor cell information', category: 'Network' },
                
                // SIM Lock Configuration
                { name: 'SIM Lock Configuration', value: 'AT+SIMLOCKCFG?', description: 'Configure PLMN whitelist', category: 'Network' },
                { name: 'SIM Lock State', value: 'AT+SIMLOCKSTATE?', description: 'Query current SIM lock state of module', category: 'Network' },
                { name: 'SIM Lock Operator', value: 'AT+SIMLOCKOPR?', description: 'Modify PLMN list added by SIMLOCKCFG', category: 'Network' },
                
                // Network Failure Diagnostics
                { name: 'Network Rejection Cause', value: 'AT+GTREJCAUSE?', description: 'Get cause value for network failure', category: 'Network' },
                
                // Roaming and Connection
                { name: 'Roaming Dial Control', value: 'AT+GTROAMCFG?', description: 'Roaming dial control configuration', category: 'Network' },
                { name: 'RRC Connection Release', value: 'AT+GTRRCREL', description: 'Local quick release RRC connection', category: 'Network' },
                
                // Extended Discontinuous Reception
                { name: 'eDRX Settings', value: 'AT+CEDRXS?', description: 'eDRX (extended Discontinuous Reception) settings', category: 'Network' },
                { name: 'eDRX Dynamic Parameters', value: 'AT+CEDRXRDP', description: 'Read eDRX dynamic parameters', category: 'Network' },
                
                // Additional Network Parameters
                { name: 'UE EPS Operation Modes', value: 'AT+CEMODE?', description: 'UE modes of operation for EPS', category: 'Network' },
                { name: 'Signal Receiving Indication', value: 'AT+GTRXPWR?', description: 'Signal Receiving Indication', category: 'Network' },
                { name: 'Reject Cause Reporting', value: 'AT+GTREJECTCAUSE?', description: 'Reject cause reporting', category: 'Network' },
                
                // Data Packet Domain
                { name: 'Define PDP Context', value: 'AT+CGDCONT?', description: 'Define Packet Data Protocol (PDP) context', category: 'Data Packet Domain' },
                { name: 'Packet Domain Attach', value: 'AT+CGATT?', description: 'Attach or detach from packet domain', category: 'Data Packet Domain' },
                { name: 'Activate PDP Context', value: 'AT+CGACT?', description: 'Activate or deactivate PDP context', category: 'Data Packet Domain' },
                { name: 'GPRS Address', value: 'AT+CGPADDR?', description: 'Get GPRS address', category: 'Data Packet Domain' },
                { name: 'DNS Addresses', value: 'AT+GTDNS?', description: 'Request DNS addresses', category: 'Data Packet Domain' },
                { name: 'Packet Domain Event Reporting', value: 'AT+CGEREP?', description: 'Configure packet domain event reporting', category: 'Data Packet Domain' },
                { name: 'PDP Authentication Parameters', value: 'AT+CGAUTH?', description: 'Set PDP authentication parameters', category: 'Data Packet Domain' },
                { name: 'Authentication Type', value: 'AT+MGAUTH?', description: 'Set authentication type', category: 'Data Packet Domain' },
                { name: 'IP Address Printing Format', value: 'AT+CGPIAF?', description: 'Configure IP address printing format', category: 'Data Packet Domain' },
                { name: 'PDP Context Dynamic Parameters', value: 'AT+CGCONTRDP?', description: 'Read PDP context dynamic parameters', category: 'Data Packet Domain' },
                { name: 'Data Statistics', value: 'AT+GTSTATIS?', description: 'Query current rate and total data volume', category: 'Data Packet Domain' },
                
                // Utility Commands
                { name: 'Basic AT', value: 'AT', description: 'Basic AT command to test connection', category: 'Utility' },
                { name: 'SIM Status', value: 'AT+CPIN?', description: 'Check SIM card status', category: 'Utility' },
                { name: 'Reset Module', value: 'AT+CFUN=1,1', description: 'Reset the module', category: 'Utility' }
            ];

            // If there are saved commands, merge them with default commands
            const savedCommands = localStorage.getItem(this.COMMANDS_STORAGE_KEY);
            if (savedCommands) {
                const parsedSavedCommands = JSON.parse(savedCommands);
                // Add saved commands that are not already in the default list
                parsedSavedCommands.forEach(savedCmd => {
                    const exists = this.commands.some(cmd => cmd.value === savedCmd.value);
                    if (!exists) {
                        this.commands.push(savedCmd);
                    }
                });
            }

            // Always save and render the commands
            this.saveCommands();
        } catch (error) {
            console.error('Error loading commands:', error);
            this.commands = [];
        }
    }
    
    saveCommands() {
        try {
            localStorage.setItem(this.COMMANDS_STORAGE_KEY, JSON.stringify(this.commands));
            this.renderCommands();
        } catch (error) {
            console.error('Error saving commands:', error);
        }
    }
    
    saveCommand() {
        const name = this.commandName.value.trim();
        const value = this.commandValue.value.trim();
        const description = this.commandDescription.value.trim();
        
        if (!name || !value) {
            alert('Please enter both name and command value');
            return;
        }
        
        this.commands.push({ name, value, description });
        this.saveCommands();
        this.closeAddCommandModal();
    }
    
    renderCommands() {
        this.commandLibrary.innerHTML = '';
        
        if (this.commands.length === 0) {
            const emptyMessage = document.createElement('p');
            emptyMessage.textContent = 'No commands saved. Add a command to get started.';
            emptyMessage.style.padding = '0.5rem';
            emptyMessage.style.color = '#6b7280';
            this.commandLibrary.appendChild(emptyMessage);
            return;
        }

        // Group commands by category
        const categorizedCommands = this.commands.reduce((acc, command) => {
            const category = command.category || 'Uncategorized';
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(command);
            return acc;
        }, {});

        // Render commands grouped by category
        Object.entries(categorizedCommands).forEach(([category, commands]) => {
            // Create category header
            const categoryHeader = document.createElement('div');
            categoryHeader.className = 'command-category-header';
            categoryHeader.textContent = category;
            this.commandLibrary.appendChild(categoryHeader);

            // Render commands in this category
            commands.forEach((command, index) => {
                const commandBtn = document.createElement('button');
                commandBtn.className = 'command-btn';
                commandBtn.textContent = command.name;
                commandBtn.title = command.description || command.value;
                commandBtn.setAttribute('data-command', `${command.value} ${command.description}`);
                
                commandBtn.addEventListener('click', () => this.executeCommand(command.value));
                
                // Add context menu for delete
                commandBtn.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    if (confirm(`Delete command "${command.name}"?`)) {
                        this.deleteCommand(this.commands.indexOf(command));
                    }
                });
                
                this.commandLibrary.appendChild(commandBtn);
            });
        });
    }
    
    executeCommand(commandValue) {
        // Find the message input and send button
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.getElementById('sendBtn');
        
        if (messageInput && sendBtn) {
            messageInput.value = commandValue;
            sendBtn.click();
        }
    }
    
    deleteCommand(index) {
        this.commands.splice(index, 1);
        this.saveCommands();
    }
    
    searchCommands() {
        const searchTerm = this.commandSearch.value.toLowerCase();
        const commandButtons = this.commandLibrary.getElementsByClassName('command-btn');
        
        for (let button of commandButtons) {
            const commandName = button.textContent.toLowerCase();
            const commandData = button.getAttribute('data-command').toLowerCase();
            const isVisible = commandName.includes(searchTerm) || commandData.includes(searchTerm);
            button.style.display = isVisible ? 'block' : 'none';
        }
    }
    
    exportCommands() {
        const dataStr = JSON.stringify(this.commands, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = 'serial-terminal-commands.json';
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }
    
    importCommands(jsonData) {
        try {
            const importedCommands = JSON.parse(jsonData);
            
            if (Array.isArray(importedCommands)) {
                this.commands = importedCommands;
                this.saveCommands();
                return true;
            } else {
                alert('Invalid commands format');
                return false;
            }
        } catch (error) {
            alert('Error importing commands: ' + error.message);
            return false;
        }
    }
    
    getCommandsByCategory(category) {
        return this.commands.filter(cmd => cmd.category === category);
    }
}

// Make CommandManager globally accessible
window.commandManager = new CommandManager();
