```mermaid
stateDiagram-v2
    state Connectivity <<choice>>
    [*] --> Starting
    Starting --> Restoring
    Restoring --> Connectivity
    Connectivity --> Offline
    Connectivity --> Online : navigator.onLine
    Offline --> Online : navigator.onLine
    Online --> Offline
    state Online {
        [*] --> Connecting
        Connecting --> Sync
        Sync --> Connecting : Reconnect
        state Sync {
            [*] --> Syncing
            Syncing --> Synced : Access chain
            Synced --> Syncing : Receive new head
        }
    }
```

Also:
* accounts can be present or not
* polkassembly data are accessed on the flow
* auto-reconnect if first API connection fails or then stalls / is too slow