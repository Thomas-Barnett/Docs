---
sidebar_label: 'Cowrie Lab Attack Simulation'
sidebar_position: 2
---

import A from './Project-images/Nmap-Terminal-Output.jpeg';
import B from './Project-images/Logging-Connection-Attempts.jpeg';
import C from './Project-images/Kali-Default-Wordlists.jpeg';
import D from './Project-images/Dummy-Shell.jpeg';
import E from './Project-images/Hacker-ip-addr.jpeg';
import F from './Project-images/Hydra-Done.jpeg';
import G from './Project-images/Lab-Topology.jpeg';

## CML Lab Setup

<img src={G} style={{ width: "600px" }} />

---

# Overview

In this portion of the lab, we simulate a **real-world brute-force SSH attack** against the Cowrie honeypot deployed earlier.

The objective is to:

- Use **Nmap** to discover hosts and open ports on the network
- Use **Hydra** to perform an automated SSH brute-force attack
- Observe the attack activity from the honeypot logs
- Capture and analyze the commands executed after the attacker gains access

Because Cowrie emulates a real SSH server, attackers will believe they have successfully compromised a machine while their activity is being fully logged.

---

# Preparing the Attack Machine

Cowrie is an **SSH honeypot**, so we will attempt to brute-force it using a tool called **Hydra**.

Hydra is a widely used credential brute-forcing tool capable of attacking many services such as:

- SSH
- FTP
- HTTP
- SMB
- RDP
- Telnet

We will also install **Nmap**, which will be used to discover systems and identify open ports on the network.

### Install Required Tools

```
sudo apt update -y
```
```
sudo apt install hydra nmap -y
```

---

# Scanning the Network

Before attacking a system, an attacker will typically perform **reconnaissance** to determine what systems exist on the network and what services they expose.

## Step 1 — Determine Your Network Range

First, identify the IP address and subnet of your machine.

```
ip addr
```

You will see output similar to this:

<img src={E} style={{ width: "600px" }} />

Example interpretation:

- IP Address: **192.168.1.12**
- Subnet Mask: **255.255.255.0**

This subnet mask corresponds to **CIDR notation `/24`**, meaning the network contains **254 possible hosts**.

The full network range therefore becomes:


192.168.1.0/24


---

## Step 2 — Scan the Network with Nmap

Now we scan the entire subnet to identify active hosts and open ports.

```
nmap 192.168.1.0/24
```

The terminal output will look similar to this:

<img src={A} style={{ width: "600px" }} />

From the attacker's perspective, the honeypot simply appears as another system on the network.

If **port 22 (SSH)** is open, it becomes a likely target for brute-force authentication attempts.

---

# Preparing Wordlists for Hydra

Hydra requires **two wordlists**:

1. A list of usernames
2. A list of passwords

For demonstration purposes, these lists can be simple and short. In real-world attacks, much larger password lists are commonly used.

Example of default wordlists included with Kali Linux:

<img src={C} style={{ width: "600px" }} />

---

## Creating Wordlist Files

A common location to store wordlists is:


/usr/share/wordlists


Create the directory if it does not already exist:

```
cd /usr/share
sudo mkdir wordlists && cd wordlists
```

Now create your username and password lists using a text editor such as **nano** or **vi**.

Example files:


usernames.txt
passwords.txt


---

## Important Note About Cowrie Credentials

If you want your brute-force attack to **successfully authenticate**, you must include credentials that Cowrie will accept.

Cowrie does **not use the system's real user accounts**.

Instead, it uses credential definitions located in:


./cowrie/etc/userdb.example


This file can be copied to:


userdb.txt


If `userdb.txt` does not exist, Cowrie will automatically fall back to the default credentials defined in `userdb.example`.

---

# Launching the Hydra Attack

Once your wordlists are prepared, you can execute the Hydra brute-force command.

```
hydra -L /usr/share/wordlists/usernames.txt -P /usr/share/wordlists/passwords.txt -t 7 -f ssh://192.168.1.13
```

---

## Hydra Command Breakdown

`-L <path>`  
Hydra will attempt each username listed in this file.

`-P <path>`  
Hydra will attempt each password listed in this file.

`-t 7`  
Runs **7 concurrent threads**, meaning seven simultaneous login attempts.

Higher thread counts increase attack speed but also increase:

- CPU load
- Network traffic
- Chance of triggering rate limits or intrusion detection systems.

`-f`  
Stops the attack **after the first valid credential is discovered**.

`ssh://192.168.1.13`  
Specifies the **target system and service** being attacked.

---

# Observing the Honeypot Logs

If you previously started log monitoring with:

```
tail -f var/log/cowrie/cowrie.log
```

You should now see a steady stream of connection attempts.

If both the **attacker machine** and the **honeypot console** are visible in CML, your environment may look like this:

<img src={B} style={{ width: "600px" }} />

You will observe:

- SSH connection attempts
- Failed login attempts
- Username/password combinations being tested

---

# Hydra Results

Once Hydra finds a valid credential, it will terminate (because of the `-f` flag).

The output will look similar to the following:

<img src={F} style={{ width: "600px" }} />

### Interesting Note

By default, Cowrie accepts:


username: root

password: "any_value"


This behavior is configurable and can be changed inside:


**cowrie/etc/userdb.txt**


---

# The Cowrie Fake Shell

After a successful login, Cowrie presents the attacker with a **fake Linux shell environment**.

From the attacker's perspective, it appears that they have successfully compromised a real system.

However:

- The environment is **fully simulated**
- All activity is **logged**
- Files and commands are **emulated**

This allows security researchers to observe attacker behavior safely.

Example of the dummy shell environment:

<img src={D} style={{ width: "600px" }} />

Typical attacker behavior after login may include:

- Checking system information
- Downloading malware
- Attempting privilege escalation
- Creating persistence mechanisms
