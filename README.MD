![Torus logo](https://torus-online.github.io/logo.png)
### "Pay your bills working on whatever you want"

[![Gitter](https://badges.gitter.im/torus-app/community.svg)](https://gitter.im/torus-app/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

We believe that people involved in OSS can feel secure, collaborate better, and share in the value for their work through the adoption of a better governance system.

Our mission is to provide stability and prosperity to open source software projects, by delivering a blockchain-based governance and treasury system that benefits all members OSS projects' life cycles.

Using Torus, you can add structure to the thorny task of running OSS projects -- managing contributors, power structures, and compensation. It's is an easy-to-use GUI to deploy and interact with governance smart contracts on the Cardano blockchain. It provides safe and secure point-and-click digital governance to OSS software organizations.

## Status

Torus is currently in the earliest stages of development. We've only rolled out the smallest set of viable features to validate them before we move onto more advanced features. At this time, Torus can deploy a smart contract to the Ethereum blockchain to identify an organization and who are the owners, including the ability to transfer ownership. As soon as a publi cCardano Goguen testnet is online and the Plutus specification is stabilized, we will begin the work of migrating Torus over to Cardano. Cardano part of my original inspiration for this project, and I believe is has a more solid foundation and forward trajectory than Ethereum does.

In the future, Torus will provide more advanced decentralized organization management features, such as governance, policy creation, and treasury management.

## Homepage
https://torus-ui.azurewebsites.net/0x773509458984befAD35B2CAD19D54aacc2ea2899

## FAQ
https://secure.helpscout.net/docs/5ec291c1042863474d1aee5c/article/5ec3de18042863474d1aff26/

## Newly Open-Sourced
I created Torus out of the belief that open source software efforts could be coordinated more effectively by allowing smart contracts to organize a wide net of developers across the globe. Since I believe open source is the most natural fit for this application, I decided to open-source Torus to get the community involved as early as possible to help validate its use cases and contribute to development. Anyone with skills or knowledge with blockchian, governance, or software development are invited to get involved in the discussion and/or submit PRs.

## Pre-requisites
- [ASP.NET Core SDK 3.1]
- [Node.js ^12.16.0]
- [Truffle ^5.1.0] `npm install -g truffle`

## Development environment
We recommend Visual Studio Code for easy debugging.

1. Clone this repo, `git clone https://github.com/torus-online/torus.git`
1. Install dependencies, `cd torus/torus-ui-angular/ClientApp && npm install --no-save`
1. Compile the Solidity contracts, `truffle compile`

## Running the application
1. Start the app in the "Run" tab in VS Code or, `dotnet run`.
1. Visit the HTTPS site in a web browser - https://localhost:5001/
