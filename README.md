# My screeps AI
![](https://screeps.com/img/logotype.svg)

## Setup
Run `npm install` to get packages

Run `npm start` to compile

Push to master to release

## TODO
### Short term
```
Marketing logic (will be at empire level):
    Price history
    Buy/sell logic
    Spawning marketers (to haul to/from storage)
    Marketer role
Hauler changes:
    Haulers should put energy into extensions/spawn if there's no energy in it's cache
Lab logic:
    Spawning lab assistants (to haul to/from storage)
    LabAssistant role
    Lab logic of what to request/combine/buff
Room stages 5.3 to 6:
    Terminal
    Extractor
    3 Labs
Room stages 6 to 7:
    RCL
    Tower
    10 Extensions
    3 Labs
    Link
    Spawn
Room stages 7 to 8:
    RCL
    3 Towers
    10 Extensions
    6 Labs
    Spawn
    Observer
    Power Spawn
Hauling between rooms (Energy, and minerals), when starting room is RoomStage 8 (maybe 7?)
```

### Long term:
```
Spawn a new miner before the old one dies, so no downtime.
to do this, have a nextMinerName on a MySource, swap it over when minerName is null
When the miner arrives at the cache pos, have a key called minerTravelTime (in ticks).
Set it every time.
In the spawning logic, just check if the tickstolive of the miner is <= minerTravelTime.
Problem is they'll just get later and later unless it measures it to 1 move AWAY from the cachePos...
```
