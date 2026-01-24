# ♟️ Chess.com Auto-Next Puzzle Extension

A Chrome extension that automatically clicks the "Next" or "Continue" button after you complete a puzzle on Chess.com, because chess.com decided to remove it.

##  Features

- **Automatic Advancement**: Automatically clicks the Next/Continue button after puzzle completion
- **Configurable Delay**: Set custom delay (in milliseconds) before auto-clicking
- **Easy Toggle**: Enable or disable the feature with a simple checkbox


##  Installation

### Method 1: Load Unpacked (For Development/Testing)

1. Download this extension (either clone the repo or download the ZIP)
2. Extract the files to a folder on your computer
3. Open Google Chrome and navigate to `chrome://extensions/`
4. Enable **Developer mode** (toggle switch in the top-right corner)
5. Click **Load unpacked**
6. Select the folder containing the extension files
7. The extension icon should appear in your Chrome toolbar

### Method 2: From ZIP File

1. Download `chess-auto-next.zip`
2. Extract to a folder
3. Follow steps 3-7 from Method 1 above

##  Usage

1. **Initial Setup**:
   - Click the extension icon in your Chrome toolbar
   - The popup will show current settings (enabled by default with 800ms delay)

2. **Configure Settings**:
   - Check/uncheck **Enable Auto-Next** to turn the feature on or off
   - Adjust **Delay (milliseconds)** to your preferred waiting time
     - Default: 800ms (0.8 seconds)
     - Recommended range: 500-2000ms
   - Click **Save Settings**

3. **Start Solving Puzzles**:
   - Navigate to Chess.com puzzles
   - Solve puzzles as normal
   - After completion, the extension will automatically click "Next" after your set delay
   - Continue your puzzle streak seamlessly!

## ⚙️ Settings Explained

### Enable Auto-Next
- **Checked**: Extension will auto-click the Next button
- **Unchecked**: Extension is disabled, manual clicking required

### Delay (milliseconds)
- Time to wait before clicking the Next button after puzzle completion
- **Lower values** (300-600ms): Faster advancement, less time to review




##  Privacy & Permissions

This extension requires minimal permissions:

- **storage**: To save your settings (enabled/disabled state and delay preference)
- **Host permission** (`https://www.chess.com/*`): To run the content script on Chess.com pages only

**No data is collected, transmitted, or stored externally.** All settings are saved locally in your browser.

##  License

This project is open source and available under the MIT License.

##  Disclaimer

This extension is not affiliated with, endorsed by, or officially connected with Chess.com. It is an independent tool created to enhance the user experience.

Use this extension responsibly and in accordance with Chess.com's Terms of Service.

