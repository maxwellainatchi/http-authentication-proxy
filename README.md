# HTTP Authentication Proxy

A simple service to require a user to log in before being proxied to another service.

I use this to publicly expose services that I want convenient access when I'm on my local network. This has only a bare minimum of features for right now. Hopefully in the future it will be expanded.

## Usage

Create a file called `password.txt` in the root directory. First line of the file should be the username, second should be the SHA-256 hash of the password. I will improve this in the future to allow multiple users and to potentially allow registration.

You must also provide the environment variable `PROXY_TARGET`, which is where the user will be proxied to on successful authentication.

The `PORT` environment variable will specify the port the service runs on.

---

To proxy from one port to another (e.g. expose 3000 publicly and the service you want to firewall is running on 3001), simply provide `PORT`: 3000, and `PROXY_TARGET`: "http://localhost:3001".



**If you have any suggestions, please feel free to send me a message or open a GitHub issue.**