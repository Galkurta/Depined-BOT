# Depined Auto Connect

A Node.js application to automatically maintain connections with the Depined platform and track earnings.

## Features

- Automatic connection maintenance
- Real-time earnings tracking
- Multi-account support
- Epoch tracking
- Beautiful console output with colors
- Detailed logging system

## Prerequisites

Before you begin, ensure you have installed:

- Node.js (version 14 or higher)
- npm (usually comes with Node.js)

## Registration

Before using this tool, you need to register on the Depined platform:

1. Visit [Depined Platform](https://app.depined.org/onboarding)
2. Use the following referral code during registration:

```
Vg4EnmlTbEl3
```

**Important Note**: This referral code has a usage limit of 5 people. If you're unable to use it, it means the maximum limit has been reached.

## Configuration

1. Edit `data.txt` file in the root directory
2. Add your JWT tokens to `data.txt`, one per line:

```
your_jwt_token_1
your_jwt_token_2
...
```

## Usage

Run the application:

```bash
node main.js
```

The application will:

- Read all JWT tokens from data.txt
- Connect all accounts simultaneously
- Display real-time connection status and earnings
- Auto-reconnect on connection loss

## Output Format

The application displays information in the following format:

```
[Username] Connected | Earnings: XX.XX (Epoch: X)
```

Where:

- Earnings are formatted in K (thousands), M (millions), or B (billions)
- Epoch shows the current epoch number

## Error Handling

The application includes comprehensive error handling for:

- Connection issues
- Invalid tokens
- API errors
- File reading errors

## Contributing

Feel free to submit issues, create pull requests, or fork the repository.

## Disclaimer

This tool is for educational purposes only. Use it responsibly and in accordance with Depined's terms of service.

## Support

For support, you can reach out through:

- GitHub Issues
- Telegram: https://t.me/galkurtarchive

## License

MIT License - feel free to use and modify for your own purposes.
