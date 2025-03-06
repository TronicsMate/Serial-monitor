# Web-Based Serial Monitor

A web-based serial monitor application developed using HTML, CSS, and JavaScript. This project allows users to send and receive serial commands via a user-friendly web interface, complete with pre-saved 3GPP AT commands and scripting capabilities.

## Features

### Send and Receive Serial Commands
- **Communicate with your serial devices directly from your web browser.**
- **Display incoming serial data in real-time.**

### Pre-Saved 3GPP AT Commands
- **Access a library of pre-saved 3GPP AT commands for quick and easy use.**
- **Save time by reusing commonly used commands.**

### Scripting Support
- **Write and execute scripts consisting of multiple commands and delays.**
- **Customize command sequences to automate your serial communication tasks.**

Example script format:
```plaintext
AT;
delay(500);
ATI;
delay(200);
AT+COPS?;
delay(200);
```
## How to Use

### Setup
Clone the repository and open the `index.html` file in your web browser.

### Connect
Select the serial port and baud rate to connect to your device.

### Send Commands
Use the command input area to send serial commands or select pre-saved AT commands from the list.

### Run Scripts
Write your command scripts in the scripting area and execute them with the "Run Script" button.

## Dependencies
Ensure you have a compatible web browser that supports Web Serial API (e.g., Google Chrome, Microsoft Edge).

## Contributions
Contributions are welcome! Please fork the repository and submit a pull request with your improvements or bug fixes.

## License
This project is licensed under the MIT License.
