# My screeps AI
![](https://screeps.com/img/logotype.svg)
 
## Setup
Run `npm install` to get packages

Run `npm start` to compile

Push to master to release

## TODO
### Working on
```
Reporting via flag "report"
    Should have
        Room name
        Time stamp
        Days/Hours/minutes since then
        Message Type (Attention, Stages, Defense)
        Message
```
### Short term
```
Zerg Attack logic
    live-zergwithheals-rally flag
    live-zergwithheals-charge flag
    Using empire logic, conscript rooms into providing zergling + healer
    Wait till all conscripted rooms are ready to spawn
    Rooms should only be conscripted within a range of X to the room (3?)

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
    4 Labs
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

## Flag Names
```
ex-1 to 60
cont
tower-1 to 6
storage
link-source
link-out
link-bank
spawn
```

## Stage Progression
```
RCL LEVELS:
Lvl Req         Other                   Towers  Links   Spawns  Extensions  Ramparts Labs
1   200	        Roads, 5 Containers                     1
2   45,000      Walls                                           5 50 cap    300K
3   135,000                             1                       10 50 cap   1M
4   405,000     Storage                                         20 50 cap   3M
5   1,215,000	                        2       2               30 50 cap   10M
6   3,645,000	Extractor, Terminal             3               40 50 cap   30M     3
7   10,935,000	                        3       4       2       50 100 cap  100M    6
8   -	        Observer, Power Spawn   6       6       3       60 200 cap  300M    10

Loosely based on RCL
-1 is default room level

-1  ->  0   : Get a room controller that's mine
-1  <-  0   : Have no room controller that's mine

0   ->  0.5 : RCL is level >= 1
0   <-  0.5 : RCL is level < 1

0.5 ->  1   : Room has >= 1 spawn
0.5 <-  1   : Room has < 1 spawns

1   ->  1.3 : RCL is level >= 2
1   <-  1.3 : RCL is level < 2

1.3 ->  1.6 : Room has >= 5 extensions
1.3 <-  1.6 : Room has < 5 extensions

1.6 ->  2   : Room has caches length >= source amount
1.6 <-  2   : Room has caches length < source amount

2   ->  2.3 : RCL is level >= 3
2   <-  2.3 : RCL is level < 3

2.3 ->  2.6 : Room has >= 1 tower
2.3 <-  2.6 : Room has < 1 tower

2.6 ->  3   : Room has >= 10 extensions
2.6 <-  3   : Room has < 10 extensions

3   ->  3.3 : RCL is level >= 4
3   <-  3.3 : RCL is level < 4

3.3 ->  3.6 : Room has >= 20 extensions
3.3 <-  3.6 : Room has < 20 extensions

3.6 ->  4   : Room has a storage bank
3.6 <-  4   : Room does not have a storage bank

4   ->  4.2 : RCL is level >= 5
4   <-  4.2 : RCL is level < 5

4.2 ->  4.4 : Room has >= 2 tower
4.2 <-  4.4 : Room has < 2 tower

4.4 ->  4.6 : Room has >= 30 extensions
4.4 <-  4.6 : Room has < 30 extensions

4.6 ->  4.8 : Room has 2 links
4.6 <-  4.8 : Room has < 2 links

4.8 ->  5   : Room has 1 sources using links, no cache or hauler
4.8 <-  5   : Room has 0 sources using links, no cache or hauler

5   ->  5.2 : RCL is level >= 6
5   <-  5.2 : RCL is level < 6

5.2 ->  5.4 : Room has 3 links
5.2 <-  5.4 : Room has < 3 links

5.4 ->  5.6 : Room has >= 40 extensions
5.4 <-  5.6 : Room has < 40 extensions

5.6 ->  5.8 : Room has extractor
5.6 <-  5.8 : Room has no extractor

5.8 ->  5.9 : Room has extractor
5.8 <-  5.9 : Room has no extractor

5.9 ->  6   : Room has >= 3 labs
5.9 <-  6   : Room has < 3 labs
```
