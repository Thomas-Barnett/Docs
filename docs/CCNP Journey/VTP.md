---
sidebar_label: 'VTP (VLAN Trunking Protocol)'
sidebar_position: 1
---
import A from './CCNP-Journey-images/VTP-Pruning.png';

### Understanding VLAN Trunking Protocol

---

## VTP's Purpose

### VTP (VLAN Trunking Protocol) is designed to:

- Sync the VLAN database accross all the switches in a domain
- Reduce the administrative burden of configuring VLANs on each switch in large networks
- Keep Vlan configuration updated accross all switches

---

## VTP Domains

### What do we mean when we say domain?

A domain, in this context, represents a collection of switches are being grouped together for **ease of management**. The VTP domain is configured on the switch. The default domain is `NULL`, VTP is **not operational** in this mode. 

### Activating VTP

Pick a switch, set the domain:
```
vtp domain <vtp_domain_name>  
```
:::note
- A switch with a VTP domain of NULL will adopt the same VTP domain of a VTP advertisement it receives
- VTP advertisements and other VTP messages are only sent on trunk links, not access links 
:::

---

## VTP Versions

### There are different versions of the VTP protocol. 

- Defualt Version = v1 
- If a v1 switch receives a VTP v2 advertisement → the switch becomes v2 
- v3 cannot be adopted, has to be manually configured
- Command for configuring version = `vtp version <version_number>`

---

## Basic VTP Functionality

- Revision Number: gets incremented with each new VLAN DB config
- Higher Rev. Num.: If a switch sees a higher Rev. Num. than it's own, it know it needs to update VLAN DB
- Lower Rev. Num.: If a switch sees a lower Rev. Num. than it's own, it drops the advertisement
- Command to disable VTP on a port: `no vtp`

---

## VTP Version Comparison

- VTP v1 and v2: The same, both support Normal VLAN range (1-1005), but v2 supports **Token Ring**
- VTP v3:
	- Hidden and Secret password options
	- Private VLAN support
	- Primary/Secondary servers
	- MST (Multiple Spanning Tree)
	- Extended Range Vlans: Normal (1-1005) + Extended (1006-4094)

---

## VTP modes: Server, Client, Transparent, Off

:::note Transparent and Off
**Transparent Mode**: switch can locally modify VLANs, doesn't sync VLAN DB with other switches, forwards VTP advertisements out of trunk ports, If switch's domain is NULL- it will forward VTP advertisements for any domain.

**Off Mode**: The same as Transparent Mode, but it DOES NOT Forward
:::

---

## VTPv3 Primary Server vs. Secondary Servers:

- switches are secondary servers by default and cannot modify VLANs (function like clients)
- only primary servers can modify vlans
- `vtp primary`- command that promotes a switch to primary server (not done in global config mode)
- vtp primary status is lost after reload, password change
- if you use the vtp primary command on a secondary switch, it will promote that switch and revert the other to secondary
- This feature solves the common worry of adding a switch to the network with the same domain and it inadvertently starts overwriting VLANs

---

## VTP Authentication:

- `vtp password <password> hidden` (encrypts the password)
- `vtp password <password_hash> secret` (configures already encrypted password)

---

## VTP Message Types: Summary Advertisement, Subset Advertisement, Advertisement Request

- All of these message types are sent in VLAN 1 - untagged if native vlan = 1, tagged if native vlan not = 1
- All of these message types are sent to multicast MAC Address 0100.0ccc.cccc

### Summary Advertisement:
- inform other switches of the VTP domain name and revision number
- sent every five min.
- ALSO, sent when there is a change to the vlan database

### Subset Advertisement:
- Contains VLAN information (The Actual VLAN DB)
- There may be multiple Subset Advertisements depending on the number of VLANs there are
- Sent along with Summary Advertisement when there is a change to the vlan database

### Advertisement Request:
- Sent by switches after - reset, VTP domain name change, getting a Sum. Ad. with a higher revision number

### Message Type Codes:
- Sum. Ad. = 0x01
- Sub. Ad. = 0x02
- Ad. Req. = 0x03

---

## VTP Pruning

:::tip VTP Pruning 
Automatically removes VLANs from trunk ports to reduce the size of the broadcast domains.
:::

- prevents frames from being flooded in a direction where there are no hosts to receive the frame
- VTP Pruning = disabeld by default
- `vtp pruning` = command to enable VTP Pruning
- Manual Pruning = manually configuring the allowed VLANs on a trunk port

:::note
You only need to enable pruning on one VTP server in the domain
:::

<img src={A} style={{ width: "1200px" }} />

---

## Helpful VTP Commands

- show vtp status
- show vtp devices
- show vtp password
- vtp primary
- vtp domain `<domain_name>`
- vtp version `<version_number>`
- vtp mode `<mode>`
- vtp password `<password>` [hidden | secret]
- vtp pruning

