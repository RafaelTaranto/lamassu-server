# lamassu-server

Lamassu remote server.

## Pull Requests

We do not generally accept outside pull requests for new features. Please consult with us before putting a lot of work into a pull request.

## Development

### Requirements

- Nodejs 22
- PNPM 10+
- Postgres Database
- Python 3 (to be deprecated, required by a single dependency installation)
- OpenSSL (for cert-gen.sh, it will set up the server self-signed certificates)

There's a shell.nix file that you can use to set up your env in case you're a nix user. (most reliable way of installing native deps)
There's also a .tool-versions for asdf and mise users.

This project uses Turbo for monorepo management. Install dependencies:

```bash
pnpm install
```

Prepare environment files:

```bash
bash packages/server/tools/cert-gen.sh
```

On packages/server/.env you can alter variables such as the postgres connection info.

After configuring the postgres connection, run:

```bash
node packages/server/bin/lamassu-migrate
```

### Start development environment:

If you've already done the setup, you can run:

```bash
pnpm run dev
```

### Creating a user

```bash
node packages/server/bin/lamassu-register admin@example.com superuser
```

### Pairing a machine

To get the pairing token from the QRCode open the browser console before picking the name of the machine, the token should appear on the terminal.
It's also possible to inspect the qrCode, the token is on the data-cy="" attr.
Lastly, you can always scan it with a phone and copy the contents over.

Now continue with lamassu-machine instructions from the `INSTALL.md` file in [lamassu-machine repository](https://github.com/lamassu/lamassu-machine)
