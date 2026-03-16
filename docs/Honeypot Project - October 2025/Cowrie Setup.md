---
sidebar_label: 'Cowrie Setup'
sidebar_position: 1
---

import A from './Project-images/Cowrie-log-prior-to-attack.jpeg';
import B from './Project-images/cowrie-shell-prompt.jpeg';
import C from './Project-images/cowrie-start-success.jpeg';
import D from './Project-images/Lab-Topology.jpeg';
import E from './Project-images/pip-install-permissions-error.jpeg';

##### CML LAB TOPOLOGY

<img src={D} style={{ width: "600px" }} />

---

# Overview

The goal of this lab is to build a simple but fully functional network environment and deploy a **Cowrie SSH honeypot** to observe and analyze attacker behavior.

In this lab we will:

- Build a small LAN inside **Cisco Modeling Labs (CML)**
- Install the **Cowrie honeypot** on an Ubuntu system
- Simulate an **SSH brute force attack** from another machine on the same network
- Capture and analyze the attack activity through Cowrie logs
- Observe what tools and techniques the attacker attempts to use after gaining access

Cowrie is an **interactive SSH and Telnet honeypot** designed to log brute-force attacks and capture the commands attackers attempt to execute once they believe they have gained shell access.

---

# Setting Up the Honeypot with Cowrie

First, update the system package list.

```
sudo apt update -y
```

Install the required Python package manager and virtual environment tools.

```
sudo apt install pip
```
```
sudo apt install python3-venv -y
```

---

## Important Note About File Ownership

The `git clone` command **must NOT be run as root** (do not use `sudo`).

Running this command as root will cause **file ownership issues later in the setup process**, especially when installing Python packages or modifying configuration files.

Example of the type of error that can occur if the directory is owned by root:

<img src={E} style={{ width: "1200px" }} />

---

## Clone the Cowrie Repository

```
git clone https://github.com/cowrie/cowrie
```

To verify the directory ownership:

```
ls -ld cowrie
```

The directory should be owned by your current user.

---

# Create and Activate a Python Virtual Environment

Cowrie runs inside a **Python virtual environment**. This keeps its dependencies isolated from the rest of the system.

Create the virtual environment:

```
python3 -m venv cowrie-env
```

Activate the virtual environment:

```
source cowrie-env/bin/activate
```

After activation, your shell prompt will change to indicate that you are working inside the virtual environment:

<img src={B} style={{ width: "600px" }} />

---

# Install Cowrie Dependencies

Upgrade pip inside the virtual environment:

```
pip install --upgrade pip
```

Move into the Cowrie directory and install the required dependencies:

```
cd cowrie
pip install -r requirements.txt
```

Copy the default configuration file:

```
cp etc/cowrie.cfg.dist etc/cowrie.cfg
```

---

# Install Cowrie in Editable Mode

This is a **very important step**.

PIP (Pip Installs Packages) is a tool used to download and install Python software from the Python Package Index (PyPI) or from local source code.

The command below installs the **current directory** (represented by `"."`) as a Python package in **editable mode (`-e`)**.

This means:

- Cowrie is installed inside the virtual environment
- Any code changes made locally are immediately reflected without reinstalling

This command **must be run from inside the `cowrie` directory**.

```
pip install -e .
```

---

# Redirect SSH Traffic to Cowrie

By default, Cowrie listens on **port 2222**.

This is intentional because:

- **Port 22 requires root privileges**
- Running Cowrie directly as root would introduce unnecessary risk

However, attackers will typically attempt to connect to **port 22**, so we redirect incoming SSH traffic to Cowrie.

Create a NAT redirect rule:

```
sudo iptables -t nat -A PREROUTING -p tcp --dport 22 -j REDIRECT --to-port 2222
```

Save the iptables configuration:

```
sudo iptables-save
```

### Important Reminder

If you **exit and later re-enter the virtual environment**, make sure this redirect rule is still active.

Without it, connection attempts on port 22 **will not reach Cowrie**, and attacks will not be logged.

---

# Starting Cowrie

Start the Cowrie service:

```
cowrie start
```

Check the status of the honeypot:

```
cowrie status
```

If everything started correctly, you should see output similar to this:

<img src={C} style={{ width: "900px" }} />

The output will also display the **process ID (PID)** of the Cowrie service.

---

# Viewing Cowrie Logs

To monitor activity on the honeypot, we can watch the Cowrie log file in real time.

Use the `tail -f` command to follow the log output:

```
tail -f var/log/cowrie/cowrie.log
```

This provides a **live feed of all events** detected by the honeypot.

Before any attacks occur, the logs will appear similar to the following:

<img src={A} style={{ width: "900px" }} />

Once the honeypot begins receiving connection attempts, you will start to see:

- SSH login attempts
- Username/password guesses
- Session activity from attackers
- Commands executed by the attacker inside the fake shell environment
