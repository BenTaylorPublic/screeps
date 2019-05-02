# My screeps AI
![](https://screeps.com/img/logotype.svg)

## Setup
Run `npm install` to get packages

Run `npm start` to compile

Push to master to release

## TODO
### Working on
```
Empire controller
    Move claimer role into that
    Call it before rooms
    Pass it myMemory.empire AND myMemory.myRooms
    It will assign commands/state to MyRoom object

Zerg Attack logic
    live-zergwithheals-rally flag
    live-zergwithheals-charge flag
    Using empire logic, conscript rooms into providing zergling + healer
    Wait till all conscripted rooms are ready to spawn
    Rooms should only be conscripted within a range of X to the room (3?)
```
### Short term
```
Hauler changes:
    Haulers should put energy into extensions/spawn if there's no energy in it's cache

Room stages 5.9 to 6:
    3 Labs
    
Mining minerals and directly selling them
```

### Long term:
```
Marketing logic (will be at empire level):
    Price history
    Buy/sell logic
    Spawning marketers (to haul to/from storage)
    Marketer role
    
Lab logic:
    Spawning lab assistants (to haul to/from storage)
    LabAssistant role
    Lab logic of what to request/combine/buff
    
Spawn a new miner before the old one dies, so no downtime.
    To do this, have a nextMinerName on a MySource, swap it over when minerName is null
    When the miner arrives at the cache pos, have a key called minerTravelTime (in ticks).
    Set it every time.
    In the spawning logic, just check if the tickstolive of the miner is <= minerTravelTime.
    Problem is they'll just get later and later unless it measures it to 1 move AWAY from the cachePos...

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

### Body parts in a nice format:
```
MOVE	        50	
Decreases fatigue by 2 points per tick.

WORK	        100	
2 energy from source per tick
1 mineral from deposit per tick
Builds structure 5 energy per tick
Repairs structure 100 hits per tick, using 1 energy per tick
Dismantles structure 50 hits per tick, giving 0.25 energy per tick
Upgrades controller 1 energy per tick

CARRY	        50	
50 resource space

ATTACK	        80	
30 hits per tick

RANGED_ATTACK	150	
1-4-10 hits per tick, up to 3 squares away
Not sure if closer or further does more damage

HEAL	        250	
Restores 12 hits per tick
4 hits per tick at distance

CLAIM	        600	
Reserves 1 tick on unclaimed controller
Downgrades timer 300 ticks on hostile controller
Removes 1 tick on unclaimed controller

TOUGH	        10
No affect, just for hit points
```
