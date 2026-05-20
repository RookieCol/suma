#!/usr/bin/env bash
# scan-esp32.sh — Discover ESP32 devices on your local network. No sudo required.
#
# Strategy: nmap -sn populates the kernel's ARP cache as it pings each host,
# then `arp -a` reads MAC addresses from the cache and we match Espressif OUIs.
# macOS-tested.
#
# Usage:
#   ./scan-esp32.sh                       # auto-detect subnet, list ESP32s
#   ./scan-esp32.sh 192.168.1.0/24        # explicit subnet
#   ./scan-esp32.sh --deep                # also port-scan found devices
#   ./scan-esp32.sh --json                # JSON output (for piping)
#   ./scan-esp32.sh --ports 80,1883       # custom ports for --deep
#
# Requires: nmap.

set -euo pipefail

# ── colors ──
if [[ -t 1 ]]; then
  C_RESET=$'\033[0m'; C_DIM=$'\033[2m'; C_BOLD=$'\033[1m'
  C_GREEN=$'\033[32m'; C_YELLOW=$'\033[33m'; C_BLUE=$'\033[34m'
  C_RED=$'\033[31m';   C_GRAY=$'\033[90m'
else
  C_RESET=; C_DIM=; C_BOLD=; C_GREEN=; C_YELLOW=; C_BLUE=; C_RED=; C_GRAY=
fi

# ── args ──
SUBNET=""
DEEP=0
JSON=0
PORTS="80,81,8080,8266,1883,3232,8883"

while [[ $# -gt 0 ]]; do
  case "$1" in
    -d|--deep)  DEEP=1; shift ;;
    -j|--json)  JSON=1; shift ;;
    -p|--ports) PORTS="$2"; shift 2 ;;
    -h|--help)
      sed -n '2,16p' "$0" | sed 's/^# \{0,1\}//'
      exit 0
      ;;
    *) SUBNET="$1"; shift ;;
  esac
done

# ── deps ──
if ! command -v nmap >/dev/null 2>&1; then
  echo "${C_RED}error:${C_RESET} nmap not found. Install with: brew install nmap" >&2
  exit 1
fi

# ── auto-detect subnet ──
if [[ -z "$SUBNET" ]]; then
  IFACE=$(route -n get default 2>/dev/null | awk '/interface:/ {print $2}')
  IFACE=${IFACE:-en0}
  IP=$(ipconfig getifaddr "$IFACE" 2>/dev/null || true)
  if [[ -z "$IP" ]]; then
    echo "${C_RED}error:${C_RESET} could not detect local IP on $IFACE" >&2
    echo "${C_DIM}tip: pass the subnet explicitly, e.g. ./scan-esp32.sh 192.168.1.0/24${C_RESET}" >&2
    exit 1
  fi
  SUBNET="${IP%.*}.0/24"
fi

# ── espressif MAC OUIs (representative; vendor lookup is fallback) ──
ESP_OUIS=(
  "24:0a:c4" "24:6f:28" "30:ae:a4" "3c:71:bf" "4c:11:ae"
  "7c:9e:bd" "84:0d:8e" "84:f3:eb" "8c:aa:b5" "a0:b7:65"
  "a4:cf:12" "b4:e6:2d" "bc:dd:c2" "c4:4f:33" "c4:dd:57"
  "cc:50:e3" "d8:a0:1d" "dc:4f:22" "e0:98:06" "ec:64:c9"
  "f0:08:d1" "f4:cf:a2" "fc:f5:c4" "08:3a:f2" "08:b6:1f"
  "10:97:bd" "18:fe:34" "2c:f4:32" "34:85:18" "34:94:54"
  "34:ab:95" "3c:61:05" "3c:6a:2c" "40:91:51" "44:17:93"
  "48:55:19" "48:e7:29" "4c:eb:d6" "54:43:b2" "5c:cf:7f"
  "60:01:94" "68:67:25" "68:c6:3a" "70:03:9f" "70:b8:f6"
  "80:64:6f" "80:7d:3a" "84:cc:a8" "8c:4b:14" "94:b9:7e"
  "94:b5:55" "9c:9c:1f" "a0:dd:6c" "a4:e5:7c" "ac:67:b2"
  "b8:d6:1a" "c8:2b:96" "c8:c9:a3" "cc:db:a7" "d4:8a:fc"
  "d4:d4:da" "dc:54:75" "e4:65:b8" "e8:31:cd" "e8:9f:6d"
)
OUI_REGEX=$(IFS='|'; echo "${ESP_OUIS[*]}")

# ── intro ──
if [[ $JSON -eq 0 ]]; then
  echo
  echo "${C_BOLD}── ESP32 scan ──${C_RESET}"
  echo "${C_DIM}subnet: ${C_RESET}${SUBNET}"
  echo
  echo "${C_DIM}1/2 sweeping network (this populates the ARP cache)...${C_RESET}"
fi

# ── ping sweep — fills the kernel's ARP cache, no sudo needed for ICMP/TCP probes ──
nmap -sn -n -T4 "$SUBNET" >/dev/null 2>&1 || true

# ── parse ARP cache for ESP-matching MACs ──
# macOS arp -a format:  hostname (IP) at MAC on iface ifscope [ethernet]
ESP_HOSTS=()
while IFS= read -r line; do
  [[ -z "$line" ]] && continue
  ip=$(echo "$line" | sed -nE 's/.*\(([0-9.]+)\).*/\1/p')
  mac=$(echo "$line" | sed -nE 's/.*at ([0-9a-fA-F:]+) on.*/\1/p')
  [[ -z "$ip" || -z "$mac" || "$mac" == "(incomplete)" ]] && continue

  # normalize MAC: zero-pad each octet to 2 chars, lowercase. Works in BSD awk.
  mac_norm=$(echo "$mac" | tr '[:upper:]' '[:lower:]' | awk -F: '{
    for(i=1;i<=NF;i++) printf "%s%s%s", (i>1?":":""), (length($i)<2?"0":""), $i
  }')
  if [[ "$mac_norm" =~ ^($OUI_REGEX) ]]; then
    ESP_HOSTS+=("$ip|$mac_norm")
  fi
done < <(arp -a -n 2>/dev/null)

# ── output ──
if [[ ${#ESP_HOSTS[@]} -eq 0 ]]; then
  if [[ $JSON -eq 1 ]]; then
    echo "[]"
  else
    echo
    echo "${C_YELLOW}No ESP32 devices found in ${SUBNET}${C_RESET}"
    echo "${C_DIM}tips:${C_RESET}"
    echo "${C_DIM}  · verify your subnet (ipconfig getifaddr en0)${C_RESET}"
    echo "${C_DIM}  · ESP may be in deep-sleep — wake it first${C_RESET}"
    echo "${C_DIM}  · view full ARP cache with: arp -a${C_RESET}"
  fi
  exit 0
fi

if [[ $JSON -eq 1 ]]; then
  echo "["
  i=0; n=${#ESP_HOSTS[@]}
  for entry in "${ESP_HOSTS[@]}"; do
    IFS='|' read -r ip mac <<< "$entry"
    sep=","; (( ++i == n )) && sep=""
    printf '  {"ip":"%s","mac":"%s"}%s\n' "$ip" "$mac" "$sep"
  done
  echo "]"
  exit 0
fi

echo
echo "${C_GREEN}${C_BOLD}Found ${#ESP_HOSTS[@]} ESP32 device(s):${C_RESET}"
echo
printf "  %s%-17s %s%s\n" "$C_BOLD" "IP" "MAC" "$C_RESET"
printf "  %s%-17s %s%s\n" "$C_GRAY" "─────────────" "─────────────────" "$C_RESET"
for entry in "${ESP_HOSTS[@]}"; do
  IFS='|' read -r ip mac <<< "$entry"
  printf "  ${C_BLUE}%-17s${C_RESET} ${C_DIM}%s${C_RESET}\n" "$ip" "$mac"
done

# ── deep scan ──
if [[ $DEEP -eq 1 ]]; then
  echo
  echo "${C_DIM}2/2 port-scanning each device on ${PORTS}...${C_RESET}"
  for entry in "${ESP_HOSTS[@]}"; do
    IFS='|' read -r ip mac <<< "$entry"
    echo
    echo "${C_BOLD}── $ip${C_RESET} ${C_DIM}($mac)${C_RESET}"
    nmap -p "$PORTS" --open -sV -T4 "$ip" 2>/dev/null \
      | sed -n '/^PORT/,$p' \
      | sed '/^Service detection/,$d' \
      | sed '/^Nmap done/,$d' \
      | sed 's/^/  /'
  done
fi

echo
